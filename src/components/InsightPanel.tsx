"use client";
import { useState } from "react";
import type { GameState } from "../simulation/types";
import { templates } from "../simulation/events";
import { inspectEvents } from "../simulation/events/eligibility";
import {
  auditMonth,
  decisionCounterfactuals,
} from "../simulation/instrumentation";
import { traitNames, type Trait } from "../simulation/personality";
const traitLabels: Record<Trait, string> = {
  conscientiousness: "Tính ngăn nắp",
  riskTolerance: "Chấp nhận bất định",
  adaptability: "Khả năng thích nghi",
  sociability: "Xu hướng giao tiếp",
  persistence: "Sự bền bỉ",
  emotionRegulation: "Điều tiết cảm xúc",
};
export function PersonalityPanel({ game }: { game: GameState }) {
  return (
    <section className="panel">
      <p className="eyebrow">THAY ĐỔI QUA NHỮNG THÁNG NHỎ</p>
      <h2>Những nét đang hình thành</h2>
      <p className="fine">
        Các nét liên tục, có thể thay đổi. Không phải đánh giá đạo đức hay chẩn
        đoán tâm lý; không khóa tính cách ở tuổi 3/5.
      </p>
      <div className="trait-grid">
        {traitNames.map((t) => (
          <div key={t}>
            <span>{traitLabels[t]}</span>
            <b>
              {game.personality.values[t].toFixed(1)}
              <small>
                {" "}
                {game.personality.lastDelta[t] >= 0 ? "+" : ""}
                {game.personality.lastDelta[t].toFixed(2)}
              </small>
            </b>
            <div className="mini-meter">
              <i style={{ width: `${game.personality.values[t]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export function InsightPanel({ game }: { game: GameState }) {
  const [counterfactuals, setCounterfactuals] = useState<
      ReturnType<typeof decisionCounterfactuals>
    >([]),
    [showAll, setShowAll] = useState(false);
  const audit = auditMonth(game),
    events = inspectEvents(game, templates),
    listed = showAll ? events : events.filter((e) => e.eligible);
  return (
    <>
      <section className="panel">
        <p className="eyebrow">VÌ SAO THÁNG NÀY DIỄN RA NHƯ VẬY?</p>
        <h2>Kiểm tra mô hình</h2>
        <div className="audit-grid">
          {[
            ["Sổ cá nhân cân", audit.cashBalanced],
            ["ID giao dịch duy nhất", audit.uniquePersonalIds],
            ["Sổ doanh nghiệp cân", audit.businessBalanced],
          ].map(([title, passed]) => (
            <p key={String(title)}>
              {passed ? "✓" : "✕"} {title}
            </p>
          ))}
        </div>
        <p className="fine">
          Seed cá nhân: {game.seed} · world: {game.world.seed}
          <br />
          Engine {game.engineVersion} · save schema {game.schemaVersion} ·{" "}
          {game.personality.version} · mọi hệ số là ASSUMPTION.
        </p>
        {game.migrationNotes.map((n) => (
          <p className="fine" key={n}>
            {n}
          </p>
        ))}
        <h3>
          Các sự kiện đủ điều kiện: {events.filter((e) => e.eligible).length}/
          {events.length}
        </h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />{" "}
          Hiện cả sự kiện bị chặn
        </label>
        {listed.map((e) => (
          <details key={e.eventId}>
            <summary>
              {e.eligible ? "✓" : "—"} {e.title}
            </summary>
            {e.reasons.map((r, i) => (
              <p className="fine" key={i}>
                {r.eligible ? "✓" : "✕"} {r.code}: {r.detail}
              </p>
            ))}
            <p className="fine">Nguồn: ASSUMPTION · template {e.eventId}</p>
          </details>
        ))}
      </section>
      <section className="panel">
        <h2>Mạch chuyện còn tiếp</h2>
        {game.arcs.length ? (
          game.arcs.slice(-12).map((a) => (
            <p key={a.id}>
              <b>{a.family}</b> · {a.stage} ·{" "}
              {a.status === "ACTIVE" ? "Đang tiếp diễn" : "Đã theo dõi"}{" "}
              {a.dueMonth && `· ${a.dueMonth}`}
            </p>
          ))
        ) : (
          <p className="subtle">Chưa có mạch chuyện đang theo dõi.</p>
        )}
        <h3>So sánh lựa chọn trong mô hình</h3>
        <p className="fine">
          Tạo các nhánh giả lập cùng seed, không sửa cuộc đời đang chơi. Đây là
          công cụ debug, không phải dự báo hay lợi nhuận bảo đảm.
        </p>
        <button
          className="secondary"
          disabled={!game.pendingDecision}
          onClick={() => setCounterfactuals(decisionCounterfactuals(game))}
        >
          So sánh quyết định đang chờ
        </button>
        {counterfactuals.map((c) => (
          <p className="fine" key={c.optionId}>
            {c.label}:{" "}
            {"error" in c
              ? c.error
              : `Ví cuối kỳ ${c.cashCloseVnd} VND · lợi nhuận cửa hàng ${c.businessProfitVnd ?? "chưa có"} VND`}
          </p>
        ))}
      </section>
      <section className="panel">
        <h2>Bút toán doanh nghiệp gần đây</h2>
        <div className="ledger-scroll">
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Nợ</th>
                <th>Có</th>
                <th>VND</th>
              </tr>
            </thead>
            <tbody>
              {game.business?.journal.slice(-25).map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.debit}</td>
                  <td>{e.credit}</td>
                  <td>{e.amountVnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine">
          Bút toán ghi Nợ/Có theo tài khoản. Giá trị ghi nhận doanh thu có thể
          nằm ở RECEIVABLE, chưa phải CASH.
        </p>
      </section>
    </>
  );
}
