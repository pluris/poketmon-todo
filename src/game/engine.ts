import { DIFFICULTY_META, getLine } from "./content";
import type {
  CareAction,
  CareStats,
  Category,
  Completion,
  Creature,
  Difficulty,
  Mood,
  SpeciesLine,
  Task,
  TaskStatus,
  Training,
} from "./types";

export const MAX_LEVEL = 30;
export const EVOLVE_LEVEL = 5;
export const EVOLVE_BOND = 30;
export const CARE_FLOOR = 20;

const HOUR = 3_600_000;

const TRAINING_GAIN: Record<Difficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function newId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function dateKey(input: Date | number = new Date()): string {
  const date = typeof input === "number" ? new Date(input) : input;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isTaskActiveOn(task: Task, day: string): boolean {
  if (task.schedule === "daily") return true;
  return task.scheduledDate === day;
}

export function tasksForDay(tasks: Task[], day: string): Task[] {
  return tasks.filter((task) => isTaskActiveOn(task, day));
}

export function xpToNext(level: number): number {
  return 10 + level * 10;
}

export function moodOf(care: CareStats): Mood {
  if (care.energy < 30) return "sleepy";
  if (care.mood < 35) return "grumpy";
  if (care.mood < 55) return "bored";
  if (care.mood >= 80) return "happy";
  return "calm";
}

export function decayCare(care: CareStats, now: number): CareStats {
  const elapsed = now - care.lastTick;
  if (elapsed < 30_000) return care;

  const hour = new Date(now).getHours();
  const sleeping = hour >= 21 || hour < 7;

  // 수면 시간에는 스탯이 줄지 않아요.
  if (sleeping) {
    return { ...care, lastTick: now };
  }

  const hours = Math.min(24, elapsed / HOUR);
  return {
    fullness: clamp(care.fullness - 2 * hours, CARE_FLOOR, 100),
    mood: clamp(care.mood - 1 * hours, CARE_FLOOR, 100),
    hygiene: clamp(care.hygiene - 1 * hours, CARE_FLOOR, 100),
    energy: clamp(care.energy - 1 * hours, CARE_FLOOR, 100),
    lastTick: now,
  };
}

export function createCreature(input: {
  lineId: string;
  nickname: string;
  now: number;
}): Creature {
  const line = getLine(input.lineId);
  return {
    id: newId("mon"),
    lineId: line.id,
    speciesId: line.base.id,
    nickname: input.nickname,
    stage: 1,
    level: 1,
    xp: 0,
    bond: 20,
    training: { strength: 0, wisdom: 0, heart: 0 },
    care: {
      fullness: 100,
      mood: 100,
      hygiene: 100,
      energy: 100,
      lastTick: input.now,
    },
    createdAt: input.now,
  };
}

export function levelUpCreature(creature: Creature): {
  creature: Creature;
  levelsGained: number;
} {
  let level = creature.level;
  let xp = creature.xp;
  let bond = creature.bond;
  let levelsGained = 0;

  while (level < MAX_LEVEL && xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
    levelsGained += 1;
    bond = clamp(bond + 2, 0, 100);
  }

  return {
    creature: { ...creature, level, xp, bond },
    levelsGained,
  };
}

export function applyTaskReward(
  creature: Creature,
  task: Pick<Task, "category" | "difficulty">,
): { creature: Creature; coins: number; levelsGained: number } {
  const meta = DIFFICULTY_META[task.difficulty];
  const training: Training = {
    ...creature.training,
    [task.category]: creature.training[task.category] + TRAINING_GAIN[task.difficulty],
  };

  const rewarded: Creature = {
    ...creature,
    xp: creature.xp + meta.xp,
    bond: clamp(creature.bond + 1, 0, 100),
    training,
  };

  const { creature: leveled, levelsGained } = levelUpCreature(rewarded);
  return { creature: leveled, coins: meta.coins, levelsGained };
}

export function canEvolve(creature: Creature): boolean {
  return (
    creature.stage === 1 &&
    creature.level >= EVOLVE_LEVEL &&
    creature.bond >= EVOLVE_BOND
  );
}

export function pickBranch(training: Training): Category {
  const entries: Array<[Category, number]> = [
    ["heart", training.heart],
    ["wisdom", training.wisdom],
    ["strength", training.strength],
  ];

  return entries.reduce((best, current) =>
    current[1] > best[1] ? current : best,
  )[0];
}

export function evolveCreature(
  creature: Creature,
  now: number,
): {
  creature: Creature;
  line: SpeciesLine;
  branch: Category;
  form: SpeciesLine["branches"][Category];
} {
  const line = getLine(creature.lineId);
  const branch = pickBranch(creature.training);
  const form = line.branches[branch];

  return {
    creature: {
      ...creature,
      stage: 2,
      branch,
      speciesId: form.id,
      evolvedAt: now,
      bond: clamp(creature.bond + 5, 0, 100),
    },
    line,
    branch,
    form,
  };
}

export interface CareResult {
  ok: boolean;
  message: string;
  creature: Creature;
  coins: number;
  bondGain: number;
}

export function applyCareAction(
  creature: Creature,
  coins: number,
  action: CareAction,
): CareResult {
  const care = { ...creature.care };
  const fail = (message: string): CareResult => ({
    ok: false,
    message,
    creature,
    coins,
    bondGain: 0,
  });

  let cost = 0;
  let message = "";
  let targetBefore = 0;

  switch (action) {
    case "feed": {
      if (coins < 5) return fail("코인이 부족해요. 할 일을 먼저 해볼까요?");
      if (care.fullness >= 95) return fail("배가 불러요! 나중에 먹을게요.");
      cost = 5;
      targetBefore = care.fullness;
      care.fullness = clamp(care.fullness + 25, 0, 100);
      care.mood = clamp(care.mood + 2, 0, 100);
      message = "냠냠! 맛있어요.";
      break;
    }
    case "play": {
      if (care.energy < 10) return fail("너무 졸려요. 먼저 쉬게 해주세요.");
      if (care.mood >= 95) return fail("지금은 아주 신나요! 다른 걸 해볼까요?");
      targetBefore = care.mood;
      care.mood = clamp(care.mood + 20, 0, 100);
      care.energy = clamp(care.energy - 5, 0, 100);
      message = "신나게 놀았어요!";
      break;
    }
    case "wash": {
      if (care.hygiene >= 95) return fail("이미 반짝반짝 깨끗해요.");
      targetBefore = care.hygiene;
      care.hygiene = clamp(care.hygiene + 30, 0, 100);
      care.mood = clamp(care.mood + 3, 0, 100);
      message = "반짝반짝! 깨끗해졌어요.";
      break;
    }
    case "rest": {
      if (care.energy >= 95) return fail("기운이 넘쳐요! 놀아볼까요?");
      targetBefore = care.energy;
      care.energy = clamp(care.energy + 25, 0, 100);
      care.mood = clamp(care.mood + 5, 0, 100);
      message = "쿨쿨... 기운이 나요.";
      break;
    }
  }

  const bondGain = targetBefore < 90 ? 1 : 0;
  return {
    ok: true,
    message,
    creature: {
      ...creature,
      care,
      bond: clamp(creature.bond + bondGain, 0, 100),
    },
    coins: coins - cost,
    bondGain,
  };
}

export function completionForTask(
  completions: Completion[],
  task: Task,
  day: string,
): Completion | undefined {
  const relevant = completions
    .filter((completion) => {
      if (completion.taskId !== task.id) return false;
      return task.schedule === "daily" ? completion.date === day : true;
    })
    .sort((a, b) => b.completedAt - a.completedAt);

  return relevant[0];
}

export function taskStatus(
  completions: Completion[],
  task: Task,
  day: string,
): TaskStatus {
  const completion = completionForTask(completions, task, day);
  if (!completion) return "todo";
  if (completion.status === "rejected") return "todo";
  return completion.status;
}

export function timeLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 || 12;
  return `${meridiem} ${hour12}:${minutes}`;
}
