# Một Đời Ở Việt Nam · VN63

Bản **alpha v1.2 Monthly** của game mô phỏng cuộc đời, khởi tạo trong repo `conghau115599/vn63` vốn rỗng khi kiểm tra. Đặc tả đang áp dụng: v1.2 > v1.1 > v1.0, lưu nguyên bản tại `docs/spec/vn63/`.

**Trạng thái:** chạy local và build static thành công; chưa commit/push, chưa có URL production. Chưa đạt nghiệm thu release theo toàn bộ GDD. Xem [QA_REPORT.md](docs/QA_REPORT.md) và [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).

## Chạy dự án

Yêu cầu Node.js 24 và npm. Dependency đã khóa bằng `package-lock.json`.

```sh
npm ci
npm run dev
```

Mở http://127.0.0.1:3000. Chọn **Chào đời** để đi từ 0 tuổi, hoặc **Chơi thử tuổi 28** để thử tài chính ngay. “Tới quyết định” mô phỏng mọi tháng trung gian và dừng trước lựa chọn. Tốc độ chỉ đổi thời gian trình diễn.

```sh
npm run typecheck
npm run validate:content
npm test
npm run build
npm start
npx playwright install chromium
npm run test:e2e
npm run simulate -- --count=1000 --decision-policy=decline --output=qa-results/local.json
```

`npm start` phục vụ thư mục static `out/`. Có thể deploy `out/` lên hosting static hoặc dùng preset Next.js trên Vercel. Chưa thực hiện deploy ở lượt này. Save lưu trong IndexedDB theo origin, có xuất/nhập JSON; đổi URL hosting cần chuyển save bằng JSON.

## Windows trong môi trường hạn chế tạo subprocess

Cài dependency bằng `npm install --ignore-scripts --cache ../npm-cache`. Gọi trực tiếp Node khi `npm run` bị `spawn EPERM`:

```sh
node node_modules/typescript/bin/tsc --noEmit
node scripts/validate-fixtures.mjs
node --import ./scripts/windows-local.mjs node_modules/vitest/vitest.mjs run --configLoader native
node node_modules/next/dist/bin/next build --webpack
node scripts/serve.mjs
node node_modules/typescript/bin/tsc -p tsconfig.sim.json
node .sim-build/scripts/simulate.js --count=1000 --decision-policy=decline --output=qa-results/local.json
```

Next.js dùng TypeScript 6 compiler API và worker threads để build trong môi trường này. Script preload chỉ xử lý lỗi đồng bộ từ phép dò mạng Windows tùy chọn của Vite; không thay kết quả kiểm thử. Playwright CLI cần môi trường cho phép khởi chạy tiến trình/browser. Luồng UI được kiểm tra trực tiếp bằng browser Playwright API của Codex ở desktop/mobile; bộ CLI được chuẩn bị cho CI.

## Kiến trúc và quy tắc

- `src/simulation/calendar`: Gregorian, YearMonth, tuổi theo DOB, sinh nhật 29/02 vào 28/02 ở năm không nhuận. Không dùng giờ hệ thống.
- `src/simulation/time`: lịch 168 giờ/tuần, phân bổ phút nguyên theo lịch 7 ngày, lịch riêng theo weekday và nghĩa vụ ngày cụ thể. Báo bất khả thi khi không còn thời gian mềm.
- `src/simulation/core`: pure transition, cursor từng ngày có thể lưu giữa quyết định, không commit kỳ khi đang chờ. Fast-forward gọi cùng hàm.
- `src/simulation/finance`: VND BigInt, chuỗi khi serialize; cashflow thực, khoản phải trả và nợ. Làm tròn lãi theo đồng gần nhất.
- `src/simulation/investments`: world seed tách person seed; giá tháng, mua/bán, thời hạn thanh khoản. Giá thị trường không tự cộng ví.
- `src/simulation/events`: 20 template nhỏ với tuổi, cooldown, giới hạn lần xuất hiện; 8 loại xử lý chung. Không phải thư viện nội dung hoàn chỉnh của GDD.
- `src/persistence`: snapshot JSON có schema/version trong một transaction IndexedDB. Save cũ bị chặn bằng thông báo chuyển đổi rõ ràng, chưa tự chuyển đổi khi thiếu ngày sinh/tháng gốc.
- `src/app`: giao diện Việt, 4 chỉ số, lịch sống, tài chính, NPC, nhật ký phân trang, tổng kết và chế độ tự động.

REALISM luôn có nhãn **PROVISIONAL MODEL**. 63 tỉnh là danh mục lịch sử 2024, không phải bộ số liệu địa phương đã hiệu chuẩn. Thu nhập, giá cả, lãi vay, diễn biến thị trường, kết thúc cuộc đời và cân bằng đều là **MODEL ASSUMPTION**. Bản alpha không dùng các giá trị này như thống kê ngoài đời.

## Giới hạn cần biết

Nhân vật kết thúc theo kịch bản tuổi demo 76–95; NPC kết thúc ở 96. Đây chưa phải competing-risk/mortality model. Mới có 2 NPC; chưa đủ hệ gia đình, sinh con, hôn nhân, bệnh tật, bảo hiểm, thuế, hợp đồng phức tạp và các arc lừa đảo theo GDD. Chưa có cổ tức hay lãi tiền gửi. Học nghề, tuyển dụng và nghỉ hưu dùng quy tắc sandbox tối giản, chưa hiệu chuẩn theo thời kỳ. UI lịch dùng CSS riêng, chưa dùng Tailwind. Không có tài khoản/server game/telemetry.
