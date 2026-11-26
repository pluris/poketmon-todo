"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TASKS, DIFFICULTY_META, getLine } from "@/game/content";
import {
  applyCareAction,
  applyTaskReward,
  canEvolve,
  completionForTask,
  createCreature,
  dateKey,
  decayCare,
  evolveCreature,
  isTaskActiveOn,
  newId,
} from "@/game/engine";
import type {
  ActionResult,
  CareAction,
  Completion,
  GameState,
  Task,
} from "@/game/types";

export const STORAGE_KEY = "pleco:game:v1";

const initialState: GameState = {
  version: 1,
  rev: 0,
  updatedAt: 0,
  childName: "",
  parentPin: null,
  coins: 0,
  tasks: [],
  completions: [],
  creature: null,
  dex: [],
  onboardingComplete: false,
  totalTasksCompleted: 0,
  evolutionCount: 0,
};

export type NewTaskInput = Pick<
  Task,
  "title" | "emoji" | "category" | "difficulty" | "schedule" | "requiresApproval"
> & {
  scheduledDate?: string;
  createdBy?: Task["createdBy"];
};

type GameStore = GameState & {
  onboard: (input: {
    childName: string;
    lineId: string;
    nickname: string;
  }) => void;
  tick: (now?: number) => void;
  completeTask: (taskId: string, now?: number) => ActionResult;
  approveCompletion: (completionId: string, now?: number) => ActionResult;
  rejectCompletion: (completionId: string) => ActionResult;
  care: (action: CareAction) => ActionResult;
  evolve: (now?: number) => ActionResult;
  addTask: (input: NewTaskInput) => Task;
  deleteTask: (taskId: string) => void;
  setParentPin: (pin: string) => void;
  resetGame: () => void;
  syncFromStorage: (raw: string | null) => void;
};

function ok(
  message: string,
  celebration?: ActionResult["celebration"],
): ActionResult {
  return { ok: true, message, celebration };
}

function fail(message: string): ActionResult {
  return { ok: false, message };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      onboard: ({ childName, lineId, nickname }) => {
        const now = Date.now();
        const line = getLine(lineId);
        const creature = createCreature({
          lineId: line.id,
          nickname: nickname.trim() || line.base.name,
          now,
        });

        const existingTasks = get().tasks;
        const tasks =
          existingTasks.length > 0
            ? existingTasks
            : DEFAULT_TASKS.map((task, index) => ({
                ...task,
                id: newId("task"),
                createdAt: now + index,
                createdBy: "default" as const,
              }));

        set({
          childName: childName.trim(),
          creature,
          tasks,
          completions: [],
          coins: 30,
          dex: [line.base.id],
          onboardingComplete: true,
          totalTasksCompleted: 0,
          evolutionCount: 0,
          rev: get().rev + 1,
          updatedAt: now,
        });
      },

      tick: (now = Date.now()) => {
        const state = get();
        if (!state.creature) return;

        const care = decayCare(state.creature.care, now);
        if (
          care.fullness === state.creature.care.fullness &&
          care.mood === state.creature.care.mood &&
          care.hygiene === state.creature.care.hygiene &&
          care.energy === state.creature.care.energy &&
          care.lastTick === state.creature.care.lastTick
        ) {
          return;
        }

        set({
          creature: { ...state.creature, care },
          rev: state.rev + 1,
          updatedAt: now,
        });
      },

      completeTask: (taskId, now = Date.now()) => {
        const state = get();
        if (!state.creature) return fail("먼저 몬스터를 만나요!");

        const task = state.tasks.find((item) => item.id === taskId);
        if (!task) return fail("할 일을 찾을 수 없어요.");

        const day = dateKey(now);
        if (!isTaskActiveOn(task, day)) {
          return fail("오늘의 할 일이 아니에요.");
        }

        const existing = completionForTask(state.completions, task, day);
        if (existing && existing.status !== "rejected") {
          return fail(
            existing.status === "pending"
              ? "엄마가 확인 중이에요! 잠시만 기다려 주세요."
              : "이미 완료했어요!",
          );
        }

        const meta = DIFFICULTY_META[task.difficulty];
        const completion: Completion = {
          id: newId("done"),
          taskId: task.id,
          taskTitle: task.title,
          taskEmoji: task.emoji,
          category: task.category,
          difficulty: task.difficulty,
          date: day,
          status: task.requiresApproval ? "pending" : "approved",
          completedAt: now,
          xp: meta.xp,
          coins: meta.coins,
        };

        let creature = state.creature;
        let coins = state.coins;
        let totalTasksCompleted = state.totalTasksCompleted;
        let message = "엄마가 확인하면 보상을 받아요!";
        let celebration: ActionResult["celebration"] = "task";

        if (!task.requiresApproval) {
          const reward = applyTaskReward(creature, task);
          creature = reward.creature;
          coins += reward.coins;
          totalTasksCompleted += 1;
          message =
            reward.levelsGained > 0
              ? `레벨 ${creature.level}가 되었어요!`
              : "해냈어요! 보상을 받았어요!";
          celebration = reward.levelsGained > 0 ? "levelup" : "task";
        }

        set({
          creature,
          coins,
          totalTasksCompleted,
          completions: [completion, ...state.completions],
          rev: state.rev + 1,
          updatedAt: now,
        });

        return ok(message, celebration);
      },

      approveCompletion: (completionId, now = Date.now()) => {
        const state = get();
        const completion = state.completions.find(
          (item) => item.id === completionId,
        );
        if (!completion || completion.status !== "pending") {
          return fail("승인할 완료가 없어요.");
        }
        if (!state.creature) return fail("아직 몬스터가 없어요.");

        const reward = applyTaskReward(state.creature, completion);
        const completions = state.completions.map((item) =>
          item.id === completionId
            ? { ...item, status: "approved" as const, approvedAt: now }
            : item,
        );

        set({
          creature: reward.creature,
          coins: state.coins + reward.coins,
          completions,
          totalTasksCompleted: state.totalTasksCompleted + 1,
          rev: state.rev + 1,
          updatedAt: now,
        });

        return ok(
          reward.levelsGained > 0
            ? `승인 완료! 레벨 ${reward.creature.level}가 되었어요!`
            : "승인 완료! 아이가 보상을 받았어요.",
          reward.levelsGained > 0 ? "levelup" : "task",
        );
      },

      rejectCompletion: (completionId) => {
        const state = get();
        const completion = state.completions.find(
          (item) => item.id === completionId,
        );
        if (!completion || completion.status !== "pending") {
          return fail("다시 돌려보낼 완료가 없어요.");
        }

        set({
          completions: state.completions.map((item) =>
            item.id === completionId
              ? { ...item, status: "rejected" as const }
              : item,
          ),
          rev: state.rev + 1,
          updatedAt: Date.now(),
        });

        return ok("아이가 다시 도전할 수 있게 했어요.");
      },

      care: (action) => {
        const state = get();
        if (!state.creature) return fail("먼저 몬스터를 만나요!");

        const result = applyCareAction(state.creature, state.coins, action);
        if (!result.ok) return fail(result.message);

        set({
          creature: result.creature,
          coins: result.coins,
          rev: state.rev + 1,
          updatedAt: Date.now(),
        });

        return ok(
          result.bondGain > 0
            ? `${result.message} 친밀도 +${result.bondGain}`
            : result.message,
          "care",
        );
      },

      evolve: (now = Date.now()) => {
        const state = get();
        if (!state.creature) return fail("먼저 몬스터를 만나요!");
        if (!canEvolve(state.creature)) {
          return fail("아직 진화할 준비가 안 됐어요.");
        }

        const { creature } = evolveCreature(state.creature, now);
        set({
          creature,
          dex: Array.from(new Set([...state.dex, creature.speciesId])),
          evolutionCount: state.evolutionCount + 1,
          rev: state.rev + 1,
          updatedAt: now,
        });

        return ok("축하해요! 새로운 모습으로 진화했어요!", "evolution");
      },

      addTask: (input) => {
        const now = Date.now();
        const task: Task = {
          ...input,
          id: newId("task"),
          createdAt: now,
          createdBy: input.createdBy ?? "parent",
          scheduledDate:
            input.schedule === "once"
              ? (input.scheduledDate ?? dateKey(now))
              : undefined,
        };

        set((state) => ({
          tasks: [...state.tasks, task],
          rev: state.rev + 1,
          updatedAt: now,
        }));

        return task;
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
          rev: state.rev + 1,
          updatedAt: Date.now(),
        }));
      },

      setParentPin: (pin) => {
        set((state) => ({
          parentPin: pin,
          rev: state.rev + 1,
          updatedAt: Date.now(),
        }));
      },

      resetGame: () => {
        const pin = get().parentPin;
        set({
          ...initialState,
          parentPin: pin,
          rev: get().rev + 1,
          updatedAt: Date.now(),
        });
      },

      syncFromStorage: (raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as {
            state?: Partial<GameState>;
            version?: number;
          };
          const incoming = parsed.state;
          if (!incoming || incoming.version !== 1) return;
          if (typeof incoming.rev !== "number" || incoming.rev <= get().rev) {
            return;
          }
          set(incoming);
        } catch {
          // 깨진 저장 데이터는 무시해요.
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => {
        const {
          onboard,
          tick,
          completeTask,
          approveCompletion,
          rejectCompletion,
          care,
          evolve,
          addTask,
          deleteTask,
          setParentPin,
          resetGame,
          syncFromStorage,
          ...persisted
        } = state;
        return persisted;
      },
    },
  ),
);
