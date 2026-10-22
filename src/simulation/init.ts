import type { GameState, Mode } from "./types";
import { random } from "./rng";
import { initialPersonality } from "./personality";
import { initialCareer, type Talent } from "./careers";
import type { LifeContext } from "./events/types";
import {
  addDays,
  addMonths,
  dateInMonth,
  isLeapYear,
} from "./calendar/YearMonth";
export type StartScenario = "BIRTH" | "ADULT" | "SENIOR_SOLO" | "SENIOR_CARE";
export function createLife(options: {
  legacyDemo?: boolean;
  birthYear?: 1975 | 1986 | 2000 | 2024;
  strength?: "GENERAL" | Talent;
  context?: Partial<LifeContext>;
  seed: string;
  name?: string;
  provinceId?: string;
  mode?: Mode;
  start?: StartScenario;
  retainHistory?: boolean;
  worldSeed?: string;
}): GameState {
  const start = options.start ?? "BIRTH",
    mode = options.mode ?? "REALISM",
    year = options.legacyDemo ? 2024 : (options.birthYear ?? 1975),
    birthDate = options.legacyDemo
      ? "2024-01-01"
      : addDays(
          `${year}-01-01`,
          Math.floor(
            random(options.seed, "birth-date", "civil-day") *
              (isLeapYear(year) ? 366 : 365),
          ),
        ),
    currentMonth = addMonths(
      birthDate.slice(0, 7),
      start === "BIRTH" ? 0 : start === "ADULT" ? 336 : 900,
    );
  const state: GameState = {
    careerDevelopment: initialCareer(
      start !== "BIRTH",
      options.strength,
      options.seed,
    ),
    schemaVersion: 3,
    engineVersion: "1.4.0-alpha.1",
    ...(options.legacyDemo
      ? {}
      : {
          calendarMode: "WEEKLY_V1" as const,
          currentDate: dateInMonth(currentMonth, +birthDate.slice(8)),
          simulationProfile: "HISTORICAL_FOUNDATION" as const,
        }),
    context: {
      settlement: "URBAN",
      resources: "STABLE",
      flags:
        start === "ADULT"
          ? ["CAREGIVER_AVAILABLE", "OWNS_VEHICLE", "HOUSING_REPAIR_OBLIGATION"]
          : ["CAREGIVER_AVAILABLE"],
      tags: [],
      maritalStatus: "SINGLE",
      career: start === "ADULT" ? "WORKING" : "NOT_WORKING",
      pensionEligible: false,
      pensionMonthlyVnd: "0",
      employmentOpportunity: true,
      pauseOnDecisions: true,
      childCount: 0,
      grandchildCount: 0,
      ...options.context,
    },
    personality: initialPersonality(),
    business: null,
    arcs: [],
    eventMemory: [],
    migrationNotes: [],
    worldVersion: "sandbox-2024-v1",
    rngVersion: "keyed-fnv-avalanche-v1",
    eventPackVersion: "context-demo-v1",
    lifeId: `vn63-${options.seed}`,
    seed: options.seed,
    name: options.name?.trim().slice(0, 40) || "Minh An",
    birthDate,
    currentMonth,
    living: true,
    mode,
    birthProvinceId: options.provinceId ?? "ha-noi",
    residenceProvinceId: options.provinceId ?? "ha-noi",
    worldScenario:
      start === "BIRTH" ? "historical_estimated" : "future_simulated",
    cashVnd:
      start === "BIRTH" ? "0" : mode === "HARDSHIP" ? "18000000" : "30000000",
    wageReceivableVnd: "0",
    debts:
      start === "ADULT"
        ? [
            {
              id: "education",
              principalVnd: "12000000",
              monthlyRateBps: 60,
              paymentVnd: "600000",
              dueDay: 28,
              arrearsVnd: "0",
            },
          ]
        : [],
    job:
      start === "ADULT"
        ? {
            salaryVnd: "12000000",
            payDay: 25,
            weeklyHours: 40,
            paidOvertime: false,
            startDate: "2052-01-01",
            proration: "calendar_days",
          }
        : null,
    holdings: [],
    world: {
      seed: options.worldSeed ?? "vn63-world-demo",
      prices: { fund: "100000", gold: "2000000", business: "500000" },
      regime: "GROWTH",
      cpiBasisPoints: 10000,
    },
    policy: "BALANCED",
    mood: 60,
    satisfaction: 60,
    fatigue: 10,
    sleepDebtMinutes: 0,
    health: 80,
    knowledge: start === "BIRTH" ? 0 : 50,
    npcs: [
      {
        id: "mother",
        relation: "parent",
        careNeed: 0,
        name: "Mẹ",
        role: "Gia đình",
        birthDate: "1995-06-12",
        living: true,
        trust: 70,
        bond: 75,
        unmetNeeds: 0,
        giftCount: 0,
        memories: [],
        promises: [],
      },
      {
        id: "friend",
        relation: "friend",
        careNeed: 0,
        name: "Ngọc",
        role: "Bạn thân",
        birthDate: "2024-04-07",
        living: true,
        trust: 55,
        bond: 55,
        unmetNeeds: 0,
        giftCount: 0,
        memories: [],
        promises: [],
      },
    ],
    consequences: [],
    obligations: [],
    ledger: [],
    reports: [],
    eventHistory: {},
    committedMonths: 0,
    retainHistory: options.retainHistory ?? true,
    deathLimitMonths:
      12 *
      (76 + Math.floor(random(options.seed, "terminal-scenario", "age") * 20)),
    annualReviews: [],
  };
  if (!options.legacyDemo) {
    // No current-day prices, debt or monetary job are projected backwards into 1975.
    state.cashVnd = "0";
    state.debts = [];
    state.job = null;
    state.context.career = "NOT_WORKING";
    const surnames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ"];
    const surname =
      surnames[
        Math.floor(
          random(options.seed, "family-name", "surname") * surnames.length,
        )
      ];
    state.npcs[0].name = `${surname} Thị ${["Lan", "Hương", "Hoa", "Mai"][Math.floor(random(options.seed, "family-name", "mother") * 4)]}`;
    state.npcs[0].birthDate = `${year - 29}-06-12`;
    state.npcs[1].birthDate = `${year}-04-07`;
    state.npcs[1].name = `Trần Minh ${["Ngọc", "An", "Bình", "Hà"][Math.floor(random(options.seed, "family-name", "friend") * 4)]}`;
    state.npcs.push({
      id: "father",
      name: `${surname} Văn ${["Hùng", "Minh", "Sơn", "Hải"][Math.floor(random(options.seed, "family-name", "father") * 4)]}`,
      role: "Bố",
      relation: "parent",
      birthDate: `${year - 32}-03-15`,
      living: true,
      trust: 70,
      bond: 75,
      unmetNeeds: 0,
      giftCount: 0,
      memories: [],
      promises: [],
    });
    state.migrationNotes.push(
      "Nền lịch sử P1: dữ liệu địa giới và tiền tệ theo thời kỳ còn MISSING. Không dùng số tiền/địa danh 2024 như lịch sử 1975. Danh tính và hộ gia đình là giả lập, chưa phải family graph P4.",
    );
  }
  if (start === "SENIOR_SOLO" || start === "SENIOR_CARE") {
    state.context = {
      ...state.context,
      career: "RETIRED",
      maritalStatus: start === "SENIOR_SOLO" ? "WIDOWED" : "MARRIED",
      flags: [],
      pensionEligible: false,
      pensionMonthlyVnd: "0",
    };
    state.cashVnd = state.mode === "HARDSHIP" ? "48000000" : "80000000";
    state.npcs[0].living = false;
    state.npcs[0].memories.push(
      "Đã mất trước thời điểm bắt đầu kịch bản tuổi 75.",
    );
    if (start === "SENIOR_CARE")
      state.npcs.push({
        id: "spouse",
        name: "Bạn đời",
        role: "Người bạn đời",
        relation: "spouse",
        careNeed: 60,
        birthDate: "2024-06-01",
        living: true,
        trust: 70,
        bond: 75,
        unmetNeeds: 0,
        giftCount: 0,
        memories: [],
        promises: [],
      });
  }
  if (
    !options.legacyDemo &&
    (start === "SENIOR_SOLO" || start === "SENIOR_CARE")
  ) {
    state.cashVnd = "0";
    const spouse = state.npcs.find((n) => n.id === "spouse");
    if (spouse) {
      spouse.name = "Trần Ngọc An";
      spouse.birthDate = `${year + 1}-06-01`;
    }
  }
  return state;
}
