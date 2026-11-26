"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreatureArt } from "@/components/game/CreatureArt";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/use-toast";
import { useMounted } from "@/hooks/use-mounted";
import {
  CATEGORY_META,
  DIFFICULTY_META,
  getCreatureForm,
} from "@/game/content";
import {
  dateKey,
  moodOf,
  taskStatus,
  tasksForDay,
  timeLabel,
} from "@/game/engine";
import type { Mood, Task, TaskStatus } from "@/game/types";
import { useGameStore } from "@/store/game-store";
import { NewTaskForm } from "./NewTaskForm";
import { PinGate, PinSetup } from "./PinPad";

const SESSION_KEY = "pleco:parent-unlocked";

const TABS = [
  { id: "today" as const, label: "오늘", emoji: "☀️" },
  { id: "tasks" as const, label: "미션", emoji: "📝" },
  { id: "settings" as const, label: "설정", emoji: "⚙️" },
];

const MOOD_LABEL: Record<Mood, string> = {
  happy: "신나요",
  calm: "평온해요",
  bored: "심심해요",
  grumpy: "삐쳤어요",
  sleepy: "졸려요",
};

export function ParentApp() {
  const mounted = useMounted();
  const parentPin = useGameStore((state) => state.parentPin);
  const setParentPin = useGameStore((state) => state.setParentPin);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setUnlocked(true);
  }, []);

  if (!mounted) return <ParentSplash />;

  if (!parentPin) {
    return (
      <PinSetup
        onDone={(pin) => {
          setParentPin(pin);
          sessionStorage.setItem(SESSION_KEY, "1");
          setUnlocked(true);
        }}
      />
    );
  }

  if (!unlocked) {
    return (
      <PinGate
        expected={parentPin}
        onUnlock={() => {
          sessionStorage.setItem(SESSION_KEY, "1");
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <ParentDashboard
      onLock={() => {
        sessionStorage.removeItem(SESSION_KEY);
        setUnlocked(false);
      }}
    />
  );
}

function ParentSplash() {
  return (
    <div className="parent-bg flex min-h-dvh flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B8DEF] text-xl font-extrabold text-white shadow-lg shadow-[#5B8DEF]/30">
        P
      </div>
      <p className="text-sm font-bold text-slate-500">Pleco for Mom</p>
    </div>
  );
}

function StatusChip({ status }: { status: TaskStatus }) {
  const style =
    status === "approved"
      ? "bg-emerald-50 text-emerald-600"
      : status === "pending"
        ? "bg-amber-50 text-amber-600"
        : "bg-slate-100 text-slate-500";
  const label =
    status === "approved" ? "완료" : status === "pending" ? "확인 중" : "할 일";

  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${style}`}
    >
      {label}
    </span>
  );
}

function TaskAdminRow({
  task,
  onDelete,
}: {
  task: Task;
  onDelete: () => void;
}) {
  const meta = CATEGORY_META[task.category];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
        style={{ backgroundColor: meta.soft }}
        aria-hidden
      >
        {task.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">{task.title}</p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
          {meta.label} · {DIFFICULTY_META[task.difficulty].label} ·{" "}
          {task.schedule === "daily" ? "매일" : "오늘만"}
          {task.requiresApproval ? " · 엄마 확인" : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-xl p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
        aria-label={`${task.title} 삭제`}
      >
        🗑️
      </button>
    </div>
  );
}

function ParentDashboard({ onLock }: { onLock: () => void }) {
  const store = useGameStore();
  const { toast, show } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("today");
  const [showForm, setShowForm] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const today = dateKey();
  const todays = tasksForDay(store.tasks, today);
  const doneCount = todays.filter(
    (task) => taskStatus(store.completions, task, today) === "approved",
  ).length;
  const pending = store.completions
    .filter((completion) => completion.status === "pending")
    .sort((a, b) => b.completedAt - a.completedAt);
  const creature = store.creature;
  const form = creature ? getCreatureForm(creature) : null;
  const mood = creature ? moodOf(creature.care) : null;
  const progress = todays.length > 0 ? (doneCount / todays.length) * 100 : 0;

  function handleApprove(completionId: string) {
    const result = store.approveCompletion(completionId);
    show(result.message, result.ok ? "✅" : "⚠️");
  }

  function handleReject(completionId: string) {
    const result = store.rejectCompletion(completionId);
    show(result.message, result.ok ? "↩️" : "⚠️");
  }

  function handleDelete(taskId: string) {
    if (!window.confirm("이 미션을 삭제할까요?")) return;
    store.deleteTask(taskId);
    show("미션을 삭제했어요.", "🗑️");
  }

  function handlePinChange(event: React.FormEvent) {
    event.preventDefault();

    if (!/^\d{4}$/.test(newPin)) {
      setPinMessage("4자리 숫자를 입력해 주세요.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage("두 PIN이 서로 달라요.");
      return;
    }

    store.setParentPin(newPin);
    setNewPin("");
    setConfirmPin("");
    setPinMessage("PIN을 바꿨어요.");
    show("PIN을 바꿨어요.", "🔐");
  }

  function handleReset() {
    if (
      !window.confirm(
        "게임 데이터를 모두 지울까요? 아이의 몬스터와 기록이 사라져요.",
      )
    ) {
      return;
    }
    store.resetGame();
    show("데이터를 초기화했어요.", "🧹");
  }

  return (
    <div className="parent-bg min-h-dvh pb-10">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5B8DEF] text-sm font-extrabold text-white">
              P
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#5B8DEF]">
                Pleco for Mom
              </p>
              <h1 className="text-base font-extrabold text-slate-900">
                우리 아이의 오늘
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onLock}
            className="rounded-full bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-500"
          >
            잠금 🔒
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4">
        <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-sm">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-xl py-2 text-xs font-bold transition ${
                tab === item.id
                  ? "bg-[#5B8DEF] text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <span className="mr-1" aria-hidden>
                {item.emoji}
              </span>
              {item.label}
            </button>
          ))}
        </div>

        {tab === "today" ? (
          <div className="mt-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#5B8DEF] to-[#7B9CFF] p-5 text-white shadow-lg shadow-[#5B8DEF]/20">
              <div className="flex items-center gap-4">
                {form && creature ? (
                  <div className="shrink-0 rounded-2xl bg-white/15 p-1">
                    <CreatureArt form={form} size={82} mood="happy" />
                  </div>
                ) : (
                  <div className="text-4xl" aria-hidden>
                    🥚
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-white/70">
                    우리 아이의 몬스터
                  </p>
                  <p className="truncate text-xl font-extrabold">
                    {creature?.nickname ?? "아직 만나기 전"}
                  </p>
                  <p className="text-[11px] font-medium text-white/80">
                    {creature && mood
                      ? `Lv.${creature.level} · 친밀도 ${Math.round(creature.bond)} · ${MOOD_LABEL[mood]}`
                      : "아이 앱에서 알을 골라 주세요"}
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-white/15 px-3 py-2 text-center">
                  <p className="text-[10px] font-bold text-white/70">오늘</p>
                  <p className="text-lg font-extrabold">
                    {doneCount}/{todays.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] font-bold text-white/80">
                {todays.length === 0
                  ? "오늘 미션을 만들어 볼까요?"
                  : doneCount === todays.length
                    ? "오늘 미션 모두 완료! 정말 멋져요 🎉"
                    : `${todays.length - doneCount}개 남았어요`}
              </p>
            </div>

            {!creature ? (
              <div className="mt-4 rounded-3xl border border-dashed border-[#5B8DEF]/30 bg-[#5B8DEF]/5 p-5 text-center">
                <div className="text-4xl" aria-hidden>
                  🥚
                </div>
                <p className="mt-2 text-sm font-extrabold text-slate-800">
                  아직 아이가 몬스터를 만나지 않았어요
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  아이 태블릿에서 Pleco를 열고 알을 골라 주세요.
                </p>
                <Link
                  href="/kid"
                  className="mt-3 inline-block rounded-xl bg-[#5B8DEF] px-4 py-2 text-[11px] font-bold text-white"
                >
                  이 기기에서 아이 앱 열기
                </Link>
              </div>
            ) : null}

            <section className="mt-5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-extrabold text-slate-900">
                  승인 대기
                </h2>
                {pending.length > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    {pending.length}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 space-y-2">
                {pending.length === 0 ? (
                  <p className="rounded-2xl bg-white p-4 text-center text-xs text-slate-400 shadow-sm">
                    지금은 확인할 미션이 없어요.
                  </p>
                ) : (
                  pending.map((completion) => (
                    <div
                      key={completion.id}
                      className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden>
                          {completion.taskEmoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {completion.taskTitle}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500">
                            {store.childName} · {timeLabel(completion.completedAt)}{" "}
                            · +{completion.xp} XP
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleReject(completion.id)}
                          className="rounded-xl bg-white py-2 text-[11px] font-bold text-slate-500"
                        >
                          다시 하기
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(completion.id)}
                          className="rounded-xl bg-[#39B980] py-2 text-[11px] font-bold text-white"
                        >
                          승인하기
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="mt-5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-extrabold text-slate-900">
                  오늘의 미션
                </h2>
                <span className="text-[11px] font-medium text-slate-400">
                  {doneCount}/{todays.length}
                </span>
              </div>

              <div className="mt-2 divide-y divide-slate-100 rounded-2xl bg-white px-4 shadow-sm">
                {todays.length === 0 ? (
                  <p className="py-5 text-center text-xs text-slate-400">
                    오늘 미션이 없어요. 미션 탭에서 추가해 보세요.
                  </p>
                ) : (
                  todays.map((task) => {
                    const status = taskStatus(store.completions, task, today);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <span className="text-xl" aria-hidden>
                          {task.emoji}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {task.title}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            {task.requiresApproval
                              ? "엄마 확인 필요"
                              : "완료하면 바로 보상"}
                          </p>
                        </div>
                        <StatusChip status={status} />
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        ) : null}

        {tab === "tasks" ? (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  미션 관리
                </h2>
                <p className="text-[11px] font-medium text-slate-400">
                  {store.tasks.length}개의 미션
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm((value) => !value)}
                className="rounded-xl bg-[#5B8DEF] px-3 py-2 text-xs font-bold text-white shadow-sm"
              >
                {showForm ? "닫기" : "+ 새 미션"}
              </button>
            </div>

            {showForm ? (
              <div className="mt-3">
                <NewTaskForm
                  onCreated={() => {
                    setShowForm(false);
                    show("새 미션을 만들었어요.", "📝");
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            ) : null}

            <div className="mt-3 space-y-2">
              {[...store.tasks].reverse().map((task) => (
                <TaskAdminRow
                  key={task.id}
                  task={task}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>

            {store.tasks.length === 0 ? (
              <div className="mt-3 rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="text-4xl" aria-hidden>
                  📝
                </div>
                <p className="mt-2 text-sm font-extrabold text-slate-800">
                  아직 미션이 없어요
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  아이가 매일 할 수 있는 작은 미션부터 만들어 보세요.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "settings" ? (
          <div className="mt-4 space-y-4">
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">엄마 PIN</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                아이가 모르는 4자리 숫자로 바꿀 수 있어요.
              </p>

              <form onSubmit={handlePinChange} className="mt-3 space-y-2">
                <input
                  value={newPin}
                  onChange={(event) =>
                    setNewPin(
                      event.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="새 PIN 4자리"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#5B8DEF] focus:bg-white"
                />
                <input
                  value={confirmPin}
                  onChange={(event) =>
                    setConfirmPin(
                      event.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="한 번 더 입력"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#5B8DEF] focus:bg-white"
                />
                {pinMessage ? (
                  <p
                    className={`text-[11px] font-semibold ${
                      pinMessage.includes("바꿨어요")
                        ? "text-emerald-600"
                        : "text-rose-500"
                    }`}
                  >
                    {pinMessage}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#5B8DEF] py-2.5 text-xs font-bold text-white"
                >
                  PIN 변경
                </button>
              </form>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">가족 연결</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                지금은 같은 기기에서만 아이 앱과 동기화돼요. 다음 업데이트에서
                가족 코드로 엄마 폰과 아이 태블릿을 연결할게요.
              </p>
              <button
                type="button"
                disabled
                className="mt-3 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-400"
              >
                가족 코드 연결 (준비 중)
              </button>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">데이터</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                몬스터, 미션, 완료 기록이 이 기기에 저장돼요.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-500"
              >
                게임 데이터 초기화
              </button>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">아이 앱</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                같은 기기에서 아이 화면을 열어볼 수 있어요.
              </p>
              <Link
                href="/kid"
                className="mt-3 block w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-bold text-white"
              >
                아이 앱 열기
              </Link>
            </section>

            <p className="pb-2 text-center text-[10px] font-medium text-slate-400">
              Pleco v0.1.0 · 아이의 할 일이 몬스터의 성장이 됩니다
            </p>
          </div>
        ) : null}
      </div>

      <Toast toast={toast} />
    </div>
  );
}
