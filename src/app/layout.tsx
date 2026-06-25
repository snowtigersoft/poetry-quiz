import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ?? "古诗文刷题",
  description: "专为小学生古诗文大会备赛设计的刷题网站",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh">
      <body className="antialiased">{children}</body>
    </html>
  )
}
