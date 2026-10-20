import type { GameState } from "./types";
import { advanceMonth } from "./core/advanceMonth";
import { assertBusinessBooks } from "./business/advanceBusinessMonth";
export function auditMonth(state: GameState) {
  const report = state.reports.at(-1),
    cursor = state.cursor;
  const opening =
      cursor?.openingCashVnd ?? report?.cashOpenVnd ?? state.cashVnd,
    inflow = cursor?.inflowVnd ?? report?.inflowVnd ?? "0",
    outflow = cursor?.outflowVnd ?? report?.outflowVnd ?? "0";
  const cashBalanced =
    BigInt(opening) + BigInt(inflow) - BigInt(outflow) ===
    BigInt(state.cashVnd);
  const uniquePersonalIds =
    new Set(state.ledger.map((e) => e.id)).size === state.ledger.length;
  let businessBalanced = true;
  try {
    if (state.business) assertBusinessBooks(state.business);
  } catch {
    businessBalanced = false;
  }
  return {
    month: state.currentMonth,
    phase: cursor ? "PENDING" : "COMMITTED",
    cashBalanced,
    uniquePersonalIds,
    businessBalanced,
    openingVnd: opening,
    inflowVnd: inflow,
    outflowVnd: outflow,
    closingVnd: state.cashVnd,
    sourceGrade: "ASSUMPTION",
  };
}
/** Hypothetical model branches only, never committed to the active life. */
export function decisionCounterfactuals(state: GameState) {
  if (!state.pendingDecision) return [];
  return state.pendingDecision.options.map((option) => {
    try {
      const r = advanceMonth(state, {
        yearMonth: state.currentMonth,
        choice: { eventId: state.pendingDecision!.id, optionId: option.id },
      });
      return {
        optionId: option.id,
        label: option.label,
        cashCloseVnd: r.nextState.cashVnd,
        businessProfitVnd:
          r.nextState.business?.reports.at(-1)?.profitVnd ?? null,
        status: r.status,
        note: "Kịch bản mô hình cùng seed; không phải dự báo hay cam kết ngoài đời.",
      };
    } catch (error) {
      return {
        optionId: option.id,
        label: option.label,
        error: (error as Error).message,
      };
    }
  });
}
