# Bộ đặc tả VN63 Life Simulator — 1.0

**Đây là bộ thiết kế, KHÔNG phải ứng dụng đã chạy.** Dùng để đưa cho Codex triển khai.

- `GDD_VN63_V1.md` — lý do thiết kế, gameplay, chế độ, modules, đạo đức, dữ liệu, QA.
- `CODEX_IMPLEMENTATION_BRIEF.md` — yêu cầu kỹ thuật, kiến trúc, interface, thứ tự triển khai và Definition of Done.
- `data/province_63_2024.json` — danh mục **63** tỉnh thành ở snapshot cuối 2024, **không chứa chỉ số thống kê**.
- `data/indicator.template.json` — biểu mẫu chỉ báo có provenance, các giá trị chưa biết = null.
- `data/balancing.example.json` — hệ số **minh họa** cho 2 chế độ.
- `examples/events.sample.json` — 4 sự kiện JSON minh họa, với những số giả lập **không phải dữ liệu thật**.
- `qa/QA_ACCEPTANCE.md` — matrix nghiệm thu, kiểm thử và guardrail.

## Bắt đầu với Codex

1. Cung cấp toàn bộ ZIP/tệp vào repo làm `docs/spec/vn63/`.
2. Chỉ định Codex đọc `GDD_VN63_V1.md`, tiếp đến `CODEX_IMPLEMENTATION_BRIEF.md`.
3. Ra lệnh triển khai Milestone M0–M1 trước, báo cáo test; sau đó tiếp tục M2–M7.
4. Không để các số demo đi vào mode được gọi là “bám dữ liệu thực” khi chưa hiệu chỉnh.

Các nguồn chính thức và giới hạn dữ liệu được dẫn ở phần 18 của GDD.
