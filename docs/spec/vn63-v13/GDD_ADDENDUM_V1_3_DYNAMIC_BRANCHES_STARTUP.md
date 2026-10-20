# GDD ADDENDUM v1.3 — DYNAMIC LIFE BRANCHES & CAUSAL ENTREPRENEURSHIP

**Game:** Một Đời Ở Việt Nam (VN63)  
**Date:** 2026-10-20  
**Decision status:** Design proposal derived from owner feedback. Not yet implemented in a repository.  
**Document precedence:** v1.3 > v1.2 monthly > v1.1 life trade-offs > v1.0 base. Preserve 63 pre-merger provinces (2024 reference), REALISM + HARDSHIP, monthly ticks and weekly time accounting.

## Executive decisions

1. **No fixed-choice ages:** Age is an eligibility factor, not a script queue. A toddler's or older adult's choices must depend on agency, family/NPC, past actions, health, region, possessions, work, and social opportunities. Early personality *evolves*; no one-time irreversible personality lock at age 3 or 5. Retirement and late-life events are conditional, not a mandatory sequence.
2. **No one-roll startup win/loss:** Business is an operating entity that evolves monthly with revenue, costs, customer demand, competition, cash, capacity, employees, owner time, debts, obligations, shocks, and recovery opportunities. Chance affects discoveries, customer demand, weather and market shocks, never replaces operating calculations.
3. **Trade-offs are real and asymmetrical:** Actions consume money, time, energy, relationships, access and opportunities; not all options have equal expected reward. No compensating buffs to make every choice equally good. Never automatically punish wealth or reward poverty to force symmetrical outcomes.
4. **Neutral does not mean game over:** A stable life can be satisfying while wealth and career progression are slow; privilege may lower opportunity cost, and hustle does not imply success.
5. **World rules are versioned and measurable:** All illustrative tunable coefficients are marked DESIGN_ASSUMPTION, not empirical probabilities. Reality mode is calibrated against sourced data where possible. Hardship mode is separately labeled and cannot be marketed as a realistic statistical forecast.

## 1. Replace age-gated questions with context-driven events

### Event eligibility and selection

`ageRange` is optional and never sufficient alone. Required keys:

- `eventId`, `schemaVersion`, `arcId?`, `eventType`, `prerequisites`, `forbiddenFlags`, `regions?`, `occupations?`, `contextTags`, `requiredActors`, `cooldownMonths`, `maxLifetimeOccurrences`, `stakes`, `choices`, `deferredEffects`, `sourceGrade`.
- Scheduler derives `eligibleEvents` from month state and actual world context; ranks by urgency, causal continuity, consequence budget, salience, narrative diversity and months since similar event; handles identical priority with seeded random stream.
- A story event is NOT automatically spawned each month. Monthly mechanics proceed normally. Low-stakes events may be auto-resolved or journal-only; consequential irreversible decisions pause.
- Filter impossible combinations (parent deceased and talking; newborn owning assets or starting a business; character not married receiving divorce questions; abandoned store having payroll without an employee).
- `cooldownMonths` and `maxLifetimeOccurrences` prevent repeat farming; an event template may recur only if context meaningfully changes (e.g., a later new job offer).
- Strong authored **event families** (`education`, `work`, `health`, `relationship`, `finance`, `business`, `aging`, `scams`, `housing`, `migration`) and **arcs** with contextual stages, not procedural word salad. Distinct 63-province language/cost/industry conditions are overlays; avoid geographic stereotypes.
- A character's observed information and world's true hidden state may differ. Allow verification actions; do not lie in UI about a guaranteed outcome.

### Personality evolves, not hard-locks

Represent a multidimensional personality vector, not a single stereotype label: `conscientiousness`, `riskTolerance`, `adaptability`, `sociability`, `persistence`, `emotionRegulation`. All values `0..100`; none is a moral ranking or psychiatric diagnosis. Age, household, repeated habits, experience, mentors, major events and skills influence traits over months.

Illustrative update (DESIGN_ASSUMPTION):

```
trait[t+1] = clamp( trait[t]
                  + habitAdjustment(t)  // capped per month; saturating returns
                  + significantLifeEventImpact(t)
                  + agingAndContextDrift(t), 0, 100 )
```

- No single early decision changes a trait permanently; use slow-moving baselines and modest updates except genuinely important events.
- Early infancy decision authority belongs to caregiver/NPC or appears as a passive observation; roleplay as a young child only within plausible developmental capability.
- Age 3/5 milestones may be **observations** (new friend, temperament noticed), not repeated fixed menus or permanent classes.
- Traits are revisable; an introverted character can learn social skills, risk-tolerant character can learn risk management.

### Late-life state machine

Retirement is a *choice or condition*, not an age trigger. Context variables: occupation/legal minimums at simulated year, pension & savings, chronic conditions, disability/ability, caretaking load, household support, business ownership, death of partner, housing. Possible arcs: continued work, reduced hours, retirement, reopening enterprise, grandchild caregiving, eldercare access, social isolation, new companionship, volunteering, inheritance planning. Never script all choices for everyone and never guarantee marriage, descendants or home ownership.

## 2. Causal Startup Engine: monthly operations, not a startup lottery

### Startup journey

- **Pre-launch:** identify sector/market and local customer profile; choose model, scope, product/service, price, skill readiness, committed capital, license/regulatory requirements and time budget; estimate rent, cash needed and initial cash runway. Many ideas can be cancelled without going bankrupt; cancellation itself has opportunity cost.
- **Validation:** research customers, run small experiment / pre-orders if suitable; accuracy depends on information, sample quality, honesty of counterparties. Testing costs time/money. Positive results do not guarantee future demand.
- **Launch:** allocate capital to inventory/equipment, rent, staff, marketing, setup, working capital. Permits, taxes, employees and obligations depend on modeled jurisdiction/year; do not assert current law from unverified data.
- **Monthly operation:** generate market conditions by region/sector/world; generate leads; probabilistically convert customers under real constraints; deliver up to capacity; record accounting and cash; pay suppliers, labor, rent, debt, taxes when due; update satisfaction, repeat business, reputation, owner fatigue and relations.
- **Crisis and response:** demand shock, large competitor, bad supplier, scam, late customer payments, rising costs, illness of founder. Allow cost cuts, negotiation, short-term support, pivot, partner, responsible financing, pause, closing, bankruptcy where legally appropriate.
- **Outcomes:** positive cash flow, founder wage, rising business value, slow/stable operation, downsizing, insolvency, voluntary exit, sale, closure, pivot. No fixed success at N months.

### Business domain model

```ts
interface BusinessState {
  id: string;
  ownerId: string;
  sectorId: string;
  province2024Id: string;
  openedMonth: string;
  status: 'IDEA'|'VALIDATING'|'ACTIVE'|'PAUSED'|'RESTRUCTURING'|'CLOSED';
  strategy: { targetCustomers: string; priceVnd: string; marketingBudgetVnd: string; ownerHoursPerWeek: number; productQuality: number; }; // validate price, real money values
  bankCashVnd: string; inventoryCostVnd: string; receivablesVnd: string; payablesVnd: string;
  debtVnd: string; dueBills: Array<{id:string;dueDate:string;amountVnd:string;kind:string}>;
  employees: Array<{id:string;wageVnd:string;hoursPerWeek:number}>;
  fixedMonthlyCostsVnd: string;
  perSaleVariableCostVnd: string;
  maxSalesCapacity: number;
  demandSignals: { reachableLeads: number; awareness: number; conversion: number; repeatDemand: number; seasonality: number; };
  goodwill: number; satisfaction: number; competition: number;
  founderSkill: { operations:number; sales:number; finance:number; domain:number; };
  eventMemory: string[];
}
```

Money uses integer VND / string-safe serialization and an auditable *double-entry-inspired* ledger. Model business books separate from personal books; owner transfers / salary / dividends are explicit. Asset value is NOT personal spendable cash; receivables are NOT cash until collected.

### Example monthly math (simplified; not an empirical forecast)

```
leads = f(location, reachableMarket, product, price, marketing, awareness, competition, macro)
orders = min(capacity, seeded_customer_conversion(leads, conversionRate, retention))
recognizedRevenue = deliveredOrders * unitPrice - returns/refunds
variableCost = deliveredOrders * perOrderVariableCost
operatingContribution = recognizedRevenue - variableCost
operatingProfitBeforeOtherItems = operatingContribution - fixedCosts - wages - marketing
closingCash = openingCash + actualReceipts + financingCashIn - actualPayments - ownerWithdrawals
```

- Transaction dates and invoice collection terms govern cash separately from P&L; inventory purchases/cost of goods must not be deducted twice.
- Owner hours displace family time, study, recovery, and other employment. Owner cannot serve 200 clients/month if staffing and time allow only 30.
- Skills improve conversion, costs, management resilience within diminishing returns; they cannot negate market disappearance, illness or broader shocks.
- Randomness is seeded and localized: number of prospects/conversions, market shocks, supplier quality, unforeseen events. Do **not** randomly pick business success/failure directly once every month.
- Loans are not magic: qualification, interest, collateral, covenants and default consequences are tracked; scams have separate hidden-truth/verification mechanics.
- When cash is insufficient, provide actual choices (defer a permitted bill, negotiate, loan if approved, sell inventory/assets, personally fund, pivot, close). Do not silently invent revenue, hide debt or confiscate funds.

### Economics example for an illustrative shop

- Fixed cost (excluding wages/taxes/interest in this toy example) = 12,000,000 VND per month.
- Contribution margin = 35% of revenue after variable cost.
- Break-even monthly revenue for that simplified operation = 12,000,000 / 0.35 ≈ 34,285,714 VND.
- Revenue of 25m => operating loss approx 3.25m; 45m => profit approx 3.75m *before excluded categories*.
- Larger savings buy time to experiment; they do not guarantee demand. Better market validation can reduce costly uncertainty but never erase it.

### Distinguish skill, effort, chance and privilege

Evaluate gameplay via causal counterfactuals holding seed/market conditions fixed. A founder with a researched location, sufficient reserves, validated demand, pricing and solid cost control should **usually** have a measurably stronger *business survival and positive cash flow distribution* than a founder with no validation, excessive rent and short runway, ceteris paribus. But edge-case reversals remain possible.

No single global `startupSuccessProbability` roll. Avoid hard-coded `hardshipFailureMultiplier`; HARDSHIP affects documented cost, cash buffer and shock parameters while preserving the same accounting and causal system. Note that high-skill founders must not always win, nor unlucky founders be unable to recover.

## 3. How asymmetric trade-offs drive business arcs

- Risk taking *can* create wealth; a low-risk stable life may remain modest financially, not necessarily unhappy. Decisions consume scarce resources; opportunities may depend on background.
- Constrain work/study/family/health within 168h/week and actual month length. Unpaid entrepreneurial time may *lower* family cash flow despite high effort. Repeated overwork accumulates fatigue, changing customer service, execution quality, health, partner confidence and parenting time.
- Paying gifts cannot erase broken promises and missed events. Family can support a venture or set boundaries; trust grows slowly and repairs require credible behavior across months.
- Have success trade-offs too: success can enable hiring and shorter hours, or cause expansion debt and a higher workload. No obligatory punishment for success.
- No hidden balance to produce equal outcomes for all action strategies. A good option may simply be better; some characters have no good options. Display information available to character, and explain outcome after the fact using ledger, actions and signals without leaking unknowable future.

## 4. Personal and investment mechanics integration

- Savings, index/stock exposure, gold, property rental, microbusiness and active enterprise all compete for cash and sometimes time. Treat business as operating entity, NOT a portfolio slot with random return.
- Spending time trading competes with study/job/family; passive diversified investing generally requires less monthly attention but remains exposed to drawdowns.
- Mark-to-market is not cash gain. If business owner wants to re-invest profits, must account for payroll, taxes and working capital first.
- Personal financial stress may force business asset liquidation even with promising gross sales; NPC help and social safety net are conditional.

## 5. Event sample design and narrative continuity

### Example dynamic arc: a business owner with sick parent

At month 2029-04, parent admitted to hospital (health event, not guaranteed). The character must choose between temporary delegated management (requires competent staff, costs cash), self-managing store (limited hospital time), closing for a week (lost orders), or relying on relatives (requires willingness and relationships). Parent's outcome is NOT a function of whether the protagonist chose the most lucrative strategy; health model is independent, modified by genuine treatment/access variables. An arc may recur with changed context but not repeat identical menu every month.

### Dynamic choice structure

`Choice` contains `requirements`, `upfrontCostVnd`, `timeCommitments`, `delayedConsequences`, `riskDisclosure`, `visibleExpectedTradeoff`, `hiddenStateDependency`, `evidenceRefs`, `effectIds`. Avoid "Option A: +5 health; Option B: +5 money" pure stat cards.

## 6. Data/probability ethics

- Provenance: OFFICIAL, DERIVED, ESTIMATED, ASSUMPTION, MISSING for every tunable sourced claim; 2024 province system and updatable administrative mapping; no invented province-specific business failure stats.
- In REALISM, calibrate rates/market conditions only against reliable source data available at correct time/geography/sector. Where not available, mark estimates, run sensitivity tests and communicate uncertainty.
- In HARDSHIP, make shocks more stressful / buffers lower without representing it as verified Vietnam reality and without increasing death, self-harm, or severe violence hazards gratuitously.
- No claims of clinical precision for personality, mood or mental health; do not make deterministic outcomes based on gender, ethnic group or protected personal attributes.

## 7. Acceptance and QA

1. **Early life:** ages 3 and 5 do not trigger a mandatory identical personality menu for all lives. Verify caregiver circumstances and month context produce different eligible events; old-age paths differ based on family, career, finances and health.
2. **Narrative state:** no family event with deceased NPC; no divorces without marriage; no business payroll after staff contract ended; no retirement pension unless eligible in the year being simulated. Decisions requiring funds/time cannot bypass preconditions.
3. **Causality:** compare two matched-seed runs with same baseline/market; more founder competence, valid demand and sufficient runway should improve aggregate results under controlled assumptions. Guarantee no success for either cohort; failure remains possible.
4. **Time:** 55h vs 40h job/venture work displaces 15h weekly, with real monthly calendar; never double-spend a minute. Runway is cash / *actual* monthly burn, not a fabricated countdown.
5. **Cash:** verify P&L vs cash vs net worth; capital injections/withdrawals, receivables and inventory reconcile; bankruptcy cannot happen solely due to 1 random `FAILURE` flag.
6. **Persistence:** 12 month steps produce same outcome whether stepped one at a time or fast-forwarded, with identical seed/config/actions; reload does not double-post invoices, paychecks, or missed promises.
7. **Content:** >100 repeated lives with different conditions show diverse relevant arcs; event cooldown respects memory. Use test fixtures and scripted event assertions, not only subjective judgement.
8. **Scale:** 100k synthetic lives and separately 10k+ ventures per configuration, report survival/profit/cash-distribution by sector and capital bracket; do not announce figures are real-world probabilities unless empirically sourced.
9. **Modes:** same seed+inputs run in REALISM and HARDSHIP; explain parameter changes and trace finances; no globally random startup win/loss multiplier.

## 8. Dependencies and phase priorities

P0: event eligibility, family/NPC state, monthly time and transaction ledger.  
P1: personality drift, tagged event arcs, startup entity, market & customer simulator, finance separation.  
P2: content expansion, provinces, balance, statistics/cross-seed QA, mobile UI; maintain compatibility with v1.2 saves via versioned migration.  
Do not mistake an authored GDD for shipped software.
