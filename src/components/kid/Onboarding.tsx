"use client";

import { useState } from "react";
import { EggArt } from "@/components/game/EggArt";
import { SPECIES_LINES, getLine } from "@/game/content";
import { useGameStore } from "@/store/game-store";

export function Onboarding() {
  const onboard = useGameStore((state) => state.onboard);
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [lineId, setLineId] = useState(SPECIES_LINES[0].id);
  const [nickname, setNickname] = useState("");

  const line = getLine(lineId);
  const canContinue = childName.trim().length > 0;

  function goToEggs(event: React.FormEvent) {
    event.preventDefault();
    if (!canContinue) return;
    setStep(1);
  }

  function goToNickname() {
    setNickname((current) => current || getLine(lineId).base.name);
    setStep(2);
  }

  function finish(event: React.FormEvent) {
    event.preventDefault();
    onboard({
      childName,
      lineId,
      nickname: nickname.trim() || line.base.name,
    });
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden px-5 pb-8 pt-6">
      <div
        className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-sun/15 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-sky/20 blur-2xl"
        aria-hidden
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-center gap-2" aria-hidden>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === step ? "w-7 bg-sun" : "w-2 bg-ink/15"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          {step === 0 ? (
            <>
              <div className="animate-floaty">
                <EggArt
                  palette={line.egg.palette}
                  pattern={line.egg.pattern}
                  size={170}
                />
              </div>
              <p className="mt-2 text-xs font-extrabold tracking-[0.2em] text-sun-deep">
                WELCOME TO PLECO
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                안녕! 나는 Pleco야.
              </h1>
              <p className="mt-2 text-sm font-bold text-ink-soft">
                너의 이름을 알려줄래?
              </p>

              <form onSubmit={goToEggs} className="mt-6 w-full">
                <input
                  value={childName}
                  onChange={(event) => setChildName(event.target.value)}
                  maxLength={12}
                  placeholder="예: 지우"
                  autoComplete="off"
                  className="w-full rounded-2xl border-2 border-ink/10 bg-white/90 px-5 py-4 text-center text-lg font-extrabold outline-none transition focus:border-sun"
                  aria-label="아이 이름"
                />
                <button
                  type="submit"
                  disabled={!canContinue}
                  className="btn-chunky mt-3 w-full rounded-2xl bg-sun py-4 text-lg font-extrabold text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  다음
                </button>
              </form>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h1 className="text-3xl font-extrabold tracking-tight">
                어떤 알을 고를까?
              </h1>
              <p className="mt-2 text-sm font-bold text-ink-soft">
                마음에 드는 알을 골라봐.
              </p>

              <div className="mt-6 grid w-full grid-cols-3 gap-2">
                {SPECIES_LINES.map((option) => {
                  const selected = option.id === lineId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLineId(option.id)}
                      className={`rounded-3xl border-2 p-2 transition ${
                        selected
                          ? "border-sun bg-white shadow-lg"
                          : "border-white/60 bg-white/55"
                      }`}
                      aria-pressed={selected}
                    >
                      <EggArt
                        palette={option.egg.palette}
                        pattern={option.egg.pattern}
                        size={92}
                        className={selected ? "animate-wiggle" : ""}
                      />
                      <span className="mt-1 block text-[11px] font-extrabold">
                        {option.name} 알
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={goToNickname}
                className="btn-chunky mt-6 w-full rounded-2xl bg-sun py-4 text-lg font-extrabold text-ink"
              >
                이 알로 할게!
              </button>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="mt-3 text-xs font-bold text-ink-soft"
              >
                ← 이름 다시 입력하기
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="animate-wiggle">
                <EggArt
                  palette={line.egg.palette}
                  pattern={line.egg.pattern}
                  size={160}
                />
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
                알이 흔들려요!
              </h1>
              <p className="mt-2 text-sm font-bold text-ink-soft">
                태어난 친구의 이름을 지어줘.
              </p>

              <form onSubmit={finish} className="mt-6 w-full">
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  maxLength={12}
                  placeholder={line.base.name}
                  autoComplete="off"
                  className="w-full rounded-2xl border-2 border-ink/10 bg-white/90 px-5 py-4 text-center text-lg font-extrabold outline-none transition focus:border-sun"
                  aria-label="몬스터 이름"
                />
                <button
                  type="submit"
                  className="btn-chunky mt-3 w-full rounded-2xl bg-sun py-4 text-lg font-extrabold text-ink"
                >
                  만나러 가기
                </button>
              </form>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-3 text-xs font-bold text-ink-soft"
              >
                ← 다른 알 고르기
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
