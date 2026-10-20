import { expect, it } from "vitest";
import { createLife } from "../src/simulation/init";
import {
  advanceMonth,
  advanceMonths,
} from "../src/simulation/core/advanceMonth";
import {
  careerRequirements,
  careerFit,
  developCareer,
} from "../src/simulation/careers";
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
it("birth potential varies by seed, is reproducible and survives old-save loading", () => {
  const born = createLife({ seed: "born-a" });
  expect(createLife({ seed: "born-a" }).careerDevelopment.aptitude).toEqual(
    born.careerDevelopment.aptitude,
  );
  const profiles = new Set(
    Array.from({ length: 20 }, (_, i) =>
      JSON.stringify(
        createLife({ seed: `born-${i}` }).careerDevelopment.aptitude,
      ),
    ),
  );
  expect(profiles.size).toBeGreaterThan(10);
  born.engineVersion = "1.3.0-alpha.1";
  born.careerDevelopment.aptitude.ARTIST = 91;
  expect(deserialize(serialize(born)).careerDevelopment.aptitude.ARTIST).toBe(
    91,
  );
});
it("foundation and access to learning change progress without awarding a job", () => {
  const supported = createLife({
    seed: "equal-potential",
    start: "ADULT",
    context: { resources: "AFFLUENT" },
  });
  const struggling = structuredClone(supported);
  supported.careerDevelopment.goal = struggling.careerDevelopment.goal =
    "ARTIST";
  struggling.context.resources = "LIMITED";
  struggling.knowledge = 10;
  struggling.mood = 10;
  developCareer(supported, 2400);
  developCareer(struggling, 2400);
  expect(supported.careerDevelopment.minutes.ARTIST).toBe(
    struggling.careerDevelopment.minutes.ARTIST,
  );
  expect(supported.careerDevelopment.skill.ARTIST).toBeGreaterThan(
    struggling.careerDevelopment.skill.ARTIST,
  );
  expect(careerFit(supported, "ARTIST").readiness).toBeGreaterThan(
    careerFit(struggling, "ARTIST").readiness,
  );
  expect(supported.job?.occupation).toBeUndefined();
});
it("lower inherited potential can still reach a professional audition through practice", () => {
  const s = createLife({ seed: "persistent", start: "ADULT" });
  s.careerDevelopment.goal = "ARTIST";
  s.careerDevelopment.aptitude.ARTIST = 30;
  s.knowledge = 80;
  s.fatigue = 0;
  for (let i = 0; i < 120; i++) developCareer(s, 2400);
  expect(careerRequirements(s, "ARTIST", "TRYOUT")).toEqual([]);
  expect(careerFit(s, "ARTIST").readiness - 4).toBeGreaterThanOrEqual(58);
  expect(s.careerDevelopment.skill.ARTIST).toBeLessThanOrEqual(
    careerFit(s, "ARTIST").potential,
  );
});
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
  s.careerDevelopment.aptitude.ATHLETE = 30;
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
