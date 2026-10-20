import { expect, it } from "vitest";
import {
  resolveSchedule,
  categories,
} from "../src/simulation/time/MonthlySchedule";
it("uses exact calendar minutes, exact full-week allocations and displaces 15 hours", () => {
  for (const month of ["2024-02", "2025-02", "2024-01", "2024-04"]) {
    const a = resolveSchedule(month, "BALANCED"),
      b = resolveSchedule(month, "CAREER_SPRINT");
    expect(a.usedMinutes).toBe(a.availableMinutes);
    expect(b.usedMinutes).toBe(b.availableMinutes);
    for (const d of [...a.days, ...b.days])
      expect(Object.values(d).reduce((x, y) => x + y, 0)).toBe(1440);
    const first28a = a.days.slice(0, 28),
      first28b = b.days.slice(0, 28);
    const work = (days: typeof first28a) =>
      days.reduce((s, d) => s + d.work, 0);
    expect(work(first28a)).toBe(40 * 60 * 4);
    expect(work(first28b) - work(first28a)).toBe(15 * 60 * 4);
    expect(
      first28a.reduce(
        (s, d) =>
          s +
          categories.filter((k) => k !== "work").reduce((a, k) => a + d[k], 0),
        0,
      ) -
        first28b.reduce(
          (s, d) =>
            s +
            categories
              .filter((k) => k !== "work")
              .reduce((a, k) => a + d[k], 0),
          0,
        ),
    ).toBe(15 * 60 * 4);
  }
});
it("counts fixed-day obligations once, preserves essentials and signals impossible days", () => {
  const obligation = {
    id: "care",
    date: "2024-02-10",
    minutes: 120,
    category: "care" as const,
  };
  const a = resolveSchedule("2024-02", "BALANCED"),
    b = resolveSchedule("2024-02", "BALANCED", { obligations: [obligation] });
  expect(b.byCategory.care - a.byCategory.care).toBe(120);
  expect(b.displacedMinutes).toBe(120);
  expect(b.byCategory.sleep).toBe(a.byCategory.sleep);
  expect(b.usedMinutes).toBe(29 * 1440);
  expect(() =>
    resolveSchedule("2024-02", "BALANCED", {
      obligations: [obligation, obligation],
    }),
  ).toThrow();
  expect(
    resolveSchedule("2024-02", "BALANCED", {
      obligations: [{ ...obligation, minutes: 1440 }],
    }).infeasible,
  ).toBe(true);
});
