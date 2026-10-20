import { z } from "zod";
import { parseDate, parseMonth } from "../calendar/YearMonth";
const money = z.string().regex(/^(0|[1-9]\d{0,29})$/),
  signed = z.string().regex(/^-?\d{1,30}$/),
  integer = z.number().int().nonnegative(),
  score = z.number().min(0).max(100);
const month = z.string().refine((v) => {
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
const strategy = z.object({
  targetCustomers: z.string().max(100),
  priceVnd: money.refine((v) => BigInt(v) > 0n),
  marketingBudgetVnd: money,
  ownerHoursPerWeek: z.number().min(0).max(80),
  productQuality: score,
  inventoryOrderUnits: integer.max(100000),
  collectionDelayMonths: integer.max(12),
});
const employee = z.object({
  id: z.string(),
  wageVnd: money,
  hoursPerWeek: integer.max(80),
  startDate: date,
  endDate: date.optional(),
  skill: score,
});
export const businessInputSchema = z.object({
  yearMonth: month,
  action: z
    .enum([
      "VALIDATE",
      "LAUNCH",
      "PAUSE",
      "RESUME",
      "CLOSE",
      "PIVOT",
      "TRAIN",
      "RENEGOTIATE",
      "FIND_CUSTOMERS",
    ])
    .optional(),
  strategy: strategy.partial().optional(),
  capitalInjectionVnd: money.optional(),
  ownerWithdrawalVnd: money.optional(),
  loanVnd: money.optional(),
  loanRepaymentVnd: money.optional(),
  hire: employee.optional(),
  terminateEmployeeId: z.string().optional(),
  newSector: z.enum(["retail", "service"]).optional(),
});
const invoice = z.object({
  id: z.string(),
  dueDate: date,
  amountVnd: money,
  kind: z.enum(["SALE", "SUPPLIER", "WAGE", "RENT", "MARKETING", "INTEREST"]),
  status: z.enum(["DUE", "SETTLED"]),
});
const account = z.enum([
  "CASH",
  "INVENTORY",
  "RECEIVABLE",
  "PAYABLE",
  "DEBT",
  "EQUITY",
  "REVENUE",
  "COGS",
  "EXPENSE",
  "OWNER_DRAW",
]);
export const businessSchema = z.object({
  schemaVersion: z.literal(1),
  engineVersion: z.literal("business-v1"),
  id: z.string(),
  ownerId: z.string(),
  sectorId: z.enum(["retail", "service"]),
  province2024Id: z.string(),
  openedMonth: month,
  status: z.enum([
    "IDEA",
    "VALIDATING",
    "ACTIVE",
    "PAUSED",
    "RESTRUCTURING",
    "CLOSED",
  ]),
  strategy,
  bankCashVnd: money,
  inventoryUnits: integer,
  inventoryCostVnd: money,
  receivablesVnd: money,
  payablesVnd: money,
  debtVnd: money,
  equityVnd: money,
  retainedProfitVnd: signed,
  ownerDrawVnd: money,
  dueBills: z.array(invoice),
  invoices: z.array(invoice),
  employees: z.array(employee),
  fixedMonthlyCostsVnd: money,
  perSaleVariableCostVnd: money.refine((v) => BigInt(v) > 0n),
  maxSalesCapacity: integer.max(100000),
  goodwill: score,
  satisfaction: score,
  founderSkill: z.object({
    operations: score,
    sales: score,
    finance: score,
    domain: score,
  }),
  validatedMonths: integer,
  permitGranted: z.boolean(),
  supplierContract: z.boolean(),
  creditApproved: z.boolean(),
  creditLimitVnd: money,
  eventMemory: z.array(z.string()),
  journal: z.array(
    z.object({
      id: z.string(),
      date,
      debit: account,
      credit: account,
      amountVnd: money,
      kind: z.string(),
    }),
  ),
  lastProcessedMonth: month.optional(),
  retainHistory: z.boolean(),
  marketSeed: z.string(),
  rngVersion: z.literal("business-keyed-v1"),
  queuedPlan: businessInputSchema.optional(),
  reports: z.array(
    z.object({
      month,
      openingCashVnd: money,
      closingCashVnd: money,
      revenueVnd: money,
      cogsVnd: money,
      expensesVnd: money,
      profitVnd: signed,
      cashInVnd: money,
      cashOutVnd: money,
      cashFlowVnd: signed,
      ownerCapitalVnd: money,
      ownerWithdrawalVnd: money,
      leads: integer,
      conversion: z.number().min(0).max(1),
      orders: integer,
      delivered: integer,
      returns: integer,
      capacity: integer,
      ownerMinutes: z.number().nonnegative(),
      runwayMonths: z.number().nonnegative().nullable(),
      solvent: z.boolean(),
      market: z.object({
        version: z.string(),
        demandMultiplier: z.number().nonnegative(),
        competition: z.number().min(0).max(1),
        seasonality: z.number().nonnegative(),
        sourceGrade: z.literal("ASSUMPTION"),
      }),
      explainers: z.array(z.string()),
    }),
  ),
});
