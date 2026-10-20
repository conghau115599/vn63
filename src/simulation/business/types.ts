export type BusinessStatus =
  "IDEA" | "VALIDATING" | "ACTIVE" | "PAUSED" | "RESTRUCTURING" | "CLOSED";
export type Account =
  | "CASH"
  | "INVENTORY"
  | "RECEIVABLE"
  | "PAYABLE"
  | "DEBT"
  | "EQUITY"
  | "REVENUE"
  | "COGS"
  | "EXPENSE"
  | "OWNER_DRAW";
export type BusinessEntry = {
  id: string;
  date: string;
  debit: Account;
  credit: Account;
  amountVnd: string;
  kind: string;
};
export type BusinessInvoice = {
  id: string;
  dueDate: string;
  amountVnd: string;
  kind: "SALE" | "SUPPLIER" | "WAGE" | "RENT" | "MARKETING" | "INTEREST";
  status: "DUE" | "SETTLED";
};
export type Employee = {
  id: string;
  wageVnd: string;
  hoursPerWeek: number;
  startDate: string;
  endDate?: string;
  skill: number;
};
export type BusinessStrategy = {
  targetCustomers: string;
  priceVnd: string;
  marketingBudgetVnd: string;
  ownerHoursPerWeek: number;
  productQuality: number;
  inventoryOrderUnits: number;
  collectionDelayMonths: number;
};
export type BusinessReport = {
  month: string;
  openingCashVnd: string;
  closingCashVnd: string;
  revenueVnd: string;
  cogsVnd: string;
  expensesVnd: string;
  profitVnd: string;
  cashInVnd: string;
  cashOutVnd: string;
  cashFlowVnd: string;
  ownerCapitalVnd: string;
  ownerWithdrawalVnd: string;
  leads: number;
  conversion: number;
  orders: number;
  delivered: number;
  returns: number;
  capacity: number;
  ownerMinutes: number;
  runwayMonths: number | null;
  solvent: boolean;
  market: {
    version: string;
    demandMultiplier: number;
    competition: number;
    seasonality: number;
    sourceGrade: "ASSUMPTION";
  };
  explainers: string[];
};
export type BusinessState = {
  schemaVersion: 1;
  engineVersion: "business-v1";
  id: string;
  ownerId: string;
  sectorId: "retail" | "service";
  province2024Id: string;
  openedMonth: string;
  status: BusinessStatus;
  strategy: BusinessStrategy;
  bankCashVnd: string;
  inventoryUnits: number;
  inventoryCostVnd: string;
  receivablesVnd: string;
  payablesVnd: string;
  debtVnd: string;
  equityVnd: string;
  retainedProfitVnd: string;
  ownerDrawVnd: string;
  dueBills: BusinessInvoice[];
  invoices: BusinessInvoice[];
  employees: Employee[];
  fixedMonthlyCostsVnd: string;
  perSaleVariableCostVnd: string;
  maxSalesCapacity: number;
  goodwill: number;
  satisfaction: number;
  founderSkill: {
    operations: number;
    sales: number;
    finance: number;
    domain: number;
  };
  validatedMonths: number;
  permitGranted: boolean;
  supplierContract: boolean;
  creditApproved: boolean;
  creditLimitVnd: string;
  eventMemory: string[];
  journal: BusinessEntry[];
  lastProcessedMonth?: string;
  reports: BusinessReport[];
  retainHistory: boolean;
  marketSeed: string;
  rngVersion: "business-keyed-v1";
  queuedPlan?: BusinessMonthInput;
};
export type BusinessMonthInput = {
  yearMonth: string;
  action?:
    | "VALIDATE"
    | "LAUNCH"
    | "PAUSE"
    | "RESUME"
    | "CLOSE"
    | "PIVOT"
    | "TRAIN"
    | "RENEGOTIATE"
    | "FIND_CUSTOMERS";
  strategy?: Partial<BusinessStrategy>;
  capitalInjectionVnd?: string;
  ownerWithdrawalVnd?: string;
  loanVnd?: string;
  loanRepaymentVnd?: string;
  hire?: Employee;
  terminateEmployeeId?: string;
  newSector?: "retail" | "service";
};
export type BusinessMonthContext = {
  worldSeed: string;
  mode: "REALISM" | "HARDSHIP";
  ownerMinutes: number;
  endDay?: number;
  demandOverride?: number;
  prepaidCapitalVnd?: string;
};
