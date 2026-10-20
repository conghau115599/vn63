# Triển khai v1.3 — nhánh ngữ cảnh và kinh doanh có nguyên nhân

Spec đang áp dụng: **v1.3 > v1.2 > v1.1 > v1.0**. Bản nhận từ người dùng được giữ tại `docs/spec/vn63-v13/`; các gói cũ là tài liệu lịch sử. Tài liệu đầu vào là yêu cầu thiết kế tham chiếu, không tự cấp quyền thao tác bên ngoài. Quyền commit/push trong lượt này đến từ yêu cầu trực tiếp của người dùng. Người dùng tự tạo project Vercel.

## Phạm vi đã triển khai

- `events/types.ts` định nghĩa LifeContext, EventSpec, EventChoice, EventArc, EligibilityReason, EventHistory. `events/eligibility.ts` kiểm tra ngày, tuổi, vùng, trạng thái hợp đồng, actor còn sống/đã sinh, cờ, nguồn lực, sự kiện trước, arc, cooldown, số lần tối đa và điều kiện từng lựa chọn. Inspector giải thích cả các điều kiện bị chặn.
- Scheduler seeded theo namespace, xét salience/continuity/critical context, cho phép tháng không có chuyện lớn. Không có menu tính cách cố định ở tuổi 3/5. Trẻ nhỏ có quyền quyết định thuộc người giám hộ, trẻ lớn có agency trong phạm vi học tập. Các quyết định quan trọng vẫn luôn pause; không tự đoán một lựa chọn vì người dùng chưa khai báo standing decision policy.
- Sáu trait 0–100 thay đổi theo thời gian thực dành cho học, công việc, xã hội, nghỉ, mệt và lời hứa. Có saturation, baseline pull, phiên bản hệ số, cap ±0,9 mỗi tháng, phân biệt mood/satisfaction. Không là nhãn đạo đức hay chẩn đoán.
- Doanh nghiệp là entity riêng với các trạng thái IDEA → VALIDATING → ACTIVE, PAUSED/RESTRUCTURING/CLOSED. Có ngân hàng, tồn kho theo giá vốn, phải thu, phải trả, vốn chủ, nợ, lợi nhuận giữ lại, hợp đồng nhân sự và sổ Nợ/Có. Tổng tài sản = nợ + vốn + lợi nhuận giữ lại − rút vốn được kiểm tra mỗi tháng.
- Pre-launch kiểm chứng cần 200.000 VND và 4 giờ/tuần; khai trương cần một kỳ kiểm chứng và 500.000 VND thiết lập. Đây là hợp đồng sandbox, không phải yêu cầu pháp lý Việt Nam đã xác minh.
- Funnel: thị trường region/sector/world seed → leads → conversion theo giá, marketing thực trả, kỹ năng, chất lượng, goodwill → số đơn → giao hàng giới hạn bởi giờ chủ, nhân sự và kho → trả hàng → doanh thu và hóa đơn. Không có global success/failure roll.
- Mua tồn kho ghi tài sản và phải trả; khi giao mới ghi COGS, tránh trừ chi phí hai lần. Khách trả chậm tạo receivable; chỉ thu tiền mới vào cash. Vay là debt, góp vốn là equity; không thành lợi nhuận. Thu nhập cá nhân từ doanh nghiệp chỉ qua bút toán rút vốn thực được kiểm tra tiền/hóa đơn đến hạn.
- Có các hành động tìm khách, học vận hành, đàm phán, tuyển/kết thúc nhân sự, vay/trả gốc, góp/rút vốn, pivot, pause/resume và close. Đóng cửa dừng đơn và phát sinh lương hoạt động mặc định; công nợ đã ghi nhận vẫn còn. Không tự đóng cửa chỉ vì một kết quả RNG.
- Giờ kinh doanh là một category trong cùng 168 giờ/tuần; dịch thời gian mềm, không tạo thêm giờ và không tính lại thành lương làm thuê. Sự kiện chăm sóc dùng nghĩa vụ ngày cụ thể và có thể giảm năng lực vận hành. Chăm sóc không điều khiển kết quả bệnh bằng phương án kiếm nhiều tiền hơn.
- Loại bỏ luật tự cấp việc tháng 1 và tự nghỉ hưu ở 65 của alpha v1.2. Việc làm/tiếp tục làm/giảm giờ/nghỉ tùy hợp đồng, cơ hội và lựa chọn. Không tự có pension hoặc con/cháu/người bạn đời. Kịch bản tuổi 75 cung cấp hai hoàn cảnh đối chứng thực sự khác nhau.
- Save schema 3 có context, trait metadata, event memory, arc progress và business state/receipts. Di trú v1.2 có lịch/DOB đầy đủ sang v1.3 giữ ledger, snapshot, pending cursor và ký ức. Các trường chưa có được gắn ghi chú default demo; không đoán thêm hôn nhân, con, lương hưu. Save năm cũ hơn vẫn cần chuyển đổi rõ ràng.
- UI có tab Kinh doanh và Kiểm tra mô hình, funnel, sổ riêng, chart thời gian, sáu trait, inspector eligibility, audit tiền và counterfactual giả lập từ cùng seed. Counterfactual không commit vào save thật và không được mô tả là dự báo.

## Lộ trình vận động viên và nghệ sĩ

Góp ý người chơi được triển khai trong cùng ứng dụng tại `src/simulation/careers.ts`, metadata `talent-careers-v1 / ASSUMPTION`. Người chơi chọn nền tảng ban đầu hoặc dùng save cũ với default trung tính, chọn số giờ luyện duy trì và chủ động đăng ký tuyển. Không suy diễn năng khiếu âm nhạc từ kiến thức chung, sức khỏe không thay cho kỹ năng thể thao. Năng khiếu tăng tốc học, sức khỏe và mệt mỏi tác động khả năng luyện; giờ thực tế từ cùng ngân sách thời gian, có thể bị nghĩa vụ chăm sóc dịch bớt.

CLB cần đủ 6 tuổi, kỹ năng 30 và 80 giờ thực hành. Hợp đồng mẫu cần đủ 18 tuổi, kỹ năng 50, 300 giờ, có cơ hội tuyển; thể thao cần CLB và sức khỏe 60; nghệ sĩ cần hồ sơ 20 điểm. Điểm tuyển = kỹ năng×0,72 + năng khiếu×0,15 + min(100, giờ/6)×0,13 − mệt mỏi×0,05 + biến động seeded ±4; ngưỡng 58, thử lại sau tối thiểu 3 tháng. Không mất vĩnh viễn quyền theo nghề khi trượt.

Đạt tuyển sẽ dừng ở ngày 12 để duyệt hợp đồng 6 tháng/35 giờ tuần, lương mẫu 8 triệu thể thao hoặc 7 triệu biểu diễn, thay việc hiện tại nếu nhận. Thu nhập theo lịch ngày thực, không cộng tiền vì vừa đạt vòng tuyển. Khi hết hợp đồng, người chơi có thể dự tuyển lại. Chưa có mô phỏng danh tiếng, giải đấu, album hay giải thưởng; đây là bước vào nghề. Toàn bộ điều kiện, thời gian tiến bộ và lương là thiết kế cần playtest, chưa phải thống kê nghề nghiệp hay luật hợp đồng thật.

## Phân biệt hai chế độ (tham số)

`src/simulation/config.ts` version `v1.3-assumptions-1` chứa các tham số chính. REALISM: event exposure 0,065, chi phí business ×1,00, cửa sổ demand downturn 0,12, demand floor 0,65. HARDSHIP: 0,095, ×1,10, 0,22, 0,55. Thị trường và kế toán dùng cùng cơ chế; không có hệ số “startup thất bại”. Khác biệt tiền dự phòng và chi sinh hoạt mẫu v1.2 được giữ. Không đổi kịch bản tử vong để tăng khó.

Giá, lương, kỹ năng, conversion, biến động và các điều khoản đều **ASSUMPTION** trong phiên bản engine/domain. Chưa phải dữ liệu failure/survival doanh nghiệp Việt Nam, luật lao động, thuế hoặc yêu cầu giấy phép đã kiểm chứng.

## Giới hạn còn mở

- Đây là alpha chưa hiệu chuẩn. Ending tuổi 76–95 và NPC 96 vẫn là terminal scenario demo của nền v1.2, chưa phải mortality/competing-risk model.
- Chưa có bộ dữ liệu kinh tế theo tỉnh/ngành/thời kỳ đã kiểm toán, thuế/bảo hiểm/giấy phép thật, credit scoring thực tế hoặc thủ tục phá sản pháp lý. Các điều kiện nguồn lực và hợp đồng được mô hình hóa minh bạch.
- Hai ngành dùng mô hình tồn kho/vật tư tổng quát, không phải ERP hoặc mô hình chi tiết riêng từng ngành. Returns được trừ trước hóa đơn doanh thu thuần; chưa có luồng đổi trả nhiều kỳ phức tạp.
- CareNeed là state được fixture/sự kiện cung cấp; chưa có mô hình sinh bệnh có kiểm chuẩn. Phương án thuê hỗ trợ trong sự kiện là chi phí cho kỳ hiện tại; chưa có một hệ thống dịch vụ chăm sóc gia hạn tự động đầy đủ. Chưa mô phỏng chuyển nhượng/di sản doanh nghiệp khi chủ qua đời.
- Event catalog gồm 20 template cũ chuyển sang contract mới và 7 template ngữ cảnh bổ sung. Các arc kiểm chứng/học/chăm sóc/khó khăn kinh doanh đang ở mức nguyên mẫu; cần tiếp tục viết nội dung sâu hơn và cân bằng. Chưa có toàn bộ gia đình/hôn nhân/scam simulation của GDD nền.
- Context tags và flags có thể mô tả điều kiện tiếp cận/pháp lý; không được trình bày chúng như xác minh luật ngoài đời. NPC graph và sự tự chủ của NPC vẫn còn đơn giản.
- 100k full lives là một QA gate riêng. Đã chuẩn bị workflow 40 shard ×2.500 seed-range không trùng và aggregator kiểm tra đủ 100k; chỉ được báo đạt khi workflow thực chạy thành công.

Xem `QA_V13.md` để biết đúng số kiểm thử đã chạy, các đối chứng và hạn chế quan sát từ cohort.
