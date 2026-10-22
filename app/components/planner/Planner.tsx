"use client";

// The household planner. Ties the setup, checklist, budget and shopping
// panels to one plan that lives only on this device.

import { useMemo, useState } from "react";
import { formatMoney, horizonDays, horizonLabel, resolvePlan, summarize } from "../../lib/planner/calc";
import BudgetPanel from "./BudgetPanel";
import Checklist from "./Checklist";
import PlanActions from "./PlanActions";
import PrintView from "./PrintView";
import SetupPanel from "./SetupPanel";
import ShoppingPanel, { defaultShop, type ShopState } from "./ShoppingPanel";
import type { BucketId } from "../../lib/planner/types";
import { usePlanner } from "./usePlanner";
import { card, inset, label, Money } from "./ui";

export default function Planner() {
  const p = usePlanner();
  const [shop, setShop] = useState<ShopState>(defaultShop);
  const { household, horizon, scenarios, hotWeather } = p.state;
  const resolved = useMemo(
    () => resolvePlan({ household, horizon, scenarios, hotWeather }),
    [household, horizon, scenarios, hotWeather],
  );
  const summary = useMemo(() => summarize(resolved, p.state), [resolved, p.state]);
  const water = resolved.find((r) => r.id === "water")?.suggested ?? 0;
  const essentials = resolved.filter((r) => r.effective === "essential").length;
  const onShop = (target: "plan" | BucketId) => {
    setShop(target === "plan" ? { ...shop, mode: "plan" } : { ...shop, mode: "bucket", bucket: target });
    document.getElementById("shopping")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const days = horizonDays(horizon);
  const heading = `Household plan: ${household.people} ${household.people === 1 ? "person" : "people"}, ${horizonLabel(horizon)}`;

  return (
    <div className="pbr-planner">
      <div className="print:hidden">
        <PlanActions p={p} />
        <SetupPanel p={p} />

        <div className={`${card} mb-10 p-5`} aria-live="polite">
          <h2 className={label}>Your plan at a glance</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-4">
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Water</dt><dd className="text-lg font-black"><Money>{water.toLocaleString("en-US")} gallons</Money></dd></div>
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Essentials</dt><dd className="text-lg font-black">{essentials} items</dd></div>
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Your prices so far</dt><dd className="text-lg font-black"><Money>{summary.totals.needed > 0 ? formatMoney(summary.totals.needed) : "None entered"}</Money></dd></div>
            <div className={`${inset} p-3`}><dt className="text-xs font-semibold text-[#94a3b8]">Plan length</dt><dd className="text-lg font-black">{horizonLabel(horizon)}</dd></div>
          </dl>
        </div>

        <div className={`${card} mb-10 p-5`}>
          <h2 className="text-base font-black">How these amounts are worked out</h2>
          <ul className="mt-2 list-disc pl-5 text-sm font-semibold leading-6 pbr-body">
            <li>Water: {household.people} {household.people === 1 ? "person" : "people"} × {days} {days === 1 ? "day" : "days"} × 1 gallon{hotWeather ? " × 2 for very hot weather" : ""} = {water.toLocaleString("en-US")} gallons. One gallon per person per day is the Red Cross and Ready.gov amount.</li>
            <li>Food: one day of easy-to-prepare food for one person is a person-day. {household.people} × {days} = {(household.people * days).toLocaleString("en-US")} person-days.</li>
            <li>The Red Cross gives 3 days to take with you and 2 weeks at home. Past 2 weeks we only multiply the same daily amounts; that is our arithmetic, not an official figure.</li>
            <li>Medicine: a 7-day supply, whatever the plan length, as the Red Cross lists. Ask your prescriber or pharmacy what is possible.</li>
            <li>Everything else is our suggestion. The sources list the item but give no number, so the amount is a starting point you can change.</li>
          </ul>
        </div>

        <Checklist p={p} resolved={resolved} summary={summary} onShop={onShop} />
        <BudgetPanel p={p} resolved={resolved} summary={summary} />
        <ShoppingPanel p={p} resolved={resolved} heading={heading} shop={shop} setShop={setShop} />
      </div>
      <PrintView state={p.state} resolved={resolved} summary={summary} />
    </div>
  );
}
