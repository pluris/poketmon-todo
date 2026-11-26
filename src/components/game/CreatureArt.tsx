"use client";

import type { Accessory, Form, Mood, Palette } from "@/game/types";

interface CreatureArtProps {
  form: Form;
  mood?: Mood;
  size?: number;
  className?: string;
}

function bodyPath(shape: Form["shape"]): string {
  switch (shape) {
    case "drop":
      return "M110 26c26 38 60 64 60 96 0 34-27 56-60 56s-60-22-60-56c0-32 34-58 60-96Z";
    case "leaf":
      return "M110 30c8 10 22 12 36 18 24 9 38 29 38 54 0 38-32 68-74 68S36 140 36 102c0-25 14-45 38-54 14-6 28-8 36-18Z";
    default:
      return "M110 38c40 0 70 30 70 68 0 40-30 66-70 66s-70-26-70-66c0-38 30-68 70-68Z";
  }
}

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "sleepy") {
    return (
      <g
        fill="none"
        stroke="#3D3229"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M80 102q8 8 16 0" />
        <path d="M124 102q8 8 16 0" />
      </g>
    );
  }

  if (mood === "bored") {
    return (
      <g
        fill="none"
        stroke="#3D3229"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <path d="M80 102q8-6 16 0" />
        <path d="M124 102q8-6 16 0" />
      </g>
    );
  }

  const big = mood === "happy";

  return (
    <g>
      <g className="eye-blink">
        <ellipse
          cx="88"
          cy="100"
          rx={big ? 8 : 7}
          ry={big ? 10 : 9}
          fill="#3D3229"
        />
        <circle cx="85" cy="97" r="2.4" fill="#fff" />
      </g>
      <g className="eye-blink">
        <ellipse
          cx="132"
          cy="100"
          rx={big ? 8 : 7}
          ry={big ? 10 : 9}
          fill="#3D3229"
        />
        <circle cx="129" cy="97" r="2.4" fill="#fff" />
      </g>
      {mood === "grumpy" ? (
        <g stroke="#3D3229" strokeWidth="4" strokeLinecap="round">
          <path d="M79 88l16 6" />
          <path d="M141 88l-16 6" />
        </g>
      ) : null}
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case "happy":
      return (
        <g>
          <path
            d="M94 122q16 18 32 0"
            fill="none"
            stroke="#3D3229"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path d="M101 128q9 7 18 0" fill="#FF8A8A" opacity="0.85" />
        </g>
      );
    case "bored":
      return (
        <path
          d="M100 126h20"
          stroke="#3D3229"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      );
    case "grumpy":
      return (
        <path
          d="M98 130q12-10 24 0"
          fill="none"
          stroke="#3D3229"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      );
    case "sleepy":
      return (
        <ellipse cx="110" cy="128" rx="5" ry="4" fill="#3D3229" opacity="0.8" />
      );
    default:
      return (
        <path
          d="M100 124q10 8 20 0"
          fill="none"
          stroke="#3D3229"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      );
  }
}

function AccessoryArt({
  accessory,
  palette,
}: {
  accessory: Accessory;
  palette: Palette;
}) {
  switch (accessory) {
    case "flame":
      return (
        <g>
          <path
            d="M110 20c12 14 9 25 0 32-9-7-12-18 0-32Z"
            fill={palette.accent}
          />
          <path
            d="M110 29c6 8 4 13 0 17-4-4-6-9 0-17Z"
            fill={palette.belly}
          />
        </g>
      );
    case "fin":
      return (
        <path
          d="M110 26c-10 12-10 22 0 30 10-8 10-18 0-30Z"
          fill={palette.accent}
          opacity="0.9"
        />
      );
    case "sprout":
      return (
        <g>
          <path
            d="M110 44V20"
            stroke={palette.accent}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M110 30c-12-12-24-8-26 0 10 8 20 8 26 0Z"
            fill={palette.accent}
          />
          <path
            d="M110 26c12-12 24-8 26 0-10 8-20 8-26 0Z"
            fill={palette.accent}
            opacity="0.85"
          />
        </g>
      );
    case "horn":
      return <path d="M110 24l14 26h-28z" fill={palette.accent} />;
    case "star":
      return (
        <path
          d="M158 60l3.5 8 8.5 3.5-8.5 3.5-3.5 8.5-3.5-8.5-8.5-3.5 8.5-3.5z"
          fill={palette.accent}
          className="animate-sparkle"
        />
      );
    case "heart":
      return (
        <path
          d="M110 142c-12-9-18-16-18-24 0-7 5-11 11-11 4 0 7 2 7 5 0-3 3-5 7-5 6 0 11 4 11 11 0 8-6 15-18 24Z"
          fill={palette.accent}
          opacity="0.9"
        />
      );
    case "glasses":
      return (
        <g fill="none" stroke={palette.accent} strokeWidth="4">
          <circle cx="88" cy="100" r="14" />
          <circle cx="132" cy="100" r="14" />
          <path d="M102 100h16" />
        </g>
      );
    case "flower":
      return (
        <g>
          {[
            [0, -12],
            [11, -4],
            [7, 10],
            [-7, 10],
            [-11, -4],
          ].map(([dx, dy]) => (
            <circle
              key={`${dx}-${dy}`}
              cx={110 + dx}
              cy={48 + dy}
              r="8"
              fill={palette.accent}
            />
          ))}
          <circle cx="110" cy="48" r="6" fill={palette.belly} />
        </g>
      );
    case "bolt":
      return (
        <path
          d="M154 108l-10 16h7l-5 14 14-19h-8l6-11z"
          fill={palette.accent}
        />
      );
    case "leaf":
      return (
        <g>
          <path
            d="M110 44V20"
            stroke={palette.accent}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M110 28c-16-10-26-2-24 8 12 6 20 2 24-8Z"
            fill={palette.accent}
          />
        </g>
      );
    default:
      return null;
  }
}

export function CreatureArt({
  form,
  mood = "happy",
  size = 220,
  className = "",
}: CreatureArtProps) {
  const { palette } = form;

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={form.name}
    >
      <ellipse cx="110" cy="194" rx="56" ry="10" fill="#000" opacity="0.08" />

      <path
        d={bodyPath(form.shape)}
        fill={palette.body}
        stroke={palette.accent}
        strokeOpacity="0.16"
        strokeWidth="3"
      />

      <ellipse
        cx="110"
        cy="132"
        rx="40"
        ry="33"
        fill={palette.belly}
        opacity="0.92"
      />

      <ellipse cx="84" cy="174" rx="15" ry="8" fill={palette.accent} opacity="0.45" />
      <ellipse cx="136" cy="174" rx="15" ry="8" fill={palette.accent} opacity="0.45" />

      <ellipse
        cx="82"
        cy="68"
        rx="15"
        ry="9"
        fill="#fff"
        opacity="0.28"
        transform="rotate(-22 82 68)"
      />

      <circle cx="74" cy="118" r="9" fill={palette.cheek} opacity="0.8" />
      <circle cx="146" cy="118" r="9" fill={palette.cheek} opacity="0.8" />

      <Eyes mood={mood} />
      <Mouth mood={mood} />
      <AccessoryArt accessory={form.accessory} palette={palette} />

      {mood === "happy" ? (
        <g className="animate-sparkle" fill={palette.accent}>
          <path d="M168 76l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" />
          <circle cx="54" cy="82" r="3" />
        </g>
      ) : null}

      {mood === "sleepy" ? (
        <g
          fill={palette.accent}
          fontFamily="sans-serif"
          fontWeight="800"
          opacity="0.8"
        >
          <text x="158" y="70" fontSize="20">
            z
          </text>
          <text x="174" y="52" fontSize="14">
            z
          </text>
        </g>
      ) : null}
    </svg>
  );
}
