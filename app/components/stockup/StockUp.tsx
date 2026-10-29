"use client";

// The stock-up planner: a shelf of saved plans, and one open plan with its
// setup, suggestions, list and shopping run. Everything stays on this device.

import { useMemo, useState } from "react";
import { suggestionsFor } from "../../lib/stockup/calc";
import type { Plan } from "../../lib/stockup/types";
import ListView from "./ListView";
import PlanHome from "./PlanHome";
import PlanSetup from "./PlanSetup";
import { countLeft } from "./resolve";
import ShopView from "./ShopView";
import Suggestions from "./Suggestions";
import { usePlans } from "./usePlans";
import { btnSmall, muted } from "./ui";

export type Tab = "plan" | "ideas" | "list" | "shop";

export default function StockUp() {
  const api = usePlans();
  const [tab, setTab] = useState<Tab>("ideas");

  if (!api.ready) {
    return <p className={muted} aria-live="polite">Loading your plans…</p>;
  }
  if (!api.active) {
    return <PlanHome api={api} onOpen={(id, t) => { setTab(t); api.open(id); }} onCreate={(o) => { setTab("plan"); api.create(o); }} />;
  }
  return <PlanScreen key={api.active.id} plan={api.active} api={api} tab={tab} setTab={setTab} />;
}

function PlanScreen({ plan, api, tab, setTab }: {
  plan: Plan; api: ReturnType<typeof usePlans>; tab: Tab; setTab: (t: Tab) => void;
}) {
  const suggestions = useMemo(() => suggestionsFor(plan), [plan]);
  const onList = Object.keys(plan.list).length;
  const left = useMemo(() => countLeft(plan), [plan]);
  const tabs: { id: Tab; text: string }[] = [
    { id: "plan", text: "Plan" },
    { id: "ideas", text: `Suggestions (${suggestions.length})` },
    { id: "list", text: `My list (${onList})` },
    { id: "shop", text: `Shop (${left})` },
  ];
  const go = (t: Tab) => { setTab(t); document.getElementById("plan-top")?.scrollIntoView({ block: "start" }); };

  return (
    <div className="pbr-planner">
      <div id="plan-top" className="scroll-mt-20 print:hidden">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" className={btnSmall} onClick={() => api.open(null)}>← All plans</button>
          <p className={muted} aria-live="polite">
            {api.saved === "failed" ? "Could not save on this device. Your browser may block storage." : api.saved === "saved" ? "✓ Saved on this device" : ""}
          </p>
        </div>
        <h2 className="text-2xl font-black leading-tight sm:text-3xl">{plan.name}</h2>
        {api.imported === plan.name && <p className="mt-1 text-sm font-bold pbr-accent">Added from a shared link. It is now saved on this device.</p>}

        <div role="tablist" aria-label="Plan sections" className="sticky top-0 z-20 -mx-4 mt-4 flex gap-1 overflow-x-auto border-b border-[#26324c] bg-[#0b1220] px-4 py-2 sm:mx-0 sm:px-0">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} id={`tab-${t.id}`}
              onClick={() => go(t.id)}
              className={`min-h-11 shrink-0 rounded-lg px-3 text-sm font-black transition ${tab === t.id ? "bg-[#1c2740] text-[#e8edf5] underline decoration-[#34D399] decoration-2 underline-offset-8" : "text-[#94a3b8] hover:text-[#e8edf5]"}`}>
              {t.text}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {tab === "plan" && <PlanSetup plan={plan} api={api} onNext={() => go("ideas")} />}
        {tab === "ideas" && <Suggestions plan={plan} api={api} suggestions={suggestions} onList={() => go("list")} onSetup={() => go("plan")} />}
        {tab === "list" && <ListView plan={plan} api={api} onIdeas={() => go("ideas")} onShop={() => go("shop")} />}
        {tab === "shop" && <ShopView plan={plan} api={api} onList={() => go("list")} />}
      </div>
    </div>
  );
}
