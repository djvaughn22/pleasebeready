"use client";

// Get Ready setup: five short questions, then the plan. Kids, pets and special
// needs are optional, behind one toggle. Editing an existing plan keeps every
// mark on it; only the answers here change.

import { useMemo, useState } from "react";
import { isEmergencyKind, needAt, PACES, planItems, SIZES } from "../../lib/ready/engine";
import { CLIMATE_IDS, DURATIONS, MAX_DAYS, MAX_PEOPLE, NEED_IDS, clampPlan, durationLabel, withDays } from "../../lib/stockup/calc";
import { itemById, occasionById, occasions } from "../../lib/stockup/catalog";
import { newPlan } from "../../lib/stockup/storage";
import type { Climate, Line, Need, OccasionId, Pace, Plan } from "../../lib/stockup/types";
import { useLists } from "../shop/ListsProvider";
import { Check } from "../stockup/PlanSetup";
import { Stepper, btn, btnPrimary, card, input, label, muted } from "../stockup/ui";

/** Things the setup asks about for an emergency plan, besides water and food. */
const ASK_HAVE = ["meds", "flashlights", "batteries", "first-aid-kit", "weather-radio", "power-bank", "manual-can-opener", "toilet-paper", "trash-bags"];
const SITUATIONS: OccasionId[] = ["emergency", "outage", "winter", "hurricane", "heat", "wildfire", "flood"];

const needText: Record<Need, string> = { kids: "Kids", babies: "Babies", pets: "Pets", older: "Older adults", mobility: "Walker, wheelchair or limited mobility", medical: "Medical devices, diabetes or medicine kept cold" };
const climateText: Record<Climate, string> = { cold: "❄️ Cold or snow", hot: "☀️ Extreme heat", wet: "🌧️ Rain or flooding" };
/** Lengths to pick from: stocking up for emergencies, or the short ones an event or trip needs. */
const lengths = (o: OccasionId) => isEmergencyKind(o) ? DURATIONS
  : [{ days: 1, label: "1 day" }, { days: 2, label: "2 days" }, ...DURATIONS.slice(0, 4)];
const fresh = (): Line => ({ qty: null, have: 0, got: false });

type Answers = {
  occasion: OccasionId; people: number; kids: number; babies: number; pets: number; needs: Need[]; climate: Climate[];
  days: number; pace: Pace; every: number; size: number; water: number; containers: number; foodDays: number; owned: string[];
};

function draftOf(a: Answers, base?: Plan): Plan {
  const start = base && base.occasion === a.occasion ? base : { ...newPlan(a.occasion), ...(base ? { id: base.id, list: base.list, created: base.created, name: base.name } : {}) };
  const p = withDays({ ...start, people: a.people, kids: a.kids, babies: a.babies, pets: a.pets, needs: a.needs, climate: a.climate }, a.days);
  return clampPlan({ ...p, guide: { pace: a.pace, every: a.every, size: a.size, started: base?.guide?.started ?? new Date().toISOString().slice(0, 10) } });
}

function answersOf(p: Plan | null): Answers {
  if (!p) return { occasion: "emergency", people: 4, kids: 0, babies: 0, pets: 0, needs: [], climate: [], days: 14, pace: "weekly", every: 7, size: 6, water: 0, containers: 0, foodDays: 0, owned: [] };
  const owned = ASK_HAVE.filter((id) => { const i = itemById(id); const l = p.list[id]; return i && l && (i.kind === "task" ? l.got : l.have >= needAt(i, p)); });
  return {
    occasion: p.occasion, people: p.people, kids: p.kids, babies: p.babies, pets: p.pets, needs: p.needs, climate: p.climate, days: p.days,
    pace: p.guide?.pace ?? "weekly", every: p.guide?.every ?? 7, size: p.guide?.size ?? 6,
    water: p.list.water?.have ?? 0, containers: p.list["water-storage-container"]?.have ?? 0, foodDays: Math.floor((p.list["shelf-food"]?.have ?? 0) / Math.max(1, p.people)), owned,
  };
}

export default function ReadySetup({ plan, onDone, onCancel }: { plan: Plan | null; onDone: (id: string) => void; onCancel?: () => void }) {
  const api = useLists();
  const [a, setA] = useState<Answers>(() => answersOf(plan));
  const [more, setMore] = useState(() => !!plan && (plan.kids + plan.babies + plan.pets > 0 || plan.needs.length > 0 || plan.climate.length > 0));
  const [customDays, setCustomDays] = useState(() => !lengths(a.occasion).some((d) => d.days === a.days));
  const set = (patch: Partial<Answers>) => setA((cur) => ({ ...cur, ...patch }));
  const draft = useMemo(() => draftOf(a, plan ?? undefined), [a, plan]);
  const emergency = isEmergencyKind(a.occasion);
  // A non-emergency plan asks about its own first essentials instead.
  const askHave = useMemo(() => emergency
    ? ASK_HAVE.filter((id) => planItems(draft).rows.some((r) => r.item.id === id))
    : planItems(draft).rows.filter((r) => r.tier === "essential" && r.item.kind === "product").slice(0, 8).map((r) => r.item.id), [draft, emergency]);
  const before = useMemo(() => new Set(answersOf(plan).owned), [plan]);

  const finish = () => {
    const list: Record<string, Line> = { ...draft.list };
    const put = (id: string, have: number) => { list[id] = { ...(list[id] ?? fresh()), have }; };
    if (emergency) {
      const was = answersOf(plan);
      if (a.water !== was.water) put("water", a.water);
      if (a.containers !== was.containers) put("water-storage-container", a.containers);
      if (a.foodDays !== was.foodDays) put("shelf-food", a.foodDays * a.people);
    }
    for (const id of askHave) {
      const item = itemById(id)!;
      const on = a.owned.includes(id);
      // Still ticked from before: keep the count the visitor had, even if the plan grew.
      if (on && before.has(id)) continue;
      if (on && item.kind === "task") list[id] = { ...(list[id] ?? fresh()), got: true };
      else if (on) put(id, Math.max(list[id]?.have ?? 0, needAt(item, draft)));
      else if (before.has(id) && list[id]) list[id] = { ...list[id], have: 0 };
    }
    const next = { ...draft, list, name: plan ? plan.name : emergency ? `${a.occasion === "emergency" ? "Emergency" : occasionById(a.occasion).label} plan` : occasionById(a.occasion).name };
    if (plan) {
      api.update(plan.id, () => next);
      onDone(plan.id);
    } else {
      const { id: _i, created: _c, updated: _u, ...patch } = next;
      void _i; void _c; void _u;
      onDone(api.create(a.occasion, patch));
    }
  };

  const days = (d: number) => set({ days: Math.min(MAX_DAYS, Math.max(1, d)) });

  return (
    <form className="pbr-planner flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); finish(); }}>
      <Question n={1} title="What are you getting ready for?">
        <select aria-label="What are you getting ready for?" className={`${input} w-full sm:max-w-sm`} value={a.occasion}
          onChange={(e) => {
            const o = e.target.value as OccasionId;
            const d = isEmergencyKind(o) ? a.days : occasionById(o).days;
            set({ occasion: o, days: d, owned: [] });
            setCustomDays(!lengths(o).some((x) => x.days === d));
          }}>
          <optgroup label="Emergencies">
            {SITUATIONS.map((id) => <option key={id} value={id}>{id === "emergency" ? "🏠 Household emergency supplies" : `${occasionById(id).emoji} ${occasionById(id).label}`}</option>)}
          </optgroup>
          <optgroup label="Everything else">
            {occasions.filter((o) => !SITUATIONS.includes(o.id)).map((o) => <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>)}
          </optgroup>
        </select>
      </Question>

      <Question n={2} title="How many people?">
        <Stepper id="ready-people" text="People in total" value={a.people} min={1} max={MAX_PEOPLE}
          onChange={(v) => set({ people: v, kids: Math.min(a.kids, v - a.babies), babies: Math.min(a.babies, v) })} />
        <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="mt-3 text-left text-sm font-black pbr-accent hover:underline">
          {more ? "− Hide" : "+ Add"} kids, pets or special needs
        </button>
        {more && (
          <div className="mt-3 flex flex-col gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Stepper compact id="ready-kids" text="Kids (of those)" value={a.kids} min={0} max={a.people - a.babies} onChange={(v) => set({ kids: v })} />
              <Stepper compact id="ready-babies" text="Babies" value={a.babies} min={0} max={a.people - a.kids} onChange={(v) => set({ babies: v })} />
              <Stepper compact id="ready-pets" text="Pets" value={a.pets} min={0} max={50} onChange={(v) => set({ pets: v })} />
            </div>
            <fieldset>
              <legend className={label}>Anyone who needs extra planning?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {NEED_IDS.map((n) => <Check key={n} checked={a.needs.includes(n)} text={needText[n]} onChange={(on) => set({ needs: on ? [...a.needs, n] : a.needs.filter((x) => x !== n) })} />)}
              </div>
            </fieldset>
            <fieldset>
              <legend className={label}>Weather where you live</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {CLIMATE_IDS.map((c) => <Check key={c} checked={a.climate.includes(c)} text={climateText[c]} onChange={(on) => set({ climate: on ? [...a.climate, c] : a.climate.filter((x) => x !== c) })} />)}
              </div>
            </fieldset>
          </div>
        )}
      </Question>

      <Question n={3} title="For how long?">
        <Chips name="days" value={customDays ? "custom" : String(a.days)} onChange={(v) => { if (v === "custom") setCustomDays(true); else { setCustomDays(false); days(Number(v)); } }}
          options={[...lengths(a.occasion).map((d) => ({ value: String(d.days), text: d.label })), { value: "custom", text: "Custom" }]} />
        {customDays && <div className="mt-3"><Stepper compact id="ready-days" text="Days" hint={durationLabel(a.days)} value={a.days} min={1} max={MAX_DAYS} onChange={days} /></div>}
        {emergency && a.days > 3 && <p className={`mt-2 ${muted}`}>A slow plan builds a 3-day base of every essential first, then grows to {durationLabel(a.days)}.</p>}
      </Question>

      <Question n={4} title="How fast?">
        <Chips name="pace" value={a.pace} onChange={(v) => { const p = PACES.find((x) => x.id === v)!; set({ pace: p.id, every: p.every, size: p.id === "now" ? p.size : a.pace === "now" ? p.size : a.size }); }}
          options={PACES.map((p) => ({ value: p.id, text: p.label, hint: p.hint }))} />
        {a.pace !== "now" && (
          <div className="mt-3 flex flex-col gap-3">
            {a.pace === "custom" && <Stepper compact id="ready-every" text="Days between shopping trips" value={a.every} min={1} max={90} onChange={(v) => set({ every: v })} />}
            <div>
              <p className={`${muted} mb-1.5`}>How much per trip? We don’t show prices, so a budget here is how many things you buy each time.</p>
              <Chips name="size" value={String(a.size)} onChange={(v) => set({ size: Number(v) })}
                options={SIZES.map((s) => ({ value: String(s.size), text: `${s.label} · ${s.size} things` }))} />
            </div>
          </div>
        )}
      </Question>

      <Question n={5} title="What do you already have?" hint="Skip anything you’re not sure about. You can mark more on the plan.">
        {emergency && (
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-3">
            <Stepper compact id="ready-water" text="Gallons of drinking water stored" value={a.water} min={0} max={100000} onChange={(v) => set({ water: v })} />
            <Stepper compact id="ready-containers" text="Empty water containers" value={a.containers} min={0} max={1000} onChange={(v) => set({ containers: v })} />
            <Stepper compact id="ready-food" text="Days of food for everyone already" value={a.foodDays} min={0} max={MAX_DAYS} onChange={(v) => set({ foodDays: v })} />
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-3">
          {askHave.map((id) => (
            <Check key={id} checked={a.owned.includes(id)} text={id === "meds" ? "A week of everyone’s medicines" : itemById(id)!.name}
              onChange={(on) => set({ owned: on ? [...a.owned, id] : a.owned.filter((x) => x !== id) })} />
          ))}
        </div>
      </Question>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={`pbr-edge ${btnPrimary}`}>{plan ? "Update my plan" : "Make my plan"} →</button>
        {onCancel && <button type="button" className={btn} onClick={onCancel}>Cancel</button>}
      </div>
      {plan && <p className={muted}>Your marks stay: what you have, bought and saved carry over when the numbers change.</p>}
    </form>
  );
}

function Question({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`q${n}`} className={`${card} p-4 sm:p-5`}>
      <h2 id={`q${n}`} className="pbr-display mb-3 flex items-baseline gap-2 text-lg font-black">
        <span aria-hidden className="pbr-accent">{n}</span>{title}
      </h2>
      {hint && <p className={`-mt-2 mb-3 ${muted}`}>{hint}</p>}
      {children}
    </section>
  );
}

function Chips({ name, value, options, onChange }: { name: string; value: string; options: { value: string; text: string; hint?: string }[]; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className={`flex min-h-11 cursor-pointer flex-col justify-center rounded-xl border px-3 py-1.5 text-sm font-black ${value === o.value ? "pbr-edge bg-[#F97316] text-[#0b1220]" : "border-[#26324c] bg-[#141d2e] text-[#e8edf5]"}`}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
          {o.text}
          {o.hint && <span className={`text-[0.7rem] font-bold ${value === o.value ? "" : "text-[#94a3b8]"}`}>{o.hint}</span>}
        </label>
      ))}
    </div>
  );
}
