import { z } from "zod";
import type { GameState } from "../types";
import { dateInMonth, parseDate } from "../calendar/YearMonth";
import provinces from "../../content/provinces.2024.json";

export const originSchema = z.enum([
  "VERIFIED_HISTORICAL",
  "ESTIMATED_HISTORICAL",
  "SIMULATED_PERSONAL",
  "GENERATED_FUTURE",
  "SCHEDULED_UNCONFIRMED",
]);
export type EventOrigin = z.infer<typeof originSchema>;
const civilDate = z.string().refine((v) => {
  try {
    parseDate(v);
    return true;
  } catch {
    return false;
  }
}, "Ngày không hợp lệ");
export const historyPackSchema = z
  .object({
    id: z.string().min(1),
    version: z.string().min(1),
    checksum: z.string().regex(/^[a-f0-9]{64}$/),
    verifiedThrough: civilDate.nullable(),
    events: z.array(
      z.object({
        id: z.string().min(1),
        date: civilDate,
        titleVi: z.string().min(1),
        origin: originSchema,
        sourceRefs: z.array(
          z.object({
            url: z.url(),
            publisher: z.string().min(1),
            retrievedAt: civilDate,
          }),
        ),
      }),
    ),
  })
  .superRefine((pack, ctx) => {
    const ids = new Set<string>();
    for (const event of pack.events) {
      if (ids.has(event.id))
        ctx.addIssue({ code: "custom", message: "ID lịch sử trùng" });
      ids.add(event.id);
      if (
        event.origin === "VERIFIED_HISTORICAL" &&
        (!pack.verifiedThrough ||
          event.date > pack.verifiedThrough ||
          !event.sourceRefs.length)
      )
        ctx.addIssue({
          code: "custom",
          message: "Sự kiện xác minh cần nguồn và nằm trong cutoff của pack",
        });
    }
  });
export type HistoryPack = z.infer<typeof historyPackSchema>;
export type GeoTimeline = {
  geoLocationId: string;
  validFrom: string;
  validTo?: string;
  adminUnitId: string;
  nameVi: string;
  sourceRefs: string[];
};
export type MonetaryEpoch = {
  id: string;
  validFrom: string;
  validTo?: string;
  geoIds: string[];
  denomination: string;
  assetKinds: Array<"cash" | "saving" | "debt" | "receivable" | "inventory">;
  sourceRefs: string[];
};
export type PersonGraph = {
  people: string[];
  edges: Array<{
    from: string;
    to: string;
    relation: "guardian" | "parent" | "spouse" | "child" | "friend";
    validFrom: string;
    validTo?: string;
  }>;
};
export const simulationDate = (s: GameState) =>
  s.deathDate ??
  s.currentDate ??
  dateInMonth(
    s.currentMonth,
    s.cursor?.day ??
      (s.currentMonth === s.birthDate.slice(0, 7) ? +s.birthDate.slice(8) : 1),
  );
export function packCoverage(pack: HistoryPack, date: string) {
  parseDate(date);
  return !pack.verifiedThrough
    ? "MISSING"
    : date <= pack.verifiedThrough
      ? "WITHIN_VERIFIED_COVERAGE"
      : "GENERATED_FUTURE";
}
/** One shared, explicit missing-data response; no inferred historical geography or currency. */
export function worldContext(s: GameState) {
  const date = simulationDate(s),
    historical = s.simulationProfile === "HISTORICAL_FOUNDATION";
  const reference =
    provinces.provinces.find((p) => p.id === s.residenceProvinceId)?.name ??
    "Việt Nam";
  return {
    date,
    referenceAreaId: s.residenceProvinceId,
    referenceAreaName: reference,
    locationName: historical
      ? "Việt Nam · địa danh theo thời kỳ đang bổ sung"
      : reference,
    adminQuality: historical ? "MISSING" : "ASSUMPTION",
    monetaryQuality: historical ? "MISSING" : "ASSUMPTION",
    economyReady: !historical,
    noticeVi: historical
      ? "Nền lịch sử 1975: đang bổ sung dữ liệu địa giới, nghề và tiền tệ theo từng thời kỳ. Các nghiệp vụ cần dữ liệu này chưa mở; không dùng giá hiện đại thay thế."
      : "Kịch bản mô hình hiện đại, không phải số liệu thống kê đã hiệu chuẩn.",
  } as const;
}
