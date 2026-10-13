import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CaroVIP — Cờ caro, vào là chơi",
  description: "Chơi cờ caro ngay trên trình duyệt: không cần đăng nhập, đấu với máy hoặc với bạn bè.",
};

export const viewport: Viewport = {
  themeColor: "#0d0f14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnam.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <div className="mx-auto w-full max-w-3xl px-4">{children}</div>
      </body>
    </html>
  );
}
