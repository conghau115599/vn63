import { ageOn, dateInMonth, monthsBetween } from "../calendar/YearMonth";
import { random } from "../rng";
import { simulationConfig } from "../config";
import type { GameState, NPC } from "../types";
import type {
  Condition,
  EligibilityResult,
  EventInspector,
  EventSpec,
  EventState,
} from "./types";
export const relationOf = (n: NPC) =>
  n.relation ??
  (n.id === "mother" ? "parent" : n.id === "friend" ? "friend" : "relative");
export function checkConditions(
  s: EventState,
  conditions: Condition[],
): Array<{ code: string; detail: string; eligible: boolean }> {
  return conditions.map((c) => {
    let eligible = false,
      detail = "";
    switch (c.kind) {
      case "flag":
        eligible = s.context.flags.includes(c.flag) === (c.present ?? true);
        detail = `Cờ ${c.flag}`;
        break;
      case "settlement":
        eligible = s.context.settlement === c.value;
        detail = `Cư trú ${c.value}`;
        break;
      case "resources":
        eligible = s.context.resources === c.value;
        detail = `Nguồn lực ${c.value}`;
        break;
      case "marital":
        eligible = s.context.maritalStatus === c.value;
        detail = `Gia đình ${c.value}`;
        break;
      case "career":
        eligible = c.values.includes(s.context.career);
        detail = `Tình trạng nghề ${c.values.join(", ")}`;
        break;
      case "cash":
        eligible = BigInt(s.cashVnd) >= BigInt(c.minimumVnd);
        detail = `Cần ${c.minimumVnd} VND`;
        break;
      case "health":
        eligible = s.health >= c.minimum;
        detail = `Năng lực sức khỏe ≥ ${c.minimum}`;
        break;
      case "business":
        eligible = !!s.business && c.statuses.includes(s.business.status);
        detail = `Doanh nghiệp ${c.statuses.join(", ")}`;
        break;
      case 'priorEvent':eligible=c.choiceId?s.eventMemory.some(e=>e.eventId===c.eventId&&e.choiceId===c.choiceId):(s.eventHistory[c.eventId]?.count??0)>0;detail=`Đã có sự kiện ${c.eventId}${c.choiceId?` / ${c.choiceId}`:''}`;break;
      case 'arc':eligible=s.arcs.some(a=>a.family===c.family&&a.status===c.status&&(!c.stage||a.stage===c.stage));detail=`Mạch ${c.family} / ${c.status}`;break;
      case "job":
        eligible = (!!s.job&&s.job.startDate<=dateInMonth(s.currentMonth,12)&&(!s.job.endDate||s.job.endDate>=dateInMonth(s.currentMonth,12))) === c.exists;
        detail = c.exists
          ? "Có hợp đồng việc làm"
          : "Không có hợp đồng việc làm";
        break;
      case "dependent":
        eligible = s.npcs.some(
          (n) =>
            n.living &&
            (n.careNeed ?? 0) > 0 &&
            (!c.relation || relationOf(n) === c.relation),
        );
        detail = "Có người thân đang sống cần chăm sóc";
        break;
      case "employmentOpportunity":
        eligible = s.context.employmentOpportunity;
        detail = "Có cơ hội việc làm trong kịch bản";
        break;
      case "children":
        eligible =
          s.npcs.filter((n) => n.living && relationOf(n) === "child").length >=
          c.minimum;
        detail = "Có con trong lịch sử thực";
        break;
      case "grandchildren":
        eligible =
          s.npcs.filter((n) => n.living && relationOf(n) === "grandchild")
            .length >= c.minimum;
        detail = "Có cháu trong lịch sử thực";
        break;
    }
    return { code: c.kind, detail, eligible };
  });
}
export function contextKey(s: EventState, event: EventSpec): string {
  return JSON.stringify({
    event: event.eventId,
    province: s.residenceProvinceId,
    settlement: s.context.settlement,
    resources: s.context.resources,
    marital: s.context.maritalStatus,
    career: s.context.career,
    flags: [...s.context.flags].sort(),
    actors: s.npcs.map((n) => [n.id, n.living, relationOf(n), n.careNeed ?? 0]),
    business: s.business ? [s.business.id, s.business.status] : null,
    job: s.job ? [s.job.startDate, s.job.salaryVnd] : null,
  });
}
export function isEventEligible(
  s: EventState,
  event: EventSpec,
): EligibilityResult {
  const date = dateInMonth(s.currentMonth, 12),
    reasons = checkConditions(s, event.prerequisites),
    key = contextKey(s, event);
  const add = (code: string, eligible: boolean, detail: string) =>
    reasons.push({ code, eligible, detail });
  add("living", s.living, "Nhân vật còn sống");
  if (date < s.birthDate) add("birth", false, "Chưa đến ngày sinh");
  else {
    const age = ageOn(s.birthDate, date);
    if (event.ageRange)
      add(
        "age",
        age >= event.ageRange.min && age <= event.ageRange.max,
        "Độ tuổi phù hợp với quyền quyết định",
      );
  }
  if (event.regions?.length)
    add(
      "region",
      event.regions.includes(s.residenceProvinceId),
      "Đúng vùng trong sự kiện",
    );
  if (event.occupations?.length)
    add(
      "occupation",
      event.occupations.includes(s.context.career),
      "Đúng trạng thái nghề",
    );
  for (const flag of event.forbiddenFlags)
    add(
      "forbidden-flag",
      !s.context.flags.includes(flag),
      `Không có cờ ${flag}`,
    );
  for (const tag of event.contextTags)
    add("context-tag", s.context.tags.includes(tag), `Ngữ cảnh ${tag}`);
  for (const actor of event.requiredActors)
    add(
      "actor",
      s.npcs.some(
        (n) => relationOf(n) === actor.relation && n.living === actor.living && n.birthDate<=date,
      ),
      `Cần ${actor.relation} ${actor.living ? "đang sống" : "đã mất"}`,
    );
  const h = s.eventHistory[event.eventId];
  if (h) {
    add(
      "cooldown",
      monthsBetween(h.lastMonth, s.currentMonth) >= event.cooldownMonths,
      "Đủ khoảng cách tháng",
    );
    add(
      "occurrences",
      h.count < event.maxLifetimeOccurrences,
      "Chưa vượt số lần tối đa",
    );
    if (event.requireContextChange && h.contextKey)
      add(
        "context-change",
        key !== h.contextKey,
        "Hoàn cảnh đã thay đổi từ lần trước",
      );
  }
  if (event.choices.length)
    add(
      "choices",
      event.choices.some((c) =>
        checkConditions(s, c.requirements).every((r) => r.eligible),
      ),
      "Có ít nhất một lựa chọn khả thi",
    );
  return {
    eligible: reasons.every((r) => r.eligible),
    reasons,
    contextKey: key,
  };
}
export function inspectEvents(
  s: EventState,
  specs: EventSpec[],
): EventInspector[] {
  return specs.map((spec) => ({
    eventId: spec.eventId,
    title: spec.title,
    ...isEventEligible(s, spec),
  }));
}
export function selectEligibleEvent<T extends EventSpec>(
  s: GameState,
  specs: T[],
): T | undefined {
  const exposed =
    random(s.seed, "event-exposure", s.currentMonth) <
    simulationConfig.modes[s.mode].eventExposure;
  const careContext = s.npcs.some((n) => n.living && (n.careNeed ?? 0) > 0);
  if (!exposed && !careContext) return;
  const candidates = specs.filter(
    (e) =>
      (exposed || e.stakes === "CRITICAL") && isEventEligible(s, e).eligible,
  );
  if (!candidates.length) return;
  const urgent = candidates.filter((e) => e.stakes === "CRITICAL");
  if (!urgent.length && !exposed) return;
  const pool = urgent.length ? urgent : candidates;
  const scored = pool.map((e) => {
    const continuity =
      e.arcId && s.arcs.some((a) => a.id === e.arcId && a.status === "ACTIVE")
        ? 2
        : 1;
    const weight = Math.max(0.01, e.salience * continuity);
    const u = Math.max(
      Number.EPSILON,
      random(s.seed, `event-selection/${e.eventId}`, s.currentMonth),
    );
    return { e, score: -Math.log(u) / weight };
  });
  scored.sort(
    (a, b) => a.score - b.score || a.e.eventId.localeCompare(b.e.eventId),
  );
  return scored[0]?.e;
}
