import type { GameState } from "./types";
import { simulationConfig } from "./config";
export const traitNames = [
  "conscientiousness",
  "riskTolerance",
  "adaptability",
  "sociability",
  "persistence",
  "emotionRegulation",
] as const;
export type Trait = (typeof traitNames)[number];
export type PersonalityState = {
  version: "traits-v1";
  sourceGrade: "ASSUMPTION";
  values: Record<Trait, number>;
  baseline: Record<Trait, number>;
  lastDelta: Record<Trait, number>;
};
export const initialPersonality = (): PersonalityState => ({
  version: "traits-v1",
  sourceGrade: "ASSUMPTION",
  values: Object.fromEntries(traitNames.map((t) => [t, 50])) as Record<
    Trait,
    number
  >,
  baseline: Object.fromEntries(traitNames.map((t) => [t, 50])) as Record<
    Trait,
    number
  >,
  lastDelta: Object.fromEntries(traitNames.map((t) => [t, 0])) as Record<
    Trait,
    number
  >,
});
export function evolvePersonality(
  s: GameState,
  minutes: Record<string, number>,
  fraction = 1,
): PersonalityState {
  const cfg = simulationConfig.personality,
    p = s.personality;
  const social = Math.min(
      1,
      ((minutes.family ?? 0) + (minutes.friends ?? 0)) / 3600,
    ),
    study = Math.min(1, (minutes.study ?? 0) / 3600),
    work = Math.min(1, ((minutes.work ?? 0) + (minutes.business ?? 0)) / 9000),
    recovery = Math.min(
      1,
      ((minutes.rest ?? 0) + (minutes.exercise ?? 0)) / 3600,
    );
  const kept = s.npcs.reduce(
      (n, p) =>
        n +
        p.promises.filter(
          (x) => x.status === "KEPT" && x.dueMonth === s.currentMonth,
        ).length,
      0,
    ),
    missed = s.npcs.reduce(
      (n, p) =>
        n +
        p.promises.filter(
          (x) => x.status === "MISSED" && x.dueMonth === s.currentMonth,
        ).length,
      0,
    );
  const habits: Record<Trait, number> = {
    conscientiousness: study * 0.5 + work * 0.3 + kept * 0.2 - missed * 0.2,
    riskTolerance: s.business?.status === "ACTIVE" ? 0.15 : -0.03,
    adaptability:
      study * 0.5 + (s.context.flags.includes("RECENT_MOVE") ? 0.4 : 0),
    sociability: social - 0.35,
    persistence: work * 0.4 + study * 0.3,
    emotionRegulation: recovery * 0.7 - s.fatigue / 120,
  };
  const values = { ...p.values },
    lastDelta = { ...p.lastDelta };
  for (const trait of traitNames) {
    const v = values[trait],
      saturation = habits[trait] >= 0 ? (100 - v) / 50 : v / 50;
    const delta =
      (cfg.habitRate * habits[trait] * saturation +
        cfg.baselinePull * (p.baseline[trait] - v)) *
      fraction;
    lastDelta[trait] = Math.max(
      -cfg.maxMonthlyChange,
      Math.min(cfg.maxMonthlyChange, delta),
    );
    values[trait] = Math.max(0, Math.min(100, v + lastDelta[trait]));
  }
  return { ...p, values, lastDelta };
}
