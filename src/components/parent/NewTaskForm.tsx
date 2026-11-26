"use client";

import { useState } from "react";
import {
  CATEGORY_META,
  DIFFICULTY_META,
  TASK_EMOJIS,
} from "@/game/content";
import type { Category, Difficulty, TaskSchedule } from "@/game/types";
import { useGameStore } from "@/store/game-store";

const TEMPLATES: Array<{
  title: string;
  emoji: string;
  category: Category;
  difficulty: Difficulty;
}> = [
  { title: "양치하기", emoji: "🦷", category: "heart", difficulty: "easy" },
  { title: "숙제하기", emoji: "📚", category: "wisdom", difficulty: "normal" },
  { title: "방 정리하기", emoji: "🧹", category: "heart", difficulty: "easy" },
  { title: "운동하기", emoji: "🏃", category: "strength", difficulty: "normal" },
];

const CATEGORIES: Category[] = ["strength", "wisdom", "heart"];
const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export function NewTaskForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const addTask = useGameStore((state) => state.addTask);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📚");
  const [category, setCategory] = useState<Category>("wisdom");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [schedule, setSchedule] = useState<TaskSchedule>("daily");
  const [requiresApproval, setRequiresApproval] = useState(false);

  const reward = DIFFICULTY_META[difficulty];

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    setTitle(template.title);
    setEmoji(template.emoji);
    setCategory(template.category);
    setDifficulty(template.difficulty);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      emoji,
      category,
      difficulty,
      schedule,
      requiresApproval,
    });
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">새 미션 만들기</h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-50"
        >
          닫기
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {TEMPLATES.map((template) => (
          <button
            key={template.title}
            type="button"
            onClick={() => applyTemplate(template)}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-[#5B8DEF]/40 hover:bg-[#5B8DEF]/5"
          >
            {template.emoji} {template.title}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-xs font-bold text-slate-500">
        미션 이름
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={24}
          placeholder="예: 책 10쪽 읽기"
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#5B8DEF] focus:bg-white"
        />
      </label>

      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500">아이콘</p>
        <div className="mt-1.5 grid grid-cols-6 gap-1.5">
          {TASK_EMOJIS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setEmoji(option)}
              className={`flex h-10 items-center justify-center rounded-xl text-xl transition ${
                emoji === option
                  ? "bg-[#5B8DEF]/10 ring-2 ring-[#5B8DEF]"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
              aria-pressed={emoji === option}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500">어떤 능력을 키울까요?</p>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {CATEGORIES.map((option) => {
            const meta = CATEGORY_META[option];
            return (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
                  category === option
                    ? "border-[#5B8DEF] bg-[#5B8DEF]/5"
                    : "border-slate-100 bg-slate-50 text-slate-500"
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500">난이도</p>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {DIFFICULTIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDifficulty(option)}
              className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
                difficulty === option
                  ? "border-[#5B8DEF] bg-[#5B8DEF]/5"
                  : "border-slate-100 bg-slate-50 text-slate-500"
              }`}
            >
              {DIFFICULTY_META[option].label}
              <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
                +{DIFFICULTY_META[option].xp} XP
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold text-slate-500">언제 할까요?</p>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setSchedule("daily")}
            className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
              schedule === "daily"
                ? "border-[#5B8DEF] bg-[#5B8DEF]/5"
                : "border-slate-100 bg-slate-50 text-slate-500"
            }`}
          >
            매일
          </button>
          <button
            type="button"
            onClick={() => setSchedule("once")}
            className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
              schedule === "once"
                ? "border-[#5B8DEF] bg-[#5B8DEF]/5"
                : "border-slate-100 bg-slate-50 text-slate-500"
            }`}
          >
            오늘만
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setRequiresApproval((value) => !value)}
        className={`mt-4 flex w-full items-center justify-between rounded-2xl border-2 p-3 text-left transition ${
          requiresApproval
            ? "border-[#5B8DEF] bg-[#5B8DEF]/5"
            : "border-slate-100 bg-slate-50"
        }`}
        aria-pressed={requiresApproval}
      >
        <span>
          <span className="block text-xs font-bold text-slate-700">
            엄마가 확인해야 보상 지급
          </span>
          <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
            숙제처럼 확인이 필요한 미션에 켜 주세요.
          </span>
        </span>
        <span
          className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
            requiresApproval ? "bg-[#5B8DEF]" : "bg-slate-300"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
              requiresApproval ? "translate-x-5" : ""
            }`}
          />
        </span>
      </button>

      <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
        완료하면 몬스터가 +{reward.xp} XP, +{reward.coins} 코인을 받아요.
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-4 w-full rounded-xl bg-[#5B8DEF] py-3 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        미션 만들기
      </button>
    </form>
  );
}
