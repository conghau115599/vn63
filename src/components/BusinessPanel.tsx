"use client";
import { useState } from "react";
import type { GameState, MonthlyInput } from "../simulation/types";
import type { BusinessMonthInput } from "../simulation/business/types";
import { ageOn, dateInMonth } from "../simulation/calendar/YearMonth";
const money = (v: string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(BigInt(v));
export function BusinessPanel({
  game,
  onAdvance,
}: {
  game: GameState;
  onAdvance: (input: Partial<MonthlyInput>) => void;
}) {
  const b = game.business,
    locked = !!game.cursor || !game.living,
    adult =
      ageOn(
        game.birthDate,
        dateInMonth(
          game.currentMonth,
          game.currentMonth === game.birthDate.slice(0, 7)
            ? +game.birthDate.slice(8)
            : 1,
        ),
      ) >= 18;
  const [capital, setCapital] = useState("15000000"),
    [sector, setSector] = useState<"retail" | "service">("retail"),
    [price, setPrice] = useState(b?.strategy.priceVnd ?? "100000"),
    [marketing, setMarketing] = useState(
      b?.strategy.marketingBudgetVnd ?? "300000",
    ),
    [hours, setHours] = useState(b?.strategy.ownerHoursPerWeek ?? 15),
    [stock, setStock] = useState(b?.strategy.inventoryOrderUnits ?? 100),
    [delay, setDelay] = useState(b?.strategy.collectionDelayMonths ?? 0),
    [financing, setFinancing] = useState("1000000");
  const next = (input: Omit<BusinessMonthInput, "yearMonth">) =>
    onAdvance({ business: { yearMonth: game.currentMonth, ...input } });
  const last = b?.reports.at(-1),
    closed = b?.status === "CLOSED";
  const statuses = {
    IDEA: "Ý tưởng",
    VALIDATING: "Đang kiểm chứng",
    ACTIVE: "Đang hoạt động",
    PAUSED: "Tạm dừng",
    RESTRUCTURING: "Đang chuyển hướng",
    CLOSED: "Đã đóng",
  };
  if (!b)
    return (
      <section className="panel business-intro">
        <p className="eyebrow">TỰ VẬN HÀNH MỘT CÔNG VIỆC</p>
        <h2>Một ý tưởng, nhiều việc cần làm.</h2>
        <p>
          Khởi nghiệp bắt đầu bằng vốn thật, giờ làm thật và thông tin còn
          thiếu. Cửa hàng có ngân hàng và sổ sách riêng; doanh thu chưa thu được
          không nằm trong ví cá nhân.
        </p>
        <div className="form-grid">
          <label>
            Mô hình thử nghiệm
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as typeof sector)}
            >
              <option value="retail">Cửa hàng bán lẻ</option>
              <option value="service">Dịch vụ địa phương</option>
            </select>
          </label>
          <label>
            Vốn chuyển từ ví cá nhân (VND)
            <input
              type="number"
              min="1"
              step="100000"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
            />
          </label>
        </div>
        <p className="fine">
          Tháng kiểm chứng: 200.000 VND từ cửa hàng và 4 giờ/tuần. Khai trương
          cần kỳ kiểm chứng hoàn tất và 500.000 VND thiết lập. Điều kiện, giấy
          phép và các con số đều là hợp đồng sandbox, chưa phải pháp luật hiện
          hành.
        </p>
        <button
          className="primary"
          disabled={locked || !adult}
          onClick={() =>
            onAdvance({
              startBusiness: { sectorId: sector, capitalVnd: capital },
              business: { yearMonth: game.currentMonth, action: "VALIDATE" },
            })
          }
        >
          Nghiên cứu ý tưởng & sang tháng →
        </button>
        {!adult && (
          <p className="fine">
            Trẻ em không tự mở doanh nghiệp; quyền quyết định hiện thuộc người
            giám hộ.
          </p>
        )}
      </section>
    );
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">KINH DOANH · SỔ RIÊNG</p>
          <h2>
            {b.sectorId === "retail" ? "Cửa hàng nhỏ" : "Dịch vụ địa phương"}
          </h2>
        </div>
        <span className="demo-badge">{statuses[b.status]}</span>
      </div>
      <div className="stats-grid financial-stats">
        {[
          ["Tiền ngân hàng", b.bankCashVnd],
          ["Doanh thu kỳ trước", last?.revenueVnd ?? "0"],
          ["Lợi nhuận kỳ trước", last?.profitVnd ?? "0"],
          ["Dòng tiền kỳ trước", last?.cashFlowVnd ?? "0"],
        ].map(([label, value]) => (
          <section className="panel stat" key={label}>
            <p>{label}</p>
            <strong className="money-value">{money(value)}</strong>
          </section>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <h2>Chọn cách vận hành</h2>
          <div className="form-grid">
            <label>
              Giá mỗi đơn (VND)
              <input
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label>
              Ngân sách tiếp cận/tháng (VND)
              <input
                type="number"
                min="0"
                value={marketing}
                onChange={(e) => setMarketing(e.target.value)}
              />
            </label>
            <label>
              Giờ chủ làm mỗi tuần
              <input
                type="number"
                min="0"
                max="80"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </label>
            <label>
              Lượng nhập kho/vật tư mỗi tháng
              <input
                type="number"
                min="0"
                max="100000"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </label>
            <label>
              Khách trả sau
              <select
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
              >
                <option value="0">Thu tiền trong tháng</option>
                <option value="1">1 tháng</option>
                <option value="3">3 tháng</option>
              </select>
            </label>
          </div>
          <div className="button-row">
            <button
              className="primary"
              disabled={locked || closed}
              onClick={() =>
                next({
                  strategy: {
                    priceVnd: price,
                    marketingBudgetVnd: marketing,
                    ownerHoursPerWeek: hours,
                    inventoryOrderUnits: stock,
                    collectionDelayMonths: delay,
                  },
                  ...(b.status === "VALIDATING" ? { action: "LAUNCH" } : {}),
                })
              }
            >
              {b.status === "VALIDATING" ? "Khai trương" : "Áp dụng kế hoạch"} &
              sang tháng
            </button>
          </div>
          <p className="fine">
            Năng lực giao hàng bị giới hạn bởi thời gian thực, nhân sự và tồn
            kho. Yêu cầu nhập hàng chỉ thực hiện trong giới hạn tiền và tín dụng
            nhà cung cấp.
          </p>
          <div className="business-actions">
            {(
              [
                ["FIND_CUSTOMERS", "Tìm khách · dùng 8 giờ"],
                ["TRAIN", "Học vận hành · 300.000 VND + 4 giờ"],
                ["RENEGOTIATE", "Thử đàm phán chi phí"],
              ] as const
            ).map(([action, label]) => (
              <button
                className="secondary"
                key={action}
                disabled={
                  locked ||
                  closed ||
                  !["ACTIVE", "RESTRUCTURING"].includes(b.status)
                }
                onClick={() => next({ action })}
              >
                {label}
              </button>
            ))}
            <button
              className="secondary"
              disabled={
                locked ||
                closed ||
                !["ACTIVE", "RESTRUCTURING", "PAUSED"].includes(b.status)
              }
              onClick={() =>
                next({
                  action: "PIVOT",
                  newSector: b.sectorId === "retail" ? "service" : "retail",
                })
              }
            >
              Chuyển mô hình
            </button>
            <button
              className="secondary"
              disabled={
                locked ||
                closed ||
                b.status === "IDEA" ||
                b.status === "VALIDATING"
              }
              onClick={() =>
                next({ action: b.status === "PAUSED" ? "RESUME" : "PAUSE" })
              }
            >
              {b.status === "PAUSED" ? "Mở lại" : "Tạm dừng bán"}
            </button>
            <button
              className="secondary"
              disabled={locked || closed}
              onClick={() => next({ action: "CLOSE" })}
            >
              Đóng hoạt động · vẫn giữ công nợ
            </button>
          </div>
        </section>
        <section className="panel">
          <h2>Khách hàng & năng lực</h2>
          <div className="funnel-grid">
            {[
              ["Tiếp cận", last?.leads ?? 0],
              ["Đặt hàng", last?.orders ?? 0],
              ["Giao được", last?.delivered ?? 0],
              ["Hoàn trả", last?.returns ?? 0],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <b>{value}</b>
                <small>{label}</small>
              </div>
            ))}
          </div>
          <div className="money-rows">
            <div>
              <span>Tồn kho/vật tư ({b.inventoryUnits} đơn vị)</span>
              <b>{money(b.inventoryCostVnd)}</b>
            </div>
            <div>
              <span>Khách chưa thanh toán</span>
              <b>{money(b.receivablesVnd)}</b>
            </div>
            <div>
              <span>Hóa đơn phải trả</span>
              <b>{money(b.payablesVnd)}</b>
            </div>
            <div>
              <span>Nợ vay doanh nghiệp</span>
              <b>{money(b.debtVnd)}</b>
            </div>
            <div>
              <span>Thời gian chủ kỳ trước</span>
              <b>{((last?.ownerMinutes ?? 0) / 60).toFixed(1)} giờ</b>
            </div>
            <div>
              <span>Runway theo burn thực tế</span>
              <b>
                {last?.runwayMonths === null
                  ? "Chưa có burn ròng"
                  : last
                    ? `${last.runwayMonths?.toFixed(1)} tháng`
                    : "Chưa đủ kỳ"}
              </b>
            </div>
          </div>
          {last?.explainers.map((text, i) => (
            <p className="fine" key={i}>
              {text}
            </p>
          ))}
          <p className="fine">
            Kỹ năng vận hành {b.founderSkill.operations.toFixed(1)} · bán hàng{" "}
            {b.founderSkill.sales.toFixed(1)} · uy tín {b.goodwill.toFixed(1)}.
            Chưa hiệu chuẩn theo dữ liệu kinh doanh Việt Nam.
          </p>
        </section>
        <section className="panel">
          <h2>Vốn và dòng tiền với cá nhân</h2>
          <label>
            Số tiền (VND)
            <input
              type="number"
              min="0"
              value={financing}
              onChange={(e) => setFinancing(e.target.value)}
            />
          </label>
          <div className="business-actions">
            <button
              className="secondary"
              disabled={locked || closed}
              onClick={() => next({ capitalInjectionVnd: financing })}
            >
              Góp thêm vốn từ ví
            </button>
            <button
              className="secondary"
              disabled={locked}
              onClick={() => next({ ownerWithdrawalVnd: financing })}
            >
              Rút về ví khi đủ tiền
            </button>
            <button
              className="secondary"
              disabled={locked || closed || !b.creditApproved}
              onClick={() => next({ loanVnd: financing })}
            >
              Đề nghị vay theo hạn mức
            </button>
            <button
              className="secondary"
              disabled={locked}
              onClick={() => next({ loanRepaymentVnd: financing })}
            >
              Trả gốc vay
            </button>
          </div>
          <p className="fine">
            Hạn mức tối đa {money(b.creditLimitVnd)}; còn kiểm tra vốn và khoản
            vay hiện hữu. Lãi hợp đồng mẫu 0,8%/tháng. Không có khoản vay được
            duyệt chỉ vì câu chuyện cần tiền.
          </p>
        </section>
        <section className="panel">
          <h2>Cam kết nhân sự</h2>
          {b.employees.map((e) => (
            <div className="debt-row" key={e.id}>
              <b>{e.id}</b>
              <span>{money(e.wageVnd)}/tháng</span>
              <small>
                {e.hoursPerWeek} giờ/tuần ·{" "}
                {e.endDate ? `Kết thúc ${e.endDate}` : `Bắt đầu ${e.startDate}`}
              </small>
              {!e.endDate && (
                <button
                  className="text-button"
                  disabled={locked || closed}
                  onClick={() => next({ terminateEmployeeId: e.id })}
                >
                  Kết thúc từ đầu tháng này
                </button>
              )}
            </div>
          ))}
          <button
            className="secondary"
            disabled={locked || b.status !== "ACTIVE"}
            onClick={() =>
              next({
                hire: {
                  id: `nhan-su-${b.employees.length + 1}`,
                  wageVnd: "1500000",
                  hoursPerWeek: 20,
                  skill: 60,
                  startDate: `${game.currentMonth}-01`,
                },
              })
            }
          >
            Thuê hỗ trợ mẫu · 20 giờ/tuần
          </button>
          <p className="fine">
            Cam kết thử nghiệm 1,5 triệu VND/tháng; không phải mức lương hợp
            pháp được xác minh. Đóng cửa chấm dứt hợp đồng hoạt động; lương đã
            ghi nợ vẫn còn.
          </p>
        </section>
      </div>
    </>
  );
}
