"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useGameStore } from "@/store/game-store";

const TABS = [
  { href: "/kid", label: "홈", emoji: "🏠" },
  { href: "/kid/tasks", label: "할 일", emoji: "✅" },
  { href: "/kid/dex", label: "도감", emoji: "📖" },
];

export function KidShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const childName = useGameStore((state) => state.childName);
  const coins = useGameStore((state) => state.coins);

  return (
    <div className="min-h-dvh pb-28">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 pb-2 pt-5">
        <div>
          <p className="text-[11px] font-bold text-ink-soft">오늘도 반가워!</p>
          <h1 className="text-xl font-extrabold tracking-tight">
            {childName}의 하비타트
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 px-3 py-2 text-sm font-extrabold shadow-sm">
          <span aria-hidden>🪙</span>
          <span>{coins}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4">{children}</main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-[min(94vw,30rem)] -translate-x-1/2 pb-safe">
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-3xl border border-white/70 bg-white/90 p-2 shadow-[0_10px_30px_rgba(61,50,41,0.14)] backdrop-blur">
          {TABS.map((tab) => {
            const active =
              tab.href === "/kid"
                ? pathname === "/kid"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-extrabold transition ${
                  active
                    ? "bg-sun text-ink shadow-sm"
                    : "text-ink-soft hover:bg-cream"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {tab.emoji}
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
