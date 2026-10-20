# CODEX IMPLEMENTATION BRIEF — v1.3 CONTEXT BRANCHING + CAUSAL STARTUPS

## Priorities & safety

Read `GDD_ADDENDUM_V1_3_DYNAMIC_BRANCHES_STARTUP.md` and v1.2/v1.1/base docs. Inspect existing repository structure, tests, data schemas and migrations before coding. **Integrate into existing application; do not create a separate product.** Preserve monthly ticks, seed determinism, 168h/week budget, double-entry-inspired ledger, two simulation modes, NPC memory, province 2024 reference. Changes are not committed/deployed until workflow/user authorization.

## Implementation phases

### Phase A: Data contracts and event eligibility

- Define `LifeContext`, `EventSpec`, `EventChoice`, `EventArc`, `EligibilityReason`, `EventHistory` in `src/simulation/events/types.ts` (paths may adapt to existing repo).
- Implement pure `isEventEligible(state, eventSpec)`, validating month/age, region, actors alive, flags, finances, contractual/legal status, prior events, cooldown, lifecycle states and resource requirements; return explainable eligibility reason for tests/debug.
- Implement seeded `selectEligibleEvent` with salience/cooldown/continuity, distinct child-age agency, no guaranteed event/month; respect user pause settings.
- Add `event-memory` and `arc-progress` in versioned save. Prevent an event repeating if its resulting state already precludes it.

### Phase B: Personality evolution

- Store six traits as continuous (not irreversible age3 choice) and support incremental monthly drift from observed habits, family, education and major events. Bound/clamp, inertial decay, diminishing returns, hard caps per month, versioned coefficient metadata. Child caregiver actions distinct from child decisions.
- No mandatory common age-3/5 choice card. Provide contextual observations and transition to adolescence with valid agency.

### Phase C: Causal business simulation

- Define `BusinessState`, monthly business ledger, inventory, accounts payable/receivable, employee commitments, owner financing and separate personal ledger.
- Add `BusinessMonthInput` (price, marketing, operating hours, inventory, staffing, capital/debt actions, pivots) and `advanceBusinessMonth` pure function. `monthlyMarket` shared per region+sector, seeded independent of UI and avatar. Persist market & business RNG namespaces and schema versions.
- Generate leads, conversions and returns from structured model dependent on product, costs, demand, competition, skill, capacity and reputation; use local seeded stochastic variation, no single `successChance` check.
- Enforce money/time feasibility, contract dates, permits/config as modeled, financing validation, obligations and late payments. Derive operating profit, cash flow, solvency and runways from accounting entries; do not overwrite balance for narrative convenience.
- Add responses to downturn: find customers, reduce costs, train, recruit, renegotiate, seek funding, pivot, exit. Choices may be unsuccessful; never guarantee performance bonuses for mere efforts.

### Phase D: Dynamic aging & social arcs

- Conditional retirement/continued work/caregiving/grandparenting/companionship based on actual NPC, finances, pension status and health. No fixed repeated senior decision tree, no assumptions every character marries/has children.
- Link long arcs to time budget and business economics. Parent illness forces feasible caregiving decisions; opportunity costs must be computed.

### Phase E: Instrumentation & QA

- Add eligibility/debug inspector and event provenance, seed replay, monthly ledger audit, business sales funnel KPIs, decision counterfactual report.
- Data files: `data/fixtures/v13_cases.json` and simulation config with all coefficients as assumptions until calibrated. Run unit/property-based tests plus deterministic cross-seed cohorts. Verify at least all acceptance criteria in v1.3 GDD; rollout in small reviewed increments.

## Key acceptance test matrix

| Test | Expected |
|---|---|
| 3y old rich urban vs 3y old rural rural caregiver | Different eligible event pools, no fixed mandatory personality menu |
| 75y widower without children vs 75y married with dependent spouse | Context-sensitive options; no imaginary spouse/grandchildren |
| Startup same seed, high vs low operational skill, all else equal | Mechanism shows change in conversion/cost; cohort distributions improve in plausible directions; neither guaranteed profit |
| Startup revenue rises but invoices unpaid | P&L may improve while cash falls; no spendable unrealized revenue |
| Startup closed after staff terminate | No active sales/payroll by default; due liabilities remain |
| Founder shifts 15 hours/week to shop | Family/health/other-time availability reduces; capacity respects owner effort |
| One shock (demand -30% illustrative) | Impacts orders, revenue, cash runway via accounting, not random game-over |
| Missed promise to spouse, then gift purchase | Gift adds temporary positive mood, cannot instantly reset relationship memory |
| MONTH step vs FAST FORWARD same state/seed/actions | Bit-for-bit equal ledger, events, state |
| REALISM vs HARDSHIP | Differences trace to documented config, never magic "startup failure" outcome |

## Report at handoff

Show changed files, tests and their results, sample 3 contrasting life stories and 3 sample business strategies under identical market seed, open limitations, and data not yet empirically calibrated. Do not claim fixed probabilities, success rates, or Vietnam business stats without verified sources.
