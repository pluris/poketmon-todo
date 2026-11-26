"use client";

import { CATEGORY_META, DIFFICULTY_META } from "@/game/content";
import type { Task, TaskStatus } from "@/game/types";

export function TaskRow({
  task,
  status,
  rejected = false,
  onComplete,
  compact = false,
}: {
  task: Task;
  status: TaskStatus;
  rejected?: boolean;
  onComplete: () => void;
  compact?: boolean;
}) {
  const category = CATEGORY_META[task.category];
  const reward = DIFFICULTY_META[task.difficulty];
  const done = status === "approved";
  const pending = status === "pending";

  return (
    <div
      className={`card-tight flex items-center gap-3 p-3 ${
        pending ? "border-sun/30 bg-[#FFF8E5]" : ""
      }`}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
        style={{ backgroundColor: category.soft }}
        aria-hidden
      >
        {task.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={`truncate font-extrabold ${
              done ? "text-ink-soft line-through" : ""
            }`}
          >
            {task.title}
          </p>
          {rejected && !done && !pending ? (
            <span className="shrink-0 rounded-full bg-pink/20 px-1.5 py-0.5 text-[10px] font-extrabold text-pink">
              다시 도전
            </span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-bold text-ink-soft">
          <span style={{ color: category.color }}>
            {category.emoji} {category.label}
          </span>
          <span aria-hidden>·</span>
          <span>+{reward.xp} XP</span>
          {task.requiresApproval && !compact ? (
            <>
              <span aria-hidden>·</span>
              <span>엄마 확인</span>
            </>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={done || pending}
        aria-label={`${task.title} 완료하기`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold transition ${
          done
            ? "bg-mint text-white"
            : pending
              ? "animate-pulse-soft bg-sun/30 text-sun-deep"
              : "border-2 border-ink/10 bg-white text-ink/25 hover:border-sun hover:text-sun"
        }`}
      >
        {done ? "✓" : pending ? "⏳" : "✓"}
      </button>
    </div>
  );
}
