# VN63 — Codex Implementation Plan: Historical World 1975

**Mục tiêu**: triển khai start mặc định năm 1975 trên repo Next.js `conghau115599/vn63`; lịch sử đáng tin đến cutoff xác minh; tiếp tục tương lai giả lập có tính liên tục. Đây là **kế hoạch giao việc**, không phải báo cáo đã code/QA. Canon chi tiết: [HISTORICAL_WORLD_ENGINE_1975_SPEC.md](HISTORICAL_WORLD_ENGINE_1975_SPEC.md).

## 1. Tình trạng code đã kiểm tra 21/10/2026

- README repo mô tả alpha `v1.3 Dynamic Branches + Causal Startups`; engine tháng là chính; bản playtest HTML v1.7 từ cuộc trò chuyện **chưa được đưa vào repo**.
- `src/simulation/init.ts` đang mặc định ngày sinh `2024-01-01`, tháng đầu `2024-01`; scenario trưởng thành có một số năm tương lai và số tiền mẫu. Phải đổi mặc định cho đời sinh năm 1975 **sau khi** nền tiền tệ/hành chính tương thích; không tự thay vội một chuỗi ngày sinh.
- `src/simulation/playback.ts` đang đặt `YEAR_SECONDS = 72` (nhịp 1 năm/72 giây ở 1×), trái với canon được chốt là **1 giây/tuần**. Issue #1 đã yêu cầu nâng tuần→tháng; cần phối hợp để không triển khai hai loại clock riêng hoặc làm hỏng ledger.
- `src/content/provinces.2024.json` là snapshot 63 tỉnh và mới có **ADMIN_NAMES_ONLY**, birth/population đều null: không sử dụng như lịch sử hành chính 1975 và không tự suy tỷ lệ sinh.
- `src/simulation/business/advanceBusinessMonth.ts` đã có mô hình dòng tiền/tồn kho/công nợ theo tháng, cần adapter occupation/legal/currency hiệu lực theo năm thay vì thay toàn bộ model.
- `src/simulation/save.ts` có cơ chế versioned migration từ đời cũ; mở rộng schema và giữ khả năng import save cũ.
- Các pathway ATHLETE/ARTIST hiện có nhưng chưa có các giải đấu/fame; Issue #3 là phần mở rộng riêng.

**Ưu tiên tích hợp**: #1 (weekly+UI+NPC) và contracts lịch sử nên phối hợp trước. #2 (Province Identity) cần `geoLocationId` và `getAdminUnitAt`; #3 và #4 đọc bối cảnh nghề, đời sống và NPC từ cùng `WorldContext`.

## 2. Milestones: PR nhỏ, có thể review độc lập

| Phase/PR | Công việc | Sản phẩm nghiệm thu | Phụ thuộc |
|---|---|---|---|
| P0 — Audit/fixture | Audit tất cả đường set DOB/date, tên tỉnh, giả định lương/giá, danh mục nghề, save, QA; baseline tests và gap matrix | `docs/HISTORY_GAP_MATRIX.md` và test fixtures | Không |
| P1 — Contracts + calendar | WorldTimeline/HistoryPack/schema, provenance/cutoff, event idempotency; thống nhất tick tuần→tháng với #1, seed theo world vs life; UI nhịp 1s/tuần | Unit dates/leap/seek deterministic, fixtures source | P0 + interface #1 |
| P2 — Admin history | Geo ID ổn định, province/admin era, getAdminUnitAt, các mốc 1975/1976/1978–79/1989/1991/1996–97/2024/2025; migration địa danh cũ | Test địa danh, không thay quê lịch sử; các snapshot 38/63/34 | P1 |
| P3 — Monetary regimes | MonetaryEpoch + cash/deposit/asset types, 1975/1978/1985, conversions theo loại tài khoản có nguồn, CPI/wage fallback; reconcile ledger | Accounting invariants, fixtures chuyển 1978/1985 | P1–P2 |
| P4 — Career/time gating | Industry/occupation legal availability theo năm, education/skill gates, employer cohorts theo vùng; startup models và đầu tư chỉ xuất hiện khi hợp lệ | 1980 không có smartphone/niêm yết; 1991/2000 đúng mốc | P2–P3 |
| P5 — Observed history | Historical event dataset (năm, ngày, địa điểm, nguồn); world→province→household event exposure; giai đoạn 1975–2026 theo nguồn | 8 tỉnh pilot đủ chiều sâu, journal/cause, factual vs personal distinction | P2–P4 |
| P6 — Future generator | WorldScenario seeded sau cutoff, dự báo kinh tế-xã hội có quán tính, local impacts; save generated history | Stability + 1000 lives no future rewrites | P5 |
| P7 — UX/performance/QA | Start default 1975, optional 1986/2000/2024, screens Việt, 4 nhóm quản lý, popup; optimize autosave/seek | Playtest từ sơ sinh→già, browser, QA/audit report | P1–P6 |

**Không đặt thời hạn giả định**; P2 và P3 là hai mốc rủi ro cao vì dữ liệu lịch sử không đầy đủ. Chỉ hứa một phase khi fixture+QA đã được xác nhận.

## 3. Chi tiết cách Codex triển khai

### P0: Inventory + tiền điều kiện
1. Clone repo mới nhất, đọc README, docs, core/calendar, businesses, career, save, UI, tests.
2. Tạo mapping tất cả nơi currently hardcode `2024`, `2052`, `2099`, default money VND, provinceId string và nghề enum.
3. Phân loại code có thể giữ, adapters cần thêm, phần thiếu cần thiết kế; ghi baseline tình trạng kiểm thử thực tế.
4. Bảo đảm các bản save v1.2/v1.3 mở không tự bị chuyển thành 1975; **chỉ new game default=1975**. Các save hiện có giữ DOB, tiền, mốc lịch sử đã ghi.

### P1: Các interface dùng chung
- `src/simulation/history/types.ts`, `worldTimeline.ts`, `provenance.ts`, `cutoff.ts`.
- `src/simulation/geography/types.ts`, `resolveAdministrativeUnit.ts`.
- `src/simulation/economy/monetaryEpoch.ts`, `convertCurrency.ts`.
- `src/simulation/careers/occupationHistory.ts`.
- `src/content/history/events.*.json`, `src/content/geography/admin-history.*.json`, `src/content/economy/monetary-eras.*.json`, `src/content/careers/availability.*.json`.
- Schema validator nguồn: numeric có unit/mẫu số nếu cần, source URL, ngày phát hành/hiệu lực, phạm vi địa lý, quality, version. Event historical toàn quốc có lịch định sẵn; event cá nhân dùng life RNG.
- Mọi data loader giữ version/checksum để reload hoặc update pack không tạo lại quá khứ của save.

### P2: Admin, tập trung đúng các mốc
- 1975: không áp một bộ 38 tỉnh duy nhất cho toàn năm; nhiều thay đổi diễn ra giai đoạn cuối 1975/1976.
- Năm 1976: bộ 35 tỉnh + 3 thành phố sau hợp nhất, theo hồ sơ Cục Lưu trữ.
- 1989/1991/1996/1997/2000s: tách/sáp nhập/đổi tên và hiệu lực theo từng văn bản nguồn.
- Snapshot cuối 2024 63 tỉnh; nghị quyết Quốc hội ngày 12/06/2025 và các chính quyền mới vận hành từ 01/07/2025: 34 đơn vị. Mỗi mapping được review khi chưa có boundary geometry; không 'đoán tỉnh' chỉ từ một tên quận/huyện trùng nhau.

### P3: Money/ledger (cực kỳ quan trọng)
- Không một loại `cashVnd` thống nhất cho giai đoạn 1975–1985. Bổ sung monetary regime có thể cùng tồn tại theo địa lý/thời gian, và các holdings cụ thể.
- Sự kiện đổi tiền có nhiều luật: tiền mặt, hạn mức, số dư tiết kiệm theo ngày gửi, tiền gửi, lương còn phải thu, nợ/khế ước, hàng hóa/tài sản. Quy tắc được chính sách và nguồn điều khiển, không phải một multiply global.
- Cơ chế game phải phân biệt cash balance và purchasing power, CPI, wage median, cost of living, savings returns; tất cả phải có kỳ, vùng, danh mục tiền.
- Làm test lịch sử 1978 và 1985 với cả deposit vintage và tài khoản giới hạn; test bút toán đóng mở, idempotency khi fast-forward, không double-create wealth.
- Nếu chưa xác minh luật chi tiết theo ngày, fallback **PROVISIONAL** có nhãn và không áp sai các ràng buộc pháp lý.

### P4: Nghề nghiệp
- Nghề có: `firstEligibleDate` khi phù hợp, region/sector exposure, qualifications, work regime, wage interval theo kỳ, promotion paths.
- Nghề truyền thống không tự biến mất chỉ vì ngành mới xuất hiện.
- Hình thức doanh nghiệp tư nhân phải phù hợp các mốc pháp luật; có khác biệt giữa mưu sinh cá thể và doanh nghiệp đăng ký.
- Từ 28/07/2000 mới có giao dịch cổ phiếu niêm yết Việt Nam theo mô hình thị trường tập trung; trước đó tiền tiết kiệm/đất/vàng/tài sản hiện vật tuân theo quy định thời kỳ, không mặc định mọi loại tài sản được phép chuyển nhượng tự do.
- 6+ ngành nghề pilot có cả nông nghiệp, nhà máy, giáo dục, y tế, công vụ/xí nghiệp, dịch vụ, và một số ngành phát triển sau 1990; phân bố theo nơi cư trú, không theo định kiến địa phương.

### P5: Historical events
- Fact index quốc gia: mốc lịch sử chính, kinh tế, luật, hạ tầng, Internet, dịch bệnh, địa giới, thị trường chứng khoán.
- Kết nối mỗi fact event tới exposure model: phụ thuộc địa lý, tuổi, nghề, thu nhập, nhà ở, lịch sử di cư, hành vi và nguồn lực gia đình; không cố định biến cố cá nhân.
- Có thể sử dụng event arc lịch sử nhiều tháng/năm, giống chuỗi thay đổi việc làm→chuyển tỉnh→gia đình→thu nhập. Không dùng câu thoại NPC hệt nhau cho tất cả 63 địa phương.
- Pilot tối thiểu 8 tỉnh/khu vực đa dạng, sau đó mở đầy đủ 63 lịch sử 2024 khi đã có mapping và regional packs.

### P6: Future
- Không auto hardcode vào năm 2027. Source pack xác minh tới đâu, World Generator chỉ tiếp diễn sau đó. Năm 2026 phải có cả observed và future tùy từng pack. Future do worldSeed tạo, individual impacts do lifeSeed và choices quyết định.
- Triển khai biến động có quán tính: thị trường, hạ tầng, ngành nghề, tỷ lệ lao động, giá cả, di cư, thiên tai/rủi ro đã mô phỏng. Có thể tiêu cực/tích cực, không xác nhận đã xảy ra.
- Khi nhân vật thay đổi thế giới mô phỏng lớn (chủ doanh nghiệp lớn, người lãnh đạo tổ chức), tác động chỉ phát sinh sau quyết định, không ảnh hưởng retroactive lịch sử.

### P7: UI simplification
- Start screen giữ chọn sinh ngẫu nhiên: default 'Sinh năm 1975', lựa chọn thay thế nằm trong mở rộng.
- 4 tab: Sự nghiệp, Tài chính, Quan hệ, Bản thân; phần lịch sử chỉ ở nhật ký và cột mốc. 0–4 không có popup đòi quyết định.
- Một lời dẫn ngắn vào từng giai đoạn: 'Đổi Mới 1986' hiển thị một lần nếu có ảnh hưởng; có link 'Nguồn & bối cảnh' mở sâu.
- Nhãn 'Tương lai giả lập' xuất hiện rõ ở thời gian sau cutoff. dd/mm/yyyy và số tiền đúng lịch sử; không dùng máy đo hiện đại vào bối cảnh 1975 nếu không phù hợp.

## 4. Acceptance gates / checklist cho PR

**Mỗi PR phải đạt:** `npm run validate:content`, `npm run typecheck`, `npm test`, `npm run build`. Browser E2E qua `npm run test:e2e` khi có môi trường Chromium; ghi lỗi thật nếu thiếu runner (không tự nhận pass).

**P0/P1**: unit tests calendar/seed/pack/version; đảm bảo v1.3 regression.
**P2**: tests map 1975→1976 (38)→2024 (63)→2025 (34); bản đồ stable location, lịch sử tên địa danh bất biến.
**P3**: example cash vs savings conversion; 1978 và 1985; balance ledger zero errors; no duplicate conversion after pause/resume/save.
**P4**: occupation eligibility, law effective dates, stock 2000, Internet 1997; lương theo period.
**P5**: factual events stable across seeds, impacts differ by locality/exposure, no forced historical personal tragedy.
**P6**: deterministic future 1×/16×/load; saved world history untouched; scenario branching and economic bounds.
**P7**: 1.000 lives smoke (0–death), screenshot desktop/mobile; decision burden measured; profile dates localized, 0–4 no decisions, family NPC name consistent.

**Định nghĩa hoàn tất:** đầu đời 1975 có thể chơi trọn cuộc đời, tính hết lịch sử và giai đoạn tương lai, không sai luật nghề/tiền/hành chính một cách rõ ràng, có provenance và test evidence. Các data gaps còn lại công khai là estimates chứ không giả nhận hoàn hảo.

## 5. Lệnh triển khai cho Codex

Nhiệm vụ theo thứ tự: (1) audit repository và lập gap matrix; (2) thực hiện P1 contracts với test; (3) đưa P2–P3 vào engine bằng adapters và dữ liệu nguồn đã kiểm chứng; (4) tiếp tục P4–P7, mở PR nhỏ sau mỗi phase. **Không sửa hoặc merge thẳng nhánh main, không deploy production khi chưa có duyệt.** Không tự giả định các tệp HTML playtest nằm trong repo. Khi cần, xin bổ sung các file tham khảo từ user; nền code chính phải là Next.js hiện tại.

**GitHub Issue #5:** https://github.com/conghau115599/vn63/issues/5
