import { z } from "zod";
import { ageOn, parseDate, parseMonth } from "./calendar/YearMonth";
import { categories } from "./time/MonthlySchedule";
import type { GameState } from "./types";
import { initialPersonality, traitNames } from "./personality";
import { businessSchema, businessInputSchema } from "./business/schema";
import { assertBusinessBooks } from "./business/advanceBusinessMonth";
import { templates } from "./events";
import { initialCareer } from "./careers";
const money = z.string().regex(/^(0|[1-9]\d{0,29})$/),
  month = z.string().refine((v) => {
    try {
      parseMonth(v);
      return true;
    } catch {
      return false;
    }
  }),
  date = z.string().refine((v) => {
    try {
      parseDate(v);
      return true;
    } catch {
      return false;
    }
  });
const score = z.number().min(0).max(100),
  integer = z.number().int().nonnegative(),
  policy = z.enum([
    "BALANCED",
    "CAREER_SPRINT",
    "FAMILY_FIRST",
    "STUDY_UPSKILL",
  ]);
const allocation = z.object(
  Object.fromEntries(
    categories.map((k) => [
      k,
      ["business", "practice"].includes(k) ? integer.default(0) : integer,
    ]),
  ) as Record<(typeof categories)[number], typeof integer>,
);
const time = z.object({
  availableMinutes: integer,
  usedMinutes: integer,
  byCategory: allocation,
  displacedMinutes: integer,
  displaced: z.array(
    z.object({
      id: z.string(),
      category: z.enum(categories),
      minutes: integer,
    }),
  ),
  infeasible: z.boolean(),
});
const event = z.object({
  id: z.string(),
  happenedAt: date,
  kind: z.string(),
  text: z.string(),
});
const transaction = z.object({
  id: z.string(),
  date,
  source: z.string(),
  direction: z.enum(["IN", "OUT"]),
  amountVnd: money,
});
const legacySchema = z.object({
  schemaVersion: z.literal(2),
  engineVersion: z.literal("1.2.0-alpha.1"),
  worldVersion: z.literal("sandbox-2024-v1"),
  rngVersion: z.literal("keyed-fnv-avalanche-v1"),
  eventPackVersion: z.literal("monthly-demo-v1"),
  lifeId: z.string().min(1).max(200),
  seed: z.string().min(1).max(100),
  name: z.string().min(1).max(40),
  birthDate: date,
  currentMonth: month,
  living: z.boolean(),
  deathDate: date.optional(),
  mode: z.enum(["REALISM", "HARDSHIP"]),
  birthProvinceId: z.string(),
  residenceProvinceId: z.string(),
  worldScenario: z.enum(["historical_estimated", "future_simulated"]),
  cashVnd: money,
  wageReceivableVnd: money,
  debts: z.array(
    z.object({
      id: z.string(),
      principalVnd: money,
      monthlyRateBps: integer.max(10000),
      paymentVnd: money,
      dueDay: integer.min(1).max(31),
      arrearsVnd: money,
    }),
  ),
  job: z
    .object({
      salaryVnd: money,
      occupation: z.enum(["ATHLETE", "ARTIST"]).optional(),
      payDay: integer.min(1).max(31),
      weeklyHours: integer.min(1).max(168),
      paidOvertime: z.boolean(),
      startDate: date,
      endDate: date.optional(),
      proration: z.literal("calendar_days"),
    })
    .nullable(),
  holdings: z.array(
    z.object({
      assetId: z.enum(["fund", "gold", "business"]),
      quantity: money,
      costVnd: money,
      availableFrom: month,
    }),
  ),
  world: z.object({
    seed: z.string(),
    prices: z.object({ fund: money, gold: money, business: money }),
    regime: z.enum(["GROWTH", "DOWNTURN", "VOLATILE"]),
    cpiBasisPoints: integer,
  }),
  policy,
  mood: score,
  satisfaction: score,
  fatigue: score,
  sleepDebtMinutes: integer,
  health: score,
  knowledge: score,
  npcs: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      relation: z
        .enum(["parent", "spouse", "child", "grandchild", "friend", "relative"])
        .optional(),
      careNeed: score.optional(),
      role: z.string(),
      birthDate: date,
      living: z.boolean(),
      trust: score,
      bond: score,
      unmetNeeds: integer,
      giftCount: integer,
      memories: z.array(z.string()),
      promises: z.array(
        z.object({
          id: z.string(),
          dueMonth: month,
          minutes: integer,
          status: z.enum(["PENDING", "KEPT", "MISSED"]),
        }),
      ),
    }),
  ),
  consequences: z.array(
    z.object({
      id: z.string(),
      dueMonth: month,
      kind: z.enum(["training", "repair", "promise"]),
      status: z.enum(["PENDING", "APPLIED"]),
      amountVnd: money.optional(),
    }),
  ),
  obligations: z.array(
    z.object({
      id: z.string(),
      date,
      minutes: integer,
      category: z.enum(categories),
    }),
  ),
  pendingDecision: z
    .object({
      id: z.string(),
      templateId: z.string(),
      date,
      title: z.string(),
      body: z.string(),
      authority: z.enum(["CAREGIVER", "CHILD", "SELF"]).optional(),
      options: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            hint: z.string(),
            disabledReason: z.string().optional(),
          }),
        )
        .min(1),
    })
    .optional(),
  cursor: z
    .object({
      day: integer.min(1).max(31),
      openingCashVnd: money,
      inflowVnd: money,
      outflowVnd: money,
      time: time.extend({ days: z.array(allocation) }),
      events: z.array(event),
      processedIds: z.array(z.string()),
      marketUpdated: z.boolean(),
      businessInput: businessInputSchema.optional(),
      businessFundingVnd: money.optional(),
    })
    .optional(),
  ledger: z.array(transaction),
  reports: z.array(
    z.object({
      month,
      days: integer.min(1).max(31),
      cashOpenVnd: money,
      cashCloseVnd: money,
      inflowVnd: money,
      outflowVnd: money,
      time,
      events: z.array(event),
      netWorthVnd: z.string().regex(/^-?\d+$/),
      age: integer,
    }),
  ),
  eventHistory: z.record(
    z.string(),
    z.object({
      lastMonth: month,
      count: integer,
      contextKey: z.string().optional(),
    }),
  ),
  committedMonths: integer,
  lastCommittedMonth: month.optional(),
  retainHistory: z.boolean(),
  deathLimitMonths: integer.min(1).max(1680),
  annualReviews: z.array(
    z.object({
      year: integer,
      months: integer.max(12),
      inflowVnd: money,
      outflowVnd: money,
    }),
  ),
});
const traits = z.object(
  Object.fromEntries(traitNames.map((t) => [t, score])) as Record<
    (typeof traitNames)[number],
    typeof score
  >,
);
const schema = legacySchema.extend({
  careerDevelopment: z
    .object({
      version: z.literal("talent-careers-v1"),
      sourceGrade: z.literal("ASSUMPTION"),
      goal: z.enum(["GENERAL", "ATHLETE", "ARTIST"]),
      hours: integer.max(20),
      aptitude: z.object({ ATHLETE: score, ARTIST: score }),
      skill: z.object({ ATHLETE: score, ARTIST: score }),
      minutes: z.object({ ATHLETE: integer, ARTIST: integer }),
      club: z.object({ ATHLETE: z.boolean(), ARTIST: z.boolean() }),
      portfolio: z.number().nonnegative(),
      trials: z.array(
        z.object({
          month,
          goal: z.enum(["ATHLETE", "ARTIST"]),
          score: z.number(),
          passed: z.boolean(),
        }),
      ),
      offer: z
        .object({
          goal: z.enum(["ATHLETE", "ARTIST"]),
          salaryVnd: money,
          month,
        })
        .optional(),
    })
    .optional(),
  schemaVersion: z.literal(3),
  engineVersion: z.enum(["1.3.0-alpha.1", "1.3.0-alpha.2"]),
  eventPackVersion: z.literal("context-demo-v1"),
  context: z.object({
    settlement: z.enum(["URBAN", "RURAL"]),
    resources: z.enum(["LIMITED", "STABLE", "AFFLUENT"]),
    flags: z.array(z.string()),
    tags: z.array(z.string()),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED"]),
    career: z.enum(["NOT_WORKING", "WORKING", "SEEKING", "REDUCED", "RETIRED"]),
    pensionEligible: z.boolean(),
    pensionMonthlyVnd: money,
    retiredFrom: date.optional(),
    employmentOpportunity: z.boolean(),
    pauseOnDecisions: z.boolean(),
    childCount: integer,
    grandchildCount: integer,
  }),
  personality: z.object({
    version: z.literal("traits-v1"),
    sourceGrade: z.literal("ASSUMPTION"),
    values: traits,
    baseline: traits,
    lastDelta: z.object(
      Object.fromEntries(
        traitNames.map((t) => [t, z.number().min(-0.9).max(0.9)]),
      ) as Record<(typeof traitNames)[number], z.ZodNumber>,
    ),
  }),
  business: businessSchema.nullable(),
  arcs: z.array(
    z.object({
      id: z.string(),
      family: z.enum(["education", "care", "business", "aging"]),
      stage: z.string(),
      dueMonth: month.optional(),
      status: z.enum(["ACTIVE", "COMPLETE"]),
      actorId: z.string().optional(),
    }),
  ),
  eventMemory: z.array(
    z.object({
      instanceId: z.string(),
      eventId: z.string(),
      month,
      choiceId: z.string(),
      contextKey: z.string(),
      authority: z.enum(["CAREGIVER", "CHILD", "SELF"]),
      sourceGrade: z.literal("ASSUMPTION"),
    }),
  ),
  migrationNotes: z.array(z.string()),
});
export class MigrationRequiredError extends Error {}
export function validateState(raw: unknown): GameState {
  if (typeof raw !== "object" || raw === null)
    throw new Error("Save không hợp lệ.");
  const version = (raw as { schemaVersion?: number }).schemaVersion;
  if (version === 2) {
    const old = legacySchema.parse(raw);
    raw = {
      ...old,
      schemaVersion: 3,
      engineVersion: "1.3.0-alpha.1",
      eventPackVersion: "context-demo-v1",
      context: {
        settlement: "URBAN",
        resources: "STABLE",
        flags: old.npcs.some((n) => n.id === "mother" && n.living)
          ? ["CAREGIVER_AVAILABLE"]
          : [],
        tags: [],
        maritalStatus: "SINGLE",
        career: old.job ? "WORKING" : "NOT_WORKING",
        pensionEligible: false,
        pensionMonthlyVnd: "0",
        employmentOpportunity: true,
        pauseOnDecisions: true,
        childCount: 0,
        grandchildCount: 0,
      },
      personality: initialPersonality(),
      business: null,
      arcs: [],
      eventMemory: [],
      migrationNotes: [
        "Migrated v1.2 monthly save to v1.3. Existing ledger, dates, pending cursor and NPC memories preserved. New traits start at neutral 50; URBAN/STABLE and SINGLE are explicit demo defaults because the old save did not model these fields. No pension or family members inferred.",
      ],
      npcs: old.npcs.map((n) => ({
        ...n,
        relation:
          n.relation ??
          (n.id === "mother"
            ? "parent"
            : n.id === "friend"
              ? "friend"
              : "relative"),
        careNeed: n.careNeed ?? 0,
      })),
    };
  } else if (version !== 3)
    throw new MigrationRequiredError(
      "Save cũ chưa có tháng lịch và ngày sinh đầy đủ. Cần chuyển đổi có xác nhận; bản gốc được giữ nguyên.",
    );
  const parsed = schema.parse(raw) as GameState;
  if (!parsed.careerDevelopment) {
    parsed.careerDevelopment = initialCareer(
      ageOn(parsed.birthDate, `${parsed.currentMonth}-01`) >= 18,
    );
    parsed.migrationNotes.push(
      "Career paths added with neutral demo aptitude; past training and talents are not inferred.",
    );
  }
  ageOn(
    parsed.birthDate,
    `${parsed.currentMonth}-${parsed.currentMonth === parsed.birthDate.slice(0, 7) ? parsed.birthDate.slice(8) : "01"}`,
  );
  if (!!parsed.pendingDecision !== !!(parsed.cursor && parsed.pendingDecision))
    throw new Error("Quyết định thiếu trạng thái tháng.");
  if (new Set(parsed.ledger.map((t) => t.id)).size !== parsed.ledger.length)
    throw new Error("Save chứa bút toán trùng.");
  if (parsed.cursor) {
    const c = parsed.cursor;
    if (
      BigInt(c.openingCashVnd) + BigInt(c.inflowVnd) - BigInt(c.outflowVnd) !==
      BigInt(parsed.cashVnd)
    )
      throw new Error("Số dư tháng không cân.");
    if (
      c.time.days.length !== Number(c.time.availableMinutes / 1440) ||
      c.day > c.time.days.length ||
      new Set(c.processedIds).size !== c.processedIds.length
    )
      throw new Error("Cursor tháng không hợp lệ.");
  }
  if (
    parsed.pendingDecision &&
    !templates.some((t) => t.id === parsed.pendingDecision!.templateId) &&
    !(
      parsed.pendingDecision.templateId === "career-contract" &&
      parsed.careerDevelopment.offer?.month === parsed.currentMonth
    )
  )
    throw new Error("Template quyết định không có trong phiên bản này.");
  if (parsed.business) {
    assertBusinessBooks(parsed.business);
    if (
      parsed.business.ownerId !== parsed.lifeId ||
      parsed.business.marketSeed !== parsed.world.seed
    )
      throw new Error("Chủ doanh nghiệp hoặc world seed không khớp.");
    if (
      new Set(parsed.business.journal.map((e) => e.id)).size !==
      parsed.business.journal.length
    )
      throw new Error("Sổ doanh nghiệp có ID trùng.");
  }
  return parsed;
}
export const serialize = (state: GameState) => JSON.stringify(state);
export function deserialize(text: string): GameState {
  if (text.length > 20_000_000) throw new Error("Save quá lớn.");
  return validateState(JSON.parse(text));
}
