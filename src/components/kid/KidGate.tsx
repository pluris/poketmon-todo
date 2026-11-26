"use client";

import type { ReactNode } from "react";
import { useGameTick } from "@/hooks/use-game-tick";
import { useMounted } from "@/hooks/use-mounted";
import { useGameStore } from "@/store/game-store";
import { Onboarding } from "./Onboarding";

export function KidSplash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <div className="animate-wiggle text-6xl" aria-hidden>
        🥚
      </div>
      <p className="text-sm font-bold text-ink-soft">몬스터를 깨우는 중...</p>
    </div>
  );
}

export function KidGate({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const onboardingComplete = useGameStore((state) => state.onboardingComplete);
  useGameTick();

  if (!mounted) return <KidSplash />;
  if (!onboardingComplete) return <Onboarding />;

  return <>{children}</>;
}
