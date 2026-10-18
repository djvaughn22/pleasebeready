"use client";

// Step 4: a rough budget. Every dollar figure here is a planning estimate we
// set (or the visitor edited), never an Amazon or store price.

import { buildStages, formatEstimate, formatMoney, type Summary } from "../../lib/planner/calc";
import { buckets } from "../../lib/planner/catalog";
import type { ResolvedItem } from "../../lib/planner/types";
import type { Planner } from "./usePlanner";
import { card, input, inset, label, Money, Section } from "./ui";

function MoneyInput({ id, text, value, onChange }: {
  id: string; text: string; value: number | null; onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={label}>{text}</label>
      <div className="flex items-center gap-1">
        <span aria-hidden className="text-[#94a3b8]">$</span>
        <input id={id} type="number" inputMode="numeric" min={0} step={10} placeholder="No limit"
          value={value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(null);
            const n = Number(raw);
            onChange(Number.isFinite(n) && n >= 0 ? n : null);
          }}
          className={`${input} w-full`} />
      </div>
    </div>
  );
}

function Tile({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className={`${inset} p-4`}>
      <dt className={label}>{title}</dt>
      <dd className="mt-1 text-2xl font-black"><Money>{value}</Money></dd>
      <dd className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">{note}</dd>
    </div>
  );
}

export default function BudgetPanel({ p, resolved, summary }: { p: Planner; resolved: ResolvedItem[]; summary: Summary }) {
  const { totals, budget, over } = summary;
  const stages = buildStages(resolved, p.state).filter((s) => s.cost > 0);
  const names = new Map(resolved.map((r) => [r.id, r.name]));
  const reachable = budget === null ? null : [...stages].reverse().find((s) => s.fits);

  return (
    <Section id="budget" step={4} title="Budget"
      intro="Set a total, and optionally a limit for each bucket. Figures are rough planning estimates that we set. Prices, sizes, shipping and tax change, so use the ones you see.">
      <div className={`${card} p-5 sm:p-6`}>
        <div className="max-w-xs">
          <MoneyInput id="budget-total" text="Total budget" value={p.state.budget.total} onChange={p.setBudgetTotal} />
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          <Tile title="Still to get" value={`about ${formatEstimate(totals.needed)}`} note="Everything marked Need it, minus what you already have." />
          <Tile title="Already have" value={`about ${formatEstimate(totals.owned)}`} note="Value of items you marked Have it, at the same rough costs." />
          <Tile title="Optional extras" value={`about ${formatEstimate(totals.optionalNeeded)}`} note="Part of Still to get. Skip these first if money is tight." />
          <Tile title="Skipped" value={`about ${formatEstimate(totals.skipped)}`} note="Not counted anywhere above." />
        </dl>

        {budget !== null && (
          <p className="mt-4 text-sm font-bold" role="status">
            {over > 0
              ? <>The full plan is about <Money>{formatEstimate(over)}</Money> over your <Money>{formatMoney(budget)}</Money> budget. The stages below show a way to build it up.</>
              : <>The full plan fits your <Money>{formatMoney(budget)}</Money> budget, with about <Money>{formatEstimate(budget - totals.needed)}</Money> to spare.</>}
          </p>
        )}

        <h3 className="mt-6 text-base font-black">By bucket</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {summary.buckets.map((b) => {
            const meta = buckets.find((x) => x.id === b.bucket)!;
            return (
              <li key={b.bucket} className={`${inset} grid gap-3 p-3 sm:grid-cols-[1fr_11rem] sm:items-end`}>
                <div>
                  <p className="text-sm font-black"><span aria-hidden>{meta.emoji} </span>{meta.title}</p>
                  <p className="text-xs font-semibold leading-5 text-[#94a3b8]">
                    Still to get about <Money>{formatEstimate(b.needed)}</Money>
                    {b.owned > 0 && <> · have about <Money>{formatEstimate(b.owned)}</Money></>}
                  </p>
                  {b.budget !== null && (
                    <p className={`text-xs font-bold ${b.over > 0 ? "pbr-amber" : "pbr-accent"}`}>
                      {b.over > 0 ? `About ${formatEstimate(b.over)} over this limit` : "Within this limit"}
                    </p>
                  )}
                </div>
                <MoneyInput id={`budget-${b.bucket}`} text="Limit (optional)" value={p.state.budget.buckets[b.bucket] ?? null}
                  onChange={(v) => p.setBucketBudget(b.bucket, v)} />
              </li>
            );
          })}
        </ul>

        <h3 className="mt-6 text-base font-black">Build it in stages</h3>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#94a3b8]">
          One way to spread the plan out: the essentials for 3 days first, then the rest of the essentials, then the next steps, then the extras.
          Each stage lists only what you still need.
        </p>
        {stages.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-[#94a3b8]">Nothing left to buy in this plan.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-3">
            {stages.map((s, i) => (
              <li key={s.id} className={`${inset} p-4`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h4 className="text-sm font-black">Stage {i + 1}: {s.title}</h4>
                  <p className="text-sm font-black"><Money>about {formatEstimate(s.cost)}</Money></p>
                </div>
                <p className="text-xs font-semibold leading-5 text-[#94a3b8]">
                  {s.detail} Running total about <Money>{formatEstimate(s.cumulative)}</Money>
                  {s.fits !== null && (s.fits ? " (within your budget)" : " (over your budget)")}.
                </p>
                <details className="mt-1">
                  <summary className="flex min-h-11 cursor-pointer items-center text-xs font-black text-[#94a3b8]">
                    {s.itemIds.length} {s.itemIds.length === 1 ? "item" : "items"}
                  </summary>
                  <ul className="list-disc pl-5 text-xs font-semibold leading-6 pbr-body">
                    {s.itemIds.map((id) => <li key={id}>{names.get(id)}</li>)}
                  </ul>
                </details>
              </li>
            ))}
          </ol>
        )}
        {reachable && over > 0 && (
          <p className="mt-3 text-sm font-bold">
            Your budget reaches through Stage {stages.indexOf(reachable) + 1} (about <Money>{formatEstimate(reachable.cumulative)}</Money>).
          </p>
        )}
        {budget !== null && over > 0 && !reachable && (
          <p className="mt-3 text-sm font-bold">Your budget is below Stage 1. Start with the cheapest essentials, or mark things you already have.</p>
        )}
      </div>
    </Section>
  );
}
