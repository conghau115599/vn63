# Changelog

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
