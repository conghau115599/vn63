import type { Decision, GameState } from "../types";
import { ageOn } from "../calendar/YearMonth";
import { random } from "../rng";
export function decisionRoute(
  s: GameState,
  d: Decision,
): "GUARDIAN" | "MUST_PAUSE" {
  return ageOn(s.birthDate, d.date) < 5 ||
    (ageOn(s.birthDate, d.date) < 18 && d.authority === "CAREGIVER")
    ? "GUARDIAN"
    : "MUST_PAUSE";
}
export function ensureGuardian(s: GameState, date: string) {
  if (ageOn(s.birthDate, date) >= 18) return;
  if (
    !s.npcs.some(
      (n) =>
        n.living &&
        n.birthDate <= date &&
        (n.relation === "parent" || n.id === "guardian-support"),
    )
  ) {
    s.npcs.push({
      id: "guardian-support",
      name: "Nguyễn An Bình",
      role: "Người giám hộ hỗ trợ",
      relation: "relative",
      birthDate: `${+s.birthDate.slice(0, 4) - 35}-01-01`,
      living: true,
      trust: 60,
      bond: 60,
      unmetNeeds: 0,
      giftCount: 0,
      memories: [
        "Người giám hộ hỗ trợ trong kịch bản giả lập; không suy ra quan hệ huyết thống.",
      ],
      promises: [],
    });
  }
  if (!s.context.flags.includes("CAREGIVER_AVAILABLE"))
    s.context.flags.push("CAREGIVER_AVAILABLE");
}
export function guardianOption(s: GameState, d: Decision) {
  const options = d.options.filter((o) => !o.disabledReason);
  if (!options.length) throw new Error("Không có phương án giám hộ khả thi.");
  return options[
    Math.floor(random(s.seed, "guardian-choice", d.id) * options.length)
  ].id;
}
