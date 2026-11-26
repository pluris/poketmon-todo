import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { StorageSync } from "@/components/StorageSync";

export const metadata: Metadata = {
  title: "Pleco — 나의 몬스터",
  description: "아이의 할 일이 몬스터의 성장이 되는 키즈 라이프 게임",
  applicationName: "Pleco",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pleco",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8EC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <StorageSync />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
