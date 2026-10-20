import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  addMonths,
  ageOn,
  daysInMonth,
  monthsBetween,
  nextMonth,
  parseDate,
  parseMonth,
  weekday,
} from "../src/simulation/calendar/YearMonth";
describe("Gregorian calendar", () => {
  it("handles century leap years and 900 distinct transitions", () => {
    expect([2000, 2024, 2025, 2100].map((y) => daysInMonth(`${y}-02`))).toEqual(
      [29, 29, 28, 28],
    );
    let m = "2024-01";
    const visited = new Set<string>();
    for (let i = 0; i < 900; i++) {
      visited.add(m);
      m = nextMonth(m);
    }
    expect(visited.size).toBe(900);
    expect(m).toBe("2099-01");
    expect(addMonths("2024-01", 12)).toBe("2025-01");
    expect(monthsBetween("2024-01", m)).toBe(900);
  });
  it("rejects malformed months and impossible dates", () => {
    for (const m of ["2024-1", "2024-13", "0000-01", "2024-01-x"])
      expect(() => parseMonth(m)).toThrow();
    for (const d of ["2025-02-29", "2024-04-31"])
      expect(() => parseDate(d)).toThrow();
  });
  it("resolves Feb 29 birthday on Feb 28 without premature increment", () => {
    expect(ageOn("2000-02-29", "2025-02-27")).toBe(24);
    expect(ageOn("2000-02-29", "2025-02-28")).toBe(25);
    expect(ageOn("2000-02-29", "2024-02-28")).toBe(23);
    expect(weekday("2024-01-01")).toBe(0);
  });
  it("roundtrips month arithmetic across random dates", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1900, max: 2200 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: -120, max: 120 }),
        (y, m, n) => {
          const ym = `${y}-${String(m).padStart(2, "0")}`;
          expect(monthsBetween(ym, addMonths(ym, n))).toBe(n);
        },
      ),
    );
  });
});
