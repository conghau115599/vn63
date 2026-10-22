export type YearMonth = string;
export function parseMonth(value: string): { year: number; month: number } {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value) || +value.slice(0, 4) < 1)
    throw new Error("Tháng phải có dạng YYYY-MM (0001–9999).");
  return { year: +value.slice(0, 4), month: +value.slice(5) };
}
export const isLeapYear = (year: number) =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
export function daysInMonth(value: string): number {
  const { year, month } = parseMonth(value);
  return month === 2
    ? isLeapYear(year)
      ? 29
      : 28
    : [4, 6, 9, 11].includes(month)
      ? 30
      : 31;
}
export function addMonths(value: string, amount: number): string {
  const { year, month } = parseMonth(value);
  if (!Number.isInteger(amount)) throw new Error("Số tháng phải nguyên.");
  const n = (year - 1) * 12 + month - 1 + amount;
  if (n < 0 || n >= 9999 * 12) throw new Error("Ngoài lịch hỗ trợ.");
  return `${String(Math.floor(n / 12) + 1).padStart(4, "0")}-${String((n % 12) + 1).padStart(2, "0")}`;
}
export const nextMonth = (value: string) => addMonths(value, 1);
export function monthsBetween(a: string, b: string): number {
  const x = parseMonth(a),
    y = parseMonth(b);
  return (y.year - x.year) * 12 + y.month - x.month;
}
export function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Ngày phải có dạng YYYY-MM-DD.");
  const ym = value.slice(0, 7),
    day = +value.slice(8);
  const { year, month } = parseMonth(ym);
  if (day < 1 || day > daysInMonth(ym)) throw new Error("Ngày không tồn tại.");
  return { year, month, day };
}
/** Leap-day birthdays resolve on February 28 in nonleap years. */
export function ageOn(birthDate: string, date: string): number {
  const b = parseDate(birthDate),
    d = parseDate(date);
  if (date < birthDate) throw new Error("Ngày trước khi sinh.");
  const birthdayDay =
    b.month === 2 && b.day === 29 && !isLeapYear(d.year) ? 28 : b.day;
  return (
    d.year -
    b.year -
    (d.month < b.month || (d.month === b.month && d.day < birthdayDay) ? 1 : 0)
  );
}
/** Monday=0, Gregorian civil calendar, independent of host clock/timezone. */
export function weekday(date: string): number {
  const { year, month, day } = parseDate(date);
  const y = year - 1;
  let n =
    365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400);
  for (let m = 1; m < month; m++)
    n += daysInMonth(
      `${String(year).padStart(4, "0")}-${String(m).padStart(2, "0")}`,
    );
  return (n + day - 1) % 7;
}
export const dateInMonth = (month: string, day: number) =>
  `${month}-${String(Math.min(daysInMonth(month), day)).padStart(2, "0")}`;

/** Civil-day arithmetic, independent of host timezone and DST. */
export function addDays(value: string, amount: number): string {
  parseDate(value);
  if (!Number.isInteger(amount)) throw new Error("Số ngày phải nguyên.");
  let month = value.slice(0, 7),
    day = +value.slice(8) + amount;
  while (day > daysInMonth(month)) {
    day -= daysInMonth(month);
    month = nextMonth(month);
  }
  while (day < 1) {
    month = addMonths(month, -1);
    day += daysInMonth(month);
  }
  return dateInMonth(month, day);
}
export function formatDate(value: string): string {
  parseDate(value);
  return value.split("-").reverse().join("/");
}
