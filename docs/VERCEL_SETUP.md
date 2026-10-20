# Tạo project Vercel cho VN63

Phần này để chủ repo tự thực hiện. Không có project hoặc deployment Vercel được tạo trong task triển khai v1.3.

1. Trong Vercel, chọn **Add New → Project**, import `conghau115599/vn63`.
2. Chọn nhánh production `main`, Root Directory để ở gốc repo (`./`).
3. Framework Preset **Next.js**; Install Command `npm ci`; Build Command `npm run build`. Để Output Directory tự nhận theo Next.js.
4. Dùng **Node.js 24.x**. Repo đã có `engines.node = 24.x`, `.nvmrc`, `vercel.json` và lockfile.
5. Bản hiện tại không cần biến môi trường, database hoặc API key. Bấm Deploy và kiểm tra log build thực tế của Vercel.

`next.config.ts` dùng static export. Build local đã xuất `out/` thành công, nhưng điều này không thay cho việc kiểm tra deployment Vercel thật. Có thể kiểm thử build local bằng `npm run build` rồi `npm start`.

Sau deploy, kiểm tra: tạo nhân vật → sang tháng → save/reload → nghiên cứu cửa hàng → khai trương → mua/bán và phải thu/phải trả → quyết định chăm sóc → kiểm tra mô hình. Thử cả điện thoại và desktop. Save lưu theo origin trong IndexedDB: muốn chuyển save từ localhost sang URL Vercel cần xuất JSON rồi nhập lại.

Tham chiếu đã đối chiếu ngày 20/10/2026: [Node.js versions trên Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports). Node 24.x có trong danh sách hỗ trợ; static export tạo `out/` khi build.
