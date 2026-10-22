import { daysInMonth, dateInMonth, weekday } from "../calendar/YearMonth";
export const categories = [
  "sleep",
  "work",
  "business",
  "practice",
  "commute",
  "household",
  "care",
  "family",
  "friends",
  "exercise",
  "study",
  "rest",
] as const;
export type Category = (typeof categories)[number];
export type Allocation = Record<Category, number>;
export type Policy =
  "BALANCED" | "CAREER_SPRINT" | "FAMILY_FIRST" | "STUDY_UPSKILL";
export const schedules: Record<Policy, Allocation> = {
  BALANCED: {
    practice: 0,
    business: 0,
    sleep: 56,
    work: 40,
    commute: 7,
    household: 30,
    care: 0,
    family: 12,
    friends: 5,
    exercise: 5,
    study: 5,
    rest: 8,
  },
  CAREER_SPRINT: {
    practice: 0,
    business: 0,
    sleep: 56,
    work: 55,
    commute: 7,
    household: 30,
    care: 0,
    family: 5,
    friends: 5,
    exercise: 2,
    study: 4,
    rest: 4,
  },
  FAMILY_FIRST: {
    practice: 0,
    business: 0,
    sleep: 56,
    work: 35,
    commute: 7,
    household: 30,
    care: 7,
    family: 17,
    friends: 3,
    exercise: 5,
    study: 2,
    rest: 6,
  },
  STUDY_UPSKILL: {
    practice: 0,
    business: 0,
    sleep: 56,
    work: 35,
    commute: 7,
    household: 30,
    care: 0,
    family: 10,
    friends: 3,
    exercise: 5,
    study: 16,
    rest: 6,
  },
};
export type Obligation = {
  id: string;
  date: string;
  minutes: number;
  category: Category;
};
export type TimeReport = {
  availableMinutes: number;
  usedMinutes: number;
  byCategory: Allocation;
  displacedMinutes: number;
  displaced: Array<{ id: string; category: Category; minutes: number }>;
  infeasible: boolean;
  days: Array<Allocation>;
};
const empty = (): Allocation =>
  Object.fromEntries(categories.map((k) => [k, 0])) as Allocation;
const scheduleCache = new Map<string, TimeReport>();
const copyReport = (r: TimeReport): TimeReport => ({
  ...r,
  byCategory: { ...r.byCategory },
  days: r.days.map((d) => ({ ...d })),
  displaced: r.displaced.map((d) => ({ ...d })),
});
export function resolveSchedule(
  month: string,
  policy: Policy,
  options: {
    age?: number;
    employed?: boolean;
    obligations?: Obligation[];
    weeklyCalendar?: Allocation[];
    businessHoursPerWeek?: number;
    practiceHoursPerWeek?: number;
  } = {},
): TimeReport {
  const n = daysInMonth(month),
    weekly = { ...schedules[policy] };
  const cacheable =
    !options.weeklyCalendar &&
    !options.obligations?.length &&
    !options.businessHoursPerWeek;
  const hasPractice = !!options.practiceHoursPerWeek;
  const cacheKey = `${policy}/${(options.age ?? 28) < 5 ? "infant" : (options.age ?? 28) < 18 ? "child" : "adult"}/${options.employed === false}/${n}/${weekday(dateInMonth(month, 1))}`;
  if (cacheable && !hasPractice && scheduleCache.has(cacheKey))
    return copyReport(scheduleCache.get(cacheKey)!);
  if ((options.age ?? 28) < 5) {
    for (const k of categories) weekly[k] = 0;
    Object.assign(weekly, {
      sleep: 84,
      care: 21,
      family: 21,
      household: 21,
      rest: 21,
    });
  } else if ((options.age ?? 28) < 18) {
    weekly.study += weekly.work;
    weekly.work = 0;
    weekly.rest += weekly.commute;
    weekly.commute = 0;
  } else if (options.employed === false) {
    weekly.rest += weekly.work + weekly.commute;
    weekly.work = weekly.commute = 0;
  }
  const byCategory = empty(),
    days: Allocation[] = [],
    displaced: TimeReport["displaced"] = [];
  const averageWeek: Allocation[] = [],
    assigned = empty();
  for (let i = 0; i < 7; i++) {
    const daily = empty(),
      rank = categories.map((k) => ({
        k,
        exact: (weekly[k] * 60 - assigned[k]) / (7 - i),
      }));
    for (const v of rank) daily[v.k] = Math.floor(v.exact);
    const left = 1440 - Object.values(daily).reduce((a, b) => a + b, 0);
    rank.sort(
      (a, b) =>
        b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)) ||
        categories.indexOf(a.k) - categories.indexOf(b.k),
    );
    for (let j = 0; j < left; j++) daily[rank[j].k]++;
    for (const k of categories) assigned[k] += daily[k];
    averageWeek.push(daily);
  }
  let infeasible = false;
  if (options.weeklyCalendar && options.weeklyCalendar.length !== 7)
    throw new Error("Lịch tuần cần 7 ngày.");
  for (let d = 1; d <= n; d++) {
    let daily: Allocation;
    if (options.weeklyCalendar)
      daily = { ...options.weeklyCalendar[weekday(dateInMonth(month, d))] };
    else {
      // Average-week policy, integer-minute apportionment; every complete week is exact.
      daily = { ...averageWeek[weekday(dateInMonth(month, d))] };
    }
    if (
      categories.some((k) => !Number.isInteger(daily[k]) || daily[k] < 0) ||
      Object.values(daily).reduce((a, b) => a + b, 0) > 1440
    )
      infeasible = true;
    days.push(daily);
  }
  const ids = new Set<string>();
  const businessHours = options.businessHoursPerWeek ?? 0;
  if (
    !Number.isFinite(businessHours) ||
    businessHours < 0 ||
    businessHours > 80
  )
    throw new Error("Giờ kinh doanh không hợp lệ.");
  const businessObligations: Obligation[] = businessHours
    ? days.map((_, i) => {
        const date = dateInMonth(month, i + 1),
          wd = weekday(date);
        return {
          id: `business/${date}`,
          date,
          category: "business",
          minutes:
            Math.floor((businessHours * 60 * (wd + 1)) / 7) -
            Math.floor((businessHours * 60 * wd) / 7),
        };
      })
    : [];
  const practiceHours = options.practiceHoursPerWeek ?? 0;
  if (
    !Number.isFinite(practiceHours) ||
    practiceHours < 0 ||
    practiceHours > 20
  )
    throw new Error("Giờ luyện tập không hợp lệ.");
  const practiceObligations: Obligation[] = practiceHours
    ? days.map((_, i) => {
        const date = dateInMonth(month, i + 1),
          wd = weekday(date);
        return {
          id: `practice/${date}`,
          date,
          category: "practice",
          minutes:
            Math.floor((practiceHours * 60 * (wd + 1)) / 7) -
            Math.floor((practiceHours * 60 * wd) / 7),
        };
      })
    : [];
  for (const o of [
    ...businessObligations,
    ...practiceObligations,
    ...(options.obligations ?? []),
  ]) {
    if (ids.has(o.id)) throw new Error("Nghĩa vụ có ID trùng.");
    ids.add(o.id);
    if (
      !Number.isInteger(o.minutes) ||
      o.minutes < 0 ||
      !categories.includes(o.category)
    )
      throw new Error("Nghĩa vụ không hợp lệ.");
    if (o.date.slice(0, 7) !== month) continue;
    const day = +o.date.slice(8);
    if (day < 1 || day > n || dateInMonth(month, day) !== o.date)
      throw new Error("Ngày nghĩa vụ không hợp lệ.");
    const daily = days[day - 1];
    let remaining = o.minutes;
    const free = 1440 - Object.values(daily).reduce((a, b) => a + b, 0);
    remaining -= Math.min(Math.max(0, free), remaining);
    for (const k of [
      "rest",
      "friends",
      "family",
      "exercise",
      "study",
      "business",
      "practice",
    ] as Category[]) {
      if (k === o.category) continue;
      const take = Math.min(daily[k], remaining);
      daily[k] -= take;
      remaining -= take;
      if (take) displaced.push({ id: o.id, category: k, minutes: take });
    }
    if (remaining > 0) infeasible = true;
    daily[o.category] += o.minutes - remaining;
  }
  for (const daily of days)
    for (const k of categories) byCategory[k] += daily[k];
  const report = {
    availableMinutes: n * 1440,
    usedMinutes: Object.values(byCategory).reduce((a, b) => a + b, 0),
    byCategory,
    days,
    displaced,
    displacedMinutes: displaced.reduce((a, b) => a + b.minutes, 0),
    infeasible,
  };
  if (cacheable && !hasPractice && scheduleCache.size < 512)
    scheduleCache.set(cacheKey, copyReport(report));
  return report;
}
