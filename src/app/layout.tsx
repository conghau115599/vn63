import type { Metadata } from "next";
import "./globals.css";
import "./dashboard.css";
export const metadata: Metadata = {
  title: "Một Đời Ở Việt Nam · VN63",
  description:
    "Một cuộc đời, nhiều ngã rẽ. Mô phỏng cuộc sống theo từng tháng lịch với những đánh đổi về thời gian, tiền bạc và sự gắn bó.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
