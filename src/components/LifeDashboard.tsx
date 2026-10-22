"use client";
import { useState } from "react";
import { simulationDate, worldContext } from "../simulation/world/contracts";
import type { GameState } from "../simulation/types";
import { ageOn } from "../simulation/calendar/YearMonth";

const currency = (value: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(BigInt(value));
const careerName = (game: GameState) =>
  game.job?.occupation === "ATHLETE"
    ? "Vận động viên"
    : game.job?.occupation === "ARTIST"
      ? "Nghệ sĩ biểu diễn"
      : game.job
        ? "Đang đi làm"
        : game.context.career === "RETIRED"
          ? "Đã nghỉ việc"
          : "Chưa có hợp đồng";

export function PixelAvatar({ young = false }: { young?: boolean }) {
  return (
    <svg viewBox="0 0 40 48" aria-hidden="true" shapeRendering="crispEdges">
      <path fill="#e1ebe5" d="M0 0h40v48H0z" />
      <path
        fill="#bdcfc8"
        d="M4 0h2v48H4zM20 0h2v48h-2zM36 0h2v48h-2zM0 10h40v2H0zM0 26h40v2H0zM0 42h40v2H0z"
      />
      <path fill="#274b48" d="M12 8h16v4h4v16h-4v4H12v-4H8V12h4z" />
      <path fill="#e3af83" d="M12 14h16v14H12zM16 28h8v6h-8z" />
      <path fill="#243a3b" d="M14 18h3v3h-3zM23 18h3v3h-3z" />
      <path fill="#a76051" d="M18 25h5v2h-5z" />
      <path fill={young ? "#d8ae54" : "#557b85"} d="M9 34h22v14H9z" />
      <path fill="#f4ead0" d="M17 33h6v9h-6z" />
    </svg>
  );
}

export function ProfileRail({
  game,
  age,
  location,
}: {
  game: GameState;
  age: number;
  location: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const living = game.npcs.filter(
    (n) => n.living && n.birthDate <= `${game.currentMonth}-01`,
  );
  const bond =
    living.reduce((sum, n) => sum + n.bond, 0) / Math.max(1, living.length);
  const vitals = [
    { name: "Sức khỏe", value: game.health, color: "#2f8061" },
    {
      name: "Hạnh phúc",
      value: 0.3 * game.mood + 0.7 * game.satisfaction,
      color: "#b57a26",
    },
    { name: "Kiến thức", value: game.knowledge, color: "#328995" },
    { name: "Gắn bó", value: bond, color: "#a4405c" },
  ];
  return (
    <aside className="profile-rail" aria-label="Hồ sơ nhân vật">
      <section className="panel passport-card">
        <div className="passport-heading">
          <span>HỒ SƠ CÁ NHÂN · VN63</span>
          <b>{game.currentMonth.slice(0, 4)}</b>
        </div>
        <div className="passport-person">
          <div className="passport-avatar">
            <PixelAvatar young={age < 18} />
          </div>
          <div>
            <h2>{game.name}</h2>
            <p>
              {age} tuổi · {location}
            </p>
            <span className="profile-status">
              {age < 6
                ? "Những năm đầu đời"
                : age < 18
                  ? "Tuổi học trò"
                  : careerName(game)}
            </span>
            <button
              className="profile-toggle"
              aria-expanded={expanded}
              aria-controls="profile-facts"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Thu gọn ▴" : "Hồ sơ ▾"}
            </button>
          </div>
        </div>
        <dl
          id="profile-facts"
          className={expanded ? "profile-facts is-expanded" : "profile-facts"}
        >
          <div>
            <dt>Ngày sinh</dt>
            <dd>{game.birthDate.split("-").reverse().join("/")}</dd>
          </div>
          <div>
            <dt>Nơi sống</dt>
            <dd>{location}</dd>
          </div>
          <div>
            <dt>Hoàn cảnh</dt>
            <dd>
              {game.context.settlement === "URBAN" ? "Đô thị" : "Nông thôn"}
            </dd>
          </div>
          <div>
            <dt>Nguồn lực</dt>
            <dd>
              {game.context.resources === "AFFLUENT"
                ? "Dồi dào"
                : game.context.resources === "LIMITED"
                  ? "Hạn chế"
                  : "Ổn định"}
            </dd>
          </div>
          <div>
            <dt>{age < 18 ? "Chặng đời" : "Hôn nhân"}</dt>
            <dd>
              {age < 18
                ? age < 6
                  ? "Tuổi ấu thơ"
                  : "Tuổi đi học"
                : {
                    SINGLE: "Độc thân",
                    MARRIED: "Đã kết hôn",
                    WIDOWED: "Góa",
                    DIVORCED: "Đã ly hôn",
                  }[game.context.maritalStatus]}
            </dd>
          </div>
          <div>
            <dt>Chế độ</dt>
            <dd>{game.mode === "REALISM" ? "Thực tế" : "Khắc nghiệt"}</dd>
          </div>
        </dl>
        <div className="profile-footer">
          MỖI LỰA CHỌN · MỘT NGÃ RẼ
          <br />
          <span>Một Đời Ở Việt Nam / {game.birthDate.slice(0, 4)}</span>
        </div>
      </section>
      <section className="panel vitals-card">
        <div className="rail-heading">
          <h2>Trạng thái</h2>
          <small>0 — 100</small>
        </div>
        <div className="vitals-list">
          {vitals.map((v) => (
            <div className="vital-row" key={v.name}>
              <span>{v.name}</span>
              <div
                role="progressbar"
                aria-label={v.name}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(v.value)}
              >
                <i style={{ width: `${v.value}%`, background: v.color }} />
              </div>
              <b>{Math.round(v.value)}</b>
            </div>
          ))}
        </div>
        <div className="rail-note">
          {game.fatigue > 60
            ? "Bạn đang mệt. Hãy giảm cam kết và dành thời gian nghỉ."
            : "Những thói quen nhỏ đang định hình cuộc đời."}
        </div>
        <div className="condition-row">
          <span>
            Mệt mỏi <b>{Math.round(game.fatigue)}/100</b>
          </span>
          <span>
            Tinh thần <b>{Math.round(game.mood)}/100</b>
          </span>
        </div>
      </section>
      <section className="panel wallet-card">
        <p className="eyebrow">KHOẢNG THỞ TÀI CHÍNH</p>
        {worldContext(game).economyReady ? (
          <>
            <span>Tiền mặt hiện có</span>
            <strong>{currency(game.cashVnd)}</strong>
            <p>
              Thu tháng trước{" "}
              <b>{currency(game.reports.at(-1)?.inflowVnd ?? "0")}</b>
            </p>
            <p>
              Chi tháng trước{" "}
              <b>{currency(game.reports.at(-1)?.outflowVnd ?? "0")}</b>
            </p>
          </>
        ) : (
          <p>
            Đơn vị tiền và giá theo thời kỳ đang bổ sung. Chưa hiển thị số tiền
            hiện đại.
          </p>
        )}
      </section>
    </aside>
  );
}

export function LifeScene({
  game,
  age,
  location,
}: {
  game: GameState;
  age: number;
  location: string;
}) {
  const urban = game.context.settlement === "URBAN";
  return (
    <section className="scene-card panel" aria-label="Khung cảnh cuộc sống">
      <div className="scene-heading">
        <span>
          <i /> {location} · {urban ? "Nhịp phố thân quen" : "Một góc quê nhà"}
        </span>
        <small>THẾ GIỚI CỦA BẠN</small>
      </div>
      <svg
        className="pixel-scene"
        viewBox="0 0 800 240"
        role="img"
        aria-label={
          urban
            ? "Minh họa nhân vật giữa phố Việt Nam với mái nhà, hàng cây và xe máy"
            : "Minh họa nhân vật bên mái nhà và đồng lúa Việt Nam"
        }
        shapeRendering="crispEdges"
      >
        <defs>
          <pattern
            id="field-tiles"
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 19h40M20 0v20" stroke="#aabf83" strokeWidth="2" />
          </pattern>
        </defs>
        <path fill="#b7dce0" d="M0 0h800v240H0z" />
        <path fill="#f9e6a8" d="M68 28h30v8h8v30h-8v8H68v-8h-8V36h8z" />
        <path
          fill="#f9faf0"
          d="M160 38h62v-8h28v10h34v14H160zM488 28h35v-9h35v12h35v15H488zM672 53h24v-8h36v9h32v14h-92z"
        />
        <path
          fill="#91b7a7"
          d="M0 130h90v-12h80v12h95v-18h75v14h100v-16h90v15h80v-12h120v15h70v112H0z"
        />
        {urban ? (
          <g>
            <path fill="#e4d4b3" d="M182 76h78v94h-78zM588 62h70v108h-70z" />
            <path fill="#c5b292" d="M177 70h88v9h-88zM583 57h80v8h-80z" />
            <path
              fill="#659395"
              d="M196 92h18v22h-18zM231 92h16v22h-16zM196 130h18v22h-18zM231 130h16v22h-16zM601 79h16v23h-16zM631 79h16v23h-16zM601 117h16v23h-16zM631 117h16v23h-16z"
            />
          </g>
        ) : (
          <g>
            <path fill="#c4ce8e" d="M160 142h500v46H160z" />
            <path fill="url(#field-tiles)" d="M160 142h500v46H160z" />
            <path
              stroke="#829d69"
              strokeWidth="3"
              d="M170 165h440M186 150v36M234 150v36M282 150v36M330 150v36M378 150v36M426 150v36M474 150v36M522 150v36"
            />
          </g>
        )}
        <path fill="#b6c49a" d="M0 165h800v75H0z" />
        <path fill="#e6d8b9" d="M35 118h105v62H35zM682 120h91v60h-91z" />
        <path
          fill="#a75f4d"
          d="M23 119h130v-10h-12V98h-13V87H58v11H43v11H23zM674 120h107v-11h-12V98h-70v11h-25z"
        />
        <path fill="#785d49" d="M72 145h26v35H72zM713 145h24v35h-24z" />
        <path
          fill="#6e9996"
          d="M44 139h19v21H44zM107 139h22v21h-22zM748 139h16v20h-16z"
        />
        <path
          stroke="#6c7467"
          strokeWidth="5"
          d="M302 58v126M291 67h32M488 76v108M477 85h33"
        />
        <path
          fill="none"
          stroke="#677b70"
          strokeWidth="2"
          d="M0 52Q150 85 302 69Q395 101 488 87Q650 117 800 81"
        />
        <path
          fill="#4e7e64"
          d="M154 130h30v11h10v32h-50v-32h10zM545 111h35v11h13v40h-58v-40h10z"
        />
        <path stroke="#735b43" strokeWidth="7" d="M169 165v23M564 158v30" />
        <path fill="#b6a486" d="M0 187h800v7H0z" />
        <path fill="#72878a" d="M0 194h800v34H0z" />
        <path fill="#d5d2b4" d="M0 227h800v13H0z" />
        <path
          stroke="#dde0cb"
          strokeWidth="3"
          strokeDasharray="28 24"
          d="M0 215h800"
        />
        {age < 3 ? (
          <g transform="translate(377 172)">
            <path fill="#374e4d" d="M-6 0h10v4H-6zM0 0h4v21H0zM4 19h36v5H4z" />
            <path fill="#a95564" d="M4 0h32v19H4z" />
            <path fill="#f1dfb0" d="M5 0h12v7H5z" />
            <path fill="#e4b58f" d="M17 5h10v9H17z" />
            <path fill="#334e4f" d="M5 23h8v8H5zM28 23h8v8h-8z" />
          </g>
        ) : (
          <g
            transform={`translate(379 ${age < 12 ? 160 : 143}) scale(${age < 12 ? 0.75 : 1})`}
          >
            <path fill="#263c3c" d="M8 0h20v5h5v23H3V5h5z" />
            <path fill="#e5b58b" d="M8 8h20v18H8z" />
            <path fill="#314a43" d="M11 13h3v3h-3zM22 13h3v3h-3z" />
            <path fill="#bf6563" d="M3 29h30v24H3z" />
            <path fill="#efe4c8" d="M14 29h8v15h-8z" />
            <path fill="#2e4c5b" d="M7 53h9v10H7zM21 53h9v10h-9z" />
          </g>
        )}
        {urban && (
          <g transform="translate(639 186)">
            <path fill="#33494a" d="M0 13h12v12H0zM40 13h12v12H40z" />
            <path fill="#be6b53" d="M9 6h33v14H9zM29 0h8v9h-8z" />
            <path stroke="#33494a" strokeWidth="4" d="M32 1h13" />
          </g>
        )}
        <path fill="#759575" d="M0 234h800v6H0z" />
      </svg>
      <div className="scene-caption">
        <b>
          {age < 6
            ? "Những ngày đầu đời"
            : age < 18
              ? "Lớn lên từng chút một"
              : age < 60
                ? "Một cuộc đời, nhiều hướng đi"
                : "Tiếp tục viết câu chuyện của mình"}
        </b>
        <p>
          {urban
            ? "Phố xá vẫn chuyển động. Công việc, những mối quan hệ và lựa chọn nhỏ làm nên nhịp sống của bạn."
            : "Một mái nhà, những người thân và nhịp sống quen thuộc. Mỗi tháng đều có những điều đáng để quan tâm."}
        </p>
      </div>
    </section>
  );
}

export function WorldRail({
  game,
  age,
  onNavigate,
}: {
  game: GameState;
  age: number;
  onNavigate: (tab: "family" | "career" | "journal" | "business") => void;
}) {
  const date = simulationDate(game),
    people = game.npcs.filter((n) => n.living && n.birthDate <= date);
  const recorded = new Set(game.reports.map((r) => r.age));
  return (
    <aside className="world-rail" aria-label="Thông tin cuộc đời">
      <section className="panel family-summary">
        <div className="rail-heading">
          <h2>Những người bên cạnh</h2>
          <button className="text-button" onClick={() => onNavigate("family")}>
            Xem tất cả →
          </button>
        </div>
        {people.length ? (
          people.slice(0, 4).map((n) => (
            <div className="family-summary-row" key={n.id}>
              <div className="relative-avatar">{n.name.charAt(0)}</div>
              <div>
                <b>{n.name}</b>
                <small>{n.role}</small>
              </div>
              <span>{ageOn(n.birthDate, date)} tuổi</span>
            </div>
          ))
        ) : (
          <p className="fine">
            Chưa có người thân đang sống trong hồ sơ hiện tại.
          </p>
        )}
      </section>
      <section className="panel goal-summary">
        <p className="eyebrow">ĐIỀU BẠN ĐANG THEO ĐUỔI</p>
        <h2>
          {game.careerDevelopment.goal === "ATHLETE"
            ? "Con đường thể thao"
            : game.careerDevelopment.goal === "ARTIST"
              ? "Con đường biểu diễn"
              : age < 18
                ? "Lớn lên từng ngày"
                : "Chọn một hướng đi"}
        </h2>
        <p>
          {game.careerDevelopment.goal === "GENERAL"
            ? age < 18
              ? "Sự chăm sóc, học hỏi và thực hành từng chút một giúp bạn khám phá sở thích của mình."
              : "Bạn có thể bắt đầu một nghề mới, mở cửa hàng hoặc dành thời gian cho những người thân."
            : `${game.careerDevelopment.hours} giờ luyện mỗi tuần. Tiến bộ từ những lần thực hành, không chỉ từ may mắn.`}
        </p>
        <button className="secondary" onClick={() => onNavigate("career")}>
          {age < 18 ? "Khám phá sở thích →" : "Khám phá nghề mơ ước →"}
        </button>
        {!game.business && age >= 18 && (
          <button
            className="text-button"
            onClick={() => onNavigate("business")}
          >
            Tìm hiểu việc mở cửa hàng
          </button>
        )}
      </section>
      <section className="panel life-map-card">
        <div className="rail-heading">
          <h2>Bản đồ cuộc đời</h2>
          <small>1 ô = 1 năm</small>
        </div>
        <div
          className="life-map"
          role="img"
          aria-label={`Bản đồ 100 năm, hiện tại ${age} tuổi; ${recorded.size} năm tuổi có ghi chép mô phỏng`}
        >
          {Array.from({ length: 100 }, (_, i) => (
            <span
              key={i}
              className={[
                i === age ? "current" : "",
                recorded.has(i) ? "recorded" : "",
              ].join(" ")}
              title={`${i} tuổi · ${i === age ? "Tuổi hiện tại" : recorded.has(i) ? "Có tháng đã mô phỏng" : "Chưa có ghi chép"}`}
              aria-label={`${i} tuổi${i === age ? ", hiện tại" : recorded.has(i) ? ", có ghi chép" : ""}`}
            />
          ))}
        </div>
        <div className="map-legend">
          <span>
            <i className="recorded" /> Có ghi chép
          </span>
          <span>
            <i className="current" /> Hiện tại
          </span>
        </div>
        <p className="fine">
          Các ô ghi lại năm tuổi đã mô phỏng, không dự báo độ dài cuộc đời.
        </p>
        <button className="text-button" onClick={() => onNavigate("journal")}>
          Đọc lại những tháng đã qua →
        </button>
      </section>
      <section className="rail-footnote">
        <b>THEO NHỊP CỦA BẠN</b>
        <p>
          Không cần vội. Tự động sẽ dừng khi có quyết định cần bạn lựa chọn.
        </p>
        <span>VN63 · Nền tảng lịch sử · Thử nghiệm</span>
      </section>
    </aside>
  );
}
