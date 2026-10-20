# CODEX IMPLEMENTATION BRIEF — v1.2 MONTHLY LIFE SIMULATION

## Objective

Refactor VN63 simulation time unit from **one year per tick** to **one calendar month per tick** throughout model, finance, investments, NPCs, health, choices, persistence, tests and UI. **Read the entire `GDD_ADDENDUM_V1_2_MONTHLY_TIME.md` first**. Priority: v1.2 > v1.1 > base v1.0. Do not create another app; inspect the current repo and integrate in place.

## Do not fake month simulation

Do NOT keep yearly evolution and change its button label to "Sang tháng". A person living 75 years must run 900 distinct monthly transitions; every intervening month must be simulated in auto/fast-forward. For dates use Gregorian `YearMonth` + ISO `birthDate`, leap year and real days. Yearly recap is a derived view, not a tick.

## Implementation order and files

1. **Core calendar** `src/simulation/calendar/YearMonth.ts`: parse/validate YYYY-MM; `daysInMonth`, `nextMonth`, `monthsBetween`, DOB/age, leap-day rule. No dependence on real system date while replaying game.
2. **Monthly time budget** `src/simulation/time/MonthlySchedule.ts`: reuse v1.1 168h/week lifestyle policy; exact days; integer minutes; recurrent weekly calendar and day-specific obligations; prevent >24h/day and >month cap, log displaced time.
3. **Monthly step orchestrator** `src/simulation/core/advanceMonth.ts`: pure deterministic state transition; process dated sub-events in chronological order; versioned save and idempotent event ledger. Pause for decisions requiring input.
4. **Finance** `src/simulation/finance/MonthlyLedger.ts`: recurring income/expense, pay date, proration, debts and amortization, contract terms, nominal VND integer; CPI deflator is presentation data only.
5. **Investment** `src/simulation/investments/MonthlyMarket.ts`: price evolution/market regimes per month; transaction dates, liquidity, portfolio marks, dividend and interest scheduling; mark-to-market changes not cash flows.
6. **NPC + Health**: monthly sleep debt, fatigue, recovery, illness care; per NPC quality time, attachment, promises, memory and unmet needs; slow life satisfaction vs fast mood.
7. **Event engine**: recurrence `months`, eligibility, `cooldownMonths`, conditional hazard, delayed arcs `dueMonth`, `maxOccurrences`; no one dramatic decision every month.
8. **UI**: `Tháng MM/YYYY`, month timeline/journal, monthly budget/debts/time bar, pause, `1×/4×/12×`, `Tới quyết định tiếp theo`; family/finance/health explainers and yearly summary. Autopilot reuses standing orders.
9. **Migration**: Existing year-based saves need explicit migration/compat notice. Do not silently reinterpret an old age or `year` as a month. Persist schema version; design a migration path if repo actually has saves to preserve.
10. **Testing**: month calendar, finance, market, relationships, triggers, idempotency, deterministic fast-forward; Playwright critical flow on phone and desktop; 100k simulation batch at final acceptance.

## Type contracts

```ts
interface MonthlyInput {
  yearMonth: string; // strictly YYYY-MM, current state month
  policyChanges?: Array<{ policyId: string; enabled: boolean; details?: unknown }>;
  choice?: { eventId: string; optionId: string };
  investmentOrders?: Array<{ orderId: string; assetId: string; side: 'BUY'|'SELL'; quantity: string }>;
}
interface MonthlyResult {
  nextState: GameState;
  committedMonth: string;
  journal: Array<{ id: string; happenedAt: string; kind: string; text: string }>;
  money: { cashOpenVnd: string; inflowVnd: string; outflowVnd: string; cashCloseVnd: string };
  pendingDecision?: { id: string; options: string[] };
}
```

Use integer VND/decimal-safe accounting (string for amounts on wire if big integer; never unsafe floating-point accumulation of debts) and stable IDs. Resolve pending decisions before finalizing next month when event impacts remaining days. `advanceMonth` must return a stoppable result without corrupting interim balances. Save state snapshots transactionally.

## Non-negotiable acceptance tests

- `2024-01` → 12 commits → `2025-01`; February 2024 has 29 days, February 2025 has 28; 75 years = 900 ticks.
- Across fast and manual advancement, same lifeId+seed+engine/world version+decision policy = identical ledger, events, NPC states, world prices.
- Work 55h vs 40h must displace 15h/week in the same schedule; money only increases when pay agreement exists, not by unconditional bonus.
- Time budget never exceeds `24 * days`; fixed-day obligations counted once. If necessary show an infeasible schedule instead of silently changing essential needs.
- Recurring rent, debts and wages execute once/month at specified dates even after reload. Mid-month death/job change causes correct partial-period handling where applicable.
- Mood from a gift fades; family trust not infinitely farmable by giving gifts; unfulfilled promise is remembered across months.
- Investments update monthly even without interaction. Asset price gains don't increase wallet until sold; illiquid assets cannot be instant sold.
- No mandatory popup in every simulated month. Critical decisions must pause auto; unimportant months auto-proceed.
- Childhood and real/hardship constraints stay consistent; annual reports use completed monthly records only.

## Existing v1.1 documents to reconcile

`GDD_ADDENDUM_V1_1_TIME_TRADEOFFS.md` section B uses 168h/week and section K already describes monthly processing, **retain it**. Replace any text that incorrectly implies gameplay advances years or only allows a yearly focus. `CODEX_TASK_V1_1.md` monthly reference is the starting point, not a reason to skip calendar, UI or events. Mark v1.2 as active spec in README.

## Deliverables Codex must actually produce

- Working monthly engine and UI integrated into the existing repo.
- Migrated fixture schema, deterministic tests and browser QA.
- Short changelog listing migrated year-only logic, unresolved data gaps and differences of REALISM/HARDSHIP.
- Commit/push only when requested and authorized by the repo workflow. No claims of deployment until it is verified.
