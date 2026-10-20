# VN63 — GAME DESIGN DOCUMENT v1.2 (MONTHLY LIFE SIMULATION)

**Current authoritative spec** as of 20/10/2026. This pack includes previous v1.0 and v1.1 documents and all prior supporting assets, plus monthly simulation addendum and Codex implementation task.

## Read / implementation order

1. `base_v1/GDD_VN63_V1.md` — original intent, 63 localities, two modes.
2. `GDD_ADDENDUM_V1_1_TIME_TRADEOFFS.md` — time trade-offs, happiness, investing, relationships.
3. **`GDD_ADDENDUM_V1_2_MONTHLY_TIME.md` — OVERRIDES previous yearly gameplay-tick mechanics.**
4. **`CODEX_TASK_V1_2_MONTHLY.md` — active Codex prompt.**
5. `data/monthly_config.example.json` + `qa/QA_MONTHLY.md` — fixture and test checklist.

**Precedence:** v1.2 > v1.1 > v1.0. **Key decision:** `1 tick = 1 calendar month`; internal weekly allocation remains 168 hours; fast-forward simulates all intervening months; critical decisions pause; ordinary months can be silent.

## Limitations

These files are design specs and test fixtures, **not an implemented game engine**. Any numeric UI examples and balancing parameters are simulation assumptions, not official statistics. Treat provincial datasets with source/provenance guidance from base v1.0.

## Lightweight check

`python qa/check_monthly_config.py`
