import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pleco — 나의 몬스터",
  description: "오늘의 할 일을 해내고 몬스터를 키워요.",
  manifest: "/kid-manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FFB84D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function KidLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
