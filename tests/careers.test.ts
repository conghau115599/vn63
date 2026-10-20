import { expect, it } from "vitest";
import { createLife } from "../src/simulation/init";
import {
  advanceMonth,
  advanceMonths,
} from "../src/simulation/core/advanceMonth";
import { careerRequirements } from "../src/simulation/careers";
import { serialize, deserialize } from "../src/simulation/save";
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
it("good health or musical aptitude alone does not grant a professional job", () => {
  for (const goal of ["ATHLETE", "ARTIST"] as const) {
    const s = createLife({
      seed: "foundation",
      start: "ADULT",
      strength: goal,
    });
    expect(careerRequirements(s, goal, "TRYOUT").length).toBeGreaterThan(0);
    expect(() =>
      advanceMonth(s, {
        yearMonth: s.currentMonth,
        careerPlan: { goal, hours: 10, action: "TRYOUT" },
      }),
    ).toThrow(/Kỹ năng/);
    expect(s.careerDevelopment.minutes[goal]).toBe(0);
  }
});
it("a player can actively reach both professions with a good foundation within 18 months", () => {
  for (const goal of ["ATHLETE", "ARTIST"] as const) {
    let s = createLife({
      seed: `route-${goal}`,
      start: "ADULT",
      strength: goal,
    });
    s.cashVnd = "500000000";
    for (let month = 0; month < 18; month++) {
      const action =
        !s.careerDevelopment.club[goal] &&
        !careerRequirements(s, goal, "JOIN_CLUB").length
          ? "JOIN_CLUB"
          : undefined;
      s = finish(s, { careerPlan: { goal, hours: 10, action } });
    }
    expect(careerRequirements(s, goal, "TRYOUT")).toEqual([]);
    const original = serialize(s);
    let r = advanceMonth(s, {
      yearMonth: s.currentMonth,
      careerPlan: { goal, hours: 10, action: "TRYOUT" },
    });
    expect(r.status).toBe("PAUSED");
    expect(r.pendingDecision!.templateId).toBe("career-contract");
    expect(r.nextState.job?.occupation).toBeUndefined();
    const restored = deserialize(serialize(r.nextState));
    r = advanceMonth(restored, {
      yearMonth: restored.currentMonth,
      choice: { eventId: restored.pendingDecision!.id, optionId: "accept" },
    });
    expect(r.nextState.job?.occupation).toBe(goal);
    expect(r.nextState.job?.startDate).toContain("-12");
    expect(r.nextState.ledger.some((t) => t.source === "wages")).toBe(true);
    expect(serialize(s)).toBe(original);
    expect(deserialize(serialize(r.nextState))).toEqual(r.nextState);
  }
});
it("higher aptitude produces more skill from exactly the same time and seed", () => {
  let strong = createLife({ seed: "same", start: "ADULT", strength: "ARTIST" }),
    normal = createLife({ seed: "same", start: "ADULT" });
  normal.careerDevelopment.skill.ARTIST = strong.careerDevelopment.skill.ARTIST;
  for (let i = 0; i < 6; i++) {
    strong = finish(strong, { careerPlan: { goal: "ARTIST", hours: 8 } });
    normal = finish(normal, { careerPlan: { goal: "ARTIST", hours: 8 } });
  }
  expect(strong.careerDevelopment.minutes.ARTIST).toBe(
    normal.careerDevelopment.minutes.ARTIST,
  );
  expect(strong.careerDevelopment.skill.ARTIST).toBeGreaterThan(
    normal.careerDevelopment.skill.ARTIST,
  );
  expect(strong.reports.at(-1)!.time.usedMinutes).toBe(
    strong.reports.at(-1)!.time.availableMinutes,
  );
});
it("a failed trial explains the score, preserves progress and prevents monthly retry farming", () => {
  const s = createLife({ seed: "retry", start: "ADULT" });
  s.careerDevelopment.skill.ATHLETE = 50;
  s.careerDevelopment.minutes.ATHLETE = 18000;
  s.careerDevelopment.club.ATHLETE = true;
  const next = finish(s, {
    careerPlan: { goal: "ATHLETE", hours: 10, action: "TRYOUT" },
  });
  expect(next.careerDevelopment.trials[0].passed).toBe(false);
  expect(next.careerDevelopment.offer).toBeUndefined();
  expect(next.careerDevelopment.minutes.ATHLETE).toBeGreaterThan(18000);
  expect(careerRequirements(next, "ATHLETE", "TRYOUT")).toContain(
    "Đợt thử lại cách lần trước ít nhất 3 tháng",
  );
  const blocked = structuredClone(s);
  blocked.context.employmentOpportunity = false;
  expect(careerRequirements(blocked, "ATHLETE", "TRYOUT")).toContain(
    "Địa phương hiện chưa có đợt tuyển/nhóm phù hợp",
  );
});
it("uses actual available minutes, protects child agency and preserves fast/save parity", () => {
  const child = createLife({ seed: "child-talent" });
  expect(() =>
    advanceMonth(child, {
      yearMonth: child.currentMonth,
      careerPlan: { goal: "ATHLETE", hours: 20 },
    }),
  ).toThrow(/độ tuổi/);
  expect(careerRequirements(child, "ATHLETE", "TRYOUT")).toContain(
    "Hợp đồng chuyên nghiệp cần đủ 18 tuổi",
  );
  let s = createLife({ seed: "parity-talent", start: "ADULT" });
  s = finish(s, { careerPlan: { goal: "ARTIST", hours: 8 } });
  // Run until first pause, using the same transition in both paths.
  const fast = advanceMonths(deserialize(serialize(s)), 12);
  let manual = s,
    r = advanceMonth(manual, { yearMonth: manual.currentMonth });
  for (let i = 1; i < 12 && r.status === "COMMITTED"; i++) {
    manual = r.nextState;
    r = advanceMonth(manual, { yearMonth: manual.currentMonth });
  }
  expect(r.nextState).toEqual(fast.nextState);
  const old = JSON.parse(serialize(s));
  delete old.careerDevelopment;
  expect(deserialize(JSON.stringify(old)).careerDevelopment.goal).toBe(
    "GENERAL",
  );
});
