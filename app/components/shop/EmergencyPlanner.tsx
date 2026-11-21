"use client";

// The top of home (owner direction 2026-11-20, night): household emergency
// preparedness first. What you're getting ready for, how many people, how long,
// and one button to that checklist with amounts (lib/shop/emergencyPlan.ts).
// A fresh visit plans a power outage for 4 people, 3 days. A choice the visitor
// makes here is kept on this device; nothing is saved until they change something.
// The button is a plain link, so before scripts load it still opens the outage plan.
// Parties, sleepovers, camping and cookouts sit one line below.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { measure } from "../../lib/measure";
import { MAX_PEOPLE } from "../../lib/stockup/calc";
import { ALL_SITUATIONS, EVERYDAY, FRESH, LENGTHS, SAVE_KEY, planHref, planSummary, situationsFor, startingPlan, type HomePlan } from "../../lib/shop/emergencyPlan";
import { Stepper } from "../stockup/ui";

// Compact under 400px so "Power outage" and "Emergency kit" stay on one line in two columns at 360.
const chip = (on: boolean) =>
  `inline-flex min-h-11 items-center justify-center gap-1 whitespace-nowrap rounded-xl border-2 px-2 text-[0.8125rem] font-black min-[400px]:gap-1.5 min-[400px]:px-3 min-[400px]:text-sm transition ${on ? "pbr-edge bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#1c2740] text-[#e8edf5] hover:border-[#F97316]"}`;

const read = (k: string): unknown => {
  try { return JSON.parse(window.localStorage.getItem(k) ?? "null"); } catch { return null; }
};

export default function EmergencyPlanner({ month }: { month: number }) {
  const [plan, setPlan] = useState<HomePlan>(FRESH);
  useEffect(() => {
    const t = setTimeout(() => setPlan(startingPlan(read(SAVE_KEY), read("pbr:fw"))), 0);
    return () => clearTimeout(t);
  }, []);
  const change = (patch: Partial<HomePlan>) => setPlan((cur) => {
    const next = { ...cur, ...patch };
    try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(next)); } catch { /* storage blocked: still works for this visit */ }
    return next;
  });
  const base = useMemo(() => situationsFor(month), [month]);
  // A saved choice from another season (a heat wave plan in December) takes the season's storm spot.
  const situations = base.some((s) => s.kit === plan.kit) ? base
    : base.map((s, i) => (i === 1 ? ALL_SITUATIONS.find((x) => x.kit === plan.kit) ?? s : s));

  return (
    <section aria-labelledby="plan-title" className="pbr-edge rounded-2xl border-2 bg-[#141d2e] p-4 sm:p-6">
      <h1 id="plan-title" className="pbr-display max-w-[36rem] text-[1.6rem] font-black leading-[1.15] sm:text-4xl sm:leading-[1.1]">
        Get your home ready for outages and storms
      </h1>
      <p className="mt-2 max-w-[36rem] text-[0.95rem] font-semibold leading-6 text-[#cbd5e1]">
        Water, food, light and power for your household. Pick what you’re planning for and get a checklist with amounts.
      </p>
      <fieldset className="mt-4 min-w-0">
        <legend className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">Getting ready for</legend>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {situations.map((s) => (
            <button key={s.kit} type="button" aria-pressed={s.kit === plan.kit} onClick={() => change({ kit: s.kit })} className={chip(s.kit === plan.kit)}>
              <span aria-hidden>{s.emoji}</span>{s.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
        <Stepper compact id="plan-people" text="People" value={plan.people} min={1} max={MAX_PEOPLE} onChange={(people) => change({ people })} />
        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-sm font-semibold text-[#94a3b8]">How long</legend>
          <div className="flex gap-2">
            {LENGTHS.map((l) => (
              <button key={l.days} type="button" aria-pressed={plan.days === l.days} onClick={() => change({ days: l.days })} className={`${chip(plan.days === l.days)} h-10 min-h-10`}>
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <Link href={planHref(plan)} onClick={() => measure("plan_start", `home-${plan.kit}`)}
        className="pbr-edge mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 bg-[#F97316] px-5 text-base font-black text-[#0b1220] transition hover:brightness-110 sm:max-w-md">
        Build your emergency plan <span aria-hidden>→</span>
      </Link>
      <p className="mt-2 text-xs font-bold text-[#94a3b8]" aria-live="polite">{planSummary(plan)}</p>
      <nav aria-label="Other plans" className="mt-4 border-t border-[#26324c] pt-3">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">Planning something else?</p>
        <ul className="flex flex-wrap gap-2">
          {EVERYDAY.map((e) => (
            <li key={e.kit}>
              <Link href={`/kits/${e.kit}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#26324c] px-3 text-sm font-bold text-[#e8edf5] hover:border-[#F97316]">
                <span aria-hidden>{e.emoji}</span>{e.label}
              </Link>
            </li>
          ))}
          <li><Link href="/kits" className="pbr-accent inline-flex min-h-10 items-center px-1 text-sm font-black hover:underline">All plans →</Link></li>
        </ul>
      </nav>
    </section>
  );
}

