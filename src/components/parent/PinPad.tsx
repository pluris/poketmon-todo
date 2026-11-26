"use client";

import { useEffect, useState } from "react";

function PinDots({ filled, error }: { filled: number; error?: string | null }) {
  return (
    <div
      className={`mt-6 flex justify-center gap-3 ${error ? "animate-shake" : ""}`}
      aria-label={`${filled}자리 입력됨`}
    >
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={`h-3.5 w-3.5 rounded-full transition ${
            index < filled ? "bg-[#5B8DEF]" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export function PinPad({
  title,
  subtitle,
  onSubmit,
  error,
}: {
  title: string;
  subtitle: string;
  onSubmit: (pin: string) => void;
  error?: string | null;
}) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    setPin("");
  }, [error]);

  function press(digit: string) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      window.setTimeout(() => {
        onSubmit(next);
        setPin("");
      }, 110);
    }
  }

  function backspace() {
    setPin((current) => current.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="parent-bg flex min-h-dvh flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B8DEF] text-2xl shadow-lg shadow-[#5B8DEF]/30">
            <span aria-hidden>🔒</span>
          </div>
          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#5B8DEF]">
            Pleco for Mom
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{title}</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
        </div>

        <PinDots filled={pin.length} error={error} />

        <p
          className="mt-3 min-h-5 text-center text-xs font-semibold text-rose-500"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {keys.map((key, index) =>
            key === "" ? (
              <span key={`empty-${index}`} />
            ) : key === "⌫" ? (
              <button
                key={key}
                type="button"
                onClick={backspace}
                className="flex h-16 items-center justify-center rounded-2xl bg-white text-xl text-slate-500 shadow-sm transition active:scale-95"
                aria-label="지우기"
              >
                ⌫
              </button>
            ) : (
              <button
                key={key}
                type="button"
                onClick={() => press(key)}
                className="flex h-16 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-slate-800 shadow-sm transition active:scale-95"
                aria-label={key}
              >
                {key}
              </button>
            ),
          )}
        </div>

        <p className="mt-5 text-center text-[11px] font-medium text-slate-400">
          엄마만 쓰는 공간이에요. PIN을 아이에게 알려주지 마세요.
        </p>
      </div>
    </div>
  );
}

export function PinSetup({ onDone }: { onDone: (pin: string) => void }) {
  const [step, setStep] = useState(0);
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(pin: string) {
    if (step === 0) {
      setFirstPin(pin);
      setStep(1);
      setError(null);
      return;
    }

    if (pin === firstPin) {
      setError(null);
      onDone(pin);
      return;
    }

    setFirstPin("");
    setStep(0);
    setError("PIN이 서로 달라요. 처음부터 다시 만들어 주세요.");
  }

  return (
    <PinPad
      title={step === 0 ? "엄마 PIN 만들기" : "한 번 더 입력해 주세요"}
      subtitle={
        step === 0
          ? "아이가 모르는 4자리 숫자를 정해 주세요."
          : "방금 만든 PIN을 다시 입력해 주세요."
      }
      onSubmit={handleSubmit}
      error={error}
    />
  );
}

export function PinGate({
  expected,
  onUnlock,
}: {
  expected: string;
  onUnlock: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(pin: string) {
    if (pin === expected) {
      setError(null);
      onUnlock();
      return;
    }
    setError("PIN이 맞지 않아요. 다시 입력해 주세요.");
  }

  return (
    <PinPad
      title="엄마 확인"
      subtitle="4자리 PIN을 입력해 주세요."
      onSubmit={handleSubmit}
      error={error}
    />
  );
}
