# QA v1.3 alpha — 20/10/2026

Đây là báo cáo triển khai mô hình, không phải chứng nhận cân bằng hoặc hiệu chuẩn thống kê. Người dùng đã yêu cầu triển khai và push GitHub; phần chỉ dẫn trong tài liệu đính kèm được dùng làm specification, không tự cấp quyền deploy. Không tạo project Vercel.

## Kiểm tra đã thực hiện

- 46 unit/property/integration tests, 7 file: Gregorian/DOB, minute budget, ledger, seeded replay, monthly/fast parity, context/actor/cooldown, traits, migration, causal business và hai lộ trình nghề. Chạy bằng Vitest trực tiếp qua Node trong môi trường Windows hạn chế subprocess.
- TypeScript noEmit, content/fixture validation và production static build Next.js đã chạy thành công. Không chạy đồng thời typecheck với build vì Next tái tạo `.next/types` trong build.
- Trình duyệt tích hợp: nhập save v1.2, migration, startup validation/launch, hóa đơn trả sau, reload, sổ cân; senior có người bạn đời cần chăm sóc, dừng quyết định/reload/nhận chăm sóc; nghề biểu diễn từ chuẩn bị đến tuyển chọn → dừng lời mời → reload → nhận hợp đồng. Desktop và mobile 390px không tràn ngang; không có console warning/error trong lượt kiểm tra.
- Playwright CLI đã phát hiện đầy đủ test desktop/mobile. Worker subprocess bị `spawn EPERM` ở máy local nên **không báo CLI E2E PASS**; đã cấu hình workflow Linux để chạy thực sự. Các bước browser ở trên được kiểm tra riêng bằng trình duyệt tích hợp.

## Batch và đối chứng

`qa-results/v13-lifetimes-1000.json`: 1.000 full lives, 500 mỗi mode, seed offset 0, 1.022.152 monthly ticks. Policy đối chứng luôn từ chối quyết định, không nhận việc hay kinh doanh. Sampling tỉnh round-robin fixture, không phải phân phối sinh thực tế. Median tuổi thọ demo 1.021 tháng; median net worth khoảng −6,39 tỷ VND phản ánh thu nhập vắng mặt nhưng nghĩa vụ sinh hoạt/nợ vẫn ghi, không phải mô phỏng đời sống trung bình của người Việt.

`qa-results/v13-cohorts-10000.json`: 10.000 doanh nghiệp mỗi mode × chiến lược = 60.000 ventures, 24 tháng/venture, 1.440.000 business commits. Cùng world seed/province/ngành/vốn giữa các chiến lược; hai ngành và ba mức vốn 10/30/60 triệu. Số chi tiết và phân tầng nằm trong JSON, không suy ra xác suất thành công ngoài đời.

| Mode | Chiến lược | Tiền cuối kỳ trung vị | Lợi nhuận lũy kế trung vị |
|---|---|---:|---:|
| REALISM | CAREFUL | 63.835.800 | 31.987.200 |
| REALISM | GROWTH | 11.757.600 | 30.810.400 |
| REALISM | OVEREXTENDED | 0 | −107.809.600 |
| HARDSHIP | CAREFUL | 52.267.380 | 20.233.920 |
| HARDSHIP | GROWTH | 7.440.320 | 53.360 |
| HARDSHIP | OVEREXTENDED | 0 | −125.855.675 |

Ba chiến lược minh họa cùng market seed `v13-matched-market-0`: CAREFUL kỹ năng 65/giá 110k/marketing 150k/15 giờ tuần/chi phí cố định 1,2m; GROWTH 50/100k/600k/35h/2,5m; OVEREXTENDED 25/90k/1,2m/55h/5m. Đây là các profile có nhiều biến khác nhau, không phải thí nghiệm chỉ thay kỹ năng; unit test riêng cô lập ảnh hưởng kỹ năng.

**Điểm cần cân bằng:** CAREFUL có lãi và đủ tiền ở cả 10.000 seed mỗi mode; OVEREXTENDED không còn đủ tiền ở cả cohort. Một số profit quantile giống nhau do capacity/cost giới hạn. Kết quả cho thấy profile và capacity đang lấn át biến động, chưa đủ đa dạng để quảng bá tỷ lệ sống sót. Không sửa kết quả bằng random game-over hoặc ép phần trăm thất bại.

## Ba hoàn cảnh cuộc đời

Runner lưu cả báo cáo tháng và eligible pool đầu kỳ cho ba fixture trong `stories`:

1. Trẻ 3 tuổi đô thị nhiều nguồn lực: có caregiver và dịch vụ chăm sóc sớm phù hợp; không có quyền ký hợp đồng/đầu tư.
2. Trẻ 3 tuổi nông thôn ít nguồn lực: pool chuyển sang nếp sinh hoạt caregiver phù hợp; không bị áp menu tuổi 3 giống fixture đầu hoặc khóa trait vĩnh viễn.
3. Người 75 tuổi có bạn đời cần chăm sóc: actor thật đang sống mới mở nhánh chăm sóc. Mẫu widower không con được kiểm tra đối chứng trong unit tests, không tự sinh cháu hoặc lương hưu.

## Nghề mơ ước: 400 lượt mô phỏng

`qa-results/v13-careers-400.json`: hai nghề × hai nền tảng ×100 seed, luyện 10h/tuần, tối đa 36 tháng, vốn thử 500 triệu để cô lập tiến bộ khỏi chi phí sinh hoạt. Tự vào CLB khi đủ điều kiện, dự tuyển khi đủ và nhận lời mời; quyết định không liên quan đều từ chối.

| Nghề | Nền tảng cân bằng: tháng đến hợp đồng | Có năng khiếu: tháng đến hợp đồng |
|---|---:|---:|
| Vận động viên | 18,26 | 10,83 |
| Nghệ sĩ biểu diễn | 17,26 | 10,28 |

Cả 100 seed mỗi cấu hình đều vào nghề trong giới hạn thử; đây là mục tiêu tiếp cận gameplay của lộ trình cơ bản, **không phải xác suất nghề nghiệp thật** và chưa đại diện hoàn cảnh thiếu tiền/cơ hội hoặc chăm sóc nặng. Unit tests cô lập cùng kỹ năng đầu vào/cùng phút luyện để xác nhận năng khiếu giúp học nhanh hơn; kiểm tra chưa đủ giờ không nhận nghề, trượt giữ tiến bộ và phải chờ 3 tháng, tuổi nhỏ/cơ hội thiếu không được vượt gate, pending offer/save/fast parity và input state không bị mutation.

## Phạm vi file chính

- `src/simulation/events/{types,eligibility}.ts`, `events.ts`: context contracts, reason-returning eligibility, history/arc và nội dung.
- `personality.ts`, `config.ts`: six-trait drift và versioned assumptions.
- `business/*`: types/schema, shared monthly market, accounting and causal operations.
- `core/advanceMonth.ts`, `time/MonthlySchedule.ts`, `finance/*`, `investments/*`: tích hợp nghĩa vụ, lương, vốn, cash và ngân sách thời gian.
- `careers.ts`, `components/CareerPanel.tsx`: luyện, hồ sơ, tuyển chọn và hợp đồng.
- `init.ts`, `types.ts`, `save.ts`: fixtures đầu đời/tuổi già, save schema 3 và migration.
- `app/*`, `components/*`: UI Việt responsive, business, career và inspector.
- `tests/*`, `scripts/*`, `.github/workflows/*`: QA lặp lại, cohort và scale gate.
- `docs/spec/vn63-v13`, `data/fixtures/v13_cases.json`: bản specification/fixture đi kèm; `docs/VERCEL_SETUP.md` cho bước tự import của người dùng.

## Gate còn mở

100.000 full lifetimes **chưa chạy**. Workflow thủ công có 40 shard ×2.500 và aggregator kiểm seed range/tick coverage; không lấy số ventures hoặc ticks thay cho số lives. CI chỉ được báo đạt khi GitHub thực chạy thành công. Chưa hiệu chuẩn tử vong, thuế/chính sách/pháp lý, sick-care, family graph, danh tiếng hoặc kinh tế địa phương. Alpha đủ để review/playtest; chưa đạt toàn bộ release gate GDD.
