import { describe, expect, it } from "vitest";
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
  pickBranch,
  taskStatus,
  xpToNext,
} from "./engine";
import type { Completion, Task } from "./types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "숙제하기",
    emoji: "📚",
    category: "wisdom",
    difficulty: "normal",
    schedule: "daily",
    requiresApproval: false,
    createdAt: 0,
    createdBy: "parent",
    ...overrides,
  };
}

function makeCompletion(overrides: Partial<Completion> = {}): Completion {
  return {
    id: "done-1",
    taskId: "task-1",
    taskTitle: "숙제하기",
    taskEmoji: "📚",
    category: "wisdom",
    difficulty: "normal",
    date: "2026-11-26",
    status: "approved",
    completedAt: 1,
    xp: 20,
    coins: 10,
    ...overrides,
  };
}

describe("leveling", () => {
  it("gives xp, coins, training and levels up at the threshold", () => {
    const creature = createCreature({
      lineId: "ember",
      nickname: "불찌",
      now: 0,
    });

    expect(xpToNext(1)).toBe(20);

    const reward = applyTaskReward(creature, makeTask());
    expect(reward.coins).toBe(10);
    expect(reward.levelsGained).toBe(1);
    expect(reward.creature.level).toBe(2);
    expect(reward.creature.xp).toBe(0);
    expect(reward.creature.bond).toBe(23);
    expect(reward.creature.training.wisdom).toBe(2);
  });

  it("keeps xp below the next threshold", () => {
    const creature = {
      ...createCreature({ lineId: "bubble", nickname: "방울이", now: 0 }),
      level: 2,
    };

    const reward = applyTaskReward(creature, makeTask());
    expect(reward.creature.level).toBe(2);
    expect(reward.creature.xp).toBe(20);
    expect(reward.levelsGained).toBe(0);
  });
});

describe("evolution", () => {
  it("requires level 5 and bond 30", () => {
    const creature = createCreature({
      lineId: "ember",
      nickname: "불찌",
      now: 0,
    });

    expect(canEvolve(creature)).toBe(false);

    const ready = { ...creature, level: 5, bond: 30 };
    expect(canEvolve(ready)).toBe(true);
  });

  it("picks the most trained stat and evolves into that form", () => {
    const creature = {
      ...createCreature({ lineId: "ember", nickname: "불찌", now: 0 }),
      level: 5,
      bond: 30,
      training: { strength: 3, wisdom: 9, heart: 2 },
    };

    const result = evolveCreature(creature, 123);
    expect(result.branch).toBe("wisdom");
    expect(result.form.name).toBe("불꽃눈");
    expect(result.creature.stage).toBe(2);
    expect(result.creature.speciesId).toBe("ember-wise");
    expect(result.creature.bond).toBe(35);
  });

  it("uses heart as the tie-breaker", () => {
    expect(pickBranch({ strength: 4, wisdom: 4, heart: 4 })).toBe("heart");
  });
});

describe("care", () => {
  it("feeds a hungry creature and spends coins", () => {
    const base = createCreature({
      lineId: "sprout",
      nickname: "새싹이",
      now: 0,
    });
    const creature = {
      ...base,
      care: { ...base.care, fullness: 50 },
    };

    const result = applyCareAction(creature, 10, "feed");
    expect(result.ok).toBe(true);
    expect(result.creature.care.fullness).toBe(75);
    expect(result.coins).toBe(5);
    expect(result.bondGain).toBe(1);
    expect(result.creature.bond).toBe(21);
  });

  it("does not feed a full creature", () => {
    const creature = createCreature({
      lineId: "sprout",
      nickname: "새싹이",
      now: 0,
    });

    const result = applyCareAction(creature, 10, "feed");
    expect(result.ok).toBe(false);
    expect(result.coins).toBe(10);
  });

  it("does not spend coins when they are insufficient", () => {
    const base = createCreature({
      lineId: "sprout",
      nickname: "새싹이",
      now: 0,
    });
    const creature = { ...base, care: { ...base.care, fullness: 40 } };

    const result = applyCareAction(creature, 2, "feed");
    expect(result.ok).toBe(false);
    expect(result.coins).toBe(2);
  });
});

describe("decay", () => {
  const noon = new Date(2026, 10, 26, 12, 0, 0).getTime();

  it("decays stats while awake", () => {
    const care = {
      fullness: 100,
      mood: 100,
      hygiene: 100,
      energy: 100,
      lastTick: noon - 2 * 3_600_000,
    };

    const result = decayCare(care, noon);
    expect(result.fullness).toBe(96);
    expect(result.mood).toBe(98);
    expect(result.hygiene).toBe(98);
    expect(result.energy).toBe(98);
    expect(result.lastTick).toBe(noon);
  });

  it("pauses during sleep time", () => {
    const night = new Date(2026, 10, 26, 23, 0, 0).getTime();
    const care = {
      fullness: 100,
      mood: 100,
      hygiene: 100,
      energy: 100,
      lastTick: night - 3 * 3_600_000,
    };

    const result = decayCare(care, night);
    expect(result.fullness).toBe(100);
    expect(result.lastTick).toBe(night);
  });

  it("never drops below the floor and caps offline time at 24 hours", () => {
    const care = {
      fullness: 30,
      mood: 30,
      hygiene: 30,
      energy: 30,
      lastTick: noon - 100 * 3_600_000,
    };

    const result = decayCare(care, noon);
    expect(result.fullness).toBe(20);
    expect(result.mood).toBe(20);
    expect(result.hygiene).toBe(20);
    expect(result.energy).toBe(20);
  });
});

describe("task scheduling", () => {
  it("shows daily tasks every day and one-time tasks only on their date", () => {
    const daily = makeTask();
    const once = makeTask({ id: "task-2", schedule: "once", scheduledDate: "2026-11-26" });

    expect(isTaskActiveOn(daily, "2026-11-26")).toBe(true);
    expect(isTaskActiveOn(daily, "2026-11-27")).toBe(true);
    expect(isTaskActiveOn(once, "2026-11-26")).toBe(true);
    expect(isTaskActiveOn(once, "2026-11-27")).toBe(false);
  });

  it("returns the latest completion and treats rejected as todo", () => {
    const task = makeTask();
    const approved = makeCompletion();
    const rejected = makeCompletion({ id: "done-2", status: "rejected", completedAt: 2 });

    expect(taskStatus([approved], task, "2026-11-26")).toBe("approved");
    expect(taskStatus([rejected], task, "2026-11-26")).toBe("todo");
    expect(completionForTask([approved, rejected], task, "2026-11-26")?.id).toBe("done-2");
  });

  it("does not match a daily completion from another day", () => {
    const task = makeTask();
    const completion = makeCompletion({ date: "2026-11-25" });
    expect(completionForTask([completion], task, "2026-11-26")).toBeUndefined();
  });

  it("matches a one-time completion regardless of date", () => {
    const task = makeTask({ schedule: "once", scheduledDate: "2026-11-26" });
    const completion = makeCompletion({ date: "2026-11-26" });
    expect(completionForTask([completion], task, "2026-11-27")?.id).toBe("done-1");
  });
});

describe("dateKey", () => {
  it("formats a local date", () => {
    expect(dateKey(new Date(2026, 10, 26, 9, 30))).toBe("2026-11-26");
  });
});
