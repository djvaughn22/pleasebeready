"use client";

// Name, occasion, who is coming and for how long. Every number is editable.

import { CLIMATE_IDS, MAX_DAYS, MAX_PEOPLE, NEED_IDS, adults } from "../../lib/stockup/calc";
import { occasionById, occasions } from "../../lib/stockup/catalog";
import type { Climate, Need, OccasionId, Plan } from "../../lib/stockup/types";
import type { PlansApi } from "./usePlans";
import { Stepper, btnPrimary, card, input, label, muted } from "./ui";

export default function PlanSetup({ plan, api, onNext }: { plan: Plan; api: PlansApi; onNext: () => void }) {
  const set = (patch: Partial<Plan>) => api.update(plan.id, (p) => ({ ...p, ...patch }));
  const setOccasion = (id: OccasionId) => {
    const o = occasionById(id);
    // Keep the visitor's name unless it is still the old occasion's default.
    const renamed = plan.name === occasionById(plan.occasion).name ? o.name : plan.name;
    set({ occasion: id, days: o.days, nights: o.nights, meals: o.meals, name: renamed });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className={`${card} flex flex-col gap-5 p-5`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan-name" className={label}>Plan name</label>
          <input id="plan-name" className={input} value={plan.name} maxLength={80}
            onChange={(e) => set({ name: e.target.value })}
            onBlur={(e) => { if (!e.target.value.trim()) set({ name: occasionById(plan.occasion).name }); }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan-occasion" className={label}>What is it for?</label>
          <select id="plan-occasion" className={input} value={plan.occasion} onChange={(e) => setOccasion(e.target.value as OccasionId)}>
            {occasions.map((o) => <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>)}
          </select>
          <p className={muted}>{occasionById(plan.occasion).hint} Changing this resets the days, nights and meals to that kind of plan. Your list stays.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan-start" className={label}>Start date (optional)</label>
          <input id="plan-start" type="date" className={`${input} max-w-[12rem]`} value={plan.start} onChange={(e) => set({ start: e.target.value })} />
        </div>
      </div>

      <div className={`${card} p-5`}>
        <h3 className="text-base font-black">Who is coming</h3>
        <p className={`mb-4 ${muted}`}>Count everyone, then say how many of them are kids or babies. Any group size up to {MAX_PEOPLE}.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Stepper id="people" text="People in total" value={plan.people} min={1} max={MAX_PEOPLE} onChange={(n) => set({ people: n })} />
          <Stepper id="kids" text="Kids (of those)" value={plan.kids} min={0} max={plan.people - plan.babies} onChange={(n) => set({ kids: n })} hint="Ages about 3 to 12." />
          <Stepper id="babies" text="Babies and toddlers" value={plan.babies} min={0} max={plan.people - plan.kids} onChange={(n) => set({ babies: n })} hint="Still in diapers." />
          <Stepper id="pets" text="Pets" value={plan.pets} min={0} max={50} onChange={(n) => set({ pets: n })} />
        </div>
        <p className={`mt-4 ${muted}`}>That is {adults(plan)} {adults(plan) === 1 ? "adult or teen" : "adults and teens"}.</p>
        <fieldset className="mt-5">
          <legend className={label}>Anyone who needs extra planning?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {NEED_IDS.map((n) => (
              <Check key={n} checked={plan.needs.includes(n)} text={needText[n]}
                onChange={(on) => set({ needs: on ? [...plan.needs, n] : plan.needs.filter((x) => x !== n) })} />
            ))}
          </div>
          <p className={`mt-2 ${muted}`}>Adds items like grab bars, backup power for devices, or a medicine plan. Follow a doctor’s advice on medical needs.</p>
        </fieldset>
      </div>

      <div className={`${card} p-5`}>
        <h3 className="text-base font-black">How long</h3>
        <p className={`mb-4 ${muted}`}>Amounts that depend on time (water, food, paper goods) scale with these.</p>
        <div className="grid gap-5 sm:grid-cols-3">
          <Stepper id="days" text="Days" value={plan.days} min={1} max={MAX_DAYS} onChange={(n) => set({ days: n })} />
          <Stepper id="nights" text="Nights away or hosting" value={plan.nights} min={0} max={MAX_DAYS} onChange={(n) => set({ nights: n })} />
          <Stepper id="meals" text="Meals a day you provide" value={plan.meals} min={0} max={6} onChange={(n) => set({ meals: n })} hint="Used for plates, cups and napkins." />
        </div>
        <fieldset className="mt-5">
          <legend className={label}>Expected weather</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {CLIMATE_IDS.map((c) => (
              <Check key={c} checked={plan.climate.includes(c) || !!occasionById(plan.occasion).implies?.includes(c)}
                disabled={!!occasionById(plan.occasion).implies?.includes(c)} text={climateText[c]}
                onChange={(on) => set({ climate: on ? [...plan.climate, c] : plan.climate.filter((x) => x !== c) })} />
            ))}
          </div>
        </fieldset>
      </div>

      <button type="button" className={`${btnPrimary} self-start`} onClick={onNext}>See suggestions →</button>
    </div>
  );
}

const needText: Record<Need, string> = {
  kids: "Kids", babies: "Babies", pets: "Pets",
  older: "Older adults", mobility: "Walker, wheelchair or limited mobility", medical: "Medical devices, allergies or diabetes",
};
const climateText: Record<Climate, string> = { cold: "❄️ Cold or snow", hot: "☀️ Hot", wet: "🌧️ Rain or flooding" };

function Check({ checked, text, onChange, disabled }: { checked: boolean; text: string; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold ${checked ? "border-[#34D399]" : "border-[#26324c]"} ${disabled ? "opacity-75" : ""}`}>
      <input type="checkbox" className="h-5 w-5 shrink-0" style={{ accentColor: "#34D399" }} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {text}
    </label>
  );
}
