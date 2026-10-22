# VN63 — P0 audit / gap matrix

Audit 22/10/2026, baseline `80cc99584044664e6460d92683c471dc450c2ad9`. Canon: PR #7, commit `64f6fe1c5ebb8c528cb8a3adaa6b58b280671763`, toàn bộ `VN63_MASTER_CODEX_HANDOFF_1975.md`; Issues #1–#5 và comments; PR #6 (hai tài liệu lịch sử). PR #6/#7 đang mở, chỉ có tài liệu; không merge hoặc coi chúng là code đã triển khai.

ZIP v1.7 do chủ dự án cung cấp đã đọc README, hướng dẫn thay đổi, family/childhood tests và các điểm tích hợp engine/UI. Nó là prototype JS riêng, không thay Next.js. Các catalog 208 nghề/81 doanh nghiệp và risk profile chưa qua audit nguồn; không import như dữ liệu lịch sử.

## Kiểm kê source và baseline

- Next.js/React/TypeScript, pure `src/simulation`, IndexedDB `src/persistence`, React components/app, scripts kiểm toán, 7 unit suites + desktop/mobile E2E. Không có backend tài khoản.
- `advanceMonth.ts`: khởi tạo lịch và input đầu tháng → vòng ngày (sự kiện ngày 12, công nợ/lương/sinh hoạt theo hạn) → business/NPC/traits/report/tổng kết cuối tháng. Đây là chỗ nối nhịp tuần, không viết business engine thứ hai.
- `MonthlySchedule.ts`: 168h/tuần, chia phút theo ngày thực, nghĩa vụ và displacement; tiếp tục sử dụng. Trẻ đang dùng lịch học chung dưới 18, chưa có hoạt động phù hợp từ đúng sinh nhật 5.
- `events.ts`/eligibility: seeded exposure, context, actors, cooldown/arcs; authority CAREGIVER vẫn trả popup cho người chơi. Chưa có decision orchestrator riêng.
- `init.ts`: DOB cố định 01/01/2024; fixtures 28/75 tuổi, tiền hiện đại và NPC “Mẹ/Ngọc”. `playback.ts`: 72 giây/năm. Đây là xung đột với canon mới.
- Finance BigInt/ledger, monthly business bank/inventory/AR/AP/payroll/capital/draw/debt và career ATHLETE/ARTIST đã có kiểm thử; giữ core và regression. Không có tiền tệ 1975/1978/1985, nghề theo luật hoặc tổ chức/competition/fame.
- `provinces.2024.json`: 63 ID/tên, ADMIN_NAMES_ONLY, births/population null; không phải 63 hồ sơ kinh tế hay bản đồ lịch sử. `LifeDashboard` đang đọc tên 2024 cho mọi năm.
- `save.ts`: schema 2→3, cursor/pending decisions, validation sổ; thiếu weekly cursor/currentDate, pack pinning và recovery backup. Không có importer HTML v1.7.
- UI 8 tab, có inspector/debug/chuỗi tiếng Anh/ISO date/điểm lẻ; cần gom bốn nhóm, journal là trang chính, phần kỹ thuật ở Xem thêm.
- Baseline chạy thực: content validator PASS; 49 unit/property/integration tests PASS (22/10/2026). Build/browser/smoke của P1 ghi trong báo cáo QA riêng, không dùng kết quả baseline thay kết quả sau sửa. CI baseline đã green tại run 39396762199 (20/10).

## Ma trận canon → khoảng cách → dependency / kiểm chứng

| Canon                                | Hiện có                                   | Khoảng cách / hành động                                                                              | Phase / test                                                          |
| ------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| DOB seeded 1975, không viết lại save | Fixed 2024                                | DOB/ngày hiện tại; chỉ game mới đổi default; giữ fixture legacy riêng                                | P1; nhiều seed/ngày nhuận/save                                        |
| 1s ≈ 7 ngày, tháng Gregorian         | Vòng ngày trong tick tháng                | Horizon theo ngày, weekly target lưu được khi pause; cả batch/seek dùng cùng transition              | P1; 1×/16×/seek parity, leap/year/month boundaries                    |
| Quyết toán tháng exactly once        | Ledger và monthly report                  | Giữ ledger theo ngày đến hạn, chỉ commit report/business khi đóng tháng; không giả 4 tuần/tháng      | P1; so với monthly legacy, bank/AR/AP/interest invariants             |
| 0–4 zero player decisions            | Popup authority caregiver                 | Orchestrator để NPC giám hộ giải quyết, nhật ký có actor; chặn API chủ động                          | P1; seed/property, legacy pending recovery                            |
| 5+ hoạt động theo hoàn cảnh          | Policies cố định, practice                | Hoạt động theo tuổi/nguồn lực; đổi phần lịch chưa xử lý, không sửa quá khứ                           | P1; đúng sinh nhật, phút ≤168h và persistence                         |
| 4 nhóm + journal, tiếng Việt         | 8 tabs                                    | Sự nghiệp/Tài chính/Quan hệ/Bản thân; business dưới Sự nghiệp, debug trong Xem thêm                  | P1; desktop/mobile, accessible popup                                  |
| WorldContext/provenance/cutoff       | Demo version strings                      | Contracts dùng chung; thiếu pack thật trả MISSING, không hardcode năm tương lai                      | P1 contracts → P2 content; validation/cutoff/pinning                  |
| Admin date-aware, stable geo         | 63 names 2024 only                        | Chưa xác minh mapping từng vùng/ngày 1975, snapshot 1976/2025                                        | P2 BLOCKED DATA; 38/63/34 + không đổi quê                             |
| Monetary epochs và conversion        | Chỉ VND demo                              | Thiếu văn bản/quy tắc cash/deposit/debt từng thời kỳ                                                 | P2 BLOCKED DATA; không auto nhân tỷ lệ hay áp lương hiện đại cho 1975 |
| Nghề/luật/đầu tư theo niên đại       | 2 talent + generic job/2 business sectors | Cần availability/occupation/monetary packs; 208/81 catalog prototype không có nguồn đủ               | P2/P5; date gates + salary/slot audit                                 |
| Province identity 8 pilot→63         | Taxonomy only                             | Nguồn sector/cost/culture/exposure theo năm; không province→personality                              | P3/P8; sourced differential cohorts                                   |
| NPC identity/guardian graph          | 2–3 demo NPC, bond/trust/promises         | P1 chỉ giám hộ nhất quán và danh tính sơ bộ; genealogy/household/offscreen/marriage/children chưa có | P4; graph 10k, no double transfer, consent                            |
| Multi-path breakthrough/legacy       | Hợp đồng 6 tháng                          | CEO/scientist/competition/fame/contribution chưa có                                                  | P5; no teleport, vacancies/records/setbacks                           |
| Fact history vs personal exposure    | Mọi event ASSUMPTION                      | Verified facts, cutoff/exposure và source reviews chưa có                                            | P2/P6; fixed facts every seed, no duplicate history                   |
| Disease/mortality calibrated         | Terminal age 76–95 demo; NPC 96           | Không bảng hazard, disease treatment, calibration                                                    | P6 BLOCKED DATA; không quảng cáo thống kê/tăng tử vong HARDSHIP       |
| Future causal world                  | Seeded monthly market demo                | Chưa world latent state/quarterly causal generator/history                                           | P7; pack cutover, no retroactive rewrite                              |
| Migration/recovery/replay            | v1.2/v1.3 JSON                            | Additive weekly metadata + backup; HTML importer vẫn không hỗ trợ                                    | P1/P9; old pending/cash/NPC/history preserved                         |
| Full life 1975→future                | Demo full life                            | Tick đầy đủ chạy được không đồng nghĩa lịch sử/tiền tệ/xã hội đã đủ                                  | P9 overall acceptance; chưa đạt                                       |

## Quyết định kỹ thuật và rủi ro

1. **Một clock duy nhất**: mở horizon của vòng ngày hiện có. Weekly target còn lại được pin qua popup/save, tránh sau mỗi lần chọn vô tình cộng thêm 7 ngày. Batch 16 chỉ là 16 lần cùng transition; auto/seek không tự chọn.
2. **Bảo toàn legacy**: fixtures 2024 và save v1.2/v1.3 không bị dời về 1975, không reroll RNG/NPC, không chuyển số dư sang đơn vị giả. Nhánh mới chỉ push PR; main không bị thay.
3. **1975 trước dữ liệu P2**: default ngày sinh mới 1975 trong chế độ nền lịch sử có nhãn dữ liệu còn thiếu. Không hiển thị tên tỉnh 2024 như tên năm 1975, không áp 7,5 triệu VND/tháng/lương hiện đại/đổi tiền tự chế. Các nghiệp vụ cần dữ liệu chưa có bị khóa với lý do rõ; demo hiện đại còn trong kịch bản QA riêng. Đây là giới hạn P1, không phải triển khai P2.
4. **Daily vs monthly**: lương/nghĩa vụ theo ngày hợp đồng hiện có, sổ tổng kết và business chỉ đóng cuối tháng. Week qua ranh giới có thể đóng một tháng rồi bắt đầu tháng khác; không dồn 4 tuần thành tháng hoặc chạy monthly settlement hai lần.
5. **Mid-month actions**: đầu tư/business vẫn theo hợp đồng đầu tháng; UI thông báo thời điểm. Thói quen cá nhân chọn từ đúng sinh nhật 5; nếu tháng đã mở thì áp từ đầu tháng sau. Không viết lại lịch/ledger đã qua.
6. **Nguồn**: P1 không tuyên bố xác minh các URL trong tài liệu; chúng là source-to-verify cho P2. No numeric history fixtures = không bịa thống kê. Cutoff null không được coi là verified/future facts.
7. **Hiệu năng**: giữ lịch ngày và cap batch; benchmark/smoke lưu thời gian thực. Không spawn hàng triệu NPC. Giao diện debug ẩn nhưng còn truy cập để kiểm toán.

## Thứ tự tiếp theo

P0 audit → P1 core/UX + contracts P2 → PR kiểm thử → duyệt trước P2. Sau đó P2 historical data → P3/P4 → P5/P6 → P7 → P8/P9 theo master. Các pha chưa làm không được đánh dấu complete từ số test của engine demo.
