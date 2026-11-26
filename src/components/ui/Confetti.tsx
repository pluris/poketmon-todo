"use client";

import { useMemo, type CSSProperties } from "react";

const COLORS = ["#FFB84D", "#FF8A5B", "#7FD6B2", "#8ECDF5", "#FF9EC2", "#B9A7FF"];

export function Confetti({ count = 30 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.4 + Math.random() * 1.1,
        color: COLORS[index % COLORS.length],
        size: 6 + Math.random() * 8,
        drift: `${(Math.random() - 0.5) * 180}px`,
        radius: Math.random() > 0.5 ? "50%" : "2px",
      })),
    [count],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 1.4,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              borderRadius: piece.radius,
              "--drift": piece.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
