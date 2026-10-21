# VN63 — MASTER CODEX HANDOFF / ĐẶC TẢ TỔNG HỢP

**Dự án:** Một Đời Ở Việt Nam (VN63)  
**Canon tổng hợp:** 21/10/2026  
**Trạng thái:** Tài liệu yêu cầu cho Codex, **KHÔNG phải tính năng đã triển khai**  
**Repository chính:** https://github.com/conghau115599/vn63  
**Quy tắc ưu tiên:** Master brief này tổng hợp quyết định sản phẩm đã chốt; source hiện hành chỉ được xác định sau khi Codex audit. Khi phát hiện xung đột giữa yêu cầu ở các Issue, ưu tiên canon chốt mới nhất trong tài liệu này, sau đó báo cáo xung đột và phương án xử lý. Không âm thầm đổi scope.

## A. Mệnh lệnh cho Codex

Hãy **tích hợp toàn bộ định hướng đã chốt vào codebase Next.js/TypeScript hiện có** qua nhiều phase và PR nhỏ, bắt đầu từ phân tích khoảng cách (gap audit) và các contract nền tảng. **Không làm lại game bằng HTML tĩnh, không thay repo, không xóa engine cũ, không push/merge/deploy production khi chưa được duyệt**. Ở mỗi phase hãy viết code có thể chạy, test, changelog, migration và screenshots; không dừng ở việc viết GDD. Trường hợp dữ liệu lịch sử thiếu, ghi rõ MISSING/ESTIMATED/ASSUMPTION; tuyệt đối không chế số liệu làm như thống kê chính thức.

Các yêu cầu nguồn chi tiết đã được phân nhóm:
- #1 — gameplay v1.8, weekly/monthly, UI, tuổi thơ, NPC, random events: https://github.com/conghau115599/vn63/issues/1
- #2 — Province Identity, 63 tỉnh theo snapshot 2024: https://github.com/conghau115599/vn63/issues/2
- #3 — Breakthrough & Legacy, vươn lên và thành tựu: https://github.com/conghau115599/vn63/issues/3
- #4 — Family & Social Life, bản sắc văn hóa: https://github.com/conghau115599/vn63/issues/4
- #5 — Historical World 1975, thời kỳ kinh tế, hành chính, nghề, tiền: https://github.com/conghau115599/vn63/issues/5
- PR tài liệu lịch sử #6: https://github.com/conghau115599/vn63/pull/6

Nếu các issue dài gây chồng chéo, dùng master brief để đặt thứ tự; các issue là tài liệu triển khai chuyên ngành, không phải 5 game độc lập.

## B. Tầm nhìn sản phẩm — không được lệch

VN63 là **game mô phỏng trọn một cuộc đời ở Việt Nam**, giao diện thao tác nhanh, có cảm giác theo dõi cuộc đời kiểu 1in8b nhưng thiết kế và mã nguồn phải nguyên bản. Game không phải RPG điểm số, không phải game click liên tục, không phải trò học sử dạng trắc nghiệm.

1. **1975 là năm sinh mặc định**; ngày sinh ngẫu nhiên theo seed và lịch thực tế. Bối cảnh quốc gia, địa phương theo **đúng ngày sinh**; nhân vật sinh đầu năm 1975 không bị mô tả sai rằng chiến tranh đã kết thúc.
2. Xã hội Việt Nam tự vận hành theo nhiều tầng từ năm 1975 tới các năm tương lai, có lịch sử thật, kinh tế/xã hội/địa giới theo năm, và hệ thống tương lai tạo kịch bản sau cutoff đã được xác minh.
3. Nơi sinh, quê quán và nơi cư trú quyết định **môi trường cơ hội, chi phí, nghề, văn hóa, mạng xã hội và phơi nhiễm**, KHÔNG quyết định trí tuệ, đạo đức hay trần thành công.
4. Gia đình, bạn bè, người yêu, bạn đời, con cái, đồng nghiệp, hàng xóm, tổ chức đều có đời sống và hệ quả lâu dài.
5. Người chơi có thể sống đời bình thường, nghèo, sung túc, thất bại, phục hồi, hoặc đạt thành tựu lớn — CEO, chủ doanh nghiệp, vận động viên, nghệ sĩ, nhà khoa học, chuyên gia, người đóng góp cộng đồng. **Không có nút đổi nghề thành vĩ nhân bằng một roll**.
6. Thời gian, tiền, sức khỏe, quan hệ và cơ hội luôn có đánh đổi; hệ quả tồn tại qua tháng/năm, không chỉ cộng/trừ điểm tức thì.
7. Các hệ thống sâu ở phía sau; trước mặt người chơi là **cuộc đời, nhật ký, vài chỉ số và các lựa chọn quan trọng**.

## C. Trạng thái thực tế đã biết — đừng nhận nhầm là đã hoàn thành

### C1. Repo Next.js chính
Qua README/main được kiểm tra ngày 21/10/2026, game trong GitHub đang mô tả **v1.3 Dynamic Branches + Causal Startups (alpha)**, Node 24.x/Next 16, React/TypeScript, dùng tick **tháng** và nhịp hiển thị **72 giây/năm**. Đã có:
- Dashboard 3 cột/mobile; các chỉ số, NPC trust/bond/promise, vài traits và event arcs; seed và save IndexedDB.
- Causal business theo tháng: vốn, khách hàng, capacity, nhân sự, tồn kho, công nợ, sổ sách và báo cáo (giữ lại phần đã đúng).
- CareerPanel ATHLETE/ARTIST: luyện tập → CLB/portfolio → tuyển chọn → hợp đồng; **chưa có mô phỏng giải đấu, fame, giải thưởng hay nghề CEO** theo xác nhận trong code.
- Province fixture `src/content/provinces.2024.json` chỉ có taxonomy 63 tên tỉnh theo 2024, nhiều trường dân số/số trẻ sinh để null; chưa có số liệu tỉnh đầy đủ.
- `src/simulation/init.ts` đang có ngày sinh fixture `2024-01-01`; không phải game lịch sử 1975.

Đây là trạng thái kiểm tra trước khi chạy Codex; Codex phải audit lại nhánh main/PR mới nhất và cập nhật bảng chênh lệch. Không được giả định các thay đổi từ v1.7 HTML đã xuất hiện trong repo.

### C2. Bản chơi thử ngoài repo
Trong cuộc trò chuyện ChatGPT có bản prototype **HTML/JS standalone v1.7** với tuổi 0–4 do gia đình điều khiển, từ 5 tuổi chọn hoạt động, tên NPC, tiếng Việt, ngày dd/mm/yyyy, random events, life simulation và source ZIP. Đây là **nguồn tham khảo tính năng/hành vi**, không phải source Next.js chuẩn, **không nằm trên GitHub**. Nếu Codex cần tham khảo, yêu cầu người dùng cung cấp tệp `VN63_Life_Simulator_Playtest_v1_7_Source.zip` / `Mot_Doi_O_Viet_Nam_Playtest_v1_7.html` trong workspace. Chỉ port logic và tests cần thiết; không ghi đè source repo.

## D. Gameplay và lịch

### D1. Đồng hồ chính
- Nhịp **1× = 1 giây thực ≈ 1 tuần game**, tốc độ 1×/2×/4×/8×/12×/16×. Các nút Pause/Play/Tới quyết định tiếp theo. Khi paused hoặc tải save, không bị tự chạy.
- Thời gian mô phỏng theo ngày Gregorian để qua 28/29/30/31 ngày đúng. Tuần là nhịp gameplay; **kết toán tiền lương, lãi vay, sinh hoạt, doanh nghiệp, đầu tư theo kỳ tháng thực**, không lấy 4 tuần/tháng hoặc cộng gấp đôi tại ranh giới.
- Tua nhanh/seek phải xử lý **mọi sự kiện trung gian** với cùng kết quả seeded như chạy chậm; auto-pause khi quyết định trọng đại. Không chồng popup hoặc mất ngày tới hạn.
- Lịch tuần **168 giờ**, phân cho ngủ, học, làm, đi lại, chăm sóc, vận động, sinh hoạt gia đình, giải trí, kinh doanh; hệ quả thiếu ngủ/mệt mỏi, chi phí cơ hội, buộc chọn đánh đổi.
- Tự động sinh hoạt nhỏ, lương chi phí tính ngầm, ghi nhật ký ngắn; không bắt click hàng tuần/tháng. Nhịp mục tiêu khoảng **2–5 quyết định quan trọng/năm trưởng thành** (tham số UX cần playtest, KHÔNG hardcode chặn biến cố).

### D2. Quyền tự chủ theo tuổi
- **0–4:** không có player choices/popup bắt quyết định; người giám hộ/NPC quyết định sinh hoạt, chăm sóc, trường mẫu giáo/y tế; nhật ký mô tả.
- **Từ sinh nhật 5 tuổi:** tự chọn hoạt động thường ngày, tùy môi trường gia đình/tài chính/niên đại: chơi, đọc, thể thao, phụ giúp vừa sức, học tập, ngoại khóa.
- **Tuổi thiếu niên:** thêm học, bạn, thi cử, kỹ năng, năng khiếu; người giám hộ vẫn quyết định các vấn đề ngoài thẩm quyền trẻ.
- **Trưởng thành:** chủ động nghề, tình cảm, vốn, nhà ở, kinh doanh, đầu tư, di cư; điều kiện pháp lý và nghề theo năm.
- **Tuổi già:** tiếp tục được làm việc, học tập, kinh doanh, chăm sóc, quan hệ; **không bắt nghỉ hưu tại một tuổi cứng**.
- **Bỏ hệ “trọng tâm cuộc sống” 5 lựa chọn bất biến**: hoạt động gợi ý theo giai đoạn, điều kiện sống và lịch hiện tại, giữ được policy/thói quen cho tới khi đổi.

### D3. Giao diện tiến tới tối giản
- Dashboard 3 cột desktop: trái hồ sơ/trạng thái, giữa câu chuyện/nhật ký/quyết định, phải người thân/bản đồ cuộc đời; mobile thu thành một cột dễ đọc.
- Giao diện **hoàn toàn tiếng Việt**, mọi ngày người dùng đọc là **dd/mm/yyyy**, tiền theo đúng đơn vị tiền và kỳ lịch sử, tiền VND hiển thị nguyên đồng khi phù hợp; điểm số chỉ làm tròn **khi hiển thị**, nội bộ giữ độ chính xác.
- Chỉ **4 nhóm hành động**: **Sự nghiệp / Tài chính / Quan hệ / Bản thân**. Gia đình, bạn bè, hẹn hò, con cái nằm dưới Quan hệ; học, sức khỏe, thể thao, nghỉ dưỡng thuộc Bản thân; nghiệp vụ chuyên sâu nằm trong popup hoặc “Xem thêm”.
- Các lựa chọn hành động phải có nhãn việc làm cụ thể (“Hỏi ý kiến vợ”, “Nộp hồ sơ”, “Đưa bố đi viện”), không dùng nút vô nghĩa “Tiếp tục cuộc đời” thay thế quyết định.
- `Decision Orchestrator`: phân loại background notice / nonurgent queue / must-pause; gom sự kiện không trọng yếu, đảm bảo người chơi quyết định đúng quyền và đúng thời gian.
- Người chơi thiết lập thói quen một lần: tập luyện, thăm nhà, gửi tiền, tiết kiệm/đầu tư định kỳ...; hệ thống tự xử lý khi đủ thời gian/tiền và điều kiện, dừng/đề nghị sửa khi không còn khả thi.
- Mỗi thay đổi quan trọng có **nhật ký nguyên nhân–hệ quả**, không chỉ “+5 hạnh phúc”; ẩn các chi tiết kỹ thuật để không quá tải.

## E. Historical World Engine — canon năm 1975

### E1. Phân loại dữ liệu lịch sử
Tách các nguồn và event theo provenance:
- `VERIFIED_HISTORICAL`: mốc/sự kiện thực được xác nhận, cùng ngày/địa điểm ở mọi seed.
- `ESTIMATED_HISTORICAL`: dữ liệu thiếu, ước lượng có nguồn và độ bất định.
- `SIMULATED_PERSONAL`: cuộc đời của người giả tưởng (việc làm, tình cảm, bệnh) dù xảy ra trong năm quá khứ.
- `GENERATED_FUTURE`: kịch bản diễn biến sau cutoff của pack, có nhãn “Tương lai giả lập”.
- `SCHEDULED_UNCONFIRMED`: điều đã công bố hoặc dự kiến nhưng chưa xác minh xảy ra, không được gắn nhãn sự kiện đã xảy ra.

Sử dụng `verifiedThrough`/cutoff riêng theo **data pack** và phiên bản/checksum, không hardcode `year>=2026` hoặc `year>=2027`; ngày hiện tại 21/10/2026 nên một phần 2026 là lịch sử. Các fact được xác minh **xảy ra cố định**, nhưng hậu quả đến nhân vật được tính theo tỉnh, nghề, sức khỏe, gia đình, tiếp xúc, tài sản. Sự kiện quá khứ trong mỗi save không được bị viết lại khi load/speed/update data pack.

### E2. Các thời kỳ bối cảnh
- **1975–1985:** kinh tế, phân phối, tái thiết, nông nghiệp, xí nghiệp/cơ quan, đời sống từng vùng. Không áp chính sách và nghề hiện đại cho 1975.
- **1986–1995:** Đổi Mới chuyển đổi dần, hoạt động thương mại/ngành nghề và điều kiện doanh nghiệp thay đổi theo thời gian.
- **1996–2006:** phát triển công nghiệp, hạ tầng, Internet, doanh nghiệp, chứng khoán và sự mở rộng nghề.
- **2007–2019:** hội nhập, đa dạng việc làm, công nghệ, thương mại, đi lại, đô thị hóa.
- **2020–2026:** dịch bệnh, thay đổi lao động và kinh tế, hạ tầng, điều chỉnh hành chính và chính sách theo dữ liệu thực.
- **Sau cutoff:** chạy World Future Generator dựa trên trạng thái đã quan sát/giả định, tạo chuyển động có quán tính, cùng worldSeed thì nhất quán, không giả làm tin tức tương lai đã xác minh.

Chỉ mô hình hóa sự kiện lịch sử đã kiểm chứng từ nguồn gốc; các mốc trong roadmap là **đầu việc kiểm chứng** chứ không tự coi mọi ngày/chi tiết bên ngoài nguồn là chân lý. Từ khóa kiểm chứng: Đổi Mới 1986, Internet 1997, Luật Doanh nghiệp 1999 hiệu lực 2000, giao dịch chứng khoán lần đầu năm 2000, COVID-19 theo từng địa bàn, sắp xếp tỉnh năm 2025.

### E3. Hành chính theo ngày — địa lý bền vững
- Phân biệt **nơi sinh** / **quê quán gia đình** / **nơi cư trú** / **lịch sử di cư**.
- Dùng `geoLocationId` bất biến cho vùng cư trú; `getAdminUnitAt(geoId, date)` để lấy **tên đơn vị hành chính phù hợp ngày**. Không dùng tên tỉnh theo bộ 63 năm 2024 cho toàn giai đoạn 1975.
- Snapshot tham chiếu 1976 có **38** đơn vị (35 tỉnh, 3 thành phố), 31/12/2024 **63** đơn vị, sau sắp xếp năm 2025 **34** đơn vị. Riêng 1975 phải tra cứu theo **thời điểm**, không mặc định 38 cho cả năm.
- Phân biệt nghị quyết 202/2025/QH15 có hiệu lực **12/06/2025** và chính quyền tỉnh mới hoạt động **01/07/2025**; không chuyển lịch sử nhân vật hoặc đổi quê lúc sáp nhập.
- Mapping thiếu dữ liệu thì explicit MISSING, tránh tự đoán huyện trùng tên ở hai tỉnh.
- Nguồn luật 2025: https://vanban.chinhphu.vn/?docid=213930&pageid=27160 ; nguồn tổng quan 1976: https://www.vietnamplus.vn/nhin-lai-nhung-lan-sap-nhap-tinh-thanh-pho-cua-viet-nam-post1021388.vnp

### E4. Nghề nghiệp, kinh doanh, đầu tư đúng niên đại
- Catalog nghề mở rộng (prototype có 208 nghề và 81 mô hình kinh doanh, còn phải chuẩn hóa); từng nghề có thời kỳ tồn tại, tỉnh, học vấn, kỹ năng, mức thu nhập, nghề truyền thống, thị trường tuyển dụng, hợp đồng, rủi ro, di cư, thăng tiến.
- Không cho smartphone app developer năm 1980; không mở cổ phiếu niêm yết Việt Nam trước thời điểm thị trường thật hoạt động; ngành công nghệ, dịch vụ phát triển dần theo năm và địa phương.
- Hình thức hoạt động kinh doanh phù hợp pháp luật đương thời; **không đồng nhất hộ mưu sinh với công ty trách nhiệm hữu hạn hoặc startup vốn cổ phần**.
- Luật nghề, bảo hiểm, thuế, giáo dục theo hiệu lực và phiên bản; chỗ nào thiếu source phải là mô hình tạm thời.
- Khi qua thời kỳ, mở cơ hội mới đúng việc học, hạ tầng, gia đình và thị trường; không tự xuất hiện 500 việc làm bất ngờ vào đúng 01/01.

### E5. Tiền tệ và sức mua
- 1975 phải phân biệt đơn vị tiền theo khu vực thời điểm; **1978 thống nhất tiền tệ** và **1985 đổi tiền**, các quy định có điều kiện theo loại tiền/tài khoản. **Không áp một tỷ lệ đổi chung cho tiền mặt, tiền gửi, nợ và toàn bộ tài sản.**
- `currencyEpoch` + `assetKind` + `openedAt` + `conversionRule` + `source` + ledger hai chiều; bao gồm cash, savings, debt, receivables, property, business inventory, vàng và tài sản hiện vật.
- Tiền, lương, giá nhà, học phí, chi phí sinh hoạt, lãi suất phải ứng với từng giai đoạn. So sánh sức mua qua thập kỷ không dựa trực tiếp vào số danh nghĩa và không giả đủ CPI cấp tỉnh nếu không có.
- Tiền của trẻ 0–4 chủ yếu do người giám hộ/hộ quản lý; chuyển tiền giữa NPC và nhân vật phải có hai phía, không tạo tiền vô cớ.

### E6. Future World Generator
- World state có dân số/cơ cấu tuổi, thị trường lao động, cung cầu hàng hóa, lạm phát, công nghệ, hạ tầng, giáo dục, y tế, di cư, rủi ro môi trường.
- Mỗi năm/quý hệ thống cập nhật nhân quả và có ký ức, không generate một headline ngẫu nhiên độc lập; ngành nghề/sản phẩm mới cần điều kiện.
- Seed riêng cho thế giới và seed cho cuộc đời; cùng seed+action→cùng outcome; world có thể chịu ảnh hưởng từ người chơi khi tổ chức/doanh nghiệp của họ đủ lớn.
- Future là **giả lập, không khẳng định tương lai thật**, các sự kiện tương lai đã xảy ra trong một save không thay đổi khi tải lại.

## F. Province Identity Engine — 63 tỉnh có bản sắc riêng

- Bộ 63 tỉnh **là snapshot của ngày 31/12/2024**, dùng nghiên cứu, so sánh và nội dung vùng. Engine thời gian sẽ giải quyết địa giới năm 1975/1976/2025; không mâu thuẫn.
- Mỗi tỉnh/khu vực cần `ProvinceContext` có: urban-rural/remoteness, dân số và số trẻ sinh (nếu có), nghề cha mẹ/nguồn lực hộ, cơ cấu ngành, việc làm, thu nhập và phân phối, tiền thuê nhà, chi phí sống, học/y tế, mùa vụ, văn hóa, thiên tai, di cư và nguồn ghi rõ năm/đơn vị/độ tin cậy.
- **Không sinh đều 1/63** nếu có số liệu sinh phân theo năm; thiếu thì phương pháp dự phòng được chú thích. Cần phân biệt dân số, số trẻ sinh, GRDP/người, thu nhập bình quân và chi tiêu — không tự hoán đổi.
- Tỉnh khác nhau gây khác biệt về **cơ hội, chi phí, loại sự kiện, nghề và thời gian di chuyển**; không đảm bảo kết quả sống tỉnh này luôn tốt hơn tỉnh kia.
- **Cấm định kiến tỉnh/giới/dân tộc/tôn giáo làm tính cách/đạo đức/IQ hoặc khả năng bị lừa**. Tính cách do khí chất giả lập, giáo dục, gia đình, trải nghiệm, thói quen, lựa chọn và quan hệ. Văn hóa thể hiện qua môi trường, phong tục, giọng nói có chọn lọc, cộng đồng tham gia.
- Thử nghiệm chiều sâu trước tại **Hà Nội, Hà Giang, Bắc Ninh, Nghệ An, Đà Nẵng, Bình Dương, Đồng Tháp, Quảng Ninh** (vùng theo địa giới 2024). Sau đó phủ 63 tỉnh, các vùng không đủ dữ liệu dùng regional fallback được ghi chú.
- Nguồn gợi ý: NSO (niên giám và khảo sát mức sống 2024), PCI, PAPI, thông tin chính thức địa phương, dữ liệu hạ tầng/giáo dục và môi trường. Không dùng PCI/PAPI như chỉ số 'tỉnh tham nhũng' để gán trực tiếp khả năng phạm tội của NPC.

## G. Family, Social Life & Society

### G1. NPC có tên và đời sống
- Sinh nhân vật cha/mẹ/anh/chị/em có tên Việt hợp hoàn cảnh (có thể có gia đình không đủ cha mẹ ruột, nhận nuôi, giám hộ, ông bà); tạo tên người hẹn hò, vợ/chồng, con cái, họ hàng/bạn bè khi xuất hiện.
- Mỗi Person có id bền vững, tên, DOB, giới/quan hệ nếu thích hợp, nghề, sức khỏe, nơi sinh/quê/đang ở, tính cách, mục tiêu và tài sản/thu nhập nếu liên quan. Relation graph theo thời gian: phụ huynh, giám hộ, anh chị em, bạn học, đồng nghiệp, bạn thân, mentor, dating, spouse, ex, con, cháu, họ hàng.
- NPC chủ động chuyển việc, thành đạt, mắc bệnh, chuyển tỉnh, hẹn hò, có con, già đi, chết; lưu quan hệ và lời hứa. Không hiển thị người đã mất như đang sống; không thay tên NPC khi load/fast-forward.
- NPC gần (4–12) mô phỏng chi tiết, NPC xa/tổ chức mô phỏng thống kê hoặc nhẹ để giữ hiệu năng. Không spawn vô hạn.
- NPC có quyền không đồng ý khi người chơi đề nghị kết hôn, vay tiền, góp vốn; không tự là một nút cộng điểm Quan hệ.

### G2. Gia đình nhiều thế hệ
- Cha mẹ nuôi/chăm sóc tuổi thơ; người chơi lớn lên, thăm nhà, gửi tiền, đi làm xa, hỗ trợ người bệnh, chăm cha mẹ già; anh chị em có quan điểm và cuộc sống riêng; di sản, tài sản hợp pháp theo thời kỳ.
- Hẹn hò → xây lòng tin → cam kết/kết hôn hoặc chia tay, với nhu cầu/tài chính/công việc hai phía. Không ép cưới sinh con, không phạt người sống độc thân như một thất bại.
- Nuôi con ảnh hưởng thời gian, tiền, sức khỏe và quan hệ; con là NPC có tính cách và quyết định riêng, không phải phép cộng +hạnh phúc.
- Gia đình có thể sống nhiều tỉnh, chuyện Tết về nội/ngoại, hỗ trợ giữa các thế hệ và chuyển tỉnh cần chi phí và thời gian thật.

### G3. Mạng lưới xã hội và tổ chức
- Bạn học, đồng nghiệp, hàng xóm, CLB, người cố vấn, đối tác; giới thiệu cơ hội, hỗ trợ, cạnh tranh, tranh chấp; quan hệ không chỉ tăng/giảm bond số học.
- Trường học/công ty/bệnh viện/địa phương có trạng thái và cơ hội riêng; thị trường và cộng đồng vẫn phát triển dù người chơi không click.
- Tầng mô phỏng: quốc gia/năm-quý → tỉnh/tháng → tổ chức/household/tháng → người/tuần. Không mô phỏng cả dân số VN như hàng triệu NPC đầy đủ.
- Phân tầng xã hội từ điều kiện gia đình và thị trường, song không áp trần thành công theo xuất thân. Di cư có chi phí, quan hệ và cơ hội mới.
- Xã hội có hỗ trợ, tình người, cộng đồng và cả thất bại, bất bình đẳng, tranh chấp, lừa đảo; cân bằng mặt tích cực/tiêu cực, không chỉ một thế giới toàn drama.

### G4. Văn hóa Việt Nam sống cùng gia đình
- Tết, giỗ, cưới hỏi, lễ hội địa phương, nghề truyền thống, phong tục, nghệ thuật địa phương; sự tham dự phụ thuộc cộng đồng/gia đình/năm/địa điểm/nhu cầu, không bắt tất cả người cùng tỉnh làm giống nhau.
- Có lịch âm và lịch dương tính đúng Asia/Ho_Chi_Minh; mọi ngày hiển thị dd/mm/yyyy và tên sự kiện Việt.
- Hội Quan họ (Bắc Ninh), Ví/Giặm (Nghệ Tĩnh), Bài Chòi (miền Trung), Đờn ca tài tử (Nam Bộ), cồng chiêng (các cộng đồng Tây Nguyên) là chất liệu tham khảo cần nghiên cứu đúng cộng đồng và thời điểm.
- Ngôn ngữ hội thoại thân mật, xưng hô theo vai vế, tuổi và mức gần gũi, sắc thái vùng miền vừa phải, không mô phỏng bằng lỗi chính tả/mang tính chế giễu.

## H. Career, Breakthrough, Wealth & Legacy

### H1. Nhiều con đường thành công
- Không có một thanh `Success=100`. Tách competence, performance records, professional trust, fame, institutional influence, wealth từ ledger, social contribution, legacy.
- Lộ trình chủ động dài hạn: corporate employee→senior→team lead→manager→director→CEO; startup owner→có khách→có nhân viên→mở rộng→doanh nghiệp vùng/toàn quốc; vận động viên phong trào→CLB→đội tỉnh→tuyến cao→thi đấu có đối thủ; nghệ sĩ→tác phẩm→khán giả→giải thưởng; nhà khoa học/chuyên gia→công trình/dự án→ứng dụng/thừa nhận; ngành xã hội/giáo dục/y tế cũng có thành tựu lớn.
- Vị trí trống, quy mô doanh nghiệp, tài sản và quyền điều hành phải thật; CEO công ty 3 nhân viên khác CEO tập đoàn; làm CEO thuê khác chủ sở hữu.
- Cơ hội cần kỹ năng, quá trình tích lũy, mentor, môi trường, tài chính, thành tích, hợp đồng và cạnh tranh; pass threshold không đồng nghĩa chắc chắn đỗ khi slot không còn.
- Có trượt tuyển, xuống chức, phá sản, nghỉ do sức khỏe, phục hồi, đổi nghề, thành công muộn; không ép mọi nhân vật giàu/nổi tiếng để có cuộc đời tốt.
- Legacy ghi đóng góp lâu dài sau khi nhân vật qua đời, không quy từ tiền hay danh tiếng đơn thuần.

### H2. Kinh doanh, tài chính và rủi ro
- Giữ business engine v1.3 có causal market: khách hàng/leads/conversion, capacity, vốn, marketing, tồn kho, phải thu/trả, thuê người, dòng tiền, P&L, nợ, runway. Thêm ngành theo tỉnh và năm; không có một startup success-roll cố định.
- Thu nhập, thất nghiệp, thưởng, tiền công, tăng ca, bảo hiểm, thuế và chế độ theo giai đoạn; cuộc sống 168h/tuần ảnh hưởng kết quả.
- Đầu tư tăng/giảm giá, phí, thanh khoản, thời gian, thua lỗ; **không dùng lợi nhuận kỳ vọng bảo đảm**, không tự biến equity valuation thành tiền có sẵn.
- Lừa đảo có cơ hội xác minh, từ chối, khiếu nại/phục hồi; không dùng rủi ro gắn định kiến theo tỉnh.
- Tách vui tức thời và mức hài lòng dài hạn; bệnh/kiệt sức/sai lầm không tự hết vì thời gian trôi, phải có phục hồi hợp lý.

## I. Random events, personal risk, disease & death

- Trộn sự kiện thường ngày tích cực, trung tính, khó khăn, cơ hội hiếm, sự kiện lớn, cùng các event arcs kéo dài và hậu quả đến NPC/tài chính/sức khỏe. Sinh có `prerequisites`, cooldown, exclusions, history keys, idempotence.
- Rủi ro theo tuổi, sức khỏe, nghề, phơi nhiễm giao thông/địa hình/mùa, hành vi, hỗ trợ gia đình, tiếp cận y tế, nơi đang sống. **Không giả số rủi ro cấp tỉnh khi thiếu căn cứ**; lưu year/base rate/source/units/method.
- HARDSHIP tạo áp lực tài chính-xã hội và lựa chọn khó hơn, **không tự tăng tử vong chỉ để khó**.
- Mô hình tử vong có nền theo tuổi và các yếu tố hỗ trợ; tránh cộng trùng nguy cơ tai nạn và bệnh gây tử vong; chết là cuối cuộc đời, chuyển sang recap và legacy.
- Số liệu infant mortality dùng làm thông tin calibrate có nguồn, không coi tỷ lệ năm 2024 áp y hệt cho mọi tuổi sơ sinh 1975.
- Seeded event rng và death hazard tách nguồn rõ; cùng seed+actions+world state kết quả nhất quán ở 1× và 16×.
- Cân bằng: tránh sự kiện lặp mỗi tháng, tránh 30 năm trắng nhật ký; không cưỡng ép drama.

## J. Các contract kỹ thuật bắt buộc

- `GameState` có birthDate chính xác 1975 default, currentDate, weeklyCursor, currentMonthlySettlement, lifeSeed/worldSeed, versioned data packs, provenance, family graph, migration history, monetary holdings, eventMemory, futureWorldHistory.
- `WorldContext(date, geoId, householdId)` chuẩn duy nhất để tất cả modules lấy đúng nghề/giá/quy định/dân cư/tỉnh. Không cho mỗi UI/engine suy năm/tỉnh theo code riêng.
- `ProvinceContext` không chứa static nhân cách người tỉnh; city/rural and family subcontext quan trọng.
- `Decision` có actor/authority, eligibility, consequences/cooldown, due date, priority và nhãn hành động thực; `DecisionOrchestrator` kiểm tra age gate.
- `Person` và `Household` có ID ổn định; transfer/commitment có accounting và time ledger.
- `MonetaryEpoch` tách denominations, asset kind, date effective, source; sử dụng số nguyên hoặc rational math, tuyệt đối không dùng float để làm tròn tài sản từng bước.
- `HistoryPack` có event id, thời gian, provenance, nguồn, phạm vi địa lý, sector exposure, verification cutoff, checksum; annual simulated world state với seeded RNG.
- Tách pure engine tests khỏi React UI; domain logic không dựa trực tiếp localStorage/window; save migration phải bảo toàn dữ liệu đã sinh.
- Phân tách progression/story content khỏi generation và UI. Không hardcode hàng nghìn sự kiện trong một file `page.tsx`.
- Khả năng export/import JSON; IndexedDB giữ bản save thường, migration có backup/recovery. Save HTML v1.7 là schema khác; nếu làm importer thì ghi riêng và kiểm tra, không tự tuyên bố tương thích.
- Tuân thủ nguồn mở/sáng tạo riêng: học ý tưởng UI từ 1in8b, không sao chép code, chữ, hình có bản quyền.

## K. Roadmap thực thi — đề nghị Codex chia PR

| Phase | Nội dung | Điều kiện hoàn tất |
|---|---|---|
| **P0 — Audit & baseline** | Đọc toàn repo, Issue #1–#5, PR #6, bản prototype nếu được cấp; thống kê cái đã có/chưa có/xung đột | Gap matrix, risk register, baseline QA thật, đề xuất kiến trúc + migration |
| **P1 — Core loop / UX** | Lịch tuần–tháng, 1s/tuần, pause/seek, 0–4 không lựa chọn, từ 5 tuổi hoạt động theo tuổi, 4 nhóm UI, Việt hóa | Unit calendar/tick, browser desktop/mobile, 1×=16×, save/load không lỗi |
| **P2 — Time-aware historical data** | WorldTimeline/pack provenance & cutoff, geo/admin 1975–2025, monetary epoch 1975/1978/1985, occupation/legal year gates | Test mốc 1976 38, 2024 63, 2025 34; đổi tiền cash vs saving; nghề hợp niên đại |
| **P3 — Province identity pilot** | Tám vùng/tỉnh pilot có ngành nghề, mức sống, sự kiện, điều kiện đô thị/nông thôn và nguồn; migration geography | 8 province contexts khác biệt và không khóa tương lai; data inspector |
| **P4 — NPC/social/family** | Tên/đời sống NPC, giám hộ, bạn, dating, spouse, con cái, multi-generational household, di cư, văn hóa/lịch | Graph consistency, nghĩa vụ chăm sóc, NPC agency, no money creation |
| **P5 — Career/breakthrough/business** | Mở đường CEO/startup/athlete/artist/scientist/social impact, tổ chức/competition/fame, kinh doanh/đầu tư theo thời kỳ | Bước thăng tiến có prerequisites, doanh nghiệp có khách/cash, test thất bại/phục hồi |
| **P6 — History & simulation events** | Fact 1975–cutoff và tác động phân tầng; random personal arcs, disease/mortality có nguồn | Event fixed facts vs conditional outcomes, không double event/hazard, audit nguồn |
| **P7 — Future World Generator** | Kịch bản sau verified cutoff, causal quarterly/yearly states, consistency, world seed | Không 'bịa tin thật', reload/seek không viết lại tương lai đã diễn ra |
| **P8 — All provinces + balancing** | Mở rộng tất cả vùng/63 theo 2024 (mapping theo năm), văn hóa, nhiều sự kiện, tuning | 63 data profiles có provenance và fallback, stress phân phối |
| **P9 — Release candidate** | Optimize UI/memory/perf, accessibility, tester report, tài liệu thao tác/deploy | QA green, changelog, screenshots desktop/mobile, migration and replay supported |

**Thứ tự ưu tiên:** P0 → P1 (cùng contract P2) → P2 → P3/P4 → P5/P6 → P7 → P8/P9. Hệ thống dữ liệu tỉnh và lịch sử phải làm trước khi nội dung dài hạn gắn với 1975. Có thể chia thêm PR kỹ thuật nhỏ trong từng phase. Nếu dữ liệu hành chính/tiền tệ chưa đủ, làm fixture có provenance và báo blocker, không gán số giả là luật thật.

**Deliverables mỗi PR:** code TypeScript modular, tests + benchmark/traces phù hợp, migration hoặc lý do không cần, README/GDD cập nhật, screenshots nếu có UI, bảng gap đã đóng/mở, changelog, log test pass/fail rõ ràng.

## L. QA gates / test cases bắt buộc

1. Sinh nhiều nhân vật ngẫu nhiên đúng **các ngày năm 1975**, giữ ngày/giờ/tên/quê khi load, cùng seed không thay RNG bất ngờ.
2. **0–4 tuổi zero player decisions**; từ 5 tuổi mở hoạt động phù hợp; không có trẻ nhận popup vay tiền/kết hôn/đầu tư.
3. Play 1×/16×/seek với cùng seed+choices cho cùng journal, NPC, cash, event status, world snapshot; không skip các kỳ tháng.
4. Lịch nhuận: 1976, 2000, 2024 và các tháng 28/30/31 ngày, wages/interest/obligations settle exactly once.
5. Ngày đầu 1975 không mô tả hậu chiến cho địa phương trước khi mốc đã xảy ra; sự kiện sự thật đúng ngày, không đổi giữa seeds.
6. Hành chính 1975/time-aware; 1976 38, cuối 2024 63, sau 01/07/2025 34; không thay tên quê gốc của nhân vật trong save; không gian dân cư/địa chỉ có mapping hợp lý.
7. Tiền mặt, tiền tiết kiệm và nợ có convert/rules khác nhau 1978/1985; không double conversion, không in tiền, không dùng nominal để so sánh sức mua trực tiếp.
8. Nghề hiện đại không xuất hiện trước niên đại, cổ phiếu niêm yết không mở trước lịch; học vấn, thị trường và gia đình ảnh hưởng đường nghề.
9. Cha mẹ/anh chị em/bạn đời/con cái có tên riêng, ID unique, trạng thái/họ hàng nhất quán; người chết không tương tác; quan hệ hợp tuổi.
10. Không mặc định tỉnh X có tính cách xấu/tốt; hoàn cảnh nghề/mức sống/sự kiện khác biệt ở các khu vực pilot với nhiều nhân vật cùng tỉnh.
11. Cơ hội lớn yêu cầu thành tích/nỗ lực/slot và tổ chức tương ứng; không teleport thành CEO/Olympic medal/nhà khoa học nổi tiếng.
12. Business/ledger cân đối, payroll/nợ/đầu tư có giá và thanh khoản, fee, market demand; mô phỏng lớn không tạo nguồn tiền ảo.
13. Cùng worldSeed tương lai nhất quán; factual past không bị RNG thay; fact và future label phân biệt.
14. Bệnh và tử vong không tính trùng hazard, event có cooldown/causality; HARDSHIP không tự boost fatality.
15. UX desktop/mobile tiếng Việt, ngày dd/mm/yyyy, số nguyên hiển thị, bốn nhóm quản lý; có “Tới quyết định tiếp theo” và auto-pause không spam.
16. Property tests graph/ledger/event order, regression save v1.2–v1.3; smoke ít nhất **1.000 full lives**, cohort 10.000+ theo phạm vi đã có fixture/khả năng máy; báo thống kê mortality/wealth/events và bất thường, không giả định đó là xác suất thực tế.
17. Phải chạy và báo thật: `npm run validate:content`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` (nếu runner), `npm run simulate` và QA scripts theo phạm vi phase.
18. Nghiệm thu một **end-to-end life từ 1975 qua năm 2026 tới tương lai** với đổi nghề/di cư/gia đình/thành tựu/rủi ro và kết thúc cuộc đời, không cần vô số click.

## M. Hướng dẫn thực thi ngay cho Codex

**Không hỏi lại toàn bộ yêu cầu; bắt đầu bằng P0.**

1. Checkout main mới nhất và tạo nhánh `feat/vn63-phase0-history-foundation` (hoặc quy ước tương đương). Kiểm tra các PR đang mở, tránh trùng công việc.
2. Đọc master doc này và Issue #1–#5, PR #6 cùng README và source cốt lõi (`src/simulation/`, `src/content/`, `src/components/`, `src/app/`, `src/persistence/`, `tests/`).
3. Tạo `docs/VN63_GAP_MATRIX.md`, đối chiếu **chốt canon / đã có / còn thiếu / blockers / dependency / estimated test**. Xác định cách phối hợp với các PR khác.
4. Đề xuất interface chuẩn (`WorldContext`, `HistoryPack`, `GeoTimeline`, `MoneyEpoch`, `DecisionOrchestrator`, `PersonGraph`), ưu tiên PR tích hợp engine tuần→tháng và history contracts, giữ business core cũ.
5. Thực hiện P1 ở nhánh kỹ thuật; code chạy và unit/e2e thực, không chỉ mô tả. Sau khi xong, mở PR, liệt kê checklist đã đạt/chưa đạt, tiếp tục phase kế tiếp **chỉ sau khi nhận chỉ đạo/duyệt**.
6. Nếu không có dữ liệu chuẩn 1975 hay tư liệu văn bản gốc, ghi blocker và source to verify, tạo fixture an toàn có `ASSUMPTION` hoặc `MISSING`. **Không tự điền thống kê**.
7. Không tự merge PR, không push thay production, không thay dữ liệu người chơi cũ mà không migration.

## N. Tài liệu lịch sử và nghiên cứu ưu tiên

- Canon engine 1975: https://github.com/conghau115599/vn63/blob/docs/historical-world-1975-v1/docs/HISTORICAL_WORLD_ENGINE_1975_SPEC.md
- Codex P0–P7 lịch sử: https://github.com/conghau115599/vn63/blob/docs/historical-world-1975-v1/docs/HISTORICAL_WORLD_1975_CODEX_PLAN.md
- Nghị quyết tỉnh 2025: https://vanban.chinhphu.vn/?docid=213930&pageid=27160
- Niên giám thống kê NSO, khảo sát mức sống dân cư và chuỗi số liệu theo năm: https://www.nso.gov.vn/
- PCI: https://pcivietnam.vn/ ; PAPI: https://papi.org.vn/
- Di sản UNESCO Việt Nam: https://ich.unesco.org/en/state/viet-nam-VN?info=elements-on-the-lists
- Luật và thời điểm hiệu lực: https://vbpl.vn/ và https://vanban.chinhphu.vn/
- Các đợt đổi tiền: tra văn bản NHNN/văn bản gốc, phân biệt đồng tiền tại miền Nam/Bắc, tiền mặt/tiền gửi; chưa xác minh đầy đủ thì KHÔNG auto áp tỷ lệ đơn giản.
- Thông tin thời kỳ lịch sử có tranh luận hoặc số liệu thiếu: ghi độ bất định và tham khảo nguồn đáng tin khác nhau; không đưa định kiến, luận giải chính trị một chiều thành quan hệ xác suất của người dân.

## O. Definition of Done tổng dự án

Người chơi bấm **Chào đời** và sinh ra trong **năm 1975** ở một địa điểm có bối cảnh đúng thời điểm; 0–4 tự diễn ra do gia đình, từ 5 có hoạt động phù hợp; xã hội VN thật thay đổi qua thập kỷ; các tỉnh tạo trải nghiệm khác biệt; gia đình/bạn bè/bạn đời/con cái là những người có tên và đời sống; nghề, tài sản, đồng tiền, hành chính vận hành theo năm; thành tựu cao và thất bại đều có lộ trình; từ mốc quan sát cuối cùng thế giới tiếp tục tương lai giả lập thống nhất; người chơi vẫn thao tác tối giản qua nhật ký, 4 nhóm và popup quan trọng. Bản chơi có thể chạy từ lúc sinh đến qua đời trên desktop/mobile, **có kiểm thử, nguồn và migration thực**.

**Hiện tài liệu này là yêu cầu, không có nghĩa source chính đã triển khai hoặc kiểm thử đạt các mục trên.**
