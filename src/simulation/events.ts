import type { Decision, GameState } from "./types";
import { ageOn, dateInMonth, monthsBetween } from "./calendar/YearMonth";
import { random } from "./rng";
import type { EventSpec, EventChoice } from "./events/types";
import { checkConditions, selectEligibleEvent } from "./events/eligibility";
export type EventTemplate = {
  id: string;
  minAge: number;
  maxAge: number;
  cooldownMonths: number;
  maxOccurrences: number;
  title: string;
  body: string;
  kind:
    | "project"
    | "training"
    | "family"
    | "repair"
    | "job"
    | "offer"
    | "move"
    | "childhood"
    | "aging"
    | "care"
    | "business"
    | "companionship";
  requiresJob?: boolean;
};
const legacyTemplates: EventTemplate[] = [
  {
    id: "project",
    minAge: 18,
    maxAge: 65,
    cooldownMonths: 24,
    maxOccurrences: 5,
    title: "Một dự án cần thêm người",
    body: "Công ty đề nghị lịch làm 55 giờ mỗi tuần. Phụ lục trả thêm được nêu trong lời mời; thời gian dành cho gia đình sẽ giảm.",
    kind: "project",
    requiresJob: true,
  },
  {
    id: "course",
    minAge: 18,
    maxAge: 65,
    cooldownMonths: 18,
    maxOccurrences: 5,
    title: "Lớp học buổi tối",
    body: "Khóa học kéo dài ba tháng, học phí 1,2 triệu đồng. Bạn cần giữ lịch học và chờ kết quả.",
    kind: "training",
  },
  {
    id: "mother-visit",
    minAge: 18,
    maxAge: 85,
    cooldownMonths: 12,
    maxOccurrences: 5,
    title: "Một lời hẹn về thăm nhà",
    body: "Mẹ mong bạn dành thời gian trong tháng sau. Một lời hứa cần sự hiện diện, không chỉ một món quà.",
    kind: "family",
  },
  {
    id: "bike-repair",
    minAge: 18,
    maxAge: 80,
    cooldownMonths: 18,
    maxOccurrences: 4,
    title: "Chiếc xe cần sửa",
    body: "Xe đi lại có trục trặc. Bạn có thể sửa ngay hoặc lên lịch vào tháng sau.",
    kind: "repair",
  },
  {
    id: "job-offer",
    minAge: 18,
    maxAge: 62,
    cooldownMonths: 24,
    maxOccurrences: 6,
    title: "Một lời mời làm việc",
    body: "Một đơn vị gửi đề nghị công việc lương 13 triệu/tháng theo hợp đồng mô phỏng. Đổi việc có hiệu lực từ hôm nay.",
    kind: "job",
  },
  {
    id: "investment-offer",
    minAge: 18,
    maxAge: 70,
    cooldownMonths: 24,
    maxOccurrences: 3,
    title: "Lời mời góp vốn",
    body: "Người quen giới thiệu một dự án. Thông tin hiện có chưa đủ để kết luận; bạn có thể dành thời gian tìm hiểu hoặc từ chối.",
    kind: "offer",
  },
  {
    id: "relocation",
    minAge: 18,
    maxAge: 65,
    cooldownMonths: 60,
    maxOccurrences: 2,
    title: "Cơ hội chuyển nơi ở",
    body: "Bạn cân nhắc chuyển tới Đà Nẵng. Chi phí chuyển nhà là 2 triệu đồng; quê sinh vẫn được giữ trong ký ức.",
    kind: "move",
  },
  {
    id: "school-club",
    minAge: 6,
    maxAge: 17,
    cooldownMonths: 18,
    maxOccurrences: 4,
    title: "Câu lạc bộ sau giờ học",
    body: "Gia đình cân nhắc một hoạt động kéo dài học kỳ. Người giám hộ sẽ quyết định cách sắp xếp chăm sóc và học tập.",
    kind: "childhood",
  },
  {
    id: "early-care",
    minAge: 0,
    maxAge: 5,
    cooldownMonths: 18,
    maxOccurrences: 2,
    title: "Lịch chăm sóc mới",
    body: "Người giám hộ đang sắp xếp giờ chăm sóc. Gia đình chọn ưu tiên sinh hoạt ổn định hoặc thêm hoạt động khám phá.",
    kind: "childhood",
  },
  {
    id: "certification",
    minAge: 18,
    maxAge: 60,
    cooldownMonths: 30,
    maxOccurrences: 3,
    title: "Học để đổi hướng",
    body: "Một khóa kỹ năng mở đăng ký. Kết quả còn phụ thuộc thời gian bạn thực sự dành cho việc học.",
    kind: "training",
  },
  {
    id: "family-meal",
    minAge: 18,
    maxAge: 85,
    cooldownMonths: 18,
    maxOccurrences: 4,
    title: "Bữa cơm cuối tuần",
    body: "Gia đình muốn hẹn một buổi gặp trong tháng tới. Bạn có thể cam kết thời gian hoặc nói rõ rằng chưa thể hứa.",
    kind: "family",
  },
  {
    id: "workshop",
    minAge: 18,
    maxAge: 65,
    cooldownMonths: 30,
    maxOccurrences: 3,
    title: "Dự án của nhóm nhỏ",
    body: "Nhóm đang thiếu người. Đề nghị tăng giờ làm có phụ lục trả công, nhưng không bảo đảm thăng chức.",
    kind: "project",
    requiresJob: true,
  },
  {
    id: "home-repair",
    minAge: 18,
    maxAge: 90,
    cooldownMonths: 30,
    maxOccurrences: 4,
    title: "Góc nhà bị dột",
    body: "Một sửa chữa nhỏ cần thu xếp tiền và thời gian. Chọn xử lý ngay hoặc hẹn tháng sau.",
    kind: "repair",
  },
  {
    id: "peer-learning",
    minAge: 18,
    maxAge: 60,
    cooldownMonths: 24,
    maxOccurrences: 4,
    title: "Nhóm học nghề",
    body: "Bạn bè rủ học một kỹ năng mới trong ba tháng. Học phí và giờ học là những cam kết thực tế.",
    kind: "training",
  },
  {
    id: "new-team",
    minAge: 18,
    maxAge: 62,
    cooldownMonths: 36,
    maxOccurrences: 4,
    title: "Đội ngũ mới đang tuyển",
    body: "Công việc mới có mức lương mô phỏng 13 triệu đồng. Bạn cân nhắc điều gì phù hợp với giai đoạn này.",
    kind: "job",
  },
  {
    id: "friend-promise",
    minAge: 18,
    maxAge: 85,
    cooldownMonths: 24,
    maxOccurrences: 4,
    title: "Lời hẹn với người thân",
    body: "Một người thân cần bạn dành thời gian lắng nghe tháng tới. Có thể nhận lời hoặc đặt lại kỳ vọng ngay từ đầu.",
    kind: "family",
  },
  {
    id: "investment-circle",
    minAge: 18,
    maxAge: 70,
    cooldownMonths: 36,
    maxOccurrences: 3,
    title: "Buổi giới thiệu kinh doanh",
    body: "Một lời mời đang được chia sẻ trong nhóm quen. Bạn chưa biết chất lượng dự án, và không cần quyết định đầu tư ngay.",
    kind: "offer",
  },
  {
    id: "school-project",
    minAge: 6,
    maxAge: 17,
    cooldownMonths: 18,
    maxOccurrences: 4,
    title: "Dự án ở trường",
    body: "Một hoạt động học kỳ cần sự hỗ trợ của người giám hộ. Gia đình cân nhắc lịch học và thời gian nghỉ.",
    kind: "childhood",
  },
  {
    id: "child-hobby",
    minAge: 6,
    maxAge: 17,
    cooldownMonths: 24,
    maxOccurrences: 3,
    title: "Một sở thích mới",
    body: "Bạn muốn thử hoạt động mới. Người giám hộ cùng bạn chọn lịch phù hợp, không cần vội quyết định tương lai.",
    kind: "childhood",
  },
  {
    id: "care-routine",
    minAge: 0,
    maxAge: 5,
    cooldownMonths: 18,
    maxOccurrences: 2,
    title: "Nhịp sinh hoạt gia đình",
    body: "Lịch chăm sóc cần điều chỉnh. Gia đình cân nhắc giữa ổn định giờ giấc và thêm trải nghiệm.",
    kind: "childhood",
  },
];
const option = (
  id: string,
  label: string,
  hint: string,
  effectId: string,
  requirements: EventChoice["requirements"] = [],
): EventChoice => ({ id, label, hint, effectId, requirements });
export type ContextEvent = EventTemplate & EventSpec;
const enriched = legacyTemplates.map((t): ContextEvent => {
  const prerequisites: EventSpec["prerequisites"] = [];
  if (t.requiresJob) prerequisites.push({ kind: "job", exists: true });
  if (t.kind === "job")
    prerequisites.push(
      {
        kind: "career",
        values: ["NOT_WORKING", "SEEKING", "WORKING", "REDUCED"],
      },
      { kind: "employmentOpportunity" },
    );
  if (t.kind === "move")
    prerequisites.push({ kind: "flag", flag: "RECENT_MOVE", present: false });
  if (t.kind === "childhood")
    prerequisites.push({ kind: "flag", flag: "CAREGIVER_AVAILABLE" });
  if (["early-care", "care-routine"].includes(t.id))
    prerequisites.push({
      kind: "settlement",
      value: t.id === "early-care" ? "URBAN" : "RURAL",
    });
  if(t.id==='bike-repair')prerequisites.push({kind:'flag',flag:'OWNS_VEHICLE'});
  if(t.id==='home-repair')prerequisites.push({kind:'flag',flag:'HOUSING_REPAIR_OBLIGATION'});
  if (t.id === "early-care")
    prerequisites.push({ kind: "resources", value: "AFFLUENT" });
  const acceptRequirements: EventChoice["requirements"] =
    t.kind === "training"
      ? [{ kind: "cash", minimumVnd: "1200000" }]
      : t.kind === "move"
        ? [{ kind: "cash", minimumVnd: "2000000" }]
        : [];
  return {
    ...t,
    eventId: t.id,
    schemaVersion: 1,
    eventType:
      t.kind === "childhood"
        ? "education"
        : t.kind === "family"
          ? "relationship"
          : t.kind === "move"
            ? "migration"
            : t.kind === "project" || t.kind === "job"
              ? "work"
              : "finance",
    ageRange: { min: t.minAge, max: t.maxAge },
    prerequisites,
    forbiddenFlags: [],
    contextTags: [],
    requiredActors:
      t.kind === "family" || t.kind === "childhood"
        ? [{ relation: "parent", living: true }]
        : [],
    maxLifetimeOccurrences: t.maxOccurrences,
    stakes: "DECISION",
    deferredEffects: [],
    sourceGrade: "ASSUMPTION",
    salience: 1,
    choices: [
      option(
        "accept",
        t.kind === "family"
          ? "Hẹn tháng sau"
          : t.kind === "offer"
            ? "Tìm hiểu thêm"
            : t.kind === "childhood"
              ? "Thêm hoạt động học hỏi"
              : "Đồng ý",
        "Thời gian và chi phí được kiểm tra trước khi thực hiện",
        t.kind,
        acceptRequirements,
      ),
      option(
        "decline",
        t.kind === "repair" ? "Lên lịch tháng sau" : "Giữ kế hoạch hiện tại",
        "Nói rõ kỳ vọng và giữ lại kế hoạch hiện tại",
        "decline",
      ),
    ],
  };
});
function dynamic(
  id: string,
  kind: EventTemplate["kind"],
  title: string,
  body: string,
  minAge: number,
  prerequisites: EventSpec["prerequisites"],
  choices: EventChoice[],
  extra: Partial<EventSpec> = {},
): ContextEvent {
  return {
    id,
    kind,
    title,
    body,
    minAge,
    maxAge: 120,
    cooldownMonths: 12,
    maxOccurrences: 3,
    eventId: id,
    schemaVersion: 1,
    eventType:
      kind === "business"
        ? "business"
        : kind === "care"
          ? "health"
          : kind === "aging"
            ? "aging"
            : "relationship",
    ageRange: { min: minAge, max: 120 },
    prerequisites,
    forbiddenFlags: [],
    contextTags: [],
    requiredActors: [],
    maxLifetimeOccurrences: 3,
    stakes: "DECISION",
    deferredEffects: [],
    sourceGrade: "ASSUMPTION",
    salience: 1,
    choices,
    ...extra,
  };
}
export const templates: ContextEvent[] = [
  ...enriched,
  dynamic(
    "later-work",
    "aging",
    "Giữ việc hay giảm nhịp?",
    "Bạn đang có hợp đồng và có thể tiếp tục làm việc. Nghỉ hưu phụ thuộc nguồn lực và lựa chọn, không tự xảy ra ở tuổi 65.",
    60,
    [
      { kind: "job", exists: true },
      { kind: "health", minimum: 30 },
    ],
    [
      option(
        "accept",
        "Giảm giờ từ hôm nay",
        "Thu nhập theo giờ giảm, thời gian mềm tăng",
        "reduce-work",
      ),
      option(
        "retire",
        "Nghỉ việc từ hôm nay",
        "Không tự có lương hưu nếu chưa đủ điều kiện",
        "retire",
      ),
      option(
        "decline",
        "Tiếp tục công việc",
        "Giữ hợp đồng hiện tại",
        "decline",
      ),
    ],
    { requireContextChange: true },
  ),
  dynamic(
    "later-companionship",
    "companionship",
    "Một cuộc hẹn giản dị",
    "Bạn sống một mình và một người bạn còn trong mạng lưới muốn gặp gỡ. Không giả định bạn có con hay cháu.",
    60,
    [{ kind: "marital", value: "WIDOWED" }],
    [
      option(
        "accept",
        "Hẹn gặp tháng tới",
        "Dành thời gian thật để giữ lời hẹn",
        "friend-promise",
      ),
      option(
        "decline",
        "Hẹn dịp khác",
        "Không tạo một lời hứa chưa chắc giữ được",
        "decline",
      ),
    ],
    { requiredActors: [{ relation: "friend", living: true }] },
  ),
  dynamic(
    "spouse-care",
    "care",
    "Người bạn đời cần chăm sóc",
    "Người bạn đời đang sống cần trợ giúp. Bạn phải sắp xếp thời gian hoặc thuê hỗ trợ; món quà không thay thế việc chăm sóc.",
    18,
    [
      { kind: "marital", value: "MARRIED" },
      { kind: "dependent", relation: "spouse" },
    ],
    [
      option(
        "accept",
        "Tự chăm sóc từ hôm nay",
        "Dịch 2 giờ/ngày từ thời gian mềm",
        "care-self",
      ),
      option(
        "support",
        "Thuê hỗ trợ tháng này",
        "Chi 1.000.000 VND theo hợp đồng mẫu",
        "care-support",
        [{ kind: "cash", minimumVnd: "1000000" }],
      ),
      option(
        "decline",
        "Chưa thu xếp được",
        "Nhu cầu và cam kết còn được ghi nhớ",
        "care-unmet",
      ),
    ],
    {
      requiredActors: [{ relation: "spouse", living: true }],
      stakes: "CRITICAL",
      arcId: "family-care",
    },
  ),
  dynamic(
    "parent-care",
    "care",
    "Gia đình cần bạn thu xếp",
    "Một người thân đang cần chăm sóc. Thời gian ở cửa hàng và bên người thân cùng nằm trong một lịch.",
    18,
    [{ kind: "dependent", relation: "parent" }],
    [
      option(
        "accept",
        "Dành thời gian chăm sóc",
        "Dịch 2 giờ/ngày; năng lực cửa hàng phụ thuộc thời gian còn lại",
        "care-self",
      ),
      option(
        "support",
        "Thuê người hỗ trợ",
        "Chi 1.000.000 VND, không thay thế gắn bó",
        "care-support",
        [{ kind: "cash", minimumVnd: "1000000" }],
      ),
      option(
        "decline",
        "Chưa thu xếp được",
        "Ghi lại nhu cầu chưa được đáp ứng",
        "care-unmet",
      ),
    ],
    {
      requiredActors: [{ relation: "parent", living: true }],
      stakes: "CRITICAL",
      arcId: "family-care",
    },
  ),
  dynamic(
    "grandchild-care",
    "care",
    "Một lời nhờ trông cháu",
    "Cháu của bạn đã có trong lịch sử gia đình và cần người chăm sóc. Bạn cân nhắc khả năng thực tế của mình.",
    55,
    [
      { kind: "grandchildren", minimum: 1 },
      { kind: "dependent", relation: "grandchild" },
    ],
    [
      option(
        "accept",
        "Nhận một phần chăm sóc",
        "Dành thời gian từ hôm nay",
        "care-self",
      ),
      option(
        "decline",
        "Nói rõ giới hạn",
        "Không mặc định nhận trách nhiệm",
        "decline",
      ),
    ],
    { requiredActors: [{ relation: "grandchild", living: true }] },
  ),
  dynamic(
    "business-response",
    "business",
    "Cửa hàng cần một hướng điều chỉnh",
    "Dòng tiền hoạt động tháng trước âm. Bạn có thể tìm khách, học vận hành, đàm phán hoặc giữ kế hoạch. Nỗ lực không bảo đảm có lãi.",
    18,
    [
      { kind: "business", statuses: ["ACTIVE", "RESTRUCTURING"] },
      { kind: "flag", flag: "BUSINESS_CASH_STRESS" },
    ],
    [
      option(
        "accept",
        "Tìm khách từ tháng sau",
        "Dành 8 giờ cho tiếp cận, trừ khỏi giờ phục vụ",
        "business-customers",
      ),
      option(
        "train",
        "Học vận hành từ tháng sau",
        "300.000 VND và 4 giờ hoạt động",
        "business-train",
      ),
      option(
        "negotiate",
        "Thử đàm phán tháng sau",
        "Chỉ đổi chi phí nếu đáp ứng điều kiện hợp đồng",
        "business-negotiate",
      ),
      option(
        "decline",
        "Giữ kế hoạch và theo dõi",
        "Công nợ vẫn được xử lý",
        "decline",
      ),
    ],
    {
      arcId: "business-recovery",
      cooldownMonths: 3,
      maxLifetimeOccurrences: 12,
    },
  ),
  dynamic(
    "return-work",
    "aging",
    "Một công việc phù hợp hơn?",
    "Bạn có cơ hội việc làm và còn khả năng lao động. Tuổi không tự đóng quyền lựa chọn của bạn.",
    60,
    [
      { kind: "job", exists: false },
      { kind: "employmentOpportunity" },
      { kind: "health", minimum: 40 },
    ],
    [
      option(
        "accept",
        "Nhận hợp đồng mẫu",
        "Lương theo công việc, hiệu lực từ hôm nay",
        "late-job",
      ),
      option(
        "decline",
        "Giữ nhịp hiện tại",
        "Không tự phát sinh lương hưu hay thu nhập",
        "decline",
      ),
    ],
  ),
];
export function eventForMonth(s: GameState): ContextEvent | undefined {
  return selectEligibleEvent(s, templates);
}
export function makeDecision(s: GameState, t: ContextEvent): Decision {
  const date = dateInMonth(s.currentMonth, 12),
    age = ageOn(s.birthDate, date);
  return {
    id: `${s.lifeId}/${s.currentMonth}/${t.id}`,
    templateId: t.id,
    date,
    title: t.title,
    body: t.body,
    authority: age < 6 ? "CAREGIVER" : age < 18 ? "CHILD" : "SELF",
    options: t.choices.map((c) => {
      const reasons = checkConditions(s, c.requirements).filter(
        (r) => !r.eligible,
      );
      return {
        id: c.id,
        label: c.label,
        hint: c.hint,
        ...(reasons.length
          ? { disabledReason: reasons.map((r) => r.detail).join("; ") }
          : {}),
      };
    }),
  };
}
