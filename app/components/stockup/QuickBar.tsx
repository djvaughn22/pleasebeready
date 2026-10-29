"use client";

// The two numbers that drive every amount, always in reach above the shop:
// how many people, and how long to stock up for.

import { DURATIONS, MAX_PEOPLE, durationLabel, withDays } from "../../lib/stockup/calc";
import type { Plan } from "../../lib/stockup/types";
import type { PlansApi } from "./usePlans";
import { Stepper, inset, label } from "./ui";

export default function QuickBar({ plan, api }: { plan: Plan; api: PlansApi }) {
  const custom = !DURATIONS.some((d) => d.days === plan.days);
  return (
    <div className={`${inset} flex flex-col gap-3 p-4`}>
      <Stepper compact id="qb-people" text="People" value={plan.people} min={1} max={MAX_PEOPLE}
        onChange={(n) => api.update(plan.id, (p) => ({ ...p, people: n }))} />
      <fieldset>
        <legend className={label}>Stock up for {custom ? durationLabel(plan.days) : ""}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DURATIONS.map((d) => {
            const on = d.days === plan.days;
            return (
              <button key={d.days} type="button" aria-pressed={on}
                onClick={() => api.update(plan.id, (p) => withDays(p, d.days))}
                className={`min-h-10 rounded-full border px-3 text-sm font-black transition ${on ? "border-[#34D399] bg-[#34D399] text-[#0b1220]" : "border-[#26324c] bg-[#1c2740] text-[#e8edf5] hover:border-[#34D399]"}`}>
                {on && <span aria-hidden>✓ </span>}{d.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
