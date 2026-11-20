"use client";

// The top of home (owner direction 2026-11-20): what the site is for, and the
// planning action in one card. Pick an occasion and how many people; the button
// opens that plan with amounts for the group (lib/shop/occasions.ts). The button
// is a plain link, so before scripts load it still opens the first occasion for 4.
// Food & Water uses this device's last days choice (the same key as its picker).

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { measure } from "../../lib/measure";
import { parseDays } from "../../lib/ready/bundle";
import { maxPeople, occasionHref, occasionsFor } from "../../lib/shop/occasions";
import { Stepper } from "../stockup/ui";

const FW_KEY = "pbr:fw";

const chip = (on: boolean) =>
  `inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 px-3 text-sm font-black transition ${on ? "pbr-edge bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#1c2740] text-[#e8edf5] hover:border-[#F97316]"}`;

export default function OccasionPlanner({ month }: { month: number }) {
  const occasions = useMemo(() => occasionsFor(month), [month]);
  const [id, setId] = useState(occasions[0].id);
  const [people, setPeople] = useState(4);
  const [days, setDays] = useState(7);
  useEffect(() => {
    try {
      const v = JSON.parse(window.localStorage.getItem(FW_KEY) ?? "null") as { days?: number } | null;
      if (!v?.days) return;
      const t = setTimeout(() => setDays(parseDays(v.days)), 0);
      return () => clearTimeout(t);
    } catch { /* storage blocked: a week */ }
  }, []);
  const o = occasions.find((x) => x.id === id) ?? occasions[0];
  const n = Math.min(people, maxPeople(o));

  return (
    <section aria-labelledby="plan-title" className="pbr-edge rounded-2xl border-2 bg-[#141d2e] p-4 sm:p-6">
      <h1 id="plan-title" className="pbr-display max-w-[34rem] text-[1.6rem] font-black leading-[1.15] sm:text-4xl sm:leading-[1.1]">
        Plan what to buy for a party, sleepover or camping trip
      </h1>
      <fieldset className="mt-4 min-w-0">
        <legend className="mb-2 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">Occasion</legend>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {occasions.map((x) => (
            <button key={x.id} type="button" aria-pressed={x.id === o.id} onClick={() => setId(x.id)} className={chip(x.id === o.id)}>
              <span aria-hidden>{x.emoji}</span>{x.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <Stepper compact id="plan-people" text="People" value={n} min={1} max={maxPeople(o)} onChange={setPeople} />
        <Link href={occasionHref(o, n, days)} onClick={() => measure("plan_start", `home-${o.id}`)}
          className="pbr-edge inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 bg-[#F97316] px-5 text-base font-black text-[#0b1220] transition hover:brightness-110 sm:max-w-md">
          {o.cta(n)} <span aria-hidden>→</span>
        </Link>
      </div>
      <p className="mt-3 text-sm font-black">
        <Link href="/kits" className="pbr-accent hover:underline">More occasions →</Link>
      </p>
    </section>
  );
}
