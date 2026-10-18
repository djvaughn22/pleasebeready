"use client";

// Step 3: the editable checklist, grouped into shopping buckets.
// Each row: quantity and unit, priority, why, source with the date we checked
// it, have/need/skip, and an optional product link when one helps.

import { useState } from "react";
import {
  formatMoney, formatQuantity, planQuantity, remainingQuantity, stateFor, unitCost, type Summary,
} from "../../lib/planner/calc";
import { buckets, gearFor } from "../../lib/planner/catalog";
import { reportItemUrl } from "../../lib/planner/shopping";
import { formatDate, sources } from "../../lib/planner/sources";
import type { Basis, ItemStatus, Priority, ResolvedItem, ScenarioId } from "../../lib/planner/types";
import { amazonUrl } from "../../lib/gear";
import type { Planner } from "./usePlanner";
import { A, card, inset, input, label, Money, Section } from "./ui";

const PRIORITY: Record<Priority, { text: string; style: string }> = {
  essential: { text: "Essential", style: "border-[#34D399] text-[#34D399]" },
  next: { text: "Useful next step", style: "border-[#60A5FA] text-[#60A5FA]" },
  optional: { text: "Optional", style: "border-[#94a3b8] text-[#94a3b8]" },
};

const BASIS: Record<Basis, string | null> = {
  official: "Official amount",
  derived: "Official daily amount, multiplied by us",
  suggestion: "Our suggestion (no official number)",
  none: null,
};

const STATUS: { value: ItemStatus; text: string }[] = [
  { value: "needs", text: "Need it" },
  { value: "have", text: "Have it" },
  { value: "skip", text: "Skip" },
];

const SCENARIO_TEXT: Record<ScenarioId, string> = {
  outage: "power outage", weather: "severe weather", water: "water interruption", evacuation: "evacuation",
};

type Filter = "all" | "needs" | "have" | "essential";

function ItemRow({ r, p }: { r: ResolvedItem; p: Planner }) {
  const st = stateFor(p.state.items, r.id);
  const qty = planQuantity(r, st);
  const gear = r.product ? gearFor(r.product.asin) : undefined;
  const primary = sources[r.sources[0]];
  const others = r.sources.slice(1).map((s) => sources[s]);
  const basis = BASIS[r.effectiveBasis];
  const pri = PRIORITY[r.effective];
  const picked = p.state.picks.includes(r.id);
  const defaultCost = r.cost ?? 0;
  const remaining = remainingQuantity(r, st);
  const cost = unitCost(r, st);
  const skipped = st.status === "skip";

  return (
    <li className={`${inset} p-4 ${skipped ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-black ${pri.style}`}>{pri.text}</span>
        {r.because.map((s) => (
          <span key={s} className="rounded-full border border-[#26324c] px-2.5 py-0.5 text-[0.7rem] font-bold text-[#94a3b8]">
            For {SCENARIO_TEXT[s]}
          </span>
        ))}
      </div>

      <h4 className={`mt-2 text-base font-black leading-snug ${skipped ? "line-through" : ""}`}>{r.name}</h4>

      <p className="mt-1 text-sm font-bold text-[#e8edf5]">
        {qty === null ? "A task, nothing to buy" : (
          <>
            Suggested: <span className="tabular-nums">{formatQuantity(r.suggested ?? 0, r.unit)}</span>
            {qty !== r.suggested && <span className="text-[#94a3b8]"> · you set {formatQuantity(qty, r.unit)}</span>}
          </>
        )}
      </p>
      {basis && <p className="text-xs font-semibold text-[#94a3b8]">{basis}</p>}

      <p className="mt-2 text-sm font-semibold leading-6 text-[#cbd5e1]">{r.reason}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
        Source:{" "}
        <a href={primary.href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: A }}>
          {primary.agency} · {primary.title}
        </a>
        {" "}· checked {formatDate(primary.checked)}
        {others.length > 0 && (
          <>
            {" "}· also{" "}
            {others.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ", "}
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: A }}>{s.agency}</a>
              </span>
            ))}
          </>
        )}
      </p>

      <fieldset className="mt-3">
        <legend className="sr-only">Status for {r.name}</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Status for ${r.name}`}>
          {STATUS.map((o) => {
            const on = st.status === o.value;
            return (
              <label key={o.value}
                className={`inline-flex min-h-11 min-w-[5.5rem] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-black ${on ? "border-[#34D399] bg-[#1c2740] text-[#e8edf5]" : "border-[#26324c] bg-[#0c1220] text-[#94a3b8]"}`}
                style={on ? { boxShadow: `inset 0 0 0 1px ${A}` } : undefined}>
                <input type="radio" className="sr-only" name={`status-${r.id}`} checked={on}
                  onChange={() => p.setItem(r.id, { status: o.value })} />
                {on && <span aria-hidden>✓</span>}{o.text}
              </label>
            );
          })}
        </div>
      </fieldset>

      {gear && (
        <div className="mt-3 rounded-lg border border-[#26324c] bg-[#141d2e] p-3">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.1em] text-[#94a3b8]">Example product on Amazon</p>
          <a href={amazonUrl(gear.asin)} target="_blank" rel="noopener noreferrer sponsored"
            data-measure="gear" data-measure-label={gear.asin}
            className="mt-1 inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#26324c] bg-[#1c2740] px-3 py-2 text-sm font-bold text-[#e8edf5] transition hover:border-[#34D399]">
            <span>{gear.name}</span><span style={{ color: A }} aria-hidden>↗</span>
          </a>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
            {r.product?.covers && r.product.covers > 1
              ? `One covers ${r.product.covers}. `
              : "Check the size and what is in the package. "}
            The Amazon page shows the current price.
          </p>
          <label className="mt-1 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-[#e8edf5]">
            <input type="checkbox" checked={picked} onChange={() => p.togglePick(r.id)}
              className="h-4 w-4" style={{ accentColor: A }} />
            Add to my picks for shopping
          </label>
        </div>
      )}

      <details className="mt-3 rounded-lg border border-[#26324c]">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-black text-[#94a3b8] [&::-webkit-details-marker]:hidden">
          <span>Adjust, more detail, report a problem</span><span aria-hidden>▾</span>
        </summary>
        <div className="flex flex-col gap-4 px-3 pb-3">
          {qty !== null && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`qty-${r.id}`} className={label}>How many</label>
                <input id={`qty-${r.id}`} type="number" inputMode="numeric" min={0} value={qty}
                  onChange={(e) => {
                    const n = Math.max(0, Math.round(Number(e.target.value) || 0));
                    p.setItem(r.id, { qty: n === r.suggested ? undefined : n });
                  }}
                  className={input} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`have-${r.id}`} className={label}>Already have</label>
                <input id={`have-${r.id}`} type="number" inputMode="numeric" min={0} value={st.have ?? 0}
                  disabled={st.status !== "needs"}
                  onChange={(e) => {
                    const n = Math.max(0, Math.round(Number(e.target.value) || 0));
                    p.setItem(r.id, { have: n === 0 ? undefined : n });
                  }}
                  className={`${input} disabled:opacity-50`} />
              </div>
              {defaultCost > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`cost-${r.id}`} className={label}>Cost each (rough)</label>
                  <div className="flex items-center gap-1">
                    <span aria-hidden className="text-[#94a3b8]">$</span>
                    <input id={`cost-${r.id}`} type="number" inputMode="decimal" min={0} step="0.01"
                      value={st.cost ?? defaultCost}
                      onChange={(e) => {
                        const n = Math.max(0, Number(e.target.value) || 0);
                        p.setItem(r.id, { cost: n === defaultCost ? undefined : n });
                      }}
                      className={`${input} w-full`} />
                  </div>
                </div>
              )}
            </div>
          )}
          {qty !== null && (
            <p className="text-xs font-semibold leading-5 text-[#94a3b8]">
              {st.status === "needs" && remaining > 0 && cost > 0
                ? <>Still to get: {formatQuantity(remaining, r.unit)}, about <Money>{formatMoney(remaining * cost)}</Money>. </>
                : null}
              Our cost figure is a rough planning estimate, not an Amazon or store price. Change it to what you see.
            </p>
          )}
          {r.tip && <p className="text-sm font-semibold leading-6 text-[#cbd5e1]">{r.tip}</p>}
          <p className="text-xs font-semibold leading-5 text-[#94a3b8]">
            {r.sources.map((s) => {
              const src = sources[s];
              return (
                <span key={s} className="block">
                  <a href={src.href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: A }}>
                    {src.agency} · {src.title}
                  </a>
                  {" "}· checked {formatDate(src.checked)}{src.pageUpdated ? `, page updated ${formatDate(src.pageUpdated)}` : ""}
                </span>
              );
            })}
          </p>
          <a href={reportItemUrl(r)} className="inline-flex min-h-11 items-center text-sm font-black underline" style={{ color: A }}>
            Report a missing or confusing item
          </a>
        </div>
      </details>
    </li>
  );
}

export default function Checklist({ p, resolved, summary }: { p: Planner; resolved: ResolvedItem[]; summary: Summary }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = (r: ResolvedItem) => {
    const st = stateFor(p.state.items, r.id);
    if (filter === "needs") return st.status === "needs";
    if (filter === "have") return st.status === "have";
    if (filter === "essential") return r.effective === "essential";
    return true;
  };

  return (
    <Section id="checklist" step={3} title="Your checklist"
      intro="Mark each item as something you need, already have, or want to skip. Change any amount to fit your home.">
      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <label htmlFor="show-filter" className={label}>Show</label>
        <select id="show-filter" value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className={`${input} pr-8`}>
          <option value="all">Everything</option>
          <option value="needs">Only what I still need</option>
          <option value="have">Only what I have</option>
          <option value="essential">Only essentials</option>
        </select>
        <p className="text-xs font-semibold text-[#94a3b8]" aria-live="polite">
          {summary.totals.counts.have} have · {summary.totals.counts.needs} need · {summary.totals.counts.skip} skipped
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {buckets.map((b) => {
          const items = resolved.filter((r) => r.bucket === b.id);
          const shown = items.filter(visible);
          const bt = summary.buckets.find((x) => x.bucket === b.id)!;
          if (items.length === 0) return null;
          return (
            <div key={b.id} id={`bucket-${b.id}`} className={`${card} scroll-mt-20 p-4 sm:p-5`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-black"><span aria-hidden>{b.emoji} </span>{b.title}</h3>
                <p className="text-xs font-bold text-[#94a3b8]">
                  {bt.counts.total} items · still to get about <Money>{formatMoney(bt.needed)}</Money>
                </p>
              </div>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">{b.blurb}</p>
              {shown.length === 0 ? (
                <p className="mt-3 text-sm font-semibold text-[#94a3b8]">Nothing here matches this filter.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {shown.map((r) => <ItemRow key={r.id} r={r} p={p} />)}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-[#94a3b8]">
        Missing something, or is something confusing?{" "}
        <a href={reportItemUrl(null)} className="font-black underline" style={{ color: A }}>Tell us</a>
        {" "}(opens your email app; nothing is sent from this page).
      </p>
    </Section>
  );
}
