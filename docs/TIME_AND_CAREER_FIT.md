# Nhịp thời gian và nghề phù hợp — 20/10/2026

## Thời gian

- Nhịp thường 1 năm xấp xỉ 72 giây: mỗi tháng lịch được xử lý sau 6 giây ở 1×. Có các mức 1×, 2×, 4×, 8×, 12×, 16× và tiến độ năm.
- Bắt đầu cuộc đời mới sẽ chạy; Tiếp tục / Tạm dừng điều khiển nhịp. Tải lại và nhập save dừng để người chơi xem trước khi tiếp tục. Khi dừng giữa nhịp, tháng chưa xử lý sẽ bắt đầu lại nhịp chờ; không mô phỏng tiến độ ngày ngoài cursor.
- Sang tháng và Tới quyết định vẫn sử dụng cùng engine tháng; tua không bỏ qua quyết định và không tự chọn. Thời gian thực là nhịp trình bày, không thay độ dài lịch, lãi suất hoặc khối lượng rèn luyện trong tháng.
- Gộp các tháng liên tiếp không có sự kiện thành khoảng thời gian; không gộp qua tháng thiếu dữ liệu hoặc tháng đang chờ quyết định. Sổ tháng vẫn giữ toàn bộ báo cáo.

## Nghề nghiệp

- Hai lộ trình chủ động hiện có: vận động viên và nghệ sĩ biểu diễn. Mỗi nhân vật mới có tiềm năng riêng theo seed: thông thường 30–80, chọn thế mạnh 85–95. Đây là tham số giả lập, không phải dữ liệu gene, y học hoặc dự báo nghề nghiệp thật.
- Save cũ giữ nguyên tiềm năng và kỹ năng đã có; không sinh lại chỉ số khi tải. Save thiếu careerDevelopment vẫn dùng migration nền tảng trung tính trước đây. Schema 3 nhận cả engine alpha.1 và alpha.2.
- Thể thao: nền tảng = sức khỏe 80% + khả năng hồi phục 20%. Biểu diễn: kiến thức 55% + tinh thần 25% + hồi phục 20%.
- Tiến bộ cần số phút luyện thực trong ngân sách thời gian. Tiềm năng, nền tảng, mệt mỏi, hướng dẫn và điều kiện học tập cùng tác động đến tốc độ. Nguồn lực hạn chế/ổn định/dồi dào nhân tốc độ 0,9/1/1,1.
- Tiến bộ chậm dần khi tiến đến mức 65 + 0,35 × tiềm năng; không làm giảm kỹ năng save cũ nếu đã cao hơn mức này. Năng khiếu thấp vẫn có thể vào nghề nhờ luyện tập; năng khiếu cao không tự cấp hợp đồng.
- Điểm dự tuyển = 60% kỹ năng + 15% tiềm năng + 13% kinh nghiệm + 12% nền tảng − mệt mỏi × 0,05, cộng biến động seeded ±4. Giữ ngưỡng 58 và yêu cầu tuổi, giờ luyện, hồ sơ/CLB, sức khỏe và cơ hội tuyển dụng. Mọi hệ số là giả định gameplay.
- UI so sánh hai hướng, gợi ý theo tiềm năng, giải thích nền tảng và mức sẵn sàng; đổi mục tiêu không xóa tiến bộ cũ. Chưa mở thêm nghề chuyên môn hoặc mô phỏng danh tiếng.

## QA

- 49 unit/property/integration tests qua, gồm tiềm năng theo seed, giữ save cũ, nền tảng tác động cùng số phút luyện và đường vào nghề của nhân vật tiềm năng thấp.
- Playwright thêm kiểm tra đồng hồ 6 giây/tháng, 16× = 375 ms/tháng, tạm dừng và popup dừng thời gian; kiểm tra gộp tháng và sổ tháng vẫn đủ báo cáo.
- CI tiếp tục chạy build, kiểm tra trình duyệt, 1.000 cuộc đời và 60.000 doanh nghiệp. Các mô phỏng kiểm tra tính nhất quán, không hiệu chuẩn dân số.
