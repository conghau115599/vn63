import type { GameState, Mode } from "./types";
import { random } from "./rng";
import { initialPersonality } from "./personality";
import { initialCareer, type Talent } from "./careers";
import type { LifeContext } from "./events/types";
export type StartScenario = "BIRTH" | "ADULT" | "SENIOR_SOLO" | "SENIOR_CARE";
export function createLife(options: {
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
    birthDate = "2024-01-01",
    currentMonth =
      start === "BIRTH" ? "2024-01" : start === "ADULT" ? "2052-01" : "2099-01";
  const state: GameState = {
    careerDevelopment: initialCareer(
      start !== "BIRTH",
      options.strength,
      options.seed,
    ),
    schemaVersion: 3,
    engineVersion: "1.3.0-alpha.2",
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
  return state;
}
