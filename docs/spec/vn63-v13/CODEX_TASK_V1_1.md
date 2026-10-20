# CODEX TASK — Implement VN63 v1.1 Life Trade-offs

## Precedence

Read `base_v1/GDD_VN63_V1.md`, `base_v1/CODEX_IMPLEMENTATION_BRIEF.md`, `GDD_ADDENDUM_V1_1_TIME_TRADEOFFS.md`, then this file. The addendum overrides older sections on focus, happiness, jobs, relationships, investments. First inspect existing repository; extend it, **do not recreate a parallel application**. Do not copy assets/code from 1in8b.

## Proposed modules

```text
src/simulation/core/DeterministicRng.ts
src/simulation/time/TimeBudget.ts
src/simulation/time/LifestylePolicy.ts
src/simulation/health/FatigueAndRecovery.ts
src/simulation/wellbeing/WellbeingModel.ts
src/simulation/npc/QualityTime.ts
src/simulation/career/CareerProgression.ts
src/simulation/investments/MarketRegime.ts
src/simulation/investments/InvestmentLedger.ts
src/simulation/persistence/VersionedSave.ts
src/simulation/qa/MonteCarloRunner.ts
```

## State extension: TypeScript sketch

```ts
type Mode = 'REALISM' | 'HARDSHIP';
type LifestylePolicy = 'CAREER_SPRINT' | 'FAMILY_FIRST' | 'BALANCED' |
  'STUDY_UPSKILL' | 'HIGH_RISK_INVESTOR' | 'MINIMUM_SURVIVAL';
type TimeBucket = 'sleep' | 'paidWork' | 'commute' | 'essentialHousehold' |
  'caregiving' | 'education' | 'socialFamily' | 'socialFriends' |
  'exercise' | 'hobby' | 'rest' | 'other';
type WeeklySchedule = Record<TimeBucket, number>;
interface PsychologicalState {
  mood: number; lifeSatisfaction: number; fatigue: number;
  stress: number; energy: number; attention: number;
}
interface NpcRelation {
  npcId: string; bond: number; trust: number; unmetNeeds: number;
  unmetPromises: number; weeklyQualityHours: number;
}
interface InvestmentAccount {
  cashVnd: number; positions: Array<{
    assetId: string; quantity: number; purchasePriceVnd: number;
    markPriceVnd: number; liquidityDays: number;
  }>;
  loanBalanceVnd: number;
}
interface VersionedGameState {
  seed: string; mode: Mode; engineVersion: string; worldDataVersion: string;
  lifestylePolicy: LifestylePolicy; schedule: WeeklySchedule;
  psychological: PsychologicalState; npcRelations: NpcRelation[];
  investments: InvestmentAccount;
}
```

## Engine rules

1. Preserve 168h/week constraint and record displaced hours every change of work/obligations. No negative schedule bucket.
2. Introduce optional time-allocating policy resolver with constraints and default priorities. Explain when policy cannot be met; never silently remove childcare/sleep obligations.
3. Time/energy are separate: exhausted hours have reduced effectiveness. Build fatigue/stress recovery with carryover and bounded clamping.
4. Mood (fast) and lifeSatisfaction (slow) are distinct; UI combines them but detailed explanations should show factors. All weights are clearly marked assumptions until calibrated.
5. NPC relationship updates by interaction quality, presence, trust, promises, conflict; repeated gifting must exhibit diminishing returns.
6. Career returns are contingent (job pay structure, skill, market, age, personal network), *not* guaranteed by hours worked.
7. Investment/market state is shared per world seed, actual accounting ledger, noninstant property liquidity, losses possible, no certain return, lock loans until repaid.
8. Simulate time, accounting, NPC, deferred consequences in a fixed monthly order; no double application on save reload.
9. All chance calls use seeded RNG; log causal eventId and contributing context for debug.
10. Add UI time bar, story consequences and inspectable stats. Avoid visible fake exact +5/-5 previews; use trend labels with uncertainty.

## Delivery milestones

- T1 policy + time; unit/property tests.
- T2 psychology + stamina; tests for fatigue accumulation and mood adaptation.
- T3 relationships + memories; tests for quality time/gift exploit.
- T4 career + income; migration testing.
- T5 investments + scam integration; cash reconciliation and market tests.
- T6 3 preset comparisons, both modes, seed lock, mobile QA, 100,000 Monte Carlo (mark any uncalibrated result clearly).

## Nonnegotiable QA

- All time <=168, every policy change is causal.
- High work sometimes yields money and career opportunity, never auto-guaranteed success.
- Sleep deprivation/poor recovery has delayed costs; chronic problems cannot be magically erased.
- Balanced lifestyle offers sustainable outcomes, generally slower growth but no automatic penalties; normal life not 'loss'.
- Family interaction cannot be fully replaced with money; NPC remembers missed events.
- Ensure two modes are clearly labeled; no invented provincial statistics.
- Browser save/load determinism; fast-forward and manual play end in identical state for identical decisions.

## IMPORTANT

Initial parameters in `data/life_tradeoffs.example.json` are **SIMULATION ASSUMPTIONS / test fixtures**, NOT empirically estimated rates. Read source policy of base GDD. Produce code, tests, screenshots, and a variance explanation between the two modes. Do not stop after docs/UI mocks.
