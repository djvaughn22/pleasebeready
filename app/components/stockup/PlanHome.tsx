"use client";

// Saved plans (open, reuse, delete) and the occasions to start a new one.

import { useState } from "react";
import { planSummary } from "../../lib/stockup/calc";
import { occasions } from "../../lib/stockup/catalog";
import type { OccasionId } from "../../lib/stockup/types";
import { countLeft } from "./resolve";
import type { Tab } from "./StockUp";
import type { PlansApi } from "./usePlans";
import { btnSmall, card, inset, label, muted } from "./ui";

export default function PlanHome({ api, onOpen, onCreate }: {
  api: PlansApi; onOpen: (id: string, tab: Tab) => void; onCreate: (o: OccasionId) => void;
}) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const plans = api.store.plans;

  return (
    <div className="pbr-planner">
      {api.saved === "failed" && (
        <p className="mb-4 text-sm font-bold pbr-amber">This browser is not letting us save. Plans will be lost when you close the tab.</p>
      )}
      {plans.length > 0 && (
        <section aria-labelledby="plans-title" className="mb-10">
          <h2 id="plans-title" className="mb-3 text-xl font-black">Your plans</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {plans.map((p) => {
              const items = Object.keys(p.list).length;
              const left = countLeft(p);
              return (
                <li key={p.id} className={`${card} flex flex-col gap-3 p-4`}>
                  <button type="button" onClick={() => onOpen(p.id, items ? "list" : "ideas")} className="text-left">
                    <span className="block text-lg font-black leading-snug text-[#e8edf5] hover:underline">{p.name}</span>
                    <span className={`mt-1 block ${muted}`}>{planSummary(p)}</span>
                    <span className="mt-2 block text-sm font-bold text-[#e8edf5]">
                      {items === 0 ? "No items yet" : `${items} on the list · ${left === 0 ? "nothing left to buy" : `${left} left to buy`}`}
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={btnSmall} onClick={() => onOpen(p.id, items ? "list" : "ideas")}>Open</button>
                    <button type="button" className={btnSmall} onClick={() => api.duplicate(p.id)} aria-label={`Reuse ${p.name} as a new plan`}>Reuse as new</button>
                    {confirm === p.id ? (
                      <>
                        <button type="button" className={`${btnSmall} pbr-amber`} onClick={() => { api.remove(p.id); setConfirm(null); }}>Yes, delete</button>
                        <button type="button" className={btnSmall} onClick={() => setConfirm(null)}>Keep it</button>
                      </>
                    ) : (
                      <button type="button" className={btnSmall} onClick={() => setConfirm(p.id)} aria-label={`Delete ${p.name}`}>Delete</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="start-title">
        <h2 id="start-title" className="mb-1 text-xl font-black">{plans.length ? "Start another plan" : "Start a plan"}</h2>
        <p className={`mb-4 ${muted}`}>Pick what you are getting ready for. You can rename it and change everything after.</p>
        {(["Everyday", "Events and trips", "Weather and emergencies", "Life changes"] as const).map((g) => (
          <div key={g} className="mb-5">
            <h3 className={`mb-2 ${label}`}>{g}</h3>
            <ul className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
              {occasions.filter((o) => o.group === g).map((o) => (
                <li key={o.id}>
                  <button type="button" onClick={() => onCreate(o.id)}
                    className={`${inset} flex h-full w-full items-start gap-3 p-3 text-left transition hover:border-[#34D399]`}>
                    <span aria-hidden className="text-2xl">{o.emoji}</span>
                    <span>
                      <span className="block text-sm font-black text-[#e8edf5]">{o.label}</span>
                      <span className={`block ${muted}`}>{o.hint}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
