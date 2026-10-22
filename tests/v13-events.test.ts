import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { createLife } from "../src/simulation/init";
import { templates, makeDecision } from "../src/simulation/events";
import {
  inspectEvents,
  isEventEligible,
} from "../src/simulation/events/eligibility";
import {
  initialPersonality,
  evolvePersonality,
  traitNames,
} from "../src/simulation/personality";
import { resolveSchedule } from "../src/simulation/time/MonthlySchedule";
import { advanceMonth } from "../src/simulation/core/advanceMonth";
import { deserialize, serialize } from "../src/simulation/save";
describe("v1.3 contextual stories and traits", () => {
  it("requires real possessions and an unexpired contract, and supports prior-event/arc prerequisites", () => {
    const s = createLife({
        legacyDemo: true,
        seed: "contracts",
        start: "ADULT",
      }),
      bike = templates.find((t) => t.id === "bike-repair")!,
      project = templates.find((t) => t.id === "project")!;
    s.context.flags = s.context.flags.filter((f) => f !== "OWNS_VEHICLE");
    expect(isEventEligible(s, bike).eligible).toBe(false);
    s.job!.endDate = "2052-01-05";
    expect(isEventEligible(s, project).eligible).toBe(false);
    const continuation = {
      ...bike,
      requiredActors: [],
      prerequisites: [
        { kind: "priorEvent" as const, eventId: "course", choiceId: "accept" },
        {
          kind: "arc" as const,
          family: "education" as const,
          status: "COMPLETE" as const,
        },
      ],
    };
    expect(isEventEligible(s, continuation).eligible).toBe(false);
    s.eventMemory.push({
      instanceId: "previous-course",
      eventId: "course",
      month: "2051-10",
      choiceId: "accept",
      contextKey: "old",
      authority: "SELF",
      sourceGrade: "ASSUMPTION",
    });
    s.arcs.push({
      id: "completed-course",
      family: "education",
      stage: "DONE",
      status: "COMPLETE",
    });
    expect(isEventEligible(s, continuation).eligible).toBe(true);
  });
  it("distinguishes age-three rich urban and rural caregiver pools without an age menu", () => {
    const a = createLife({
      legacyDemo: true,
      seed: "three",
      context: { settlement: "URBAN", resources: "AFFLUENT" },
    });
    a.currentMonth = "2027-01";
    const b = {
      ...a,
      context: {
        ...a.context,
        settlement: "RURAL" as const,
        resources: "LIMITED" as const,
      },
    };
    const pool = (s: typeof a) =>
      inspectEvents(s, templates)
        .filter((e) => e.eligible)
        .map((e) => e.eventId);
    expect(pool(a)).not.toEqual(pool(b));
    expect(pool(a)).toContain("early-care");
    expect(pool(b)).toContain("care-routine");
    const d = makeDecision(
      a,
      templates.find((t) => t.id === "early-care")!,
    );
    expect(d.authority).toBe("CAREGIVER");
    expect(JSON.stringify(templates)).not.toContain(
      "PERMANENT_PERSONALITY_LOCK",
    );
  });
  it("does not invent spouse or grandchildren for a widower and explains actor gates", () => {
    const a = createLife({
      legacyDemo: true,
      seed: "old",
      start: "ADULT",
      context: { maritalStatus: "WIDOWED" },
    });
    a.currentMonth = "2099-01";
    a.npcs[0].living = false;
    a.job = null;
    const b = structuredClone(a);
    b.context.maritalStatus = "MARRIED";
    b.npcs.push({
      ...b.npcs[1],
      id: "partner",
      name: "Bạn đời",
      relation: "spouse",
      careNeed: 60,
    });
    const spouse = templates.find((t) => t.id === "spouse-care")!;
    expect(isEventEligible(a, spouse).eligible).toBe(false);
    expect(isEventEligible(b, spouse).eligible).toBe(true);
    expect(
      isEventEligible(
        a,
        templates.find((t) => t.id === "grandchild-care")!,
      ).eligible,
    ).toBe(false);
    expect(
      isEventEligible(a, spouse).reasons.some(
        (r) => r.code === "actor" && !r.eligible,
      ),
    ).toBe(true);
  });
  it("precludes dead actors, enforces cooldown/year boundary and choice cash gates", () => {
    const s = createLife({ legacyDemo: true, seed: "gates", start: "ADULT" }),
      event = templates.find((t) => t.id === "mother-visit")!;
    s.npcs[0].living = false;
    expect(isEventEligible(s, event).eligible).toBe(false);
    s.npcs[0].living = true;
    s.eventHistory[event.id] = { lastMonth: "2051-12", count: 1 };
    expect(
      isEventEligible(s, event).reasons.find((r) => r.code === "cooldown")
        ?.eligible,
    ).toBe(false);
    s.cashVnd = "0";
    expect(
      makeDecision(
        s,
        templates.find((t) => t.id === "course")!,
      ).options[0].disabledReason,
    ).toBeTruthy();
  });
  it("traits drift with observed habits and remain bounded and capped over arbitrary values", () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0, max: 100, noNaN: true }), {
          minLength: 6,
          maxLength: 6,
        }),
        (values) => {
          const s = createLife({
            legacyDemo: true,
            seed: "traits",
            start: "ADULT",
          });
          traitNames.forEach((k, i) => (s.personality.values[k] = values[i]));
          const time = resolveSchedule(s.currentMonth, "STUDY_UPSKILL");
          const next = evolvePersonality(s, time.byCategory);
          for (const k of traitNames) {
            expect(next.values[k]).toBeGreaterThanOrEqual(0);
            expect(next.values[k]).toBeLessThanOrEqual(100);
            expect(Math.abs(next.lastDelta[k])).toBeLessThanOrEqual(0.9);
          }
        },
      ),
    );
    const s = createLife({ legacyDemo: true, seed: "drift", start: "ADULT" });
    const before = initialPersonality();
    s.personality = evolvePersonality(
      s,
      resolveSchedule(s.currentMonth, "STUDY_UPSKILL").byCategory,
    );
    expect(s.personality.values).not.toEqual(before.values);
    expect(s.personality.baseline).toEqual(before.baseline);
  });
  it("keeps work at 75 and never invents a pension", () => {
    let s = createLife({ legacyDemo: true, seed: "old-work", start: "ADULT" });
    s.currentMonth = "2099-01";
    const result = advanceMonth(s, { yearMonth: s.currentMonth });
    expect(result.nextState.job).not.toBeNull();
    expect(result.nextState.context.pensionEligible).toBe(false);
    expect(result.nextState.ledger.some((t) => t.source === "pension")).toBe(
      false,
    );
  });
  it("migrates a real v1.2-shaped monthly save with dates and ledger intact", () => {
    const fresh = createLife({
      legacyDemo: true,
      seed: "migration",
      start: "ADULT",
    });
    const old: Record<string, unknown> = JSON.parse(serialize(fresh));
    old.schemaVersion = 2;
    old.engineVersion = "1.2.0-alpha.1";
    old.eventPackVersion = "monthly-demo-v1";
    for (const k of [
      "context",
      "personality",
      "business",
      "arcs",
      "eventMemory",
      "migrationNotes",
    ])
      delete old[k];
    const next = deserialize(JSON.stringify(old));
    expect(next.schemaVersion).toBe(3);
    expect(next.currentMonth).toBe(fresh.currentMonth);
    expect(next.cashVnd).toBe(fresh.cashVnd);
    expect(next.ledger).toEqual(fresh.ledger);
    expect(next.migrationNotes[0]).toContain("No pension");
    expect(deserialize(serialize(next))).toEqual(next);
  });
});
