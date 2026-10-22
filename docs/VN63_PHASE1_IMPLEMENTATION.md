# P1 — Core loop / UX, nền tảng 1975

Nguồn thống nhất: master handoff PR #7 (64f6fe1), Issues #1–#5, PR #6; audit tại [gap matrix](VN63_GAP_MATRIX.md). Source gốc vẫn là Next.js/TypeScript. Không import HTML monolith hoặc catalog không có provenance như dữ liệu lịch sử.

## Đã triển khai

- `advanceWeek` / `advanceWeeks`: mỗi nhịp tiêu thụ 7 ngày Gregorian, có targetDate lưu qua popup. Tốc độ chỉ đổi nhịp presentation; seek/batch gọi cùng transition, không đưa choice thay người chơi.
- `advanceMonth` giữ core vòng ngày, ledger/lương/chi phí theo hạn hợp đồng và settlement doanh nghiệp/report cuối tháng. Thêm horizon; pin event candidate của tháng để cash/tuần xen giữa không làm reroll sự kiện. Tháng sinh và thời điểm bắt đầu giữa tháng chỉ tính số phút thực sự có mặt.
- Trẻ dưới 5 được giám hộ thu xếp; cũ đang pending caregiver cũng được giải quyết tự động khi chuyển tuần. Các input chủ động không đúng thẩm quyền bị chặn. Nếu thiếu người chăm sóc trong kịch bản, tạo giám hộ hỗ trợ giả lập có ID cố định, không tuyên bố quan hệ huyết thống.
- Từ đúng sinh nhật 5 có các thói quen phù hợp tuổi/hoàn cảnh; lựa chọn duy trì đến khi đổi. Tối đa 4h/tuần từ thời gian mềm, không lấy giấc ngủ/công việc/nghĩa vụ. Nếu tháng đã mở thì thay đổi hiệu lực từ đầu tháng sau. Người chơi được thông báo rõ, không viết lại lịch quá khứ.
- Default sinh mới là ngày seeded trong năm 1975, không cố định 01/01. Có tên cha/mẹ giả lập ổn định. Đây chưa phải family graph nhiều thế hệ của P4.
- Bốn nhóm quản lý: Sự nghiệp / Tài chính / Quan hệ / Bản thân. Nhật ký là trang chính, kinh doanh ở trong Sự nghiệp, inspector/nguồn/sổ tháng ở Xem thêm. Có nút chuẩn bị kế hoạch đầu tháng tiếp theo; vẫn dừng nếu gặp quyết định giữa đường.
- Ngày hiện tại và ngày sinh hiển thị dd/mm/yyyy; điểm chỉ làm tròn ở UI. UI giữ bối cảnh và lời giải thích ngắn; tiền nội bộ vẫn BigInt/string.
- Save schema 3 mở rộng additive cho currentDate/calendarMode/weeklyCursor/activity/profile và cursor startDay/eventTemplateId; v1.2/v1.3 tiếp tục đọc. Chuyển nhịp không dời DOB, đổi seed, reroll tiềm năng hay quy đổi tiền. IndexedDB giữ bản gốc trước lần chuyển tuần đầu; có nút xuất phục hồi. Không có importer prototype HTML v1.7.
- Contracts `WorldContext`, `HistoryPack`, `GeoTimeline`, `MonetaryEpoch`, `PersonGraph`: provenance enum, source refs, cutoff riêng, checksum-format, ID uniqueness. Cutoff chưa có trả MISSING. Đây là nền interface; chưa có historical pack loader/pinning/verified dataset hoàn chỉnh.

## Giới hạn bắt buộc công khai

1. **Chưa hoàn tất P2**. Không có mapping hành chính 1975/1976/2025, các luật đổi tiền theo cash/deposit/debt hay occupation availability đã được source-review. New historical foundation trả MISSING và khóa nghiệp vụ tiền/nghề cần dữ liệu đó; không lấy 63 tên 2024 hay chi phí hiện đại làm fact 1975. Vùng người dùng chọn được giữ là referenceArea 2024, chưa tự đoán geoLocation lịch sử.
2. Kịch bản QA tuổi 28/75 và các save cũ vẫn là legacy demo. Regression finance/business dùng explicit `legacyDemo`, khác với game sinh 1975. Số liệu/luật của demo không trở thành dữ liệu lịch sử chỉ vì test green.
3. Chưa có household ledger/consent/genealogy/offscreen NPC, lunar calendar/culture, occupational catalog, CEO/competition/fame/legacy, hazard disease calibration, world future generator. Đó là P2–P9 theo dependency, không đánh dấu complete.
4. Orchestration hiện giải quyết caregiver/background journal và must-pause choices. Nhật ký/cursor là hàng đợi các thông báo không buộc chọn. Chưa có workflow hẹn xử lý quyết định không khẩn có due-date riêng ngoài tháng; cần triển khai trước các arcs chuyên sâu P4/P6.
5. Thời điểm cuối đời còn là terminal scenario của demo, không bảng tử vong Việt Nam. HARDSHIP không được thêm hệ số tử vong. Contract checksum hiện kiểm tra định dạng; kiểm tra digest nguồn và pin loader là gate P2 chưa đạt.
6. Khi đang paused giữa một nhịp thực, tiếp tục sẽ chờ lại đầy đủ khoảng thời gian tới tick kế tiếp; thời gian game đã xử lý không bị chạy lại. Không mô phỏng offline khi đóng trình duyệt.

## Dependencies / phase status

| Phase                         | Trạng thái                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| P0                            | Audit, baseline, xung đột/rủi ro/dependency, prototype review và gap matrix có commit riêng      |
| P1 core/UX                    | Code chạy + regression/calendar/agency/browser/migration tests; số liệu QA thật ghi file riêng   |
| P1 nonurgent workflow mở rộng | Contract/background journal có; lịch hẹn quyết định đa kỳ chưa có, không quảng cáo là hoàn chỉnh |
| P2                            | Chưa triển khai dữ liệu; cần source audit hành chính/tiền tệ/nghề và duyệt PR hiện tại           |
| P3–P9                         | Chưa triển khai/ nghiệm thu; không thể suy hoàn thành từ tests v1.3                              |

Không tự merge/deploy production. PR hiện tại là bước nền tảng có thể review, không phải release của toàn bộ master specification.
