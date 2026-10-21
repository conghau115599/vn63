# VN63 — Historical World Engine: Canon 1975 (GDD / Technical Spec)

**Quyết định được chốt ngày 21/10/2026:** Năm bắt đầu mặc định của mọi lượt chơi mới là **1975**. Tệp này là đặc tả được đề xuất để Codex tích hợp vào Next.js/TypeScript; KHÔNG phải tuyên bố game hiện đã thực hiện các cơ chế dưới đây. Liên quan Issues #1–#5. Bản lịch sử không phải bài kiểm tra kiến thức, gameplay vẫn gần 1in8b.

## 0. Canon sản phẩm không được thay đổi

1. Cuộc đời mới mặc định **sinh vào một ngày được xác định bằng seed trong năm 1975**, ngày hiển thị dd/mm/yyyy. Trò chơi khởi động ở **ngày sinh thực** của nhân vật, không tự coi mọi người sinh 01/01/1975; tạo tiền sử cha mẹ và bối cảnh địa phương trước ngày sinh.
2. Có tùy chọn 1986/2000/2024 dành cho chơi lại hoặc QA, nhưng 1975 là mặc định; không tự đảo mốc lịch sử để phù hợp nhân vật.
3. Người chơi 0–4 tuổi **chỉ quan sát**; cha mẹ/người giám hộ quyết định. Từ đủ 5 tuổi mới chọn hoạt động theo tuổi, thời kỳ và điều kiện sống.
4. Nhịp trình bày 1× = **1 giây thực ≈ 1 tuần trong game**; 1/2/4/8/12/16×, tạm dừng và tới quyết định tiếp theo. Engine tính các tuần đầy đủ, thanh toán/chốt theo tháng Gregorian (không 4 tuần/tháng). Không làm mất event, lãi nợ, học tập, NPC hay mốc lịch sử lúc tua nhanh.
5. Trục bản sắc Việt Nam: tỉnh, cộng đồng, nghề, gia đình, nhiều thế hệ, văn hóa, vị thế xã hội; mỗi tỉnh cần khác ở cơ hội và điều kiện sống, không gán tính cách người dân cứng theo tỉnh.
6. Chỉ 4 nhóm thao tác Sự nghiệp, Tài chính, Quan hệ, Bản thân; xã hội và lịch sử chạy ngầm, popup khi phải chọn; thông báo lịch sử ít ảnh hưởng chỉ đi vào nhật ký.
7. Thật ở mốc lịch sử; kịch bản hóa ở đời sống cá nhân không có hồ sơ thực; mô phỏng tương lai với nhãn rõ ràng. Không coi mô hình gameplay là thống kê chính thức.

## 1. Ranh giới thực tế / giả lập

- **OBSERVED**: sự kiện lịch sử thật, ngày/địa điểm/nguồn rõ. Dùng đúng thời điểm trong mọi seed, ví dụ Đổi Mới 1986, mở Internet 1997, phiên giao dịch chứng khoán đầu tiên 28/07/2000, tái cấu trúc hành chính 2025. Nếu sự kiện kéo dài, dùng interval và mức ảnh hưởng nhiều năm; không cộng toàn bộ hệ quả trong một tháng.
- **ESTIMATED_HISTORICAL**: mức lương, phân bố lao động hoặc sinh hoạt từng tỉnh/năm thiếu dữ liệu; mô hình ước tính có phương pháp, khoảng bất định, fallback và nhãn.
- **SIMULATED_PERSONAL**: NPC yêu, kết hôn, làm việc, mắc bệnh, lừa đảo, khởi nghiệp, thi đấu... nằm trong quá khứ game nhưng không có bản ghi lịch sử về cá nhân giả tưởng.
- **OBSERVED_2026**: năm 2026 phải dùng các nguồn đã công bố/được kiểm chứng tại mốc đóng dữ liệu của bộ dữ liệu, KHÔNG xem cả năm 2026 là tương lai.
- **GENERATED_FUTURE**: ngày/địa phương/ngành sau cutoff xác minh của bộ dữ liệu; mô hình tương lai có điều kiện, không được giả xưng là sự kiện thực, luật thật hay dự báo chắc chắn.
- **SCHEDULED_UNCONFIRMED**: sự kiện đã được công bố kế hoạch nhưng chưa xảy ra; không ghi là sự kiện chắc chắn đã hoàn thành.

**Cutoff theo từng data pack** (không một if year>=2027). Snapshot release cố định: lịch sử đã tải vào phiên chơi không thay đổi giữa chừng khi người dùng tải game, giữ version và checksum. Cập nhật dữ liệu về sau áp dụng cho ván chơi mới hoặc qua migration có giải thích rõ, không âm thầm viết lại quá khứ trong save cũ.

## 2. Lịch sử hành chính: địa điểm bất biến, tên theo năm

**Không dùng VN_63_2024 làm tên tỉnh cho mọi năm.** Tệp src/content/provinces.2024.json hiện là danh mục tên của cuối 2024, chưa có birth/population/các nguồn kinh tế.

### Data model
- geoLocationId: khu vực gốc bền vững (tối thiểu sub-province nếu có thể: địa bàn/đô thị/nông thôn); lưu cả nơi sinh, quê gia đình, nơi cư trú, lịch sử di cư. Khi thay tên/sáp nhập tỉnh, geoLocationId không đổi.
- adminUnitId + adminEraId + nameVi + effectiveFrom/effectiveTo + predecessorIds/successorIds + mappingCoverage + legalSourceRef.
- lookup getAdminUnitAt(geoLocationId, date) để truy vấn tên tỉnh tại ngày ấy; journal cũ phải giữ label theo thời điểm phát sinh. Không suy diễn 1–1 với trường hợp sáp nhập/tách huyện; những vùng mapping chưa xác minh phải được đánh dấu MISSING và cho xem khu vực/nhãn lịch sử an toàn.
- Khởi tạo 1975 phải có taxonomy **riêng**. Không giả định hệ 38 đơn vị của 1976 áp dụng cho toàn năm 1975, vì quá trình hợp nhất diễn ra cuối 1975–1976.
- Các mốc ưu tiên: 1975–1976 hợp tỉnh; một số tách 1978–1979; tách 1989; các đợt 1991, 1996–1997; những điều chỉnh đến 2024; và **2025 còn 34 đơn vị cấp tỉnh**. Nghị quyết 202/2025/QH15 hiệu lực **12/06/2025**, các địa phương hình thành sau sắp xếp vận hành từ **01/07/2025**; hai ngày này phải lưu riêng.
- 63 tỉnh theo địa giới cuối 2024 vẫn là một góc nhìn của dữ liệu để so sánh/QA; không được thay quê quán lịch sử của NPC.

### Nguồn cần kiểm toán
- Cục Văn thư và Lưu trữ nhà nước: https://www.archives.org.vn/gioi-thieu-tai-lieu-nghiep-vu/ky-iv-dia-gioi-hanh-chinh-viet-nam-tu-nam-1975-den-nay.htm
- Văn bản Quốc hội 202/2025/QH15: https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-202-2025-qh15-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-119250612174148722.htm

## 3. Lịch sử nghề nghiệp & tính hợp lệ theo năm

Không dùng danh sách 208 nghề của bản HTML thử nghiệm như tất cả đều hiện diện từ 1975. Cơ sở nghề nên là taxonomy nghề lõi, thêm mô hình xuất hiện/biến đổi:
- Occupation ID ổn định + nghề/công việc hiển thị theo thời kỳ; sector; local demand; urban-rural; access to education; licenses/eligibility effective dates; entry and promotion path; working hours; wage distribution with date/currency/unit/provenance; job status formal/informal/household/state enterprise/cooperative.
- **1975–1985**: đặt trọng tâm vào công việc nông nghiệp, sản xuất, hợp tác xã, cơ quan/xí nghiệp và các hoạt động mưu sinh phù hợp điều kiện vùng, không áp chế độ mở doanh nghiệp công nghệ hay cổ phiếu niêm yết.
- **1986–1990s**: quá trình Đổi Mới diễn ra theo giai đoạn, không 'mở khóa' mọi ngành vào 01/01/1986. Luật Doanh nghiệp tư nhân 1990 có hiệu lực **15/04/1991** (cần phân biệt tự mưu sinh, hộ cá thể và mô hình doanh nghiệp được pháp luật công nhận).
- **1997**: Internet chính thức kết nối công khai ngày **19/11/1997**; sự tiếp cận và nghề liên quan phải mở dần theo địa phương, hạ tầng, giáo dục, không phát sinh hàng loạt ngay mốc đó.
- **2000**: Luật Doanh nghiệp 1999 có hiệu lực **01/01/2000**; thị trường chứng khoán giao dịch tập trung đầu tiên **28/07/2000**; không có khả năng mua cổ phiếu niêm yết Việt Nam trong game trước thời điểm này.
- **2000s–2026**: các ngành dịch vụ, công nghệ, logistics, nội dung số, thương mại điện tử phát triển theo điều kiện cung cầu từng năm; những nghề tương lai tiếp tục sinh ra bởi Future Generator với nguồn lực và hạ tầng hợp lý.
- Nghề truyền thống vẫn tồn tại sau khi hiện đại hóa; các nghề/điều kiện tiếp cận có khác biệt theo tỉnh và hộ gia đình, nhưng **không có hard cap tài năng theo nơi sinh**.

Mỗi khoản lương, khuyến mãi, chi phí đào tạo và kinh doanh phải lấy từ cùng bối cảnh kinh tế tương ứng tháng/năm/địa phương; tuyệt đối không lấy lương mẫu 2052 hoặc chi phí hiện đại áp vào 1975.

Nguồn: https://vbpl.vn/botuphap/Pages/vbpq-vanbanlienquan.aspx?ItemID=7040&Keyword= ; https://vbpl.vn/bonoivu/Pages/vbpqen-toanvan.aspx?ItemID=929&dvid=320 ; https://baochinhphu.vn/15-nam-ket-noi-internet-va-nghi-quyet-49-cp-mo-duong-102135278.htm ; https://ssc.gov.vn/webcenter/portal/ubck/pages_r/l/chitit?dDocName=APPSSCGOVVN162142779

## 4. Tiền tệ, tiền lương, tài sản và đổi tiền theo kỳ

Mỗi ledger entry có currencyEpochId + denomination + nominalAmount + postingDate + source + ownership. Không lưu một số tiền VND vĩnh cửu từ 1975 đến 2026 rồi auto-convert vào mọi loại tài sản.

### Các epoch phải xử lý
1. Năm 1975: miền Bắc và miền Nam có hệ tiền khác nhau; cuối 1975 có đổi tiền tại miền Nam (mốc **02/09/1975** trong tài liệu ngoại vụ, cần đối chiếu quyết định gốc để chính xác ngày và quy tắc áp dụng). Địa phương và ngày quyết định loại tiền được sử dụng.
2. Ngày **03/05/1978**: thống nhất tiền tệ toàn quốc. Tài liệu lịch sử ghi **1 đồng ở miền Bắc = 1 đồng thống nhất**, **1 đồng Giải phóng ở miền Nam = 0,8 đồng thống nhất**; cần xác minh điều kiện thực hiện theo loại tài khoản và hạn mức trước khi áp dụng production.
3. **Tháng 09/1985**: tỷ lệ đổi tiền mặt cơ bản **10 đồng cũ = 1 đồng mới**, nhưng tiền tiết kiệm có quy tắc ưu đãi theo kỳ gửi và hạn mức/điều kiện riêng. Cần quyết định nguồn pháp lý và effective date chính xác cho từng loại tiền/hợp đồng (văn bản hướng dẫn có đề cập kỳ thu đổi ngày **14/09/1985**). KHÔNG nhân/divide tất cả tài sản người chơi theo cùng một hệ số.

### Bắt buộc trong Financial Engine
- Tách cash physical, bank account/deposit (ngày gửi, điều khoản), wages accrued, debts/claims, commodity assets, housing/land, inventory/business equity. Chỉ các tài khoản chịu chính sách đổi tiền mới có quy tắc đổi; giá trị tài sản hiện vật không trở thành số tiền mặt tức thì.
- Ghi nhận đổi tiền thành sổ giao dịch có cặp debit-credit, đơn vị tiền trước/sau, tỷ lệ, hạn mức và rounding (tính chính xác với integer/rational arithmetic; hiển thị giá trị làm tròn theo đơn vị đương thời); không tạo/mất tài sản do double conversion.
- Chỉ số sức mua, CPI, chi phí hàng hóa được đánh dấu OFFICIAL/DERIVED/ESTIMATED/ASSUMPTION; thiếu chuỗi tỉnh/tháng dùng fallback có trình bày, không dùng mù quáng giá nhà, lương, lãi năm 2024 cho 1975.
- Hộ gia đình 0–4 tuổi: chi phí do tài khoản hộ và người giám hộ chịu; không làm trẻ sơ sinh sở hữu lương vô căn cứ. Mỗi khoản hỗ trợ từ NPC đến người chơi là chuyển khoản **hai phía**, không 'tạo tiền'.
- Không so sánh giá trị danh nghĩa 1 đồng 1975 với 1 đồng 2024 như cùng sức mua; màn chi tiết có 'so sánh theo sức mua' khi dữ liệu đủ chất lượng.

Nguồn kiểm tra trước coding: https://scov.gov.vn/cong-tac-ve-nvnonn/hoi-dap/giai-dap-thac-mac-ve-cac-dot-doi-tien-tai-vn.html ; https://moit.gov.vn/upload/2005517/fck/files/Sach_LS_nganh_Cong_Thuong_compressed_8fe4f.pdf ; https://thuvienphapluat.vn/van-ban/Tien-te-Ngan-hang/Thong-tu-8-NH-TT-quy-doi-tien-gui-tiet-kiem-theo-ty-le-uu-dai-trong-ky-thu-doi-tien-14-9-1985-43636.aspx

## 5. Phân tầng bối cảnh quốc gia, tỉnh thành và cá nhân

World macro/year-quarter: growth, prices, public health, education capacity, transport, industry, migration, legislation.
Province/year-month: sector supply/demand, settlement types, local living cost, infrastructure, school access, weather/disaster exposure (chỉ khi có cơ sở).
Household/day-month: người giám hộ, nghề cha mẹ, wealth/debt, chăm sóc, chuyển tỉnh, các mối quan hệ.
Person/month-week: hoạt động, nghề, sức khỏe, kỹ năng, cơ hội, lựa chọn.
Organization/month: employer, school, clinic, club, household firm and larger firms; số vị trí và lộ trình thành tựu thật.
Events: factual nationwide timing fixed, individual effect conditional on exposure; cá nhân tự sinh events không được gắn 'đã xảy ra với người thật'.

Một giai đoạn khó khăn không khiến tất cả NPC nghèo hoặc cùng phản ứng; may mắn/nỗ lực/mối quan hệ tạo các con đường riêng. Văn hóa tỉnh thành biểu hiện qua điều kiện sống/lễ hội/xưng hô, không hardcode personality/ethnicity/religion->quality.

## 6. Future World Generator

Input: full worldState tại cutoff đã được đóng băng và dữ liệu lịch sử versioned. Output: chuỗi world events từ sau cutoff:
- Có trạng thái và quán tính: inflation, household purchasing power, employment, migration, sector demand, technological adoption, population, infrastructure, climate risk. Những biến cố ảnh hưởng lẫn nhau; không generate từ text prompts độc lập.
- Cho phép nhiều kịch bản tăng trưởng, suy giảm, dịch chuyển ngành, công nghệ, cú sốc môi trường; không gọi đây là sự thật, không ấn định tên nhân vật/cơ quan/chính sách thực trong tương lai.
- RNG phân tách `worldSeed` (cả xã hội) và `lifeSeed` (cuộc đời), deterministic theo event key/time/geo. Lựa chọn lớn có thể tác động đến local world nhưng không tái viết lịch sử thế giới quá khứ.
- Event tương lai chỉ được chốt một lần và lưu vào save. Sau khi đến thời điểm game đã sống qua, nó trở thành 'lịch sử trong ván chơi', **không** thành VERIFIED_HISTORICAL.
- Cập nhật historical cutoff về sau không retroactively rewrite future đã sinh trong save đang chơi.

## 7. UX — kiểm soát thao tác

UI chính vẫn 4 chỉ số, hồ sơ, nhật ký, người thân, life map, 4 mục thao tác. Thông tin xã hội/lịch sử chỉ chiếm 1–2 dòng nhật ký nếu không trực tiếp ảnh hưởng. Popup chỉ bật khi có sự kiện yêu cầu hành động có thể thay đổi kết quả. Trẻ 0–4 không có player agency, popup thuộc guardian logic nội bộ. Mỗi sự kiện có 'Tìm hiểu bối cảnh' tùy chọn, hiển thị nguồn lịch sử và nhãn dữ liệu. Từ giai đoạn giả lập phải có chữ 'Tương lai giả lập'. Date dd/mm/yyyy, số thập phân được làm tròn khi hiển thị, đơn vị tiền đúng kỳ lịch sử.

## 8. Engine contracts (gợi ý)

```ts
type Origin = 'VERIFIED_HISTORICAL' | 'ESTIMATED_HISTORICAL' | 'SIMULATED_PERSONAL' | 'GENERATED_FUTURE' | 'SCHEDULED_UNCONFIRMED';
type Quality = 'OFFICIAL' | 'DERIVED' | 'ESTIMATED' | 'ASSUMPTION' | 'MISSING';
type Source = { publisher: string; url: string; date: string; retrievedAt: string; unit?: string; geography?: string; methodology?: string };
type HistoricalEvent = {
  id: string;
  origin: Origin;
  occurredFrom: string;
  occurredUntil?: string;
  effectiveFrom?: string; // riêng cho pháp luật
  operationalFrom?: string; // riêng cho thời điểm bắt đầu hoạt động
  geoIds: string[];
  affectedSectors: string[];
  sourceRefs: Source[];
  quality: Quality;
  worldEffects: Array<{ metric: string; scope: string; magnitude?: number; durationMonths?: number; modelingAssumption?: string }>;
};
type HistoryPack = {
  packVersion: string; releasedAt: string;
  verifiedThrough: string; // cutoff của pack, có thể khác giữa economic/admin/health
  checksum: string;
  events: HistoricalEvent[];
};
type MoneyHolding = { accountId: string; ownerId: string; currencyEpochId: string; nominal: string; assetKind: string; openedAt: string; terms?: Record<string, string> };
type GeoTimelineEntry = { geoLocationId: string; adminUnitId: string; adminEraId: string; validFrom: string; validTo?: string; sourceUrl: string };
```

Module suggestions: src/simulation/history, /geography, /economy/epochs, /world, /careers/eligibility; src/content/history/, src/content/admin/, src/content/money/, src/content/occupations/. Gắn adapters vào simulation/core hiện có thay vì thay engine bằng file HTML.

## 9. Content sourcing QA

Sự kiện historical phải có source năm, ngày, nhà xuất bản, địa lý, category, loại 'observed/effective' và phiên bản. Numeric series có unit+denominator/base year + geography; thiếu số liệu thì MISSING hoặc ASSUMPTION, không tự tạo để đẹp biểu đồ. Nếu dữ liệu lịch sử/luật/văn hóa có tranh luận, ghi nguồn và tránh bình luận thiên kiến. Dữ liệu 1975 ban đầu thiếu số liệu cấp địa phương phải có chiến lược fallback rõ; tuyệt đối không nói lịch sử 1975 'chính xác 100%' nếu chưa đầy đủ.

## 10. Acceptance tests — không được bỏ qua

1. Một lifeSeed năm 1975 sinh đúng ngày cố định; DOB hiển thị dd/mm/yyyy; tải save giữ DOB, tên và quê.
2. Trước sinh nhật 5 tuổi zero player prompts; từ 5 có hoạt động đúng tuổi và đủ điều kiện.
3. 1×/16×/seek và save-load giữ cùng events/ledger/state với cùng worldSeed, lifeSeed, policy và actions.
4. Tất cả tuần trung gian xử lý; lịch tháng nhuận 1976/2000/2024, chuyển tháng/năm hợp lệ; tài chính chỉ chốt tháng một lần.
5. Tra cứu tên tỉnh chính xác cho geography/date; năm 1975 không giả 38 tỉnh toàn năm; snapshot 1976 ra 38; cuối 2024 ra 63; sau mốc 2025 ra 34 khi mapping đầy đủ.
6. Tách 12/06/2025 legal effective vs 01/07/2025 operational; không đổi nơi sinh trong hồ sơ nhân vật.
7. Phiên chứng khoán 28/07/2000 không thể xảy ra tháng 1999; nghề ứng dụng mobile không thể xuất hiện trong 1980; nghề truyền thống vẫn khả thi sau 2000.
8. Đổi tiền năm 1978/1985 cash/deposit áp dụng rule phù hợp, không double conversion khi tua/save, sổ cân tài khoản; test các kỳ gửi tiết kiệm 1985 khác nhau.
9. Bất kỳ event VERIFIED_HISTORICAL nào xảy ra đúng ngày trong mọi seed; tác động cá nhân thay đổi theo exposure, không forced casualty.
10. Data cutoff 2026: OBSERVED tới ngày nguồn được xác nhận, GENERATED_FUTURE sau cutoff; source packs khác cutoff xử lý đúng.
11. Generated future không claim đã xác minh, không viết lại khi chạy lại hoặc cập nhật; world future continuity qua nhiều năm.
12. 63/34/38 là các snapshot, không phải static count cho mọi thời điểm; ID địa điểm là immutable.
13. 1.000+ life smoke; unit/property tests tính tiền/time/geography, browser desktop/mobile; content provenance validator; giữ test v1.3 và regression của Issues #1–#4.
14. KPI: không quá 2–5 popup lớn/năm trưởng thành ở config mặc định **chỉ là mục tiêu UX cần playtest**, không hardcode mọi nhân vật.

## 11. Mốc triển khai và phụ thuộc

Xem docs/HISTORICAL_WORLD_1975_CODEX_PLAN.md. Codex mở nhánh tính năng riêng, mở PR nhỏ theo phase. Mọi thay đổi lớn engine cần migration save tường minh; không push production không có duyệt.
