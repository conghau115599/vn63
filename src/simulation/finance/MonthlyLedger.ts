import type { GameState } from "../types";
export function amount(value: string): bigint {
  if (!/^(0|[1-9]\d{0,29})$/.test(value))
    throw new Error("Số tiền VND không hợp lệ.");
  return BigInt(value);
}
export const roundedRatio = (v: bigint, n: bigint, d: bigint) =>
  (v * n + d / 2n) / d;
/** Monthly bps are explicit sandbox contract terms, not a nominal annual rate / 12. */
export const interestVnd = (
  principal: string,
  monthlyRateBps: number,
): string => {
  if (
    !Number.isInteger(monthlyRateBps) ||
    monthlyRateBps < 0 ||
    monthlyRateBps > 10000
  )
    throw new Error("Lãi suất không hợp lệ.");
  return roundedRatio(
    amount(principal),
    BigInt(monthlyRateBps),
    10000n,
  ).toString();
};
export function post(
  state: GameState,
  id: string,
  date: string,
  source: string,
  direction: "IN" | "OUT",
  requested: bigint,
): bigint {
  const c = state.cursor;
  if (!c) throw new Error("Chưa mở kỳ.");
  if (requested < 0n) throw new Error("Bút toán âm.");
  if (c.processedIds.includes(id)) return 0n;
  c.processedIds.push(id);
  const cash = amount(state.cashVnd),
    actual = direction === "OUT" && cash < requested ? cash : requested;
  state.cashVnd = (
    direction === "IN" ? cash + actual : cash - actual
  ).toString();
  if (direction === "IN")
    c.inflowVnd = (amount(c.inflowVnd) + actual).toString();
  else c.outflowVnd = (amount(c.outflowVnd) + actual).toString();
  if (state.retainHistory)
    state.ledger.push({
      id,
      date,
      source,
      direction,
      amountVnd: actual.toString(),
    });
  return actual;
}
export function charge(
  state: GameState,
  id: string,
  date: string,
  source: string,
  requested: bigint,
) {
  if (state.cursor!.processedIds.includes(id)) return;
  const actual = post(state, id, date, source, "OUT", requested),
    short = requested - actual;
  if (short > 0n) {
    const debtId = `arrears:${source}`;
    let d = state.debts.find((d) => d.id === debtId);
    if (!d) {
      d = {
        id: debtId,
        principalVnd: "0",
        monthlyRateBps: 0,
        paymentVnd: "200000",
        dueDay: 28,
        arrearsVnd: "0",
      };
      state.debts.push(d);
    }
    d.principalVnd = (amount(d.principalVnd) + short).toString();
    d.arrearsVnd = (amount(d.arrearsVnd) + short).toString();
  }
}
