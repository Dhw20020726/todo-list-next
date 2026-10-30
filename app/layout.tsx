import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "任务看板",
  description: "一个可以拖拽的任务看板",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex gap-4 p-4 border-b border-gray-200">
          <Link href="/" className="font-medium hover:text-gray-600">
            看板
          </Link>
          <Link href="/trash" className="font-medium hover:text-gray-600">
            回收站
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
