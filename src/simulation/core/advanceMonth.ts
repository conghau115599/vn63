import {
  addMonths,
  ageOn,
  dateInMonth,
  daysInMonth,
  monthsBetween,
  nextMonth,
  parseMonth,
  addDays,
} from "../calendar/YearMonth";
import { resolveSchedule, schedules } from "../time/MonthlySchedule";
import {
  amount,
  charge,
  interestVnd,
  post,
  roundedRatio,
} from "../finance/MonthlyLedger";
import { assets, netWorth, updateMarket } from "../investments/MonthlyMarket";
import { eventForMonth, makeDecision, templates } from "../events";
import type { GameState, MonthlyInput, MonthlyResult } from "../types";
import {
  advanceBusinessMonth,
  businessOwnerHours,
  createBusiness,
  injectOwnerCapital,
} from "../business/advanceBusinessMonth";
import { checkConditions, contextKey, relationOf } from "../events/eligibility";
import { evolvePersonality } from "../personality";
import { prepareCareer, developCareer } from "../careers";
import {
  decisionRoute,
  ensureGuardian,
  guardianOption,
} from "../decisions/orchestrator";
import { applyActivityToSchedule } from "../activities";
import { worldContext } from "../world/contracts";

const clamp = (v: number) => Math.max(0, Math.min(100, v));
function log(
  s: GameState,
  id: string,
  date: string,
  kind: string,
  text: string,
) {
  s.cursor!.events.push({ id, happenedAt: date, kind, text });
}
function clone(s: GameState): GameState {
  return {
    ...s,
    careerDevelopment: structuredClone(s.careerDevelopment),
    context: {
      ...s.context,
      flags: [...s.context.flags],
      tags: [...s.context.tags],
    },
    personality: {
      ...s.personality,
      values: { ...s.personality.values },
      baseline: { ...s.personality.baseline },
      lastDelta: { ...s.personality.lastDelta },
    },
    business: s.business
      ? {
          ...s.business,
          strategy: { ...s.business.strategy },
          founderSkill: { ...s.business.founderSkill },
          employees: s.business.employees.map((e) => ({ ...e })),
        }
      : null,
    arcs: s.arcs.map((a) => ({ ...a })),
    eventMemory: [...s.eventMemory],
    migrationNotes: [...s.migrationNotes],
    world: { ...s.world, prices: { ...s.world.prices } },
    job: s.job ? { ...s.job } : null,
    debts: s.debts.map((d) => ({ ...d })),
    holdings: s.holdings.map((h) => ({ ...h })),
    npcs: s.npcs.map((n) => ({
      ...n,
      memories: [...n.memories],
      promises: n.promises.map((p) => ({ ...p })),
    })),
    consequences: s.consequences.map((c) => ({ ...c })),
    obligations: s.obligations.map((o) => ({ ...o })),
    ledger: [...s.ledger],
    reports: [...s.reports],
    eventHistory: { ...s.eventHistory },
    annualReviews: [...s.annualReviews],
    cursor: s.cursor ? structuredClone(s.cursor) : undefined,
    pendingDecision: s.pendingDecision
      ? structuredClone(s.pendingDecision)
      : undefined,
  };
}
function result(
  s: GameState,
  status: MonthlyResult["status"],
  committedMonth?: string,
): MonthlyResult {
  const c = s.cursor,
    last = s.reports.at(-1);
  return {
    nextState: s,
    status,
    committedMonth,
    journal: c?.events ?? last?.events ?? [],
    money: {
      cashOpenVnd: c?.openingCashVnd ?? last?.cashOpenVnd ?? s.cashVnd,
      inflowVnd: c?.inflowVnd ?? last?.inflowVnd ?? "0",
      outflowVnd: c?.outflowVnd ?? last?.outflowVnd ?? "0",
      cashCloseVnd: s.cashVnd,
    },
    pendingDecision: s.pendingDecision,
  };
}
function choice(s: GameState, optionId: string) {
  const d = s.pendingDecision!;
  if (!d.options.some((o) => o.id === optionId))
    throw new Error("Lựa chọn không tồn tại.");
  const t = templates.find((t) => t.id === d.templateId);
  if (d.templateId === "career-contract") {
    const offer = s.careerDevelopment.offer;
    if (!offer || offer.month !== s.currentMonth)
      throw new Error("Lời mời nghề không còn hiệu lực.");
    if (optionId === "accept") {
      post(
        s,
        `${d.id}/final-wages`,
        d.date,
        "job-end-settlement",
        "IN",
        amount(s.wageReceivableVnd),
      );
      s.wageReceivableVnd = "0";
      s.job = {
        occupation: offer.goal,
        salaryVnd: offer.salaryVnd,
        weeklyHours: 35,
        payDay: 25,
        paidOvertime: false,
        startDate: d.date,
        endDate: `${addMonths(s.currentMonth, 6)}-11`,
        proration: "calendar_days",
      };
      s.context.career = "WORKING";
      s.policy = "FAMILY_FIRST";
      // Professional work now occupies work hours; extra training remains optional next month.
      s.careerDevelopment.hours = 0;
      const fresh = resolveSchedule(s.currentMonth, s.policy, {
        age: ageOn(s.birthDate, d.date),
        employed: true,
        obligations: s.obligations,
        businessHoursPerWeek: s.business
          ? businessOwnerHours(s.business, s.cursor!.businessInput)
          : 0,
      });
      if (fresh.infeasible)
        throw new Error("Cần giảm nghĩa vụ trước khi nhận hợp đồng.");
      for (let i = s.cursor!.day - 1; i < fresh.days.length; i++) {
        const old = s.cursor!.time.days[i];
        for (const k of Object.keys(old) as Array<keyof typeof old>)
          s.cursor!.time.byCategory[k] += fresh.days[i][k] - old[k];
        s.cursor!.time.days[i] = fresh.days[i];
      }
    }
    log(
      s,
      `${d.id}/choice`,
      d.date,
      "career",
      optionId === "accept"
        ? `Nhận hợp đồng ${offer.goal === "ATHLETE" ? "vận động viên" : "nghệ sĩ biểu diễn"} 6 tháng; lương phát sinh từ ngày ký. Đây là bước vào nghề, chưa phải danh tiếng.`
        : "Bạn từ chối hợp đồng, vẫn giữ kỹ năng và có thể thử đợt sau.",
    );
    s.careerDevelopment.offer = undefined;
    s.pendingDecision = undefined;
    return;
  }
  if (!t) throw new Error("Sự kiện không thuộc phiên bản hiện tại.");
  const option = t.choices.find((o) => o.id === optionId);
  if (
    !option ||
    !checkConditions(s, option.requirements).every((r) => r.eligible)
  )
    throw new Error(
      "Lựa chọn không đủ điều kiện thời gian, tiền hoặc ngữ cảnh.",
    );
  const key = contextKey(s, t),
    effect = option.effectId;
  const yes = optionId === "accept",
    date = d.date;
  if (t.kind === "project" && yes && s.job) {
    s.policy = "CAREER_SPRINT";
    s.job.paidOvertime = true;
  }
  if (t.kind === "training" && yes) {
    if (amount(s.cashVnd) < 1200000n) throw new Error("Chưa đủ tiền học phí.");
    charge(s, `${d.id}/fee`, date, "training", 1200000n);
    s.policy = "STUDY_UPSKILL";
    s.consequences.push({
      id: `${d.id}/finish`,
      dueMonth: addMonths(s.currentMonth, 3),
      kind: "training",
      status: "PENDING",
    });
  }
  if (t.kind === "family" && yes) {
    const parent = s.npcs.find((n) => n.living && relationOf(n) === "parent");
    if (!parent) throw new Error("Không có người thân phù hợp.");
    parent.promises.push({
      id: `${d.id}/promise`,
      dueMonth: nextMonth(s.currentMonth),
      minutes: 600,
      status: "PENDING",
    });
  }
  if (t.kind === "repair") {
    if (yes) charge(s, `${d.id}/repair`, date, "repair", 800000n);
    else
      s.consequences.push({
        id: `${d.id}/repair`,
        dueMonth: nextMonth(s.currentMonth),
        kind: "repair",
        status: "PENDING",
        amountVnd: "900000",
      });
  }
  if (t.kind === "job" && yes) {
    s.job = {
      salaryVnd: "13000000",
      weeklyHours: 40,
      payDay: 25,
      paidOvertime: false,
      startDate: date,
      proration: "calendar_days",
    };
  }
  if (t.kind === "move" && yes) {
    if (amount(s.cashVnd) < 2000000n)
      throw new Error("Chưa đủ tiền chuyển nhà.");
    charge(s, `${d.id}/move`, date, "relocation", 2000000n);
    s.residenceProvinceId = "da-nang";
    s.context.flags.push("RECENT_MOVE");
  }
  if (t.kind === "offer" && yes) {
    const current = s.cursor!.time.days[s.cursor!.day - 1];
    const displaced = Math.min(120, current.rest);
    current.rest -= displaced;
    current.study += displaced;
    s.cursor!.time.byCategory.rest -= displaced;
    s.cursor!.time.byCategory.study += displaced;
    log(
      s,
      `${d.id}/research`,
      date,
      "story",
      "Bạn dành thời gian tìm hiểu và chưa cam kết vốn.",
    );
  }
  if (t.kind === "childhood" && yes) s.knowledge = clamp(s.knowledge + 1);
  if (effect === "retire") {
    if (s.job) {
      post(
        s,
        `${d.id}/final-wages`,
        date,
        "job-end-settlement",
        "IN",
        amount(s.wageReceivableVnd),
      );
      s.wageReceivableVnd = "0";
      s.job = null;
    }
    s.context.career = "RETIRED";
    s.context.retiredFrom = date;
  }
  if (effect === "reduce-work" && s.job) {
    s.job.salaryVnd = roundedRatio(
      amount(s.job.salaryVnd),
      35n,
      BigInt(s.job.weeklyHours),
    ).toString();
    s.job.weeklyHours = 35;
    s.context.career = "REDUCED";
    s.policy = "FAMILY_FIRST";
  }
  if (effect === "late-job") {
    s.job = {
      salaryVnd: "8000000",
      weeklyHours: 35,
      payDay: 25,
      paidOvertime: false,
      startDate: date,
      proration: "calendar_days",
    };
    s.context.career = "REDUCED";
    s.policy = "FAMILY_FIRST";
  }
  if (effect === "friend-promise") {
    const friend = s.npcs.find((n) => n.living && relationOf(n) === "friend");
    if (friend)
      friend.promises.push({
        id: `${d.id}/promise`,
        dueMonth: nextMonth(s.currentMonth),
        minutes: 360,
        status: "PENDING",
      });
  }
  if (effect.startsWith("care-")) {
    const target = s.npcs.find(
      (n) =>
        n.living &&
        (n.careNeed ?? 0) > 0 &&
        (t.id === "spouse-care"
          ? relationOf(n) === "spouse"
          : t.id === "parent-care"
            ? relationOf(n) === "parent"
            : relationOf(n) === "grandchild"),
    );
    if (!target) throw new Error("Không có người thân cần chăm sóc phù hợp.");
    if (effect === "care-support")
      charge(s, `${d.id}/care-support`, date, "modeled-care-support", 1000000n);
    if (effect === "care-self") {
      const flag = `SELF_CARE_${target.id}`;
      if (!s.context.flags.includes(flag)) s.context.flags.push(flag);
      for (let day = s.cursor!.day; day <= daysInMonth(s.currentMonth); day++) {
        const id = `care/${s.currentMonth}/${target.id}/${day}`;
        if (!s.obligations.some((o) => o.id === id))
          s.obligations.push({
            id,
            date: dateInMonth(s.currentMonth, day),
            minutes: 120,
            category: "care",
          });
      }
    }
    if (effect === "care-unmet") {
      target.unmetNeeds += 2;
      target.memories.push(
        `${s.currentMonth}: Nhu cầu chăm sóc chưa được thu xếp.`,
      );
    }
    s.arcs = s.arcs.filter((a) => a.id !== "family-care");
    s.arcs.push({
      id: "family-care",
      family: "care",
      stage: effect,
      dueMonth: nextMonth(s.currentMonth),
      status: "ACTIVE",
      actorId: target.id,
    });
  }
  if (effect.startsWith("business-") && s.business) {
    const action =
      effect === "business-train"
        ? "TRAIN"
        : effect === "business-negotiate"
          ? "RENEGOTIATE"
          : "FIND_CUSTOMERS";
    if (action === "TRAIN" && amount(s.business.bankCashVnd) < 300000n)
      throw new Error("Cửa hàng chưa đủ tiền đào tạo.");
    s.business.queuedPlan = { yearMonth: nextMonth(s.currentMonth), action };
    s.arcs = s.arcs.filter((a) => a.id !== "business-recovery");
    s.arcs.push({
      id: "business-recovery",
      family: "business",
      stage: action,
      dueMonth: nextMonth(s.currentMonth),
      status: "ACTIVE",
    });
  }
  // A change on day D affects D onward; previous dates are preserved.
  if (
    ((t.kind === "project" || t.kind === "training" || t.kind === "job") &&
      yes) ||
    ["retire", "reduce-work", "late-job", "care-self"].includes(effect)
  ) {
    const fresh = resolveSchedule(s.currentMonth, s.policy, {
      age: ageOn(s.birthDate, date),
      employed: !!s.job,
      obligations: s.obligations,
      businessHoursPerWeek: s.business
        ? businessOwnerHours(s.business, s.cursor!.businessInput)
        : 0,
      practiceHoursPerWeek: s.careerDevelopment.hours,
    });
    if (fresh.infeasible)
      throw new Error("Lịch sau lựa chọn không khả thi với nghĩa vụ đã có.");
    for (let i = s.cursor!.day - 1; i < fresh.days.length; i++) {
      const old = s.cursor!.time.days[i];
      for (const k of Object.keys(old) as Array<keyof typeof old>)
        s.cursor!.time.byCategory[k] += fresh.days[i][k] - old[k];
      s.cursor!.time.days[i] = fresh.days[i];
    }
  }
  const old = s.eventHistory[t.id];
  s.eventHistory[t.id] = {
    lastMonth: s.currentMonth,
    count: (old?.count ?? 0) + 1,
    contextKey: key,
  };
  s.eventMemory.push({
    instanceId: d.id,
    eventId: t.id,
    month: s.currentMonth,
    choiceId: optionId,
    contextKey: key,
    authority: d.authority ?? "SELF",
    sourceGrade: "ASSUMPTION",
  });
  if (t.kind === "training" && yes)
    s.arcs.push({
      id: `training/${d.id}`,
      family: "education",
      stage: "LEARNING",
      dueMonth: addMonths(s.currentMonth, 3),
      status: "ACTIVE",
    });
  log(
    s,
    `${d.id}/choice`,
    date,
    "decision",
    `${d.title}: ${d.options.find((o) => o.id === optionId)!.label}.`,
  );
  s.pendingDecision = undefined;
}
function applyOrders(s: GameState, input: MonthlyInput) {
  if (
    (input.investmentOrders?.length ?? 0) > 0 &&
    ageOn(s.birthDate, dateInMonth(s.currentMonth, 1)) < 18
  )
    throw new Error("Trẻ em chưa có quyền tự giao dịch.");
  for (const o of input.investmentOrders ?? []) {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(o.orderId))
      throw new Error("Mã lệnh không hợp lệ.");
    const asset = assets[o.assetId as keyof typeof assets];
    if (!asset) throw new Error("Tài sản không tồn tại.");
    const quantity = amount(o.quantity);
    if (quantity === 0n) throw new Error("Số lượng phải dương.");
    const id = `${s.lifeId}/${s.currentMonth}/order/${o.orderId}`;
    if (s.cursor!.processedIds.includes(id)) continue;
    const price = amount(s.world.prices[o.assetId]),
      value = quantity * price,
      date = dateInMonth(s.currentMonth, 1);
    if (o.side === "BUY") {
      if (amount(s.cashVnd) < value) throw new Error("Không đủ tiền để mua.");
      post(s, id, date, `buy:${o.assetId}`, "OUT", value);
      s.holdings.push({
        assetId: o.assetId,
        quantity: o.quantity,
        costVnd: value.toString(),
        availableFrom: addMonths(s.currentMonth, asset.settlementMonths),
      });
    } else {
      const liquid = s.holdings.filter(
        (h) => h.assetId === o.assetId && h.availableFrom <= s.currentMonth,
      );
      if (liquid.reduce((a, h) => a + amount(h.quantity), 0n) < quantity)
        throw new Error("Tài sản chưa đủ thanh khoản để bán.");
      let left = quantity;
      for (const h of liquid) {
        const old = amount(h.quantity),
          take = old < left ? old : left;
        h.costVnd = ((amount(h.costVnd) * (old - take)) / old).toString();
        h.quantity = (old - take).toString();
        left -= take;
        if (!left) break;
      }
      s.holdings = s.holdings.filter((h) => amount(h.quantity) > 0n);
      post(s, id, date, `sell:${o.assetId}`, "IN", value);
    }
    log(
      s,
      id,
      date,
      "investment",
      `${o.side === "BUY" ? "Mua" : "Bán"} ${o.quantity} đơn vị ${asset.name}.`,
    );
  }
}
/** Pure transition; a paused cursor is part of the serializable state, never a half-committed month. */
export function advanceMonth(
  state: GameState,
  input: MonthlyInput,
  throughDay?: number,
): MonthlyResult {
  parseMonth(input.yearMonth);
  if (!state.living) throw new Error("Cuộc đời đã kết thúc.");
  if (input.yearMonth !== state.currentMonth)
    throw new Error("Tháng đầu vào đã cũ hoặc không khớp.");
  const s = clone(state),
    month = s.currentMonth,
    n = daysInMonth(month),
    startAge = ageOn(
      s.birthDate,
      dateInMonth(
        month,
        Math.max(
          1,
          month === s.birthDate.slice(0, 7) ? +s.birthDate.slice(8) : 1,
        ),
      ),
    );
  if (
    throughDay !== undefined &&
    (!Number.isInteger(throughDay) || throughDay < 1 || throughDay > n)
  )
    throw new Error("Giới hạn ngày không hợp lệ.");
  const economyReady = worldContext(s).economyReady;
  if (throughDay === undefined && s.calendarMode) s.weeklyCursor = undefined;
  if (
    input.policyChanges?.length &&
    ageOn(
      s.birthDate,
      s.currentDate ?? dateInMonth(month, s.cursor?.day ?? 1),
    ) < 18
  )
    throw new Error(
      "Lịch công việc của người trưởng thành chưa phù hợp độ tuổi.",
    );
  if (
    !economyReady &&
    (input.startBusiness ||
      input.business ||
      input.careerAction ||
      input.investmentOrders?.length ||
      input.giftNpcId ||
      input.careerPlan?.action)
  )
    throw new Error(
      "Chưa có dữ liệu nghề/tiền tệ theo niên đại; nghiệp vụ này chưa mở trong nền lịch sử.",
    );
  if (
    input.choice &&
    s.pendingDecision &&
    decisionRoute(s, s.pendingDecision) === "GUARDIAN"
  )
    throw new Error("Quyết định này thuộc người giám hộ.");
  ensureGuardian(
    s,
    dateInMonth(
      month,
      s.cursor?.day ??
        (month === s.birthDate.slice(0, 7) ? +s.birthDate.slice(8) : 1),
    ),
  );
  if (
    s.cursor &&
    (input.startBusiness ||
      input.careerPlan ||
      input.business ||
      input.careerAction ||
      input.policyChanges?.length ||
      input.investmentOrders?.length ||
      input.giftNpcId)
  )
    throw new Error("Chỉ chỉnh kế hoạch ở đầu tháng.");
  if (!s.cursor) {
    if (input.choice) throw new Error("Không có quyết định đang chờ.");
    for (const p of input.policyChanges ?? []) {
      if (!(p.policyId in schedules))
        throw new Error("Lịch sống không tồn tại.");
      if (p.enabled) s.policy = p.policyId;
    }
    const settleJob =
      !!s.job &&
      ((s.job.endDate && s.job.endDate < `${month}-01`) ||
        input.careerAction === "RETIRE");
    if (settleJob) {
      s.job = null;
      s.context.career =
        input.careerAction === "RETIRE" ? "RETIRED" : "SEEKING";
      if (input.careerAction === "RETIRE")
        s.context.retiredFrom = dateInMonth(month, 1);
    }
    if (input.careerAction && startAge < 18)
      throw new Error("Trẻ em chưa có quyền tự ký/chấm dứt hợp đồng.");
    if (input.careerAction === "SEEK") {
      s.context.career = "SEEKING";
      if (!s.context.flags.includes("LOOKING_FOR_WORK"))
        s.context.flags.push("LOOKING_FOR_WORK");
    }
    if (input.careerAction === "REDUCE" && s.job) {
      s.job.salaryVnd = roundedRatio(
        amount(s.job.salaryVnd),
        35n,
        BigInt(s.job.weeklyHours),
      ).toString();
      s.job.weeklyHours = 35;
      s.policy = "FAMILY_FIRST";
      s.context.career = "REDUCED";
    }
    if (s.job && s.context.career !== "REDUCED") s.context.career = "WORKING";
    if (!s.job && s.context.career === "WORKING") s.context.career = "SEEKING";
    prepareCareer(s, input.careerPlan);
    if (input.careerPlan?.action === "TRYOUT")
      s.obligations.push({
        id: `career-trial/${month}`,
        date: `${month}-01`,
        minutes: 120,
        category: "study",
      });
    s.obligations = s.obligations.filter((o) => !o.id.startsWith("care/"));
    for (const npc of s.npcs)
      if (
        npc.living &&
        (npc.careNeed ?? 0) > 0 &&
        s.context.flags.includes(`SELF_CARE_${npc.id}`)
      )
        for (let day = 1; day <= n; day++)
          s.obligations.push({
            id: `care/${month}/${npc.id}/${day}`,
            date: dateInMonth(month, day),
            minutes: 120,
            category: "care",
          });
    if (input.startBusiness) {
      if (startAge < 18 || s.health < 30)
        throw new Error(
          "Chưa có quyền hoặc năng lực để vận hành doanh nghiệp.",
        );
      if (s.business && s.business.status !== "CLOSED")
        throw new Error("Đã có doanh nghiệp đang tồn tại.");
      s.business = createBusiness({
        id: `${s.lifeId}/venture/${month}`,
        ownerId: s.lifeId,
        provinceId: s.residenceProvinceId,
        month,
        worldSeed: s.world.seed,
        sectorId: input.startBusiness.sectorId,
        retainHistory: s.retainHistory,
        skill: Math.min(80, 20 + s.knowledge * 0.4),
      });
    }
    const planned = s.business
      ? {
          ...(s.business.queuedPlan?.yearMonth === month
            ? s.business.queuedPlan
            : {}),
          ...(input.business ?? {}),
          yearMonth: month,
        }
      : undefined;
    if (input.business && !s.business) throw new Error("Chưa có doanh nghiệp.");
    if (input.business && input.business.yearMonth !== month)
      throw new Error("Tháng doanh nghiệp không khớp.");
    if (s.business) s.business.queuedPlan = undefined;
    const time = resolveSchedule(month, s.policy, {
      age: startAge,
      employed: !!s.job,
      obligations: s.obligations,
      businessHoursPerWeek: s.business
        ? businessOwnerHours(s.business, planned)
        : 0,
      practiceHoursPerWeek: s.careerDevelopment.hours,
    });
    if (time.infeasible)
      throw new Error(
        "Lịch không khả thi. Hãy giảm cam kết trước khi tiếp tục.",
      );
    s.cursor = {
      day:
        s.currentDate?.slice(0, 7) === month
          ? +s.currentDate.slice(8)
          : month === s.birthDate.slice(0, 7)
            ? +s.birthDate.slice(8)
            : 1,
      ...(s.calendarMode
        ? { startDay: s.currentDate ? +s.currentDate.slice(8) : 1 }
        : {}),
      openingCashVnd: s.cashVnd,
      inflowVnd: "0",
      outflowVnd: "0",
      time,
      events: [],
      processedIds: [],
      marketUpdated: false,
      businessInput: planned,
      businessFundingVnd: "0",
    };
    applyActivityToSchedule(s, s.cursor.day);
    if (input.careerPlan?.action) {
      const trial = s.careerDevelopment.trials.at(-1);
      log(
        s,
        `${s.lifeId}/${month}/career-action`,
        `${month}-01`,
        "career",
        input.careerPlan.action === "JOIN_CLUB"
          ? "Bạn tham gia câu lạc bộ; luyện tập có người hướng dẫn giúp tiến bộ tốt hơn."
          : `Tuyển chọn: ${trial!.score.toFixed(1)}/100, ngưỡng 58. ${trial!.passed ? "Đạt: chờ duyệt hợp đồng ngày 12." : "Chưa đạt; luyện thêm và thử lại sau 3 tháng."}`,
      );
    }
    if (settleJob && amount(s.wageReceivableVnd) > 0n) {
      post(
        s,
        `${s.lifeId}/${month}/job-settlement`,
        dateInMonth(month, 1),
        "job-end-settlement",
        "IN",
        amount(s.wageReceivableVnd),
      );
      s.wageReceivableVnd = "0";
    }
    const funding = amount(
      input.startBusiness?.capitalVnd ??
        input.business?.capitalInjectionVnd ??
        "0",
    );
    if (funding > 0n) {
      if (!s.business || amount(s.cashVnd) < funding)
        throw new Error("Ví cá nhân không đủ vốn góp.");
      const id = `${s.lifeId}/${month}/owner-capital`;
      post(s, id, dateInMonth(month, 1), "owner-capital", "OUT", funding);
      s.business = injectOwnerCapital(
        s.business,
        funding.toString(),
        dateInMonth(month, 1),
        id,
      );
      s.cursor.businessFundingVnd = funding.toString();
      if (s.cursor.businessInput)
        s.cursor.businessInput.capitalInjectionVnd = undefined;
    }
    if (input.startBusiness && funding === 0n)
      throw new Error("Cần chọn số vốn cá nhân thực sự chuyển.");
    for (const arc of s.arcs)
      if (arc.status === "ACTIVE" && arc.dueMonth && arc.dueMonth <= month) {
        arc.status = "COMPLETE";
        log(
          s,
          `${arc.id}/${month}/follow-up`,
          dateInMonth(month, 1),
          "arc",
          `Theo dõi mạch ${arc.family}: ${arc.stage}. Các nghĩa vụ còn hiệu lực vẫn được xử lý.`,
        );
      }
    if (input.giftNpcId) {
      const npc = s.npcs.find((n) => n.id === input.giftNpcId && n.living);
      if (startAge < 18 || !npc || amount(s.cashVnd) < 200000n)
        throw new Error("Chưa thể tặng quà.");
      charge(
        s,
        `${s.lifeId}/${month}/gift/${npc.id}`,
        dateInMonth(month, 1),
        "gift",
        200000n,
      );
      s.mood = clamp(s.mood + 5 / (1 + npc.giftCount));
      npc.giftCount++;
      log(
        s,
        `${month}/gift`,
        dateInMonth(month, 1),
        "relationship",
        `Món quà làm ${npc.name} vui; lòng tin vẫn cần thời gian và giữ lời hứa.`,
      );
    }
    applyOrders(s, input);
    if (economyReady) updateMarket(s);
    s.cursor.marketUpdated = true;
  }
  if (s.pendingDecision) {
    if (decisionRoute(s, s.pendingDecision) === "GUARDIAN") {
      const title = s.pendingDecision.title,
        date = s.pendingDecision.date,
        id = s.pendingDecision.id;
      choice(s, guardianOption(s, s.pendingDecision));
      log(
        s,
        `${id}/guardian`,
        date,
        "guardian",
        `Người giám hộ thu xếp: ${title.toLowerCase()}. Bạn được gia đình chăm sóc theo hoàn cảnh.`,
      );
    } else {
      if (!input.choice) return result(s, "PAUSED");
      if (input.choice.eventId !== s.pendingDecision.id)
        throw new Error("Quyết định không khớp.");
      choice(s, input.choice.optionId);
    }
  } else if (input.choice) throw new Error("Không có quyết định đang chờ.");
  const candidate = Object.hasOwn(s.cursor, "eventTemplateId")
      ? templates.find((t) => t.id === s.cursor!.eventTemplateId)
      : eventForMonth(s),
    deathThisMonth =
      monthsBetween(s.birthDate.slice(0, 7), month) >= s.deathLimitMonths,
    finalDay = deathThisMonth ? 15 : n;
  if (s.calendarMode) s.cursor.eventTemplateId = candidate?.id ?? null;
  for (; s.cursor.day <= finalDay; s.cursor.day++) {
    const day = s.cursor.day,
      date = dateInMonth(month, day),
      prefix = `${s.lifeId}/${month}`;
    if (throughDay !== undefined && day > throughDay) {
      if (s.calendarMode) s.currentDate = date;
      return result(s, "IN_PROGRESS");
    }
    if (
      day === 12 &&
      (candidate || s.careerDevelopment.offer) &&
      !s.cursor.processedIds.includes(`${prefix}/event-window`)
    ) {
      s.cursor.processedIds.push(`${prefix}/event-window`);
      const offer = s.careerDevelopment.offer;
      s.pendingDecision = offer
        ? {
            id: `${prefix}/career-contract`,
            templateId: "career-contract",
            date,
            authority: "SELF",
            title: `Hợp đồng ${offer.goal === "ATHLETE" ? "vận động viên" : "nghệ sĩ biểu diễn"}`,
            body: `Bạn đã đạt vòng tuyển chọn. Hợp đồng mẫu 6 tháng, 35 giờ/tuần, lương ${Number(offer.salaryVnd).toLocaleString("vi-VN")} VND/tháng từ ngày ký. Nhận sẽ thay công việc hiện tại. Vào nghề chưa đồng nghĩa nổi tiếng; hợp đồng hết hạn cần tuyển lại.`,
            options: [
              {
                id: "accept",
                label: "Nhận hợp đồng",
                hint: "Thay việc hiện tại; tính lương từ ngày 12",
              },
              {
                id: "decline",
                label: "Từ chối hợp đồng",
                hint: "Giữ công việc và kỹ năng hiện có",
              },
            ],
          }
        : makeDecision(s, candidate!);
      if (s.calendarMode) s.currentDate = date;
      if (decisionRoute(s, s.pendingDecision) === "GUARDIAN") {
        const title = s.pendingDecision.title,
          id = s.pendingDecision.id;
        choice(s, guardianOption(s, s.pendingDecision));
        log(
          s,
          `${id}/guardian`,
          date,
          "guardian",
          `Người giám hộ thu xếp: ${title.toLowerCase()}. Bạn được gia đình chăm sóc theo hoàn cảnh.`,
        );
      } else return result(s, "PAUSED");
    }
    if (day === 1) {
      for (const c of s.consequences.filter(
        (c) => c.status === "PENDING" && c.dueMonth <= month,
      )) {
        c.status = "APPLIED";
        if (c.kind === "repair")
          charge(s, c.id, date, "deferred-repair", amount(c.amountVnd ?? "0"));
        if (c.kind === "training") {
          const studied = s.policy === "STUDY_UPSKILL";
          s.knowledge = clamp(s.knowledge + (studied ? 5 : 1));
          log(
            s,
            c.id,
            date,
            "arc",
            studied
              ? "Khóa học kết thúc; lịch học đều đặn giúp bạn tiến bộ."
              : "Khóa học kết thúc; thời gian học hạn chế nên tiến bộ còn ít.",
          );
        }
      }
    }
    if (
      s.job &&
      date >= s.job.startDate &&
      (!s.job.endDate || date <= s.job.endDate)
    ) {
      const hours = schedules[s.policy].work,
        paidHours = s.job.paidOvertime
          ? hours
          : Math.min(hours, s.job.weeklyHours);
      const earned = roundedRatio(
        amount(s.job.salaryVnd),
        BigInt(paidHours),
        BigInt(s.job.weeklyHours * n),
      );
      s.wageReceivableVnd = (amount(s.wageReceivableVnd) + earned).toString();
    }
    if (s.job && day === Math.min(n, s.job.payDay)) {
      post(
        s,
        `${prefix}/wages`,
        date,
        "wages",
        "IN",
        amount(s.wageReceivableVnd),
      );
      s.wageReceivableVnd = "0";
    }
    if (economyReady && ageOn(s.birthDate, date) >= 18) {
      const rent = s.residenceProvinceId === "da-nang" ? 2800000n : 3000000n;
      const totalEssentials =
        rent + (s.mode === "HARDSHIP" ? 5500000n : 4500000n);
      const today =
        (totalEssentials * BigInt(day)) / BigInt(n) -
        (totalEssentials * BigInt(day - 1)) / BigInt(n);
      charge(s, `${prefix}/living/${day}`, date, "living", today);
    }
    for (const debt of [...s.debts])
      if (day === Math.min(n, debt.dueDay)) {
        const id = `${prefix}/debt/${debt.id}`;
        if (s.cursor.processedIds.includes(id)) continue;
        debt.principalVnd = (
          amount(debt.principalVnd) +
          amount(interestVnd(debt.principalVnd, debt.monthlyRateBps))
        ).toString();
        const target =
          amount(debt.paymentVnd) < amount(debt.principalVnd)
            ? amount(debt.paymentVnd)
            : amount(debt.principalVnd);
        const paid = post(s, id, date, `debt:${debt.id}`, "OUT", target);
        debt.principalVnd = (amount(debt.principalVnd) - paid).toString();
        debt.arrearsVnd = (
          amount(debt.arrearsVnd) > paid ? amount(debt.arrearsVnd) - paid : 0n
        ).toString();
      }
    const daily = s.cursor.time.days[day - 1],
      sleepNeeded = startAge < 6 ? 600 : 480;
    s.sleepDebtMinutes = Math.max(
      0,
      s.sleepDebtMinutes + sleepNeeded - daily.sleep,
    );
    s.fatigue = clamp(
      s.fatigue +
        (daily.work + daily.business > 400 ? 0.4 : 0) +
        (daily.sleep < sleepNeeded ? 0.25 : 0) -
        daily.rest / 1500 -
        daily.exercise / 3000,
    );
    if (
      day === finalDay &&
      s.context.career === "RETIRED" &&
      s.context.pensionEligible
    ) {
      const from =
        s.context.retiredFrom?.slice(0, 7) === month
          ? +s.context.retiredFrom.slice(8)
          : 1;
      const days = Math.max(0, finalDay - from + 1);
      post(
        s,
        `${prefix}/pension`,
        date,
        "pension",
        "IN",
        roundedRatio(
          amount(s.context.pensionMonthlyVnd),
          BigInt(days),
          BigInt(n),
        ),
      );
    }
    if (day === finalDay && deathThisMonth) {
      if (amount(s.wageReceivableVnd) > 0n) {
        post(
          s,
          `${prefix}/terminal-wages`,
          date,
          "terminal-wage-settlement",
          "IN",
          amount(s.wageReceivableVnd),
        );
        s.wageReceivableVnd = "0";
      }
      s.living = false;
      s.deathDate = date;
      log(
        s,
        `${prefix}/death`,
        date,
        "milestone",
        "Cuộc đời khép lại trong kịch bản demo. Thời điểm kết thúc là giả định thiết kế, chưa phải bảng tử vong thực tế.",
      );
    }
  }
  const activeStart =
    s.cursor.startDay ??
    (month === s.birthDate.slice(0, 7) ? +s.birthDate.slice(8) : 1);
  for (const k of Object.keys(s.cursor.time.byCategory) as Array<
    keyof typeof s.cursor.time.byCategory
  >)
    s.cursor.time.byCategory[k] = s.cursor.time.days
      .slice(activeStart - 1, finalDay)
      .reduce((sum, d) => sum + d[k], 0);
  s.cursor.time.usedMinutes = Object.values(s.cursor.time.byCategory).reduce(
    (a, b) => a + b,
    0,
  );
  s.cursor.time.availableMinutes = (finalDay - activeStart + 1) * 1440;
  if (s.business) {
    const businessResult = advanceBusinessMonth(
      s.business,
      s.cursor.businessInput ?? { yearMonth: month },
      {
        worldSeed: s.world.seed,
        mode: s.mode,
        ownerMinutes: s.cursor.time.byCategory.business,
        endDay: finalDay,
        prepaidCapitalVnd: s.cursor.businessFundingVnd,
      },
    );
    s.business = businessResult.nextState;
    const withdrawal = amount(businessResult.report.ownerWithdrawalVnd);
    if (withdrawal)
      post(
        s,
        `${s.lifeId}/${month}/owner-withdraw`,
        dateInMonth(month, finalDay),
        "owner-withdrawal",
        "IN",
        withdrawal,
      );
    const stressed = BigInt(businessResult.report.cashFlowVnd) < 0n;
    s.context.flags = s.context.flags.filter(
      (f) => f !== "BUSINESS_CASH_STRESS",
    );
    if (stressed && ["ACTIVE", "RESTRUCTURING"].includes(s.business.status))
      s.context.flags.push("BUSINESS_CASH_STRESS");
    log(
      s,
      `${s.business.id}/${month}/summary`,
      dateInMonth(month, finalDay),
      "business",
      `Cửa hàng: giao ${businessResult.report.delivered} đơn; doanh thu ${businessResult.report.revenueVnd} VND, lợi nhuận ${businessResult.report.profitVnd} VND, tiền thực còn ${s.business.bankCashVnd} VND.`,
    );
    if (!s.living && ["ACTIVE", "RESTRUCTURING"].includes(s.business.status))
      s.business.status = "PAUSED";
  }
  for (const npc of s.npcs) {
    if (!npc.living) continue;
    if (npc.birthDate > dateInMonth(month, finalDay)) continue;
    if (ageOn(npc.birthDate, dateInMonth(month, finalDay)) >= 96) {
      npc.living = false;
      npc.memories.push(`Khép lại cuộc đời trong kịch bản demo ${month}.`);
      continue;
    }
    const quality =
      (s.cursor.time.byCategory.family * (1 - s.fatigue / 150)) /
      s.npcs.filter((n) => n.living).length;
    npc.unmetNeeds = Math.max(0, npc.unmetNeeds + (quality < 900 ? 1 : -2));
    npc.bond = clamp(npc.bond + (quality >= 900 ? 0.3 : -0.5));
    for (const p of npc.promises)
      if (p.status === "PENDING" && p.dueMonth <= month) {
        p.status = quality >= p.minutes ? "KEPT" : "MISSED";
        npc.trust = clamp(npc.trust + (p.status === "KEPT" ? 1 : -4));
        npc.memories.push(
          `${month}: ${p.status === "KEPT" ? "Giữ lời hẹn" : "Lỡ lời hẹn"} (${p.id}).`,
        );
      }
    npc.memories = npc.memories.slice(-36);
  }
  const family = s.npcs.filter((n) => n.living),
    support = family.length
      ? family.reduce((a, n) => a + n.bond, 0) / family.length
      : 40;
  s.mood = clamp(0.55 * s.mood + 0.45 * 60 - s.fatigue * 0.015);
  s.satisfaction = clamp(
    0.92 * s.satisfaction +
      0.08 * (support * 0.5 + s.health * 0.3 + 20 - s.fatigue * 0.1),
  );
  s.health = clamp(s.health + (s.fatigue < 30 ? 0.05 : -0.08));
  s.knowledge = clamp(s.knowledge + s.cursor.time.byCategory.study / 200000);
  developCareer(s, s.cursor.time.byCategory.practice);
  s.personality = evolvePersonality(
    s,
    s.cursor.time.byCategory,
    (finalDay - activeStart + 1) / n,
  );
  const { days: ignored, ...time } = s.cursor.time;
  void ignored;
  const report = {
    month,
    days: n,
    cashOpenVnd: s.cursor.openingCashVnd,
    cashCloseVnd: s.cashVnd,
    inflowVnd: s.cursor.inflowVnd,
    outflowVnd: s.cursor.outflowVnd,
    time,
    events: s.cursor.events,
    netWorthVnd: netWorth(s).toString(),
    age: ageOn(s.birthDate, dateInMonth(month, finalDay)),
  };
  if (s.retainHistory) s.reports.push(report);
  else s.reports = [report];
  s.committedMonths++;
  s.lastCommittedMonth = month;
  if (month.endsWith("-12") && s.retainHistory) {
    const year = parseMonth(month).year,
      completed = s.reports.filter((r) => r.month.startsWith(`${year}-`));
    s.annualReviews.push({
      year,
      months: completed.length,
      inflowVnd: completed
        .reduce((a, r) => a + amount(r.inflowVnd), 0n)
        .toString(),
      outflowVnd: completed
        .reduce((a, r) => a + amount(r.outflowVnd), 0n)
        .toString(),
    });
  }
  s.cursor = undefined;
  if (s.living) s.currentMonth = nextMonth(month);
  if (s.calendarMode)
    s.currentDate = s.deathDate ?? addDays(dateInMonth(month, finalDay), 1);
  if (
    amount(report.cashOpenVnd) +
      amount(report.inflowVnd) -
      amount(report.outflowVnd) !==
    amount(s.cashVnd)
  )
    throw new Error("Sổ cái không cân.");
  return result(s, s.living ? "COMMITTED" : "DECEASED", month);
}
/** Fast mode calls the same transition. It never supplies an unapproved decision. */
export function advanceMonths(state: GameState, count: number): MonthlyResult {
  if (!Number.isInteger(count) || count < 1 || count > 120)
    throw new Error("Mỗi đợt chạy 1–120 tháng.");
  let current = state,
    r: MonthlyResult | undefined;
  for (let i = 0; i < count; i++) {
    r = advanceMonth(current, { yearMonth: current.currentMonth });
    current = r.nextState;
    if (r.status !== "COMMITTED") break;
  }
  return r!;
}
