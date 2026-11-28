"use client";

// The top of home (owner direction 2026-11-27, "the everyday shop"): five answers, then the list.
// What you're getting ready for, a budget, what matters first, people and days; then what to check
// at home (free), what to buy this trip with real package counts, what can wait, and how to store
// it. The first list is there before anything is typed (a small example, also in the server HTML);
// prices are optional and only ever the shopper's own. Math: lib/shop/trip.ts.
//
// Saved on this device under TRIP_KEY when something changes. A link can set the answers:
// /?for=water-off&budget=0&first=water&people=1&days=1. Saved lists (pbr:stockup:v1), the home
// plan (pbr:home-plan) and Food & Water (pbr:fw) are read only, to seed the household size.

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { measure } from "../../lib/measure";
import { CART_FLAG, amazonList, cartAllowed, flagFromSearch } from "../../lib/shop/amazonCart";
import {
  BUDGETS, EXAMPLE, FOCUS_EMOJI, FOCUS_LABEL, MAX_BUDGET, MAX_TRIP_DAYS, MAX_TRIP_PEOPLE, SITUATIONS, TRIP_KEY, askFromQuery, budgetLine,
  cleanAsk, covered, coverageLine, freshTrip, laterTrips, parseTrip, planTrip, thisTrip, withAsk, withEdit, withPrice,
  type AtHome, type Battery, type Edit, type Step, type Trip,
} from "../../lib/shop/trip";
import { Stepper, btnSmall, card, input, muted } from "../stockup/ui";
import TripAmazon, { ListButtons, NOTICE } from "./TripAmazon";
import TripRow from "./TripRow";

const chip = (on: boolean) =>
  `inline-flex min-h-11 items-center justify-center gap-1 whitespace-nowrap rounded-xl border-2 px-2 text-[0.8125rem] font-black min-[400px]:gap-1.5 min-[400px]:px-3 min-[400px]:text-sm transition ${on ? "pbr-edge bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#1c2740] text-[#e8edf5] hover:border-[#F97316]"}`;
const legend = "mb-2 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]";
const n = (x: number) => x.toLocaleString("en-US");

const read = (k: string): unknown => {
  try { return JSON.parse(window.localStorage.getItem(k) ?? "null"); } catch { return null; }
};
const write = (k: string, v: unknown) => {
  try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked: works for this visit */ }
};
const session = {
  get: (k: string) => { try { return window.sessionStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { window.sessionStorage.setItem(k, v); } catch { /* blocked */ } },
};

/** A first visit to this planner: the household size the visitor gave home or Food & Water before, else the example. */
function seeded() {
  const h = (read("pbr:home-plan") ?? {}) as Record<string, unknown>;
  const f = (read("pbr:fw") ?? {}) as Record<string, unknown>;
  const people = typeof h.people === "number" ? h.people : typeof f.people === "number" ? f.people : undefined;
  return cleanAsk({ ...EXAMPLE, ...(people ? { people } : {}), ...(h.kit === "water-storage" ? { for: "water-off" as const } : {}) });
}

function Sourced({ s }: { s: Step }) {
  const short = s.source?.label.split(":")[0];
  return (
    <li className="flex gap-2 text-sm font-semibold leading-6 text-[#e8edf5]">
      <span aria-hidden className="pbr-accent mt-0.5 shrink-0 font-black">✓</span>
      <span>
        {s.text}
        {s.source && <> <a href={s.source.href} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#94a3b8] underline">{short}</a></>}
      </span>
    </li>
  );
}

function NumberField({ id, label, unit, value, step = 1, max, onChange }: { id: string; label: string; unit: string; value: number; step?: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">{label}</label>
      <div className="flex items-center gap-2">
        <input id={id} type="number" inputMode="decimal" min={0} max={max} step={step} value={value || ""} placeholder="0"
          onChange={(e) => onChange(Math.min(max, Math.max(0, Number(e.target.value) || 0)))}
          className={`${input} w-24 text-center tabular-nums`} />
        <span className="text-sm font-bold text-[#94a3b8]">{unit}</span>
      </div>
    </div>
  );
}

const BATTERIES: [Battery, string][] = [["AA", "AA"], ["AAA", "AAA"], ["D", "D"], ["USB", "Rechargeable (USB)"], ["unsure", "Not sure"]];

export default function TripPlanner() {
  const [trip, setTrip] = useState<Trip>(() => freshTrip());
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState(false);
  const [other, setOther] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const saved = parseTrip(read(TRIP_KEY));
      const start = saved ?? freshTrip(seeded());
      const linked = askFromQuery(window.location.search, start.ask);
      setTrip(linked ? { ...start, ask: linked } : start);
      if (linked && !BUDGETS.includes(linked.budget as (typeof BUDGETS)[number])) setOther(true);
      else if (saved && !BUDGETS.includes(saved.ask.budget as (typeof BUDGETS)[number])) setOther(true);
      const flag = flagFromSearch(window.location.search) || session.get(CART_FLAG) === "test";
      const allowed = cartAllowed({ deploy: process.env.PBR_DEPLOY, host: window.location.hostname, flag });
      if (allowed && flag) session.set(CART_FLAG, "test");
      setCart(allowed);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const change = (fn: (t: Trip) => Trip) => setTrip((cur) => {
    const next = fn(cur);
    write(TRIP_KEY, next);
    return next;
  });
  const ask = (patch: Parameters<typeof withAsk>[1]) => change((t) => withAsk(t, patch));
  const home = (patch: Partial<AtHome>) => change((t) => ({ ...t, home: { ...t.home, ...patch } }));
  const edit = (key: string, patch: Partial<Edit>) => change((t) => withEdit(t, key, patch));
  const price = (key: string, v: number | null) => change((t) => withPrice(t, key, v));

  const plan = useMemo(() => planTrip(trip), [trip]);
  const a = plan.ask;
  const s = plan.situation;
  const now = thisTrip(plan);
  const later = laterTrips(plan);
  const done = covered(plan);
  const lines = amazonList(plan).lines.length;
  const customBudget = other || !BUDGETS.includes(a.budget as (typeof BUDGETS)[number]);

  useEffect(() => {
    if (open) panel.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [open]);

  const rowProps = { onEdit: edit, onPrice: price, onWater: (w: "jugs" | "bottles") => change((t) => ({ ...t, water: w })), water: trip.water };

  return (
    <div>
      <section aria-labelledby="trip-title" className="pbr-edge rounded-2xl border-2 bg-[#141d2e] p-4 sm:p-6">
        <h1 id="trip-title" className="pbr-display max-w-[36rem] text-[1.45rem] font-black leading-[1.15] sm:text-4xl sm:leading-[1.1]">
          Let’s figure out what to buy
        </h1>
        <p className="pbr-body mt-2 hidden max-w-[36rem] text-[0.95rem] font-semibold leading-6 sm:block">
          Pick what’s coming and what you can spend. Your list shows up right below.
        </p>

        <fieldset className="mt-3 min-w-0 sm:mt-4">
          <legend className={legend}>Getting ready for</legend>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {SITUATIONS.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === a.for} onClick={() => ask({ for: x.id })} className={`${chip(x.id === a.for)} min-h-10 sm:min-h-11`}>
                <span aria-hidden>{x.emoji}</span>{x.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-3 min-w-0 sm:mt-4">
          <legend className={legend}>Budget</legend>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {BUDGETS.map((b) => (
              <button key={b} type="button" aria-pressed={!customBudget && a.budget === b} onClick={() => { setOther(false); ask({ budget: b }); }}
                className={`${chip(!customBudget && a.budget === b)} px-2.5 sm:min-w-[3.5rem]`}>${b}</button>
            ))}
            <button type="button" aria-pressed={customBudget} onClick={() => setOther(true)} className={chip(customBudget)}>Other</button>
            {customBudget && (
              <label htmlFor="trip-budget" className="flex items-center gap-1.5 text-sm font-bold text-[#94a3b8]">
                <span className="sr-only">Your budget in dollars</span>
                <span aria-hidden className="font-black">$</span>
                <input id="trip-budget" type="number" inputMode="numeric" min={0} max={MAX_BUDGET} step={1} value={a.budget}
                  onChange={(e) => ask({ budget: Math.max(0, Math.min(MAX_BUDGET, Math.round(Number(e.target.value) || 0))) })}
                  className={`${input} w-24 text-center tabular-nums`} />
              </label>
            )}
          </div>
        </fieldset>

        <fieldset className="mt-3 min-w-0 sm:mt-4">
          <legend className={legend}>What matters first</legend>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {s.focus.map((f) => (
              <button key={f} type="button" aria-pressed={a.first === f} onClick={() => ask({ first: f })} className={chip(a.first === f)}>
                <span aria-hidden className="hidden min-[400px]:inline">{FOCUS_EMOJI[f]}</span>{FOCUS_LABEL[f]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3 sm:mt-4 sm:gap-x-6">
          <Stepper compact narrow id="trip-people" text="People" value={a.people} min={1} max={MAX_TRIP_PEOPLE} onChange={(people) => ask({ people })} />
          <Stepper compact narrow id="trip-days" text="Days" value={a.days} min={1} max={MAX_TRIP_DAYS} onChange={(days) => ask({ days })} />
        </div>

        <div aria-live="polite" className="mt-5 rounded-xl border border-[#26324c] bg-[#0c1220] px-3 py-3 sm:px-4">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">
            {s.emoji} {s.label} · {n(a.people)} {a.people === 1 ? "person" : "people"} · {n(a.days)} {a.days === 1 ? "day" : "days"} · ${n(a.budget)}
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
            {plan.water && (
              <li>
                <p className="text-sm font-black leading-snug"><span aria-hidden>💧 </span>{coverageLine("water", plan.water, a.days)}</p>
                <p className={muted}>{n(Math.floor(plan.water.after + 1e-9))} of {n(plan.water.need)} {plan.water.need === 1 ? "gallon" : "gallons"} after this trip</p>
              </li>
            )}
            {plan.food && (
              <li>
                <p className="text-sm font-black leading-snug"><span aria-hidden>🥫 </span>{coverageLine("food", plan.food, a.days)}</p>
                <p className={muted}>Food is an estimate: label calories, 2,000 a day</p>
              </li>
            )}
            {plan.light && (
              <li>
                <p className="text-sm font-black leading-snug"><span aria-hidden>🔦 </span>{n(plan.light.after)} {plan.light.after === 1 ? "light" : "lights"} for {n(plan.light.people)} {plan.light.people === 1 ? "person" : "people"}</p>
                <p className={muted}>{plan.light.have ? `${n(plan.light.have)} that work now` : "None counted at home yet"}</p>
              </li>
            )}
          </ul>
          <p className="mt-2 text-sm font-bold leading-snug text-[#e8edf5]">{budgetLine(plan)}</p>
        </div>
        <p className={`${muted} mt-2`}>
          {plan.water && <>Water: 1 gallon per person per day (<a href="https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html" target="_blank" rel="noopener noreferrer" className="underline">CDC</a>).{" "}</>}
          We can’t see store prices, so a cost is only one you type.
        </p>
      </section>

      <section aria-labelledby="trip-check" className={`${card} mt-3 px-4 py-4 sm:px-5`}>
        <h2 id="trip-check" className="text-lg font-black"><span className="pbr-accent">1</span> Check what you have <span className="text-sm font-bold text-[#94a3b8]">· free</span></h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {s.checks.includes("water") && (
            <>
              <NumberField id="home-water" label={s.id === "boil-water" ? "Bottled or boiled water you have" : "Safe water you have"} unit="gallons" value={trip.home.water} step={0.5} max={10000} onChange={(water) => home({ water })} />
              <div className="flex flex-col gap-2">
                <NumberField id="home-space" label="Empty jugs you can fill" unit="gallons of space" value={trip.home.space} step={0.5} max={10000} onChange={(space) => home({ space })} />
                {trip.home.space > 0 && (
                  <label className="flex min-h-10 items-center gap-2 text-sm font-bold text-[#e8edf5]">
                    <input type="checkbox" checked={trip.home.filled} onChange={(e) => home({ filled: e.target.checked })} className="h-5 w-5 accent-[#F97316]" />
                    {s.id === "boil-water" ? "Filled with boiled water" : "Filled with safe water"}
                  </label>
                )}
                {trip.home.space > 0 && !trip.home.filled && <p className={muted}>Empty jugs are storage, not water. They count once filled.</p>}
              </div>
            </>
          )}
          {s.checks.includes("food") && (
            <Stepper id="home-food" text={s.id === "pantry" ? "Days of meals in the pantry" : "Days of food you have"} sr="for everyone" value={trip.home.foodDays} min={0} max={30} onChange={(foodDays) => home({ foodDays })} />
          )}
          {s.checks.includes("lights") && (
            <Stepper id="home-lights" text="Lights that work" value={trip.home.lights} min={0} max={20} onChange={(lights) => home({ lights })} />
          )}
          {s.checks.includes("battery") && (
            <fieldset className="min-w-0 sm:col-span-2">
              <legend className={legend}>{s.id === "household" ? "Batteries you use most" : "Your lights take"}</legend>
              <div className="flex flex-wrap gap-2">
                {BATTERIES.map(([b, t]) => (
                  <button key={b} type="button" aria-pressed={trip.home.battery === b} onClick={() => home({ battery: b })} className={`${chip(trip.home.battery === b)} min-h-10`}>{t}</button>
                ))}
              </div>
              <p className={`${muted} mt-1`}>Look inside the battery door. How long batteries last depends on the light and how you use it.</p>
            </fieldset>
          )}
        </div>
        <ul className="mt-4 flex flex-col gap-1.5">{plan.checks.map((x) => <Sourced key={x.text} s={x} />)}</ul>
      </section>

      <section aria-labelledby="trip-buy" className={`${card} mt-3 px-4 py-4 sm:px-5`}>
        <h2 id="trip-buy" className="text-lg font-black"><span className="pbr-accent">2</span> Buy this trip</h2>
        <p className="mt-1 text-sm font-bold leading-snug text-[#e8edf5]" aria-live="polite">{budgetLine(plan)}</p>
        {now.length ? (
          <ul className="mt-1 divide-y divide-[var(--om-border)]">
            {now.map((r) => <TripRow key={`now-${r.key}`} r={r} stage="now" {...rowProps} />)}
          </ul>
        ) : (
          <p className={`${muted} mt-2`}>
            {a.budget > 0 ? "Nothing here yet. Add something from Can wait below." : "When you can spend a little, buy from the top of Can wait below."}
          </p>
        )}
        {done.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={muted}>You have:</span>
            {done.map((r) => (
              <button key={r.key} type="button" onClick={() => edit(r.key, { have: 0 })} aria-label={`Undo: I don't have ${r.label.toLowerCase()}`}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#26324c] px-3 text-xs font-bold text-[#e8edf5] hover:border-[#F97316]">
                ✓ {r.label} <span className="text-[#94a3b8] underline">undo</span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-col gap-1.5">
          <button type="button" aria-expanded={open} aria-controls="amazon-list"
            onClick={() => { setOpen((o) => !o); if (!open) measure("trip_review", a.for); }}
            className="pbr-edge inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 bg-[#F97316] px-5 text-base font-black text-[#0b1220] transition hover:brightness-110 sm:w-auto sm:self-start">
            {open ? "Hide my Amazon list" : lines ? `Review my Amazon list (${lines} ${lines === 1 ? "product" : "products"})` : "Review my list"}
          </button>
          <p className={muted}>{NOTICE}</p>
        </div>
        <div ref={panel} className="scroll-mt-4">{open && <TripAmazon plan={plan} cart={cart} />}</div>
        {!open && <div className="mt-3"><ListButtons plan={plan} /></div>}
      </section>

      {later.length > 0 && (
        <section aria-labelledby="trip-later" className={`${card} mt-3 px-4 py-4 sm:px-5`}>
          <h2 id="trip-later" className="text-lg font-black">Can wait: next trip</h2>
          <p className={`${muted} mt-1`}>{a.budget > 0 ? "Most important first. Add one to this trip if it fits." : "Most important first, for when you can spend a little."}</p>
          <ul className="mt-1 divide-y divide-[var(--om-border)]">
            {later.map((r) => <TripRow key={`later-${r.key}`} r={r} stage="later" {...rowProps} />)}
          </ul>
        </section>
      )}

      <section aria-labelledby="trip-store" className={`${card} mt-3 px-4 py-4 sm:px-5`}>
        <h2 id="trip-store" className="text-lg font-black"><span className="pbr-accent">3</span> Store and rotate</h2>
        <ul className="mt-2 flex flex-col gap-1.5">{plan.store.map((x) => <Sourced key={x.text} s={x} />)}</ul>
        <nav aria-label="More help" className="mt-3 border-t border-[#26324c] pt-3">
          <ul className="flex flex-wrap gap-2">
            {plan.links.map((l) => (
              <li key={l.href}>
                {l.official
                  ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg border border-[#26324c] px-3 text-sm font-bold text-[#e8edf5] hover:border-[#F97316]">{l.label} <span aria-hidden className="ml-1">↗</span></a>
                  : <Link href={l.href} className="inline-flex min-h-10 items-center rounded-lg border border-[#26324c] px-3 text-sm font-bold text-[#e8edf5] hover:border-[#F97316]">{l.label}</Link>}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-3 flex justify-end">
          <button type="button" className={btnSmall} onClick={() => { setOther(false); setOpen(false); change(() => freshTrip()); }}>Start over</button>
        </div>
      </section>
    </div>
  );
}
