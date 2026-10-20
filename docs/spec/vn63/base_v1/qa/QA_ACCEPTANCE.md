# QA / ACCEPTANCE CHECKLIST — VN63 (v1.0)

## P0: Nguyên tắc phải đạt

- [ ] Có thể bắt đầu, chơi một cuộc đời đến khi mất, tổng kết và tạo kiếp mới trong cả REALISM và HARDSHIP.
- [ ] Danh mục 63 tỉnh snapshot 2024 đầy đủ, không nhầm danh mục 34 tỉnh 2025 là 63 còn hiện hành.
- [ ] Mỗi cuộc đời lưu seed/version/dataset; cùng lựa chọn + seed + phiên bản cho cùng toàn bộ kết quả.
- [ ] Nhiều tài khoản tiền rõ ràng; không tự phát sinh tiền không có nguồn; không chi vượt tiền mặt mà không ghi nợ.
- [ ] Một sự kiện chưa đủ điều kiện không được hiện. NPC cha mẹ đã qua đời không thể tham dự sự kiện bình thường.
- [ ] Đã chết thì không phát sinh tick, học hành, chi tiêu, tương tác.
- [ ] Hậu quả trì hoãn được thực thi đúng một lần và tồn tại qua save/load.
- [ ] Sự kiện lừa đảo không để lộ sự thật hoặc xác suất kết quả trong nội dung trước khi quyết định.
- [ ] Cơ chế lừa đảo cho phép tìm hiểu, tránh, mất tiền và phục hồi; không dùng ngôn ngữ đổ lỗi nạn nhân.
- [ ] Không đổi tham số chết, tự hại, bạo lực tình dục chỉ để tăng độ khó của HARDSHIP.
- [ ] Dữ liệu chưa có nguồn không xuất hiện với nhãn `OFFICIAL`.
- [ ] Có chặn lặp cooldown và trọng số đúng 0..1, có xác minh schema sự kiện.

## Test case có tính đối chứng

| ID | Setup | Expected |
|---|---|---|
| T01 | same seed/version & same choices, run 2× | identical event/state/ledger hashes |
| T02 | same run, save at age 18y, reload | equal final hash to continuous run |
| T03 | no job status + check recruitment job search | only if looking_for_work or explicit alternative trigger |
| T04 | parent died at 50, run event parent illness at 51 | ineligible |
| T05 | cash 1m, must pay 2m | does not become -1m silently; arrears or alternative resolution |
| T06 | schedule 2m debt repayment, restore save at due month | no double repayment |
| T07 | scam offer UI before choice | `isFraud` and hidden roll absent |
| T08 | HARDSHIP compared to REALISM via 10k paired seeds | allowed event exposures generally higher; protected mortality parameters unchanged |
| T09 | same player changed residence HN→Đồng Nai | currentProvince updates; birthProvince unchanged |
| T10 | all 63 slugs sampled with positive weights from valid dataset | each can occur, sample close to normalized weights within confidence band |
| T11 | missing province indicator | quality `ESTIMATED` or `MISSING`, never fabricated official value |
| T12 | content filter disable severe illness detail | uses appropriate toned-down text, no punishment in core simulation |
| T13 | only one health all-cause hazard | not independently stacking same-cause hazard |
| T14 | debt interest with zero outstanding principal | zero accrued interest |
| T15 | death after unresolved scam arc | obituary closes the life without future post-death events |

## Monte Carlo acceptance

- N >= 100,000 runs, split by mode and balance profile. Prefer reproducible fixed seed series and report run command.
- Export CSV/JSON reports for province birth share, ages-at-death, sex/gender distribution where modeled, income quantiles, unemployment duration, event frequency, max debt, household states, migration, and terminal condition.
- Compare **only** parameters with official/credible target distributions. Each variable gets source, confidence, transform and fitting error; no spurious precise claims.
- For uncalibrated scams use robustness reports (exposure vs loss, repeat per character, effects of verify/decline, victim recovery) **without** labelling prevalence real.
- Detect impossibilities: death after age 140 unless explicitly modeled, age negative, unbounded debt caused by bug, infinite event loops, duplicate IDs, NPC loops, inconsistent family relationships.
- P95 simulation time per whole life measured on development hardware, no unbounded CPU/memory in mobile browser; budget to be established by profiling, not guessed.

## Content & legal review

- [ ] Bản quyền: nội dung/giao diện riêng, không sao chép source 1in8b.
- [ ] Có tuổi khuyến nghị, cảnh báo nhạy cảm, giảm nội dung.
- [ ] Không mô tả quy trình thực thi lừa đảo, tạo website giả hoặc chiếm đoạt tài khoản.
- [ ] Không tái hiện nạn nhân có thật hay cá nhân/doanh nghiệp có thể nhận dạng nếu chưa có quyền.
- [ ] Không làm người chơi hiểu dữ liệu mô phỏng là lời khuyên y tế, đầu tư, pháp lý.
- [ ] Chính sách BHYT/BHXH/lương/thuế được ghi rõ năm và quy tắc, nếu chưa kiểm chứng chỉ là giả định sandbox.
- [ ] UI hoạt động với keyboard, screenreader, reduced motion, điện thoại 360px.

## Definition of done của từng milestone

- **M0:** khảo sát repo, không phá công trình cũ, có implementation plan.
- **M1:** engine pure + RNG + types + 63 tên + tests.
- **M2:** ledger & debt + whole life engine + save/load deterministic.
- **M3:** event DSL validated + NPC graph + hậu quả nhiều tháng/năm.
- **M4:** UI, hai chế độ, nội dung chọn lựa, màn kết, responsive.
- **M5:** provenance data pack + fallback minh bạch; kiểm định rates nếu đã đủ dữ liệu.
- **M6:** QA 100k đời + test/CI, không có critical bugs.
- **M7:** deploy có commit SHA/URL và báo cáo trạng thái thực tế.
