# QA MONTHLY — v1.2

Run deterministic unit/property tests in codebase, using this checklist as minimum acceptance.

## Calendar

- `2024-01` to `2025-01` = 12 transitions; `2024-02` = 29 days; `2025-02` = 28; `2100-02` = 28; `2000-02` = 29.
- DOB 29 February has documented nonleap birthday resolution; no premature age increment.
- 75 years = 900 months; 90 years = 1080 months; death can stop sooner.
- Monthly available minutes = number of days × 1440; ensure weekly policy interpolation respects 168 h/week.

## Time economics

- 40h vs 55h jobs: 15h/week displaced from a valid actual schedule.
- No positive income from unpaid overtime; overtime contract actually influences payroll.
- Mandatory childcare, care for elders, commute, health care, school commitments count toward the monthly budget.
- 31-day, 28-day and 29-day months handle partial weeks/holidays appropriately.

## Finance and investing

- Monthly salary/expenses/loan payments occur exactly once after reload.
- Late payment, changing work midmonth, relocation midmonth and death midmonth are prorated only by applicable contract rules.
- Monthly interest conversion respects contract and the difference between nominal and inflation-adjusted values.
- End balance equals opening cash + cash inflows − actual cash outflows; market prices do not become wallet cash.
- Sell requests obey liquidity; negative debt is impossible without explicitly modeled prepaid credit.

## Story progression

- An entirely ordinary month is allowed, with no popup.
- A key event pauses auto at decision; no event is silently chosen without user-set policy.
- Event cooldowns carry across Dec→Jan; delayed consequences `dueMonth` apply exactly once.
- Fast forward 12 months matches 12 manual advances for same seed & choices, including monthly NPC changes, markets and expenses.
- Giving a gift each month cannot infinitely increase a relationship; time and trust remain essential.
- Milestones/education/guardian decisions are appropriate to age.

## Modes, uncertainty and data

- REALISM/HARDSHIP change only documented balancing parameters; core month mechanics identical.
- Statistical annual hazard `p_year` is converted by formula only under the stated constant-hazard assumption.
- 63 localities retain their 2024 identities and period provenance; historical and future world values are labeled.
- No unverified mortality, disease or scam probabilities are represented as real data.

## Performance

- 10k-life suite in CI/targeted runs, 100k-life Monte Carlo milestone at release candidate; track runtime and event count.
- UI renders long journals via virtualized list/pagination, not 1000 monthly panels at once.
