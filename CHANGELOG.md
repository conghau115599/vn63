# Changelog

## P0/P1 · 22/10/2026 · nhánh review

- Audit canon master PR #7/Issues #1–#5/PR #6 và prototype v1.7; gap matrix, risks và dependencies.
- Tick tuần 7 ngày dùng lại vòng ngày và quyết toán tháng; lưu target còn lại khi pause, định dạng ngày Việt, 4 nhóm quản lý.
- Ngày sinh seeded năm 1975 cho game mới; 0–4 giám hộ thu xếp, 5+ chọn thói quen theo tuổi/hoàn cảnh; giữ sổ cũ và backup trước chuyển tuần.
- Nền lịch sử chặn nghiệp vụ cần dữ liệu niên đại chưa có, không áp tiền/giá/địa danh hiện đại như fact 1975. P2–P9 chưa hoàn thành.
- Giữ regression v1.3 với fixtures legacyDemo riêng; tests calendar/agency/migration/browser và weekly lifetime smoke. Xem docs/VN63_PHASE1_QA.md cho bằng chứng thực.

## Nhịp cuộc đời & nền tảng nghề nghiệp · 20/10/2026

- Nhịp mặc định 72 giây/năm; Tiếp tục/Tạm dừng, 1×–16×, tiến độ năm và dừng ở lựa chọn. Gộp các tháng yên bình liên tiếp trong nhật ký.
- Tiềm năng bẩm sinh theo seed cho nhân vật mới; nền tảng và điều kiện học tập tác động rèn luyện và tuyển chọn thể thao/biểu diễn. Bảng nghề giải thích độ phù hợp và điểm sẵn sàng.
- Giữ chỉ số save cũ, schema 3 tương thích alpha.1/alpha.2. Chi tiết và hệ số giả lập: docs/TIME_AND_CAREER_FIT.md.

## Nhật ký & lựa chọn · 20/10/2026

- Trang Cuộc đời ưu tiên nhật ký mới nhất, diễn biến tháng đang dừng và dấu vết lựa chọn thực; lọc lựa chọn, đọc thêm lịch sử.
- Popup quyết định có nền mờ, phương án lớn, focus bàn phím, tạm gác/xem nhật ký và mở lại; reload vẫn chờ người chơi chọn.
- Thu gọn cảnh, tiền và lịch sống dưới nhật ký; giữ engine và định dạng save. Chi tiết kiểm chứng trong docs/STORY_FIRST_UI.md.

## Dashboard refresh · 20/10/2026

- Thay toàn bộ theme bằng dashboard ba cột theo ảnh tham khảo: hồ sơ/chỉ số bên trái, câu chuyện và quyết định giữa, người thân/mục tiêu/bản đồ tuổi bên phải.
- Tab ngang có nhãn, thanh thời gian sticky ở trên, tương phản và font nhất quán, khung cảnh SVG pixel riêng theo đô thị/nông thôn.
- Thiết kế lại setup, tài chính, kinh doanh, nghề nghiệp, gia đình, nhật ký và inspector. Lộ trình nghề có các bước và progress thực từ save.
- Mobile một cột, hồ sơ mở/thu gọn, không có playback phủ nội dung ở đáy; chuyển tab trở về đầu trang. Không thay engine, save schema hoặc công thức mô phỏng.

## 0.2.0 · v1.3 Dynamic Branches + Causal Startups · 20/10/2026

- Event contracts và eligibility/debug reasons theo context, actor, hợp đồng, resources, prior events/arc, cooldown và memory.
- Sáu trait thay đổi dần có cap; không có permanent age-3/5 menu. Bỏ cấp việc tháng 1 và tự nghỉ hưu ở 65; thêm hai preset tuổi 75 đối chứng.
- Causal business entity có validation, funnel/capacity, inventory/COGS, AR/AP, capital/draw, debt, staffing và sổ Nợ/Có riêng; idempotent monthly receipts.
- Founder hours dùng cùng time budget; care choices tạo nghĩa vụ và arc memory. Không sinh người thân từ tuổi.
- Save schema 3, migration v1.2; tab Kinh doanh, trait/eligibility inspector, audit và counterfactual.
- Thêm lộ trình chủ động thể thao/biểu diễn, nền tảng năng khiếu, giờ luyện có chi phí thời gian, CLB/hồ sơ, tuyển chọn có giải thích và duyệt hợp đồng riêng; không buộc chờ event hiếm. Vào nghề chưa đồng nghĩa nổi tiếng.
- Node 24, Vercel config, CI và manual 100k-life sharding. Không tạo project Vercel.
- Kết quả thật và giới hạn ở docs/QA_V13.md; hệ số vẫn là ASSUMPTION, chưa phải thống kê Việt Nam.

## 0.1.0 · Monthly alpha · 20/10/2026

- Khởi tạo từ repo GitHub trống, không có logic tick năm hay save cũ để refactor.
- Spec v1.2 là bản hoạt động. Lịch Gregorian, tuổi theo DOB, 1 tick = 1 tháng, từng ngày có thứ tự, tháng yên bình, tự dừng trước quyết định.
- Thêm thời gian nguyên phút, VND BigInt, ledger và khoản phải trả, nợ, giá thị trường chung theo world seed, mua/bán có điều kiện thanh khoản.
- Thêm mood/satisfaction, fatigue, NPC promises/memories và quà không tăng trust; 20 template sự kiện ban đầu, hậu quả hoãn và tổng kết năm từ tháng hoàn tất.
- Thêm UI Việt responsive, 1×/4×/12×, tới quyết định, save transaction IndexedDB, xuất/nhập JSON và chặn save schema cũ.
- Khác biệt REALISM/HARDSHIP được nêu trong implementation plan. Cả hai chưa hiệu chuẩn. Không tăng nguy cơ sinh học để tăng khó.
- Chuẩn bị Vitest/property tests, Playwright desktop/mobile, CLI lifetime batch và CI. Báo cáo số thực chạy ở `docs/QA_REPORT.md`.
- Chưa hoàn thành: dữ liệu nguồn/hiệu chuẩn, bệnh và chăm sóc đầy đủ, household/NPC graph, cổ tức/lãi gửi, DSL strict, các arc đủ sâu, 100k lifetime acceptance, production hosting.
