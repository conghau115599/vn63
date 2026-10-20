import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { addMonths, daysInMonth } from "../src/simulation/calendar/YearMonth";
import {
  advanceBusinessMonth,
  assertBusinessBooks,
  createBusiness,
  injectOwnerCapital,
} from "../src/simulation/business/advanceBusinessMonth";
import { monthlyBusinessMarket } from "../src/simulation/business/market";
import { resolveSchedule } from "../src/simulation/time/MonthlySchedule";
import type { BusinessState } from "../src/simulation/business/types";
export function active(seed = "business-test", skill = 60): BusinessState {
  let b = createBusiness({
    id: "matched-store",
    ownerId: "owner",
    provinceId: "ha-noi",
    month: "2052-01",
    worldSeed: seed,
    skill,
    retainHistory: false,
  });
  b = injectOwnerCapital(b, "60000000", "2052-01-01", "initial-capital");
  b.status = "ACTIVE";
  b.permitGranted = true;
  b.validatedMonths = 2;
  b.creditApproved = true;
  return b;
}
const context = (b: BusinessState, month: string, hours = 35) => ({
  worldSeed: b.marketSeed,
  mode: "REALISM" as const,
  ownerMinutes: (hours * 60 * daysInMonth(month)) / 7,
});
describe("causal monthly business accounting", () => {
  it('rejects skipped monthly operations and keeps capital transfer receipts without full history',()=>{let b=active();const once=injectOwnerCapital(b,'1000000','2052-01-01','top-up'),again=injectOwnerCapital(once,'1000000','2052-01-01','top-up');expect(again).toEqual(once);b=advanceBusinessMonth(b,{yearMonth:'2052-01'},context(b,'2052-01')).nextState;expect(()=>advanceBusinessMonth(b,{yearMonth:'2052-03'},context(b,'2052-03'))).toThrow(/trung gian/);});
  it("requires validation, pays real setup costs, and preserves pure input", () => {
    let b = createBusiness({
      id: "startup",
      ownerId: "owner",
      provinceId: "ha-noi",
      month: "2052-01",
      worldSeed: "world",
    });
    b = injectOwnerCapital(b, "10000000", "2052-01-01", "capital");
    const before = JSON.stringify(b);
    expect(() =>
      advanceBusinessMonth(
        b,
        { yearMonth: "2052-01", action: "LAUNCH" },
        context(b, "2052-01"),
      ),
    ).toThrow(/kiểm chứng/);
    const validated = advanceBusinessMonth(
      b,
      { yearMonth: "2052-01", action: "VALIDATE" },
      context(b, "2052-01", 4),
    );
    expect(JSON.stringify(b)).toBe(before);
    expect(validated.nextState.status).toBe("VALIDATING");
    expect(validated.nextState.bankCashVnd).toBe("9800000");
    const launch = advanceBusinessMonth(
      validated.nextState,
      { yearMonth: "2052-02", action: "LAUNCH" },
      context(b, "2052-02"),
    );
    expect(launch.nextState.status).toBe("ACTIVE");
    assertBusinessBooks(launch.nextState);
  });
  it("separates profitable unpaid revenue from falling cash and avoids double-charging inventory", () => {
    const b = active();
    b.strategy = {
      ...b.strategy,
      priceVnd: "200000",
      inventoryOrderUnits: 200,
      collectionDelayMonths: 3,
    };
    const r = advanceBusinessMonth(
      b,
      { yearMonth: "2052-01" },
      context(b, "2052-01", 55),
    );
    expect(BigInt(r.report.profitVnd)).toBeGreaterThan(0n);
    expect(BigInt(r.nextState.receivablesVnd)).toBeGreaterThan(0n);
    expect(BigInt(r.nextState.bankCashVnd)).toBeLessThan(BigInt(b.bankCashVnd));
    expect(r.report.cashInVnd).toBe("0");
    expect(
      BigInt(r.nextState.inventoryCostVnd) + BigInt(r.report.cogsVnd),
    ).toBeGreaterThan(0n);
    assertBusinessBooks(r.nextState);
  });
  it("is idempotent after reload, collections and supplier liabilities post once", () => {
    let b = active();
    b.strategy.collectionDelayMonths = 1;
    const first = advanceBusinessMonth(
      b,
      { yearMonth: "2052-01" },
      context(b, "2052-01"),
    );
    const repeat = advanceBusinessMonth(
      JSON.parse(JSON.stringify(first.nextState)),
      { yearMonth: "2052-01" },
      context(b, "2052-01"),
    );
    expect(repeat.nextState).toEqual(first.nextState);
    b = first.nextState;
    const second = advanceBusinessMonth(
      b,
      { yearMonth: "2052-02" },
      context(b, "2052-02"),
    );
    expect(BigInt(second.report.cashInVnd)).toBeGreaterThan(0n);
    assertBusinessBooks(second.nextState);
  });
  it("closed enterprises stop sales and staff accrual while settling prior liabilities", () => {
    let b = active();
    b.employees = [
      {
        id: "staff",
        wageVnd: "3000000",
        hoursPerWeek: 30,
        skill: 60,
        startDate: "2051-01-01",
      },
    ];
    b = advanceBusinessMonth(
      b,
      { yearMonth: "2052-01" },
      context(b, "2052-01"),
    ).nextState;
    const close = advanceBusinessMonth(
      b,
      { yearMonth: "2052-02", action: "CLOSE" },
      context(b, "2052-02", 0),
    );
    expect(close.report.delivered).toBe(0);
    expect(close.nextState.employees[0].endDate).toBe("2052-01-31");
    expect(close.report.expensesVnd).toBe("0");
    expect(close.nextState.status).toBe("CLOSED");
    expect(close.nextState.dueBills.length).toBeLessThanOrEqual(
      b.dueBills.length,
    );
    assertBusinessBooks(close.nextState);
  });
  it("books financing explicitly and rejects unsupported borrowing and withdrawals", () => {
    const b = active();
    b.creditApproved = false;
    expect(() =>
      advanceBusinessMonth(
        b,
        { yearMonth: "2052-01", loanVnd: "1000000" },
        context(b, "2052-01"),
      ),
    ).toThrow(/Khoản vay/);
    expect(() =>
      advanceBusinessMonth(
        b,
        { yearMonth: "2052-01", ownerWithdrawalVnd: "999999999" },
        context(b, "2052-01"),
      ),
    ).toThrow(/rút vốn/);
    const financed = advanceBusinessMonth(
      { ...b, creditApproved: true },
      { yearMonth: "2052-01", loanVnd: "1000000" },
      context(b, "2052-01"),
    );
    expect(financed.nextState.debtVnd).toBe("1000000");
    assertBusinessBooks(financed.nextState);
  });
  it("responds mechanically to a demand shock and does not randomly close the business", () => {
    const b = active();
    const a = advanceBusinessMonth(
      b,
      { yearMonth: "2052-01" },
      { ...context(b, "2052-01", 55), demandOverride: 1 },
    );
    const shock = advanceBusinessMonth(
      b,
      { yearMonth: "2052-01" },
      { ...context(b, "2052-01", 55), demandOverride: 0.7 },
    );
    expect(shock.report.leads).toBeLessThan(a.report.leads);
    expect(shock.nextState.status).toBe("ACTIVE");
    expect(BigInt(shock.report.revenueVnd)).toBeLessThanOrEqual(
      BigInt(a.report.revenueVnd),
    );
  });
  it("owner hours displace 15 hours/week without touching essential sleep", () => {
    const a = resolveSchedule("2052-02", "BALANCED", {
        employed: false,
        businessHoursPerWeek: 40,
      }),
      b = resolveSchedule("2052-02", "BALANCED", {
        employed: false,
        businessHoursPerWeek: 55,
      });
    expect(
      b.days.slice(0, 28).reduce((sum, d) => sum + d.business, 0) -
        a.days.slice(0, 28).reduce((sum, d) => sum + d.business, 0),
    ).toBe(15 * 60 * 4);
    expect(
      Math.abs(
        b.byCategory.business - a.byCategory.business - (15 * 60 * 29) / 7,
      ),
    ).toBeLessThan(1);
    expect(a.byCategory.sleep).toBe(b.byCategory.sleep);
    for (const r of [a, b]) {
      expect(r.usedMinutes).toBe(r.availableMinutes);
      expect(
        r.days.every(
          (d) => Object.values(d).reduce((x, y) => x + y, 0) === 1440,
        ),
      ).toBe(true);
    }
  });
  it("higher skills improve aggregate delivery and profit under matched market seeds, without guaranteed profit", () => {
    let lowProfit = 0n,
      highProfit = 0n,
      highLosses = 0;
    for (let i = 0; i < 120; i++) {
      const low = active(`cohort-${i}`, 10),
        high = active(`cohort-${i}`, 85);
      low.fixedMonthlyCostsVnd = high.fixedMonthlyCostsVnd = "5000000";
      low.strategy.inventoryOrderUnits =
        high.strategy.inventoryOrderUnits = 250;
      const l = advanceBusinessMonth(
          low,
          { yearMonth: "2052-01" },
          context(low, "2052-01", 55),
        ),
        h = advanceBusinessMonth(
          high,
          { yearMonth: "2052-01" },
          context(high, "2052-01", 55),
        );
      expect(h.report.market).toEqual(l.report.market);
      lowProfit += BigInt(l.report.profitVnd);
      highProfit += BigInt(h.report.profitVnd);
      if (BigInt(h.report.profitVnd) < 0n) highLosses++;
    }
    expect(highProfit).toBeGreaterThan(lowProfit);
    expect(highLosses).toBeGreaterThan(0);
  });
  it("keeps world market independent of owner and respects arbitrary feasible integer books", () => {
    const b = active(),
      other = { ...b, id: "another-entity", ownerId: "another-owner" };
    expect(monthlyBusinessMarket(b, "2052-01", context(b, "2052-01"))).toEqual(
      monthlyBusinessMarket(other, "2052-01", context(other, "2052-01")),
    );
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 80 }),
        fc.integer({ min: 0, max: 200 }),
        (hours, stock) => {
          const b = active();
          b.strategy.inventoryOrderUnits = stock;
          const r = advanceBusinessMonth(
            b,
            { yearMonth: "2052-01" },
            context(b, "2052-01", hours),
          );
          assertBusinessBooks(r.nextState);
          expect(
            BigInt(r.report.openingCashVnd) +
              BigInt(r.report.cashInVnd) -
              BigInt(r.report.cashOutVnd),
          ).toBe(BigInt(r.report.closingCashVnd));
          expect(r.report.delivered).toBeLessThanOrEqual(r.report.capacity);
        },
      ),
    );
  });
  it("manual and fast loop produce identical operations for twelve months", () => {
    let a = active(),
      b = JSON.parse(JSON.stringify(a)) as BusinessState;
    for (let i = 0; i < 12; i++) {
      const m = addMonths("2052-01", i);
      a = advanceBusinessMonth(a, { yearMonth: m }, context(a, m)).nextState;
    }
    const run = (s: BusinessState, n: number) => {
      for (let i = 0; i < n; i++) {
        const m = addMonths("2052-01", i);
        s = advanceBusinessMonth(s, { yearMonth: m }, context(s, m)).nextState;
      }
      return s;
    };
    b = run(b, 12);
    expect(b).toEqual(a);
  });
});
