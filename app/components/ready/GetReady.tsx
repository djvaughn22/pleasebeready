"use client";

// Get Ready: setup when there is no guided plan yet (or the visitor asks to
// change it), otherwise the plan. A list opened by link (#list=…) or shared
// (#plan=…) shows when it is a guided plan; else the most recently changed one.

import { useState } from "react";
import { currentGuided } from "../../lib/ready/engine";
import { useLists } from "../shop/ListsProvider";
import { muted } from "../stockup/ui";
import ReadyPlan from "./ReadyPlan";
import ReadySetup from "./ReadySetup";

export default function GetReady() {
  const api = useLists();
  const [mode, setMode] = useState<"plan" | "edit" | "new">("plan");
  const [pick, setPick] = useState<string | null>(null);
  if (!api.ready) return <p className={muted} aria-live="polite">Loading your plan…</p>;

  const guided = api.store.plans.filter((p) => p.guide);
  const chosen = guided.find((p) => p.id === pick) ?? guided.find((p) => p.id === api.store.activeId) ?? currentGuided(api.store.plans);
  const top = () => window.scrollTo({ top: 0 });

  if (!chosen || mode === "new") {
    return <ReadySetup plan={null} onDone={(id) => { setPick(id); setMode("plan"); top(); }} onCancel={chosen ? () => setMode("plan") : undefined} />;
  }
  if (mode === "edit") {
    return <ReadySetup key={chosen.id} plan={chosen} onDone={() => { setMode("plan"); top(); }} onCancel={() => setMode("plan")} />;
  }
  return (
    <>
      {guided.length > 1 && (
        <label className="mb-4 flex items-center gap-2 text-xs font-bold text-[#94a3b8] print:hidden">
          Your plans
          <select value={chosen.id} onChange={(e) => setPick(e.target.value)}
            className="h-9 rounded-lg border border-[#26324c] bg-[#141d2e] px-2 text-xs font-black text-[#e8edf5]">
            {guided.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      <ReadyPlan key={chosen.id} plan={chosen} onEdit={() => { setMode("edit"); top(); }} onNew={() => { setMode("new"); top(); }} />
    </>
  );
}
