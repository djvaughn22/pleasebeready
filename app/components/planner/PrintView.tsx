// What prints: a plain, black-on-white version of the plan. Hidden on screen.
// It reads the same resolved plan the checklist uses, so print and screen agree.

import { formatEstimate, formatMoney, formatQuantity, horizonLabel, planQuantity, remainingQuantity, stateFor, type Summary } from "../../lib/planner/calc";
import { buckets, scenarios } from "../../lib/planner/catalog";
import { formatDate, sources } from "../../lib/planner/sources";
import type { PlanState, ResolvedItem } from "../../lib/planner/types";

const STATUS_TEXT = { needs: "Need", have: "Have", skip: "Skip" } as const;

export default function PrintView({ state, resolved, summary }: { state: PlanState; resolved: ResolvedItem[]; summary: Summary }) {
  const h = state.household;
  const picked = scenarios.filter((s) => state.scenarios.includes(s.id)).map((s) => s.label);
  return (
    <div className="hidden print:block">
      <h1 className="text-2xl font-black">PleaseBeReady household plan</h1>
      <p className="text-sm">
        {h.people} {h.people === 1 ? "person" : "people"}
        {h.children > 0 && `, ${h.children} under 18`}
        {h.olderAdults > 0 && `, ${h.olderAdults} aged 65+`}
        {h.pets > 0 && `, ${h.pets} ${h.pets === 1 ? "pet or service animal" : "pets or service animals"}`}
        {" "}· Planning for {horizonLabel(state.horizon)}
        {picked.length > 0 && ` · ${picked.join(", ")}`}
        {state.hotWeather && " · double water for hot weather"}
      </p>
      <p className="text-sm">
        Still to get: about {formatEstimate(summary.totals.needed)} · already have about {formatEstimate(summary.totals.owned)}
        {summary.budget !== null && ` · budget ${formatMoney(summary.budget)}`}. Costs are rough planning figures, not store prices.
      </p>
      {buckets.map((b) => {
        const items = resolved.filter((r) => r.bucket === b.id);
        if (items.length === 0) return null;
        return (
          <section key={b.id} className="mt-4 break-inside-avoid">
            <h2 className="text-lg font-black">{b.title}</h2>
            <ul className="mt-1">
              {items.map((r) => {
                const st = stateFor(state.items, r.id);
                const q = planQuantity(r, st);
                const rem = remainingQuantity(r, st);
                const src = sources[r.sources[0]];
                return (
                  <li key={r.id} className="mb-1 text-sm">
                    <span aria-hidden>☐ </span>
                    <strong>{r.name}</strong>
                    {q !== null && <> — {formatQuantity(q, r.unit)}{st.status === "needs" && rem !== q ? `, still need ${rem}` : ""}</>}
                    {" "}[{STATUS_TEXT[st.status]}] ({r.effective === "next" ? "next step" : r.effective}) · {src.agency}, checked {formatDate(src.checked)}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="mt-4 text-xs">
        General preparedness information, not professional or medical advice. Follow official local guidance in an emergency.
        Made at pleasebeready.com/planner. Sources: Ready.gov (FEMA), American Red Cross, CDC.
      </p>
    </div>
  );
}
