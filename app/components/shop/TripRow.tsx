"use client";

// One line of the trip: what it is and how much, the packages to buy and where, an optional price
// per package, and (folded) what you have, other products and "buy nearby". Math: lib/shop/trip.ts.

import { useState } from "react";
import { FOCUS_EMOJI, packWords, type Edit, type Row, type Stage } from "../../lib/shop/trip";
import { amountHint } from "../../lib/shop/tripText";
import { packText } from "../../lib/shop/offers";
import { btnSmall, input, muted } from "../stockup/ui";

const n = (x: number) => x.toLocaleString("en-US");
const money = (x: number) => `$${x.toFixed(2)}`;

/** A price box that keeps what's typed ("1." while typing) and reports a number or nothing. */
export function PriceInput({ id, value, per, onChange }: { id: string; value: number | null; per: string; onChange: (v: number | null) => void }) {
  const [text, setText] = useState(value == null ? "" : String(value));
  const [last, setLast] = useState(value);
  if (value !== last) { setLast(value); setText(value == null ? "" : String(value)); }
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-xs font-bold text-[#94a3b8]">
      <span className="shrink-0">Price you see</span>
      <span className="relative">
        <span aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-black text-[#94a3b8]">$</span>
        <input id={id} type="text" inputMode="decimal" autoComplete="off" placeholder="0.00" value={text}
          onChange={(e) => {
            const t = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
            setText(t);
            const v = t === "" ? null : Number(t);
            if (v == null || Number.isFinite(v)) { setLast(v); onChange(v); }
          }}
          className={`${input} h-10 w-24 pl-6 text-sm tabular-nums`} />
      </span>
      <span className="min-w-0">per {per}</span>
    </label>
  );
}

export default function TripRow({ r, stage, onEdit, onPrice, onWater, water }: {
  r: Row;
  stage: Stage;
  onEdit: (key: string, patch: Partial<Edit>) => void;
  onPrice: (key: string, price: number | null) => void;
  /** Water rows only: switch between gallon jugs and cases of bottles. */
  onWater?: (w: "jugs" | "bottles") => void;
  water?: "jugs" | "bottles";
}) {
  const k = stage === "now" ? r.now : r.later;
  const rest = stage === "now" ? r.later : r.now;
  const unit = r.need === 1 ? r.item.unit.one : r.item.unit.many;
  const per = packWords(r, 1).replace(/^1 /, "");
  const where = r.local || !r.offer ? "Nearby" : "Amazon";
  const isWater = r.group === "water";
  const ownHave = !isWater && r.key !== "flashlights";
  const hint = amountHint(r, k);
  const move: Stage = stage === "now" ? "later" : "now";
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-black leading-snug">
          <span aria-hidden>{FOCUS_EMOJI[r.group]} </span>{r.label}
          <span className="font-bold text-[#94a3b8]"> · {n(r.need)} {unit}</span>
        </p>
        <span className="flex shrink-0 flex-col items-end gap-1.5 min-[400px]:flex-row">
          {ownHave && r.full === 1 && r.have === 0 && (
            <button type="button" onClick={() => onEdit(r.key, { have: 1 })} className={btnSmall} aria-label={`I already have a ${r.label.toLowerCase()}`}>I have one</button>
          )}
          <button type="button" onClick={() => onEdit(r.key, { stage: move })} className={btnSmall}
            aria-label={stage === "now" ? `Move ${r.label} to the next trip` : `Add ${r.label} to this trip`}>
            {stage === "now" ? "Next trip" : "Add to this trip"}
          </button>
        </span>
      </div>
      <p className="mt-1 text-sm font-black leading-snug">
        <span className="pbr-accent">Buy {packWords(r, k)}</span>
        {hint && <span className="font-bold text-[#e8edf5]"> {hint}</span>}
        {rest > 0 && <span className="font-bold text-[#94a3b8]"> · {packWords(r, rest)} {stage === "now" ? "on a later trip" : "this trip"}</span>}
      </p>
      <p className={muted}>
        <span className="font-black text-[#e8edf5]">{where}:</span> {r.offer && !r.local ? r.offer.pick.name : r.nearby ?? "any store"}
        {r.offer && !r.local && r.nearby ? <> · {r.nearby}</> : null}
      </p>
      {r.stale && <p className={muted}>The product you picked isn’t in our store anymore, so this shows ours. The amount didn’t change.</p>}
      {r.repriced && <p className={muted}>The pack size changed since you typed a price, so check the price again.</p>}
      {r.big && !r.local && r.offer && (
        <p className={muted}>Amazon’s pack has {n(r.offer.units)} {r.offer.units === 1 ? r.item.unit.one : r.item.unit.many}; you need {n(r.need)}. A store nearby may sell fewer.</p>
      )}
      {r.note && <p className={muted}>{r.note}</p>}
      <p className={`${muted} mt-0.5`}>{r.how}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <PriceInput id={`price-${stage}-${r.key}`} value={r.price} per={per} onChange={(v) => onPrice(r.priceKey, v)} />
        {r.price != null && k > 0 && <span className="text-xs font-black text-[#e8edf5]">{n(k)} × {money(r.price)} = {money(k * r.price)}</span>}
      </div>
      <details className="mt-2">
        <summary className="inline-flex min-h-10 cursor-pointer items-center text-xs font-black text-[#94a3b8] underline-offset-2 hover:underline">
          {isWater ? "Jugs or bottles, or buy nearby" : "Have some, other products, or buy nearby"}
        </summary>
        <div className="mt-2 flex flex-col gap-3">
          {isWater && onWater && (
            <fieldset>
              <legend className="mb-1.5 text-xs font-bold text-[#94a3b8]">Buy water as</legend>
              <div className="flex flex-wrap gap-2">
                {([["jugs", "Gallon jugs"], ["bottles", "Cases of bottles"]] as const).map(([w, t]) => (
                  <button key={w} type="button" aria-pressed={water === w} onClick={() => onWater(w)}
                    className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-xs font-black ${water === w ? "pbr-edge border-2 pbr-accent" : "border-[#26324c] text-[#e8edf5]"}`}>{t}</button>
                ))}
              </div>
              <p className={`${muted} mt-1`}>Water you already have goes under Check what you have.</p>
            </fieldset>
          )}
          {ownHave && (
            <label htmlFor={`have-${stage}-${r.key}`} className="flex items-center gap-2 text-xs font-bold text-[#94a3b8]">
              Have already
              <input id={`have-${stage}-${r.key}`} type="number" inputMode="numeric" min={0} value={r.have || ""} placeholder="0"
                onChange={(e) => onEdit(r.key, { have: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
                className={`${input} h-10 w-20 text-sm tabular-nums`} />
              {r.item.unit.many}
            </label>
          )}
          {r.offers.length > 1 && !r.local && (
            <fieldset>
              <legend className="mb-1.5 text-xs font-bold text-[#94a3b8]">Product</legend>
              <ul className="flex flex-col gap-1.5">
                {r.offers.map((o) => {
                  const on = o.pick.asin === r.offer?.pick.asin;
                  return (
                    <li key={o.pick.asin}>
                      <button type="button" aria-pressed={on} onClick={() => onEdit(r.key, { pick: o.pick.asin })}
                        className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-left text-xs font-bold ${on ? "pbr-edge border-2 text-[#e8edf5]" : "border-[#26324c] text-[#e8edf5]"}`}>
                        <span className="min-w-0">{o.pick.name}</span>
                        <span className="shrink-0 font-black pbr-accent">buy {packText(o, r.item)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}
          {!r.localOnly && (
            <label className="flex min-h-10 items-center gap-2 text-xs font-bold text-[#e8edf5]">
              <input type="checkbox" checked={r.local} onChange={(e) => onEdit(r.key, { local: e.target.checked })} className="h-5 w-5 accent-[var(--om-accent,#F97316)]" />
              Buy this one nearby instead of on Amazon
            </label>
          )}
          {r.localOnly && <p className={muted}>We don’t have an exact product for this one yet, so it stays on your local list.</p>}
        </div>
      </details>
    </li>
  );
}
