"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ToastState {
  id: number;
  message: string;
  emoji?: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback((message: string, emoji?: string) => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, emoji });
    timer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return { toast, show };
}
