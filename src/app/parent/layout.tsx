import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pleco for Mom — 미션 관리",
  description: "아이의 오늘 미션을 만들고 완료를 확인해요.",
  manifest: "/parent-manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#5B8DEF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function ParentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
