# GAME DESIGN DOCUMENT — MỘT ĐỜI Ở VIỆT NAM (VN63)

**Phiên bản:** GDD 1.0 · **Ngày soạn:** 20/10/2026 · **Trạng thái:** Đặc tả thiết kế để triển khai, **chưa phải sản phẩm đã chạy**.

**Lấy cảm hứng từ:** khái niệm mô phỏng cuộc đời theo xác suất của 1in8b.net. Không sao chép mã nguồn, hình ảnh, văn bản, giao diện thương mại, dữ liệu không được cấp phép hoặc thương hiệu của sản phẩm tham khảo.

## 0. Quyết định sản phẩm đã chốt

1. Có **hai chế độ**: `REALISM` (mô phỏng định hướng thực tế) và `HARDSHIP` (khắc nghiệt, tăng áp lực và biến cố có chủ đích). Hai chế độ chia sẻ cùng simulation engine và cùng bộ luật thế giới nhưng khác balance profile, UI luôn dán nhãn mode.
2. **63 tỉnh/thành**, snapshot hành chính 31/12/2024. Đây là phiên bản lịch sử. Không hiển thị như 63 tỉnh đang tồn tại vào năm 2026: từ 2025 Việt Nam có 34 đơn vị hành chính cấp tỉnh. Tên “Thừa Thiên Huế” dùng đúng tại snapshot 2024, không suy diễn cho năm 2026.
3. Chơi từ khi sinh đến khi qua đời. Không mặc định chết ở tuổi thọ trung bình; xác suất tử vong điều kiện theo tuổi/giới tính, nguồn/tham số được truy vết.
4. Không tạo nhiệm vụ "giàu nhất", điểm tốt/xấu hay đáp án tối ưu. Thành công có nhiều chiều: an toàn, ý nghĩa, gắn bó, sự nghiệp, đóng góp, tài chính; cái chết không phải thất bại.
5. Không dùng `LLM` để tính xác suất, tiền bạc hoặc luật chơi. AI tùy chọn **offline trong quy trình soạn văn bản**, nội dung vào game phải QA và version-control.
6. Trải nghiệm người lớn có khó khăn: nợ, bạo lực gia đình, bệnh tật, mất việc, ly hôn, lừa đảo, mất người thân, tranh chấp; có quyền tắt/giảm nhóm sự kiện nhạy cảm mà không bị trừng phạt bằng gameplay.
7. Đầu tiên làm bản **có thể chơi hết đời** trước khi mở rộng truyện, multiplayer hay tài khoản. MVP chạy được trên trình duyệt, không yêu cầu đăng ký.

## 1. Vision & Pillars

**Tagline:** “Không được chọn nơi chào đời. Vẫn phải sống với những lựa chọn của mình.”

**Fantasy:** Người chơi được sinh ra như một người Việt ngẫu nhiên với xuất thân, mạng lưới gia đình, nguồn lực và vận may có giới hạn; họ trải nghiệm 70–90+ năm mô phỏng với tác động dài hạn, đôi lúc không lường trước.

**Pillars:**
- **Hoàn cảnh tạo cơ hội, không định đoạt giá trị con người.** Xuất thân tác động nguồn lực ban đầu và khả năng tiếp cận chứ không gán phẩm chất đạo đức cho vùng miền.
- **Thông tin không hoàn hảo.** Người chơi quyết định dựa trên điều nhân vật có thể biết, không nhìn thấy cờ `isScam`, kết quả xúc xắc, hay mọi hậu quả.
- **Tính liên tục nhân quả.** Tất cả thay đổi trạng thái phải xuất phát từ chi phí thường kỳ, quyết định, sự kiện, tăng trưởng, hỗ trợ, chứ không tự thay đổi.
- **Có thất bại và đường hồi phục.** Một biến cố không được mặc định khóa mọi lối đi; xây dựng chuỗi hồi phục có chi phí, thời gian và tính không chắc chắn.
- **Tính trung thực phương pháp.** Chỉ gắn nhãn “bám thống kê” cho tham số có nguồn và phương pháp hiệu chỉnh, còn lại gắn “giả định mô hình/thiết kế trò chơi”.

**Không làm:** nội dung kích động người chơi bị lừa, mô tả chi tiết kỹ thuật phạm pháp, gameplay cổ súy tự hại; đại diện hiện thực toàn bộ người dân từng tỉnh; dự đoán cá nhân ngoài đời; copy nội dung của game tham khảo.

## 2. Audience, Rating & Session

**Đối tượng:** từ 16+ theo định hướng sản phẩm; cần rà soát phân loại độ tuổi tại thị trường phân phối. Có cảnh báo và bộ lọc chủ đề nhạy cảm. Không hiện chi tiết cách tự hại, bạo lực tình dục hay kỹ thuật lừa đảo thực thi được.

**Thời lượng định hướng:** 30/60/90 phút cho một cuộc đời theo chế độ xem liên tục; có thể tua 1×/2×/4×/8×, tạm dừng, sang biến cố tiếp theo, tự quyết định. Người chơi được lưu và tiếp tục bất kỳ lúc nào.

**Nhịp:** mỗi tick 1 tháng, tự động tổng hợp 12 tick thành năm; sự kiện lớn có thể tạm dừng khi cần chọn. Từ 0–12 tuổi phần lớn do gia đình/biến cố chi phối, tăng quyền tự chủ theo tuổi. Độ tuổi chỉ là gợi ý, không ép tất cả con người theo một tuyến.

**Game loop:** tạo đời → phát sinh xuất thân → tự động trôi thời gian và trả chi phí → sinh sự kiện hợp ngữ cảnh → trình bày tình huống với thông tin nhân vật biết → lựa chọn → cập nhật tức thì + hẹn hậu quả tương lai → diễn tiến → cái chết → tổng kết & xem lại.

## 3. Two Mode Contract

### 3.1 REALISM — mô phỏng định hướng thực tế
- Sinh tỉnh theo tỷ trọng số trẻ sinh trong **năm tham chiếu**; tùy chọn trọng số dân số, và tùy chọn chọn tỉnh để trải nghiệm (được đánh dấu “tự chọn”, không đưa vào mẫu thống kê sinh ngẫu nhiên).
- Nguy cơ tử vong, trình độ học vấn, thu nhập và các trạng thái có số liệu được hiệu chỉnh theo nguồn. Không tự ý nhân xác suất mất việc/lừa đảo lên chỉ để kịch tính.
- Các mô-đun thiếu dữ liệu (ví dụ rủi ro lừa đảo riêng từng tỉnh) sử dụng giả định thận trọng, nhãn rõ “chưa hiệu chỉnh”; không khẳng định đó là tỷ lệ thực trong xã hội.
- Có thể một cuộc đời khá bình lặng; hệ thống không ép biến cố lớn mỗi X năm.

### 3.2 HARDSHIP — đời khắc nghiệt (không phải thống kê thực)
- Giữ quy tắc xuất thân và nguy cơ sinh học cơ bản; tăng **mức phơi nhiễm với áp lực kinh tế/xung đột và tần suất tình huống cần quyết định** bằng cấu hình riêng.
- Ví dụ để QA gameplay (không phải số liệu hiện thực): `economicShockExposureMultiplier=1.35`, `scamOfferExposureMultiplier=1.25`, `relationshipConflictExposureMultiplier=1.20`, `positiveSafetyNetFactor=0.85`, `decisionDensityMultiplier=1.30`. Tất cả có thể điều chỉnh sau playtest.
- **Không** nhân 2–3 lần nguy cơ chết, bạo lực tình dục, tự tử hoặc tử vong trẻ em chỉ vì muốn khắc nghiệt; đây là các chủ đề nhạy cảm có quy tắc riêng.
- Các tình huống phải có chống đỡ/hồi phục; không “trừng phạt người nghèo” bằng các chuỗi tai họa gần như tất định.

### 3.3 Chống gây hiểu nhầm
- Header/giấy khai sinh/bản tổng kết có trường `mode` và `dataFidelity`.
- Không trộn các cuộc đời HARDSHIP vào biểu đồ đại diện dân số của REALISM.
- Không gọi tỷ lệ xuất hiện sự kiện `lừa đảo` là tỷ lệ ngoài xã hội nếu mới được thiết kế nội bộ.

## 4. Thời gian và 63 tỉnh

**Mặc định V1:** `worldModel=REFERENCE_2024_FORWARD_SCENARIO`, nhân vật chào đời trong bối cảnh tham chiếu 2024 và trưởng thành trong **một kịch bản tương lai mô phỏng**, không khẳng định chính sách, lạm phát, thu nhập 2070 là dự báo chắc chắn. Nhấn mạnh đây là kịch bản, không phải lịch sử thật. V1 không hỗ trợ lựa chọn năm sinh trong quá khứ.

**Nâng cấp V2:** `HISTORICAL_MODE` (chỉ khi có chuỗi thời gian đáng tin); `CURRENT_ADMIN_34` thông qua bảng mapping versioned, không được nối gộp trung bình suất theo tỉnh sai đơn vị.

**Tỉnh sinh (birthProvinceId) bất biến**; `currentProvinceId` biến đổi khi di cư; các địa danh hiển thị sử dụng `provinceTaxonomyVersion` thích hợp. Người chơi có thể rời tỉnh, di cư nội địa, đi nước ngoài (V2) hoặc quay về quê.

**Nguồn tỉnh:** mỗi chỉ báo có `year`, `unit`, `geographyVersion`, `sourceUrl`, `accessedAt`, `qualityTier`, `method`, `uncertainty`. Không dùng dữ liệu 34 tỉnh làm dữ liệu 63 tỉnh bằng chia đều.

## 5. Character, Household and NPC model

### 5.1 Nhân vật chính
- Định danh: `lifeId`, tuổi theo tháng, năm lịch, sinh tại, hiện sống tại, giới tính theo bộ thống kê phù hợp, giới tính nhân vật nếu mô phỏng xã hội (không áp đặt đồng nhất hai khái niệm), tùy chọn tên.
- Human capital: học vấn (mốc và bằng), kỹ năng theo nghề, kinh nghiệm, ngoại ngữ, kỹ năng số, vốn xã hội, kiến thức tài chính, khả năng tự bảo vệ (không bảo đảm không bị lừa).
- Tài chính: tiền mặt/ngân hàng; thu nhập ròng tháng; chi phí thiết yếu; tài sản định giá; dư nợ & lịch trả; bảo hiểm; quỹ dự phòng; chi phí phụ thuộc; nghĩa vụ hỗ trợ gia đình. Lưu mọi biến động vào ledger.
- Sức khỏe: tình trạng chung, năng lực lao động, bệnh có thời gian/độ nặng, tiếp cận dịch vụ y tế, giới hạn hoạt động; không biến tình trạng bệnh thành “điểm lỗi”.
- Wellbeing: mức hài lòng, stress, ổn định cuộc sống, cô đơn; chỉ là chỉ số trò chơi, không kết luận chẩn đoán tâm thần.
- Ký ức: sự kiện đã biết, bằng chứng từng thấy, lời hứa, tổn thương, khoản nợ của lòng tin, thói quen hình thành. Thông tin ẩn của thế giới không lộ cho người chơi.

### 5.2 Household
- Người cùng hộ có tuổi, khả năng lao động, nguồn thu, chi tiêu, tài sản chung/riêng, quan hệ thân tộc, gánh nặng chăm sóc, tình trạng cư trú.
- Thu nhập cá nhân ≠ thu nhập bình quân đầu người của hộ; dữ liệu phải tương ứng đúng đơn vị.
- Tài sản chung và nghĩa vụ nợ có sở hữu rõ; không tự động bắt con trả nợ pháp lý của cha mẹ; có thể chịu áp lực hỗ trợ là **lựa chọn xã hội**, trừ khi có cơ sở quy định cụ thể.

### 5.3 NPC quan hệ
- NPC có tuổi, địa điểm, nghề, tài chính tương đối, lợi ích, tin tưởng và giới hạn nguồn lực; không phải máy phát tiền hoặc phản diện cố định.
- Graph quan hệ có cạnh đa chiều: `closeness`, `trust`, `reciprocity`, `conflict`, `availability`, `lastContactMonth`, `historyIds`.
- Mỗi NPC có khả năng thay đổi trạng thái qua thời gian; họ có thể nghỉ việc, kết hôn, già đi, ốm, chuyển nhà, mất liên lạc hoặc qua đời.
- Quà tặng, vay tiền, chăm sóc người thân, giúp xin việc không bảo đảm đáp lại.

## 6. Economy Engine

**Đơn vị tài chính:** VND danh nghĩa theo lịch chơi; hiển thị số nguyên VND, tách dấu chấm. Giá cả và sức mua phải được xác định bởi `priceIndex(baseYear=2024)` và `scenarioId`, không pha trộn tiền 2024 với tương lai.

**Sổ cái dòng tiền:**
`closingCash = openingCash + wageNet + transfersIn + assetSales + loanProceeds - essentialCosts - discretionaryCosts - debtPayments - taxesFees - medicalOutOfPocket - transfersOut - purchases`.

Không cho hệ thống âm tiền mặt mà không có nợ hoặc khoản chi chưa thanh toán. Nếu tiền không đủ: ưu tiên thanh toán theo `paymentPriority`; khoản còn thiếu chuyển `arrears`/nợ nếu hợp lệ, có hậu quả tương ứng. Không dùng negative cash làm đại diện cho nợ.

**Thu nhập:** xác suất được việc × vùng thị trường lao động × trình độ/kỹ năng × ngành nghề × kinh nghiệm × cú sốc doanh nghiệp × yếu tố ngẫu nhiên; bảo đảm phân phối hợp lý theo nguồn. Không phân bổ từ thu nhập GDP hoặc GRDP một cách trực tiếp.

**Chi phí:** nhà ở (thuê/sở hữu), thực phẩm, điện nước, đi lại, học hành, chăm sóc trẻ/người già, y tế sau phần bảo hiểm, giải trí, dự phòng; chi phí thay đổi theo hộ, thành thị/nông thôn, địa điểm sống và năm chơi. Không suy từ thu nhập bình quân ra mức thuê phòng tùy tiện.

**Nợ:** `principal`, `aprNominal`, `repaymentType`, `minPayment`, `dueMonth`, `arrears`, `delinquencyMonths`, `creditorType`, `legalStatus`; lãi phát sinh đúng cơ chế hợp đồng trong mô hình, tránh mô phỏng lãi suất bất hợp pháp như mặc định phổ biến. Hệ thống phân biệt nợ chính thức, nợ thân quen, nợ quá hạn và khoản phải trả không chính thức.

**Tài sản:** tiền tiết kiệm, xe, nhà, đất (V2), vốn kinh doanh, công cụ lao động; không nên cho nhà tăng giá đều mỗi năm. Lưu cost basis, giá thị trường giả định, thanh khoản, nghĩa vụ nợ đi kèm.

**Biến cố kinh tế:** trễ lương, giảm giờ làm, sa thải, cửa hàng ế, sửa xe, viện phí, đám cưới/đám tang, thiên tai, thành viên gia đình cần chăm sóc; phải có chi phí và đường hồi phục (tìm việc, hỗ trợ, vay hợp lý, đào tạo lại, giảm chi).

**Chu kỳ tháng (ordered):** cập nhật bối cảnh/giá → thay đổi NPC, việc làm theo sự kiện → nhận thu nhập → trừ chi phí → trả nợ → giải quyết thiếu hụt → tính lãi/khoản đến hạn → cập nhật wellbeing/risk → xét sự kiện → xét tử vong/độ tuổi theo cạnh tranh nguy cơ. Cần chốt rõ thứ tự trong triển khai để replay deterministic.

## 7. Hardship Engine

### 7.1 Khó khăn có tính dây chuyền
Các nhóm: `FAMILY`, `EDUCATION`, `EMPLOYMENT`, `MONEY`, `HEALTH`, `HOUSING`, `RELATIONSHIP`, `LEGAL`, `ENVIRONMENT`, `SCAM`, `OPPORTUNITY`.

Mỗi hardship gồm **nguyên nhân / mức độ / cửa sổ thời gian / cờ giải quyết / hệ quả / phản ứng của NPC**. Áp lực tổng hợp có giới hạn hợp lý theo tài nguyên và thực tế; “3 cú sốc độc lập” không được đồng thời phá hủy tài chính ba lần trong một ngày.

### 7.2 Điều kiện phát sinh
- Không cố định `P(scam)=x%` cho cả dân số. Tách `P(exposure | hành vi, nghề, kênh)` và `P(loss | exposure, thông tin, lựa chọn, kiểm tra)`.
- Người tìm việc có thể gặp lừa tuyển dụng; người chưa từng mua hàng trực tuyến không nhận tin “đơn hàng hôm qua” nếu không thiết kế sự kiện nhầm số rõ ràng.
- Bão lũ theo vùng và mùa, nhưng không gán rằng mọi cư dân tỉnh ven biển đều chịu thiệt hại như nhau.
- Không kích hoạt sự kiện bố mẹ cần tiền nếu bố mẹ đã qua đời, trừ sự kiện hậu sự đúng thời điểm.

### 7.3 Tồn tại các đường hồi phục
Ví dụ thất nghiệp → tìm việc có điều kiện / học nghề / nhờ giới thiệu / chuyển địa bàn / trợ giúp hợp lệ. Mọi đường hồi phục tốn tiền, thời gian, quan hệ hoặc cơ hội khác. Không có nút “giải cứu miễn phí” hay “thất bại chắc chắn”.

## 8. Scam System — Lừa đảo và gian lận

### 8.1 Taxonomy gameplay
1. Tuyển dụng giả / phí nhận việc.
2. Đặt cọc nhà trọ hoặc mua bán không được giao hàng.
3. Giả danh nhân viên ngân hàng, cơ quan chức năng hoặc người quen.
4. Đầu tư hứa lợi nhuận bất thường, đa cấp biến tướng.
5. Mạo danh nhà cung cấp dịch vụ, đặt vé/đặt phòng giả.
6. Lừa tình và yêu cầu chuyển tiền.
7. Lừa xuất khẩu lao động/học bổng hoặc môi giới không minh bạch.
8. Hợp đồng vay/tiêu dùng thiếu minh bạch, thông tin khoản vay bị đánh tráo.

**Không mô phỏng chi tiết triển khai thủ đoạn, đánh cắp OTP, đào tạo thao túng nạn nhân, hoặc cung cấp cách rửa tiền.** Tập trung góc nhìn người bị tiếp cận: dấu hiệu, cách xác minh và quyền lựa chọn.

### 8.2 State machine
`UNEXPOSED → OFFERED → INVESTIGATING / ACCEPTED / DECLINED → LEGITIMATE_RESOLUTION / SCAM_LOSS / ESCAPED → REPORTED / RECOVERING / CLOSED`

- Khi `OFFERED`, người chơi **không thấy** `isFraud` hay kết quả RNG.
- `INVESTIGATING` có chi phí thời gian, đôi khi lỡ cơ hội hợp pháp; tín hiệu điều tra chỉ có xác suất và độ tin cậy.
- `ACCEPTED` không đồng nghĩa mất tiền (một số lời mời thật); `DECLINED` không luôn là lựa chọn tối ưu.
- Nếu bị mất tiền, có lựa chọn liên hệ ngân hàng, trình báo cơ quan phù hợp, lưu bằng chứng, xin giúp đỡ, thương lượng nghĩa vụ trả nợ; khả năng thu hồi tiền tùy mô hình được gắn nhãn chưa hiệu chỉnh nếu thiếu dữ liệu.
- Không hạ phẩm chất nhân vật hoặc đặt lời kể đổ lỗi cho nạn nhân. Tăng cường kiến thức giúp giảm **một phần** rủi ro chứ không tạo khả năng miễn nhiễm.

### 8.3 Dữ liệu
Các bản tin cảnh báo chỉ xác nhận **loại thủ đoạn có thật**, **không** cung cấp mẫu ngẫu nhiên xác định tỷ lệ nạn nhân trên dân số. Do đó `scamExposureRates` V1 ở trạng thái `ASSUMPTION` cho đến khi có khảo sát đáng tin. Tuyệt đối không hiển thị trong REALISM như xác suất được đo ở cấp tỉnh.

## 9. Relationship & Family Engine

- Mỗi năm cập nhật chu kỳ sống của cha mẹ, anh chị em, bạn bè, đối tác, đồng nghiệp, vợ/chồng, con cái; dân số NPC ở mức tối thiểu giúp gameplay có chiều sâu (khoảng 5–15 người quan trọng trong V1).
- Các sự kiện tình cảm **không** bị rút gọn thành đồng hồ `relationship > 70 -> kết hôn`. Chỉ số là điều kiện một phần; mong muốn, thời gian, tương tác, điều kiện sống, lựa chọn của NPC và biến cố vẫn quan trọng.
- Tránh tuyến kết hôn/sinh con bắt buộc; có các cuộc đời độc thân, sống cùng gia đình, lựa chọn không có con, ly thân, tái hôn, chăm sóc cha mẹ; không đánh giá đạo đức.
- Khi trợ giúp/cho vay từ người thân, giảm tài nguyên phía NPC tương ứng, hoặc ghi nghĩa vụ phản hồi.
- Một biến cố có thể đổi `closeness` nhưng không lập tức đảo `trust` từ 100 xuống 0 nếu thiếu cơ sở kịch bản.

## 10. Memory, Causality, Deferred Effects

**Bắt buộc event sourcing:** trạng thái hiện tại là kết quả của `initialState + ledger/events` hoặc snapshot có thể đối chiếu.

Mỗi sự kiện lưu:
- `eventId, templateId, instanceId, monthIndex, mode, rngTrace, eligibilityEvidence`;
- `knowledgeAtDecision`: chỉ thông tin nhân vật đã biết;
- `selectedChoiceId, immediateEffects, scheduledEffects, tags, causationId`;
- `resolvedAt, outcomeId, visibility`.

**Hậu quả có độ trễ:** lịch trình có `triggerAtMonth | triggerCondition`, `expiresAt`, `priority`, `idempotencyKey`. Một hiệu ứng chỉ thực hiện **đúng một lần**, vẫn sống qua save/load, có thể bị hủy bởi kết quả mới nhưng phải ghi nhận nguyên nhân.

**Sự kiện minh họa:** 22 tuổi bị mất tiền → 23 tuổi trả nợ → 25 tuổi cơ hội học nghề bị trì hoãn → 27 tuổi được người thân hỗ trợ chuyển việc → 31 tuổi tất toán; không hard-code chuỗi này, mô hình tạo chuỗi nếu điều kiện phù hợp.

**Không thay đổi quá khứ:** không để NPC chết rồi quay lại, không phát sinh “có con 7 tuổi” khi nhân vật không có lịch sử có con, không tính trùng vay nợ/thu nhập.

## 11. Event Authoring Rules

Mỗi mẫu sự kiện có: `id`, `version`, `category`, `ageRange`, `eligibility` (predicate DSL), `exposureModelRef`, `cooldownMonths`, `mutualExclusionGroup`, `presentation` (title/body/options), `choices` (effects + outcome branch), `deferredEffects`, `knowledgePolicy`, `sensitivity`, `sourceEvidence`, `modelConfidence`, `testCases`.

**Cấu trúc 3 phần:** tình huống có nguyên nhân → lựa chọn với thông tin giới hạn → kết quả dựa trên cả xác suất và hoàn cảnh. Không viết câu kiểu “bạn nên làm gì” như một bài trắc nghiệm đạo đức. Không cho người chơi nhìn trước tỷ lệ thành công của mọi lựa chọn theo mặc định.

**Mục tiêu thư viện sự kiện Beta:** khoảng 200 mẫu, không phải 200 sự kiện bắt buộc mỗi kiếp. Phân bổ định hướng: tuổi thơ 20, giáo dục 25, nghề nghiệp 35, tài chính 35, gia đình/quan hệ 30, sức khỏe 15, scam 15, môi trường/di cư 15, cơ hội/hồi phục 10. Chỉ là mục tiêu nội dung, không phải phân phối xác suất.

**Chặn lặp:** cooldown và cờ sự kiện, không gặp cùng một lời mời lừa tuyển dụng trong nhiều tháng liên tiếp. Sự kiện có nhánh tiếp diễn nên gắn `chainId`.

**Đa tỉnh:** lõi sự kiện chung, điều kiện địa phương và biến thể văn bản; không gán người một tỉnh là “chăm chỉ/lười biếng/lừa lọc”, không gán nguy cơ xã hội chỉ theo văn hóa.

## 12. UX Flow & Screens

1. **Home:** logo riêng, tóm tắt game, nhãn nội dung, chọn Chào đời.
2. **World Setup:** `REALISM`/`HARDSHIP`; trọng số sinh theo `BIRTHS`/`POPULATION`; tốc độ 30/60/90 phút; bộ lọc nội dung nhạy cảm; năm tham chiếu 2024; giải thích 63 tỉnh snapshot cũ.
3. **Birth:** tên, địa phương, khu vực cư trú, hộ gia đình, hoàn cảnh xuất thân, nguồn và độ tin cậy; tiếp tục.
4. **Life:** timeline theo tuổi, tóm tắt tháng/năm, sự kiện hiện tại, thẻ tình trạng (thu/chi/số dư/nợ/sức khỏe/quan hệ), điều khiển time; tabs “Gia đình”, “Tài chính”, “Ký ức”, “Bản đồ”.
5. **Decision modal:** nội dung 2–5 dòng, 2–5 lựa chọn, nút kiểm tra/xin lời khuyên nếu khả dụng, không lộ flags.
6. **Monthly finance:** biểu đồ dòng tiền và debt schedule; nhãn số liệu trong thế giới giả định.
7. **Life timeline:** hồi tưởng sự kiện, deferred arcs, nghề và tỉnh đã sống; không tiết lộ sự thật bí mật nếu nhân vật chưa biết.
8. **Death & eulogy:** hoàn cảnh cuối đời không khai thác giật gân, di sản/quan hệ/dòng tiền cả đời, 5–10 nút mốc ký ức, thống kê chỉ trong cohort có cùng mode/data version.
9. **Replay / new life:** seed lưu trong máy, cho xem lại; chọn new seed hoặc so sánh 2 cuộc đời (V2).

**Accessibility:** mobile-first, font Việt chuẩn, màu không là tín hiệu duy nhất, nút bấm >= 44px, có reduced motion, keyboard control, ngôn ngữ rõ, screen reader labels, tốc độ tùy chỉnh, không auto phát nhạc.

**Save:** IndexedDB/localStorage theo mức dung lượng, ưu tiên IndexedDB cho event log, versioned migrations, export/import JSON tệp; không yêu cầu tài khoản.

## 13. Endings & Reporting

Không có “good ending” tuyệt đối. Một đời có thể để lại bản kết gồm: tuổi qua đời và độ tin cậy mô phỏng, nơi sinh/di cư, học vấn và nghề, các mối quan hệ đáng nhớ, số năm không có nợ, các giai đoạn khủng hoảng, cơ hội đã nắm/lỡ, nhân vật để lại điều gì.

**Report thống kê:** chỉ so sánh với các cuộc đời cùng mode, profile, phiên bản dataset và seed policy. Không đưa số giả định như “người Việt 63 tỉnh thực tế bị lừa X%”.

**Bộ câu hỏi cuối:** điều gì ngoài tầm kiểm soát, lựa chọn nào ảnh hưởng lớn nhất, ai đã giúp đỡ, nếu sinh ra khác nơi chuyện gì có thể khác (đây là giả thuyết, không phải kết luận).

## 14. Calibration, Fairness, QA

### 14.1 Monte Carlo & fitting
- Chạy tối thiểu 100.000 life simulations/headless với seeded RNG theo mode.
- Với chỉ số có nguồn đáng tin, đặt acceptance bands theo **cỡ mẫu, độ bất định và sai số nguồn**, không áp một mức cố định 1–2% cho mọi nhóm hiếm.
- Kiểm tra distribution theo tuổi, giới, tỉnh, khu vực đô thị/nông thôn, nhóm thu nhập, giáo dục, việc làm, di cư, tuổi chết; kiểm soát sai lệch từ thiếu dữ liệu.
- Nếu biến phơi nhiễm lừa đảo chưa có dữ liệu đại diện: chỉ kiểm thử tính nhất quán (không vượt quá mức phơi nhiễm, không lặp vô hạn), không tuyên bố hiệu chuẩn với thực tế.

### 14.2 Invariants
- Không có người sống sau tháng tử vong; không có quyết định sau khi chết.
- Ledger cân bằng ở mọi tick; principal/debt không âm nếu không có loại tài khoản phù hợp; không double-payment.
- Không sử dụng sự kiện khi điều kiện không thỏa; một deferred effect không chạy hai lần.
- Kết hôn/ly hôn/con cái có timeline nhất quán.
- RNG cùng seed + cùng inputs + version => cùng outcomes, kể cả sau save/load; auto-run và interactive dùng cùng rules.
- Khó khăn mode HARDSHIP khác REALISM đúng balance config nhưng không sửa nền sinh học nhạy cảm ngoài thiết kế.
- Không lấy `province_id` như biến dự đoán đạo đức; audit khi thêm modifier vùng.

### 14.3 Content review
- Kiểm tra tính đúng đắn bối cảnh Việt Nam và thời điểm: công nghệ/việc làm/pháp luật phải có mặt trong `worldYear`.
- Bản tin lừa đảo tham khảo để xây tình huống, không sao chép nội dung dài hoặc lộ hướng dẫn làm điều xấu.
- Rà soát ngôn từ kỳ thị, đổ lỗi nạn nhân, khai thác sang chấn; có điều chỉnh bộ lọc nội dung.

## 15. Product Telemetry & Privacy

MVP local-only. Không tải tên thật, số tiền thật, quyết định nhạy cảm hoặc nhật ký chơi về máy chủ. Nếu sau này có chia sẻ cộng đồng, người chơi chủ động chọn và có xem trước, ẩn tên/các dữ liệu riêng tư; server-side rate-limit, report content, moderation. Telemetry opt-in, tổng hợp, không lưu hồ sơ sức khỏe/lừa đảo cá nhân.

## 16. MVP → Release scope

**P0 vertical slice (hoàn thành trước):** 3 tỉnh minh họa + dữ liệu chất lượng rõ ràng; state ledger & debt; 10 NPC; 20–30 sự kiện với ít nhất 4 arc dài hạn; choice & auto, replay, save-load, chết & obituary, 2 chế độ, simulation runner; app deploy Vercel.

**P1 alpha:** đủ 63 tỉnh **danh mục**, không tự bịa đủ 63 bộ thông số; từng tỉnh chưa được hiệu chỉnh phải kế thừa dữ liệu vùng/quốc gia với nhãn `ESTIMATED`. Tối thiểu 80–100 sự kiện, nghề và di cư, health/education.

**P2 beta:** hiệu chỉnh bộ tham số có nguồn; khoảng 200 sự kiện, 8 scam taxonomies, chính sách an toàn và accessibility, 100k QA lives, cân bằng hai mode.

**P3 release:** dashboard nguồn số liệu, export/import save, review pháp lý và bản quyền, tối ưu hiệu năng/memory, chia sẻ nội dung tự nguyện, công bố giới hạn mô hình.

**Chưa thuộc V1:** thế giới 34 tỉnh tương thích dữ liệu, chính sách thay đổi đúng theo từng năm, online multiplayer, mobile app native, sinh nhân vật từ mọi năm trong lịch sử, sử dụng số liệu cá nhân thực để lập hồ sơ, hệ thống kiện tụng áp dụng như tư vấn pháp luật.

## 17. Explicit open assumptions — Codex không tự bịa

1. Chỉ báo province-level không có bản dữ liệu được kiểm toán: giữ `null`, dùng fallback kèm phương pháp và nhãn không tin cậy; **không** sinh số ngẫu nhiên và ghi như sự thật.
2. Độ tuổi/giới tính và tử vong: cần chọn/kiểm toán nguồn life tables trước khi claim mode REALISM đã hiệu chuẩn.
3. Wage net/tax, BHYT, BHXH, trợ cấp, lãi suất hợp đồng là các chính sách có thời gian hiệu lực. V1 dùng quy tắc sandbox minh bạch, không trình bày là luật Việt Nam đang áp dụng nếu chưa kiểm chứng.
4. Tỷ lệ lừa đảo/khả năng thu hồi/tiếp cận pháp lý không được suy từ số vụ báo chí hoặc cảnh báo.
5. Chế độ HARDSHIP chỉ thay các hệ số exposure/hậu quả thuộc phạm vi game; không làm hại độ trung thực được ghi cho mode REALISM.

## 18. Nguồn dữ liệu tham chiếu (truy cập/đối chiếu 20/10/2026)

- Cục Thống kê — Thông cáo Khảo sát mức sống dân cư 2024: https://www.nso.gov.vn/tin-tuc-thong-ke/2025/05/thong-cao-bao-chi-ket-qua-khao-sat-muc-song-dan-cu-nam-2024/
- Cục Thống kê — Kết quả KSMS dân cư 2024: https://www.nso.gov.vn/du-lieu-va-so-lieu-thong-ke/2026/03/ket-qua-khao-sat-muc-song-dan-cu-viet-nam-nam-2024/
- Cục Thống kê — Dữ liệu KT-XH 63 tỉnh giai đoạn 2020–2024: https://www.nso.gov.vn/category/don-vi-hanh-chinh-dat-dai-va-khi-hau/
- Cục Thống kê — Niên giám 2025 và phụ lục 34 tỉnh: https://www.nso.gov.vn/default/2026/07/nien-giam-thong-ke-2025/
- Quốc hội — Nghị quyết 202/2025/QH15, địa giới cấp tỉnh: https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-202-2025-qh15-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-119250612174148722.htm
- Bộ Công an — Cảnh báo tuyển dụng và thuê tài khoản ngân hàng (18/10/2026): https://www.bocongan.gov.vn/bai-viet/canh-giac-voi-chieu-tro-tuyen-dung-viec-nhe-luong-cao-de-thue-muon-tai-khoan-ngan-hang-1792292719
- Bộ Công an — Cảnh báo mua hàng online (28/09/2026): https://www.bocongan.gov.vn/bai-viet/xuat-hien-thu-doan-lua-dao-moi-khi-mua-hang-online-1790562304
- 1in8b — cơ chế tham khảo công khai: https://1in8b.net/vi/

**Ghi chú:** các nguồn xác nhận hướng dữ liệu và bối cảnh; đây **không phải tuyên bố** đã khai thác đủ 63 bộ dữ liệu sạch, đã ước lượng đầy đủ tỷ lệ rủi ro hoặc đã triển khai game.
