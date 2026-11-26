"use client";

import { useEffect } from "react";
import { STORAGE_KEY, useGameStore } from "@/store/game-store";

export function StorageSync() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        useGameStore.getState().syncFromStorage(event.newValue);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
