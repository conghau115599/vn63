import { createLife } from "../src/simulation/init";
import { advanceMonth } from "../src/simulation/core/advanceMonth";
import { netWorth } from "../src/simulation/investments/MonthlyMarket";
import provinces from "../src/content/provinces.2024.json";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const args = Object.fromEntries(
  process.argv.slice(2).map((v) => v.replace(/^--/, "").split("=")),
);
const count = Number(args.count ?? 1000),
  offset = Number(args.offset ?? 0),
  output = args.output ?? "qa-results/simulation.json";
if (!Number.isInteger(count) || count < 1 || count > 1000000)
  throw new Error("count must be 1–1,000,000");
if (!Number.isInteger(offset) || offset < 0)
  throw new Error("Invalid seed offset");
if (args["decision-policy"] !== "decline")
  throw new Error(
    "Specify --decision-policy=decline to authorize headless choices.",
  );
const started = performance.now();
let ticks = 0,
  decisions = 0,
  maxLifetimeMs = 0;
const netWorths: bigint[] = [],
  lifetimes: number[] = [],
  phaseCounts: Record<string, number> = {},
  provinceCounts: Record<string, number> = {},
  monthlyCounts: Record<string, number> = {};
const modeCounts = { REALISM: 0, HARDSHIP: 0 };
for (let i = 0; i < count; i++) {
  const index = offset + i,
    mode = index % 2 === 0 ? "REALISM" : "HARDSHIP",
    provinceId = provinces.provinces[Math.floor(index / 2) % 63].id;
  let s = createLife({
    legacyDemo: true,
    seed: `qa-life-${Math.floor(index / 2)}`,
    mode,
    provinceId,
    retainHistory: false,
  });
  const lifeStart = performance.now();
  modeCounts[mode]++;
  provinceCounts[provinceId] = (provinceCounts[provinceId] ?? 0) + 1;
  while (s.living) {
    const prior = s.committedMonths;
    const oldMonth = s.currentMonth;
    const r = advanceMonth(s, {
      yearMonth: s.currentMonth,
      ...(s.pendingDecision
        ? { choice: { eventId: s.pendingDecision.id, optionId: "decline" } }
        : {}),
    });
    if (s.pendingDecision) decisions++;
    s = r.nextState;
    if (r.status === "PAUSED") continue;
    if (s.committedMonths !== prior + 1)
      throw new Error("Skipped monthly tick");
    if (
      BigInt(s.cashVnd) < 0n ||
      s.debts.some((d) => BigInt(d.principalVnd) < 0n)
    )
      throw new Error("Negative finance state");
    const age = s.reports[0].age,
      phase =
        age < 6
          ? "EARLY_CHILDHOOD"
          : age < 18
            ? "SCHOOL"
            : age < 65
              ? "ADULT"
              : "LATER_LIFE";
    phaseCounts[phase] = (phaseCounts[phase] ?? 0) + 1;
    monthlyCounts[oldMonth.slice(5)] =
      (monthlyCounts[oldMonth.slice(5)] ?? 0) + 1;
    ticks++;
    if (s.committedMonths > 1681) throw new Error("Unbounded lifetime");
  }
  netWorths.push(netWorth(s));
  lifetimes.push(s.committedMonths);
  maxLifetimeMs = Math.max(maxLifetimeMs, performance.now() - lifeStart);
  if ((i + 1) % 100 === 0)
    console.log(
      JSON.stringify({
        completed: i + 1,
        total: count,
        ticks,
        elapsedSeconds: Math.round((performance.now() - started) / 1000),
      }),
    );
}
netWorths.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
lifetimes.sort((a, b) => a - b);
const result = {
  engineVersion: "1.3.0-alpha.1",
  quality: "MODEL_ASSUMPTION_NOT_CALIBRATION",
  decisionPolicy: "decline",
  count,
  seedOffset: offset,
  ticks,
  decisions,
  modeCounts,
  provinceSampling: "round_robin_fixture_not_birth_distribution",
  provinceCounts,
  phaseCounts,
  monthlyCounts,
  elapsedMs: Math.round(performance.now() - started),
  maxLifetimeMs: Math.round(maxLifetimeMs),
  medianLifetimeMonths: lifetimes[Math.floor(count / 2)],
  netWorthVnd: {
    p10: netWorths[Math.floor(count * 0.1)].toString(),
    median: netWorths[Math.floor(count * 0.5)].toString(),
    p90: netWorths[Math.floor(count * 0.9)].toString(),
  },
  limitations: [
    "Terminal age is a demo scenario, not fitted mortality.",
    "No claim of real province-level economic or health distribution.",
    "100k lifetime acceptance is required before release; this report states its actual sample count.",
  ],
};
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(result, null, 2));
console.log(
  JSON.stringify({ output, count, ticks, elapsedMs: result.elapsedMs }),
);
