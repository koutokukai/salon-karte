import type { Metadata, Viewport } from "next";
import { getTenant } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "サロンカルテ",
  description: "サロン向け顧客カルテ管理 — リピート率アップのための一元管理",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();

  return (
    <html lang="ja">
      {/* 業種テーマ色は data-salon で切り替える（CSS変数のみ差し替え） */}
      <body data-salon={tenant?.salonType} className="min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
