import { random } from "../rng";
import { simulationConfig } from "../config";
import type { BusinessMonthContext, BusinessState } from "./types";
export function monthlyBusinessMarket(
  b: BusinessState,
  month: string,
  context: BusinessMonthContext,
) {
  const key = `${b.province2024Id}/${b.sectorId}/${month}`,
    cfg = simulationConfig.modes[context.mode];
  const shock = random(context.worldSeed, "business-market/shock", key),
    seasonality =
      0.9 + random(context.worldSeed, "business-market/season", key) * 0.2;
  const demandMultiplier =
    context.demandOverride ??
    (shock < cfg.downturnThreshold
      ? cfg.shockFloor
      : 0.9 + random(context.worldSeed, "business-market/demand", key) * 0.3);
  if (
    !Number.isFinite(demandMultiplier) ||
    demandMultiplier < 0 ||
    demandMultiplier > 3
  )
    throw new Error("Demand override outside modeled range");
  return {
    version: simulationConfig.business.marketVersion,
    demandMultiplier,
    competition:
      0.25 +
      random(context.worldSeed, "business-market/competition", key) * 0.3,
    seasonality,
    sourceGrade: "ASSUMPTION" as const,
  };
}
/** Bounded binomial approximation for large funnels, exact Bernoulli for small samples. */
export function convertCustomers(
  seed: string,
  key: string,
  leads: number,
  p: number,
): number {
  if (leads < 30) {
    let n = 0;
    for (let i = 0; i < leads; i++)
      if (random(seed, "business-customer", `${key}/${i}`) < p) n++;
    return n;
  }
  let noise = 0;
  for (let i = 0; i < 12; i++)
    noise += random(seed, "business-conversion", `${key}/${i}`);
  noise -= 6;
  return Math.max(
    0,
    Math.min(
      leads,
      Math.round(leads * p + Math.sqrt(leads * p * (1 - p)) * noise),
    ),
  );
}
