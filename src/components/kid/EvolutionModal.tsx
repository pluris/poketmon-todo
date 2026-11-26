"use client";

import { CreatureArt } from "@/components/game/CreatureArt";
import type { Category, SpeciesLine } from "@/game/types";

export function EvolutionModal({
  open,
  onClose,
  line,
  branch,
}: {
  open: boolean;
  onClose: () => void;
  line: SpeciesLine;
  branch?: Category;
}) {
  if (!open || !branch) return null;

  const before = line.base;
  const after = line.branches[branch];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evolution-title"
    >
      <div className="w-full max-w-md animate-pop-in rounded-[2rem] border-2 border-white/70 bg-cream p-6 text-center shadow-2xl">
        <p className="text-[11px] font-extrabold tracking-[0.24em] text-sun-deep">
          EVOLUTION!
        </p>
        <h2 id="evolution-title" className="mt-1 text-2xl font-extrabold">
          새로운 모습으로 진화했어요!
        </h2>

        <div className="mt-4 flex items-center justify-center gap-1">
          <div className="opacity-55">
            <CreatureArt form={before} mood="calm" size={86} />
          </div>
          <span className="text-2xl text-sun-deep" aria-hidden>
            ✨→
          </span>
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full bg-sun/30 blur-2xl"
              aria-hidden
            />
            <CreatureArt
              form={after}
              mood="happy"
              size={148}
              className="relative animate-floaty"
            />
          </div>
        </div>

        <p className="mt-2 text-xl font-extrabold">{after.name}</p>
        <p className="mt-1 text-xs font-bold text-ink-soft">{after.tagline}</p>

        <button
          type="button"
          onClick={onClose}
          className="btn-chunky mt-5 w-full rounded-2xl bg-sun py-3.5 text-base font-extrabold text-ink"
        >
          확인
        </button>
      </div>
    </div>
  );
}
