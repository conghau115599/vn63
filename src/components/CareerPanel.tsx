"use client";
import { useState } from "react";
import {
  careerRequirements,
  careerFit,
  practiceLimit,
  type CareerPlan,
  type Talent,
} from "../simulation/careers";
import { simulationDate } from "../simulation/world/contracts";
import { ageOn } from "../simulation/calendar/YearMonth";
import type { GameState, MonthlyInput } from "../simulation/types";
export function CareerPanel({
  game,
  onAdvance,
}: {
  game: GameState;
  onAdvance: (input: Partial<MonthlyInput>) => void;
}) {
  const c = game.careerDevelopment,
    age = ageOn(game.birthDate, simulationDate(game)),
    locked = !!game.cursor || !game.living;
  const [goal, setGoal] = useState<Talent>(
    c.goal === "GENERAL"
      ? c.aptitude.ARTIST > c.aptitude.ATHLETE
        ? "ARTIST"
        : "ATHLETE"
      : c.goal,
  );
  const [hours, setHours] = useState(
    Math.min(practiceLimit(age), c.hours || 8),
  );
  const clubReasons = careerRequirements(game, goal, "JOIN_CLUB"),
    trialReasons = careerRequirements(game, goal, "TRYOUT"),
    fit = careerFit(game, goal);
  const act = (action?: CareerPlan["action"]) =>
    onAdvance({
      careerPlan: { goal, hours: Math.min(hours, practiceLimit(age)), action },
    });
  return (
    <div className="insight-stack">
      <section className="panel">
        <p className="eyebrow">HIỂU MÌNH TRƯỚC KHI CHỌN ĐƯỜNG</p>
        <h2>Nghề nào hợp với nền tảng của bạn?</h2>
        <div className="career-fit-grid">
          {(["ATHLETE", "ARTIST"] as const).map((talent) => {
            const profile = careerFit(game, talent);
            return (
              <button
                key={talent}
                className={goal === talent ? "fit-card selected" : "fit-card"}
                aria-pressed={goal === talent}
                onClick={() => setGoal(talent)}
              >
                <b>
                  {talent === "ATHLETE" ? "Vận động viên" : "Nghệ sĩ biểu diễn"}
                </b>
                <span>
                  Tiềm năng bẩm sinh <strong>{c.aptitude[talent]}/100</strong>
                </span>
                <span>
                  Nền tảng hiện tại{" "}
                  <strong>{Math.round(profile.foundation)}/100</strong>
                </span>
                <small>
                  {c.aptitude[talent] >= 75
                    ? "Có lợi thế bẩm sinh"
                    : c.aptitude[talent] >= 50
                      ? "Có thể phát triển qua rèn luyện"
                      : "Cần kiên trì và nền tảng hỗ trợ"}
                </small>
              </button>
            );
          })}
        </div>
        <p className="fine">
          Tiềm năng bẩm sinh là cách game giả lập yếu tố di truyền, giữ nguyên
          trong cuộc đời. Đây không phải đánh giá gene thật. Tiềm năng giúp học
          nhanh và tiến xa hơn; mục tiêu, cơ hội và nỗ lực vẫn cần đi cùng nhau.
        </p>
      </section>
      <section className="panel">
        <p className="eyebrow">CHỦ ĐỘNG THEO ĐUỔI MỘT NGHỀ</p>
        <h2>Từ nền tảng đến hợp đồng đầu tiên</h2>
        <ol className="career-steps" aria-label="Các bước vào nghề">
          {[
            { label: "Luyện tập", done: c.minutes[goal] > 0 },
            {
              label: goal === "ATHLETE" ? "Câu lạc bộ" : "Hồ sơ biểu diễn",
              done: goal === "ATHLETE" ? c.club.ATHLETE : c.portfolio >= 20,
            },
            {
              label: "Đạt tuyển chọn",
              done: c.trials.some((t) => t.goal === goal && t.passed),
            },
            { label: "Hợp đồng", done: game.job?.occupation === goal },
          ].map((step, i) => (
            <li className={step.done ? "complete" : ""} key={step.label}>
              <span>{step.done ? "✓" : `0${i + 1}`}</span>
              <b>{step.label}</b>
            </li>
          ))}
        </ol>
        <p>
          Luyện tập → câu lạc bộ / hồ sơ biểu diễn → tuyển chọn → hợp đồng. Bạn
          chủ động đăng ký khi đủ điều kiện, không phải chờ sự kiện hiếm.
        </p>
        <p className="fine">
          Sức khỏe hỗ trợ thể thao; năng khiếu hỗ trợ tốc độ học. Kỹ năng, số
          giờ tích lũy và hồ sơ thực hành là những điều kiện riêng. Trẻ nhỏ
          luyện dưới sự hướng dẫn của người chăm sóc.
        </p>
        <div className="business-form">
          <label>
            Hướng theo đuổi
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Talent)}
            >
              <option value="ATHLETE">Vận động viên</option>
              <option value="ARTIST">Nghệ sĩ biểu diễn</option>
            </select>
          </label>
          <label>
            Giờ luyện tập mỗi tuần
            <input
              type="number"
              min={0}
              max={practiceLimit(age)}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="business-actions">
          <button className="primary" disabled={locked} onClick={() => act()}>
            Luyện tập & sang tháng
          </button>
          <button
            className="secondary"
            disabled={locked}
            onClick={() =>
              onAdvance({ careerPlan: { goal: "GENERAL", hours: 0 } })
            }
          >
            Tạm ngừng luyện tập
          </button>
        </div>
        <p className="fine">
          Kế hoạch duy trì qua các tháng, tối đa {practiceLimit(age)} giờ/tuần ở
          tuổi này. Thời gian lấy từ nghỉ ngơi, giao tiếp, học hoặc kinh doanh;
          nghĩa vụ chăm sóc có thể làm giảm giờ thực tế.
        </p>
        <p>
          Đang theo:{" "}
          {c.goal === "GENERAL"
            ? "Chưa chọn"
            : c.goal === "ATHLETE"
              ? "Thể thao"
              : "Biểu diễn"}{" "}
          · {c.hours} giờ/tuần. Hợp đồng:{" "}
          {game.job?.occupation === "ATHLETE"
            ? "Vận động viên"
            : game.job?.occupation === "ARTIST"
              ? "Nghệ sĩ biểu diễn"
              : "Chưa vào nghề này"}
          .
        </p>
      </section>
      <section className="panel">
        <h2>
          {goal === "ATHLETE" ? "Lộ trình thể thao" : "Lộ trình biểu diễn"}
        </h2>
        <div className="career-metrics">
          {[
            {
              label: "Kỹ năng",
              value: c.skill[goal],
              target: 50,
              unit: "điểm",
            },
            {
              label: "Giờ đã luyện",
              value: c.minutes[goal] / 60,
              target: 300,
              unit: "giờ",
            },
            {
              label: "Năng khiếu",
              value: c.aptitude[goal],
              target: 100,
              unit: "điểm",
            },
          ].map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <strong>
                {Math.round(metric.value)}
                <small> / {metric.target}</small>
              </strong>
              <progress
                aria-label={metric.label}
                value={Math.min(metric.value, metric.target)}
                max={metric.target}
              />
              <small>
                {metric.label === "Năng khiếu"
                  ? "Hỗ trợ tốc độ học"
                  : `Mốc dự tuyển: ${metric.target} ${metric.unit}`}
              </small>
            </div>
          ))}
        </div>
        {goal === "ARTIST" && (
          <p>
            Hồ sơ biểu diễn: {Math.round(c.portfolio)} / 20 điểm để dự tuyển.
          </p>
        )}
        <h3>1. Câu lạc bộ</h3>
        <p>
          {c.club[goal]
            ? "Đã tham gia; luyện có hướng dẫn giúp tiến bộ nhanh hơn."
            : clubReasons.length
              ? clubReasons.join(" · ")
              : "Đủ điều kiện tham gia."}
        </p>
        <button
          className="secondary"
          disabled={locked || !!clubReasons.length}
          onClick={() => act("JOIN_CLUB")}
        >
          Tham gia câu lạc bộ & sang tháng
        </button>
        <h3>2. Tuyển chọn chuyên nghiệp</h3>
        <p className="career-readiness">
          Mức sẵn sàng hiện tại: <b>{Math.round(fit.readiness)} / 58 điểm</b>
        </p>
        <p className="fine">
          Kỹ năng 60% · bẩm sinh 15% · kinh nghiệm 13% · nền tảng 12%, trừ mệt
          mỏi.{" "}
          {goal === "ATHLETE"
            ? "Nền tảng thể thao dựa trên sức khỏe và khả năng hồi phục."
            : "Nền tảng biểu diễn dựa trên kiến thức, tinh thần và khả năng hồi phục."}{" "}
          Điều kiện học tập{" "}
          {game.context.resources === "AFFLUENT"
            ? "dồi dào"
            : game.context.resources === "LIMITED"
              ? "hạn chế"
              : "ổn định"}{" "}
          ảnh hưởng tốc độ rèn luyện. Đổi mục tiêu giữ lại kỹ năng đã có.
        </p>
        <p>
          {trialReasons.length
            ? trialReasons.join(" · ")
            : "Đủ điều kiện dự tuyển. Kết quả còn phụ thuộc kỹ năng, nền tảng, kinh nghiệm và mệt mỏi."}
        </p>
        <button
          className="primary"
          disabled={locked || !!trialReasons.length}
          onClick={() => act("TRYOUT")}
        >
          Đăng ký tuyển chọn & sang tháng
        </button>
        <p className="fine">
          Tuyển chọn dùng 2 giờ đầu tháng. Ngưỡng đạt 58 điểm; biến động kết quả
          giới hạn ±4 điểm. Chưa đạt được thử lại sau 3 tháng. Đạt sẽ dừng ở lời
          mời hợp đồng để bạn quyết định.
        </p>
        {c.trials
          .slice(-6)
          .reverse()
          .map((t) => (
            <p key={`${t.month}/${t.goal}`}>
              {t.month} · {t.goal === "ATHLETE" ? "Thể thao" : "Biểu diễn"} ·{" "}
              {Math.round(t.score)} điểm · {t.passed ? "Đạt" : "Cần luyện thêm"}
            </p>
          ))}
        <p className="fine">
          Vào nghề và nổi tiếng là hai bước riêng. Alpha hiện có hợp đồng 6
          tháng, chưa mô phỏng giải đấu, album, giải thưởng hay danh tiếng. Mức
          lương và điều kiện là giả định gameplay.
        </p>
      </section>
    </div>
  );
}
