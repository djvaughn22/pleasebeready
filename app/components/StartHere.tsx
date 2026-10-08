"use client";

// First-time path: pick a household need → do one free step → see that
// need's checklist. Gear stays folded underneath. No data leaves the device.

import { useState } from "react";
import { measure } from "../lib/measure";
import { areaById, needs } from "../lib/readiness";
import ChecklistLines from "./ChecklistLines";
import GearList from "./GearList";

const A = "#34D399";

export default function StartHere() {
  const [needId, setNeedId] = useState<string | null>(null);
  const need = needs.find((n) => n.id === needId) ?? null;

  return (
    <section id="start" aria-labelledby="start-title" className="mb-12 scroll-mt-20">
      <h2 id="start-title" className="mb-1 text-xl font-black">1. What are you getting ready for?</h2>
      <p className="mb-4 text-sm font-semibold text-[#94a3b8]">Pick one. You can come back for the rest.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {needs.map((n) => {
          const on = n.id === needId;
          return (
            <button key={n.id} type="button" aria-pressed={on} aria-controls="start-panel"
              onClick={() => { if (!on) measure("need_select", n.id); setNeedId(on ? null : n.id); }}
              style={on ? { borderColor: A, boxShadow: `inset 0 0 0 1px ${A}` } : undefined}
              className={`flex min-h-[3.25rem] items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-black transition ${on ? "border-[#34D399] bg-[#1c2740]" : "border-[#26324c] bg-[#141d2e] hover:border-[#34D399]"}`}>
              <span aria-hidden className="text-lg">{n.emoji}</span><span>{n.label}</span>
            </button>
          );
        })}
      </div>

      <div id="start-panel" aria-live="polite">
        {need && (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-2xl border-2 bg-[#141d2e] p-6" style={{ borderColor: A }}>
              <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: A }}>
                2. Do this today · free · about {need.step.minutes} minutes
              </p>
              <h3 className="mt-2 text-2xl font-black leading-tight">{need.step.title}</h3>
              <p className="mt-2 text-base font-semibold leading-7 text-[#94a3b8]">{need.step.detail}</p>
              <a href={need.guide.href} target="_blank" rel="noopener noreferrer"
                data-measure="guide" data-measure-label={need.id}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#26324c] bg-[#1c2740] px-4 py-2.5 text-xs font-black uppercase tracking-[0.1em]"
                style={{ color: A }}>
                <span>Official guide · {need.guide.label}</span><span aria-hidden>→</span>
              </a>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
              3. Then work through these (check marks stay on this device)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {need.areaIds.map((id) => {
                const a = areaById(id);
                if (!a) return null;
                return (
                  <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-[#26324c] bg-[#141d2e] p-5">
                    <h4 className="flex items-center gap-2 text-base font-black"><span aria-hidden>{a.emoji}</span>{a.title}</h4>
                    <ChecklistLines areaId={a.id} details={a.details} />
                    <a href={a.href} target="_blank" rel="noopener noreferrer" className="text-xs font-black" style={{ color: A }}
                      data-measure="guide" data-measure-label={a.id}>
                      Guide · {a.source} →
                    </a>
                    <GearList gear={a.gear} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
