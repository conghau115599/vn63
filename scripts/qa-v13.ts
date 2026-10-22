import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  createBusiness,
  injectOwnerCapital,
  advanceBusinessMonth,
  assertBusinessBooks,
} from "../src/simulation/business/advanceBusinessMonth";
import { addMonths, daysInMonth } from "../src/simulation/calendar/YearMonth";
import { createLife } from "../src/simulation/init";
import { advanceMonth } from "../src/simulation/core/advanceMonth";
import { templates } from "../src/simulation/events";
import { isEventEligible } from "../src/simulation/events/eligibility";
import { simulationConfig } from "../src/simulation/config";
import provinces from "../src/content/provinces.2024.json";
import type {
  BusinessReport,
  BusinessState,
} from "../src/simulation/business/types";
const args = Object.fromEntries(
  process.argv.slice(2).map((s) => s.replace(/^--/, "").split("=")),
);
const count = Number(args.count ?? 10000),
  months = Number(args.months ?? 24),
  output = args.output ?? "qa-results/v13-cohorts.json";
if (
  !Number.isInteger(count) ||
  count < 1 ||
  count > 100000 ||
  !Number.isInteger(months) ||
  months < 1 ||
  months > 120
)
  throw new Error("Invalid count/months");
const profiles = [
  {
    id: "CAREFUL",
    skill: 65,
    price: "110000",
    marketing: "150000",
    hours: 15,
    stock: 60,
    fixed: "1200000",
    validated: 2,
  },
  {
    id: "GROWTH",
    skill: 50,
    price: "100000",
    marketing: "600000",
    hours: 35,
    stock: 180,
    fixed: "2500000",
    validated: 1,
  },
  {
    id: "OVEREXTENDED",
    skill: 25,
    price: "90000",
    marketing: "1200000",
    hours: 55,
    stock: 250,
    fixed: "5000000",
    validated: 1,
  },
];
const started = performance.now();
let ticks = 0;
const configurations: unknown[] = [],
  samples: Array<{
    mode: string;
    strategy: string;
    worldSeed: string;
    capitalVnd: string;
    reports: BusinessReport[];
  }> = [];
for (const mode of ["REALISM", "HARDSHIP"] as const)
  for (const profile of profiles) {
    const cash: bigint[] = [],
      profits: bigint[] = [],
      times: number[] = [];
    let solvent = 0,
      positiveProfit = 0,
      positiveCashflow = 0;
    const strata: Record<
      string,
      { count: number; cashSolvent: number; positiveProfit: number }
    > = {};
    for (let i = 0; i < count; i++) {
      const worldSeed = `v13-matched-market-${i}`,
        sector = i % 2 ? "retail" : "service",
        capital = ["10000000", "30000000", "60000000"][i % 3],
        province = provinces.provinces[i % 63].id;
      let b = createBusiness({
        id: `matched-venture-${i}`,
        ownerId: "cohort-owner",
        provinceId: province,
        month: "2052-01",
        worldSeed,
        sectorId: sector,
        skill: profile.skill,
        retainHistory: false,
      });
      b = injectOwnerCapital(b, capital, "2052-01-01", "initial-capital");
      b.status = "ACTIVE";
      b.permitGranted = true;
      b.creditApproved = true;
      b.validatedMonths = profile.validated;
      b.fixedMonthlyCostsVnd = profile.fixed;
      b.strategy = {
        ...b.strategy,
        priceVnd: profile.price,
        marketingBudgetVnd: profile.marketing,
        ownerHoursPerWeek: profile.hours,
        inventoryOrderUnits: profile.stock,
      };
      const sample: BusinessReport[] = [],
        t0 = performance.now();
      let totalProfit = 0n,
        totalCashFlow = 0n;
      for (let m = 0; m < months; m++) {
        const ym = addMonths("2052-01", m),
          r = advanceBusinessMonth(
            b,
            { yearMonth: ym },
            {
              worldSeed,
              mode,
              ownerMinutes: (profile.hours * 60 * daysInMonth(ym)) / 7,
            },
          );
        b = r.nextState;
        assertBusinessBooks(b);
        if (BigInt(b.bankCashVnd) < 0n || BigInt(b.inventoryCostVnd) < 0n)
          throw new Error("Negative business books");
        totalProfit += BigInt(r.report.profitVnd);
        totalCashFlow += BigInt(r.report.cashFlowVnd);
        if (i === 0) sample.push(r.report);
        ticks++;
      }
      const last = b.reports.at(-1)!,
        viable = last.solvent && BigInt(b.bankCashVnd) > 0n;
      solvent += +viable;
      positiveProfit += +(totalProfit > 0n);
      positiveCashflow += +(totalCashFlow > 0n);
      cash.push(BigInt(b.bankCashVnd));
      profits.push(totalProfit);
      times.push(performance.now() - t0);
      const key = `${sector}/capital-${capital}`;
      strata[key] ??= { count: 0, cashSolvent: 0, positiveProfit: 0 };
      strata[key].count++;
      strata[key].cashSolvent += +viable;
      strata[key].positiveProfit += +(totalProfit > 0n);
      if (i === 0)
        samples.push({
          mode,
          strategy: profile.id,
          worldSeed,
          capitalVnd: capital,
          reports: sample,
        });
      if ((i + 1) % 1000 === 0)
        console.log(
          JSON.stringify({
            mode,
            strategy: profile.id,
            completed: i + 1,
            perConfiguration: count,
            ticks,
            elapsedSeconds: Math.round((performance.now() - started) / 1000),
          }),
        );
    }
    cash.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    profits.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    times.sort((a, b) => a - b);
    configurations.push({
      mode,
      strategy: profile.id,
      count,
      months,
      operatingCashSolventAtEnd: solvent,
      positiveCumulativeProfit: positiveProfit,
      positiveCumulativeCashflow: positiveCashflow,
      terminalCashVnd: {
        p10: cash[Math.floor(count * 0.1)].toString(),
        median: cash[Math.floor(count * 0.5)].toString(),
        p90: cash[Math.floor(count * 0.9)].toString(),
      },
      cumulativeProfitVnd: {
        p10: profits[Math.floor(count * 0.1)].toString(),
        median: profits[Math.floor(count * 0.5)].toString(),
        p90: profits[Math.floor(count * 0.9)].toString(),
      },
      p95VentureMs: times[Math.min(count - 1, Math.floor(count * 0.95))],
      strata,
    });
  }
const stories = [];
for (const scenario of [
  {
    id: "urban-child",
    start: "BIRTH" as const,
    settlement: "URBAN" as const,
    resources: "AFFLUENT" as const,
  },
  {
    id: "rural-child",
    start: "BIRTH" as const,
    settlement: "RURAL" as const,
    resources: "LIMITED" as const,
  },
  {
    id: "late-care",
    start: "SENIOR_CARE" as const,
    settlement: "URBAN" as const,
    resources: "STABLE" as const,
  },
]) {
  let s = createLife({
    legacyDemo: true,
    seed: "contrasting-story",
    start: scenario.start,
    context: { settlement: scenario.settlement, resources: scenario.resources },
  });
  if (scenario.start === "BIRTH") s.currentMonth = "2027-01";
  const initialPool = templates
      .filter((t) => isEventEligible(s, t).eligible)
      .map((t) => t.id),
    months = [];
  for (let i = 0; i < 12; i++) {
    let r = advanceMonth(s, { yearMonth: s.currentMonth });
    while (r.status === "PAUSED")
      r = advanceMonth(r.nextState, {
        yearMonth: r.nextState.currentMonth,
        choice: { eventId: r.pendingDecision!.id, optionId: "decline" },
      });
    s = r.nextState;
    months.push(s.reports.at(-1));
  }
  stories.push({
    scenario: scenario.id,
    seed: s.seed,
    explicitDecisionPolicy: "decline",
    initialPool,
    eventMemory: s.eventMemory,
    traits: s.personality,
    months,
  });
}
const result = {
  engineVersion: "1.3.0-alpha.1",
  configVersion: simulationConfig.version,
  sourceGrade: "ASSUMPTION",
  notRealWorldStatistics: true,
  countPerConfiguration: count,
  configurationCount: configurations.length,
  totalVentures: count * configurations.length,
  monthlyBusinessCommits: ticks,
  monthsPerVenture: months,
  elapsedMs: Math.round(performance.now() - started),
  configurations,
  samples,
  stories,
  scope:
    "Synthetic operating ventures initialized after setup; matched market seed, province, sector and capital across strategy profiles. Different skill/fixed cost/marketing/effort intentionally represent different strategies. The high/low operations-only mechanism is separately unit-tested.",
  limits: [
    "No claim of calibrated Vietnam startup survival or failure rates.",
    "Cash-solvent means positive cash, nonnegative book equity and no overdue due bills at horizon; it is not legal bankruptcy status.",
    "Lifetime 100k QA is a separate milestone, not substituted by venture/month counts.",
  ],
};
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(result, null, 2));
console.log(
  JSON.stringify({
    output,
    totalVentures: result.totalVentures,
    ticks,
    elapsedMs: result.elapsedMs,
  }),
);
