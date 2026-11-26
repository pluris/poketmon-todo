"use client";

import { CreatureArt } from "@/components/game/CreatureArt";
import { EggArt } from "@/components/game/EggArt";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  CATEGORY_META,
  SPECIES_LINES,
  getCreatureForm,
  getLine,
} from "@/game/content";
import type { Category, Form } from "@/game/types";
import { useGameStore } from "@/store/game-store";
import { KidGate } from "./KidGate";
import { KidShell } from "./KidShell";

const TRAINING_ORDER: Category[] = ["strength", "wisdom", "heart"];

export function KidDex() {
  return (
    <KidGate>
      <DexContent />
    </KidGate>
  );
}

function DexFormCard({
  form,
  discovered,
  label,
  size = 76,
}: {
  form: Form;
  discovered: boolean;
  label: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-2xl border-2 p-2 text-center ${
        discovered
          ? "border-sun/40 bg-white shadow-sm"
          : "border-ink/5 bg-white/45"
      }`}
    >
      {discovered ? (
        <CreatureArt form={form} size={size} mood="happy" />
      ) : (
        <div
          className="flex items-center justify-center text-2xl opacity-25"
          style={{ height: size }}
          aria-hidden
        >
          🔒
        </div>
      )}
      <p
        className={`mt-1 text-[11px] font-extrabold ${
          discovered ? "" : "text-ink-soft"
        }`}
      >
        {discovered ? form.name : "???"}
      </p>
      <p className="text-[9px] font-bold text-ink-soft">{label}</p>
    </div>
  );
}

function DexContent() {
  const state = useGameStore();
  const creature = state.creature;
  if (!creature) return null;

  const line = getLine(creature.lineId);
  const form = getCreatureForm(creature);
  const totalForms = SPECIES_LINES.length * 4;
  const dexCount = new Set(state.dex).size;
  const discovered = (id: string) =>
    state.dex.includes(id) || creature.speciesId === id;

  return (
    <KidShell>
      <section className="card mt-2 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.2em] text-sun-deep">
              MONSTER DEX
            </p>
            <h1 className="mt-1 text-2xl font-extrabold">도감</h1>
          </div>
          <div className="rounded-2xl bg-cream px-4 py-2 text-center">
            <p className="text-[10px] font-bold text-ink-soft">발견</p>
            <p className="text-lg font-extrabold">
              {dexCount} / {totalForms}
            </p>
          </div>
        </div>
        <ProgressBar
          value={(dexCount / totalForms) * 100}
          className="mt-4"
        />
        <p className="mt-2 text-[11px] font-bold text-ink-soft">
          진화하면 새로운 친구를 만날 수 있어요.
        </p>
      </section>

      <section className="card mt-4 p-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-3xl bg-gradient-to-b from-sky/30 to-cream p-1">
            <CreatureArt form={form} size={112} mood="happy" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold text-ink-soft">나의 친구</p>
            <p className="truncate text-xl font-extrabold">{creature.nickname}</p>
            <p className="text-xs font-bold text-ink-soft">
              {form.name} · Lv.{creature.level}
            </p>
            <p className="mt-1 text-[11px] font-bold text-ink-soft">
              {form.tagline}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
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
      </section>

      <section className="card mt-4 p-4">
        <h2 className="text-base font-extrabold">진화 계보</h2>
        <p className="mt-1 text-[11px] font-bold text-ink-soft">{line.hint}</p>

        <div className="mt-3 flex justify-center">
          <div className="w-36">
            <DexFormCard
              form={line.base}
              discovered={discovered(line.base.id)}
              label="아기"
              size={96}
            />
          </div>
        </div>

        <div className="my-2 text-center text-xl text-ink-soft" aria-hidden>
          ↓
        </div>

        <div className="grid grid-cols-3 gap-2">
          {TRAINING_ORDER.map((category) => (
            <DexFormCard
              key={category}
              form={line.branches[category]}
              discovered={discovered(line.branches[category].id)}
              label={`${CATEGORY_META[category].emoji} ${CATEGORY_META[category].label}`}
              size={72}
            />
          ))}
        </div>
      </section>

      <section className="mt-6 px-1">
        <h2 className="text-base font-extrabold">다른 친구들</h2>
        <p className="mt-0.5 text-[11px] font-bold text-ink-soft">
          새로운 알은 나중에 만날 수 있어요.
        </p>

        <div className="mt-2 grid grid-cols-3 gap-2">
          {SPECIES_LINES.filter((option) => option.id !== line.id).map(
            (option) => (
              <div
                key={option.id}
                className="card-tight p-2 text-center opacity-80"
              >
                <EggArt
                  palette={option.egg.palette}
                  pattern={option.egg.pattern}
                  size={72}
                  className="opacity-30 grayscale"
                />
                <p className="text-[11px] font-extrabold text-ink-soft">???</p>
                <p className="text-[9px] font-bold text-ink-soft">
                  {option.name} 알
                </p>
              </div>
            ),
          )}
        </div>
      </section>
    </KidShell>
  );
}
