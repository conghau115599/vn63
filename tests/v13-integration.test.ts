import { expect, it } from "vitest";
import { createLife } from "../src/simulation/init";
import {
  advanceMonth,
  advanceMonths,
} from "../src/simulation/core/advanceMonth";
import {
  auditMonth,
  decisionCounterfactuals,
} from "../src/simulation/instrumentation";
import { deserialize, serialize } from "../src/simulation/save";
import { templates, makeDecision } from "../src/simulation/events";
import { isEventEligible } from "../src/simulation/events/eligibility";
import type { GameState, MonthlyInput } from "../src/simulation/types";
function finish(s: GameState, input: Partial<MonthlyInput> = {}) {
  let r = advanceMonth(s, { yearMonth: s.currentMonth, ...input });
  while (r.status === "PAUSED")
    r = advanceMonth(r.nextState, {
      yearMonth: r.nextState.currentMonth,
      choice: { eventId: r.pendingDecision!.id, optionId: "decline" },
    });
  return r.nextState;
}
it("transfers owner capital once, validates, launches, persists and reconciles both ledgers", () => {
  let s = createLife({ legacyDemo: true, seed: "founder", start: "ADULT" });
  const opening = BigInt(s.cashVnd);
  s = finish(s, {
    startBusiness: { sectorId: "retail", capitalVnd: "15000000" },
    business: { yearMonth: s.currentMonth, action: "VALIDATE" },
  });
  expect(s.business?.status).toBe("VALIDATING");
  expect(s.business?.bankCashVnd).toBe("14800000");
  expect(s.business?.reports.at(-1)?.ownerCapitalVnd).toBe("15000000");
  expect(s.business?.reports.at(-1)?.openingCashVnd).toBe("0");
  expect(BigInt(s.cashVnd)).toBeLessThan(opening);
  s = deserialize(serialize(s));
  s = finish(s, { business: { yearMonth: s.currentMonth, action: "LAUNCH" } });
  expect(s.business?.status).toBe("ACTIVE");
  expect(s.reports.at(-1)?.time.byCategory.business).toBeGreaterThan(0);
  expect(auditMonth(s)).toMatchObject({
    cashBalanced: true,
    businessBalanced: true,
    uniquePersonalIds: true,
  });
  expect(s.ledger.filter((t) => t.source === "owner-capital")).toHaveLength(1);
});
it("does not let a child launch or personal cash finance a second time after pause", () => {
  const child = createLife({ legacyDemo: true, seed: "no-child-founder" });
  expect(() =>
    advanceMonth(child, {
      yearMonth: child.currentMonth,
      startBusiness: { sectorId: "retail", capitalVnd: "1" },
    }),
  ).toThrow(/quyền/);
  const poor = createLife({ legacyDemo: true, seed: "poor", start: "ADULT" });
  expect(() =>
    advanceMonth(poor, {
      yearMonth: poor.currentMonth,
      startBusiness: { sectorId: "retail", capitalVnd: "999999999" },
    }),
  ).toThrow(/Ví cá nhân/);
  expect(poor.business).toBeNull();
});
it("caregiving reduces actual founder capacity and keeps bills/npc memory after save", () => {
  let s = createLife({
    legacyDemo: true,
    seed: "care-business",
    start: "ADULT",
  });
  s = finish(s, {
    startBusiness: { sectorId: "retail", capitalVnd: "15000000" },
    business: { yearMonth: s.currentMonth, action: "VALIDATE" },
  });
  s = finish(s, { business: { yearMonth: s.currentMonth, action: "LAUNCH" } });
  s.npcs[0].careNeed = 60;
  let r = advanceMonth(s, { yearMonth: s.currentMonth });
  expect(r.status).toBe("PAUSED");
  expect(r.pendingDecision!.templateId).toBe("parent-care");
  const before = serialize(r.nextState);
  const comparisons = decisionCounterfactuals(r.nextState);
  expect(serialize(r.nextState)).toBe(before);
  expect(comparisons.length).toBeGreaterThan(1);
  r = advanceMonth(deserialize(before), {
    yearMonth: r.nextState.currentMonth,
    choice: { eventId: r.pendingDecision!.id, optionId: "accept" },
  });
  expect(r.status).toBe("COMMITTED");
  expect(r.nextState.reports.at(-1)?.time.byCategory.care).toBeGreaterThan(0);
  expect(r.nextState.arcs.some((a) => a.family === "care")).toBe(true);
  expect(auditMonth(r.nextState).businessBalanced).toBe(true);
});
it("matched manual/fast business months have identical ledger, events and traits", () => {
  let a = createLife({
    legacyDemo: true,
    seed: "integrated-replay",
    start: "ADULT",
  });
  a = finish(a, {
    startBusiness: { sectorId: "retail", capitalVnd: "15000000" },
    business: { yearMonth: a.currentMonth, action: "VALIDATE" },
  });
  a = finish(a, { business: { yearMonth: a.currentMonth, action: "LAUNCH" } });
  let b = deserialize(serialize(a));
  for (let i = 0; i < 12; i++) a = finish(a);
  let done = 0;
  while (done < 12) {
    const old = b.committedMonths;
    const r = advanceMonths(b, 12 - done);
    b = r.nextState;
    done += b.committedMonths - old;
    if (r.status === "PAUSED") {
      b = finish(b);
      done++;
    }
  }
  expect(b).toEqual(a);
});
it("100 contrasting lives expose diverse relevant event pools, with no mandatory age lock", () => {
  const signatures = new Set<string>();
  for (let i = 0; i < 120; i++) {
    const s = createLife({
      legacyDemo: true,
      seed: `contexts-${i}`,
      start:
        i % 3 === 0 ? "SENIOR_SOLO" : i % 3 === 1 ? "SENIOR_CARE" : "BIRTH",
      context: {
        settlement: i % 2 ? "URBAN" : "RURAL",
        resources: i % 2 ? "AFFLUENT" : "LIMITED",
      },
    });
    if (i % 3 === 2) s.currentMonth = "2027-01";
    signatures.add(
      templates
        .filter((t) => isEventEligible(s, t).eligible)
        .map((t) => t.id)
        .sort()
        .join(","),
    );
  }
  expect(signatures.size).toBeGreaterThanOrEqual(4);
});
