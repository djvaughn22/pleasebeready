"use client";

// Steps 1 and 2: who is in the household, how long to plan for, and any
// situations to plan for. Counts and yes/no boxes only: no names, no ages,
// nothing typed freely.

import { MAX_PEOPLE, MAX_PETS, horizonDays, OFFICIAL_DAYS } from "../../lib/planner/calc";
import { scenarios } from "../../lib/planner/catalog";
import type { Horizon, HorizonMode } from "../../lib/planner/types";
import type { Planner } from "./usePlanner";
import { A, CheckTile, card, input, label, Section, Stepper } from "./ui";

const PRESETS: { mode: HorizonMode; text: string }[] = [
  { mode: "3d", text: "3 days" },
  { mode: "2w", text: "2 weeks" },
  { mode: "1m", text: "1 month" },
  { mode: "custom", text: "Longer" },
];

export default function SetupPanel({ p }: { p: Planner }) {
  const { household: h, horizon, scenarios: picked, hotWeather } = p.state;
  const days = horizonDays(horizon);

  const chooseMode = (mode: HorizonMode) => p.setHorizon({ mode } as Partial<Horizon>);

  return (
    <>
      <Section id="household" step={1} title="Your household"
        intro="Counts only. No names, and nothing about your household leaves this device.">
        <div className={`${card} p-5 sm:p-6`}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Stepper id="hh-people" text="People at home" value={h.people} min={1} max={MAX_PEOPLE}
              onChange={(n) => p.setHousehold({ people: n })} />
            <Stepper id="hh-children" text="Children under 18" value={h.children} min={0} max={h.people}
              onChange={(n) => p.setHousehold({ children: n })} hint="Included in people at home." />
            <Stepper id="hh-babies" text="Babies (diapers or formula)" value={h.babies} min={0} max={h.children}
              onChange={(n) => p.setHousehold({ babies: n })} hint="Included in children." />
            <Stepper id="hh-older" text="Adults 65 and older" value={h.olderAdults} min={0} max={h.people - h.children}
              onChange={(n) => p.setHousehold({ olderAdults: n })} hint="Included in people at home." />
            <Stepper id="hh-pets" text="Pets and service animals" value={h.pets} min={0} max={MAX_PETS}
              onChange={(n) => p.setHousehold({ pets: n })} />
          </div>

          <fieldset className="mt-6">
            <legend className={label}>Anything that changes what you would need (optional)</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <CheckTile checked={h.takesMeds} onChange={(v) => p.setHousehold({ takesMeds: v })}
                title="Someone takes daily prescription medicine" />
              <CheckTile checked={h.electricMedical} onChange={(v) => p.setHousehold({ electricMedical: v })}
                title="Someone uses electric medical equipment, or medicine that must stay cold" />
              <CheckTile checked={h.mobility} onChange={(v) => p.setHousehold({ mobility: v })}
                title="Someone uses a wheelchair, cane or walker" />
              <CheckTile checked={h.senseComm} onChange={(v) => p.setHousehold({ senseComm: v })}
                title="Someone has hearing, vision or speech needs" />
            </div>
          </fieldset>
        </div>
      </Section>

      <Section id="length" step={2} title="How long, and what for"
        intro="Pick how long you want to be covered at home. The situations are optional; leave them all off for a general plan.">
        <div className={`${card} p-5 sm:p-6`}>
          <fieldset>
            <legend className={label}>Plan for</legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Plan length">
              {PRESETS.map((o) => {
                const on = horizon.mode === o.mode;
                return (
                  <label key={o.mode}
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm font-black ${on ? "border-[#34D399] bg-[#1c2740] text-[#e8edf5]" : "border-[#26324c] bg-[#0c1220] text-[#94a3b8]"}`}
                    style={on ? { boxShadow: `inset 0 0 0 1px ${A}` } : undefined}>
                    <input type="radio" name="plan-length" className="sr-only" checked={on} onChange={() => chooseMode(o.mode)} />
                    {on && <span aria-hidden>✓</span>}{o.text}
                  </label>
                );
              })}
            </div>

            {horizon.mode === "custom" && (
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <Stepper id="len-amount" text="How many" value={horizon.amount} min={1} max={horizon.unit === "months" ? 12 : 52}
                  onChange={(n) => p.setHorizon({ amount: n })} />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="len-unit" className={label}>Weeks or months</label>
                  <select id="len-unit" value={horizon.unit}
                    onChange={(e) => p.setHorizon({ unit: e.target.value === "months" ? "months" : "weeks" })}
                    className={`${input} pr-8`}>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
              </div>
            )}

            <p className="mt-3 text-xs font-semibold leading-5 text-[#94a3b8]">
              That is {days} days. A month is counted as 30 days.
              {days > OFFICIAL_DAYS && " The Red Cross and Ready.gov give amounts up to 2 weeks at home. Past that we keep multiplying the same daily amounts, and we mark those as our math, not an official figure."}
            </p>
          </fieldset>

          <fieldset className="mt-6">
            <legend className={label}>What to plan for (optional)</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {scenarios.map((s) => (
                <CheckTile key={s.id} checked={picked.includes(s.id)} onChange={() => p.toggleScenario(s.id)}
                  title={`${s.emoji} ${s.label}`}>{s.hint}</CheckTile>
              ))}
            </div>
            <div className="mt-2">
              <CheckTile checked={hotWeather} onChange={p.setHotWeather} title="Very hot weather: plan double the water">
                Ready.gov says water needs can double in very hot temperatures.
              </CheckTile>
            </div>
          </fieldset>
        </div>
      </Section>
    </>
  );
}
