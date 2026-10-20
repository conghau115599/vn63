import type { GameState } from "../types";
export type LifeContext = {
  settlement: "URBAN" | "RURAL";
  resources: "LIMITED" | "STABLE" | "AFFLUENT";
  flags: string[];
  tags: string[];
  maritalStatus: "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED";
  career: "NOT_WORKING" | "WORKING" | "SEEKING" | "REDUCED" | "RETIRED";
  pensionEligible: boolean;
  pensionMonthlyVnd: string;
  retiredFrom?: string;
  employmentOpportunity: boolean;
  pauseOnDecisions: boolean;
  childCount: number;
  grandchildCount: number;
};
export type EligibilityReason = {
  code: string;
  detail: string;
  eligible: boolean;
};
export type EventHistory = Record<
  string,
  { lastMonth: string; count: number; contextKey?: string }
>;
export type EventArc = {
  id: string;
  family: "education" | "care" | "business" | "aging";
  stage: string;
  dueMonth?: string;
  status: "ACTIVE" | "COMPLETE";
  actorId?: string;
};
export type EventMemory = {
  instanceId: string;
  eventId: string;
  month: string;
  choiceId: string;
  contextKey: string;
  authority: "CAREGIVER" | "CHILD" | "SELF";
  sourceGrade: "ASSUMPTION";
};
export type Condition =
  | { kind: "flag"; flag: string; present?: boolean }
  | { kind: "settlement"; value: LifeContext["settlement"] }
  | { kind: "resources"; value: LifeContext["resources"] }
  | { kind: "marital"; value: LifeContext["maritalStatus"] }
  | { kind: "career"; values: LifeContext["career"][] }
  | { kind: "cash"; minimumVnd: string }
  | { kind: "health"; minimum: number }
  | { kind: "business"; statuses: string[] }
  | {kind:'priorEvent';eventId:string;choiceId?:string}
  | {kind:'arc';family:EventArc['family'];stage?:string;status:EventArc['status']}
  | { kind: "job"; exists: boolean }
  | { kind: "dependent"; relation?: string }
  | { kind: "employmentOpportunity" }
  | { kind: "children"; minimum: number }
  | { kind: "grandchildren"; minimum: number };
export type EventChoice = {
  id: string;
  label: string;
  hint: string;
  requirements: Condition[];
  effectId: string;
  timeMinutes?: number;
  upfrontCostVnd?: string;
};
export type EventSpec = {
  eventId: string;
  schemaVersion: 1;
  eventType:
    | "education"
    | "work"
    | "health"
    | "relationship"
    | "finance"
    | "business"
    | "aging"
    | "housing"
    | "migration";
  arcId?: string;
  ageRange?: { min: number; max: number };
  prerequisites: Condition[];
  forbiddenFlags: string[];
  regions?: string[];
  occupations?: string[];
  contextTags: string[];
  requiredActors: Array<{ relation: string; living: boolean }>;
  cooldownMonths: number;
  maxLifetimeOccurrences: number;
  stakes: "OBSERVATION" | "DECISION" | "CRITICAL";
  choices: EventChoice[];
  deferredEffects: string[];
  sourceGrade: "ASSUMPTION";
  title: string;
  body: string;
  salience: number;
  requireContextChange?: boolean;
  legacyKind?: string;
};
export type EligibilityResult = {
  eligible: boolean;
  reasons: EligibilityReason[];
  contextKey: string;
};
export type EventInspector = {
  eventId: string;
  title: string;
  eligible: boolean;
  reasons: EligibilityReason[];
  contextKey: string;
};
export type EventState = Pick<
  GameState,
  | "currentMonth"
  | "birthDate"
  | "living"
  | "context"
  | "cashVnd"
  | "job"
  | "health"
  | "npcs"
  | "business"
  | "residenceProvinceId"
  | "eventHistory"
  | "arcs"
  | 'eventMemory'
>;
