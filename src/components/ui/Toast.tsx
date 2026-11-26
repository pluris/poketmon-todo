"use client";

import type { ToastState } from "@/hooks/use-toast";

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="pointer-events-none fixed bottom-24 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 animate-pop-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-center text-sm font-bold text-white shadow-xl">
        {toast.emoji ? <span aria-hidden>{toast.emoji}</span> : null}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
