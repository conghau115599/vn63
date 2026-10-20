import { ageOn, monthsBetween } from "./calendar/YearMonth";
import { random } from "./rng";
import type { GameState } from "./types";
export type Talent = "ATHLETE" | "ARTIST";
export type CareerPlan = {
  goal: "GENERAL" | Talent;
  hours: number;
  action?: "JOIN_CLUB" | "TRYOUT";
};
export type CareerDevelopment = {
  version: "talent-careers-v1";
  sourceGrade: "ASSUMPTION";
  goal: CareerPlan["goal"];
  hours: number;
  aptitude: Record<Talent, number>;
  skill: Record<Talent, number>;
  minutes: Record<Talent, number>;
  club: Record<Talent, boolean>;
  portfolio: number;
  trials: Array<{
    month: string;
    goal: Talent;
    score: number;
    passed: boolean;
  }>;
  offer?: { goal: Talent; salaryVnd: string; month: string };
};
/** All thresholds and salaries are gameplay assumptions, not labour-market estimates. */
export function initialCareer(
  adult = false,
  strength: "GENERAL" | Talent = "GENERAL",
  seed?: string,
): CareerDevelopment {
  const born = (goal: Talent) =>
    seed === undefined
      ? strength === goal
        ? 85
        : 60
      : strength === goal
        ? 85 + Math.floor(random(seed, "born-aptitude", goal) * 11)
        : 30 + Math.floor(random(seed, "born-aptitude", goal) * 51);
  return {
    version: "talent-careers-v1",
    sourceGrade: "ASSUMPTION",
    goal: "GENERAL",
    hours: 0,
    aptitude: {
      ATHLETE: born("ATHLETE"),
      ARTIST: born("ARTIST"),
    },
    skill: {
      ATHLETE: adult ? (strength === "ATHLETE" ? 35 : 20) : 5,
      ARTIST: adult ? (strength === "ARTIST" ? 35 : 20) : 5,
    },
    minutes: { ATHLETE: 0, ARTIST: 0 },
    club: { ATHLETE: false, ARTIST: false },
    portfolio: 0,
    trials: [],
  };
}
export const practiceLimit = (age: number) =>
  age < 6 ? 3 : age < 14 ? 8 : age < 18 ? 12 : 20;

/** Fictional inherited potential and current foundation, never a real genetic assessment. */
export function careerFit(s: GameState, goal: Talent) {
  const c = s.careerDevelopment;
  const foundation =
    goal === "ATHLETE"
      ? s.health * 0.8 + (100 - s.fatigue) * 0.2
      : s.knowledge * 0.55 + s.mood * 0.25 + (100 - s.fatigue) * 0.2;
  const support =
    s.context.resources === "AFFLUENT"
      ? 1.1
      : s.context.resources === "LIMITED"
        ? 0.9
        : 1;
  const potential = 65 + c.aptitude[goal] * 0.35;
  const readiness =
    c.skill[goal] * 0.6 +
    c.aptitude[goal] * 0.15 +
    Math.min(100, c.minutes[goal] / 360) * 0.13 +
    foundation * 0.12 -
    s.fatigue * 0.05;
  return { foundation, support, potential, readiness };
}
export function careerRequirements(
  s: GameState,
  goal: Talent,
  action: "JOIN_CLUB" | "TRYOUT",
): string[] {
  const c = s.careerDevelopment,
    age = ageOn(s.birthDate, `${s.currentMonth}-01`),
    reasons: string[] = [];
  if (age < (action === "JOIN_CLUB" ? 6 : 18))
    reasons.push(
      action === "JOIN_CLUB"
        ? "Cần đủ 6 tuổi"
        : "Hợp đồng chuyên nghiệp cần đủ 18 tuổi",
    );
  if (!s.context.employmentOpportunity)
    reasons.push("Địa phương hiện chưa có đợt tuyển/nhóm phù hợp");
  if (c.skill[goal] < (action === "JOIN_CLUB" ? 30 : 50))
    reasons.push(`Kỹ năng cần đạt ${action === "JOIN_CLUB" ? 30 : 50}/100`);
  if (c.minutes[goal] < (action === "JOIN_CLUB" ? 80 : 300) * 60)
    reasons.push(
      `Cần tích lũy ${action === "JOIN_CLUB" ? 80 : 300} giờ luyện tập`,
    );
  if (action === "JOIN_CLUB" && c.club[goal])
    reasons.push("Đã tham gia câu lạc bộ");
  if (action === "TRYOUT") {
    if (goal === "ATHLETE" && !c.club.ATHLETE)
      reasons.push("Cần tham gia câu lạc bộ thể thao");
    if (goal === "ARTIST" && c.portfolio < 20)
      reasons.push("Hồ sơ biểu diễn cần đạt 20 điểm");
    if (goal === "ATHLETE" && s.health < 60)
      reasons.push("Sức khỏe cần đạt 60/100");
    const last = c.trials.filter((t) => t.goal === goal).at(-1);
    if (last && monthsBetween(last.month, s.currentMonth) < 3)
      reasons.push("Đợt thử lại cách lần trước ít nhất 3 tháng");
    if (s.job?.occupation === goal) reasons.push("Đang có hợp đồng nghề này");
  }
  return reasons;
}
export function prepareCareer(s: GameState, plan?: CareerPlan) {
  if (!plan) return;
  const c = s.careerDevelopment,
    age = ageOn(s.birthDate, `${s.currentMonth}-01`);
  if (
    !["GENERAL", "ATHLETE", "ARTIST"].includes(plan.goal) ||
    !Number.isInteger(plan.hours) ||
    plan.hours < 0 ||
    plan.hours > practiceLimit(age)
  )
    throw new Error("Giờ luyện tập không phù hợp độ tuổi.");
  c.goal = plan.goal;
  c.hours = plan.goal === "GENERAL" ? 0 : plan.hours;
  if (!plan.action) return;
  if (plan.goal === "GENERAL") throw new Error("Chọn một hướng nghề trước.");
  const reasons = careerRequirements(s, plan.goal, plan.action);
  if (reasons.length) throw new Error(reasons.join("; "));
  if (plan.action === "JOIN_CLUB") c.club[plan.goal] = true;
  else {
    // Practice itself supplies the evidence; a small seeded variation cannot erase strong preparation.
    const score =
      careerFit(s, plan.goal).readiness +
      (random(s.seed, "career-trial", `${s.currentMonth}/${plan.goal}`) - 0.5) *
        8;
    const passed = score >= 58;
    c.trials.push({ month: s.currentMonth, goal: plan.goal, score, passed });
    if (passed)
      c.offer = {
        goal: plan.goal,
        salaryVnd: plan.goal === "ATHLETE" ? "8000000" : "7000000",
        month: s.currentMonth,
      };
  }
}
export function developCareer(s: GameState, minutes: number) {
  const c = s.careerDevelopment;
  if (c.goal === "GENERAL") return;
  const goal = c.goal,
    hours = minutes / 60,
    fit = careerFit(s, goal);
  c.minutes[goal] += minutes;
  const recovery =
    Math.max(0.25, 1 - s.fatigue / 130) *
    (goal === "ATHLETE" ? 0.5 + s.health / 200 : 1);
  c.skill[goal] = Math.min(
    Math.max(c.skill[goal], fit.potential),
    c.skill[goal] +
      Math.min(
        5,
        (hours / 16) *
          (0.5 + c.aptitude[goal] / 100) *
          Math.max(0, 1 - c.skill[goal] / fit.potential) *
          (0.65 + fit.foundation / 200) *
          fit.support *
          recovery *
          (c.club[goal] ? 1.08 : 1),
      ),
  );
  if (goal === "ARTIST")
    c.portfolio += (hours / 8) * (0.4 + c.skill.ARTIST / 200);
}
