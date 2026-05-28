import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "補助金見込み顧客管理ツール",
  description: "補助金・助成金の対象になりそうな企業を管理する社内ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
