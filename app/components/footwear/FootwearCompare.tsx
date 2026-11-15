"use client";

// Compare shoes and boots on four things — tread, traction, miles, price —
// using only what a source states (app/lib/footwear/catalog.ts). Miles and
// price are the shopper's own numbers; nothing typed here leaves the page.

import { useEffect, useMemo, useRef, useState } from "react";
import { amazonSearchUrl } from "../../lib/gear";
import { measure } from "../../lib/measure";
import {
  ACTIVITIES,
  CHECKED_ON,
  MAX_COMPARE,
  MILE_RANGES,
  SURFACES,
  costPerMile,
  shoesFor,
  surfaceGaps,
  weeksLasting,
  type Activity,
  type Fact,
  type Shoe,
  type Surface,
} from "../../lib/footwear/catalog";

const A = "#F97316";
const label = "block text-sm font-black text-[#e8edf5]";
const input = "mt-1 w-28 rounded-lg border border-[#26324c] bg-[#0c1220] px-3 py-2 text-base font-bold text-[#e8edf5] focus:border-[#F97316] focus:outline-none";
const chipBase = "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold transition";

function num(v: string): number {
  const n = Number(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function FactLine({ fact, empty = "Not published" }: { fact?: Fact; empty?: string }) {
  if (!fact) return <span className="text-[#94a3b8]">{empty}</span>;
  return (
    <span>
      {fact.text}{" "}
      <a href={fact.source.url} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-xs font-bold text-[#94a3b8] underline decoration-[#26324c] underline-offset-2 hover:text-[#e8edf5]">
        {fact.source.label} ↗
      </a>
    </span>
  );
}

function Row({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-[#26324c] py-2 sm:grid-cols-[6.5rem_1fr] sm:gap-3">
      <dt className="text-xs font-black uppercase tracking-wide text-[#94a3b8]">{name}</dt>
      <dd className="text-sm font-semibold leading-6 text-[#e8edf5]">{children}</dd>
    </div>
  );
}

export default function FootwearCompare() {
  const [activity, setActivity] = useState<Activity>("hike");
  const [weekly, setWeekly] = useState("10");
  const [low, setLow] = useState(String(MILE_RANGES.hike.low));
  const [high, setHigh] = useState(String(MILE_RANGES.hike.high));
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [budget, setBudget] = useState("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const counted = useRef(new Set<string>());

  const shoes = useMemo(() => shoesFor(activity), [activity]);
  const range = MILE_RANGES[activity];
  const weeks = weeksLasting(num(weekly), num(low), num(high));
  const chosen = picked.map((id) => shoes.find((s) => s.id === id)).filter((s): s is Shoe => Boolean(s));

  // Count real use of the comparison (two or more side by side), once per mix.
  useEffect(() => {
    if (chosen.length < 2) return;
    const key = `${activity}-${chosen.length}`;
    if (counted.current.has(key)) return;
    counted.current.add(key);
    measure("footwear_compare", key);
  }, [activity, chosen.length]);

  function pickActivity(a: Activity) {
    setActivity(a);
    setLow(String(MILE_RANGES[a].low));
    setHigh(String(MILE_RANGES[a].high));
    setPicked([]);
  }

  function toggleSurface(s: Surface) {
    setSurfaces((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  function toggleCompare(id: string) {
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_COMPARE ? cur : [...cur, id]));
  }

  const perMile = (s: Shoe) => costPerMile(num(prices[s.id] ?? ""), num(low), num(high));
  const overBudget = (s: Shoe) => num(budget) > 0 && num(prices[s.id] ?? "") > num(budget);

  return (
    <div>
      {/* 1. What are you doing? */}
      <fieldset className="mt-6">
        <legend className={label}>What are you doing?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ACTIVITIES.map((a) => {
            const on = a.id === activity;
            return (
              <button key={a.id} type="button" aria-pressed={on} onClick={() => pickActivity(a.id)}
                className={`${chipBase} ${on ? "border-[#F97316] bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#141d2e] text-[#e8edf5] hover:border-[#F97316]"}`}>
                {a.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 2–4. Miles, surfaces, budget */}
      <div className="mt-5 grid gap-5 rounded-2xl border border-[#26324c] bg-[#141d2e] p-4 sm:grid-cols-2">
        <div>
          <label className={label}>
            Miles a week
            <input inputMode="decimal" value={weekly} onChange={(e) => setWeekly(e.target.value)} className={input} aria-describedby="fw-weeks" />
          </label>
          <p className="mt-3 text-sm font-black text-[#e8edf5]">If a pair lasts</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-[#94a3b8]">
            <input aria-label="Fewest miles" inputMode="numeric" value={low} onChange={(e) => setLow(e.target.value)} className={input} />
            to
            <input aria-label="Most miles" inputMode="numeric" value={high} onChange={(e) => setHigh(e.target.value)} className={input} />
            miles
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#94a3b8]">
            {range.basis}
            {range.source && (
              <>
                {" "}
                <a href={range.source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-[#26324c] underline-offset-2 hover:text-[#e8edf5]">
                  {range.source.label} ↗
                </a>
              </>
            )}{" "}
            Change it to what you have seen.
          </p>
          <p id="fw-weeks" className="mt-2 text-sm font-bold text-[#e8edf5]">
            {weeks ? `That is about ${weeks.from} to ${weeks.to} weeks at ${num(weekly)} miles a week. An estimate, not a test.` : "Add your miles to see how long that is."}
          </p>
        </div>
        <div>
          <p className={label}>Surfaces</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SURFACES.map((s) => {
              const on = surfaces.includes(s.id);
              return (
                <button key={s.id} type="button" aria-pressed={on} onClick={() => toggleSurface(s.id)}
                  className={`${chipBase} ${on ? "border-[#F97316] text-[#e8edf5]" : "border-[#26324c] text-[#94a3b8] hover:border-[#F97316]"}`}>
                  {on ? "✓ " : ""}{s.label}
                </button>
              );
            })}
          </div>
          <label className={`${label} mt-5`}>
            Budget, if you have one ($)
            <input inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} className={input} placeholder="Optional" />
          </label>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#94a3b8]">
            We can&apos;t check prices live, so none are shown. Type the price you see on a pair below to get its cost per mile.
          </p>
        </div>
      </div>

      {/* Results */}
      <h2 className="mt-8 text-xl font-black">
        {shoes.length} {shoes.length === 1 ? "pick" : "picks"} for {ACTIVITIES.find((a) => a.id === activity)?.label.toLowerCase()}
      </h2>
      <p className="mt-1 text-sm font-semibold text-[#94a3b8]">Tick up to {MAX_COMPARE} to see them side by side.</p>
      <ul className="mt-4 grid gap-4">
        {shoes.map((s) => {
          const gaps = surfaceGaps(s, surfaces);
          const cpm = perMile(s);
          const on = picked.includes(s.id);
          const full = !on && picked.length >= MAX_COMPARE;
          return (
            <li key={s.id} className="rounded-2xl border border-[#26324c] bg-[#141d2e] p-4" style={on ? { borderColor: A } : undefined} data-testid="fw-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-black leading-snug">{s.name}</h3>
                  <p className="text-sm font-semibold text-[#94a3b8]">{s.kind}</p>
                </div>
                <label className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-bold ${full ? "border-[#26324c] text-[#5b6b86]" : "border-[#26324c] text-[#e8edf5]"}`}>
                  <input type="checkbox" checked={on} disabled={full} onChange={() => toggleCompare(s.id)} className="h-4 w-4 accent-[#F97316]" />
                  Compare
                </label>
              </div>
              <dl className="mt-3">
                <Row name="Tread">
                  <FactLine fact={s.tread.outsole} empty="Outsole: not published" />
                  {s.tread.lugs && <><br /><FactLine fact={s.tread.lugs} /></>}
                  {s.tread.resole && <><br /><FactLine fact={s.tread.resole} /></>}
                </Row>
                <Row name="Traction">
                  <FactLine fact={s.traction.madeFor} />
                  {gaps.length > 0 && (
                    <span className="mt-1 block text-[#fbbf24]">
                      Not listed for: {gaps.map((g) => SURFACES.find((x) => x.id === g)?.label.toLowerCase()).join(", ")}
                    </span>
                  )}
                </Row>
                <Row name="Miles">
                  <span className="text-[#94a3b8]">No published wear rating.</span>{" "}
                  {weeks ? `At your numbers, about ${weeks.from} to ${weeks.to} weeks.` : ""}
                </Row>
                <Row name="Price">
                  <label className="inline-flex flex-wrap items-center gap-2">
                    <span className="text-[#94a3b8]">Price you see ($)</span>
                    <input inputMode="decimal" value={prices[s.id] ?? ""} onChange={(e) => setPrices((p) => ({ ...p, [s.id]: e.target.value }))} className={`${input} mt-0`} aria-label={`Price you see for ${s.name}`} />
                  </label>
                  {cpm && (
                    <span className="mt-1 block font-black">
                      {cpm.best} to {cpm.worst} a mile
                      {overBudget(s) && <span className="ml-2 text-[#fbbf24]">Over your budget</span>}
                    </span>
                  )}
                </Row>
                {s.extras.length > 0 && (
                  <Row name="Also">
                    {s.extras.map((f, i) => (
                      <span key={i} className="block"><FactLine fact={f} /></span>
                    ))}
                  </Row>
                )}
              </dl>
              <a href={amazonSearchUrl(s.search)} target="_blank" rel="noopener noreferrer sponsored"
                data-measure="shop" data-measure-label={`footwear-s-${s.id}`}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-black text-[#0b1220] transition hover:opacity-90"
                style={{ background: A }}>
                Search Amazon for this pair ↗
              </a>
            </li>
          );
        })}
      </ul>

      {/* Side by side */}
      {chosen.length >= 2 && (
        <section aria-labelledby="fw-side" className="mt-8" data-testid="fw-compare">
          <h2 id="fw-side" className="text-xl font-black">Side by side</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-[#26324c]">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#1c2740]">
                  <th scope="col" className="p-3 text-xs font-black uppercase text-[#94a3b8]"> </th>
                  {chosen.map((s) => (
                    <th key={s.id} scope="col" className="p-3 font-black">{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="align-top font-semibold">
                {[
                  { name: "Outsole", cell: (s: Shoe) => s.tread.outsole?.text ?? "Not published" },
                  { name: "Lugs", cell: (s: Shoe) => s.tread.lugs?.text ?? "Not published" },
                  { name: "Resole", cell: (s: Shoe) => s.tread.resole?.text ?? "Not published" },
                  { name: "Made for", cell: (s: Shoe) => s.traction.madeFor.text },
                  { name: "Wear rating", cell: () => "Not published (no shoe has one)" },
                  { name: "Cost per mile", cell: (s: Shoe) => { const c = perMile(s); return c ? `${c.best} to ${c.worst}` : "Add the price you see"; } },
                ].map((r) => (
                  <tr key={r.name} className="border-t border-[#26324c]">
                    <th scope="row" className="p-3 text-xs font-black uppercase text-[#94a3b8]">{r.name}</th>
                    {chosen.map((s) => (
                      <td key={s.id} className="p-3 text-[#e8edf5]">{r.cell(s)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-8 text-xs font-semibold leading-6 text-[#94a3b8]">
        Facts checked {CHECKED_ON}. Makers change models; check the listing before you buy.
      </p>
    </div>
  );
}
