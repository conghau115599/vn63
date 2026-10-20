import {
  addMonths,
  dateInMonth,
  daysInMonth,
  parseMonth,
} from "../calendar/YearMonth";
import { amount, roundedRatio } from "../finance/MonthlyLedger";
import { simulationConfig } from "../config";
import { convertCustomers, monthlyBusinessMarket } from "./market";
import type {
  Account,
  BusinessEntry,
  BusinessInvoice,
  BusinessMonthContext,
  BusinessMonthInput,
  BusinessReport,
  BusinessState,
} from "./types";
const signed = (value: string) => {
  if (!/^-?\d{1,30}$/.test(value))
    throw new Error("Số tiền kế toán không hợp lệ");
  return BigInt(value);
};
const clamp = (v: number) => Math.max(0, Math.min(100, v));
const safeCount = (n: number, max = 100000) =>
  Number.isInteger(n) && n >= 0 && n <= max;
export function createBusiness(options: {
  id: string;
  ownerId: string;
  provinceId: string;
  month: string;
  worldSeed: string;
  sectorId?: "retail" | "service";
  retainHistory?: boolean;
  skill?: number;
}): BusinessState {
  parseMonth(options.month);
  const skill = options.skill ?? 35;
  return {
    schemaVersion: 1,
    engineVersion: "business-v1",
    id: options.id,
    ownerId: options.ownerId,
    province2024Id: options.provinceId,
    sectorId: options.sectorId ?? "retail",
    openedMonth: options.month,
    status: "IDEA",
    strategy: {
      targetCustomers: "Khách địa phương",
      priceVnd: "100000",
      marketingBudgetVnd: "300000",
      ownerHoursPerWeek: 15,
      productQuality: 65,
      inventoryOrderUnits: 100,
      collectionDelayMonths: 0,
    },
    bankCashVnd: "0",
    inventoryUnits: 0,
    inventoryCostVnd: "0",
    receivablesVnd: "0",
    payablesVnd: "0",
    debtVnd: "0",
    equityVnd: "0",
    retainedProfitVnd: "0",
    ownerDrawVnd: "0",
    dueBills: [],
    invoices: [],
    employees: [],
    fixedMonthlyCostsVnd: simulationConfig.business.baseFixedVnd,
    perSaleVariableCostVnd: simulationConfig.business.baseUnitCostVnd,
    maxSalesCapacity: simulationConfig.business.maxSales,
    goodwill: 35,
    satisfaction: 60,
    founderSkill: {
      operations: skill,
      sales: skill,
      finance: skill,
      domain: skill,
    },
    validatedMonths: 0,
    permitGranted: false,
    supplierContract: true,
    creditApproved: false,
    creditLimitVnd: simulationConfig.business.maxCreditVnd,
    eventMemory: [],
    journal: [],
    reports: [],
    retainHistory: options.retainHistory ?? true,
    marketSeed: options.worldSeed,
    rngVersion: "business-keyed-v1",
  };
}
function copy(b: BusinessState): BusinessState {
  return {
    ...b,
    strategy: { ...b.strategy },
    founderSkill: { ...b.founderSkill },
    dueBills: b.dueBills.map((i) => ({ ...i })),
    invoices: b.invoices.map((i) => ({ ...i })),
    employees: b.employees.map((e) => ({ ...e })),
    journal: [...b.journal],
    reports: [...b.reports],
    eventMemory: [...b.eventMemory],
  };
}
function posting(s: BusinessState, entry: BusinessEntry) {
  const value = amount(entry.amountVnd);
  if (!value) return;
  const apply = (account: Account, debit: boolean) => {
    const map: Partial<Record<Account, keyof BusinessState>> = {
      CASH: "bankCashVnd",
      INVENTORY: "inventoryCostVnd",
      RECEIVABLE: "receivablesVnd",
      PAYABLE: "payablesVnd",
      DEBT: "debtVnd",
      EQUITY: "equityVnd",
      OWNER_DRAW: "ownerDrawVnd",
    };
    if (account === "REVENUE" || account === "COGS" || account === "EXPENSE") {
      const sign =
        account === "REVENUE" ? (debit ? -1n : 1n) : debit ? -1n : 1n;
      s.retainedProfitVnd = (
        signed(s.retainedProfitVnd) +
        sign * value
      ).toString();
      return;
    }
    const field = map[account]!;
    const normalDebit = [
      "CASH",
      "INVENTORY",
      "RECEIVABLE",
      "OWNER_DRAW",
    ].includes(account);
    const next =
      BigInt(s[field] as string) + (debit === normalDebit ? value : -value);
    if (next < 0n) throw new Error(`Tài khoản doanh nghiệp âm: ${account}`);
    (s as unknown as Record<string, unknown>)[field] = next.toString();
  };
  apply(entry.debit, true);
  apply(entry.credit, false);
  if (s.retainHistory) s.journal.push(entry);
}
export function injectOwnerCapital(
  b: BusinessState,
  value: string,
  date: string,
  id: string,
): BusinessState {
  const s = copy(b);
  if (s.eventMemory.includes(`capital/${id}`)) return s;
  if (s.status === "CLOSED")
    throw new Error("Doanh nghiệp đã đóng; không nhận vốn mới.");
  posting(s, {
    id,
    date,
    debit: "CASH",
    credit: "EQUITY",
    amountVnd: amount(value).toString(),
    kind: "OWNER_CAPITAL",
  });
  s.eventMemory.push(`capital/${id}`);
  assertBusinessBooks(s);
  return s;
}
export function businessOwnerHours(
  b: BusinessState,
  input?: BusinessMonthInput,
): number {
  const action = input?.action;
  if (action === "CLOSE" || action === "PAUSE") return 0;
  if (action === "VALIDATE" || (!action && b.status === "VALIDATING")) return 4;
  if (
    action === "LAUNCH" ||
    action === "RESUME" ||
    ["ACTIVE", "RESTRUCTURING"].includes(b.status)
  )
    return input?.strategy?.ownerHoursPerWeek ?? b.strategy.ownerHoursPerWeek;
  return 0;
}
export function assertBusinessBooks(s: BusinessState) {
  const assets =
      amount(s.bankCashVnd) +
      amount(s.inventoryCostVnd) +
      amount(s.receivablesVnd),
    claims =
      amount(s.payablesVnd) +
      amount(s.debtVnd) +
      amount(s.equityVnd) +
      signed(s.retainedProfitVnd) -
      amount(s.ownerDrawVnd);
  if (assets !== claims)
    throw new Error(
      "Sổ doanh nghiệp không cân: tài sản ≠ nợ + vốn + lợi nhuận giữ lại.",
    );
  if (
    s.invoices.reduce(
      (a, i) => a + (i.status === "DUE" ? amount(i.amountVnd) : 0n),
      0n,
    ) !== amount(s.receivablesVnd)
  )
    throw new Error("Phải thu không khớp hóa đơn.");
  if (
    s.dueBills.reduce(
      (a, i) => a + (i.status === "DUE" ? amount(i.amountVnd) : 0n),
      0n,
    ) !== amount(s.payablesVnd)
  )
    throw new Error("Phải trả không khớp hóa đơn.");
}
export function businessBookValue(s: BusinessState): bigint {
  return (
    amount(s.bankCashVnd) +
    amount(s.inventoryCostVnd) +
    amount(s.receivablesVnd) -
    amount(s.payablesVnd) -
    amount(s.debtVnd)
  );
}
export function advanceBusinessMonth(
  previous: BusinessState,
  input: BusinessMonthInput,
  ctx: BusinessMonthContext,
): { nextState: BusinessState; report: BusinessReport } {
  parseMonth(input.yearMonth);
  if (input.yearMonth === previous.lastProcessedMonth) {
    const report = previous.reports.at(-1);
    if (!report) throw new Error("Thiếu receipt kỳ đã xử lý.");
    return { nextState: previous, report };
  }
  if(previous.lastProcessedMonth&&input.yearMonth!==addMonths(previous.lastProcessedMonth,1))throw new Error('Phải xử lý từng tháng trung gian của doanh nghiệp.');
  if (
    input.yearMonth < previous.openedMonth ||
    (previous.lastProcessedMonth &&
      input.yearMonth < previous.lastProcessedMonth)
  )
    throw new Error("Kỳ doanh nghiệp đã cũ.");
  const s = copy(previous),
    m = input.yearMonth,
    n = daysInMonth(m),
    end = ctx.endDay ?? n;
  if (!safeCount(end, 31) || end < 1 || end > n)
    throw new Error("Ngày kết kỳ không hợp lệ.");
  if (
    !Number.isFinite(ctx.ownerMinutes) ||
    ctx.ownerMinutes < 0 ||
    ctx.ownerMinutes > end * 1440
  )
    throw new Error("Thời gian chủ vượt ngân sách.");
  if (ctx.worldSeed !== s.marketSeed)
    throw new Error("World seed doanh nghiệp không khớp.");
  const prepaid = amount(ctx.prepaidCapitalVnd ?? "0");
  if (prepaid > amount(s.bankCashVnd))
    throw new Error("Vốn đã chuyển không khớp.");
  const opening = amount(s.bankCashVnd) - prepaid;
  let cashIn = prepaid,
    cashOut = 0n,
    revenue = 0n,
    cogs = 0n,
    expenses = 0n,
    capital = prepaid,
    withdrawal = 0n,
    loanFinancing = 0n,
    principalRepaid = 0n;
  const prefix = `${s.id}/${m}`,
    explainers: string[] = [];
  const entry = (
    suffix: string,
    day: number,
    debit: Account,
    credit: Account,
    value: bigint,
    kind: string,
  ) => {
    if (value === 0n) return;
    posting(s, {
      id: `${prefix}/${suffix}`,
      date: dateInMonth(m, Math.min(day, end)),
      debit,
      credit,
      amountVnd: value.toString(),
      kind,
    });
    if (debit === "CASH") cashIn += value;
    if (credit === "CASH") cashOut += value;
  };
  const expense = (
    id: string,
    value: bigint,
    dueDay: number,
    kind: BusinessInvoice["kind"],
    recognitionDay = 1,
  ) => {
    if (!value) return;
    entry(id, recognitionDay, "EXPENSE", "PAYABLE", value, kind);
    expenses += value;
    s.dueBills.push({
      id: `${prefix}/${id}`,
      dueDate: dateInMonth(m, dueDay),
      amountVnd: value.toString(),
      kind,
      status: "DUE",
    });
  };
  const pay = (bill: BusinessInvoice, day: number, limit?: bigint) => {
    const owe = amount(bill.amountVnd),
      cash = amount(s.bankCashVnd);
    let paid = owe < cash ? owe : cash;
    if (limit !== undefined && paid > limit) paid = limit;
    if (paid > 0n) {
      entry(
        `pay/${bill.id}/${day}/${owe}`,
        day,
        "PAYABLE",
        "CASH",
        paid,
        `PAY_${bill.kind}`,
      );
      bill.amountVnd = (owe - paid).toString();
      if (owe === paid) bill.status = "SETTLED";
    }
  };
  const collect = (invoice: BusinessInvoice, day: number) => {
    const value = amount(invoice.amountVnd);
    entry(
      `collect/${invoice.id}`,
      day,
      "CASH",
      "RECEIVABLE",
      value,
      "COLLECT_INVOICE",
    );
    invoice.amountVnd = "0";
    invoice.status = "SETTLED";
  };
  if (
    s.status === "CLOSED" &&
    ((input.action && input.action !== "CLOSE") ||
      input.capitalInjectionVnd ||
      input.hire ||
      input.strategy ||
      input.loanVnd)
  )
    throw new Error("Doanh nghiệp đã đóng chỉ xử lý công nợ còn lại.");
  s.strategy = { ...s.strategy, ...input.strategy };
  const st = s.strategy;
  amount(st.priceVnd);
  amount(st.marketingBudgetVnd);
  if (
    amount(st.priceVnd) === 0n ||
    !safeCount(st.inventoryOrderUnits) ||
    !safeCount(st.collectionDelayMonths, 12) ||
    !Number.isFinite(st.ownerHoursPerWeek) ||
    st.ownerHoursPerWeek < 0 ||
    st.ownerHoursPerWeek > 80 ||
    !Number.isFinite(st.productQuality) ||
    st.productQuality < 0 ||
    st.productQuality > 100
  )
    throw new Error("Chiến lược kinh doanh không hợp lệ.");
  if (input.capitalInjectionVnd) {
    capital = amount(input.capitalInjectionVnd);
    entry("owner-capital", 1, "CASH", "EQUITY", capital, "OWNER_CAPITAL");
  }
  if (input.action === "VALIDATE") {
    if (!["IDEA", "VALIDATING"].includes(s.status))
      throw new Error("Chỉ nghiên cứu trước khai trương.");
    if (
      ctx.ownerMinutes < Math.floor((4 * 60 * end) / 7) ||
      amount(s.bankCashVnd) <
        amount(simulationConfig.business.validationCostVnd)
    )
      throw new Error("Nghiên cứu cần đủ thời gian và tiền.");
    const cost = amount(simulationConfig.business.validationCostVnd);
    entry("validation", 1, "EXPENSE", "CASH", cost, "VALIDATION");
    expenses += cost;
    s.validatedMonths++;
    s.status = "VALIDATING";
    explainers.push(
      "Nghiên cứu tăng thông tin thị trường, không bảo đảm có khách hay lợi nhuận.",
    );
  }
  if (input.action === "LAUNCH") {
    if (
      s.status !== "VALIDATING" ||
      s.validatedMonths < simulationConfig.business.minimumValidatedMonths
    )
      throw new Error("Cần một kỳ kiểm chứng trước khai trương.");
    const setup = amount(simulationConfig.business.setupCostVnd);
    if (amount(s.bankCashVnd) < setup)
      throw new Error("Chưa đủ vốn thiết lập.");
    entry("setup", 1, "EXPENSE", "CASH", setup, "MODELED_SETUP");
    expenses += setup;
    s.permitGranted = true;
    s.status = "ACTIVE";
    s.openedMonth = m;
    s.creditApproved = true;
  }
  if (
    input.action === "PAUSE" &&
    ["ACTIVE", "RESTRUCTURING"].includes(s.status)
  )
    s.status = "PAUSED";
  if (input.action === "RESUME") {
    if (s.status !== "PAUSED")
      throw new Error("Chỉ tiếp tục cửa hàng đang tạm dừng.");
    s.status = "ACTIVE";
  }
  if (input.action === "CLOSE") {
    s.status = "CLOSED";
    const last = addMonths(m, -1);
    for (const e of s.employees)
      if (!e.endDate || e.endDate >= `${m}-01`)
        e.endDate = dateInMonth(last, daysInMonth(last));
    explainers.push(
      "Dừng bán và hợp đồng nhân sự từ đầu tháng; công nợ cũ vẫn phải xử lý.",
    );
  }
  if (input.terminateEmployeeId) {
    const e = s.employees.find((e) => e.id === input.terminateEmployeeId);
    if (!e) throw new Error("Nhân viên không tồn tại.");
    const last = addMonths(m, -1);
    e.endDate = dateInMonth(last, daysInMonth(last));
  }
  if (input.hire) {
    const e = input.hire;
    if (
      s.status !== "ACTIVE" ||
      s.employees.some((x) => x.id === e.id) ||
      !safeCount(e.hoursPerWeek, 80) ||
      e.skill < 0 ||
      e.skill > 100 ||
      e.startDate < `${m}-01` ||
      e.startDate > dateInMonth(m, end)
    )
      throw new Error("Hợp đồng nhân sự không hợp lệ.");
    amount(e.wageVnd);
    s.employees.push({ ...e });
  }
  if (input.action === "PIVOT") {
    if (!["ACTIVE", "RESTRUCTURING", "PAUSED"].includes(s.status))
      throw new Error("Chưa thể chuyển mô hình.");
    if (!input.newSector) throw new Error("Cần chọn ngành mới.");
    s.sectorId = input.newSector;
    s.goodwill *= 0.75;
    s.status = "RESTRUCTURING";
  }
  if (input.action === "TRAIN") {
    if (amount(s.bankCashVnd) < 300000n || ctx.ownerMinutes < 240)
      throw new Error("Đào tạo cần 300.000 VND và 4 giờ.");
    entry("train", 1, "EXPENSE", "CASH", 300000n, "TRAINING");
    expenses += 300000n;
    s.founderSkill.operations = clamp(
      s.founderSkill.operations +
        (1.5 * (100 - s.founderSkill.operations)) / 100,
    );
  }
  if (input.action === "RENEGOTIATE") {
    if (s.status === "CLOSED")
      throw new Error("Không còn hợp đồng thuê hoạt động.");
    if (s.founderSkill.finance >= 50) {
      s.fixedMonthlyCostsVnd = roundedRatio(
        amount(s.fixedMonthlyCostsVnd),
        95n,
        100n,
      ).toString();
      explainers.push(
        "Hợp đồng mô phỏng cho phép giảm 5% chi phí cố định khi kỹ năng tài chính đủ.",
      );
    } else explainers.push("Đàm phán chưa thay đổi được chi phí.");
  }
  if (input.loanVnd) {
    const loan = amount(input.loanVnd),
      limit = amount(s.creditLimitVnd),
      equity =
        amount(s.equityVnd) +
        signed(s.retainedProfitVnd) -
        amount(s.ownerDrawVnd);
    if (
      !s.creditApproved ||
      s.status === "CLOSED" ||
      loan + amount(s.debtVnd) > limit ||
      equity * 2n < loan + amount(s.debtVnd)
    )
      throw new Error("Khoản vay không đạt hạn mức và điều kiện vốn mô phỏng.");
    entry("loan", 1, "CASH", "DEBT", loan, "APPROVED_LOAN");
    loanFinancing = loan;
  }
  const active = ["ACTIVE", "RESTRUCTURING"].includes(s.status);
  if (active && !s.permitGranted)
    throw new Error("Thiếu điều kiện thiết lập mô phỏng.");
  const profile = simulationConfig.modes[ctx.mode],
    market = monthlyBusinessMarket(s, m, ctx);
  let leads = 0,
    conversion = 0,
    orders = 0,
    delivered = 0,
    returns = 0,
    capacity = 0;
  const costRate = BigInt(profile.businessCostBps);
  if (active || s.status === "PAUSED") {
    expense(
      "rent",
      roundedRatio(
        amount(s.fixedMonthlyCostsVnd),
        costRate * BigInt(end),
        10000n * BigInt(n),
      ),
      1,
      "RENT",
    );
    for (const e of s.employees) {
      let days = 0;
      for (let d = 1; d <= end; d++) {
        const date = dateInMonth(m, d);
        if (date >= e.startDate && (!e.endDate || date <= e.endDate)) days++;
      }
      expense(
        `wage/${e.id}`,
        roundedRatio(amount(e.wageVnd), BigInt(days), BigInt(n)),
        Math.min(28, end),
        "WAGE",
      );
    }
  }
  // Date queue: bills, inventory, marketing, sales and collections execute chronologically.
  for (let day = 1; day <= end; day++) {
    const date = dateInMonth(m, day);
    for (const bill of s.dueBills)
      if (bill.status === "DUE" && bill.dueDate <= date) pay(bill, day);
    if (active && day === Math.min(3, end)) {
      const skillBps = 10000 - Math.round(s.founderSkill.operations * 8),
        unitCost = roundedRatio(
          amount(s.perSaleVariableCostVnd),
          costRate * BigInt(skillBps),
          100000000n,
        );
      const credit = s.supplierContract ? amount(s.creditLimitVnd) / 2n : 0n,
        budget = amount(s.bankCashVnd) + credit - amount(s.payablesVnd),
        maxUnits = budget > 0n ? Number(budget / unitCost) : 0;
      const upfrontUnits = Number(
        (amount(s.bankCashVnd) * (s.supplierContract ? 2n : 1n)) / unitCost,
      );
      const units = Math.min(st.inventoryOrderUnits, maxUnits, upfrontUnits),
        cost = unitCost * BigInt(units);
      if (cost) {
        entry(
          "inventory",
          day,
          "INVENTORY",
          "PAYABLE",
          cost,
          "PURCHASE_INVENTORY",
        );
        s.inventoryUnits += units;
        const bill: BusinessInvoice = {
          id: `${prefix}/supplier`,
          dueDate: dateInMonth(addMonths(m, 1), 10),
          amountVnd: cost.toString(),
          kind: "SUPPLIER",
          status: "DUE",
        };
        s.dueBills.push(bill);
        pay(bill, day, s.supplierContract ? cost / 2n : cost);
      }
      if (units < st.inventoryOrderUnits)
        explainers.push(
          "Hạn mức tiền và tín dụng nhà cung cấp làm giảm lượng nhập.",
        );
    }
    if (active && day === Math.min(8, end)) {
      const marketing = roundedRatio(
        amount(st.marketingBudgetVnd),
        BigInt(end),
        BigInt(n),
      );
      const affordable =
        amount(s.bankCashVnd) < marketing ? amount(s.bankCashVnd) : marketing;
      entry("marketing", day, "EXPENSE", "CASH", affordable, "MARKETING");
      expenses += affordable;
      // Use actual paid marketing only; unspent requests do not create free leads.
      const priceRatio =
          simulationConfig.business.referencePriceVnd / Number(st.priceVnd),
        awareness = 1 + Math.sqrt(Number(affordable) / 1000000) * 0.4;
      leads = Math.max(
        0,
        Math.floor(
          (simulationConfig.business.baseReach *
            market.demandMultiplier *
            market.seasonality *
            (1 - market.competition * 0.45) *
            Math.min(2, Math.max(0.15, priceRatio)) *
            awareness *
            (0.6 + s.goodwill / 150) *
            end) /
            n,
        ),
      );
      if (input.action === "FIND_CUSTOMERS" && ctx.ownerMinutes >= 480)
        leads = Math.floor(leads * 1.12);
      conversion = Math.max(
        0.01,
        Math.min(
          0.65,
          0.04 +
            s.founderSkill.sales * 0.0014 +
            s.founderSkill.domain * 0.0005 +
            st.productQuality * 0.0006 +
            s.validatedMonths * 0.005,
        ),
      );
      orders = convertCustomers(
        s.marketSeed,
        `${s.id}/${m}/orders`,
        leads,
        conversion,
      );
      let staffMinutes = 0;
      for (const e of s.employees)
        for (let d = 1; d <= end; d++) {
          const date = dateInMonth(m, d);
          if (date >= e.startDate && (!e.endDate || date <= e.endDate))
            staffMinutes += (e.hoursPerWeek * 60) / 7;
        }
      const usableOwnerMinutes = Math.max(
        0,
        ctx.ownerMinutes -
          (input.action === "TRAIN"
            ? 240
            : input.action === "FIND_CUSTOMERS"
              ? 480
              : 0),
      );
      capacity = Math.max(
        0,
        Math.min(
          s.maxSalesCapacity,
          Math.floor(
            ((usableOwnerMinutes + staffMinutes) *
              (0.55 + s.founderSkill.operations / 200)) /
              45,
          ),
        ),
      );
    }
    if (active && day === Math.min(20, end)) {
      delivered = Math.min(orders, capacity, s.inventoryUnits);
      returns = Math.min(
        delivered,
        Math.floor(delivered * (1 - st.productQuality / 100) * 0.12),
      );
      const cost = s.inventoryUnits
        ? (amount(s.inventoryCostVnd) * BigInt(delivered)) /
          BigInt(s.inventoryUnits)
        : 0n;
      entry("cogs", day, "COGS", "INVENTORY", cost, "COST_OF_GOODS");
      cogs += cost;
      s.inventoryUnits -= delivered;
      revenue = BigInt(delivered - returns) * amount(st.priceVnd);
      entry(
        "sale",
        day,
        "RECEIVABLE",
        "REVENUE",
        revenue,
        "NET_DELIVERED_SALES",
      );
      if (revenue)
        s.invoices.push({
          id: `${prefix}/sales`,
          dueDate:
            st.collectionDelayMonths === 0
              ? date
              : dateInMonth(addMonths(m, st.collectionDelayMonths), 20),
          amountVnd: revenue.toString(),
          kind: "SALE",
          status: "DUE",
        });
      const fulfillment = orders ? delivered / orders : 1;
      s.satisfaction = clamp(
        s.satisfaction * 0.85 +
          0.15 * (st.productQuality * 0.6 + fulfillment * 40),
      );
      s.goodwill = clamp(
        s.goodwill * 0.96 +
          s.satisfaction * 0.04 -
          (orders > delivered ? 1 : 0),
      );
    }
    for (const invoice of s.invoices)
      if (invoice.status === "DUE" && invoice.dueDate <= date)
        collect(invoice, day);
  }
  if (amount(s.debtVnd) > 0n) {
    const interest = roundedRatio(
      amount(s.debtVnd),
      BigInt(simulationConfig.business.monthlyInterestBps * end),
      BigInt(10000 * n),
    );
    expense("interest", interest, end, "INTEREST", end);
    for (const b of s.dueBills)
      if (b.status === "DUE" && b.dueDate <= dateInMonth(m, end)) pay(b, end);
  }
  if (input.loanRepaymentVnd) {
    const value = amount(input.loanRepaymentVnd);
    if (value > amount(s.debtVnd) || value > amount(s.bankCashVnd))
      throw new Error("Trả gốc vượt tiền hoặc dư nợ.");
    entry("repay-loan", end, "DEBT", "CASH", value, "LOAN_REPAYMENT");
    principalRepaid = value;
  }
  if (input.ownerWithdrawalVnd) {
    const value = amount(input.ownerWithdrawalVnd);
    if (
      value > amount(s.bankCashVnd) ||
      s.dueBills.some(
        (b) => b.status === "DUE" && b.dueDate <= dateInMonth(m, end),
      )
    )
      throw new Error(
        "Chưa thể rút vốn khi thiếu tiền hoặc còn hóa đơn quá hạn.",
      );
    withdrawal = value;
    entry(
      "owner-withdraw",
      end,
      "OWNER_DRAW",
      "CASH",
      value,
      "OWNER_WITHDRAWAL",
    );
  }
  s.invoices = s.invoices.filter((i) => i.status === "DUE");
  s.dueBills = s.dueBills.filter((i) => i.status === "DUE");
  const profit = revenue - cogs - expenses,
    operatingBurn =
      cashOut -
      withdrawal -
      principalRepaid -
      (cashIn - capital - loanFinancing),
    net = businessBookValue(s);
  const report: BusinessReport = {
    month: m,
    openingCashVnd: opening.toString(),
    closingCashVnd: s.bankCashVnd,
    revenueVnd: revenue.toString(),
    cogsVnd: cogs.toString(),
    expensesVnd: expenses.toString(),
    profitVnd: profit.toString(),
    cashInVnd: cashIn.toString(),
    cashOutVnd: cashOut.toString(),
    cashFlowVnd: (cashIn - cashOut).toString(),
    ownerCapitalVnd: capital.toString(),
    ownerWithdrawalVnd: withdrawal.toString(),
    leads,
    conversion,
    orders,
    delivered,
    returns,
    capacity,
    ownerMinutes: ctx.ownerMinutes,
    runwayMonths:
      operatingBurn > 0n
        ? Number(amount(s.bankCashVnd)) / Number(operatingBurn)
        : null,
    solvent:
      net >= 0n && !s.dueBills.some((b) => b.dueDate <= dateInMonth(m, end)),
    market,
    explainers: [
      ...explainers,
      `Khách tiềm năng ${leads} → đơn ${orders} → giao ${delivered}; giới hạn năng lực ${capacity}, tồn kho và giá.`,
      revenue > 0n && st.collectionDelayMonths > 0
        ? "Doanh thu có thể chưa thu tiền; phải thu không phải tiền mặt."
        : "Chỉ khoản thực thu mới vào ngân hàng.",
    ],
  };
  if (opening + cashIn - cashOut !== amount(s.bankCashVnd))
    throw new Error("Dòng tiền doanh nghiệp không cân.");
  assertBusinessBooks(s);
  s.lastProcessedMonth = m;
  s.reports = s.retainHistory ? [...s.reports, report] : [report];
  return { nextState: s, report };
}
