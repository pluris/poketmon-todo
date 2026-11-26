"use client";

import Link from "next/link";
import { useState } from "react";
import { CreatureArt } from "@/components/game/CreatureArt";
import { Confetti } from "@/components/ui/Confetti";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/use-toast";
import { CATEGORY_META, getCreatureForm, getLine } from "@/game/content";
import {
  canEvolve,
  completionForTask,
  dateKey,
  moodOf,
  taskStatus,
  tasksForDay,
  xpToNext,
} from "@/game/engine";
import type { CareAction, Category, Mood } from "@/game/types";
import { useGameStore } from "@/store/game-store";
import { EvolutionModal } from "./EvolutionModal";
import { KidGate } from "./KidGate";
import { KidShell } from "./KidShell";
import { StatBar } from "./StatBar";
import { TaskRow } from "./TaskRow";

const CARE_ACTIONS: Array<{
  action: CareAction;
  emoji: string;
  label: string;
  cost: number;
}> = [
  { action: "feed", emoji: "🍙", label: "밥", cost: 5 },
  { action: "play", emoji: "🎈", label: "놀이", cost: 0 },
  { action: "wash", emoji: "🛁", label: "씻기", cost: 0 },
  { action: "rest", emoji: "🌙", label: "쉬기", cost: 0 },
];

const MOOD_LABEL: Record<Mood, string> = {
  happy: "아주 신나요",
  calm: "평온해요",
  bored: "심심해요",
  grumpy: "삐쳤어요",
  sleepy: "졸려요",
};

const TRAINING_ORDER: Category[] = ["strength", "wisdom", "heart"];

export function KidHome() {
  return (
    <KidGate>
      <HomeContent />
    </KidGate>
  );
}

function HomeContent() {
  const state = useGameStore();
  const { toast, show } = useToast();
  const [burst, setBurst] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const [evolutionOpen, setEvolutionOpen] = useState(false);

  const creature = state.creature;
  if (!creature) return null;

  const line = getLine(creature.lineId);
  const form = getCreatureForm(creature);
  const mood = moodOf(creature.care);
  const today = dateKey();
  const todays = tasksForDay(state.tasks, today);
  const doneCount = todays.filter(
    (task) => taskStatus(state.completions, task, today) === "approved",
  ).length;
  const pendingCount = todays.filter(
    (task) => taskStatus(state.completions, task, today) === "pending",
  ).length;
  const progress = todays.length > 0 ? (doneCount / todays.length) * 100 : 0;
  const xpNeeded = xpToNext(creature.level);
  const xpPercent = Math.min(100, (creature.xp / xpNeeded) * 100);
  const evolutionReady = canEvolve(creature);
  const evolved = creature.stage === 2;

  function flashBurst(emoji: string) {
    setBurst(emoji);
    window.setTimeout(() => setBurst(null), 1100);
  }

  function handleCare(action: CareAction, emoji: string) {
    const result = state.care(action);
    show(result.message, result.ok ? "💛" : "💡");
    if (result.ok) flashBurst(emoji);
  }

  function handleComplete(taskId: string) {
    const result = state.completeTask(taskId);
    show(result.message, result.ok ? "🎉" : "💡");
    if (result.ok) setCelebrate((value) => value + 1);
  }

  function handleEvolve() {
    const result = state.evolve();
    show(result.message, result.ok ? "✨" : "💡");
    if (result.ok) {
      setEvolutionOpen(true);
      setCelebrate((value) => value + 1);
    }
  }

  return (
    <KidShell>
      <section className="card mt-2 overflow-hidden">
        <div className="habitat-sky relative h-[300px] overflow-hidden">
          <div
            className="absolute right-7 top-6 h-12 w-12 rounded-full bg-sun/90 shadow-[0_0_38px_rgba(255,184,77,0.7)]"
            aria-hidden
          />
          <div
            className="absolute left-6 top-9 h-7 w-20 rounded-full bg-white/70"
            aria-hidden
          />
          <div
            className="absolute left-14 top-6 h-7 w-12 rounded-full bg-white/70"
            aria-hidden
          />
          <div
            className="absolute right-24 top-20 h-5 w-12 rounded-full bg-white/50"
            aria-hidden
          />
          <div className="habitat-ground absolute inset-x-0 bottom-0 h-24" aria-hidden />
          <div
            className="absolute -bottom-10 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-[50%] bg-[#b8e58f]"
            aria-hidden
          />

          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
            <div className="relative">
              {burst ? (
                <span
                  className="care-burst absolute left-1/2 top-4 -translate-x-1/2 text-3xl"
                  aria-hidden
                >
                  {burst}
                </span>
              ) : null}
              <CreatureArt
                form={form}
                mood={mood}
                size={228}
                className="animate-floaty drop-shadow-[0_18px_16px_rgba(61,50,41,0.16)]"
              />
            </div>
            <div className="-mt-1 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-1.5 shadow-sm">
              <span className="text-sm font-extrabold">{creature.nickname}</span>
              <span className="rounded-full bg-sun px-2 py-0.5 text-[11px] font-extrabold">
                Lv.{creature.level}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-ink-soft">
            <span>친밀도 💗 {Math.round(creature.bond)}</span>
            <span>
              다음 레벨까지 {Math.max(0, xpNeeded - Math.round(creature.xp))} XP
            </span>
          </div>
          <div className="mt-2 space-y-2">
            <ProgressBar value={xpPercent} color="#FFB84D" />
            <ProgressBar value={creature.bond} color="#FF9EC2" />
          </div>
        </div>
      </section>

      <section className="card mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-extrabold">몬스터 상태</h2>
          <span className="rounded-full bg-cream-deep px-3 py-1 text-[11px] font-extrabold text-ink-soft">
            {MOOD_LABEL[mood]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <StatBar
            label="포만감"
            emoji="🍙"
            value={creature.care.fullness}
            color="#FFB84D"
          />
          <StatBar
            label="기분"
            emoji="😊"
            value={creature.care.mood}
            color="#FF9EC2"
          />
          <StatBar
            label="청결"
            emoji="🫧"
            value={creature.care.hygiene}
            color="#8ECDF5"
          />
          <StatBar
            label="기력"
            emoji="⚡"
            value={creature.care.energy}
            color="#7FD6B2"
          />
        </div>
      </section>

      <section className="card mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-extrabold">돌봄</h2>
          <span className="text-[11px] font-extrabold text-ink-soft">
            🪙 {state.coins}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CARE_ACTIONS.map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => handleCare(item.action, item.emoji)}
              className="btn-chunky flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-[11px] font-extrabold"
            >
              <span className="text-2xl" aria-hidden>
                {item.emoji}
              </span>
              <span>{item.label}</span>
              <span className="text-[10px] font-bold text-ink-soft">
                {item.cost > 0 ? `🪙 ${item.cost}` : "무료"}
              </span>
            </button>
          ))}
        </div>
      </section>

      {evolutionReady ? (
        <button
          type="button"
          onClick={handleEvolve}
          className="btn-chunky mt-4 flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-lilac to-pink px-5 py-4 text-left text-white"
        >
          <div>
            <p className="text-xs font-extrabold text-white/90">진화 준비 완료!</p>
            <p className="text-lg font-extrabold">새로운 모습을 만나러 갈까?</p>
          </div>
          <span className="text-3xl" aria-hidden>
            ✨
          </span>
        </button>
      ) : null}

      <section className="card mt-4 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-extrabold">오늘의 할 일</h2>
            <p className="mt-0.5 text-[11px] font-bold text-ink-soft">
              {doneCount}/{todays.length} 완료
              {pendingCount > 0 ? ` · 확인 중 ${pendingCount}개` : ""}
            </p>
          </div>
          <Link
            href="/kid/tasks"
            className="text-[11px] font-extrabold text-sun-deep"
          >
            전체 보기 →
          </Link>
        </div>

        <ProgressBar value={progress} className="mt-3" />

        <div className="mt-3 space-y-2">
          {todays.slice(0, 3).map((task) => {
            const status = taskStatus(state.completions, task, today);
            const latest = completionForTask(state.completions, task, today);
            return (
              <TaskRow
                key={task.id}
                task={task}
                status={status}
                rejected={latest?.status === "rejected"}
                onComplete={() => handleComplete(task.id)}
                compact
              />
            );
          })}
        </div>

        {todays.length === 0 ? (
          <div className="rounded-2xl bg-cream p-4 text-center text-sm font-bold text-ink-soft">
            오늘은 할 일이 없어요.
            <br />
            엄마가 미션을 준비 중이에요.
          </div>
        ) : null}

        <Link
          href="/kid/tasks"
          className="btn-chunky mt-3 block rounded-2xl bg-sun py-3 text-center text-sm font-extrabold text-ink"
        >
          할 일 하러 가기
        </Link>
      </section>

      {evolved ? (
        <section className="card mt-4 flex items-center gap-3 p-4">
          <span className="text-3xl" aria-hidden>
            🌟
          </span>
          <div>
            <p className="font-extrabold">{form.name}!</p>
            <p className="text-[11px] font-bold text-ink-soft">
              새로운 모습으로 진화했어요!
            </p>
            <p className="text-[11px] font-bold text-ink-soft">
              도감에서 진화 계보를 확인해봐.
            </p>
          </div>
        </section>
      ) : (
        <section className="card mt-4 p-4">
          <h2 className="text-base font-extrabold">다음 진화</h2>
          <p className="mt-1 text-[11px] font-bold text-ink-soft">
            {evolutionReady
              ? "진화 준비 완료! 새로운 모습을 만나러 갈까?"
              : "레벨 5와 친밀도 30을 채우면 진화할 수 있어요."}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-cream p-3">
              <p className="text-[11px] font-extrabold text-ink-soft">레벨</p>
              <p className="text-lg font-extrabold">{creature.level} / 5</p>
              <ProgressBar
                value={Math.min(100, (creature.level / 5) * 100)}
                color="#FFB84D"
                className="mt-2"
              />
            </div>
            <div className="rounded-2xl bg-cream p-3">
              <p className="text-[11px] font-extrabold text-ink-soft">친밀도</p>
              <p className="text-lg font-extrabold">
                {Math.round(creature.bond)} / 30
              </p>
              <ProgressBar
                value={Math.min(100, (creature.bond / 30) * 100)}
                color="#FF9EC2"
                className="mt-2"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {TRAINING_ORDER.map((key) => {
              const meta = CATEGORY_META[key];
              return (
                <div
                  key={key}
                  className="rounded-2xl p-2 text-center"
                  style={{ backgroundColor: meta.soft }}
                >
                  <p className="text-[10px] font-extrabold text-ink-soft">
                    {meta.emoji} {meta.label}
                  </p>
                  <p
                    className="text-base font-extrabold"
                    style={{ color: meta.color }}
                  >
                    {creature.training[key]}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] font-bold text-ink-soft">{line.hint}</p>
        </section>
      )}

      <Toast toast={toast} />
      {celebrate > 0 ? <Confetti key={celebrate} count={26} /> : null}
      <EvolutionModal
        open={evolutionOpen}
        onClose={() => setEvolutionOpen(false)}
        line={line}
        branch={creature.branch}
      />
    </KidShell>
  );
}
