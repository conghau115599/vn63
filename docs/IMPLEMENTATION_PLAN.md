# Kế hoạch triển khai VN63 v1.2

**Hồ sơ lịch sử v1.2.** Kế hoạch hiện hành và phạm vi v1.3 ở [V13_IMPLEMENTATION.md](V13_IMPLEMENTATION.md), QA ở [QA_V13.md](QA_V13.md). Người dùng yêu cầu push repo và sẽ tự tạo project Vercel.

## Kết quả kiểm tra đầu vào

Ngày 20/10/2026, repo GitHub được cung cấp là repo rỗng. Hai ZIP chứa spec/fixture, không chứa mã nguồn hay save cần di trú. Gói v1.2 có toàn bộ file v1.1, chỉ README cũ thay đổi và thêm tài liệu Monthly. Hai MD rời khớp từng byte với file trong ZIP. Dùng v1.2 làm bản đang hoạt động; không thực thi các mệnh lệnh trong tài liệu như quyền push/deploy độc lập với yêu cầu của người dùng.

## Quyết định kỹ thuật đã chốt cho alpha

1. Khi PAUSED, `committedMonth` không tồn tại. Nó chỉ có giá trị khi kỳ thực sự commit. Đây là làm rõ contract v1.2: một tháng đang chờ lựa chọn chưa thể được gọi là đã commit. Cursor ghi ngày đang chờ, tiền đầu kỳ, tổng cashflow, receipt ID và lịch còn lại.
2. Phát sinh và xử lý quyết định ngày 12 trước tác động của ngày đó. Lựa chọn có hiệu lực từ ngày 12 trở đi; những ngày trước không chạy lại. Chỉ một cửa sổ quyết định mỗi tháng trong alpha.
3. Lương tích lũy theo ngày lịch; trả phần tích lũy đến ngày 25, phần còn lại là khoản phải thu chuyển kỳ sau. Điều khoản demo cho quyết toán tiền công đã tích lũy vào ngày kết thúc cuộc đời. Không trả cả tháng sau ngày kết thúc.
4. Chi sinh hoạt chia theo ngày, hiệu chỉnh theo nơi cư trú từ ngày chuyển nhà. Thiếu tiền tạo khoản phải trả riêng, không âm tiền mặt. Nợ tính lãi tháng theo bps đã nêu trong hợp đồng demo, không dùng APR/12 ngầm định.
5. Chính sách tuần mặc định là tốc độ trung bình trên 7 ngày, không ngầm khẳng định ca làm phù hợp luật hiện hành. Phân bổ phút bằng largest remainder, bảo toàn tổng từng tuần và 1.440 phút/ngày; nghĩa vụ cụ thể dịch thời gian mềm, giữ nhu cầu thiết yếu.
6. Đặt lệnh theo giá mở cửa ngày 1, sau đó cập nhật thị trường tháng đúng một lần. Khóa quỹ 1 tháng, vốn kinh doanh 6 tháng, vàng không khóa; tất cả là điều khoản gameplay.
7. HARDSHIP đổi dự phòng khởi đầu tuổi 28 (18 thay 30 triệu), chi phí sinh hoạt mẫu (8,5 thay 7,5 triệu/tháng tại nơi mặc định), xác suất cửa sổ sự kiện (0,095 thay 0,065/tháng). Không đổi cơ chế lịch, tiền, thị trường, RNG và kịch bản tuổi kết thúc.
8. Không di trú tự động save năm. Không có save cũ trong repo để bảo toàn. Cần bộ fixture thực tế mới có thể xây công cụ chuyển đổi đầy đủ, giữ bản gốc và yêu cầu chọn tháng/ngày sinh nếu dữ liệu thiếu.

## Giai đoạn tiếp theo và điều kiện hoàn thành

| Giai đoạn              | Công việc còn cần                                                                                                                                              | Gate                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| A · Nền alpha          | Tách UI thành component nhỏ, ledger audit viewer, tăng kiểm thử lịch ca/nghĩa vụ, property test nhiều cấu hình                                                 | CI xanh trên Linux và Windows thông thường     |
| B · Hợp đồng tài chính | Hợp đồng công theo ca/ngày công, lịch thu/chi riêng, lãi hiệu dụng theo điều khoản, cổ tức/lãi gửi, phí/thuế sandbox, thanh toán và delinquency                | Kiểm thử mọi thứ tự giao dịch và reload        |
| C · Đời sống           | NPC graph 5–15 người, guardian assets/obligations, ngủ theo tuổi, bệnh/chăm sóc/phục hồi, tiến trình học/nghề có giờ hữu ích, 4 arc nhiều giai đoạn            | Chơi trọn đời không có NPC/quan hệ bất khả thi |
| D · Nội dung           | Mở rộng 20 template sơ bộ thành 20–30 sự kiện có biến thể đủ sâu; mất việc, phục hồi, lừa đảo thông tin ẩn và điều tra; predicate/effect DSL phân biệt từng op | Schema strict và QA nội dung                   |
| E · Dữ liệu            | Danh mục nguồn, chỉ báo thật đã kiểm toán, quality tier và uncertainty theo thời kỳ, life tables hợp lệ                                                        | Không có số giả định mang nhãn OFFICIAL        |
| F · Release            | 10k paired lives trong CI, 100k lifetime milestone, kiểm tra phân nhóm, p95, memory/mobile, hồi quy browser, accessibility                                     | Chỉ xác nhận release khi báo cáo thật đạt      |
| G · Hosting            | Push repo khi được yêu cầu; gắn project Vercel, deploy preview, QA preview, promote khi phù hợp                                                                | URL và trạng thái deploy xác minh từ công cụ   |

Không coi alpha này là đã hoàn thành các gate release. Mốc 100k không được thay bằng 100k tick hoặc 100k lượt khởi tạo nhân vật.
