import type {
  Category,
  Creature,
  Difficulty,
  Form,
  Palette,
  SpeciesLine,
  Task,
} from "./types";

const fire: Palette = {
  body: "#FF9F68",
  belly: "#FFE2C2",
  accent: "#F26B3A",
  cheek: "#FF8E8E",
};
const firePower: Palette = {
  body: "#FF7A45",
  belly: "#FFD1A8",
  accent: "#D94A1E",
  cheek: "#FF9B8A",
};
const fireWisdom: Palette = {
  body: "#FFB35C",
  belly: "#FFF0C9",
  accent: "#E08A00",
  cheek: "#FFB3A7",
};
const fireHeart: Palette = {
  body: "#FFA07A",
  belly: "#FFE9D6",
  accent: "#F2558A",
  cheek: "#FF9EB5",
};

const water: Palette = {
  body: "#6EC6FF",
  belly: "#D9F3FF",
  accent: "#2E9BE6",
  cheek: "#FFA8C0",
};
const waterPower: Palette = {
  body: "#4FA8E8",
  belly: "#CBE9FF",
  accent: "#1E6FB8",
  cheek: "#FF9AB8",
};
const waterWisdom: Palette = {
  body: "#8FA8FF",
  belly: "#E3E8FF",
  accent: "#5B6BE0",
  cheek: "#FFB3D1",
};
const waterHeart: Palette = {
  body: "#7EDCE8",
  belly: "#D8FBFF",
  accent: "#2BB8C9",
  cheek: "#FF9FC5",
};

const grass: Palette = {
  body: "#9BD77A",
  belly: "#E4F7D2",
  accent: "#5FA83E",
  cheek: "#FFB0A0",
};
const grassPower: Palette = {
  body: "#7FCB63",
  belly: "#D9F5C2",
  accent: "#3F8F2E",
  cheek: "#FFA38F",
};
const grassWisdom: Palette = {
  body: "#B8D96A",
  belly: "#F1F8CE",
  accent: "#7A9E2A",
  cheek: "#FFC0A0",
};
const grassHeart: Palette = {
  body: "#A8D98C",
  belly: "#EAF9DC",
  accent: "#5BA85A",
  cheek: "#FFA8C8",
};

export const SPECIES_LINES: SpeciesLine[] = [
  {
    id: "ember",
    name: "불씨",
    base: {
      id: "ember-base",
      name: "불찌",
      element: "fire",
      shape: "round",
      palette: fire,
      accessory: "flame",
      tagline: "따뜻한 불꽃을 품은 장난꾸러기",
    },
    egg: { pattern: "dot", palette: fire },
    branches: {
      strength: {
        id: "ember-power",
        name: "모닥불",
        element: "fire",
        shape: "round",
        palette: firePower,
        accessory: "horn",
        tagline: "힘차게 활활 타오르는 친구",
      },
      wisdom: {
        id: "ember-wise",
        name: "불꽃눈",
        element: "fire",
        shape: "round",
        palette: fireWisdom,
        accessory: "star",
        tagline: "반짝이는 궁금증을 품은 친구",
      },
      heart: {
        id: "ember-heart",
        name: "온기",
        element: "fire",
        shape: "round",
        palette: fireHeart,
        accessory: "heart",
        tagline: "모두를 따뜻하게 안아주는 친구",
      },
    },
    hint: "힘·지혜·마음 중 가장 많이 키운 능력치로 진화해요.",
  },
  {
    id: "bubble",
    name: "물방울",
    base: {
      id: "bubble-base",
      name: "방울이",
      element: "water",
      shape: "drop",
      palette: water,
      accessory: "fin",
      tagline: "보글보글 호기심 많은 친구",
    },
    egg: { pattern: "wave", palette: water },
    branches: {
      strength: {
        id: "bubble-power",
        name: "물결",
        element: "water",
        shape: "drop",
        palette: waterPower,
        accessory: "bolt",
        tagline: "씩씩하게 파도를 가르는 친구",
      },
      wisdom: {
        id: "bubble-wise",
        name: "안개",
        element: "water",
        shape: "drop",
        palette: waterWisdom,
        accessory: "glasses",
        tagline: "조용히 생각을 키우는 친구",
      },
      heart: {
        id: "bubble-heart",
        name: "이슬",
        element: "water",
        shape: "drop",
        palette: waterHeart,
        accessory: "heart",
        tagline: "반짝반짝 마음을 나누는 친구",
      },
    },
    hint: "물방울은 힘·지혜·마음 중 가장 많이 키운 능력치로 진화해요.",
  },
  {
    id: "sprout",
    name: "새싹",
    base: {
      id: "sprout-base",
      name: "새싹이",
      element: "grass",
      shape: "leaf",
      palette: grass,
      accessory: "sprout",
      tagline: "햇살을 좋아하는 느긋한 친구",
    },
    egg: { pattern: "leaf", palette: grass },
    branches: {
      strength: {
        id: "sprout-power",
        name: "덩굴",
        element: "grass",
        shape: "leaf",
        palette: grassPower,
        accessory: "leaf",
        tagline: "튼튼하게 뻗어 나가는 친구",
      },
      wisdom: {
        id: "sprout-wise",
        name: "나무",
        element: "grass",
        shape: "leaf",
        palette: grassWisdom,
        accessory: "star",
        tagline: "지혜가 가지처럼 자라는 친구",
      },
      heart: {
        id: "sprout-heart",
        name: "꽃잎",
        element: "grass",
        shape: "leaf",
        palette: grassHeart,
        accessory: "flower",
        tagline: "향기처럼 마음을 전하는 친구",
      },
    },
    hint: "새싹은 힘·지혜·마음 중 가장 많이 키운 능력치로 진화해요.",
  },
];

export const LINES_BY_ID: Record<string, SpeciesLine> = Object.fromEntries(
  SPECIES_LINES.map((line) => [line.id, line]),
);

export const FORMS_BY_ID: Record<
  string,
  { line: SpeciesLine; form: Form; branch?: Category }
> = {};

for (const line of SPECIES_LINES) {
  FORMS_BY_ID[line.base.id] = { line, form: line.base };
  for (const category of ["strength", "wisdom", "heart"] as Category[]) {
    const form = line.branches[category];
    FORMS_BY_ID[form.id] = { line, form, branch: category };
  }
}

export function getLine(lineId: string): SpeciesLine {
  return LINES_BY_ID[lineId] ?? SPECIES_LINES[0];
}

export function getForm(formId: string): Form | undefined {
  return FORMS_BY_ID[formId]?.form;
}

export function getCreatureForm(creature: Creature): Form {
  const line = getLine(creature.lineId);
  if (creature.stage === 2 && creature.branch) {
    return line.branches[creature.branch];
  }
  return line.base;
}

export const CATEGORY_META: Record<
  Category,
  { label: string; emoji: string; color: string; soft: string }
> = {
  strength: { label: "힘", emoji: "💪", color: "#F07845", soft: "#FFF0E8" },
  wisdom: { label: "지혜", emoji: "📖", color: "#4F8DF7", soft: "#EAF1FF" },
  heart: { label: "마음", emoji: "💗", color: "#F2659A", soft: "#FFEDF3" },
};

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; xp: number; coins: number }
> = {
  easy: { label: "쉬움", xp: 10, coins: 5 },
  normal: { label: "보통", xp: 20, coins: 10 },
  hard: { label: "어려움", xp: 30, coins: 15 },
};

export const DEFAULT_TASKS: Omit<Task, "id" | "createdAt">[] = [
  {
    title: "양치하기",
    emoji: "🦷",
    category: "heart",
    difficulty: "easy",
    schedule: "daily",
    requiresApproval: false,
    createdBy: "default",
  },
  {
    title: "숙제하기",
    emoji: "📚",
    category: "wisdom",
    difficulty: "normal",
    schedule: "daily",
    requiresApproval: true,
    createdBy: "default",
  },
  {
    title: "줄넘기 20번",
    emoji: "🏃",
    category: "strength",
    difficulty: "easy",
    schedule: "daily",
    requiresApproval: false,
    createdBy: "default",
  },
];

export const TASK_EMOJIS = [
  "🦷",
  "📚",
  "🧹",
  "🏃",
  "🛏️",
  "🎒",
  "🥕",
  "🎹",
  "🧺",
  "🐶",
  "💧",
  "🌙",
];
