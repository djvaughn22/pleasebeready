"use client";

// Small shared controls for the stock-up planner. Same tokens as the rest of
// the site (flat dark surfaces, #34D399 accent); state is never colour-only.

import type { ReactNode } from "react";

export const A = "#34D399";

export const card = "rounded-2xl border border-[#26324c] bg-[#141d2e]";
export const inset = "rounded-xl border border-[#26324c] bg-[#0c1220]";
export const label = "text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]";
export const muted = "text-xs font-semibold leading-5 text-[#94a3b8]";
export const input =
  "h-11 rounded-lg border border-[#26324c] bg-[#0c1220] px-3 text-base font-bold text-[#e8edf5]";
export const btn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#26324c] bg-[#1c2740] px-4 py-2 text-sm font-black text-[#e8edf5] transition hover:border-[#34D399] disabled:cursor-not-allowed disabled:opacity-50";
export const btnSmall =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#26324c] bg-[#1c2740] px-3 py-1.5 text-xs font-black text-[#e8edf5] transition hover:border-[#34D399] disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#34D399] bg-[#34D399] px-4 py-2 text-sm font-black text-[#0b1220] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

/** Whole-number input with − and + buttons. Typing any number in range works. */
export function Stepper({
  id, text, value, min, max, onChange, hint, compact, sr,
}: {
  id: string; text: string; sr?: string; value: number; min: number; max: number;
  onChange: (n: number) => void; hint?: string; compact?: boolean;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min))));
  const size = compact ? "h-10 w-10" : "h-11 w-11";
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={compact ? muted : label}>{text}{sr && <span className="sr-only">: {sr}</span>}</label>
      <div className="flex items-center gap-1.5">
        <button type="button" aria-label={`One fewer: ${text}${sr ? `, ${sr}` : ""}`} disabled={value <= min} onClick={() => set(value - 1)}
          className={`${size} rounded-lg border border-[#26324c] bg-[#1c2740] text-lg font-black text-[#e8edf5] disabled:opacity-40`}>−</button>
        <input id={id} type="number" inputMode="numeric" min={min} max={max} value={value}
          onChange={(e) => set(e.target.value === "" ? min : Number(e.target.value))}
          onFocus={(e) => e.target.select()}
          className={`${input} ${compact ? "h-10 w-16" : "w-20"} text-center tabular-nums`} />
        <button type="button" aria-label={`One more: ${text}${sr ? `, ${sr}` : ""}`} disabled={value >= max} onClick={() => set(value + 1)}
          className={`${size} rounded-lg border border-[#26324c] bg-[#1c2740] text-lg font-black text-[#e8edf5] disabled:opacity-40`}>+</button>
      </div>
      {hint && <p className={muted}>{hint}</p>}
    </div>
  );
}

const priText = { essential: "Essential", useful: "Useful", extra: "Extra" } as const;

export function PriorityTag({ pri }: { pri: keyof typeof priText }) {
  const tone = pri === "essential" ? "pbr-accent border-[#34D399]" : pri === "useful" ? "pbr-blue border-[#26324c]" : "text-[#94a3b8] border-[#26324c]";
  return <span className={`rounded-md border px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider ${tone}`}>{priText[pri]}</span>;
}

/** The commission notice, shown beside shopping actions. */
export function GoodToKnow({ children }: { children?: ReactNode }) {
  return (
    <aside aria-label="Good to know" className={`${inset} px-4 py-3`}>
      <p className="text-xs font-black text-[#e8edf5]">Good to know</p>
      <p className={`mt-1 ${muted}`}>
        Shop links go to Amazon. As an Amazon Associate, PleaseBeReady earns from qualifying purchases, and Open Mirror LLC may
        earn a commission at no extra cost to you. Buy wherever you like; the list works anywhere.
        {children}
      </p>
    </aside>
  );
}
