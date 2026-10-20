import { random } from "../rng";
import { amount, roundedRatio } from "../finance/MonthlyLedger";
import type { GameState } from "../types";
import { businessBookValue } from "../business/advanceBusinessMonth";
export const assets = {
  fund: { name: "Quỹ đa dạng hóa mô phỏng", settlementMonths: 1 },
  gold: { name: "Vàng mô phỏng", settlementMonths: 0 },
  business: { name: "Góp vốn kinh doanh", settlementMonths: 6 },
};
export function updateMarket(s: GameState) {
  const r = random(s.world.seed, "regime", s.currentMonth);
  s.world.regime = r < 0.2 ? "DOWNTURN" : r < 0.4 ? "VOLATILE" : "GROWTH";
  for (const id of Object.keys(assets)) {
    const shock =
      Math.floor(random(s.world.seed, `market:${id}`, s.currentMonth) * 1801) -
      900;
    const drift = s.world.regime === "DOWNTURN" ? -180 : 60;
    s.world.prices[id] = roundedRatio(
      amount(s.world.prices[id]),
      BigInt(10000 + shock + drift),
      10000n,
    ).toString();
  }
  s.world.cpiBasisPoints = Math.round(s.world.cpiBasisPoints * 1.002);
}
export function portfolioValue(s: GameState): bigint {
  return s.holdings.reduce(
    (sum, h) => sum + amount(s.world.prices[h.assetId]) * amount(h.quantity),
    0n,
  );
}
export const netWorth = (s: GameState) =>
  amount(s.cashVnd) +
  amount(s.wageReceivableVnd) +
  (s.business ? businessBookValue(s.business) : 0n) +
  portfolioValue(s) -
  s.debts.reduce((a, d) => a + amount(d.principalVnd), 0n);
