"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createLife, type StartScenario } from "../simulation/init";
import { BusinessPanel } from "../components/BusinessPanel";
import { ProfileRail, WorldRail, LifeScene } from "../components/LifeDashboard";
import { DecisionPopup, LifeJournal } from "../components/LifeJournal";
import { CareerPanel } from "../components/CareerPanel";
import { InsightPanel, PersonalityPanel } from "../components/InsightPanel";
import { businessOwnerHours } from "../simulation/business/advanceBusinessMonth";
import { advanceMonth, advanceMonths } from "../simulation/core/advanceMonth";
import {
  ageOn,
  dateInMonth,
  daysInMonth,
} from "../simulation/calendar/YearMonth";
import {
  resolveSchedule,
  type Policy,
  categories,
} from "../simulation/time/MonthlySchedule";
import {
  assets,
  netWorth,
  portfolioValue,
} from "../simulation/investments/MonthlyMarket";
import { deserialize, serialize } from "../simulation/save";
import { loadGame, saveGame } from "../persistence/store";
import type { GameState, MonthlyInput } from "../simulation/types";
import provinceData from "../content/provinces.2024.json";
import {
  YEAR_SECONDS,
  PLAYBACK_SPEEDS,
  monthDelay,
} from "../simulation/playback";

const money = (v: string | bigint) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(BigInt(v));
const policies: Record<Policy, { name: string; detail: string }> = {
  BALANCED: {
    name: "Sống cân bằng",
    detail: "40 giờ làm · 12 giờ gia đình/tuần",
  },
  CAREER_SPRINT: {
    name: "Dồn sức sự nghiệp",
    detail: "55 giờ làm · 5 giờ gia đình/tuần",
  },
  FAMILY_FIRST: {
    name: "Ưu tiên gia đình",
    detail: "35 giờ làm · 24 giờ gia đình & chăm sóc/tuần",
  },
  STUDY_UPSKILL: {
    name: "Học để đổi hướng",
    detail: "35 giờ làm · 16 giờ học/tuần",
  },
};
const labels: Record<(typeof categories)[number], string> = {
  practice: "Luyện nghề",
  business: "Kinh doanh",
  sleep: "Ngủ",
  work: "Công việc",
  commute: "Đi lại",
  household: "Sinh hoạt",
  care: "Chăm sóc",
  family: "Gia đình",
  friends: "Bạn bè",
  exercise: "Vận động",
  study: "Học tập",
  rest: "Nghỉ ngơi",
};
const tabs = [
  ["overview", "Cuộc đời", "◈"],
  ["finance", "Tài chính", "↗"],
  ["business", "Kinh doanh", "⌂"],
  ["career", "Nghề mơ ước", "♫"],
  ["family", "Người bên cạnh", "♡"],
  ["journal", "Những tháng đã qua", "▤"],
  ["method", "Về mô hình", "ⓘ"],
  ["insight", "Kiểm tra mô hình", "⚙"],
] as const;
type Tab = (typeof tabs)[number][0];
function Landscape() {
  return (
    <svg
      className="landscape"
      viewBox="0 0 720 280"
      role="img"
      aria-label="Minh họa mái nhà, cây xanh và mặt trời Việt Nam"
    >
      <circle cx="545" cy="75" r="42" fill="#e9bb76" />
      <path d="M0 200Q160 90 310 190T720 145V280H0Z" fill="#c1cfb6" />
      <path d="M0 240Q220 180 380 225T720 200V280H0Z" fill="#92af98" />
      <path d="M110 188h170v92H110z" fill="#f3e8cc" />
      <path d="M85 190l110-80 110 80z" fill="#b36143" />
      <path d="M160 280v-62h50v62" fill="#637d6c" />
      <path d="M335 210h130v70H335z" fill="#e6d8b9" />
      <path d="M315 212l85-65 85 65z" fill="#c1815d" />
      <path d="M570 280V140" stroke="#496d58" strokeWidth="9" />
      <path
        d="M572 172Q510 100 536 90Q600 115 572 172ZM574 180Q635 100 650 130Q648 185 574 180Z"
        fill="#496d58"
      />
      <path
        d="M40 280v-95m0 20q-45-60-10-65 35 5 10 65m0 10q45-60 50-20-5 30-50 20"
        stroke="#496d58"
        fill="#496d58"
        strokeWidth="5"
      />
      <path
        d="M230 280q160-35 290 0"
        fill="none"
        stroke="#e9ddc2"
        strokeWidth="22"
      />
    </svg>
  );
}
export default function Home() {
  const [game, setGame] = useState<GameState | null>(null),
    [ready, setReady] = useState(false),
    [tab, setTab] = useState<Tab>("overview"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [auto, setAuto] = useState(false),
    [seek, setSeek] = useState(false),
    [speed, setSpeed] = useState(1),
    [page, setPage] = useState(0);
  const [name, setName] = useState("Minh An"),
    [seed, setSeed] = useState("mot-doi-2024"),
    [province, setProvince] = useState("ha-noi"),
    [mode, setMode] = useState<"REALISM" | "HARDSHIP">("REALISM"),
    [start, setStart] = useState<StartScenario>("BIRTH"),
    [strength, setStrength] = useState<"GENERAL" | "ATHLETE" | "ARTIST">(
      "GENERAL",
    ),
    [settlement, setSettlement] = useState<"URBAN" | "RURAL">("URBAN"),
    [resources, setResources] = useState<"LIMITED" | "STABLE" | "AFFLUENT">(
      "STABLE",
    );
  const [asset, setAsset] = useState("fund"),
    [quantity, setQuantity] = useState("1");
  const upload = useRef<HTMLInputElement>(null),
    queue = useRef(Promise.resolve()),
    saveRevision = useRef(0);
  const navigate = (next: Tab) => {
    setTab(next);
    setPage(0);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    loadGame()
      .then((g) => {
        if (g) setGame(g);
      })
      .catch((e) => setError(`Không đọc được save: ${e.message}`))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!game || !ready) return;
    const revision = ++saveRevision.current;
    setNotice("Đang lưu…");
    queue.current = queue.current
      .catch(() => {})
      .then(() => saveGame(game))
      .then(() => {
        if (revision === saveRevision.current)
          setNotice("Đã lưu trên thiết bị");
      })
      .catch((e) => setError(`Lưu thất bại: ${e.message}`));
  }, [game, ready]);
  const run = useCallback(
    (count = 1, input?: Partial<MonthlyInput>) => {
      if (!game) return;
      setError("");
      try {
        const r = input
          ? advanceMonth(game, { yearMonth: game.currentMonth, ...input })
          : advanceMonths(game, count);
        setGame(r.nextState);
        if (r.status !== "COMMITTED") {
          setAuto(false);
          setSeek(false);
        }
      } catch (e) {
        setError((e as Error).message);
        setAuto(false);
        setSeek(false);
      }
    },
    [game],
  );
  useEffect(() => {
    if (!(auto || seek) || !game?.living || game.pendingDecision) return;
    const timer = setTimeout(
      () => run(seek ? 12 : 1),
      seek ? 30 : monthDelay(speed),
    );
    return () => clearTimeout(timer);
  }, [auto, seek, speed, game, run]);
  const begin = () => {
    setGame(
      createLife({
        seed: seed.trim() || "mot-doi-2024",
        name,
        provinceId: province,
        mode,
        start,
        strength,
        context: { settlement, resources },
      }),
    );
    setTab("overview");
    setError("");
    setAuto(true);
    setSeek(false);
  };
  const exportSave = () => {
    if (!game) return;
    const url = URL.createObjectURL(
      new Blob([serialize(game)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `vn63-${game.currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importSave = async (file?: File) => {
    if (!file) return;
    try {
      const loaded = deserialize(await file.text());
      setGame(loaded);
      setAuto(false);
      setSeek(false);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const age = game
    ? ageOn(
        game.birthDate,
        game.deathDate ??
          dateInMonth(
            game.currentMonth,
            Math.max(
              1,
              game.currentMonth === game.birthDate.slice(0, 7)
                ? +game.birthDate.slice(8)
                : 1,
            ),
          ),
      )
    : 0;
  const location =
    provinceData.provinces.find((p) => p.id === game?.residenceProvinceId)
      ?.name ?? "Việt Nam";
  const schedule = game
    ? (game.cursor?.time ??
      resolveSchedule(game.currentMonth, game.policy, {
        age,
        employed: !!game.job,
        practiceHoursPerWeek: game.careerDevelopment.hours,
        obligations: game.obligations,
        businessHoursPerWeek: game.business
          ? businessOwnerHours(game.business, game.business.queuedPlan)
          : 0,
      }))
    : null;
  const report = game?.reports.at(-1),
    locked = !!game?.cursor || !game?.living,
    adult = age >= 18;
  const debts =
    game?.debts.reduce((s, d) => s + BigInt(d.principalVnd), 0n) ?? 0n;
  const timeBar = schedule && (
    <>
      <div className="timebar" aria-label="Phân bổ thời gian tháng">
        {categories
          .filter((k) => schedule.byCategory[k] > 0)
          .map((k) => (
            <span
              key={k}
              className={`time-${k}`}
              style={{
                width: `${(schedule.byCategory[k] / schedule.availableMinutes) * 100}%`,
              }}
              title={`${labels[k]}: ${(schedule.byCategory[k] / 60).toFixed(1)} giờ`}
            />
          ))}
      </div>
      <div className="timelegend">
        {categories
          .filter((k) => schedule.byCategory[k] > 0)
          .map((k) => (
            <span key={k}>
              <i className={`time-${k}`} />
              {labels[k]} <b>{(schedule.byCategory[k] / 60).toFixed(0)}h</b>
            </span>
          ))}
      </div>
    </>
  );
  const playback = game?.living ? (
    <section className="playback" aria-label="Điều khiển thời gian">
      <div className="playback-status">
        <i className={auto || seek ? "running" : ""} />
        <div>
          <b>
            {game.pendingDecision
              ? "Đang chờ lựa chọn"
              : seek
                ? "Đến quyết định tiếp theo…"
                : auto
                  ? "Cuộc sống đang tiếp diễn"
                  : "Theo nhịp của bạn"}
          </b>
          <small>
            {game.pendingDecision
              ? "Chọn để tiếp tục tháng hiện tại"
              : `1 năm ≈ ${(YEAR_SECONDS / speed).toLocaleString("vi-VN")} giây · ${speed}×`}
          </small>
        </div>
      </div>
      <div className="playback-controls">
        <div className="speed-group" aria-label="Tốc độ">
          {PLAYBACK_SPEEDS.map((v) => (
            <button
              key={v}
              aria-pressed={speed === v}
              className={speed === v ? "chosen" : ""}
              onClick={() => setSpeed(v)}
            >
              {v}×
            </button>
          ))}
        </div>
        <button
          className="secondary"
          disabled={!!game.pendingDecision}
          onClick={() => {
            setAuto(!auto);
            setSeek(false);
          }}
        >
          {auto ? "Tạm dừng" : "Tiếp tục"}
        </button>
        <button
          className="text-button next-decision"
          disabled={!!game.pendingDecision}
          onClick={() => {
            setSeek(!seek);
            setAuto(false);
          }}
        >
          {seek ? "Dừng tìm" : "Tới quyết định"}
        </button>
        <button
          className="primary"
          disabled={!!game.pendingDecision || auto || seek}
          onClick={() => run()}
        >
          Sang tháng <span>→</span>
        </button>
      </div>
      <div
        className="year-clock"
        role="progressbar"
        aria-label={`Năm ${game.currentMonth.slice(0, 4)}`}
        aria-valuemin={0}
        aria-valuemax={12}
        aria-valuenow={Number(game.currentMonth.slice(5)) - 1}
      >
        <span
          key={`${game.currentMonth}/${speed}/${auto}`}
          className={auto ? "clock-running" : ""}
          style={
            {
              width: `${((Number(game.currentMonth.slice(5)) - 1) / 12) * 100}%`,
              animationDuration: `${monthDelay(speed)}ms`,
              "--clock-from": `${((Number(game.currentMonth.slice(5)) - 1) / 12) * 100}%`,
              "--clock-to": `${(Number(game.currentMonth.slice(5)) / 12) * 100}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </section>
  ) : null;
  return (
    <div className={game ? "app-shell playing" : "app-shell setup-shell"}>
      <a className="skip-link" href="#life-content">
        Đi đến nội dung cuộc đời
      </a>
      <header className="sidebar">
        <a className="brand" href="/" aria-label="VN63 trang chủ">
          <span className="brand-mark">v.</span>
          <span>
            Một Đời<small>Ở VIỆT NAM</small>
          </span>
        </a>
        <div className="masthead-context">
          {game ? (
            <>
              <strong>
                {age}
                <small> tuổi</small>
              </strong>
              <div>
                <b>{game.name}</b>
                <span>
                  {location} · {game.currentMonth.slice(5)}/
                  {game.currentMonth.slice(0, 4)}
                </span>
              </div>
            </>
          ) : (
            <>
              <b>Một cuộc đời, nhiều ngã rẽ.</b>
              <span>Mô phỏng cuộc sống theo từng tháng</span>
            </>
          )}
        </div>
        <span className="masthead-edition">
          VN63 / MONTHLY<span>BẢN THỬ NGHIỆM 1.3</span>
        </span>
        <nav aria-label="Điều hướng cuộc đời">
          {tabs.map(([id, title, icon]) => (
            <button
              key={id}
              className={tab === id ? "nav-item active" : "nav-item"}
              onClick={() => navigate(id)}
              aria-current={tab === id ? "page" : undefined}
            >
              <span>{icon}</span>
              {title}
            </button>
          ))}
        </nav>
      </header>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            Một Đời <span>/</span> {tabs.find((t) => t[0] === tab)?.[1]}
          </span>
          <div className="top-actions">
            <span className="demo-badge">MÔ HÌNH GIẢ ĐỊNH</span>
            {game && (
              <button className="text-button" onClick={exportSave}>
                Xuất save ↓
              </button>
            )}
            <button
              className="text-button"
              onClick={() => upload.current?.click()}
            >
              Nhập save ↑
            </button>
            <input
              ref={upload}
              hidden
              type="file"
              accept=".json,application/json"
              aria-label="Nhập save JSON"
              onChange={(e) => {
                void importSave(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </header>
        {playback}
        <div className="simulation-layout">
          {game && <ProfileRail game={game} age={age} location={location} />}
          <main className="simulation-main" id="life-content">
            {error && (
              <div className="alert" role="alert">
                {error}
                <button
                  aria-label="Đóng thông báo"
                  onClick={() => setError("")}
                >
                  ×
                </button>
              </div>
            )}
            {!ready ? (
              <p>Đang mở những ký ức…</p>
            ) : !game ? (
              <>
                <section className="welcome">
                  <div>
                    <p className="eyebrow">MỘT ĐỜI Ở VIỆT NAM</p>
                    <h1>
                      Một đời,
                      <br />
                      <em>nhiều ngã rẽ.</em>
                    </h1>
                    <p className="intro">
                      Từng tháng trôi qua, những lựa chọn nhỏ làm nên câu chuyện
                      của bạn. Giữa công việc, gia đình và những điều mình muốn
                      giữ.
                    </p>
                    <span className="intro-note">
                      63 địa phương · Danh mục lịch sử 2024
                    </span>
                  </div>
                  <Landscape />
                </section>
                <section className="setup-grid">
                  <div className="panel setup">
                    <div className="section-heading">
                      <span className="step">01</span>
                      <div>
                        <h2>Bắt đầu một câu chuyện</h2>
                        <p>Bạn muốn cuộc đời này mang tên gì?</p>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label>
                        Tên nhân vật
                        <input
                          value={name}
                          maxLength={40}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </label>
                      <label>
                        Nơi sinh
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                        >
                          {provinceData.provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Seed cuộc đời
                        <input
                          value={seed}
                          maxLength={100}
                          onChange={(e) => setSeed(e.target.value)}
                        />
                      </label>
                      <label>
                        Điểm bắt đầu
                        <select
                          value={start}
                          onChange={(e) =>
                            setStart(e.target.value as typeof start)
                          }
                        >
                          <option value="BIRTH">
                            Chào đời · Tháng 01/2024
                          </option>
                          <option value="ADULT">
                            Chơi thử tuổi 28 · Tháng 01/2052
                          </option>
                          <option value="SENIOR_SOLO">
                            75 tuổi · Góa bạn đời, không có con
                          </option>
                          <option value="SENIOR_CARE">
                            75 tuổi · Bạn đời cần chăm sóc
                          </option>
                        </select>
                      </label>
                      <label>
                        Hoàn cảnh chăm sóc
                        <select
                          value={settlement}
                          onChange={(e) =>
                            setSettlement(e.target.value as typeof settlement)
                          }
                        >
                          <option value="URBAN">Kịch bản đô thị</option>
                          <option value="RURAL">Kịch bản nông thôn</option>
                        </select>
                      </label>
                      <label>
                        Nguồn lực gia đình
                        <select
                          value={resources}
                          onChange={(e) =>
                            setResources(e.target.value as typeof resources)
                          }
                        >
                          <option value="LIMITED">Ít nguồn lực</option>
                          <option value="STABLE">Ổn định</option>
                          <option value="AFFLUENT">Dồi dào</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      Nền tảng ban đầu (kịch bản thử nghiệm)
                      <select
                        value={strength}
                        onChange={(e) =>
                          setStrength(e.target.value as typeof strength)
                        }
                      >
                        <option value="GENERAL">Cân bằng</option>
                        <option value="ATHLETE">Có năng khiếu thể thao</option>
                        <option value="ARTIST">Có năng khiếu âm nhạc</option>
                      </select>
                    </label>
                    <fieldset className="mode-picker">
                      <legend>Nhịp đời</legend>
                      <label
                        className={
                          mode === "REALISM"
                            ? "mode-card selected"
                            : "mode-card"
                        }
                      >
                        <input
                          type="radio"
                          name="mode"
                          checked={mode === "REALISM"}
                          onChange={() => setMode("REALISM")}
                        />
                        <b>REALISM</b>
                        <span>Đời thường, nhiều hướng đi</span>
                      </label>
                      <label
                        className={
                          mode === "HARDSHIP"
                            ? "mode-card selected"
                            : "mode-card"
                        }
                      >
                        <input
                          type="radio"
                          name="mode"
                          checked={mode === "HARDSHIP"}
                          onChange={() => setMode("HARDSHIP")}
                        />
                        <b>HARDSHIP</b>
                        <span>Ít dự phòng, thêm áp lực</span>
                      </label>
                    </fieldset>
                    <button className="primary wide" onClick={begin}>
                      Bắt đầu cuộc đời <span>↗</span>
                    </button>
                  </div>
                  <div className="about-card">
                    <span className="eyebrow">MỖI THÁNG ĐỀU CÓ Ý NGHĨA</span>
                    <h2>
                      Điều gì đáng
                      <br />
                      để dành thời gian?
                    </h2>
                    <p>
                      Làm thêm có thể đem lại thu nhập. Một lời hẹn được giữ có
                      thể trở thành ký ức. Bạn sẽ chọn điều gì trong hoàn cảnh
                      của mình?
                    </p>
                    <hr />
                    <p className="fine">
                      Bản alpha dùng dữ liệu và cân bằng giả định. REALISM hiện
                      là <b>PROVISIONAL MODEL</b>, chưa hiệu chuẩn theo thống
                      kê. Thời điểm cuối đời là kịch bản demo. Tiến trình lưu
                      trên thiết bị.
                    </p>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="life-heading">
                  <div>
                    <p className="eyebrow">
                      CÂU CHUYỆN CỦA {game.name.toLocaleUpperCase("vi-VN")}
                    </p>
                    <h1>
                      {game.living
                        ? `Tháng ${game.currentMonth.slice(5)}/${game.currentMonth.slice(0, 4)}`
                        : "Một đời đã đi qua."}
                      <span className="month-dot">✳</span>
                    </h1>
                    <p>
                      {age} tuổi <span className="dot">·</span> {location}{" "}
                      <span className="dot">·</span>{" "}
                      <span className="mode-tag">{game.mode}</span>
                      {game.mode === "REALISM" && " · PROVISIONAL MODEL"}
                    </p>
                  </div>
                  <div className="save-note" role="status" aria-live="polite">
                    <span className="save-dot" />
                    {notice || "Đang lưu…"}
                    <small>Seed: {game.seed}</small>
                  </div>
                </section>
                {!game.living && (
                  <section className="ending panel">
                    <p className="eyebrow">NHỮNG ĐIỀU Ở LẠI</p>
                    <h2>
                      {game.name} · {age} năm trong câu chuyện này
                    </h2>
                    <p>
                      {game.committedMonths} tháng đã được mô phỏng.{" "}
                      {game.npcs.reduce(
                        (s, n) =>
                          s +
                          n.promises.filter((p) => p.status === "KEPT").length,
                        0,
                      )}{" "}
                      lời hẹn được giữ. Tài sản ròng cuối đời:{" "}
                      {money(netWorth(game))}.
                    </p>
                    <p>
                      Điều gì bạn muốn dành nhiều thời gian hơn? Ai đã ở bên
                      bạn?
                    </p>
                    <small>
                      Thời điểm kết thúc là giả định gameplay; chưa sử dụng bảng
                      tử vong hiệu chuẩn.
                    </small>
                    <button
                      className="primary"
                      onClick={() => {
                        setGame(null);
                        setAuto(false);
                        setSeek(false);
                      }}
                    >
                      Viết một câu chuyện mới ↗
                    </button>
                  </section>
                )}
                {game.pendingDecision && (
                  <DecisionPopup
                    key={game.pendingDecision.id}
                    game={game}
                    error={error}
                    onReview={() => navigate("overview")}
                    onChoose={(optionId) =>
                      run(1, {
                        choice: { eventId: game.pendingDecision!.id, optionId },
                      })
                    }
                  />
                )}
                {tab === "overview" && (
                  <>
                    <LifeJournal
                      game={game}
                      onArchive={() => navigate("journal")}
                    />
                    <details className="panel life-details">
                      <summary>
                        Nhịp sống & kế hoạch của tôi{" "}
                        <span>Thời gian · tiền bạc · khung cảnh</span>
                      </summary>
                      <LifeScene game={game} age={age} location={location} />
                      <section className="stats-grid overview-vitals">
                        {[
                          ["Sức khỏe", game.health, "Giữ nhịp nghỉ ngơi"],
                          [
                            "Hạnh phúc",
                            0.3 * game.mood + 0.7 * game.satisfaction,
                            "Cảm xúc & hài lòng dài hạn",
                          ],
                          ["Kiến thức", game.knowledge, "Tích lũy từng tháng"],
                          [
                            "Gắn bó",
                            game.npcs
                              .filter((n) => n.living)
                              .reduce((a, n) => a + n.bond, 0) /
                              Math.max(
                                1,
                                game.npcs.filter((n) => n.living).length,
                              ),
                            "Sự hiện diện có ý nghĩa",
                          ],
                        ].map(([label, value, note], i) => (
                          <div className="stat panel" key={String(label)}>
                            <div className="stat-label">
                              {label}
                              <span>{["✚", "☀", "✧", "♡"][i]}</span>
                            </div>
                            <strong>
                              {Math.round(Number(value))}
                              <small>/100</small>
                            </strong>
                            <div className="mini-meter">
                              <i style={{ width: `${value}%` }} />
                            </div>
                            <p>{note}</p>
                          </div>
                        ))}
                      </section>
                      <div className="dashboard-grid">
                        <section className="panel month-money">
                          <div className="section-heading">
                            <div>
                              <p className="eyebrow">TIỀN BẠC & SỰ AN TÂM</p>
                              <h2>Khoảng thở tài chính</h2>
                            </div>
                            <button
                              className="icon-button"
                              aria-label="Xem tài chính"
                              onClick={() => navigate("finance")}
                            >
                              ↗
                            </button>
                          </div>
                          <div className="cash-hero">
                            <small>Tiền mặt hiện có</small>
                            <strong>{money(game.cashVnd)}</strong>
                          </div>
                          <div className="money-rows">
                            <div>
                              <span>Thu tháng đã hoàn tất</span>
                              <b className="positive">
                                + {money(report?.inflowVnd ?? "0")}
                              </b>
                            </div>
                            <div>
                              <span>Chi tháng đã hoàn tất</span>
                              <b>− {money(report?.outflowVnd ?? "0")}</b>
                            </div>
                            <div>
                              <span>Dư nợ</span>
                              <b>{money(debts)}</b>
                            </div>
                          </div>
                          <div className="buffer-note">
                            ◷ Quỹ tiền mặt ≈{" "}
                            {(
                              Number(game.cashVnd) /
                              (game.mode === "HARDSHIP" ? 8500000 : 7500000)
                            ).toFixed(1)}{" "}
                            tháng chi phí mẫu
                          </div>
                        </section>
                        <section className="panel time-panel">
                          <div className="section-heading">
                            <div>
                              <p className="eyebrow">THỨ KHÔNG THỂ ĐỂ DÀNH</p>
                              <h2>Thời gian của bạn</h2>
                            </div>
                            <span className="subtle">
                              {daysInMonth(game.currentMonth)} ngày
                            </span>
                          </div>
                          <label className="policy-label">
                            Lịch sống duy trì
                            <select
                              aria-label="Lịch sống"
                              value={game.policy}
                              disabled={locked || !adult}
                              onChange={(e) => {
                                setAuto(false);
                                setSeek(false);
                                setGame({
                                  ...game,
                                  policy: e.target.value as Policy,
                                });
                              }}
                            >
                              {Object.entries(policies).map(([id, p]) => (
                                <option key={id} value={id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <p className="schedule-detail">
                            {adult
                              ? game.job
                                ? policies[game.policy].detail
                                : "Chưa có hợp đồng việc làm · giờ làm được trả về thời gian nghỉ"
                              : "Lịch học & chăm sóc theo người giám hộ"}
                          </p>
                          {timeBar}
                          <p className="fine">
                            Lịch trung bình 168 giờ/tuần được phân bổ thành phút
                            theo ngày thực. Làm thêm chỉ có tiền khi hợp đồng
                            trả công.
                          </p>
                        </section>
                        <section className="small-quote">
                          <span>“</span>
                          <p>
                            Có những tháng không có chuyện lớn.
                            <br />
                            Nhưng vẫn là một phần cuộc đời.
                          </p>
                          <small>CHẬM MỘT CHÚT, SỐNG MỘT ĐỜI.</small>
                        </section>
                      </div>
                    </details>
                  </>
                )}
                {tab === "business" && (
                  <BusinessPanel
                    key={game.business?.id ?? "new-venture"}
                    game={game}
                    onAdvance={(input) => {
                      setAuto(false);
                      setSeek(false);
                      run(1, input);
                    }}
                  />
                )}
                {tab === "insight" && (
                  <div className="insight-stack">
                    <PersonalityPanel game={game} />
                    <InsightPanel game={game} />
                  </div>
                )}
                {tab === "career" && (
                  <CareerPanel
                    key={game.lifeId}
                    game={game}
                    onAdvance={(input) => run(1, input)}
                  />
                )}
                {tab === "finance" && (
                  <>
                    <section className="stats-grid financial-stats">
                      {[
                        ["Tiền mặt", game.cashVnd],
                        ["Danh mục theo giá thị trường", portfolioValue(game)],
                        ["Dư nợ", debts],
                        ["Tài sản ròng", netWorth(game)],
                      ].map(([title, v]) => (
                        <div className="panel stat" key={String(title)}>
                          <p>{title}</p>
                          <strong className="money-value">{money(v)}</strong>
                        </div>
                      ))}
                    </section>
                    <div className="dashboard-grid">
                      <section className="panel">
                        <h2>Đặt lệnh đầu tháng</h2>
                        <p className="fine">
                          Giá hiện tại · Thanh toán bằng VND danh nghĩa. Giá
                          tăng chưa tạo tiền mặt.
                        </p>
                        <label>
                          Tài sản
                          <select
                            value={asset}
                            onChange={(e) => setAsset(e.target.value)}
                          >
                            {Object.entries(assets).map(([id, a]) => (
                              <option key={id} value={id}>
                                {a.name} · {money(game.world.prices[id])}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Số lượng nguyên
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                          />
                        </label>
                        <div className="button-row">
                          {(["BUY", "SELL"] as const).map((side) => (
                            <button
                              key={side}
                              className={
                                side === "BUY" ? "primary" : "secondary"
                              }
                              disabled={locked || !adult}
                              onClick={() =>
                                run(1, {
                                  investmentOrders: [
                                    {
                                      orderId: `ui-${game.currentMonth}-${side}`,
                                      assetId: asset,
                                      side,
                                      quantity,
                                    },
                                  ],
                                })
                              }
                            >
                              {side === "BUY"
                                ? "Mua & sang tháng"
                                : "Bán & sang tháng"}
                            </button>
                          ))}
                        </div>
                        <p className="fine">
                          Quỹ khóa 1 tháng; góp vốn khóa 6 tháng. Chỉ bán phần
                          đã có thanh khoản.
                        </p>
                      </section>
                      <section className="panel">
                        <h2>Cam kết & hợp đồng</h2>
                        <div className="business-actions">
                          <button
                            className="secondary"
                            disabled={locked || !adult}
                            onClick={() => run(1, { careerAction: "SEEK" })}
                          >
                            Tìm việc từ tháng này
                          </button>
                          <button
                            className="secondary"
                            disabled={locked || !adult || !game.job}
                            onClick={() => run(1, { careerAction: "REDUCE" })}
                          >
                            Đổi sang hợp đồng 35 giờ
                          </button>
                          <button
                            className="secondary"
                            disabled={locked || !adult || !game.job}
                            onClick={() => run(1, { careerAction: "RETIRE" })}
                          >
                            Nghỉ việc & sang tháng
                          </button>
                        </div>
                        <p className="fine">
                          Không tự nghỉ hưu theo tuổi. Quyền lợi hưu trí trong
                          kịch bản:{" "}
                          {game.context.pensionEligible
                            ? money(game.context.pensionMonthlyVnd)
                            : "Chưa có điều kiện được xác nhận"}
                          . Tìm việc không tự tạo thu nhập khi chưa nhận hợp
                          đồng.
                        </p>
                        <p>
                          {game.job
                            ? `Lương hợp đồng ${money(game.job.salaryVnd)}/tháng · trả ngày ${game.job.payDay}.`
                            : "Chưa có hợp đồng việc làm."}
                        </p>
                        <p className="fine">
                          Lương tích lũy theo ngày lịch, trả phần đã tích lũy
                          tới ngày lương; phần sau đó chuyển kỳ tới. Công nợ
                          lương: {money(game.wageReceivableVnd)}.
                        </p>
                        {game.debts
                          .filter((d) => BigInt(d.principalVnd) > 0n)
                          .map((d) => (
                            <div className="debt-row" key={d.id}>
                              <b>
                                {d.id === "education"
                                  ? "Khoản học phí mẫu"
                                  : d.id.startsWith("arrears:")
                                    ? "Chi phí chưa thanh toán"
                                    : d.id}
                              </b>
                              <span>{money(d.principalVnd)}</span>
                              <small>
                                Đến hạn ngày {d.dueDay} · lãi{" "}
                                {d.monthlyRateBps / 100}%/tháng
                              </small>
                            </div>
                          ))}
                        <p className="fine">
                          Thiếu tiền được ghi vào khoản phải trả; tiền mặt không
                          âm. Điều khoản sandbox chưa phải chính sách thực tế.
                        </p>
                      </section>
                      <section className="panel full-width">
                        <h2>Danh mục đang nắm giữ</h2>
                        {game.holdings.length ? (
                          game.holdings.map((h, i) => (
                            <div className="debt-row" key={`${h.assetId}-${i}`}>
                              <b>
                                {assets[h.assetId as keyof typeof assets].name}{" "}
                                × {h.quantity}
                              </b>
                              <span>
                                {money(
                                  BigInt(h.quantity) *
                                    BigInt(game.world.prices[h.assetId]),
                                )}
                              </span>
                              <small>Có thể bán từ {h.availableFrom}</small>
                            </div>
                          ))
                        ) : (
                          <p className="subtle">
                            Bạn chưa nắm giữ tài sản đầu tư.
                          </p>
                        )}
                        <p className="fine">
                          Thị trường: {game.world.regime} · CPI giả định:{" "}
                          {(game.world.cpiBasisPoints / 100).toFixed(1)} (gốc
                          100). CPI chỉ phục vụ diễn giải; số dư không bị chia
                          cho CPI.
                        </p>
                      </section>
                    </div>
                  </>
                )}
                {tab === "family" && (
                  <>
                    <div className="section-intro">
                      <h2>Những người bên cạnh</h2>
                      <p>
                        Quà làm vui một lúc. Sự hiện diện và những lời hẹn được
                        giữ nuôi dưỡng lòng tin.
                      </p>
                    </div>
                    <div className="family-grid">
                      {game.npcs.map((n) => (
                        <section className="panel person-card" key={n.id}>
                          <div className="person-avatar">{n.name[0]}</div>
                          <h2>{n.name}</h2>
                          <p className="subtle">
                            {n.role} ·{" "}
                            {n.living
                              ? "Trong câu chuyện của bạn"
                              : "Đã khép lại cuộc đời"}
                          </p>
                          <div className="person-metrics">
                            <span>
                              Gắn bó <b>{Math.round(n.bond)}/100</b>
                            </span>
                            <span>
                              Lòng tin <b>{Math.round(n.trust)}/100</b>
                            </span>
                          </div>
                          <p>
                            {n.unmetNeeds > 3
                              ? "Đã lâu chưa có đủ thời gian chất lượng bên nhau."
                              : "Những buổi gặp bình thường cũng có ý nghĩa."}
                          </p>
                          <button
                            className="secondary"
                            disabled={locked || !adult || !n.living}
                            onClick={() => run(1, { giftNpcId: n.id })}
                          >
                            Tặng quà 200.000 ₫ & sang tháng
                          </button>
                          <h3>Lời hẹn & ký ức</h3>
                          {n.promises.slice(-5).map((p) => (
                            <p className="promise" key={p.id}>
                              {p.dueMonth} ·{" "}
                              {p.status === "PENDING"
                                ? "Đang chờ"
                                : p.status === "KEPT"
                                  ? "Đã giữ lời"
                                  : "Đã lỡ hẹn"}
                            </p>
                          ))}
                          {n.memories.slice(-3).map((m, i) => (
                            <p className="fine" key={i}>
                              {m.split(" (")[0]}
                            </p>
                          ))}
                          {!n.memories.length && !n.promises.length && (
                            <p className="fine">
                              Ký ức sẽ được ghi lại khi câu chuyện tiếp diễn.
                            </p>
                          )}
                        </section>
                      ))}
                    </div>
                  </>
                )}
                {tab === "journal" && (
                  <section className="panel">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">THỜI GIAN ĐÃ ĐI QUA</p>
                        <h2>Nhật ký cuộc đời</h2>
                      </div>
                      <span className="subtle">
                        {game.committedMonths} tháng hoàn tất
                      </span>
                    </div>
                    {game.reports
                      .slice()
                      .reverse()
                      .slice(page * 10, page * 10 + 10)
                      .map((r) => (
                        <article className="month-record" key={r.month}>
                          <h3>
                            {r.month.slice(5)}/{r.month.slice(0, 4)}{" "}
                            <small>· {r.age} tuổi</small>
                          </h3>
                          <p className="fine">
                            Thu {money(r.inflowVnd)} · Chi {money(r.outflowVnd)}{" "}
                            · Số dư {money(r.cashCloseVnd)}
                          </p>
                          {r.events.length ? (
                            r.events.map((e) => <p key={e.id}>{e.text}</p>)
                          ) : (
                            <p>
                              Một tháng bình yên. Những nhịp sống nhỏ vẫn tiếp
                              diễn.
                            </p>
                          )}
                        </article>
                      ))}
                    {!game.reports.length && (
                      <p className="subtle">Tháng đầu tiên đang chờ bạn.</p>
                    )}
                    <div className="pagination">
                      <button
                        className="secondary"
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                      >
                        ← Mới hơn
                      </button>
                      <span>Trang {page + 1}</span>
                      <button
                        className="secondary"
                        disabled={(page + 1) * 10 >= game.reports.length}
                        onClick={() => setPage(page + 1)}
                      >
                        Cũ hơn →
                      </button>
                    </div>
                    {game.annualReviews.length > 0 && (
                      <details>
                        <summary>Tổng kết năm từ các tháng đã hoàn tất</summary>
                        {game.annualReviews.slice(-5).map((y) => (
                          <p key={y.year}>
                            {y.year} · {y.months} tháng · Thu{" "}
                            {money(y.inflowVnd)} · Chi {money(y.outflowVnd)}
                          </p>
                        ))}
                      </details>
                    )}
                  </section>
                )}
                {tab === "method" && (
                  <section className="panel methodology">
                    <p className="eyebrow">MINH BẠCH VỀ MÔ HÌNH</p>
                    <h2>Một câu chuyện giả lập, với những giới hạn rõ ràng.</h2>
                    <h3>Tháng lịch là đơn vị thật của engine</h3>
                    <p>
                      Mỗi bước xử lý một tháng Gregory, gồm từng ngày, nghĩa vụ,
                      thu chi và sự kiện. Nhịp 1× là khoảng 72 giây/năm; các mức
                      tua 1×–16× chỉ đổi thời gian trình diễn. Mọi quyết định
                      quan trọng đều dừng tự động.
                    </p>
                    <h3>Dữ liệu & địa phương</h3>
                    <p>
                      63 địa phương là danh mục lịch sử 2024, không phải địa
                      giới hiện hành. Bản alpha chưa có bộ chỉ báo đã kiểm toán
                      theo tỉnh. Không phân bổ thu nhập hay nguy cơ dựa vào định
                      kiến địa phương. Thế giới sau mốc khởi đầu là kịch bản giả
                      lập.
                    </p>
                    <h3>REALISM và HARDSHIP</h3>
                    <p>
                      REALISM là PROVISIONAL MODEL. HARDSHIP giảm tiền dự phòng,
                      tăng chi phí mẫu và tần suất lời mời/sự kiện thường. Hai
                      chế độ dùng chung lịch, sổ cái, thị trường và quy tắc cuối
                      đời.
                    </p>
                    <h3>Sự kiện, tính cách và kinh doanh</h3>
                    <p>
                      Nhánh chuyện xét người thân đang sống, nguồn lực, nghề, ký
                      ức, khu vực cư trú và trạng thái doanh nghiệp. Tính cách
                      thay đổi chậm qua thói quen, không khóa ở tuổi 3/5. Không
                      tự nghỉ hưu ở tuổi 65 hay cấp việc làm theo lịch năm. Thu
                      nhập hưu trí chỉ có khi kịch bản đã ghi rõ điều kiện và
                      hợp đồng.
                    </p>
                    <p>
                      Cửa hàng có sổ riêng: ngân hàng, tồn kho, phải thu, phải
                      trả và nguồn vốn. Chỉ tiền thực rút được mới về ví cá
                      nhân. HARDSHIP dùng chi phí doanh nghiệp cao hơn 10%, cửa
                      sổ suy giảm 0,22 thay 0,12 và đáy nhu cầu 0,55 thay 0,65;
                      tất cả là giả định, không phải xác suất thất bại doanh
                      nghiệp ngoài đời.
                    </p>
                    <h3>Cuối đời & dữ liệu còn thiếu</h3>
                    <p>
                      Thời điểm khép lại được chọn từ một khoảng tuổi demo
                      76–95, không phải xác suất tử vong, dự báo sức khỏe hay
                      tuổi thọ người Việt. NPC khép lại ở tuổi 96 trong cùng
                      kịch bản demo. Chưa có mô hình bệnh tật, thuế, bảo hiểm
                      hoặc chính sách theo từng thời kỳ.
                    </p>
                    <h3>Quyền riêng tư & lưu trữ</h3>
                    <p>
                      Save được lưu trong IndexedDB của trình duyệt, gồm seed,
                      phiên bản engine, sổ cái và quyết định đang chờ. Bạn có
                      thể xuất/nhập JSON. Không có tài khoản hay dữ liệu chơi
                      gửi lên máy chủ.
                    </p>
                    <h3>Thời gian và tiền</h3>
                    <p>
                      Lịch trung bình được phân bổ thành phút nguyên trên 7
                      ngày, không mô phỏng ca lao động pháp lý. Tiền dùng BigInt
                      và chuỗi VND; lãi hợp đồng làm tròn đồng gần nhất. Chi phí
                      sinh hoạt được tính theo ngày, không tự xóa nghĩa vụ khi
                      thiếu tiền. Quà không tăng lòng tin, hiệu quả cảm xúc giảm
                      dần theo số quà đã tặng.
                    </p>
                  </section>
                )}
              </>
            )}
            <div className="page-footnote">
              Một Đời Ở Việt Nam · Danh mục địa phương 2024 · Dữ liệu gameplay
              giả định
            </div>
          </main>
          {game && <WorldRail game={game} age={age} onNavigate={navigate} />}
        </div>
      </div>
    </div>
  );
}
