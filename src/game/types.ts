export type Category = "strength" | "wisdom" | "heart";
export type Difficulty = "easy" | "normal" | "hard";
export type TaskSchedule = "daily" | "once";
export type CompletionStatus = "pending" | "approved" | "rejected";
export type TaskStatus = "todo" | "pending" | "approved";
export type CareAction = "feed" | "play" | "wash" | "rest";
export type Mood = "happy" | "calm" | "bored" | "grumpy" | "sleepy";
export type Element = "fire" | "water" | "grass";
export type CreatureShape = "round" | "drop" | "leaf";
export type Accessory =
  | "flame"
  | "fin"
  | "sprout"
  | "horn"
  | "star"
  | "heart"
  | "glasses"
  | "flower"
  | "bolt"
  | "leaf"
  | "none";
export type EggPattern = "dot" | "wave" | "leaf";

export interface Palette {
  body: string;
  belly: string;
  accent: string;
  cheek: string;
}

export interface CareStats {
  fullness: number;
  mood: number;
  hygiene: number;
  energy: number;
  lastTick: number;
}

export interface Training {
  strength: number;
  wisdom: number;
  heart: number;
}

export interface Form {
  id: string;
  name: string;
  element: Element;
  shape: CreatureShape;
  palette: Palette;
  accessory: Accessory;
  tagline: string;
}

export interface SpeciesLine {
  id: string;
  name: string;
  base: Form;
  egg: { pattern: EggPattern; palette: Palette };
  branches: Record<Category, Form>;
  hint: string;
}

export interface Creature {
  id: string;
  lineId: string;
  speciesId: string;
  nickname: string;
  stage: 1 | 2;
  level: number;
  xp: number;
  bond: number;
  training: Training;
  care: CareStats;
  branch?: Category;
  createdAt: number;
  evolvedAt?: number;
}

export interface Task {
  id: string;
  title: string;
  emoji: string;
  category: Category;
  difficulty: Difficulty;
  schedule: TaskSchedule;
  scheduledDate?: string;
  requiresApproval: boolean;
  createdAt: number;
  createdBy: "parent" | "child" | "default";
}

export interface Completion {
  id: string;
  taskId: string;
  taskTitle: string;
  taskEmoji: string;
  category: Category;
  difficulty: Difficulty;
  date: string;
  status: CompletionStatus;
  completedAt: number;
  approvedAt?: number;
  xp: number;
  coins: number;
}

export interface GameState {
  version: 1;
  rev: number;
  updatedAt: number;
  childName: string;
  parentPin: string | null;
  coins: number;
  tasks: Task[];
  completions: Completion[];
  creature: Creature | null;
  dex: string[];
  onboardingComplete: boolean;
  totalTasksCompleted: number;
  evolutionCount: number;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  celebration?: "task" | "levelup" | "evolution" | "care";
}
