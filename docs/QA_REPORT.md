# Báo cáo kiểm tra & triển khai VN63

**Hồ sơ lịch sử v1.2.** Báo cáo hiện hành: [QA_V13.md](QA_V13.md).

**Ngày:** 20/10/2026 · **Bản bàn giao:** 0.1.0 / engine 1.2.0-alpha.1 · **Kết luận:** có bản alpha chạy được; chưa đủ điều kiện release toàn bộ GDD.

## Tài liệu và repo

- Repo `https://github.com/conghau115599/vn63` trống khi clone. Không có game cũ, nhánh triển khai, workflow hay save để di trú. Đã dựng mã nguồn trong bản clone local; chưa commit hoặc push.
- Hai ZIP là spec và fixture. Gói v1.2 giữ tất cả file v1.1, chỉ README khác và có tài liệu bổ sung. Hai MD rời khớp byte với bản trong ZIP.
- Thứ tự spec: v1.2 > v1.1 > v1.0. Những lệnh trong tài liệu được dùng làm yêu cầu tham chiếu khi phù hợp, không coi là quyền độc lập để push hay xuất bản.
- Python kiểm tra monthly config và tradeoffs: PASS. Script Python schema ban đầu thiếu `jsonschema`; cài bổ sung bị môi trường từ chối ghi metadata. Đã kiểm tra schema Draft 2020-12 bằng AJV thay thế: PASS, cùng với 63 mã tỉnh duy nhất, 4 sự kiện mẫu nguồn và tổng trọng số outcome.

## Những gì đã triển khai

Gregorian YearMonth/DOB; 900 bước cho 75 năm; lịch nguyên phút; nghĩa vụ cố định; xử lý ngày nội tháng; cursor PAUSED lưu được; tiền BigInt; khoản phải trả/nợ/lương theo ngày; thị trường theo world seed và thanh khoản; mood, satisfaction, fatigue; NPC trust/bond/lời hứa/ký ức; hiệu quả quà giảm dần; 20 template sự kiện sơ bộ; hậu quả hoãn; nhật ký phân trang; hai mode; tạo cuộc đời từ 0 hoặc demo tuổi 28; kết thúc và tạo đời mới; IndexedDB atomic snapshot; nhập/xuất save và từ chối schema cũ rõ ràng.

## Bằng chứng kiểm tra

| Hạng mục                  | Kết quả thực tế                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript strict         | PASS (`tsc --noEmit`)                                                                                                                                 |
| Vitest                    | PASS: 18 tests, 3 files                                                                                                                               |
| Property test             | PASS: phép cộng/chênh tháng trên năm/tháng ngẫu nhiên                                                                                                 |
| Calendar                  | Năm nhuận thế kỷ, DOB 29/02, 900 tick và ngày không hợp lệ                                                                                            |
| Thời gian                 | 28/29/30/31 ngày, <=1.440 phút/ngày, 40/55 giờ, dịch 15 giờ/tuần, nghĩa vụ chỉ tính một lần, lịch bất khả thi                                         |
| Engine/finance            | Pure state; cân tiền; không trả overtime thiếu hợp đồng; debt không âm; tiền thiếu chuyển arrears                                                     |
| Save/decisions            | Pause ngày sự kiện, không commit giả, resume sau serialize, không trùng ledger, từ chối input tháng cũ                                                |
| Fast-forward              | 60 tháng theo manual và batch cùng lịch sử/state                                                                                                      |
| Health/terminal fixture   | Kết thúc ngày 15, không có giao dịch sau đó, chỉ trả công đã tích lũy                                                                                 |
| Investments               | Thị trường đổi hàng tháng, mark không thành tiền ví, lệnh trẻ em và bán trước thanh khoản bị chặn                                                     |
| NPC                       | Lỡ hẹn còn trong save; quà không tăng trust; shared world không đổi theo mode/person seed                                                             |
| Production build          | PASS: Next.js 16.4.2 webpack, static export `/` và `/_not-found`                                                                                      |
| Lifetime batch            | PASS invariants trong runner: **1.000 cuộc đời**, **1.022.152 monthly commits**, **60.342 quyết định**, **369.168 ms**                                |
| Mode/province trong batch | 500 REALISM + 500 HARDSHIP; 63 địa phương theo vòng lặp fixture, không phải lấy mẫu tỷ trọng sinh thật                                                |
| UI qua browser tích hợp   | Đã kiểm tra tạo tuổi 28, sang tháng, save/reload, tìm quyết định, pause và reload quyết định, chọn rồi tiếp tục, màn tài chính, xuất JSON và nhập lại |
| Responsive                | Kiểm tra 390×844 và 1440×1000: không tràn chiều rộng document; đã sửa hidden file input và menu mobile                                                |
| Console browser           | Không có error/warn trong luồng đã thử                                                                                                                |
| Playwright CLI            | Đã nhận diện 4 tests desktop/mobile; **bị chặn trước khi chạy worker bởi `spawn EPERM`**. Không tính 4 tests này là PASS                              |
| CI                        | Đã viết workflow; chưa chạy remote vì chưa push                                                                                                       |
| 10k/100k lifetime         | **CHƯA CHẠY** ở lượt này. Runner và CI có tham số cho đợt sau                                                                                         |
| GitHub/hosting            | **CHƯA COMMIT, CHƯA PUSH, CHƯA DEPLOY**                                                                                                               |

Batch result: `qa-results/simulation-1000.json`. Các assertions trong batch gồm commit đúng một tháng, không cash/debt âm, sổ tiền cân trong core, không vòng đời vô hạn. Không dùng batch này để tuyên bố mô hình đã hiệu chuẩn, công bằng thống kê hay đủ nghiệm thu release.

Lệnh tái lập trong môi trường Windows này:

```sh
node scripts/validate-fixtures.mjs
node node_modules/typescript/bin/tsc --noEmit
node --import ./scripts/windows-local.mjs node_modules/vitest/vitest.mjs run --configLoader native
node node_modules/next/dist/bin/next build --webpack
node node_modules/typescript/bin/tsc -p tsconfig.sim.json
node .sim-build/scripts/simulate.js --count=1000 --decision-policy=decline --output=qa-results/simulation-1000.json
```

## Chênh lệch với bản GDD hoàn chỉnh

- Chưa có mortality/illness/care model đủ dữ liệu. Tuổi kết thúc 76–95 và NPC 96 là **kịch bản demo**, không phải thống kê. Không suy diễn bệnh hoặc tuổi thọ từ giờ làm.
- Chỉ 2 NPC, chưa đủ household/guardian finances và graph gia đình. Chưa có hôn nhân, sinh con và đầy đủ cột mốc. Tuổi thơ hiện dùng chuyển lịch học/chăm sóc và quyết định người giám hộ đơn giản.
- Các template hiện chia sẻ 8 loại xử lý, chưa đạt độ sâu 20–30 tình huống và 4 long arcs của vertical slice GDD. Mời đầu tư chỉ có tìm hiểu/từ chối, chưa có đầy đủ scam state machine, thông tin ẩn và hồi phục.
- Chưa có cổ tức, tiền gửi/lãi định kỳ, phí/thuế, delinquency đầy đủ, hợp đồng nhiều loại hoặc hiệu chuẩn lương/chi phí theo thời kỳ. Chưa có khớp lệnh trong ngày tùy chọn; lệnh alpha dùng ngày 1.
- Lịch trung bình 7 ngày chưa phải mô hình ca làm pháp lý. Có API weeklyCalendar và nghĩa vụ theo ngày, UI chưa có trình soạn mọi nghĩa vụ/ca.
- Cơ chế học và công việc tối giản: tuổi >=18 có việc mẫu vào tháng 1 nếu chưa có việc, nghỉ ở 65; đây là placeholder gameplay minh bạch, cần thay bằng progression có eligibility/cơ hội.
- Mẫu schema sự kiện nguồn còn rộng: effect chỉ yêu cầu `op`; predicate chưa bắt buộc đúng payload theo từng op; chưa ràng buộc đầy đủ occurrence/dedupe/arc. Sự kiện runtime alpha dùng template TypeScript, chưa phải DSL strict hoàn chỉnh.
- Snapshot lưu state nhất quán nhưng chưa có màn replay từ toàn bộ command stream hoặc công cụ chuyển save năm thực tế.
- Chưa có dữ liệu kiểm toán đủ 63 tỉnh; giữ nhãn PROVISIONAL MODEL/MODEL ASSUMPTION. Không áp số mẫu thành luật, tỷ lệ y tế, lừa đảo hay dự báo thực tế.
- Chưa có kiểm toán accessibility toàn diện, 10k CI, 100k release, p95/memory profiling. Không promote alpha thành production release khi các gate này chưa đạt.

## Bước triển khai tiếp

Dùng alpha để review gameplay và kiến trúc; hoàn thiện các giai đoạn A–F trong `IMPLEMENTATION_PLAN.md`. Khi được yêu cầu push/deploy, có thể đưa source lên đúng repo, tạo Vercel preview từ build đã kiểm chứng, chạy QA trên URL thật và báo trạng thái từ công cụ hosting. Không có URL production được tuyên bố ở báo cáo này.
