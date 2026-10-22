import { ageOn } from "./calendar/YearMonth";
import { simulationDate } from "./world/contracts";
import { categories, type Category } from "./time/MonthlySchedule";
import type { GameState } from "./types";
export const activities = [
  { id: "PLAY", label: "Chơi cùng người thân", category: "family", minAge: 5 },
  { id: "READ", label: "Đọc sách, truyện", category: "study", minAge: 5 },
  { id: "MOVE", label: "Vận động vừa sức", category: "exercise", minAge: 5 },
  {
    id: "HELP",
    label: "Phụ việc nhà vừa sức",
    category: "household",
    minAge: 5,
  },
  {
    id: "STUDY",
    label: "Dành thời gian học thêm",
    category: "study",
    minAge: 12,
  },
  { id: "REST", label: "Nghỉ ngơi, hồi phục", category: "rest", minAge: 5 },
] as const;
export function availableActivities(s: GameState) {
  const age = ageOn(s.birthDate, simulationDate(s));
  return s.living
    ? activities
        .filter(
          (a) =>
            age >= a.minAge &&
            (a.id !== "MOVE" || s.health >= 25) &&
            (a.id !== "HELP" ||
              s.npcs.some((n) => n.living && n.birthDate <= simulationDate(s))),
        )
        .map((a) => ({
          ...a,
          label:
            a.id === "READ" && s.context.resources === "LIMITED"
              ? "Đọc sách mượn, học cùng người thân"
              : a.label,
        }))
    : [];
}
/** Reallocate only unprocessed days; sleep, work and binding obligations stay protected. */
export function applyActivityToSchedule(s: GameState, fromDay: number) {
  if (!s.cursor || !s.activity) return;
  const activity = activities.find((a) => a.id === s.activity)!;
  for (let i = fromDay - 1; i < s.cursor.time.days.length; i++) {
    const day = s.cursor.time.days[i];
    if (
      ageOn(
        s.birthDate,
        `${s.currentMonth}-${String(i + 1).padStart(2, "0")}`,
      ) < activity.minAge
    )
      continue;
    // Four hours per week on top of the baseline; protect all previously assigned duty minutes.
    const wanted = Math.floor((240 * (i + 1)) / 7) - Math.floor((240 * i) / 7);
    const source: Category = activity.category === "rest" ? "friends" : "rest";
    const moved = Math.min(day[source], wanted);
    day[source] -= moved;
    day[activity.category] += moved;
  }
  for (const key of categories)
    s.cursor.time.byCategory[key] = s.cursor.time.days.reduce(
      (sum, d) => sum + d[key],
      0,
    );
}
export function chooseActivity(
  state: GameState,
  id: NonNullable<GameState["activity"]>,
): GameState {
  if (state.pendingDecision)
    throw new Error("Hãy giải quyết tình huống đang chờ trước.");
  if (!availableActivities(state).some((a) => a.id === id))
    throw new Error("Hoạt động chưa phù hợp độ tuổi hoặc hoàn cảnh.");
  // Changes take effect next month if that month's schedule has already started, avoiding double allocation.
  return { ...state, activity: id };
}
