"use client";
import { useEffect, useRef, useState } from "react";
import type { GameState } from "../simulation/types";
import { monthsBetween } from "../simulation/calendar/YearMonth";

function storyText(event: { kind: string; text: string }) {
  if (event.kind !== "arc") return event.text;
  const topics: Record<string, string> = {
    care: "việc chăm sóc người thân",
    business: "kế hoạch kinh doanh",
    education: "việc học tập",
    aging: "những thay đổi trong chặng đời này",
  };
  const family = /^Theo dõi mạch ([a-z]+):/.exec(event.text)?.[1];
  return family && topics[family]
    ? `Bạn nhìn lại ${topics[family]}. Những cam kết còn hiệu lực vẫn tiếp tục.`
    : event.text;
}

export function DecisionPopup({
  game,
  onChoose,
  onReview,
  error,
}: {
  game: GameState;
  onChoose: (optionId: string) => void;
  onReview: () => void;
  error: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [deferred, setDeferred] = useState(false);
  const decision = game.pendingDecision!;
  useEffect(() => {
    const node = dialog.current;
    if (!deferred) {
      node?.showModal();
      node?.querySelector<HTMLElement>("h2")?.focus();
    } else {
      node?.close();
      opener.current?.focus();
    }
    return () => node?.close();
  }, [deferred]);
  return (
    <>
      <div className="pending-choice" role="status">
        <span className="pending-dot" />
        <div>
          <b>Thời gian đang dừng để chờ bạn</b>
          <p>{decision.title}</p>
        </div>
        <button
          ref={opener}
          className="primary"
          onClick={() => setDeferred(false)}
        >
          Mở lựa chọn →
        </button>
      </div>
      <dialog
        ref={dialog}
        className="choice-dialog"
        aria-labelledby="choice-title"
        aria-describedby="choice-body"
        onCancel={(e) => {
          e.preventDefault();
          setDeferred(true);
        }}
      >
        <div className="choice-top">
          <span>
            MỘT NGÃ RẼ · {decision.date.split("-").reverse().join("/")}
          </span>
          <button
            className="text-button"
            onClick={() => {
              setDeferred(true);
              onReview();
            }}
          >
            Xem nhật ký ↓
          </button>
        </div>
        <section
          className="decision"
          role="region"
          aria-label="Quyết định quan trọng"
        >
          <p className="eyebrow">BẠN SẼ CHỌN ĐIỀU GÌ?</p>
          <h2 id="choice-title" tabIndex={-1} autoFocus>
            {decision.title}
          </h2>
          <p id="choice-body" className="choice-body">
            {decision.body}
          </p>
          {error && (
            <p className="error-banner" role="alert">
              {error}
            </p>
          )}
          <p className="choice-authority">
            {decision.authority === "CAREGIVER"
              ? "Người giám hộ đưa ra quyết định cho nhân vật."
              : decision.authority === "CHILD"
                ? "Nhân vật lựa chọn cùng người giám hộ."
                : "Quyết định thuộc về bạn."}{" "}
            Thời gian chỉ tiếp tục sau khi bạn chọn.
          </p>
          <div className="decision-options">
            {decision.options.map((option, index) => (
              <button
                key={option.id}
                disabled={!!option.disabledReason}
                onClick={() => onChoose(option.id)}
              >
                <span className="choice-number" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  <b>{option.label}</b>
                  <small>{option.disabledReason ?? option.hint}</small>
                </span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>
        <details className="choice-source">
          <summary>Về tình huống này</summary>
          <p>
            Tình huống và tác động là giả định gameplay, không phải dự báo cuộc
            đời thật.
          </p>
        </details>
      </dialog>
    </>
  );
}

export function LifeJournal({
  game,
  onArchive,
}: {
  game: GameState;
  onArchive: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "choices">("all");
  const [limit, setLimit] = useState(12);
  const months = [
    ...(game.cursor
      ? [
          {
            month: game.currentMonth,
            events: game.cursor.events,
            pending: true,
          },
        ]
      : []),
    ...game.reports
      .slice()
      .reverse()
      .map((r) => ({ month: r.month, events: r.events, pending: false })),
  ];
  const visible =
    filter === "choices"
      ? months.filter((m) => m.events.some((e) => e.kind === "decision"))
      : months;
  const groups: Array<
    (typeof months)[number] & { oldest: string; count: number }
  > = [];
  for (const month of visible) {
    const previous = groups.at(-1);
    if (
      !month.pending &&
      !month.events.length &&
      previous &&
      !previous.pending &&
      !previous.events.length &&
      monthsBetween(month.month, previous.oldest) === 1
    ) {
      previous.oldest = month.month;
      previous.count++;
    } else groups.push({ ...month, oldest: month.month, count: 1 });
  }
  return (
    <section className="panel life-journal" aria-label="Nhật ký cuộc đời">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TỪNG THÁNG, MỘT CÂU CHUYỆN</p>
          <h2>Nhật ký cuộc đời</h2>
        </div>
        <span className="journal-order">Mới nhất trước ↓</span>
      </div>
      <div className="journal-tools" aria-label="Lọc nhật ký">
        <button
          aria-pressed={filter === "all"}
          onClick={() => {
            setFilter("all");
            setLimit(12);
          }}
        >
          Tất cả diễn biến
        </button>
        <button
          aria-pressed={filter === "choices"}
          onClick={() => {
            setFilter("choices");
            setLimit(12);
          }}
        >
          Những lần tôi chọn
        </button>
      </div>
      <div className="story-timeline">
        {groups.slice(0, limit).map((month, index) => (
          <article
            className={`story-month ${index === 0 ? "latest-story" : ""}`}
            key={month.month}
          >
            <div className="story-date">
              <time dateTime={month.month}>
                {month.count > 1 && (
                  <>
                    {month.oldest.slice(5)}/{month.oldest.slice(0, 4)}
                    <br />–{" "}
                  </>
                )}
                {month.month.slice(5)}/{month.month.slice(0, 4)}
              </time>
              <span>
                {month.pending
                  ? "Đang diễn ra"
                  : index === 0
                    ? "Vừa đi qua"
                    : "Đã đi qua"}
              </span>
            </div>
            <div className="story-events">
              {month.events
                .filter((e) => filter === "all" || e.kind === "decision")
                .slice()
                .reverse()
                .map((e) => (
                  <div
                    className={`story-event ${e.kind === "decision" ? "chosen-event" : ""}`}
                    key={e.id}
                  >
                    {e.kind === "decision" && (
                      <span className="choice-receipt">✓ Bạn đã chọn</span>
                    )}
                    <p>{storyText(e)}</p>
                    <time dateTime={e.happenedAt}>
                      {e.happenedAt.split("-").reverse().join("/")}
                    </time>
                  </div>
                ))}
              {!month.events.length && (
                <p className="story-quiet">
                  {month.pending
                    ? "Tháng này vẫn đang mở. Hãy xem lại những điều đã xảy ra trước khi quyết định."
                    : month.count > 1
                      ? `${month.count} tháng bình yên trôi qua. Nhịp sống thường ngày vẫn tiếp diễn.`
                      : "Một tháng bình yên. Nhịp sống thường ngày vẫn tiếp diễn."}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="story-empty">
          <span aria-hidden="true">{filter === "choices" ? "↗" : "❧"}</span>
          <h3>
            {filter === "choices"
              ? "Những lựa chọn vẫn ở phía trước"
              : "Câu chuyện của bạn bắt đầu từ đây"}
          </h3>
          <p>
            {filter === "choices"
              ? "Mỗi quyết định đã đưa ra sẽ được ghi lại ở đây."
              : `${game.name} đang sống tại Việt Nam. Chọn “Sang tháng” để dõi theo những điều tiếp theo.`}
          </p>
        </div>
      )}
      <div className="story-footer">
        {groups.length > limit && (
          <button className="secondary" onClick={() => setLimit(limit + 12)}>
            Đọc thêm những tháng trước
          </button>
        )}
        <button className="text-button" onClick={onArchive}>
          Xem sổ tháng & tổng kết →
        </button>
      </div>
    </section>
  );
}
