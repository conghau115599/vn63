# GDD ADDENDUM v1.2 — MONTHLY LIFE SIMULATION / MÔ PHỎNG THEO THÁNG

**Dự án:** Một Đời Ở Việt Nam — VN63 Life Simulator  
**Ngày:** 20/10/2026  
**Trạng thái:** Quyết định thiết kế được chốt.  
**Thứ tự ưu tiên tài liệu:** v1.2 này > v1.1 (`GDD_ADDENDUM_V1_1_TIME_TRADEOFFS.md`) > GDD v1.0. V1.1 vẫn có hiệu lực về 168 giờ/tuần, hạnh phúc hai tầng, quan hệ NPC, đầu tư và tính bất đối xứng, ngoại trừ nơi v1.2 đổi nhịp thời gian. Không thay đổi hai mode REALISM và HARDSHIP.

## 1. Quyết định cốt lõi

- **1 tick gameplay = 1 tháng lịch**, không phải 1 năm. Người chơi thấy `Tháng MM/YYYY`, tuổi hiện tại, bảng thu chi, sự kiện, lựa chọn quan trọng, biểu đồ nhân vật và tài sản.
- **1 năm = 12 tick**. Một đời 75 năm có 900 monthly ticks; một đời 90 năm có 1.080 ticks. Engine phải có thể chạy âm thầm qua tháng bình yên, tránh 900 màn hình popup.
- **Bên trong 1 monthly tick:** phân bổ thời gian bằng lịch trung bình theo tuần (168 giờ/tuần), rồi quy đổi theo số ngày thực của tháng; các nghĩa vụ có lịch ngày cụ thể được trừ theo ngày. Tháng có 28/29/30/31 ngày, năm nhuận Gregorian.
- **Không phải mỗi tháng đều có quyết định lớn.** Mỗi tháng có thông tin thu chi và một bản nhật ký tóm tắt, nhưng chỉ sự kiện cần can thiệp mới chặn tiến trình.
- Bắt đầu mỗi tháng, người chơi *có thể* chỉnh lịch sống, học hành, kế hoạch chi tiêu, giao dịch tài sản, tìm việc, ưu tiên chăm sóc, nhưng **không phải khai báo lại tất cả mỗi tháng**: mặc định tự duy trì các chính sách trước đó (`standingOrders`).
- Trẻ sơ sinh và trẻ nhỏ không tự ra quyết định đầu tư/đi làm. Các nghĩa vụ, chăm sóc và định đoạt thuộc về người giám hộ. Học tập và nghề nghiệp phụ thuộc lứa tuổi và điều kiện hợp pháp của thế giới đang mô phỏng.

## 2. Luồng một tháng (core loop)

1. Hiển thị **đầu tháng**: tháng/năm, tiền mặt, dư nợ, sức khỏe, hạnh phúc, quan hệ, dự báo các khoản phải trả và lịch biểu.
2. Nếu có **điểm quyết định** (vd. chấp nhận việc mới, gia đình phải nhập viện), người chơi quyết định hoặc tự động hóa trong phạm vi quy tắc đã chọn; pause khi sự kiện mang tính quyết định chưa giải quyết.
3. Có thể điều chỉnh chiến lược tháng: làm việc, gia đình, học tập, tăng giờ, giảm chi, đầu tư. Phải hiện rõ **thời gian và tiền đã được cam kết**.
4. Nhấn **Sang tháng** hoặc bật tự động. Engine xử lý tất cả những nghĩa vụ và biến cố trong tháng một cách xác định theo seed.
5. Hiển thị **báo cáo cuối tháng**: thu nhập thực nhận, chi phí, trả nợ, lãi/lỗ đã thực hiện, giá trị tài sản ước tính, số giờ dành cho gia đình, mức nghỉ ngơi, lời hứa bỏ lỡ, các sự kiện đã phát sinh và tác động tồn đọng.
6. Các tháng không có quyết định quan trọng tự chạy theo tốc độ đã chọn. **Tới quyết định tiếp theo** vẫn xử lý mọi monthly tick trung gian, không cộng gộp 12 tháng thành một tick năm.

### Giao diện đề xuất

```text
┌ Tháng 10/2036 • 28 tuổi • TP.HCM ──────── [Tạm dừng] [1×] [4×] [12×] ┐
│ Sức khỏe 74 | Hạnh phúc 61 | Kiến thức 68 | Quan hệ 53              │
│ Tiền mặt 28,4tr | Dư nợ 32tr | Tài sản ròng 84tr                     │
├──────────────────────────────┬─────────────────────────────────────────┤
│ Bảng thu chi tháng           │ Dòng thời gian tháng                    │
│ + Lương và thu nhập          │ • Công ty đề nghị nhận dự án mới       │
│ - Sinh hoạt, nhà, chăm con   │ • Đã hủy hai buổi hẹn do tăng ca       │
│ - Trả nợ, tiền lãi           │ • Tiền thuê tăng từ tháng sau          │
│ ± Giao dịch đầu tư           │ • Danh mục cổ phiếu giảm giá           │
│ Quỹ dự phòng (bao nhiêu tháng)│ [Quyết định quan trọng, nếu có]       │
├──────────────────────────────┴─────────────────────────────────────────┤
│ Thời gian tuần: làm việc / gia đình / ngủ / chăm sóc / học / nghỉ     │
│ [Sửa lịch] [Chỉnh chi tiêu] [Đầu tư] [Xem quan hệ] [Sang tháng ▶]     │
└─────────────────────────────────────────────────────────────────────────┘
```

Các con số giao diện là **minh họa**, không phải dữ liệu dự báo.

## 3. Các cơ chế được tick hằng tháng

| Hệ thống | Mỗi tháng cập nhật | Thao tác người chơi |
|---|---|---|
| Thời gian | số giờ theo ngày thực; thời gian bị chiếm; lời hứa/ưu tiên | chọn lịch làm, học, gia đình, nghỉ | 
| Thu nhập | ngày công, lương được trả, thưởng đã có điều kiện, thu nhập tự doanh | đổi việc, làm thêm, nghỉ việc, nhận dự án | 
| Sinh hoạt | nhà, điện nước, thức ăn, con cái, đi lại, chăm sóc, bảo hiểm | chọn mức chi, cắt giảm, chuyển chỗ ở | 
| Nợ | lãi hiệu dụng tháng, số tiền đến hạn, phạt nếu đủ điều kiện, khoản thực trả | trả thêm, cơ cấu, thương lượng, vay | 
| Đầu tư | thị trường tháng, giao dịch, cổ tức/lãi khi đến lịch, hạn chế thanh khoản | nạp/rút, đặt lệnh, tái phân bổ, giữ | 
| Sức khỏe | phục hồi, mệt tích lũy, thiếu ngủ, điều trị liên tục, hạn chế năng lực | thay lịch, chăm sóc, khám chữa bệnh | 
| Hạnh phúc | mood thay đổi nhanh, life satisfaction thay đổi chậm | lựa chọn tạo nguồn vui hoặc ý nghĩa, không spam cộng điểm | 
| Quan hệ | mức hiện diện thật, chất lượng tương tác, biến cố NPC, hứa/hẹn | gọi điện, gặp mặt, hỗ trợ tài chính, xử lý xung đột | 
| Nghề nghiệp/kỹ năng | giờ học hữu ích, kinh nghiệm, tiến độ thử việc, đánh giá | chọn khóa học, việc mới, phương án thăng tiến | 
| Rủi ro/lừa đảo | nguy cơ theo mức tiếp xúc và ngữ cảnh, biến cố bất ngờ hợp lý | xác minh, nhận/từ chối, khiếu nại và phục hồi | 
| Hoàn cảnh vĩ mô | chỉ số giá, lương nghề, giá tài sản, môi trường, thay đổi chính sách | phản ứng qua các lựa chọn đời sống | 

## 4. Nhịp sự kiện và nhịp kể chuyện

- `MONTHLY_ROUTINE`: cập nhật bắt buộc, thường không cần lựa chọn (lương, thuê nhà, lãi nợ, thời gian, hồi phục).
- `MINOR_STORY`: mẩu nhật ký ngắn, có thể liên kết hậu quả, không buộc bấm lựa chọn.
- `DECISION_EVENT`: xuất hiện khi có điều kiện (cơ hội việc làm, giao dịch đáng ngờ, người thân cần hỗ trợ). Chỉ dừng tự động khi nó **thực sự cần quyết định**.
- `LONG_ARC`: mạch câu chuyện nhiều tháng/quý/năm; nhiều biến cố nhỏ có thể kết hợp thành biến cố lớn; lưu `arcId`, `stage`, `dueYearMonth`.
- `MILESTONE`: sinh nhật, đi học, tốt nghiệp, cưới hỏi, con cái, nghỉ hưu; không giả định tất cả nhân vật đi cùng lộ trình.
- `ANNUAL_REVIEW`: điểm nhấn tổng kết cuối năm, **không thay thế monthly ticks**.
- Bất kỳ tháng nào cũng có thể *không có chuyện lớn*; không ép một sự kiện tiêu cực chỉ để có nội dung.
- Tránh sự kiện lặp: cần `cooldownMonths`, `maxLifetimeOccurrences`, `prerequisites`, `dedupeKey`, `characterMemory`, `intensityBudget`. Không đặt tần suất scam theo một hằng số giống nhau mọi tháng.
- UI “Tới quyết định tiếp theo” được phép tự chạy qua hàng chục tháng nhưng phải cho xem các tháng và chỉ dấu quan trọng trong lịch sử.

### Chống tình trạng 900 lượt bấm

- Ở giai đoạn 0–5 tuổi: phần lớn tháng chạy tự động, chỉ dừng tại sự kiện thực sự cần định đoạt do người giám hộ hoặc cột mốc đặc biệt.
- 6–17 tuổi: cho chọn định hướng học/hoạt động kéo dài theo học kỳ; vẫn tính từng tháng; trẻ không có quyền định đoạt mọi khoản tài chính.
- 18+ tuổi: lifestyle/financial/investment policies là `standingOrders` liên tục có hiệu lực cho đến khi người chơi đổi hoặc hoàn cảnh buộc phải đổi.
- Các tốc độ: `1×`, `4×`, `12×`, `tới quyết định tiếp theo`, `tạm dừng` (hệ số chỉ ảnh hưởng thời gian trình diễn UI, **không** thay đổi quy tắc tính toán hoặc RNG).
- Tạm dừng các quyết định đảo ngược khó khăn: ký hợp đồng nợ lớn, kết hôn/ly hôn, đổi nghề, đầu tư phần lớn vốn, phẫu thuật quan trọng, quyết định pháp lý. Autopilot không được tự ý chi/vay vượt giới hạn người chơi đặt.

## 5. Mô hình đồng hồ và năm/tháng/ngày

- `YearMonth = YYYY-MM` trong lịch Gregory; `birthDate = YYYY-MM-DD` và `currentMonth` lưu riêng, không dùng `age++` mỗi 12 click một cách không kiểm tra.
- Dùng thời gian mô phỏng theo lịch Việt Nam, không dùng đồng hồ hệ thống hoặc timezone thiết bị để quyết định số ngày. Sinh nhật ngày 29/02 cần chính sách hiển thị nhất quán vào năm không nhuận; **định nghĩa mẫu: 28/02**.
- Số giờ tháng: `daysInMonth(year, month) * 24`; lịch theo tuần là **tốc độ trung bình**, chuyển đổi `scheduledMonthlyHours = weeklyHours * daysInMonth/7`, sau đó điều chỉnh theo các ca và ngày nghỉ/thực tế. Các cam kết cụ thể đặt theo ngày phải trừ khỏi tổng tháng đúng một lần.
- Không lấy 4 tuần = 1 tháng, hoặc 12 tháng = 52 tuần để khấu trừ hai lần thời gian; do cách quy đổi tồn tại giờ lẻ, dùng số nguyên phút nội bộ và quy tắc làm tròn công khai.
- Tiền lưu bằng **số nguyên VND** (hoặc kiểu số nguyên có kiểm soát), sử dụng sổ cái giao dịch; tính lãi cần quy tắc làm tròn nhất quán. Nhận lương/thưởng khi đến kỳ thanh toán; làm thêm **không tự bảo đảm được trả**.
- Thu nhập năm/tháng và giá tiêu dùng: ghi giao dịch VND danh nghĩa theo kỳ, có thể hiển thị giá trị thực về năm gốc qua CPI; không nhập nhằng “tiền sau lạm phát” với số dư ngân hàng.
- Lãi suất năm hiệu dụng sang tháng: `r_month = (1 + r_year)^(1/12)-1` nếu hợp đồng quy định lãi kép theo tháng; với các khoản vay/sản phẩm khác, dùng đúng điều khoản mô phỏng. Không chia mù quáng 12 nếu giả định không khớp.

## 6. Xác suất và sự kiện phát sinh theo tháng

Khi chỉ có xác suất năm cho một nguy cơ xảy ra trong một cửa sổ cố định, giả định nguy cơ đều theo tháng:

```text
p_month = 1 - (1 - p_year) ^ (1/12)
```

Đây là phép quy đổi **theo giả định nguy cơ không đổi**, chỉ nên sử dụng khi không có dữ liệu theo mùa và không có phụ thuộc theo lịch sử. Với rủi ro tử vong, nhập viện, tai nạn nghề nghiệp hoặc rủi ro theo mùa, ưu tiên bảng nguy cơ phù hợp theo tuổi, tháng, thời gian phơi nhiễm; **không bắt đầu từ thống kê thiếu dữ liệu rồi khẳng định là tỷ lệ thật**.

- Đối với sự kiện tùy theo giờ lao động, tiếp xúc quảng cáo đầu tư, di cư, thiên tai theo mùa hoặc bối cảnh xã hội: hazard phụ thuộc mức tiếp xúc và trạng thái, không phải ngẫu nhiên 1/12 thuần túy.
- `HARDSHIP` có thể tăng tần suất trở ngại vừa/nhỏ, chi phí bất ngờ và khó phục hồi, nhưng **không** phóng đại vô cớ tỷ lệ tử vong hoặc sự kiện nhạy cảm.
- Kết quả ngẫu nhiên phải được seed và ghi lại; sử dụng RNG chia theo namespace thế giới/thị trường/NPC/sự kiện để tránh thay UI hoặc thứ tự sự kiện làm lệch toàn bộ cuộc đời. Cùng seed + version + input decisions + config => cùng lịch sử.

## 7. Thứ tự xử lý hằng tháng để không bị lỗi

```text
function resolveMonth(state, input): MonthResult {
  assert(state.alive && state.phase === 'AWAITING_MONTH_INPUT');
  // 1. Snapshot immutable of YYYY-MM and pending obligations/decisions
  // 2. Validate decisions/policies against age, law and available resources
  // 3. Resolve calendar (days), weekly schedule and fixed-day obligations
  // 4. Evolve world prices/market for the month (one update per month)
  // 5. Compute work, wages due, education, productivity and caregiving
  // 6. Post income and recurring expenses to ledger with unique IDs
  // 7. Post debt interest, scheduled repayment and investments (actual transaction date)
  // 8. Resolve fatigue/recovery, NPC relations, mood/life satisfaction
  // 9. Roll eligible events using current context; apply immediate effects
  // 10. Queue/apply deferred effects due this month (idempotent IDs)
  // 11. Resolve health/end-of-life and stop processing if death event occurs
  // 12. Commit single immutable MonthResult, snapshot and journal entries
  // 13. Advance YearMonth by exactly 1; if pause-required event, set pending
}
```

**Quan trọng:** Những khoản mục trong tháng có ngày hiệu lực phải tính theo đúng thứ tự thời gian nội tháng khi ảnh hưởng đến tiền và sức khỏe. Pseudo thứ tự trên là **giai đoạn**, không được xử lý lương cả tháng sau khi nhân vật qua đời giữa tháng, hoặc tính lãi sau một giao dịch chưa xảy ra. Khuyến nghị transaction/event queue có `effectiveDate` để xử lý thứ tự trong tháng.

### Quy tắc một lần (idempotency)

Mỗi payroll, tiền thuê, trả nợ, cổ tức, sự kiện trì hoãn có `transactionId` hoặc `eventExecutionId = lifeId + YYYY-MM + sourceId + occurrence`. Nếu tải lại save giữa tháng, không được ghi bút toán trùng. `monthlyTickId = lifeId/YYYY-MM` chỉ được `COMMITTED` một lần.

## 8. Hệ thống bất đối xứng theo tháng: ví dụ

Tình huống minh họa ở tuổi 28, nhân vật có việc hành chính, nhận thêm 15 giờ/tuần trong 6 tháng. Không mặc định được trả thêm tiền hoặc thăng chức.

| Tháng | Lựa chọn/hoàn cảnh | Hậu quả có thể xảy ra |
|---|---|---|
| 1 | Đồng ý làm thêm; đổi lịch | Giờ làm tăng, giờ gia đình và nghỉ giảm |
| 2 | Dự án tiến triển | Nếu thực tế được trả thêm, dòng tiền có thể tăng; mệt mỏi tích lũy |
| 3 | Hủy hẹn nhiều lần | NPC ghi ký ức, lòng tin có thể giảm; niềm vui từ một món quà không tự xóa ký ức |
| 4 | Tháng có biến cố gia đình | Buộc phải chọn giảm giờ làm, chi tiền thuê hỗ trợ hoặc bỏ lỡ nghĩa vụ |
| 5 | Công ty có thay đổi nhân sự | Có thể được cân nhắc thưởng/thăng chức, hoặc kế hoạch đổ vỡ |
| 6 | Kết thúc dự án | Tiền có thể tăng, sức khỏe/quan hệ phục hồi dần nếu người chơi chủ động thay đổi |

Trong cùng seed và tình huống, lựa chọn lối sống cân bằng có thể cho tài sản tăng chậm hơn **nhưng không có quy tắc ép nghèo**; nhân vật giàu sẵn có thể mua dịch vụ tiết kiệm thời gian, trong khi người nghèo làm thêm vẫn không đủ tiền. Game không được bù trừ điểm vô căn cứ.

## 9. Thời kỳ lịch sử và tương lai

- `province_id` dùng 63 địa phương theo địa giới 2024 với năm tham chiếu nguồn. Tháng của game có thể diễn ra trong lịch sử hoặc tương lai giả lập.
- Cần `worldScenario`: `historical_observed` (khi dữ liệu có), `historical_estimated` (thiếu dữ liệu) hoặc `future_simulated`; nhãn nguồn rõ ràng theo từng tham số. Không lấy thông tin năm 2024 áp cho các thập niên mà không hiệu chỉnh hoặc ghi giả định.
- Khi chuyển năm: 12 ticks liên tục, chạy `yearEndReport`, rà lại hợp đồng học/làm, cập nhật thuế/quy định giả lập theo năm, đánh giá xu hướng; **không thêm tick tháng 13**.

## 10. Đặc tả kỹ thuật tối thiểu

```ts
type YearMonth = `${number}-${string}`; // runtime must validate YYYY-MM
interface MonthlyState {
  lifeId: string;
  currentMonth: YearMonth;
  birthDate: string; // YYYY-MM-DD
  living: boolean;
  mode: 'REALISM' | 'HARDSHIP';
  seed: string;
  worldVersion: string;
  engineVersion: string;
  lifestylePolicy: string;
  standingOrders: Array<{ id: string; effectiveFrom: YearMonth; expiresAt?: YearMonth; data: unknown }>;
  processedMonthIds: string[]; // persisted compactly in production
  scheduledConsequences: Array<{ id: string; dueMonth: YearMonth; status: 'PENDING' | 'APPLIED' | 'CANCELLED' }>;
}
interface MonthReport {
  yearMonth: YearMonth;
  days: number;
  time: { availableMinutes: number; usedMinutes: number; displacedMinutes: number };
  cashInVnd: number;
  cashOutVnd: number;
  cashEndVnd: number;
  debtEndVnd: number;
  assetMarketValueVnd: number;
  events: Array<{ id: string; effectiveDate: string; category: string; visibleText: string }>;
  upcomingDecisions: string[];
  notes: string[];
}
```

Versioned saves include `lifeId`, `birthDate`, `currentMonth`, `mode`, `seed`, `worldVersion`, `engineVersion`, `rngVersion`, ledger and all applied pending consequences. UI speed must not change the deterministic result.

## 11. QA/điều kiện nghiệm thu bổ sung v1.2

1. 12 monthly ticks advances exactly 1 Gregorian year in calendar, including February leap years; 75 years = 900 ticks.
2. Every month has correct number of days and monthly available minutes = `days * 24 * 60`.
3. Weekly 168h resolves into monthly hours with proper partial-week accrual and no double counting.
4. Each paid salary/expense/debt repayment can be traced; midmonth job/death/relocation prorates obligations where applicable.
5. No skip or dupe after save/load, pause/resume, fast-forward, going to next decision; replay is deterministic.
6. An encounter requiring user input must pause auto mode, including a high-impact contractual or relationship decision.
7. Idle months can show zero forced events; event spam/cooldowns/eligibility behave correctly.
8. Stopping annual-only focus must not erase childhood education/skill progression; monthly policy persistence works.
9. Relationships, fatigue, satisfaction, debt and investments carry across month and year boundaries.
10. Money is nominal in ledger; CPI-adjusted reporting uses documented base period and never changes the bank balance.
11. Simulation stops correctly at death, without paying full month income after midmonth death.
12. Parallel seed tests in REALISM/HARDSHIP isolate parameter changes, keep core logic same, never make official statistical claims from assumed fixtures.
13. Monte Carlo tests log counts by month, phase and province, runtime performance, unreachable arcs, and fairness across starting conditions. At least 100k lifetime simulations is the final stress acceptance target; smaller suites run on every commit.

**Codex MUST implement a working monthly simulation, not merely update labels from 'year' to 'month'.**
