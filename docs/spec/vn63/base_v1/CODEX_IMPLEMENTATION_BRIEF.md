# CODEX IMPLEMENTATION BRIEF — VN63 LIFE SIMULATOR

**Priority:** triển khai sản phẩm mới theo GDD 1.0, không deploy vào một repo không liên quan. **Nếu được chạy trong repo hiện có:** đọc README, package, code, test, branch và xác định kiến trúc trước; không xóa hay ghi đè dự án khác. **Không được tự tuyên bố đã push hoặc deploy** khi chưa có kết quả công cụ xác nhận.

## 0. Deliverables & acceptance

Kết quả mong muốn: Web app Next.js + TypeScript chạy local, triển khai Vercel khi đã được cấp repo/quyền, có hai mode REALISM/HARDSHIP; 63 tỉnh trong danh mục lịch sử 2024; simulation engine seeded/deterministic; lựa chọn và hậu quả qua tháng/năm; tài chính & nợ có ledger; NPC quan hệ; sự kiện thất nghiệp/lừa đảo/gia đình/health; save & replay; headless simulator & QA.

Không được trình bày data demo là dữ liệu thực. Data pack `demo` phải có badge DEMO ở toàn bộ UI, mặc định không gọi REALISM đã hiệu chỉnh. Nếu chưa có dữ liệu đủ: giao diện REALISM gắn `PROVISIONAL MODEL`, có chú thích ở trang trước khi chơi và cuối đời.

## 1. Stack & directory

- Next.js (App Router), React, TypeScript `strict: true`, Tailwind, Zod, Zustand **hoặc** React reducer (chỉ chọn một nguồn state chuẩn); Vitest, Playwright, fast-check (nếu khả dụng), IndexedDB wrapper (`idb`).
- Simulation core pure TS: không import React, Next, browser globals, Date.now, Math.random, network, localStorage. UI chỉ gửi `command` và nhận `viewModel`/snapshot.
- Không gọi dịch vụ LLM trong game loop. Thư viện dữ liệu/event local static; có khả năng lazy load.

```text
src/
  app/                         # /, /play/[id], /memories, /methodology
  components/                  # Setup, BirthCard, LifeHUD, Decision, Timeline, Money, Family, End
  engine/
    types.ts                   # GameState, LifeState, WorldState, NPC, Outcome, Effects
    rng.ts                     # deterministic keyed streams
    init.ts                    # selectProvince, initHousehold, spawnLife
    tick.ts                    # advanceOneMonth
    economy.ts                 # double-entry-friendly money ledger
    debt.ts                    # accrueInterest, repay, delinquency
    people.ts                  # NPC updates & relationships
    health.ts                  # age-specific hazard, gate content
    labor.ts                   # employability & jobs
    risk.ts                    # evaluate competing risks/eligibility
    events.ts                  # filter, weight, pick, resolve, schedule
    effects.ts                 # typed safe reducer; no eval
    save.ts                    # serialize/migrations
    summary.ts                 # death, end-of-life report
  content/
    provinces.2024.json
    data-catalog.json
    balancing.json
    events/*.json
  data/
    loader.ts                  # data provenance + fallback
    validators.ts
  tests/
    unit/ property/ integration/ e2e/ simulation/
scripts/
  simulate.ts                 # 100k lives, CLI
  validate-content.ts
  validate-data.ts
  balance-report.ts
```

## 2. GameState & event contracts

**Top-level schema:**

```ts
type Mode = 'REALISM' | 'HARDSHIP';
type DataQuality = 'OFFICIAL' | 'DERIVED' | 'ESTIMATED' | 'ASSUMPTION' | 'MISSING';
type LifePhase = 'ALIVE' | 'DECEASED';

type GameState = {
  meta: {
    lifeId: string; seed: string; engineVersion: string;
    eventPackVersion: string; datasetVersion: string;
    mode: Mode; modeProfileVersion: string;
    taxonomy: 'VN_63_2024'; worldScenario: 'REFERENCE_2024_FORWARD_SCENARIO';
    monthIndex: number; worldYear: number; phase: LifePhase;
    sensitiveContent: Record<string, boolean>;
  };
  person: Person;
  household: Household;
  npcs: Record<string, NPC>;
  relationships: RelationshipEdge[];
  finances: FinanceState;
  employment: EmploymentState;
  health: HealthState;
  memory: MemoryRecord[];
  activeArcs: Record<string, ArcState>;
  scheduledEffects: ScheduledEffect[];
  ledger: LedgerEntry[];
  pendingChoice?: PendingDecision;
  audit: {
    rngDraws: RNGRecord[]; appliedEffectIds: string[];
    warnings: string[]; provenanceIds: string[];
  };
};
```

**Critical distinction:** `Person` has `birthProvinceId` (immutable), `residenceProvinceId` (mutable); family household income ≠ salary; money stored **integer VND** (and guarded against unsafe JS numbers; consider `bigint` with string serialization or explicit integer-safe max) and never float display-cents.

**Event DSL (Zod schema recommended):**

```ts
type Predicate =
  | { op: 'all'; terms: Predicate[] }
  | { op: 'any'; terms: Predicate[] }
  | { op: 'not'; term: Predicate }
  | { op: 'compare'; path: SafeFieldPath; cmp: 'eq'|'ne'|'gt'|'gte'|'lt'|'lte'; value: string|number|boolean }
  | { op: 'hasTag'; tag: string }
  | { op: 'activeArc'; arcId: string };

type Effect =
  | { op: 'ledgerTransfer'; accountFrom: string; accountTo: string; amountVnd: number; reason: string }
  | { op: 'modifyStat'; stat: AllowedStat; delta: number; clamp: [number,number] }
  | { op: 'addDebt'; debtRef: string; principalVnd: number; aprNominal: number; repaymentModel: string }
  | { op: 'setFlag'; key: string; value: boolean }
  | { op: 'beginArc'; arcId: string; payload: Record<string,unknown> }
  | { op: 'schedule'; effect: ScheduledEffect }
  | { op: 'updateRelationship'; npcId: string; field: string; delta: number }
  | { op: 'changeJob'; jobCode: string|null; monthlyIncomeVnd: number }
  | { op: 'moveProvince'; provinceId: string };
```

`SafeFieldPath`, `AllowedStat`, `accountFrom`/`To`, `field` **whitelist** in validator; no arbitrary dynamic property path or eval. Schema `version` for migration; stable ID. Event has `knowledgeAtDecision`; the scam's hidden flags stay only in engine state, not returned in `DecisionViewModel`.

**Representative event JSON:** xem `examples/events.sample.json` để thấy 4 event chain events tương tác và `dataQuality: ASSUMPTION`. These are illustrative content fixtures, not epidemiological rates.

## 3. Deterministic RNG design

Do not call `Math.random()` anywhere inside engine. Use `seed + streamKey + stableSequence` e.g. 32-bit xoshiro or PCG with well-defined integer operations, plus stable hash for keyed streams. Store engine version/seed/event pack version in save.

Stream namespaces: `birth.province`, `birth.household`, `risk.health.{month}`, `risk.work.{month}`, `risk.scam.{month}`, `npc.{npcId}.{month}`, `choice.{eventId}.{instanceId}`. Stream independence means inserting a new flavor event doesn't silently alter the person's previously computed lifespan or financial outcomes via RNG consumption order.

Rule: same `(seed, version, data, choices)` always gives the same complete event/ledger log on same engine version. `save → load → continue` must equal uninterrupted. No Date.now-based IDs; use deterministic counters/UUID generated from seed.

## 4. Sampling, probabilities, hazards

### 4.1 Province sampling
`P(p | births, year) = births[p,year] / Σ births[*,year]`.

For `population` selection: `P(p)=residentPopulation[p,year]/Σ residentPopulation`.

If birth counts unavailable, fallback can be **explicitly** `birthRate[p] * population[p]` only if year/unit comparable, quality `DERIVED`. If also missing, use region/national hierarchical model with `ESTIMATED` provenance, **never** fill with silent equal weights.

### 4.2 Hazard conversion
If source gives annual probability `q_annual` conditional on surviving to the beginning of the year, approximate month hazard with `p_month = 1 - (1 - q_annual)^(1/12)` for constant within-year hazard, recalculating at birthdays where source transitions age. If multiple risks are modeled as cause-specific hazards, use competing-risk formalism to avoid double counting. Do not independently sample `all-cause mortality` AND causes that are already inside it.

### 4.3 Events per month
- Compute eligible event list from state + cooldown + conflict tags + season + region + role + calendar.
- Get arrival intensities for compatible categories, `p_any = 1 - exp(-Σ λ_i Δt)`; sample event identity conditional on arrival by `λ_i/Σλ`. For story events with no calibrated λ, use authored bounded weight/cadence and tag `ASSUMPTION`.
- A monthly cap (for readability only) applies to **interactive** events. Non-interactive finances & ordinary life changes still occur normally.
- Hardship only modifies allowed `exposure` intensities. It must not overwrite base probabilities or data quality tags.

### 4.4 Multi-branch outcome
Each choice can trigger `immediateEffects` and weighted `outcomes`; validate outcome weights >=0 **và tổng bằng 1 trong từng nhóm điều kiện `whenHidden`** (tolerance 1e-6), and `outcome` may schedule long-term effects. Complex multi-stage scam samples `hiddenModel.identity` **một lần khi offer sinh ra**, rồi chọn outcome khớp identity; các lời cảnh báo khi xác minh có nhiễu/độ nhạy riêng. Choices tuyệt đối không lộ truth. For options lacking `whenHidden`, use the universal outcome group.

## 5. Tick exact order (single source of truth)

```text
advanceMonth(state, input):
  assert state.phase === ALIVE && state.pendingChoice == null
  01. advance world clock / update externally specified price index
  02. resolve due scheduled effects once (stable priority/order)
  03. update NPC life stages, work, wellbeing, known contacts
  04. process employment changes that are already triggered
  05. post incomes and transfers with ledger entries
  06. calculate necessary household & individual spending
  07. accrue scheduled debt interest and collect payable amounts
  08. handle insufficient funds (arrears/assistance/reschedule; never magic cash)
  09. recalculate stats and statuses, age eligibility
  10. draw new risk/event arrivals; set pending decision if necessary
  11. evaluate remaining life mortality hazard according to calibrated rules
  12. append immutable log entry, checksum state, persist snapshot boundary
  return state
```

**Ordering note:** If an interactive decision arises before mortality sampling, simulation must pause and not advance further until choice; if mortality occurs first in chosen engine architecture, document/reconcile. The complete tick should be atomic with `pendingChoice` states and replay tests; do not run step 11 twice after resume.

## 6. Balancing profile (starter fixture; deliberately not real)

```json
{
  "REALISM": {
    "economicShockExposureMultiplier": 1.0,
    "scamOfferExposureMultiplier": 1.0,
    "relationshipConflictExposureMultiplier": 1.0,
    "decisionDensityMultiplier": 1.0,
    "positiveSafetyNetFactor": 1.0
  },
  "HARDSHIP": {
    "economicShockExposureMultiplier": 1.35,
    "scamOfferExposureMultiplier": 1.25,
    "relationshipConflictExposureMultiplier": 1.20,
    "decisionDensityMultiplier": 1.30,
    "positiveSafetyNetFactor": 0.85
  },
  "sensitiveHazardsMustRemainIdentical": ["allCauseMortality", "childMortality", "selfHarm", "sexualViolence"]
}
```

DO NOT treat REALISM multipliers of 1.0 as proving baseline exposure values are evidence-based. If source rates missing, UI labels model as `ASSUMPTION`, not officially calibrated.

## 7. Data pipeline

`source import → normalize geographies (VN_63_2024) → validate units/years → map to typed indicator → missingness report → explicit fallback hierarchy → source register and license review → publish versioned dataset JSON`.

- Use real source URL and `sourceTitle` for each numeric row, never a generic link at workbook-level only.
- Every numeric feature has `validFrom/validTo` or `referenceYear`, not just `sourcePublishedYear`.
- For sample-based data, preserve `sampleSize` and uncertainty/methodology if known. A provincial estimate drawn from a survey is not always a census fact.
- In data pack, missing values remain `null`; fallback only when in engine/loader, with recorded method and quality.
- Build CLI validation to fail on missing mandatory fields (e.g. administrative manifest) and warn on optional missing indicators; fail if bogus placeholder numbers sneak into production.
- `province_63_2024.json` is a **name manifest**, not a sourced economic dataset. Slugs inside are internal IDs, not codes of government administrative units.

## 8. Finance/credit semantics

- Start with `openingBalances`, all changes through ledger `debit`/`credit` or centralized balanced cash-flow postings; no writes directly to `cashVnd` elsewhere.
- For household and person-owned balances, distinguish owner; transfers between them are double recorded and not counted as national income.
- Insufficient funds handling: attempt approved liquid savings, allow choice if event demands, then arrears/credit **only** if realistic, otherwise nonpayment consequences.
- Salary net: explicit gross→net model via versioned rules (can initially use clearly labeled fictional sandbox rates). Do not hardcode 2026 social insurance/unemployment benefits if no verified dataset and law module.
- Interest nominal annual → monthly compounding basis explicit, APR not mixed with monthly percent. Unit/property tests guard no negative principal and no double interest.
- Some NPC support in cash or housing must debit their resources or mark it as an abstract support budget; no unlimited bailout.

## 9. NPC & relationship update

- Stable NPC IDs and single relationship graph; never spawn divorced spouse out of nowhere. Family tree validators prevent paradoxical parent/child ages.
- Life cycle: relationship status updates through choices/reciprocity/externals, skill/opportunity effects have bounded influence; have NPC utility/preferences.
- Offscreen events only update NPCs relevant to the player or sample from coherent local simulation; cost bounded for browser.
- Player's choice is never the sole agency. NPCs may disagree, refuse loan, ask for help or migrate.

## 10. Handling scam decisions safely

- `ScamOffer` models message plausibility and information asymmetry; **do not write executable fraud playbooks**. Never store or expose bank details, fake payment links, realistic spoof domains or step-by-step credential theft flows.
- Player may (1) verify, (2) consult contacts, (3) accept, (4) decline; offer may be legitimate. Verifying is not a 100% success shield and takes time/effort.
- `isFraud` sampled/established privately; outcomes resolved after decision from engine, UI learns only discovery based on in-world evidence.
- On `SCAM_LOSS`, future arcs for payment obligations, reporting, self-care, relationships and budget recovery; not an automatic irreversible game over.
- If event uses real agency/organization names, legal review before launch; default generic fiction.

## 11. MVP UI requirements

- Setup: mode label with explanation; 63-province historical note; born-year scenario 2024; safe-content switches; birth weighting; start.
- Birth card: province, urban/rural, household form, source summary; clearly identifies dataset DEMO when applicable.
- Life: main event text and choices center; persistent age, money, household, job, health, wellbeing + timeline. On mobile collapse secondary panels. Controls pause, speed, auto, next event.
- Tabs: Finance ledger + debts; Household/NPC; Memory chain; Residence map (pin map optional on MVP, timeline of migrations mandatory).
- End: lifespan and arc-based memorial; no official-looking social class “score”; export/share as user opt-in.
- UI style: Vietnamese fonts, calm editorial visuals, rich typography; no copy of 1in8b UI.

## 12. Specific tasks Codex must perform in order

**Milestone M0 — Inspect & decide:** detect repo status / framework and branch, write technical plan in `docs/IMPLEMENTATION_PLAN.md`; preserve existing work. If blank repo, scaffold Next.js.

**M1 — Pure engine skeleton:** implement types, RNG, data loaders, validator, province manifest, seeded birth and initial household; include unit tests.

**M2 — Economy & life loop:** monthly tick, debt ledger, salary/budget, job status, basic health/mortality placeholder **labeled synthetic**; `advanceUntilChoice` with bounded iteration; test save/load.

**M3 — DSL & NPCs:** eligibility, event scheduling, arc memory, stable NPC, 4 long chains (job loss, debt, legitimate job offer vs recruitment scam, family illness); generate content via JSON and validation.

**M4 — UI vertical slice:** setup, birth, life, 3 tabs, choice view, end, responsive; two modes, provenance badges, content filters. Manual interaction tests on desktop/mobile.

**M5 — Calibration & all provinces:** import **licensed**/official province-level datasets if accessible, maintain audit of missingness, calibrate where possible, implement fallback with displayed quality tiers. No filling 'realistic sounding' values.

**M6 — Quality:** 100k Monte Carlo, ledger invariants, replay parity, conditional event tests, screen reader/keyboard access, content review, performance.

**M7 — Deploy:** build, tests, deploy to authorized GitHub/Vercel only after configured; report URL, commit SHA, known limitations, content/data status. Never assume deployment succeeded without returned status.

## 13. Tests / Definition of Done

**Unit:** seed reproducibility, province weighted choice, monthly compounding, debt schedule, income-expense conservation, NPC graph, event eligibility, moderation filters, idempotent effects.

**Property:** all financial ledger entries balanced; no age reversal; no negative person count; probabilities bounded; no future event before trigger; birth province fixed; no zombie NPCs; event schedule persists save/load.

**Integration:** `start → birth → yearly life → unemployment → job hunt → scam offer → decision → consequences → debt recovery → death → obituary`, both modes. Replay with same seed and same choices must have matching hashes.

**E2E:** user can play 10–15 sampled lives, pause/resume, speed change, inspect finance, toggle reduced content before start, export/import save, replay. UI readable at 360px viewport.

**Monte Carlo:** at least 100,000 seeded runs; report distributions separated by `mode`, `engineVersion`, `datasetVersion`, and `scenario`. Flag differences from calibrated targets with uncertainty bands; separate uncali­brated variables explicitly.

**CI gates:** `npm run lint`, `npm run typecheck`, `npm test`, `npm run validate:content`, `npm run validate:data`, `npm run build`; run large simulation in scheduled/explicit CI or local offline job if expensive.

**Hard blockers:** hidden scam flag exposed; money appears/disappears unaccounted; untraceable data labeled official; death double-counted; same seed non-deterministic; events reference characters not in state; same delayed effect applied twice; frontend labels HARDSHIP as census-like statistics.

## 14. What to report back

1. Changes by file and subsystem, with rationale.
2. Commands and test outputs (pass/fail), actual sample saves and screenshots if possible.
3. Data provenance ledger: `OFFICIAL / DERIVED / ESTIMATED / ASSUMPTION / MISSING` counts.
4. Monte Carlo results with mode separated and confidence/assumptions.
5. Risks/unfinished work, known inaccuracies.
6. Repo branch/commit, Vercel link **only when actually performed**.

**Read alongside:** `GDD_VN63_V1.md`, `data/province_63_2024.json`, `examples/events.sample.json`, `data/balancing.example.json`, `qa/QA_ACCEPTANCE.md`.
