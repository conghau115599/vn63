# Giao diện dashboard VN63 — 20/10/2026

Thiết kế lại theo hướng bố cục từ ảnh 1in8b người dùng cung cấp, với nhận diện và minh họa SVG riêng cho VN63.

## Những gì thay đổi

- Desktop ba cột: hồ sơ/chỉ số/tiền mặt; tháng hiện tại/câu chuyện/lựa chọn/chức năng; người thân/mục tiêu/bản đồ tuổi. Bản đồ chỉ dùng các năm có ghi chép thực từ save, không dự báo tuổi thọ.
- Thanh điều hướng ngang có tên đầy đủ. Điều khiển thời gian ở đầu trang và ghim khi cuộn, không che nội dung bằng một bảng điều khiển dưới đáy.
- Bảng màu xanh xám nhạt, điểm nhấn đỏ rượu, chữ Be Vietnam Pro thống nhất; thẻ ít khoảng trống thừa, ranh giới và trạng thái rõ.
- Cảnh đô thị/nông thôn và avatar tự vẽ bằng SVG, không tải hình ảnh từ bên ngoài. Trẻ nhỏ dùng xe đẩy trong cảnh, hồ sơ có nhãn chặng đời phù hợp tuổi.
- Nghề nghiệp hiển thị 4 bước và thanh tiến độ từ kỹ năng/giờ luyện thực; không đổi ngưỡng hay kết quả tuyển chọn.
- Tất cả màn hình setup, tài chính, doanh nghiệp, nghề nghiệp, gia đình, nhật ký và kiểm tra mô hình dùng cùng theme.
- Tablet hai cột với thông tin bổ trợ phía dưới; điện thoại một cột, hồ sơ mở/thu gọn, vẫn nhìn được tên tab. Input mobile 16px; có skip link, focus ring, nhãn trạng thái và progress cho trình đọc màn hình.

Các thay đổi ở lớp UI. Engine, save schema, số dư, mô phỏng thời gian và công thức kinh doanh/nghề nghiệp được giữ nguyên.

## Kiểm chứng local

- TypeScript và production static build thành công; 46 unit/property/integration tests qua.
- Kiểm tra trực tiếp 8 tab ở desktop và mobile 360px. Các kích thước 1440/1024/768/390/360 có document width không vượt viewport, không có alert lỗi ứng dụng.
- Tạo nhân vật từ form ở origin trình duyệt mới, chọn nông thôn → sang tháng → reload vẫn đúng tên/tháng/save.
- Save v1.3 cũ đọc được; profile/metrics/business/relationships phản ánh dữ liệu đó.
- Trực tiếp nghiên cứu cửa hàng, đổi giá và kỳ thu tiền, khai trương; số liệu ngân hàng/profit/cash flow và form vận hành hiển thị được.
- Nhập kịch bản người 75 tuổi có bạn đời cần chăm sóc; quyết định dừng, tồn tại sau reload, nhận tự chăm sóc rồi hoàn tất tháng. Không thấy console warning/error trong lượt kiểm tra.
- Giữ 10 Playwright cases desktop/mobile. Một selector nút sang tháng được đổi sang nhận diện theo nhãn hành động thay vì ký tự mũi tên trang trí (ẩn trên màn hình nhỏ).

Workflow `Monthly engine QA` tiếp tục chạy dependencies → fixtures → typecheck → unit → build → Playwright → lifetime/cohort trên mỗi push. Trạng thái thực xem tại [GitHub Actions](https://github.com/conghau115599/vn63/actions).
