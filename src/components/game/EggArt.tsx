"use client";

import { useId } from "react";
import type { EggPattern, Palette } from "@/game/types";

interface EggArtProps {
  palette: Palette;
  pattern: EggPattern;
  size?: number;
  className?: string;
}

export function EggArt({
  palette,
  pattern,
  size = 180,
  className = "",
}: EggArtProps) {
  const clipId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="알"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M110 30c36 0 62 36 62 84 0 44-28 70-62 70s-62-26-62-70c0-48 26-84 62-84Z" />
        </clipPath>
      </defs>

      <ellipse cx="110" cy="196" rx="52" ry="9" fill="#000" opacity="0.08" />

      <path
        d="M110 30c36 0 62 36 62 84 0 44-28 70-62 70s-62-26-62-70c0-48 26-84 62-84Z"
        fill={palette.body}
      />

      <g clipPath={`url(#${clipId})`}>
        {pattern === "dot" ? (
          <g fill={palette.belly} opacity="0.9">
            <circle cx="86" cy="118" r="11" />
            <circle cx="132" cy="104" r="7" />
            <circle cx="120" cy="150" r="9" />
            <circle cx="78" cy="154" r="6" />
            <circle cx="146" cy="136" r="5" />
          </g>
        ) : null}

        {pattern === "wave" ? (
          <g
            fill="none"
            stroke={palette.belly}
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.85"
          >
            <path d="M52 116q14-12 28 0t28 0 28 0 28 0 28 0" />
            <path d="M52 142q14-12 28 0t28 0 28 0 28 0 28 0" opacity="0.7" />
          </g>
        ) : null}

        {pattern === "leaf" ? (
          <g fill={palette.belly} opacity="0.9">
            <path d="M84 120c-14-12-24-2-20 10 12 6 20 0 20-10Z" />
            <path d="M130 104c14-12 24-2 20 10-12 6-20 0-20-10Z" />
            <path d="M110 150c-12-10-20-2-17 8 10 5 17 0 17-8Z" />
          </g>
        ) : null}
      </g>

      <ellipse
        cx="88"
        cy="88"
        rx="16"
        ry="26"
        fill="#fff"
        opacity="0.22"
        transform="rotate(-20 88 88)"
      />

      <path
        d="M110 30c36 0 62 36 62 84 0 44-28 70-62 70s-62-26-62-70c0-48 26-84 62-84Z"
        fill="none"
        stroke={palette.accent}
        strokeOpacity="0.2"
        strokeWidth="3"
      />
    </svg>
  );
}
