# PROMPT DÁN VÀO CODEX — VN63 LIFE SIMULATOR

Bạn là Senior Game Systems Designer, Simulation Engineer, Narrative Designer, Data Engineer và QA Lead. Nhiệm vụ: triển khai website game **Một Đời Ở Việt Nam — 63 tỉnh thành**, dựa trên toàn bộ tài liệu được cung cấp trong thư mục `docs/spec/vn63/`.

**Bắt buộc đọc lần lượt:**
1. `GDD_VN63_V1.md` (quyết định sản phẩm, gameplay, 2 mode, dữ liệu, rủi ro, hậu quả dài hạn, UI và phạm vi)
2. `CODEX_IMPLEMENTATION_BRIEF.md` (kiến trúc, types, RNG, engine tick, input/output, tiến độ, QA)
3. `data/province_63_2024.json`, `data/balancing.example.json`, `data/indicator.template.json`
4. `examples/events.sample.json`, `schemas/events.sample.schema.json`, `qa/QA_ACCEPTANCE.md`.

Nếu đã có repo: xem toàn bộ kiến trúc và test trước, triển khai trên nhánh phù hợp; không xóa file, không tạo project mới không cần thiết. Nếu repo trống: scaffold Next.js + TypeScript strict + Tailwind + Vitest + Playwright.

**Chốt gameplay:**
- 2 chế độ `REALISM` (mô phỏng có hiệu chuẩn khi có nguồn, minh bạch thiếu dữ liệu) và `HARDSHIP` (tăng áp lực; KHÔNG được trình bày là phân bố thống kê).
- 63 tỉnh snapshot 31/12/2024, chú thích hiện hành là 34 tỉnh từ 2025; tỉnh sinh bất biến, có di cư nội địa.
- Cuộc đời dài 0 tới khi chết; tháng là đơn vị tick; không cưỡng ép bi kịch; nhân vật có chi phí/salary/debt/household, network NPC, học vấn, nghề, bệnh tật, thất nghiệp, xung đột, lừa đảo, cơ hội, hồi phục.
- Sự kiện có điều kiện, thông tin giới hạn, hậu quả ngay và lịch hiệu ứng sau vài tháng/năm; không viết hàng nghìn tuyến cố định.
- Lừa đảo không lộ `isFraud` trước lựa chọn, không đưa hướng dẫn thực thi hành vi lừa đảo, không đổ lỗi nạn nhân.
- Seeded PRNG, pure deterministic engine, event sourcing, save/load parity, cash ledger.
- Mọi số demo phải gắn `ASSUMPTION` và badge, không bịa thống kê tỉnh hay luật hiện hành.

**Thực thi theo Milestones M0→M7:** Đầu tiên hãy audit repo, viết kế hoạch, triển khai **M0 và M1** hoàn chỉnh kèm unit tests. Sau khi M1 chạy ổn, tiếp tục lần lượt tới bản chơi trọn đời; không chờ hỏi lại các chi tiết nhỏ đã được đặc tả. Luôn test/lint/build, ghi báo cáo thay đổi, commit SHA, dữ liệu chưa có nguồn, vấn đề còn lại. Chỉ báo đã deploy nếu công cụ trả trạng thái thành công.

**Hard gate nghiệm thu:** Ledger không tự tạo tiền, seed replay được, sự kiện không lặp sai, NPC không tự hồi sinh, deferred effect chỉ áp dụng một lần, các số giả định không mang nhãn thống kê chính thức, bản HARDSHIP không bóp méo nguy cơ sinh học nhạy cảm.
