import type { Policy, TimeReport, Obligation } from "./time/MonthlySchedule";
import type { BusinessState, BusinessMonthInput } from "./business/types";
import type {
  LifeContext,
  EventArc,
  EventMemory,
  EventHistory,
} from "./events/types";
import type { PersonalityState } from "./personality";
import type { CareerDevelopment, CareerPlan, Talent } from "./careers";
export type Mode = "REALISM" | "HARDSHIP";
export type Money = string;
export type Transaction = {
  id: string;
  date: string;
  source: string;
  direction: "IN" | "OUT";
  amountVnd: Money;
};
export type Debt = {
  id: string;
  principalVnd: Money;
  monthlyRateBps: number;
  paymentVnd: Money;
  dueDay: number;
  arrearsVnd: Money;
};
export type Job = {
  occupation?: Talent;
  salaryVnd: Money;
  payDay: number;
  weeklyHours: number;
  paidOvertime: boolean;
  startDate: string;
  endDate?: string;
  proration: "calendar_days";
};
export type Holding = {
  assetId: string;
  quantity: string;
  costVnd: Money;
  availableFrom: string;
};
export type NPC = {
  relation?:
    "parent" | "spouse" | "child" | "grandchild" | "friend" | "relative";
  careNeed?: number;
  id: string;
  name: string;
  role: string;
  birthDate: string;
  living: boolean;
  trust: number;
  bond: number;
  unmetNeeds: number;
  giftCount: number;
  memories: string[];
  promises: Array<{
    id: string;
    dueMonth: string;
    minutes: number;
    status: "PENDING" | "KEPT" | "MISSED";
  }>;
};
export type Decision = {
  id: string;
  templateId: string;
  date: string;
  title: string;
  body: string;
  options: Array<{
    id: string;
    label: string;
    hint: string;
    disabledReason?: string;
  }>;
  authority?: "CAREGIVER" | "CHILD" | "SELF";
};
export type Consequence = {
  id: string;
  dueMonth: string;
  kind: "training" | "repair" | "promise";
  status: "PENDING" | "APPLIED";
  amountVnd?: Money;
};
export type MonthReport = {
  month: string;
  days: number;
  cashOpenVnd: Money;
  cashCloseVnd: Money;
  inflowVnd: Money;
  outflowVnd: Money;
  time: Omit<TimeReport, "days">;
  events: Array<{ id: string; happenedAt: string; kind: string; text: string }>;
  netWorthVnd: Money;
  age: number;
};
export type World = {
  seed: string;
  prices: Record<string, Money>;
  regime: "GROWTH" | "DOWNTURN" | "VOLATILE";
  cpiBasisPoints: number;
};
export type Cursor = {
  businessInput?: BusinessMonthInput;
  businessFundingVnd?: string;
  day: number;
  openingCashVnd: Money;
  inflowVnd: Money;
  outflowVnd: Money;
  time: TimeReport;
  events: MonthReport["events"];
  processedIds: string[];
  marketUpdated: boolean;
};
export type GameState = {
  careerDevelopment: CareerDevelopment;
  schemaVersion: 3;
  context: LifeContext;
  personality: PersonalityState;
  business: BusinessState | null;
  arcs: EventArc[];
  eventMemory: EventMemory[];
  migrationNotes: string[];
  engineVersion: string;
  worldVersion: string;
  rngVersion: string;
  eventPackVersion: string;
  lifeId: string;
  seed: string;
  name: string;
  birthDate: string;
  currentMonth: string;
  living: boolean;
  deathDate?: string;
  mode: Mode;
  birthProvinceId: string;
  residenceProvinceId: string;
  worldScenario: "future_simulated" | "historical_estimated";
  cashVnd: Money;
  wageReceivableVnd: Money;
  debts: Debt[];
  job: Job | null;
  holdings: Holding[];
  world: World;
  policy: Policy;
  mood: number;
  satisfaction: number;
  fatigue: number;
  sleepDebtMinutes: number;
  health: number;
  knowledge: number;
  npcs: NPC[];
  consequences: Consequence[];
  obligations: Obligation[];
  pendingDecision?: Decision;
  cursor?: Cursor;
  ledger: Transaction[];
  reports: MonthReport[];
  eventHistory: EventHistory;
  committedMonths: number;
  lastCommittedMonth?: string;
  retainHistory: boolean;
  deathLimitMonths: number;
  annualReviews: Array<{
    year: number;
    months: number;
    inflowVnd: Money;
    outflowVnd: Money;
  }>;
};
export type MonthlyInput = {
  careerPlan?: CareerPlan;
  careerAction?: "SEEK" | "RETIRE" | "REDUCE";
  startBusiness?: { sectorId: "retail" | "service"; capitalVnd: string };
  business?: BusinessMonthInput;
  yearMonth: string;
  policyChanges?: Array<{
    policyId: Policy;
    enabled: boolean;
    details?: unknown;
  }>;
  choice?: { eventId: string; optionId: string };
  giftNpcId?: string;
  investmentOrders?: Array<{
    orderId: string;
    assetId: string;
    side: "BUY" | "SELL";
    quantity: string;
  }>;
};
export type MonthlyResult = {
  nextState: GameState;
  status: "PAUSED" | "COMMITTED" | "DECEASED";
  committedMonth?: string;
  journal: MonthReport["events"];
  money: {
    cashOpenVnd: Money;
    inflowVnd: Money;
    outflowVnd: Money;
    cashCloseVnd: Money;
  };
  pendingDecision?: Decision;
};
