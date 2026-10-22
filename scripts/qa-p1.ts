import { writeFileSync, mkdirSync } from "node:fs";
import { createLife } from "../src/simulation/init";
import { advanceWeek } from "../src/simulation/core/advanceWeek";
import { ageOn } from "../src/simulation/calendar/YearMonth";
import { simulationDate } from "../src/simulation/world/contracts";
import { deserialize, serialize } from "../src/simulation/save";
const count = Number(
  process.argv.find((a) => a.startsWith("--count="))?.split("=")[1] ?? 1000,
);
if (!Number.isInteger(count) || count < 1 || count > 10000)
  throw new Error("count 1–10000");
const start = Date.now();
let weeks = 0,
  months = 0,
  decisions = 0,
  guardianNotices = 0,
  minAge = 200,
  maxAge = 0;
for (let i = 0; i < count; i++) {
  let state = createLife({
    seed: `p1-life-${i}`,
    mode: i % 2 ? "HARDSHIP" : "REALISM",
    retainHistory: false,
  });
  let ticks = 0;
  while (state.living) {
    const age = ageOn(state.birthDate, simulationDate(state));
    if (age < 5 && state.pendingDecision)
      throw new Error("Under-five player prompt");
    const choice = state.pendingDecision
      ? {
          eventId: state.pendingDecision.id,
          optionId: state.pendingDecision.options
            .filter((o) => !o.disabledReason)
            .at(-1)!.id,
        }
      : undefined;
    if (choice) decisions++;
    const next = advanceWeek(state, choice).nextState;
    if (next.committedMonths > state.committedMonths) {
      const report = next.reports.at(-1)!;
      if (
        BigInt(report.cashOpenVnd) +
          BigInt(report.inflowVnd) -
          BigInt(report.outflowVnd) !==
        BigInt(report.cashCloseVnd)
      )
        throw new Error("Unbalanced ledger");
      if (report.time.usedMinutes !== report.time.availableMinutes)
        throw new Error("Time conservation");
      guardianNotices += report.events.filter(
        (e) => e.kind === "guardian",
      ).length;
    }
    state = next;
    weeks++;
    ticks++;
    if (ticks === 100) state = deserialize(serialize(state));
    if (ticks > 6000) throw new Error("Unbounded lifetime");
  }
  const age = ageOn(state.birthDate, state.deathDate!);
  minAge = Math.min(minAge, age);
  maxAge = Math.max(maxAge, age);
  months += state.committedMonths;
  if ((i + 1) % 100 === 0)
    console.log(
      JSON.stringify({
        completed: i + 1,
        weeks,
        elapsedMs: Date.now() - start,
      }),
    );
}
mkdirSync("qa-results", { recursive: true });
const result = {
  profile: "HISTORICAL_FOUNDATION",
  sourceGrade: "ASSUMPTION/MISSING",
  count,
  weeks,
  months,
  decisions,
  guardianNotices,
  minAge,
  maxAge,
  elapsedMs: Date.now() - start,
  assertions:
    "under-five agency, Gregorian weekly traversal, monthly ledger/time conservation, save/reload, bounded termination",
  limitation:
    "Not historical/provincial/mortality calibration; economic content remains gated pending P2.",
};
writeFileSync(
  "qa-results/p1-weekly-smoke.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
