"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/game-store";

export function useGameTick() {
  useEffect(() => {
    const run = () => useGameStore.getState().tick();

    run();
    const interval = window.setInterval(run, 60_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
}
