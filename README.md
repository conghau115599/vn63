# Một Đời Ở Việt Nam · VN63

Bản **v1.3 Dynamic Branches + Causal Startups (alpha)**, tích hợp trên nền monthly v1.2. Một tick là một tháng Gregory; fast-forward vẫn chạy mọi tháng trung gian. Spec: **v1.3 > v1.2 > v1.1 > v1.0**.

Repo đích: [conghau115599/vn63](https://github.com/conghau115599/vn63). Người dùng tự tạo project Vercel; task này không tạo hosting.

## Chạy local

Dùng Node.js **24.x** và npm:

```sh
npm ci
npm run dev
```

Mở http://127.0.0.1:3000. Chọn từ khi sinh, chơi thử tuổi 28 hoặc hai hoàn cảnh tuổi 75. Có thể đặt khu vực cư trú/nguồn lực cho hoàn cảnh caregiver. REALISM là **PROVISIONAL MODEL**, mọi hệ số chưa hiệu chuẩn đều là ASSUMPTION.

## Kiểm tra và build

```sh
npm run validate:content
npm run typecheck
npm test
npm run build
npm start
```

`npm start` phục vụ static build `out/`. Playwright dùng build này:

```sh
npx playwright install chromium
npm run test:e2e
npm run simulate -- --count=1000 --decision-policy=decline --output=qa-results/local-lives.json
npm run qa:v13 -- --count=10000 --months=24 --output=qa-results/local-businesses.json
```

Business cohort chạy 10.000 doanh nghiệp **mỗi cấu hình**: 2 mode ×3 chiến lược =60.000 doanh nghiệp, mỗi doanh nghiệp 24 tháng. Phân tầng tỉnh/ngành/vốn là fixture, không phải tỷ trọng thực tế.

## Tính năng v1.3

Giao diện dashboard ba cột, lấy hướng bố cục từ ảnh tham khảo người chơi cung cấp: hồ sơ và chỉ số, câu chuyện và lựa chọn, người thân và bản đồ cuộc đời. Tab có tên đầy đủ; thanh thời gian nằm trên và ghim khi cuộn. Trên điện thoại chuyển sang một cột và có thể mở/thu gọn hồ sơ.

- Eligibility có lý do: actor, agency, hợp đồng, flags, nguồn lực, history, arc và cooldown. Không khóa tính cách tuổi 3/5 hoặc bắt mọi người nghỉ hưu ở 65.
- Sáu trait thay đổi chậm từ thói quen thực; NPC nhớ lời hứa, quà không xóa thất hứa.
- Nghề mơ ước: chủ động luyện thể thao/âm nhạc, tham gia câu lạc bộ, tạo hồ sơ biểu diễn, dự tuyển và duyệt hợp đồng. Năng khiếu tăng tốc học; yêu cầu còn thiếu hiện rõ. Vào nghề tách khỏi nổi tiếng; chưa có fame simulation.
- Doanh nghiệp riêng: pre-launch/validation, nhân sự, tồn kho, phải thu/phải trả, vốn/nợ, sổ Nợ/Có, cash flow, P&L và runway từ thực thu/chi. Không có startup win/loss roll.
- Giá/marketing/giờ chủ/kho/nhân sự tác động đến leads, conversion và capacity. Có vốn, vay, tìm khách, đào tạo, đàm phán, pivot và pause/close.
- UI Kinh doanh, trait inspector, eligibility inspector, ledger audit và counterfactual cùng seed. Nhật ký phân trang, save IndexedDB, xuất/nhập JSON.
- Save v1.2 monthly được di trú versioned với ghi chú default demo, giữ pending cursor và bút toán. Save theo năm không tự biến thành save tháng.

Chi tiết: [triển khai và giới hạn](docs/V13_IMPLEMENTATION.md), [QA hiện tại](docs/QA_V13.md), [hướng dẫn Vercel](docs/VERCEL_SETUP.md). [QA v1.2](docs/QA_V12_ARCHIVE.md) là hồ sơ lịch sử.

## Cấu trúc

```text
src/simulation/calendar/  # Gregorian YearMonth, DOB
src/simulation/time/      # 168h + dated obligations + founder hours
src/simulation/events/    # contracts, eligibility, history and arcs
src/simulation/business/  # independent causal monthly business + books
src/simulation/core/      # pure monthly transition and pausable cursor
src/simulation/save.ts    # schema 3 + v1.2 migration
src/components/           # business and model insight UI
src/persistence/          # transactional IndexedDB snapshot
scripts/                  # content, lives, cohorts and scale aggregation
```

## Windows hạn chế subprocess

Nếu `npm run` gặp `spawn EPERM`, gọi trực tiếp Node:

```sh
node node_modules/typescript/bin/tsc --noEmit
node --import ./scripts/windows-local.mjs node_modules/vitest/vitest.mjs run --configLoader native
node node_modules/next/dist/bin/next build --webpack
node scripts/serve.mjs
```

Build dùng TypeScript 6 API và worker threads. Playwright CLI cần môi trường cho phép worker/browser subprocess; UI đã được kiểm tra qua trình duyệt tích hợp, test CLI chuẩn bị cho CI. Workflow thường chạy unit/build/browser +1.000 lives +10k ventures/config; workflow scale riêng chạy thủ công 100k full lives.

## Giới hạn sản phẩm

Alpha chưa hiệu chuẩn theo thống kê Việt Nam. Danh mục 63 tỉnh là snapshot lịch sử 2024. Tuổi kết thúc 76–95 và NPC 96 là kịch bản demo, chưa là mô hình tử vong. Chưa có đầy đủ bệnh tật, graph gia đình, chính sách/thuế/luật theo năm, scam/khôi phục và inheritance. Các mạch chuyện và ngành nghề còn cần mở rộng. Dữ liệu chơi nằm trên trình duyệt, không có tài khoản hay telemetry.
