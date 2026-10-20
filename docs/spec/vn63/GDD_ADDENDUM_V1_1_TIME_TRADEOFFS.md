# GDD ADDENDUM v1.1 — LIFE TRADE-OFF / THỜI GIAN, HẠNH PHÚC VÀ THAM VỌNG

**Dự án:** Một Đời Ở Việt Nam — VN63 Life Simulator  
**Trạng thái:** Thiết kế bổ sung cho GDD v1.0, ngày 20/10/2026.  
**Quy tắc ưu tiên:** Nếu trái với các đoạn về happiness, yearly focus, economy, relations và investments trong GDD v1.0, tài liệu v1.1 này được ưu tiên. Không thay đổi cam kết hai chế độ REALISM/HARDSHIP, tính nhất quán, dữ liệu có nguồn, và không có thang điểm thành công duy nhất.

> Chủ đề cốt lõi: Cuộc sống tiêu tốn thời gian, sức khỏe, sự chú ý và tiền bạc; hiệu ứng của các lựa chọn là bất đối xứng, phụ thuộc hoàn cảnh, có độ trễ và không tự động bù trừ nhau.

## A. Nghiên cứu đối chiếu 1in8b.net/vi (20/10/2026)

### A1 — Phần xác minh qua website và tương tác trực tiếp

- 1in8b phiên bản tham chiếu v0.7.26 beta có **bốn chỉ số 0–100**: Sức khỏe, Hạnh phúc, Kiến thức, Quan hệ. Chỉ số cao tăng cơ hội, không bảo đảm kết quả.
- Trọng tâm theo năm: khi nhân vật đủ tuổi, quan sát các lựa chọn **Học tập** (Kiến thức↑, Hạnh phúc↓), **Bạn bè·vui chơi** (Quan hệ↑, Hạnh phúc↑), **Giúp việc nhà** (Gia đình↑, Kiến thức↓ một chút), **Thể thao** (Sức khỏe↑), **Sở thích** (Hạnh phúc↑, Kỹ năng sở thích↑).
- Các sự kiện có thể cho thấy hướng tác động kỳ vọng và ảnh hưởng cuộc đời theo tuổi. Trang trò chơi có điều khiển 1×–16×, tới quyết định tiếp theo, tự động quyết định, nhật ký, bản đồ cuộc đời.
- Mục **Chi tiêu · đầu tư**: đã quan sát các mua sắm minh họa như điện thoại thông minh (Hạnh phúc +5), xe đạp (Hạnh phúc +3; sức khỏe có thể tăng nếu thường xuyên đạp xe), đi ăn/tặng quà với gia đình bạn bè (Quan hệ +4; Hạnh phúc +2); chế độ đầu tư nhàn rỗi hiển thị tiền gửi ngân hàng và ghi lợi nhuận thực sau lạm phát. Ở lượt xem nhân vật ít tuổi/ít tiền, **không** xác minh được mọi kênh đầu tư; không tự nhận các kênh chưa thấy là tính năng chính thức.
- Dữ liệu chính và hướng dẫn: https://1in8b.net/vi/ và https://1in8b.net/how-to-play/ . Chỉ mô tả cơ chế công khai; không sao chép mã nguồn, nội dung sự kiện hoặc UI.

### A2 — Điều cải tiến khác biệt

1. **Không cộng/trừ từng thanh độc lập**: mọi hành động có chi phí thời gian, tiền, sức lực, ràng buộc và tác động đến các tác nhân khác; thanh hiển thị là phép tổng hợp trạng thái gốc.
2. **Không tăng quan hệ vĩnh viễn chỉ bằng tiền**: tặng quà tạo vui ngắn hạn và dấu ấn tích cực, nhưng thiếu sự hiện diện lâu dài không thể được mua bù vô hạn.
3. **Đầu tư không phải máy in tiền**: dòng tiền, thanh khoản, rủi ro, mất vốn, vốn vay, trách nhiệm, thời gian quản trị đều được quản lý trong một sổ cái.
4. **Không ép mọi quyết định cân bằng tương đương**: một phương án có thể tồi hơn mọi mặt do xuất thân, khủng hoảng hay thiếu thông tin. Một cơ hội tốt vẫn có thể đến từ may mắn.
5. **Nhân vật không phải điểm số**: hạnh phúc không là mục tiêu bắt buộc; không đánh giá thấp cuộc đời bình thường hoặc cuộc đời có khuyết tật/bệnh tật.

## B. Hệ thống tài nguyên hữu hạn

### B1 — Ledger thời gian: đơn vị giờ/tuần

- Tổng `TIME_WEEK = 168` giờ; chia tối thiểu thành `sleep`, `paid_work`, `commute`, `essential_household`, `caregiving`, `education`, `social_family`, `social_friends`, `exercise`, `hobby`, `rest`, `other`.
- `sum(hours) <=168`, không có thời gian âm. Khoảng trống không mặc định là gia đình hoặc nghỉ ngơi; phải chỉ rõ `unallocated/recovery`.
- Các nghĩa vụ phát sinh theo hoàn cảnh: học sinh bắt buộc học, chăm con nhỏ, cha mẹ bệnh nặng, thời gian đi lại, công việc theo ca. Thu nhập cao có thể mua dịch vụ chăm sóc/giúp việc; chi tiền tiết kiệm thời gian nhưng không mặc định thay thế gắn bó tình cảm.
- **Thời gian khả dụng** khác **năng lượng khả dụng**. Một người còn 10 giờ sau ca làm kéo dài không mặc định có thể học hiệu quả trong cả 10 giờ.
- Động lực game: mỗi quý hoặc năm người chơi chọn `lifestyle_policy`, engine tự xếp lịch theo tuần; chỉ mở tình huống nhập thủ công khi có quyết định quan trọng. Tránh bắt người chơi phân phối 168 giờ liên tục.

### B2 — Ví dụ số học, CHỈ LÀ FIXTURE GAMEPLAY

Một nhân vật 28 tuổi làm văn phòng, không phải người chăm sóc chính:

| Nhóm | Làm bình thường | Làm thêm 15 giờ/tuần |
|---|---:|---:|
| Ngủ | 56 | 56 |
| Việc làm nhận lương | 40 | 55 |
| Đi lại | 7 | 7 |
| Ăn uống, việc nhà và sinh hoạt bắt buộc | 30 | 30 |
| Gia đình | 12 | 5 |
| Bạn bè | 5 | 5 |
| Vận động | 5 | 2 |
| Học thêm | 5 | 4 |
| Giải trí/phục hồi | 8 | 4 |
| **Tổng** | **168** | **168** |

Tình huống làm thêm còn nhiều tiền hơn **nếu thực sự được trả thêm**, nhưng giảm thời gian bên gia đình, vận động, hồi phục; tăng mệt mỏi dần và có thể làm giảm chất lượng giờ bên nhau. Không áp dụng một tỷ giá `1 giờ làm = -1 điểm sức khỏe`.

### B3 — Những tài nguyên khác

- `energy` (0–100): khả năng thực hiện hoạt động hiện tại; thay đổi nhanh.
- `fatigue` (0–100): mệt tích lũy; phục hồi chậm và có thể thành quá tải.
- `stress` (0–100): căng thẳng khi mất an toàn, xung đột, áp lực công việc.
- `attention` (0–100): nguồn lực chú ý hữu hạn; ảnh hưởng chất lượng học, quản lý tiền, phát hiện rủi ro.
- `financial_buffer_months`: số tháng có thể duy trì nhu cầu thiết yếu với tiền thanh khoản.
- `social_support`: hỗ trợ xã hội khả dụng, được tính theo NPC và điều kiện giúp đỡ; không phải điểm cộng miễn phí.
- Một khoản nợ thời gian với gia đình/công việc (missed commitment) có thể sinh hậu quả hoãn, ví dụ lời hứa không thực hiện lặp đi lặp lại.

## C. Hạnh phúc v2 — Nhiều tầng, tốc độ biến đổi khác nhau

### C1 — Bốn thanh HIỂN THỊ và trạng thái NGẦM

Có thể giữ 4 thanh quen thuộc **Sức khỏe, Hạnh phúc, Kiến thức, Quan hệ**, nhưng bên trong là một số state khác:

| Thanh người chơi thấy | Thành phần ẩn/chi tiết | Ghi chú |
|---|---|---|
| Sức khỏe | chronic_health, physical_function, sleep_debt, exercise, illness | Không suy ra chỉ từ số giờ thể thao; không định kiến tình trạng bệnh |
| Hạnh phúc | momentary_mood, life_satisfaction, financial_security, belonging, autonomy, purpose, stress | Không phải công thức cộng tiền trực tiếp; có thích nghi thói quen |
| Kiến thức | education, occupation_skill, financial_literacy, practical_experience | Lợi ích cận biên giảm dần; chứng chỉ không đồng nghĩa năng lực |
| Quan hệ | attachment theo từng NPC, trust, availability, conflict, shared_memories | Người yêu/vợ chồng/cha mẹ/con khác nhau và có hành vi độc lập |

**Không cần công bố toàn bộ số trạng thái ẩn trong UI.** Cho người chơi xem nguồn ảnh hưởng: `Áp lực tài chính đang tăng`, `Đã 6 tuần chưa gặp bố mẹ`, `Bạn ngủ thiếu nhiều ngày`.

### C2 — Công thức nguyên mẫu (KHÔNG PHẢI THỐNG KÊ)

```text
mood[t+1] = clamp(0,100, 0.55*mood[t] + 0.45*baseline_mood + event_mood_shock)

life_satisfaction[t+1] = clamp(0,100,
  0.92*life_satisfaction[t] + 0.08*context_score(t))

context_score = weighted_by_preferences(
  financial_security, relationships, health_function,
  autonomy, purpose, leisure) - debt_distress - chronic_stress_penalty

happiness_bar = clamp(0,100, 0.3*mood + 0.7*life_satisfaction)
```

Tất cả hệ số trong ví dụ là **fixture** để thử engine, không phải ước lượng xã hội Việt Nam; chúng phải được hiệu chỉnh qua playtest và kiểm thử. Cảm xúc tăng nhanh nhờ món quà/sự kiện tốt nhưng quay lại baseline, trong khi hài lòng lâu dài thay đổi chậm.

### C3 — Bốn quy tắc chống exploit

1. `gift` không thể tăng mãi: giảm hiệu suất theo số quà trong 12 tháng; quan hệ cần thực sự hiện diện, ứng xử tử tế và giữ cam kết.
2. `hobby` tăng niềm vui nhanh nhưng có ngưỡng quen (hedonic adaptation): chạy một hành động lặp lại không thể đạt 100 hạnh phúc.
3. `exercise` giúp duy trì sức khỏe nhưng quá tải và thiếu ngủ vẫn bất lợi; không có hành động đơn lẻ xóa bệnh nền.
4. `work` đem thu nhập và thành tựu, đôi khi tăng hạnh phúc, nhưng gánh thời gian và kiệt sức được tính trên lịch thực.

## D. Bất đối xứng: thay đổi không triệt tiêu nhau

### D1 — Nguyên tắc

- Mỗi quyết định có **resource costs**, **direct effects**, **state-dependent transition**, **opportunity costs**, **delayed consequences**, **uncertain outcomes**.
- **Không** xây dựng các cặp A:+10 tiền,-10 hạnh phúc và B:-10 tiền,+10 hạnh phúc; các hệ đơn vị không tương đương.
- Có chi phí không đảo ngược được: cơ hội thi có giới hạn, năm tháng cha mẹ già, thời gian con ở tuổi nhỏ, tổn thương nghề nghiệp.
- Có điểm bẻ gãy: dưới ngưỡng sống tối thiểu, thiếu tiền làm giảm tự do và có thể buộc phải chọn công việc bất lợi; vượt mức đủ sống, lợi ích hạnh phúc của khoản tăng thu nhập giảm dần. Đây là giả thuyết gameplay, không áp đặt một ngưỡng quốc gia duy nhất.
- Năng lực và xuất thân tạo **bất bình đẳng về biên lựa chọn**: gia đình có nhà sẵn, hỗ trợ học phí, quan hệ xã hội có thể duy trì nhiều mục tiêu cùng lúc; người nghèo có thể bị ép làm nhiều vẫn không thoát nghèo.

### D2 — Lựa chọn phong cách sống

| Lifestyle | Được ưu tiên | Đánh đổi có thể xảy ra | Thành công có thể có |
|---|---|---|---|
| `CAREER_SPRINT` | Công việc 50–60h/tuần khi điều kiện cho phép | Hồi phục, quan hệ, sở thích; nguy cơ kiệt sức | Tăng tiền và cơ hội thăng tiến, **không được bảo đảm** |
| `FAMILY_FIRST` | Hiện diện, chăm sóc người thân | Ít nhận ca làm/thăng chức đòi đi xa | Gắn bó, ý nghĩa, nhưng tài chính phụ thuộc thu nhập/hỗ trợ |
| `BALANCED` | 35–45h công việc, nghỉ ngơi, vận động, quan hệ đều đặn | Tốc độ tích lũy của cải/chuyên môn có thể chậm | Đời sống ổn định, đôi khi vẫn khá giả nhờ nghề tốt, vốn hay may mắn |
| `STUDY_UPSKILL` | Học và phát triển nghề | Giảm tiền hiện tại, thời gian giải trí | Thu nhập có thể tăng sau thời gian dài, có rủi ro ngành giảm nhu cầu |
| `HIGH_RISK_INVESTOR` | Nghiên cứu, vay vốn/giao dịch nếu đủ điều kiện | Thời gian, chi phí, thua lỗ, áp lực | Có thể giàu nhanh hoặc chịu thiệt hại dài hạn |
| `MINIMUM_SURVIVAL` | Bảo đảm nhu cầu cơ bản và nghĩa vụ | Ít quyền chọn khác | Duy trì an toàn, mục tiêu hợp lý trong hoàn cảnh khó khăn |

Không mặc định chế độ `BALANCED` luôn nghèo hoặc nhàm chán: nó thường cho lối đi **ổn định với mức tăng trưởng vừa phải**, nhưng kết quả vẫn phụ thuộc nhiều yếu tố. Sống bình thường không phải failure state.

### D3 — Hệ quả theo chu kỳ

- Trong một tháng: overtime có thể tạo thu nhập nếu trả lương phù hợp; giảm thời gian xã hội, tăng mệt.
- Sau 6 tháng: quan hệ yếu đi nếu nhiều cam kết bị bỏ lỡ; hiệu suất làm việc giảm nếu mệt mỏi kéo dài.
- Sau 3 năm: khả năng thăng chức hoặc thu nhập cao hơn nếu có kỹ năng, hiệu suất, cơ hội; đồng thời tích lũy sức khỏe và mạng lưới xã hội khác nhau.
- Sau 15 năm: tài sản ròng, số năm khỏe mạnh, mức thân thiết với con, hôn nhân, kỹ năng, những ký ức và cơ hội bỏ lỡ tạo ra các cuộc đời rất khác nhau.

Không bảo đảm timeline này; chỉ minh họa cơ chế độ trễ.

## E. Sức khỏe, kiệt sức và công việc

- `fatigue` tăng bởi work_intensity, thời gian đi lại, thiếu ngủ, chăm sóc bắt buộc và các sự kiện căng thẳng, giảm nhờ đủ ngủ/nghỉ/phục hồi; công thức có hysteresis để mệt kéo dài không biến mất trong một ngày.
- `productivity_effective = skill × focus × recovery_modifier × job_fit`. Tăng giờ làm không tăng thành quả tuyến tính vô hạn.
- `career_advancement` phụ thuộc năng lực, quan hệ nghề nghiệp, nhu cầu tuyển dụng, số năm kinh nghiệm, thành tích có kiểm chứng và biến ngẫu nhiên. Làm thêm có thể cải thiện cơ hội nhưng cũng có thể vô ích (không được trả, sai ngành, doanh nghiệp không thăng chức).
- Công việc hợp đồng, làm tự do, tăng ca, hai việc có điều kiện pháp lý, thời gian và sự mệt khác nhau; không đưa mô hình ép lao động bất hợp pháp như hành động tất yếu.
- Rủi ro bệnh/tử vong vẫn cần dựa vào nền tảng tuổi/giới/tỉnh/năm; chỉ áp dụng hệ số điều chỉnh sức khỏe khi có cơ sở, tránh quy đổi một giờ làm thành nguy cơ tử vong thiếu kiểm chứng.

## F. NPC và những năm tháng không quay lại

- Mỗi NPC có `bond`, `trust`, `unmet_needs`, `availability`, `health`, `age`, `location`, `commitments`.
- `quality_time` có điều kiện: cùng 2 giờ bên con nhưng kiệt sức/điện thoại liên tục có hiệu quả khác với 2 giờ thực sự tương tác.
- Gặp nhau thường xuyên không chắc được yêu mến nếu liên tục xung đột. Mua quà có thể có lợi nhưng không phủ nhận thất hứa, bỏ bê hoặc bạo lực.
- `missed_milestone` tạo ký ức khó bù hoàn toàn; không nhất thiết trừ điểm vĩnh viễn mà thay đổi lời thoại/hành động NPC.
- Ràng buộc sức khỏe/chăm sóc của NPC có thể làm người chơi bỏ lỡ cơ hội nghề nghiệp dù họ không chọn điều đó.

## G. Đầu tư và cơ hội giàu lên

### G1 — Mục tiêu

Đầu tư bổ sung lối đi tích lũy tài sản để người chơi có thể giảm phụ thuộc vào thời gian bán sức lao động, nhưng **không được đem lại thu nhập bảo đảm chỉ bằng vài cú nhấp**.

### G2 — Kênh và chi phí cơ hội

| Kênh | Vốn | Thời gian | Thanh khoản | Rủi ro/điều kiện |
|---|---|---|---|---|
| Tiền gửi | Thấp–trung bình | Thấp | Cao hoặc giới hạn bởi kỳ hạn | Lãi thực, rủi ro lạm phát, phí/rút trước hạn |
| Quỹ/cổ phiếu đa dạng hóa | Thấp–trung bình | Thấp–vừa | Tùy thị trường | Giá biến động, phí, thuế nếu áp dụng |
| Cổ phiếu tự chọn | Thấp–cao | Vừa–cao | Tùy thị trường | Kỹ năng phân tích không bảo đảm thắng |
| Vàng | Thấp–cao | Thấp | Tương đối cao nhưng chênh mua/bán | Biến động, phí giữ/bảo quản |
| Nhà cho thuê | Cao | Vừa | Thấp | Trống nhà, sửa chữa, thuế/phí, tín dụng |
| Góp vốn/kinh doanh | Vừa–cao | Có thể rất cao | Thấp | Lỗ, trách nhiệm, đối tác, hàng tồn, lao động |

Công cụ và quyền đầu tư thay đổi theo năm mô phỏng và pháp luật; chỉ mô phỏng loại tài sản hợp lệ trong kịch bản. Không coi crypto hoặc tín dụng đòn bẩy mặc định dễ tiếp cận.

### G3 — Market Simulation

- `market_regime` gồm tăng trưởng, suy thoái, lạm phát, biến động ngành; dùng một chuỗi thị trường chung trên mỗi seed và điều kiện thời kỳ, không tạo biến động độc lập cho từng nhân vật ở cùng thế giới.
- Portfolio ghi `cash`, `liquid_assets`, `illiquid_assets`, `loans`, `holdings`, `realized_pnl`, `unrealized_pnl`, `fees`, `taxes_if_applicable`.
- Tài sản danh nghĩa, tài sản thực sau lạm phát, và tiền thanh khoản hiển thị **khác nhau**; không so sánh lệch đơn vị.
- Sinh lời kỳ vọng **không bao giờ là cam kết**; có xác suất lỗ và chuỗi thua dài; thanh khoản có thể đóng băng; nhà đất không bán ngay chỉ vì người chơi bấm bán.
- Đầu tư/kinh doanh cần thời gian học/quản trị. Quản lý tài sản thụ động thường ít giờ hơn kinh doanh chủ động, nhưng vẫn có nghĩa vụ pháp lý/tài chính.
- Có rủi ro lừa đảo theo Scam System với thông tin, hợp đồng và xác minh, không cung cấp nội dung hướng dẫn thực hiện lừa đảo ngoài đời.

### G4 — Đánh đổi tài sản lấy thời gian

Sau nhiều năm tích lũy đủ buffer, nhân vật có thể giảm giờ làm, dành thời gian bên gia đình hoặc chăm sóc sức khỏe. Tuy nhiên việc không làm toàn thời gian có thể ảnh hưởng nghề nghiệp và quan hệ xã hội. Đây là payoff dài hạn của đầu tư, không phải phần thưởng tức thì.

## H. REALISM / HARDSHIP — chỉ khác cách sinh biến cố và khả năng chống đỡ

- **REALISM:** hiệu chỉnh xác suất và phân phối theo nguồn khi có; thiếu nguồn thì trình bày rõ giả định. Không cố tình tạo thêm lừa đảo/thất nghiệp để tăng kịch tính.
- **HARDSHIP:** tăng độ bất định thu nhập, biến động chi phí thiết yếu, tần suất các trở ngại vừa/nhỏ và độ khó hồi phục; có thể giảm nguồn lực dự phòng ban đầu trong một preset khắc nghiệt. Không âm thầm thay đổi số liệu đã gắn nhãn chính thức, không tăng tùy tiện chết chóc hoặc bạo lực nghiêm trọng.
- Hai chế độ có cùng hệ time budget, state updates, NPC obligations và accounting; chỉ khác tham số có nhãn `MODEL_ASSUMPTION`.
- Lock chế độ lúc khai sinh cho cùng một replay; lưu `seed`, `mode`, `world_data_version`, `engine_version` để so sánh.

## I. UI/UX của sự đánh đổi

- Giao diện chính 4 thanh dễ đọc, tiền thanh khoản, nợ, tài sản ròng, lịch thời gian dạng thanh 168 giờ/tuần và trạng thái thời gian còn lại.
- Mỗi lựa chọn có **nhãn xu hướng** thay vì con số chắc chắn: `Thu nhập có thể tăng`, `Ít thời gian với gia đình`, `Cần thời gian phục hồi`, `Rủi ro mất vốn`.
- Phần chi tiết xem được **vì sao**: `Bạn đã làm thêm 12 tuần, chưa nghỉ đủ 2 ngày`, `Tháng này bỏ lỡ cuộc họp phụ huynh của con`.
- Sau 1/5/10 năm có đồ thị thời gian: làm việc vs gia đình vs ngủ; tài sản thực; chất lượng quan hệ; thời gian khỏe mạnh. Không gom thành một chỉ số 'đời thành công'.
- Chọn preset năm/quý (Làm việc hết sức; Gia đình; Cân bằng; Học thêm; Đầu tư; Sinh tồn) rồi tự phân lịch; cho phép điều chỉnh khi sự kiện buộc người chơi phải quyết định.

## J. Kịch bản xuyên đời — ba con đường không cân bằng

Nhân vật cùng tuổi 25, nghề nghiệp và tài sản ban đầu, cùng seed thế giới; thay đổi **chính sách thời gian**, không ép kết quả:

1. **Career:** làm 55 giờ/tuần khi hợp lệ, thu nhập có thể cao hơn và có cơ hội thăng tiến; đến 35 tuổi tài sản tốt hơn, nhưng mệt mỏi và ít ký ức với con nếu không điều chỉnh. Nếu công ty không trả làm thêm hoặc thị trường suy thoái, đánh đổi có thể thất bại.
2. **Balanced:** làm 40 giờ, giữ hoạt động gia đình và chăm sóc; tăng tài sản chậm nhưng sức khỏe và mạng lưới hỗ trợ vững. Một sự kiện chi phí y tế có thể khiến gia đình khó khăn, trừ khi có bảo hiểm/buffer.
3. **Invest & Learn:** cắt bớt giờ làm hoặc thời gian vui chơi để học kỹ năng và nghiên cứu tài sản, đầu tư phần tiền dư; sau 10 năm có thể tạo nguồn thu độc lập hoặc thua lỗ vì thị trường. Không bảo đảm giàu hơn cả Career lẫn Balanced.

Các đường không đối xứng; có thể có một lựa chọn thắng ở nhiều mặt nhờ xuất thân/cơ hội. Không thêm cơ chế 'rubber-banding' tự động phạt người chơi giàu hoặc thưởng người chơi nghèo để ép kết quả cân bằng.

## K. Tick hàng tháng và tính nhất quán

```text
At each monthly tick, in fixed order:
  0) verify mode, RNG seed/version, living state
  1) advance calendar, age, world market prices + inflation
  2) generate mandatory constraints (school, employment, childcare, caregiving)
  3) resolve schedule to <= available hours, log displaced activities
  4) accrue earned money and expenses in double-entry-like transaction ledger
  5) update sleep_debt, fatigue, stress, recovery, effective productivity
  6) update every NPC using actual time + promises + autonomy
  7) update mood transiently, satisfaction with slow moving context
  8) advance study/career/opportunities/investments with conditional probabilities
  9) process eligible events and deferred effects idempotently
 10) apply mortality/health hazards (age/sex/province baseline; documented modifiers only)
 11) append causal log, autosave snapshot and RNG state
```

Sub-step order must be deterministic; if changing engine order, increase `engine_version` and migrate existing saves explicitly.

## L. Test tiêu chí nghiệm thu

1. **168h**: tất cả lịch tuần thỏa thời gian; không cho thuê người trông trẻ 'tạo' giờ trong ngày, chỉ chuyển trách nhiệm.
2. **Opportunity cost**: nếu workload +15h/tuần và nguồn lực khác không thay đổi, ít nhất 15h phải được dịch từ nhóm khác; trường hợp ngoại lệ được log.
3. **Asymmetry**: không có invariant áp đặt tổng chênh lệch của 4 stats bằng 0; một phương án có thể tốt/xấu ở nhiều trục.
4. **Relationship**: mua quà 12 lần không tự động bù 12 lần thất hứa; mức lợi ích lặp có suy giảm.
5. **Satisfaction**: sự kiện vui làm mood tăng nhanh rồi thích nghi; satisfaction dài hạn không nhảy vọt vô hạn.
6. **Money**: sổ cái cân đối; không double-count thu nhập đã đầu tư hoặc doanh thu kinh doanh; không bán tài sản illiquid tức thì.
7. **Investment risk**: mô phỏng đủ nhiều seed có cả lãi/lỗ; không giới thiệu `expected return` thành lợi nhuận chắc chắn.
8. **Care**: nghĩa vụ chăm con và cha mẹ già được tính trong thời gian, ảnh hưởng job policy; NPC có thể từ chối giúp.
9. **Determinism**: cùng seed, same options, mode, data/engine version => same result; save/load không nhân bản hậu quả.
10. **Mode clarity**: REALISM vs HARDSHIP hiển thị rõ; HARDSHIP không thay data nguồn.
11. **Economic mobility**: BALANCED có thể sống ổn định không triệu phú; một số seed có cơ hội giàu; CAREER không bảo đảm giàu.
12. **QA sensitivity**: tăng thời gian làm việc sẽ đổi phân phối thu nhập nếu trả công nhưng làm tăng nguy cơ thiếu thời gian; kết quả kiểm thử được báo cáo theo nhóm xuất thân, không ép các tỉnh kết quả giống nhau.

## M. Roadmap cho Codex

- **T1:** TimeBudget & Policy Resolver; deterministic fixtures, UI lịch 168h.
- **T2:** Fatigue/Recovery/Stress + multi-layer happiness; anti-spam/anti-exploit tests.
- **T3:** NPC Quality Time / Promises / Memories; nhật ký hậu quả trì hoãn.
- **T4:** Career Opportunity, non-linear learning & income; event authoring contract.
- **T5:** Investment Ledger + Market Simulator + debt/liquidity; integration với Scam System.
- **T6:** So sánh 3 lối sống trên cùng hoàn cảnh, 2 mode, QA Monte Carlo, accessibility và di động.

**Định nghĩa hoàn thành:** Người chơi có thể chủ ý kiếm nhiều tiền hơn bằng thêm thời gian và công sức nhưng cảm nhận được chi phí lên đời sống, có thể lựa chọn cuộc sống bình thường với phần thưởng khác tiền bạc; game không giả định mọi lựa chọn được thiết kế cân bằng để công bằng với nhau.
