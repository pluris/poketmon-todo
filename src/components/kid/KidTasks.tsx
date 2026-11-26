"use client";

import { useState } from "react";
import { Confetti } from "@/components/ui/Confetti";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/use-toast";
import {
  completionForTask,
  dateKey,
  taskStatus,
  tasksForDay,
} from "@/game/engine";
import { useGameStore } from "@/store/game-store";
import { KidGate } from "./KidGate";
import { KidShell } from "./KidShell";
import { TaskRow } from "./TaskRow";

const STATUS_RANK = { pending: 0, todo: 1, approved: 2 } as const;

export function KidTasks() {
  return (
    <KidGate>
      <TasksContent />
    </KidGate>
  );
}

function TasksContent() {
  const state = useGameStore();
  const { toast, show } = useToast();
  const [celebrate, setCelebrate] = useState(0);

  const today = dateKey();
  const todays = tasksForDay(state.tasks, today);
  const doneCount = todays.filter(
    (task) => taskStatus(state.completions, task, today) === "approved",
  ).length;
  const pendingCount = todays.filter(
    (task) => taskStatus(state.completions, task, today) === "pending",
  ).length;
  const progress = todays.length > 0 ? (doneCount / todays.length) * 100 : 0;

  const ordered = [...todays].sort((a, b) => {
    const statusA = taskStatus(state.completions, a, today);
    const statusB = taskStatus(state.completions, b, today);
    return STATUS_RANK[statusA] - STATUS_RANK[statusB];
  });

  function handleComplete(taskId: string) {
    const result = state.completeTask(taskId);
    show(result.message, result.ok ? "🎉" : "💡");
    if (result.ok) setCelebrate((value) => value + 1);
  }

  return (
    <KidShell>
      <section className="card mt-2 p-5">
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-sun-deep">
          TODAY
        </p>
        <h1 className="mt-1 text-2xl font-extrabold">오늘의 할 일</h1>
        <p className="mt-1 text-xs font-bold text-ink-soft">
          하나씩 해내면 몬스터가 쑥쑥 자라요.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-cream">
            <span className="text-lg font-extrabold">{doneCount}</span>
            <span className="text-[10px] font-bold text-ink-soft">
              / {todays.length}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <ProgressBar value={progress} />
            <p className="mt-2 text-[11px] font-bold text-ink-soft">
              {doneCount === todays.length && todays.length > 0
                ? "오늘 미션 모두 완료! 정말 멋져요 🎉"
                : `${todays.length - doneCount}개 남았어요`}
              {pendingCount > 0 ? ` · 엄마 확인 중 ${pendingCount}개` : ""}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-white/70 bg-white/60 p-3 text-[11px] font-bold text-ink-soft">
        <span className="text-lg" aria-hidden>
          💡
        </span>
        <p>
          엄마가 확인하는 미션은 확인 후에 보상이 들어와요. 기다리는 동안 다른
          미션을 먼저 해봐!
        </p>
      </div>

      {ordered.length > 0 ? (
        <div className="mt-4 space-y-2">
          {ordered.map((task) => {
            const status = taskStatus(state.completions, task, today);
            const latest = completionForTask(state.completions, task, today);
            return (
              <TaskRow
                key={task.id}
                task={task}
                status={status}
                rejected={latest?.status === "rejected"}
                onComplete={() => handleComplete(task.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="card mt-4 p-8 text-center">
          <div className="text-5xl" aria-hidden>
            🥚
          </div>
          <p className="mt-3 text-lg font-extrabold">오늘은 할 일이 없어요</p>
          <p className="mt-1 text-xs font-bold text-ink-soft">
            엄마가 새로운 미션을 준비 중이에요.
          </p>
        </div>
      )}

      <Toast toast={toast} />
      {celebrate > 0 ? <Confetti key={celebrate} count={26} /> : null}
    </KidShell>
  );
}
