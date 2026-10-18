"use client";

// The household planner. Ties the setup, checklist, budget and shopping
// panels to one plan that lives only on this device.

import { useMemo } from "react";
import { formatEstimate, horizonLabel, resolvePlan, summarize } from "../../lib/planner/calc";
import BudgetPanel from "./BudgetPanel";
import Checklist from "./Checklist";
import PlanActions from "./PlanActions";
import PrintView from "./PrintView";
import SetupPanel from "./SetupPanel";
import ShoppingPanel from "./ShoppingPanel";
import { usePlanner } from "./usePlanner";
import { card, inset, label, Money } from "./ui";

export default function Planner() {
  const p = usePlanner();
  const { household, horizon, scenarios, hotWeather } = p.state;
  const resolved = useMemo(
    () => resolvePlan({ household, horizon, scenarios, hotWeather }),
    [household, horizon, scenarios, hotWeather],
  );
  const summary = useMemo(() => summarize(resolved, p.state), [resolved, p.state]);
  const water = resolved.find((r) => r.id === "water")?.suggested ?? 0;
  const essentials = resolved.filter((r) => r.effective === "essential").length;
  const heading = `Household plan: ${household.people} ${household.people === 1 ? "person" : "people"}, ${horizonLabel(horizon)}`;

  return (
    <div className="pbr-planner">
      <div className="print:hidden">
        <PlanActions p={p} />
        <SetupPanel p={p} />

        <div className={`${card} mb-10 p-5`} aria-live="polite">
          <h2 className={label}>Your plan at a glance</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-4">
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Water</dt><dd className="text-lg font-black"><Money>{water} gallons</Money></dd></div>
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Essentials</dt><dd className="text-lg font-black">{essentials} items</dd></div>
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Still to get</dt><dd className="text-lg font-black"><Money>about {formatEstimate(summary.totals.needed)}</Money></dd></div>
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Plan length</dt><dd className="text-lg font-black">{horizonLabel(horizon)}</dd></div>
          </dl>
        </div>

        <Checklist p={p} resolved={resolved} summary={summary} />
        <BudgetPanel p={p} resolved={resolved} summary={summary} />
        <ShoppingPanel p={p} resolved={resolved} heading={heading} />
      </div>
      <PrintView state={p.state} resolved={resolved} summary={summary} />
    </div>
  );
}
