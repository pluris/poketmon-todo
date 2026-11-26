import type { CareStats } from "@/game/types";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function StatBar({
  label,
  emoji,
  value,
  color,
}: {
  label: string;
  emoji: string;
  value: CareStats[keyof Omit<CareStats, "lastTick">];
  color: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-extrabold">
        <span className="text-ink-soft">
          <span aria-hidden>{emoji}</span> {label}
        </span>
        <span>{Math.round(value)}</span>
      </div>
      <ProgressBar value={value} color={color} />
    </div>
  );
}
