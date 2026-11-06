"use client";

// Food & Water at a glance: people and days, the two totals, one Shop button.
// On home and the Emergency department it links to the bundle; on the bundle
// page (`live`) it changes the bundle in place. The last choice is remembered
// on this device only.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DAYS, MAX_FW_DAYS, MAX_FW_PEOPLE, PEOPLE, parseDays, parsePeople, type Only } from "../../lib/ready/bundle";
import { input } from "../stockup/ui";

const KEY = "pbr:fw";
const n = (x: number) => x.toLocaleString("en-US");
export const bundleHref = (people: number, days: number, only?: Only) => `/food-water?people=${people}&days=${days}${only ? `&only=${only}` : ""}`;

const chip = (on: boolean) =>
  `min-h-10 min-w-9 rounded-full border px-2 text-sm sm:min-w-10 sm:px-3 font-black transition ${on ? "border-[#F97316] bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#1c2740] text-[#e8edf5] hover:border-[#F97316]"}`;

function Choice({ legend, options, value, max, more, start, unit, onChange }: {
  legend: string; options: number[]; value: number; max: number; more: string; start: number; unit: string; onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(!options.includes(value));
  const other = open || !options.includes(value);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">{legend}</legend>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={!other && value === o} onClick={() => { setOpen(false); onChange(o); }} className={chip(!other && value === o)}>{o}</button>
        ))}
        <button type="button" aria-pressed={other} onClick={() => { setOpen(true); if (options.includes(value)) onChange(start); }} className={chip(other)}>{more}</button>
        {other && (
          <label className="flex items-center gap-1.5 text-xs font-black text-[#94a3b8]">
            <span className="sr-only">{legend}</span>
            <input type="number" inputMode="numeric" min={1} max={max} value={value} onFocus={(e) => e.target.select()}
              onChange={(e) => onChange(Math.min(max, Math.max(1, Math.round(Number(e.target.value) || 1))))}
              className={`${input} h-10 w-[4.5rem] text-center tabular-nums`} />
            {unit}
          </label>
        )}
      </div>
    </fieldset>
  );
}

export default function FoodWaterPicker({ people: p0, days: d0, only, live, heading = "h2" }: {
  people?: number; days?: number; only?: Only; live?: boolean; heading?: "h1" | "h2";
}) {
  const router = useRouter();
  const [people, setPeople] = useState(p0 ?? 4);
  const [days, setDays] = useState(d0 ?? 7);
  // Off the bundle page, start from this device's last choice.
  useEffect(() => {
    if (live) return;
    try {
      const v = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as { people?: number; days?: number } | null;
      if (!v) return;
      const t = setTimeout(() => { setPeople(parsePeople(v.people)); setDays(parseDays(v.days)); }, 0);
      return () => clearTimeout(t);
    } catch { /* storage blocked: defaults */ }
  }, [live]);

  const set = (np: number, nd: number) => {
    setPeople(np);
    setDays(nd);
    try { window.localStorage.setItem(KEY, JSON.stringify({ people: np, days: nd })); } catch { /* fine */ }
    if (live) router.replace(bundleHref(np, nd, only), { scroll: false });
  };
  const H = heading;
  const total = people * days;
  const big = (on: boolean) => `pbr-display whitespace-nowrap text-xl sm:text-2xl font-black leading-none ${on ? "" : "opacity-40"}`;

  return (
    <section aria-labelledby="fw-title" className="pbr-edge rounded-2xl border-2 bg-[#141d2e] p-3.5 sm:p-5">
      <H id="fw-title" className={`pbr-display font-black ${heading === "h1" ? "text-2xl sm:text-3xl" : "text-xl"}`}>Food &amp; Water</H>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Choice legend="People" options={PEOPLE} value={people} max={MAX_FW_PEOPLE} more="More" start={6} unit="people" onChange={(v) => set(v, days)} />
        <Choice legend="Days" options={DAYS} value={days} max={MAX_FW_DAYS} more="Custom" start={10} unit="days" onChange={(v) => set(people, v)} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[var(--om-surface-2)] px-3 py-2.5">
          <dt className="text-[0.7rem] font-black uppercase tracking-wider text-[#94a3b8]"><span aria-hidden>💧 </span>Water</dt>
          <dd className={big(only !== "food")}>{n(total)} <span className="text-sm">gallons</span></dd>
        </div>
        <div className="rounded-xl bg-[var(--om-surface-2)] px-3 py-2.5">
          <dt className="text-[0.7rem] font-black uppercase tracking-wider text-[#94a3b8]"><span aria-hidden>🥫 </span>Food</dt>
          <dd className={big(only !== "water")}>{n(total)} <span className="text-sm">person-days</span></dd>
        </div>
      </dl>
      {!live && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href={bundleHref(people, days)}
            className="pbr-edge inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 bg-[#F97316] px-5 text-base font-black text-[#0b1220] transition hover:brightness-110">
            Shop Food &amp; Water <span aria-hidden>→</span>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link href={bundleHref(people, days, "water")} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#26324c] bg-[#1c2740] px-3 text-sm font-black text-[#e8edf5] hover:border-[#F97316]">Water only</Link>
            <Link href={bundleHref(people, days, "food")} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#26324c] bg-[#1c2740] px-3 text-sm font-black text-[#e8edf5] hover:border-[#F97316]">Food only</Link>
          </div>
        </div>
      )}
      {!live && days > 3 && (
        <p className="mt-2 text-sm font-bold text-[#94a3b8]">
          New to this? <Link href={`${bundleHref(people, 3)}&goal=${days}`} className="font-black underline pbr-accent">Start with 3 days</Link> and build up one trip at a time.
        </p>
      )}
    </section>
  );
}
