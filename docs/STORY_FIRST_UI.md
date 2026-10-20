# Nhật ký và lựa chọn là trung tâm — 20/10/2026

Đã kiểm tra trực tiếp bản tiếng Việt tại https://1in8b.life/vi/: màn hình khai sinh → cuộc đời thử → tua đến quyết định lúc 2 tuổi → popup → tạm gác để xem nền. Tham khảo cấu trúc tương tác, không dùng lại nội dung, dữ liệu hay tài sản của trò chơi đó.

## Hành vi mới

- Tab Cuộc đời mở thẳng nhật ký, mới nhất trước, đủ các diễn biến trong từng tháng thay vì chỉ ba dòng cuối của tháng gần nhất.
- Ghi cả diễn biến của tháng đang dừng từ cursor. Tháng hoàn tất và tháng đang diễn ra có nhãn riêng; không tạo kết quả hay thu chi chưa xảy ra.
- Lựa chọn thực từ engine (`kind=decision`) được đánh dấu “Bạn đã chọn”; bộ lọc riêng để đọc lại. Đọc thêm mỗi 12 tháng; sổ tháng và tổng kết cũ vẫn có đường truy cập.
- Quyết định tự mở bằng native HTML dialog: nền không tương tác, focus vào tiêu đề, bàn phím nằm trong popup, phương án có lời giải thích và lý do vô hiệu hóa.
- Escape hoặc Xem nhật ký chỉ tạm gác popup. Banner mở lại vẫn hiện; thời gian tiếp tục bị khóa. Reload mở lại quyết định chưa giải quyết. Không có lựa chọn tự động thay người chơi.
- Minh họa, lịch sống và bảng tiền của trang chính thu gọn dưới nhật ký. Các tab tài chính, nghề nghiệp, kinh doanh, gia đình giữ nguyên chức năng.
- Tác động, điều kiện, save schema và engine không đổi. Nội dung vẫn là giả định gameplay, không phải dữ liệu hiệu chuẩn.

## Kiểm tra

- TypeScript, production build và 46 unit/property/integration tests chạy thành công local.
- Playwright mở rộng kịch bản dừng quyết định: focus tiêu đề → Escape → focus nút mở lại → reload vẫn chờ → xem nhật ký → mở lại → chọn → lọc lựa chọn → reload vẫn có ghi chép.
- Playwright CLI trên Windows bị giới hạn subprocess; kết quả thực của 10 ca desktop/mobile được kiểm tra ở GitHub Actions sau khi push.
- Kiểm tra trực tiếp trình duyệt: popup người 75 tuổi có bạn đời thật trong save; focus tiêu đề đúng; Escape trả focus về nút mở lại; Sang tháng/Tự động vẫn disabled; reload mở lại popup; chọn tự chăm sóc → tháng 02 → ghi “Bạn đã chọn”; reload vẫn giữ ghi chép.
- Ảnh popup 1440×1000 và 390×844 được lưu; cả hai không tràn ngang. Bản xem trước dùng nhân vật QA giả lập, không phải save người chơi.
