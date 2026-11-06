"use client";

// Water and food on the Get Ready plan: needed, ready, remaining, and the
// ways to fill the gap with one tap each. Counting lives in lib/ready/supplies.ts.

import type { ReactNode } from "react";
import { amazonUrl } from "../../lib/gear";
import { waterHint, type Readiness } from "../../lib/ready/engine";
import { FOOD_KITS, floor1, foodMix, foodParts, waterOptions, waterParts, type Part } from "../../lib/ready/supplies";
import { picksFor, primaryPick, roleText } from "../../lib/shop/picks";
import { durationLabel } from "../../lib/stockup/calc";
import { itemById } from "../../lib/stockup/catalog";
import { sources } from "../../lib/stockup/sources";
import type { Line, Plan } from "../../lib/stockup/types";
import { packsText } from "../../lib/stockup/shop";
import BackupLink from "../stockup/BackupLink";
import ShopButton from "../stockup/ShopButton";
import { Stepper, btnSmall, card, muted } from "../stockup/ui";

const n = (x: number) => x.toLocaleString("en-US");
type Set = (id: string, fn: (l: Line) => Line) => void;
type Add = (id: string, field: "have" | "bought", qty: number) => void;

const who = (p: Plan) => `${n(p.people)} ${p.people === 1 ? "person" : "people"} · ${durationLabel(p.days)}`;

function Stats({ need, ready, unit }: { need: number; ready: number; unit: string }) {
  const left = Math.max(0, need - ready);
  return (
    <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
      {[["needed", need], ["ready", ready], ["remaining", left]].map(([k, v]) => (
        <div key={k} className="rounded-xl bg-[var(--om-surface-2)] px-2 py-2">
          <dd className={`pbr-display text-2xl font-black leading-none ${k === "remaining" && left > 0 ? "pbr-accent" : ""}`}>{n(v as number)}</dd>
          <dt className="mt-1 text-[0.7rem] font-black uppercase tracking-wider text-[#94a3b8]">{unit} {k}</dt>
        </div>
      ))}
    </dl>
  );
}

const partsText = (ps: Part[], unit: string) => ps.filter((p) => p.amount >= 0.5).map((p, i) => `${n(floor1(p.amount))}${i ? "" : ` ${unit}`} ${p.label}`).join(" · ");

/** One way to fill the gap: what, how many, Shop / Bought / Already have. */
function Way({ id, title, qty, tag, actions }: { id: string; title: string; qty: string; tag?: string; actions: ReactNode }) {
  const item = itemById(id)!;
  const pick = primaryPick(id);
  const others = picksFor(id).filter((p) => p !== pick);
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black leading-snug">{title} <span className="pbr-accent">· {qty}</span></p>
        <p className={muted}>
          {pick ? pick.name : `Any brand · ${item.q ?? item.name}`}{tag ? ` · ${tag}` : ""}
        </p>
        {others.length > 0 && (
          <p className="flex flex-wrap gap-x-3 text-xs font-black print:hidden">
            {others.map((o) => (
              <a key={o.asin} href={amazonUrl(o.asin)} target="_blank" rel="noopener noreferrer sponsored" data-measure="shop" data-measure-label={`${item.cat}-${o.role}-${id}`}
                aria-label={`${roleText[o.role]}: ${o.name} on Amazon (opens in a new tab)`} className="pbr-blue hover:underline">{roleText[o.role]}: {o.name} ↗</a>
            ))}
          </p>
        )}
        <BackupLink item={item} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center print:hidden">{actions}</div>
    </li>
  );
}

const Shop = ({ id }: { id: string }) => <span className="col-span-2 flex"><ShopButton item={itemById(id)!} big /></span>;

export function WaterCard({ plan, r, gap, setLine, add }: { plan: Plan; r: Readiness; gap: number; setLine: Set; add: Add }) {
  const w = r.items.find((i) => i.item.id === "water");
  if (!w) return null;
  const ready = floor1(w.covered);
  const opt = waterOptions(gap);
  const case24 = 24;
  const con = plan.list["water-storage-container"];
  const owned = con ? con.have + (con.bought ?? 0) : 0;
  const empty = Math.max(0, owned - (con?.filled ?? 0));
  const fill = Math.min(empty, opt.containers);
  return (
    <section aria-labelledby="water-title" className={`${card} p-4 sm:p-5`}>
      <h3 id="water-title" className="pbr-display text-lg font-black"><span aria-hidden>💧</span> Water for {who(plan)}</h3>
      <Stats need={w.need} ready={ready} unit="gallons" />
      {ready > 0 && <p className={`mt-2 ${muted}`}>Ready: {partsText(waterParts(plan), "gallons")}</p>}
      {waterHint(w.need) && <p className={`mt-1 ${muted}`}>{waterHint(w.need)}</p>}
      {gap > 0 ? (
        <>
          <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-[#94a3b8]">Shop water · {n(gap)} gallons</h4>
          <ul className="divide-y divide-[var(--om-border)]">
            <Way id="bottled-water" title="Bottled water" qty={`${n(opt.cases)} ${opt.cases === 1 ? "case" : "cases"} of 24`} tag="about 3.2 gallons a case"
              actions={<><Shop id="bottled-water" />
                <button type="button" className={btnSmall} onClick={() => add("bottled-water", "bought", opt.cases * case24)}>Bought {opt.cases}</button>
                <button type="button" className={btnSmall} onClick={() => add("bottled-water", "have", opt.cases * case24)}>Already have</button></>} />
            <Way id="water" title="Gallon jugs" qty={`${n(opt.jugs)} ${opt.jugs === 1 ? "jug" : "jugs"}`} tag={packsText(itemById("water")!, opt.jugs) ?? undefined}
              actions={<><Shop id="water" />
                <button type="button" className={btnSmall} onClick={() => add("water", "bought", opt.jugs)}>Bought {opt.jugs}</button>
                <button type="button" className={btnSmall} onClick={() => add("water", "have", opt.jugs)}>Already have</button></>} />
            {fill > 0 ? (
              <Way id="water-storage-container" title="Fill your containers from the tap" qty={`${n(fill)} × 7 gallons`} tag="clean them first; replace every 6 months"
                actions={<button type="button" className={`${btnSmall} col-span-2`} onClick={() => setLine("water-storage-container", (l) => ({ ...l, filled: (l.filled ?? 0) + fill }))}>Filled {fill}</button>} />
            ) : (
              <Way id="water-storage-container" title="Containers to fill from the tap" qty={`${n(opt.containers)} × 7 gallons`} tag="empty until you fill them"
                actions={<><Shop id="water-storage-container" />
                  <button type="button" className={btnSmall} onClick={() => add("water-storage-container", "bought", opt.containers)}>Bought {opt.containers}</button>
                  <button type="button" className={btnSmall} onClick={() => add("water-storage-container", "have", opt.containers)}>Already have</button></>} />
            )}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm font-black"><span className="pbr-accent">✓</span> Water ready. <span className={muted}>Replace water you bottled yourself every 6 months.</span></p>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3 print:hidden">
        <Stepper compact id="water-stored" text="Gallons already stored" value={plan.list.water?.have ?? 0} min={0} max={100000}
          onChange={(v) => setLine("water", (l) => ({ ...l, have: v, restock: undefined }))} />
        {owned > 0 && (
          <Stepper compact id="water-filled" text="Containers filled" value={con?.filled ?? 0} min={0} max={owned}
            onChange={(v) => setLine("water-storage-container", (l) => ({ ...l, filled: v }))} />
        )}
      </div>
      <p className={`mt-3 ${muted}`}>
        Plan more for hot weather, nursing, children or illness.{" "}
        <a href={sources["rg-water"].href} target="_blank" rel="noopener noreferrer" className="underline">Ready.gov</a>
        {" · "}Tablets and filters don’t make every source safe; boiling is best for germs, and nothing here removes fuel or chemicals.{" "}
        <a href={sources["cdc-water"].href} target="_blank" rel="noopener noreferrer" className="underline">CDC</a>
      </p>
      {gap > 0 && (
        <ul className="mt-1 divide-y divide-[var(--om-border)]">
          <Way id="water-purification-tablets" title="Backup: treatment tablets" qty="1 pack" tag="not counted as water"
            actions={<Shop id="water-purification-tablets" />} />
        </ul>
      )}
    </section>
  );
}

export function FoodCard({ plan, r, gap, setLine, add }: { plan: Plan; r: Readiness; gap: number; setLine: Set; add: Add }) {
  const f = r.items.find((i) => i.item.id === "shelf-food");
  if (!f) return null;
  const ready = floor1(f.covered);
  const mix = foodMix(gap, plan, f.need);
  const kit = FOOD_KITS[0];
  const packs = Math.ceil(gap / kit.days);
  return (
    <section aria-labelledby="food-title" className={`${card} p-4 sm:p-5`}>
      <h3 id="food-title" className="pbr-display text-lg font-black"><span aria-hidden>🥫</span> Food for {who(plan)}</h3>
      <Stats need={f.need} ready={ready} unit="person-days" />
      <p className={`mt-2 ${muted}`}>A person-day is a day of food for one person, counted as 2,000 calories.{ready > 0 ? ` Ready: ${partsText(foodParts(plan, f.need), "person-days")}` : ""}</p>
      {gap > 0 ? (
        <>
          <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-[#94a3b8]">Shop food · {n(gap)} person-days</h4>
          <ul className="divide-y divide-[var(--om-border)]">
            {mix.map((m) => {
              const item = itemById(m.id)!;
              const unit = m.qty === 1 ? item.unit.one : item.unit.many;
              return (
                <Way key={m.id} id={m.id} title={m.group} qty={`${n(m.qty)} ${unit}`} tag={[packsText(item, m.qty), m.prep].filter(Boolean).join(" · ")}
                  actions={<><Shop id={m.id} />
                    <button type="button" className={btnSmall} onClick={() => add(m.id, "bought", m.qty)}>Bought {m.qty}</button>
                    <button type="button" className={btnSmall} onClick={() => add(m.id, "have", m.qty)}>Already have</button></>} />
              );
            })}
            <Way id={kit.id} title="Or: emergency ration packs" qty={`${n(packs)} ${packs === 1 ? "pack" : "packs"}`} tag={`${kit.note}; a backup, not a full diet`}
              actions={<><Shop id={kit.id} />
                <button type="button" className={btnSmall} onClick={() => add(kit.id, "bought", packs)}>Bought {packs}</button>
                <button type="button" className={btnSmall} onClick={() => add(kit.id, "have", packs)}>Already have</button></>} />
          </ul>
          <p className={`mt-2 ${muted}`}>Any grocery store works. Choose foods your household eats, and plan for babies, allergies and special diets.</p>
        </>
      ) : (
        <p className="mt-3 text-sm font-black"><span className="pbr-accent">✓</span> Food ready. <span className={muted}>Check dates and eat and replace what’s close.</span></p>
      )}
      <div className="mt-3 print:hidden">
        <Stepper compact id="food-have" text="Person-days of food already in the house" value={plan.list["shelf-food"]?.have ?? 0} min={0} max={100000}
          onChange={(v) => setLine("shelf-food", (l) => ({ ...l, have: v, restock: undefined }))} />
      </div>
    </section>
  );
}
