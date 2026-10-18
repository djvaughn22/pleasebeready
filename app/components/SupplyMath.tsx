"use client";

// Free household water/food math. Two numbers in, nothing stored or sent.

import { useState } from "react";
import { supplyMath } from "../lib/readiness";

const A = "#34D399";
const DAY_CHOICES = [3, 14];

export default function SupplyMath() {
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(3);
  const { gallons, personDays } = supplyMath(people, days);

  return (
    <section id="supply-math" aria-labelledby="supply-title" className="mb-12 scroll-mt-20 rounded-2xl border border-[#26324c] bg-[#141d2e] p-6">
      <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: A }}>Tool</p>
      <h2 id="supply-title" className="mt-1 text-xl font-black">Household supply math</h2>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#94a3b8]">
        How much water and food to keep on hand. Nothing you enter is saved or sent.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-5">
        <label className="flex flex-col gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">
          People at home
          <span className="flex items-center gap-2">
            <button type="button" aria-label="One fewer person" onClick={() => setPeople((n) => Math.max(1, n - 1))}
              className="h-10 w-10 rounded-lg border border-[#26324c] bg-[#1c2740] text-lg font-black text-[#e8edf5]">−</button>
            <input type="number" inputMode="numeric" min={1} max={20} value={people}
              onChange={(e) => setPeople(Number(e.target.value) || 1)}
              className="h-10 w-16 rounded-lg border border-[#26324c] bg-[#0c1220] text-center text-base font-black text-[#e8edf5]" />
            <button type="button" aria-label="One more person" onClick={() => setPeople((n) => Math.min(20, n + 1))}
              className="h-10 w-10 rounded-lg border border-[#26324c] bg-[#1c2740] text-lg font-black text-[#e8edf5]">+</button>
          </span>
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">How long</legend>
          <div className="flex gap-2">
            {DAY_CHOICES.map((d) => (
              <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)}
                style={days === d ? { borderColor: A, boxShadow: `inset 0 0 0 1px ${A}` } : undefined}
                className={`h-10 rounded-lg border px-4 text-sm font-black ${days === d ? "border-[#34D399] bg-[#1c2740] text-[#e8edf5]" : "border-[#26324c] bg-[#0c1220] text-[#94a3b8]"}`}>
                {days === d ? "✓ " : ""}{d === 3 ? "3 days" : "2 weeks"}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2" aria-live="polite">
        <div className="rounded-xl border border-[#26324c] bg-[#0c1220] p-4">
          <dt className="text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">Water</dt>
          <dd className="mt-1 text-2xl font-black">{gallons} gallons</dd>
          <dd className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">1 gallon per person per day, for drinking and cleaning (Ready.gov).</dd>
        </div>
        <div className="rounded-xl border border-[#26324c] bg-[#0c1220] p-4">
          <dt className="text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">Food</dt>
          <dd className="mt-1 text-2xl font-black">{personDays} person-days</dd>
          <dd className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
            One person-day is a day of no-cook meals for one person ({people} × {days}). Keep a manual can opener with it.
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs font-semibold leading-5 text-[#94a3b8]">
        Pets need their own food and water too. Children, nursing mothers, sick people, and hot weather may call for more water (Ready.gov).
      </p>
    </section>
  );
}
