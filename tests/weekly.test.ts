import { expect, it } from "vitest";
import fc from "fast-check";
import { createLife } from "../src/simulation/init";
import { advanceMonth } from "../src/simulation/core/advanceMonth";
import { advanceWeek, advanceWeeks } from "../src/simulation/core/advanceWeek";
import {
  addDays,
  ageOn,
  daysInMonth,
} from "../src/simulation/calendar/YearMonth";
import {
  chooseActivity,
  availableActivities,
} from "../src/simulation/activities";
import { deserialize, serialize } from "../src/simulation/save";
import {
  historyPackSchema,
  packCoverage,
  simulationDate,
  worldContext,
} from "../src/simulation/world/contracts";
import type { GameState } from "../src/simulation/types";
import { makeDecision, templates } from "../src/simulation/events";

function finishMonth(s: GameState) {
  let r = advanceMonth(s, { yearMonth: s.currentMonth });
  while (r.status === "PAUSED")
    r = advanceMonth(r.nextState, {
      yearMonth: r.nextState.currentMonth,
      choice: {
        eventId: r.pendingDecision!.id,
        optionId: r
          .pendingDecision!.options.filter((o) => !o.disabledReason)
          .at(-1)!.id,
      },
    });
  return r.nextState;
}
it("new lives have varied seeded civil birthdays in 1975 and no modern monetary fixture", () => {
  const dates = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const life = createLife({ seed: `birth-${i}` });
    dates.add(life.birthDate);
    expect(life.birthDate.startsWith("1975-")).toBe(true);
    expect(simulationDate(life)).toBe(life.birthDate);
    expect(createLife({ seed: `birth-${i}` }).birthDate).toBe(life.birthDate);
    expect(life.cashVnd).toBe("0");
    expect(life.job).toBeNull();
    expect(worldContext(life).monetaryQuality).toBe("MISSING");
    expect(deserialize(serialize(life))).toEqual(life);
  }
  expect(dates.size).toBeGreaterThan(70);
});
it("weekly horizon closes leap months once and preserves the monthly business/accounting transition", () => {
  for (const month of ["1976-02", "2000-02", "2024-02", "2052-12"]) {
    const initial = createLife({
      legacyDemo: true,
      seed: "weekly-ledger",
      start: "ADULT",
    });
    initial.birthDate = `${+month.slice(0, 4) - 28}-01-01`;
    initial.currentMonth = month;
    initial.job!.startDate = `${month}-01`;
    initial.context.flags = [];
    initial.context.employmentOpportunity = false;
    let weekly = initial;
    for (let i = 0; i < 4; i++) {
      let r = advanceWeek(weekly);
      while (r.status === "PAUSED")
        r = advanceWeek(r.nextState, {
          eventId: r.pendingDecision!.id,
          optionId: r
            .pendingDecision!.options.filter((o) => !o.disabledReason)
            .at(-1)!.id,
        });
      weekly = r.nextState;
    }
    if (weekly.currentMonth === month) weekly = finishMonth(weekly);
    const monthly = finishMonth(initial);
    expect(weekly.reports[0]).toEqual(monthly.reports[0]);
    expect(weekly.ledger.filter((t) => t.date.startsWith(month))).toEqual(
      monthly.ledger,
    );
    expect(new Set(weekly.ledger.map((t) => t.id)).size).toBe(
      weekly.ledger.length,
    );
    expect(weekly.reports[0].days).toBe(daysInMonth(month));
  }
});
it("pause/save/reload resumes the unconsumed part of the same seven-day tick", () => {
  const initial = createLife({
    legacyDemo: true,
    seed: "week-care",
    start: "SENIOR_CARE",
  });
  const first = advanceWeek(initial);
  expect(simulationDate(first.nextState)).toBe("2099-01-08");
  const second = advanceWeek(first.nextState);
  expect(second.status).toBe("PAUSED");
  expect(second.nextState.weeklyCursor!.targetDate).toBe("2099-01-15");
  expect(second.nextState.currentDate).toBe("2099-01-12");
  const restored = deserialize(serialize(second.nextState));
  const choice = { eventId: restored.pendingDecision!.id, optionId: "decline" };
  const resumed = advanceWeek(restored, choice);
  expect(resumed.nextState.currentDate).toBe("2099-01-15");
  expect(resumed.nextState.weeklyCursor).toBeUndefined();
  expect(resumed.nextState).toEqual(
    advanceWeek(second.nextState, choice).nextState,
  );
  expect(advanceWeek(restored).nextState).toEqual(restored);
});
it("1x/16x batching and save/load consume every same day with identical state", () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 100000 }), (seed) => {
      const initial = createLife({ seed: `weeks-${seed}` });
      let slow = initial;
      for (let i = 0; i < 16; i++) slow = advanceWeek(slow).nextState;
      const fast = advanceWeeks(initial, 16).nextState;
      expect(fast).toEqual(slow);
      let loaded = deserialize(serialize(advanceWeeks(initial, 8).nextState));
      loaded = advanceWeeks(loaded, 8).nextState;
      expect(loaded).toEqual(fast);
      expect(initial.currentDate).toBe(initial.birthDate);
    }),
    { numRuns: 40 },
  );
});
it("zero player prompts from birth to the fifth birthday, then age-eligible habits persist", () => {
  let state = createLife({ seed: "child-permissions" });
  for (let week = 0; week < 261; week++) {
    const age = ageOn(state.birthDate, simulationDate(state));
    if (age < 5) {
      expect(availableActivities(state)).toEqual([]);
      expect(() => chooseActivity(state, "READ")).toThrow(/độ tuổi/);
    }
    const next = advanceWeek(state);
    expect(next.status).not.toBe("PAUSED");
    state = next.nextState;
  }
  expect(ageOn(state.birthDate, simulationDate(state))).toBe(5);
  expect(availableActivities(state).some((a) => a.id === "READ")).toBe(true);
  expect(availableActivities(state).some((a) => a.id === "STUDY")).toBe(false);
  state = chooseActivity(state, "READ");
  state = advanceWeeks(state, 8).nextState;
  expect(deserialize(serialize(state)).activity).toBe("READ");
  for (const r of state.reports)
    expect(r.time.usedMinutes).toBe(r.time.availableMinutes);
});
it("old pending caregiver saves advance without a child choosing or changing identity", () => {
  const old = createLife({ legacyDemo: true, seed: "orphan-child" });
  old.npcs.forEach((n) => (n.living = false));
  const next = advanceWeek(old).nextState;
  expect(next.npcs.some((n) => n.id === "guardian-support" && n.living)).toBe(
    true,
  );
  expect(next.birthDate).toBe(old.birthDate);
  expect(next.pendingDecision).toBeUndefined();
});
it("an actual pending caregiver choice in an old save is delegated and logged without a player popup", () => {
  const original = createLife({
    legacyDemo: true,
    seed: "old-guardian-pending",
  });
  const prepared = advanceMonth(
    original,
    { yearMonth: original.currentMonth },
    11,
  ).nextState;
  prepared.pendingDecision = makeDecision(
    prepared,
    templates.find((t) => t.kind === "childhood")!,
  );
  const restored = deserialize(serialize(prepared));
  const result = advanceWeek(restored);
  expect(result.status).not.toBe("PAUSED");
  expect(result.nextState.pendingDecision).toBeUndefined();
  expect(
    result.nextState.cursor!.events.some((e) => e.kind === "guardian"),
  ).toBe(true);
  expect(original.cursor).toBeUndefined();
});
it("pack coverage is per-pack, requires source-backed verified facts, and rejects duplicates", () => {
  const pack = historyPackSchema.parse({
    id: "test-only",
    version: "fixture",
    checksum: "a".repeat(64),
    verifiedThrough: "2026-10-21",
    events: [],
  });
  expect(packCoverage(pack, "2026-10-21")).toBe("WITHIN_VERIFIED_COVERAGE");
  expect(packCoverage(pack, "2026-10-22")).toBe("GENERATED_FUTURE");
  expect(packCoverage({ ...pack, verifiedThrough: null }, "1975-01-01")).toBe(
    "MISSING",
  );
  expect(() =>
    historyPackSchema.parse({
      ...pack,
      events: [
        {
          id: "unsupported",
          date: "2026-10-22",
          titleVi: "Test fixture",
          origin: "VERIFIED_HISTORICAL",
          sourceRefs: [],
        },
      ],
    }),
  ).toThrow();
});
it("opens activities on the actual fifth birthday, without replaying earlier month days", () => {
  const state = createLife({ seed: "birthday-boundary" });
  state.birthDate = "1975-05-10";
  state.currentMonth = "1980-05";
  state.currentDate = "1980-05-09";
  expect(availableActivities(state)).toEqual([]);
  const next = advanceWeek(state).nextState;
  expect(next.currentDate).toBe("1980-05-16");
  expect(next.cursor!.startDay).toBe(9);
  expect(availableActivities(next).map((a) => a.id)).toContain("READ");
});
it("historical foundation cannot silently use modern money, jobs or investments", () => {
  const state = createLife({ seed: "no-false-economy", start: "ADULT" });
  expect(() =>
    advanceMonth(state, {
      yearMonth: state.currentMonth,
      investmentOrders: [
        { orderId: "test", assetId: "fund", side: "BUY", quantity: "1" },
      ],
    }),
  ).toThrow(/niên đại/);
  expect(() =>
    advanceMonth(state, {
      yearMonth: state.currentMonth,
      startBusiness: { sectorId: "retail", capitalVnd: "10000000" },
    }),
  ).toThrow(/niên đại/);
  const next = advanceWeeks(state, 16).nextState;
  expect(next.cashVnd).toBe("0");
  expect(next.debts).toEqual([]);
  expect(next.ledger).toEqual([]);
});
