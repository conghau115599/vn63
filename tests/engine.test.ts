import { describe, expect, it } from "vitest";
import { createLife } from "../src/simulation/init";
import {
  advanceMonth,
  advanceMonths,
} from "../src/simulation/core/advanceMonth";
import { eventForMonth } from "../src/simulation/events";
import {
  deserialize,
  serialize,
  MigrationRequiredError,
} from "../src/simulation/save";
import { interestVnd } from "../src/simulation/finance/MonthlyLedger";
import { monthsBetween } from "../src/simulation/calendar/YearMonth";
import type { GameState } from "../src/simulation/types";
function ordinary() {
  for (let i = 0; i < 100; i++) {
    const s = createLife({
      legacyDemo: true,
      seed: `ordinary-${i}`,
      start: "ADULT",
    });
    if (!eventForMonth(s)) return s;
  }
  throw new Error("no ordinary seed");
}
function decision(kind?: string) {
  for (let i = 0; i < 2000; i++) {
    const s = createLife({
      legacyDemo: true,
      seed: `decision-${i}`,
      start: "ADULT",
    });
    const e = eventForMonth(s);
    if (e && (!kind || e.kind === kind)) return s;
  }
  throw new Error("no decision seed");
}
function finish(s: GameState) {
  let r = advanceMonth(s, { yearMonth: s.currentMonth });
  while (r.status === "PAUSED")
    r = advanceMonth(r.nextState, {
      yearMonth: r.nextState.currentMonth,
      choice: { eventId: r.pendingDecision!.id, optionId: "decline" },
    });
  return r.nextState;
}
describe("monthly transaction engine", () => {
  it("is pure and balances actual cash without converting market marks into cash", () => {
    const s = ordinary(),
      before = serialize(s),
      r = advanceMonth(s, { yearMonth: s.currentMonth });
    expect(serialize(s)).toBe(before);
    expect(r.status).toBe("COMMITTED");
    expect(
      BigInt(r.money.cashOpenVnd) +
        BigInt(r.money.inflowVnd) -
        BigInt(r.money.outflowVnd),
    ).toBe(BigInt(r.money.cashCloseVnd));
    expect(r.nextState.world.prices).not.toEqual(s.world.prices);
    expect(r.nextState.ledger.some((t) => t.source.startsWith("market"))).toBe(
      false,
    );
    expect(new Set(r.nextState.ledger.map((t) => t.id)).size).toBe(
      r.nextState.ledger.length,
    );
  });
  it("fast-forward equals manual and all UI speeds encounter the same decision", () => {
    let a = createLife({ legacyDemo: true, seed: "manual", start: "ADULT" }),
      b = a;
    for (let i = 0; i < 60; i++) a = finish(a);
    for (let i = 0; i < 5; i++) {
      let committed = 0;
      while (committed < 12) {
        const previous = b.committedMonths;
        const r = advanceMonths(b, 12 - committed);
        b = r.nextState;
        committed += b.committedMonths - previous;
        if (r.status === "PAUSED") {
          b = advanceMonth(b, {
            yearMonth: b.currentMonth,
            choice: { eventId: b.pendingDecision!.id, optionId: "decline" },
          }).nextState;
          committed++;
        }
      }
    }
    expect(b).toEqual(a);
  });
  it("pauses at a dated decision, persists intermediate balance, resumes exactly once", () => {
    const s = decision(),
      r = advanceMonth(s, { yearMonth: s.currentMonth });
    expect(r.status).toBe("PAUSED");
    expect(r.committedMonth).toBeUndefined();
    const paused = deserialize(serialize(r.nextState));
    expect(
      advanceMonth(paused, { yearMonth: paused.currentMonth }).nextState,
    ).toEqual(paused);
    const x = advanceMonth(paused, {
      yearMonth: paused.currentMonth,
      choice: { eventId: paused.pendingDecision!.id, optionId: "decline" },
    });
    expect(x.status).toBe("COMMITTED");
    expect(x.nextState.committedMonths).toBe(1);
    expect(
      advanceMonth(r.nextState, {
        yearMonth: s.currentMonth,
        choice: { eventId: r.pendingDecision!.id, optionId: "decline" },
      }),
    ).toEqual(x);
    expect(() =>
      advanceMonth(x.nextState, { yearMonth: s.currentMonth }),
    ).toThrow();
  });
  it("does not invent overtime pay", () => {
    const s = ordinary();
    const normal = advanceMonth(s, { yearMonth: s.currentMonth });
    const heavy = advanceMonth(
      { ...s, policy: "CAREER_SPRINT" },
      { yearMonth: s.currentMonth },
    );
    expect(heavy.money.inflowVnd).toBe(normal.money.inflowVnd);
    const paid = advanceMonth(
      { ...s, policy: "CAREER_SPRINT", job: { ...s.job!, paidOvertime: true } },
      { yearMonth: s.currentMonth },
    );
    expect(BigInt(paid.money.inflowVnd)).toBeGreaterThan(
      BigInt(normal.money.inflowVnd),
    );
  });
  it("caps debt, records arrears, never creates negative cash, uses integer interest", () => {
    const s = ordinary();
    s.cashVnd = "0";
    s.job = null;
    const x = finish(s);
    expect(BigInt(x.cashVnd)).toBeGreaterThanOrEqual(0n);
    expect(x.debts.some((d) => d.id.startsWith("arrears"))).toBe(true);
    expect(x.debts.every((d) => BigInt(d.principalVnd) >= 0n)).toBe(true);
    expect(interestVnd("0", 60)).toBe("0");
    expect(interestVnd("12000000", 60)).toBe("72000");
  });
  it("stops transactions on midmonth death and pays only accrued earnings", () => {
    const s = ordinary();
    s.deathLimitMonths = monthsBetween(s.birthDate.slice(0, 7), s.currentMonth);
    const r = advanceMonth(s, { yearMonth: s.currentMonth });
    expect(r.status).toBe("DECEASED");
    expect(r.nextState.deathDate).toBe(`${s.currentMonth}-15`);
    expect(
      r.nextState.ledger.every((t) => t.date <= r.nextState.deathDate!),
    ).toBe(true);
    expect(BigInt(r.money.inflowVnd)).toBeLessThan(BigInt(s.job!.salaryVnd));
    expect(r.nextState.reports[0].time.usedMinutes).toBe(15 * 1440);
    expect(() =>
      advanceMonth(r.nextState, { yearMonth: s.currentMonth }),
    ).toThrow();
  });
  it("obeys liquidity, orders are actual cashflows, rejects child orders", () => {
    const s = ordinary();
    const buy = advanceMonth(s, {
      yearMonth: s.currentMonth,
      investmentOrders: [
        { orderId: "a", assetId: "business", side: "BUY", quantity: "1" },
      ],
    });
    expect(buy.nextState.holdings[0].availableFrom).toBe("2052-07");
    expect(() =>
      advanceMonth(buy.nextState, {
        yearMonth: buy.nextState.currentMonth,
        investmentOrders: [
          { orderId: "b", assetId: "business", side: "SELL", quantity: "1" },
        ],
      }),
    ).toThrow(/thanh khoản/);
    const child = createLife({ legacyDemo: true, seed: "child" });
    expect(() =>
      advanceMonth(child, {
        yearMonth: child.currentMonth,
        investmentOrders: [
          { orderId: "x", assetId: "fund", side: "BUY", quantity: "1" },
        ],
      }),
    ).toThrow(/Trẻ em/);
  });
  it("remembers missed promises and gifts cannot increase trust", () => {
    let s = ordinary();
    s.policy = "CAREER_SPRINT";
    s.npcs[0].promises.push({
      id: "visit",
      dueMonth: s.currentMonth,
      minutes: 99999,
      status: "PENDING",
    });
    const before = s.npcs[0].trust;
    s = advanceMonth(s, {
      yearMonth: s.currentMonth,
      giftNpcId: "mother",
    }).nextState;
    expect(s.npcs[0].trust).toBe(before - 4);
    expect(s.npcs[0].promises[0].status).toBe("MISSED");
    expect(s.npcs[0].memories.length).toBe(1);
    expect(deserialize(serialize(s)).npcs[0].memories).toEqual(
      s.npcs[0].memories,
    );
  });
  it("applies delayed consequences once across December and save/load", () => {
    let s = ordinary();
    s.currentMonth = "2052-12";
    s.consequences.push({
      id: "repair-once",
      dueMonth: "2053-01",
      kind: "repair",
      status: "PENDING",
      amountVnd: "100000",
    });
    s = finish(s);
    expect(s.currentMonth).toBe("2053-01");
    expect(s.annualReviews[0].months).toBe(1);
    s = finish(deserialize(serialize(s)));
    expect(s.consequences[0].status).toBe("APPLIED");
    s = finish(deserialize(serialize(s)));
    expect(s.ledger.filter((t) => t.id === "repair-once")).toHaveLength(1);
  });
  it("keeps a shared world price path independent of person seed and mode", () => {
    const a = ordinary(),
      b = {
        ...a,
        seed: "another-person",
        lifeId: "another-life",
        mode: "HARDSHIP" as const,
      };
    expect(finish(a).world).toEqual(finish(b).world);
  });
  it("rejects old saves explicitly and validates money/version corruption", () => {
    expect(() => deserialize('{"schemaVersion":1,"year":2024}')).toThrow(
      MigrationRequiredError,
    );
    const s = ordinary();
    expect(() => deserialize(serialize({ ...s, cashVnd: "-1" }))).toThrow();
    expect(() =>
      deserialize(serialize({ ...s, engineVersion: "incompatible" })),
    ).toThrow();
  });
  it("plays from birth to ending and performs 900 real monthly commits", () => {
    let s = createLife({
      legacyDemo: true,
      seed: "whole-life",
      retainHistory: false,
    });
    for (let i = 0; i < 900; i++) s = finish(s);
    expect(s.committedMonths).toBe(900);
    expect(s.currentMonth).toBe("2099-01");
    while (s.living) s = finish(s);
    expect(s.deathDate).toBeTruthy();
    expect(s.committedMonths).toBeGreaterThan(900);
  });
});
