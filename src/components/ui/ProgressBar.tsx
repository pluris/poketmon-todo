export function ProgressBar({
  value,
  color = "#FFB84D",
  className = "",
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`h-2.5 overflow-hidden rounded-full bg-black/5 ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeValue)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${safeValue}%`, backgroundColor: color }}
      />
    </div>
  );
}
