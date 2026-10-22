import { addDays, dateInMonth, daysInMonth } from "../calendar/YearMonth";
import { simulationDate } from "../world/contracts";
import { advanceMonth } from "./advanceMonth";
import type { GameState, MonthlyInput, MonthlyResult } from "../types";

/** One tick processes seven real civil dates. A paused tick resumes its original target. */
export function advanceWeek(
  state: GameState,
  choice?: MonthlyInput["choice"],
): MonthlyResult {
  if (!state.living) throw new Error("Cuộc đời đã kết thúc.");
  const targetDate =
    state.weeklyCursor?.targetDate ?? addDays(simulationDate(state), 7);
  let current: GameState = {
    ...state,
    engineVersion: "1.4.0-alpha.1",
    migrationNotes: state.calendarMode
      ? state.migrationNotes
      : [
          ...state.migrationNotes,
          "Chuyển sang nhịp tuần P1: giữ nguyên ngày sinh, số dư, nhật ký, NPC và quyết định cũ; ngày hiện tại suy từ cursor tháng. Bản gốc được sao lưu trên thiết bị trước khi ghi nhịp tuần.",
        ],
    calendarMode: "WEEKLY_V1",
    currentDate: simulationDate(state),
    weeklyCursor: { targetDate },
  };
  let result: MonthlyResult;
  do {
    const last = addDays(targetDate, -1);
    const horizon =
      last.slice(0, 7) === current.currentMonth
        ? +last.slice(8)
        : daysInMonth(current.currentMonth);
    result = advanceMonth(
      current,
      { yearMonth: current.currentMonth, ...(choice ? { choice } : {}) },
      horizon,
    );
    choice = undefined;
    current = result.nextState;
    if (result.status === "PAUSED" || result.status === "DECEASED")
      return result;
  } while (simulationDate(current) < targetDate);
  current = { ...current, weeklyCursor: undefined };
  return { ...result, nextState: current, status: "IN_PROGRESS" };
}
export function advanceWeeks(state: GameState, count = 1): MonthlyResult {
  if (!Number.isInteger(count) || count < 1 || count > 520)
    throw new Error("Mỗi đợt chạy 1–520 tuần.");
  let current = state,
    result: MonthlyResult;
  for (let i = 0; i < count; i++) {
    result = advanceWeek(current);
    current = result.nextState;
    if (result.status === "PAUSED" || result.status === "DECEASED")
      return result;
  }
  return result!;
}
