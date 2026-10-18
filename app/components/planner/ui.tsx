"use client";

// Small shared controls for the planner. Same tokens as the rest of the site
// (flat dark surfaces, #34D399 accent); selected state is never colour-only.

import type { ReactNode } from "react";

export const A = "#34D399";

export const card = "rounded-2xl border border-[#26324c] bg-[#141d2e]";
export const inset = "rounded-xl border border-[#26324c] bg-[#0c1220]";
export const label = "text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]";
export const input =
  "h-11 rounded-lg border border-[#26324c] bg-[#0c1220] px-3 text-base font-bold text-[#e8edf5]";
export const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#26324c] bg-[#1c2740] px-4 py-2 text-sm font-black text-[#e8edf5] transition hover:border-[#34D399]";

export function Stepper({
  id, text, value, min, max, onChange, hint,
}: {
  id: string; text: string; value: number; min: number; max: number;
  onChange: (n: number) => void; hint?: string;
}) {
  const set = (n: number) => onChange(Math.min(max, Math.max(min, Math.round(n))));
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={label}>{text}</label>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`One fewer: ${text}`} disabled={value <= min} onClick={() => set(value - 1)}
          className="h-11 w-11 rounded-lg border border-[#26324c] bg-[#1c2740] text-lg font-black text-[#e8edf5] disabled:opacity-40">−</button>
        <input id={id} type="number" inputMode="numeric" min={min} max={max} value={value}
          onChange={(e) => set(Number(e.target.value))}
          className={`${input} w-16 text-center`} />
        <button type="button" aria-label={`One more: ${text}`} disabled={value >= max} onClick={() => set(value + 1)}
          className="h-11 w-11 rounded-lg border border-[#26324c] bg-[#1c2740] text-lg font-black text-[#e8edf5] disabled:opacity-40">+</button>
      </div>
      {hint && <p className="text-xs font-semibold leading-5 text-[#94a3b8]">{hint}</p>}
    </div>
  );
}

/** A checkbox in a bordered tile. The check mark shows state without colour. */
export function CheckTile({
  checked, onChange, title, children,
}: { checked: boolean; onChange: (v: boolean) => void; title: string; children?: ReactNode }) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 ${checked ? "border-[#34D399] bg-[#1c2740]" : "border-[#26324c] bg-[#0c1220]"}`}
      style={checked ? { boxShadow: `inset 0 0 0 1px ${A}` } : undefined}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0" style={{ accentColor: A }} />
      <span className="min-w-0">
        <span className="block text-sm font-black text-[#e8edf5]">{title}</span>
        {children && <span className="mt-0.5 block text-xs font-semibold leading-5 text-[#94a3b8]">{children}</span>}
      </span>
    </label>
  );
}

export function Section({
  id, title, intro, step, children,
}: { id: string; title: string; intro?: ReactNode; step?: number; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mb-10 scroll-mt-20">
      <h2 id={`${id}-title`} className="mb-1 text-xl font-black">
        {step !== undefined && <span className="text-[#94a3b8]">{step}. </span>}{title}
      </h2>
      {intro && <p className="mb-4 max-w-2xl text-sm font-semibold leading-6 text-[#94a3b8]">{intro}</p>}
      {children}
    </section>
  );
}

export function Money({ children }: { children: ReactNode }) {
  return <span className="tabular-nums">{children}</span>;
}
