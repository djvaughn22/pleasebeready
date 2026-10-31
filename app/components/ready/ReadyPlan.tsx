"use client";

// A guided readiness plan: urgent notes, progress by amount, the next step
// with one-tap Shop / Bought / Have it, the steps after it, and every item by
// stage. It reads and writes the same Ready List lines as the Lists page.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { amazonUrl } from "../../lib/gear";
import { STATE_TEXT, amountText, readiness, waterHint, type Entry, type PlanItem, type Readiness, type Step } from "../../lib/ready/engine";
import { picksFor, roleText } from "../../lib/shop/picks";
import { durationLabel, planSummary, unitWord } from "../../lib/stockup/calc";
import { itemById } from "../../lib/stockup/catalog";
import { sources } from "../../lib/stockup/sources";
import { encodePlan } from "../../lib/stockup/storage";
import type { Line, Plan } from "../../lib/stockup/types";
import { ProductArt } from "../shop/Art";
import { useLists } from "../shop/ListsProvider";
import ShopButton from "../stockup/ShopButton";
import { Stepper, btn, btnSmall, card, inset, label, muted } from "../stockup/ui";

const fresh = (): Line => ({ qty: null, have: 0, got: false });
const pct = (x: number) => `${Math.floor(x * 100)}%`;
const n = (x: number) => x.toLocaleString("en-US");
/** Things bought through a doctor or pharmacy: no store link. */
const NO_SHOP = new Set(["meds", "diabetes-supplies", "pet-medicines"]);
const TIER_TEXT = { critical: "First", essential: "Essential", recommended: "Recommended", upgrade: "Upgrade" } as const;

function when(step: Step, today: string, every: number): string {
  if (step.date <= today) return "Now";
  const d = new Date(`${step.date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return every >= 28 ? `Month of ${d}` : every >= 7 ? `Week of ${d}` : d;
}

export default function ReadyPlan({ plan, onEdit, onNew }: { plan: Plan; onEdit: () => void; onNew: () => void }) {
  const api = useLists();
  const today = new Date().toISOString().slice(0, 10);
  const r = useMemo(() => readiness(plan, today), [plan, today]);
  const [shared, setShared] = useState<"" | "copied" | string>("");
  // Printing shows every step and stage, not only the open ones.
  useEffect(() => {
    const open = () => document.querySelectorAll<HTMLDetailsElement>(".pbr-planner details").forEach((d) => { d.open = true; });
    window.addEventListener("beforeprint", open);
    return () => window.removeEventListener("beforeprint", open);
  }, []);

  const setLine = (id: string, fn: (l: Line) => Line) =>
    api.update(plan.id, (p) => ({ ...p, list: { ...p.list, [id]: fn(p.list[id] ?? fresh()) } }));
  // A restocked item starts over: what was there is used up.
  const add = (id: string, field: "have" | "bought", qty: number) => setLine(id, (l) => {
    const base = l.restock ? { ...l, have: 0, bought: 0, got: false, restock: undefined } : l;
    return { ...base, [field]: (base[field] ?? 0) + qty };
  });
  const done = (id: string, on = true) => setLine(id, (l) => ({ ...l, got: on }));
  const saveStep = (s: Step) => api.update(plan.id, (p) => {
    const list = { ...p.list };
    for (const e of s.entries) if (!list[e.id]) list[e.id] = fresh();
    return { ...p, list };
  });

  const share = async () => {
    const url = `${window.location.origin}/ready#plan=${encodePlan(plan)}`;
    try { await navigator.clipboard.writeText(url); setShared("copied"); } catch { setShared(url); }
  };

  const step = r.steps[0];
  const every = plan.guide?.every ?? 7;
  const essentialsLeft = r.items.filter((i) => (i.tier === "critical" || i.tier === "essential") && i.covered < i.need).length;

  return (
    <div className="pbr-planner flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="pbr-display text-2xl font-black leading-tight sm:text-3xl">{plan.name}</h2>
          <p className={`mt-1 ${muted}`}>{planSummary(plan)} · {paceText(plan)}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" className={btnSmall} onClick={onEdit}>Change setup</button>
          <button type="button" className={btnSmall} onClick={() => window.print()}>Print</button>
          <button type="button" className={btnSmall} onClick={share}>Share link</button>
          <button type="button" className={btnSmall} onClick={onNew}>New plan</button>
        </div>
      </div>
      <p className="-mt-4 text-xs font-bold print:hidden" aria-live="polite">
        {shared === "copied" ? <span className="pbr-accent">Link copied. It carries the plan itself; nothing is stored on our side.</span>
          : shared ? <span className={muted}>Copy this link: <input readOnly value={shared} onFocus={(e) => e.target.select()} className="w-full rounded border border-[#26324c] bg-[#0c1220] px-2 py-1 text-xs" /></span>
          : api.saved === "failed" ? <span className={muted}>Could not save on this device. Your browser may block storage.</span>
          : api.saved === "saved" ? <span className={muted}>✓ Saved on this device</span> : null}
      </p>

      {r.urgent.length > 0 && (
        <section aria-label="Do these first" className="pbr-edge rounded-2xl border-2 p-4">
          <h3 className="text-sm font-black uppercase tracking-wider pbr-accent">Do these first</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {r.urgent.map((u) => (
              <li key={u.text} className="text-sm font-semibold leading-6 text-[#e8edf5]">
                {u.text}{u.source && <> <a href={sources[u.source].href} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap font-black underline pbr-accent">{sources[u.source].agency}</a></>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Progress r={r} plan={plan} />

      {step ? (
        <section aria-labelledby="next-title" className={`${card} overflow-hidden`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#26324c] px-4 py-3">
            <h3 id="next-title" className="pbr-display text-lg font-black">
              <span className="pbr-accent">Next:</span> step {step.n} of {r.steps.length} · {when(step, today, every)}
            </h3>
            <button type="button" className={`${btnSmall} print:hidden`} onClick={() => saveStep(step)}
              disabled={step.entries.every((e) => plan.list[e.id])}>
              {step.entries.every((e) => plan.list[e.id]) ? "★ On your list" : "☆ Save this step to my list"}
            </button>
          </div>
          <ul className="divide-y divide-[var(--om-border)]">
            {step.entries.map((e) => <EntryRow key={e.id} e={e} r={r} onAdd={add} onDone={done} />)}
          </ul>
        </section>
      ) : (
        <section className={`${card} p-5`}>
          <h3 className="pbr-display text-lg font-black"><span className="pbr-accent">✓</span> Every essential and recommended item is covered.</h3>
          <p className={`mt-1 ${muted}`}>Keep it fresh: check dates every six months, mark anything used as Restock, and it comes back here. Upgrades are below if you want them.</p>
        </section>
      )}

      {r.steps.length > 1 && (
        <section aria-labelledby="later-title">
          <h3 id="later-title" className={`${label} mb-2`}>After that{plan.guide?.pace === "now" ? "" : ` · about ${durationLabel(Math.max(1, (r.steps.length - 1) * every))} to finish at this pace`}</h3>
          <ol className="flex flex-col gap-2">
            {r.steps.slice(1).map((s) => (
              <li key={s.n}>
                <details className={`${inset} px-4 py-2.5`}>
                  <summary className="cursor-pointer text-sm font-black">
                    Step {s.n} · {s.entries.some((e) => e.tier === "recommended") && plan.guide?.pace === "now" ? "Recommended, when you’re ready" : when(s, today, every)}
                    <span className={`ml-2 ${muted}`}>{s.entries.map((e) => itemById(e.id)!.name).slice(0, 4).join(", ")}{s.entries.length > 4 ? ` +${s.entries.length - 4}` : ""}</span>
                  </summary>
                  <ul className="mt-2 flex flex-col gap-1">
                    {s.entries.map((e) => (
                      <li key={e.id} className="flex justify-between gap-3 text-sm">
                        <span className="font-bold">{itemById(e.id)!.name}</span>
                        <span className={`shrink-0 ${muted}`}>{e.task ? "To do" : `+${n(e.buy)} ${unitWord(itemById(e.id)!, e.buy)}`} · {e.why}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="all-title">
        <h3 id="all-title" className="pbr-display mb-1 text-xl font-black">The whole plan</h3>
        <p className={`mb-3 ${muted}`}>
          {essentialsLeft ? `${essentialsLeft} essential ${essentialsLeft === 1 ? "item" : "items"} still short.` : "Essentials covered."} Recommended items come after the essentials; upgrades never count as missing.
        </p>
        <div className="flex flex-col gap-2">
          {r.stages.map((s) => {
            const items = r.items.filter((i) => i.stage === s.id);
            if (!items.length) return null;
            const short = items.filter((i) => i.tier !== "upgrade" && i.covered < i.need).length;
            return (
              <details key={s.id} className={`${card} px-4 py-2.5`} open={s.id === r.next?.stage}>
                <summary className="cursor-pointer text-base font-black">
                  <span aria-hidden>{s.emoji}</span> {s.title} <span className={`ml-1 ${muted}`}>{short ? `${short} to get` : "✓ covered"}</span>
                </summary>
                <ul className="mt-2 divide-y divide-[var(--om-border)]">
                  {items.map((i) => <ItemRow key={i.item.id} i={i} setLine={setLine} />)}
                </ul>
              </details>
            );
          })}
        </div>
      </section>

      <p className={`${muted} print:hidden`}>
        This plan is saved as a Ready List too. <Link href={`/lists#list=${plan.id}`} className="font-black underline pbr-accent">Open it in My Ready Lists</Link> to add anything else from the store.
      </p>
    </div>
  );
}

function paceText(plan: Plan): string {
  const g = plan.guide;
  if (!g || g.pace === "now") return "all at once";
  const per = g.pace === "weekly" ? "a week" : g.pace === "monthly" ? "a month" : `every ${durationLabel(g.every)}`;
  return `${g.size} things ${per}`;
}

function Progress({ r, plan }: { r: Readiness; plan: Plan }) {
  const counted = r.items.filter((i) => i.tier === "critical" || i.tier === "essential");
  const water = r.items.find((i) => i.item.id === "water");
  const hint = water ? waterHint(water.need) : null;
  return (
    <section aria-labelledby="progress-title" className={`${card} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        <div>
          <h3 id="progress-title" className={label}>Ready for {durationLabel(plan.days)}</h3>
          <p className="pbr-display text-4xl font-black leading-none"><span className="pbr-accent">{pct(r.ready)}</span></p>
        </div>
        {r.kind === "emergency" && plan.days > r.baseDays && (
          <div>
            <p className={label}>3-day base</p>
            <p className="pbr-display text-2xl font-black leading-none">{pct(r.base)}</p>
          </div>
        )}
        <p className={`basis-full ${muted}`}>Counted by amount: half of what you need counts as half done. {counted.length} essentials; recommended items and upgrades aren’t in this number.</p>
      </div>
      <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {r.stages.map((s) => {
          const xs = counted.filter((i) => i.stage === s.id);
          if (!xs.length) return null;
          const share = xs.reduce((t, i) => t + Math.min(1, i.covered / Math.max(1, i.need)), 0) / xs.length;
          const lead = xs.find((i) => i.item.id === "water" || i.item.id === "shelf-food");
          const text = lead ? `${n(lead.covered)} of ${n(lead.need)} ${unitWord(lead.item, lead.need)}${lead.item.id === "shelf-food" ? " of food" : ""}` : `${xs.filter((i) => i.covered >= i.need).length} of ${xs.length}`;
          return (
            <li key={s.id}>
              <div className="flex justify-between gap-2 text-xs font-black">
                <span><span aria-hidden>{s.emoji}</span> {s.title}</span>
                <span className="text-[#94a3b8]">{text}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--om-surface-2)]" role="img" aria-label={`${s.title}: ${pct(share)}`}>
                <div className="h-full rounded-full bg-[#F97316]" style={{ width: pct(share) }} />
              </div>
            </li>
          );
        })}
      </ul>
      {hint && <p className={`mt-3 ${muted}`}>{hint}</p>}
      {r.items.some((i) => i.item.id === "shelf-food") && (
        <p className={`mt-2 ${muted}`}>
          Food is counted in person-days: a day of food for one person. Needs differ with age, size, health, pregnancy and activity, so a count of
          cans can’t promise enough nutrition. Choose food your household eats, include any special diets, and check dates.
        </p>
      )}
    </section>
  );
}

function EntryRow({ e, r, onAdd, onDone }: { e: Entry; r: Readiness; onAdd: (id: string, f: "have" | "bought", q: number) => void; onDone: (id: string) => void }) {
  const i = r.items.find((x) => x.item.id === e.id)!;
  const item = i.item;
  const [part, setPart] = useState<number | null>(null);
  const others = picksFor(item.id).filter((p) => p.role === "value" || p.role === "upgrade");
  return (
    <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--om-surface-2)]"><ProductArt id={item.id} cat={item.cat} color="#F97316" size={36} /></span>
        <div className="min-w-0">
          <p className="text-sm font-black leading-snug">{item.name}</p>
          <p className={muted}>
            {e.task ? "Something to do, not to buy" : <>Get <b className="text-[#e8edf5]">{amountText(item, e.buy)}</b>{e.why !== "essential" && e.why !== "recommended" ? ` (${e.why})` : ""}</>}
            {" · "}{TIER_TEXT[e.tier]}{i.covered > 0 && !e.task ? ` · ${n(i.covered)} of ${n(i.need)} covered` : ""}
          </p>
          {item.note && <p className={`${muted} line-clamp-2`}>{item.note}</p>}
          {others.length > 0 && (
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs font-black print:hidden">
              {others.map((o) => (
                <a key={o.asin} href={amazonUrl(o.asin)} target="_blank" rel="noopener noreferrer sponsored" data-measure="shop" data-measure-label={`${item.cat}-${o.role}-${item.id}`}
                  aria-label={`${roleText[o.role]}: ${o.name} on Amazon (opens in a new tab)`} className="pbr-blue hover:underline">{roleText[o.role]} ↗</a>
              ))}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end print:hidden">
        {e.task ? (
          <button type="button" className={`${btnSmall} col-span-3`} onClick={() => onDone(e.id)}>✓ Done</button>
        ) : part === null ? (
          <>
            {NO_SHOP.has(item.id)
              ? <p className={`col-span-3 ${muted}`}>From your pharmacy or prescriber, not a store.</p>
              : <span className="col-span-3 flex"><ShopButton item={item} big /></span>}
            <button type="button" className={btnSmall} onClick={() => onAdd(e.id, "bought", e.buy)} aria-label={`Bought ${amountText(item, e.buy)} of ${item.name}`}>Bought</button>
            <button type="button" className={btnSmall} onClick={() => onAdd(e.id, "have", e.buy)} aria-label={`Already have ${amountText(item, e.buy)} of ${item.name}`}>Have it</button>
            <button type="button" className={btnSmall} onClick={() => setPart(Math.max(1, Math.floor(e.buy / 2)))}>Some</button>
          </>
        ) : (
          <>
            <div className="col-span-3"><Stepper compact id={`part-${e.id}`} text="Bought so far" sr={item.name} value={part} min={1} max={e.buy} onChange={setPart} /></div>
            <button type="button" className={btnSmall} onClick={() => { onAdd(e.id, "bought", part); setPart(null); }}>Save</button>
            <button type="button" className={btnSmall} onClick={() => setPart(null)}>Cancel</button>
          </>
        )}
      </div>
    </li>
  );
}

function ItemRow({ i, setLine }: { i: PlanItem; setLine: (id: string, fn: (l: Line) => Line) => void }) {
  const [open, setOpen] = useState(false);
  const task = i.item.kind === "task";
  const tone = i.state === "ready" || i.state === "have" || i.state === "bought" ? "pbr-accent" : i.state === "restock" ? "pbr-amber" : "text-[#94a3b8]";
  return (
    <li className="py-2">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">{i.item.name}</p>
          <p className={muted}>
            {task ? "To do" : `${n(i.covered)} of ${amountText(i.item, i.need)}`}{i.extra > 0 ? ` (${n(i.extra)} from containers or kits)` : ""} · {TIER_TEXT[i.tier]}
          </p>
        </div>
        <span className={`shrink-0 text-xs font-black ${tone}`}>{task ? (i.covered ? "Done" : "To do") : STATE_TEXT[i.state]}</span>
        <button type="button" className={`${btnSmall} print:hidden`} aria-expanded={open} aria-label={`Change ${i.item.name}`} onClick={() => setOpen(!open)}>{open ? "Close" : "Change"}</button>
      </div>
      {open && (
        <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-3 print:hidden">
          {task ? (
            <button type="button" className={btnSmall} onClick={() => setLine(i.item.id, (l) => ({ ...l, got: !l.got }))}>{i.covered ? "Mark not done" : "✓ Done"}</button>
          ) : (
            <>
              <Stepper compact id={`have-${i.item.id}`} text="Already had" sr={i.item.name} value={i.line?.have ?? 0} min={0} max={100000} onChange={(v) => setLine(i.item.id, (l) => ({ ...l, have: v }))} />
              <Stepper compact id={`bought-${i.item.id}`} text="Bought" sr={i.item.name} value={i.line?.bought ?? 0} min={0} max={100000} onChange={(v) => setLine(i.item.id, (l) => ({ ...l, bought: v, got: false }))} />
              <Stepper compact id={`qty-${i.item.id}`} text={`Amount you want (${i.item.unit.many})`} sr={i.item.name} value={i.need} min={0} max={100000} onChange={(v) => setLine(i.item.id, (l) => ({ ...l, qty: v }))} />
              <div className="flex gap-2">
                <button type="button" className={btnSmall} aria-pressed={!!i.line?.ready} onClick={() => setLine(i.item.id, (l) => ({ ...l, ready: !l.ready, restock: undefined }))}>{i.line?.ready ? "★ Ready" : "Mark ready"}</button>
                <button type="button" className={btnSmall} aria-pressed={!!i.line?.restock} onClick={() => setLine(i.item.id, (l) => ({ ...l, restock: !l.restock, ready: undefined }))}>{i.line?.restock ? "Restock ✓" : "Used up: restock"}</button>
              </div>
              {i.line?.qty != null && <button type="button" className={btn} onClick={() => setLine(i.item.id, (l) => ({ ...l, qty: null }))}>Use our amount</button>}
            </>
          )}
        </div>
      )}
    </li>
  );
}
