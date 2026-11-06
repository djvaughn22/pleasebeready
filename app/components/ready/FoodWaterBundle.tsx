"use client";

// The Food & Water bundle: every product and package count for the household,
// one Shop button each, and Save entire bundle. Math: lib/ready/bundle.ts.

import Link from "next/link";
import { useMemo, useState } from "react";
import { amazonUrl } from "../../lib/gear";
import { ALL_BOTTLED_UP_TO, BOTTLED_DAYS, bundle, defaultWay, foodFacts, rowsFor, savedList, shoppingText, tripStages, type Only, type Row, type WaterWay } from "../../lib/ready/bundle";
import { CALORIES_PER_DAY, PROTEIN_PER_DAY } from "../../lib/ready/nutrition";
import { roleText } from "../../lib/shop/picks";
import { durationLabel } from "../../lib/stockup/calc";
import { itemById } from "../../lib/stockup/catalog";
import { sources } from "../../lib/stockup/sources";
import { useLists } from "../shop/ListsProvider";
import BackupLink from "../stockup/BackupLink";
import ShopButton from "../stockup/ShopButton";
import { btnPrimary, card, muted } from "../stockup/ui";
import FoodWaterPicker, { bundleHref } from "./FoodWaterPicker";

const n = (x: number) => x.toLocaleString("en-US");
const plural = (k: number, one: string, many: string) => `${n(k)} ${k === 1 ? one : many}`;

/** "9 cases of 24", "3 packs of 12", "2 jars". */
function packText(r: Row) {
  const per = r.pick?.count ?? 1;
  if (per === 1) return `${n(r.packs)} ${r.unit}`;
  return r.id === "bottled-water" || r.id === "water" ? `${plural(r.packs, "case", "cases")} of ${per}` : `${plural(r.packs, "pack", "packs")} of ${per}`;
}

function detail(r: Row) {
  const unit = itemById(r.id)!.unit;
  const got = `${n(r.packUnits)} ${r.packUnits === 1 ? unit.one : unit.many}`;
  if (r.id === "bottled-water") return `${got}, about ${n(Math.floor((r.packUnits * 16.9) / 128))} gallons`;
  if (r.id === "water") return `${got} · heavy, so a store near you can be easier`;
  if (r.id === "water-storage-container") return `${r.prep} · holds ${n(r.packUnits * 7)} gallons · replace the water every 6 months`;
  if ((r.pick?.count ?? 1) === 1) return r.prep ?? "";
  return [r.packUnits > r.units ? `${got} (${n(r.units)} needed)` : got, r.prep].filter(Boolean).join(" · ");
}

function Line({ r }: { r: Row }) {
  const item = itemById(r.id)!;
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black leading-snug">{r.group} <span className="pbr-accent">· {packText(r)}</span></p>
        <p className={muted}>{r.pick ? r.pick.name : item.name}{detail(r) ? ` · ${detail(r)}` : ""}</p>
        {r.others.length > 0 && (
          <p className="flex flex-wrap gap-x-3 text-xs font-black">
            {r.others.map((o) => (
              <a key={o.asin} href={amazonUrl(o.asin)} target="_blank" rel="noopener noreferrer sponsored" data-measure="shop" data-measure-label={`${item.cat}-${o.role}-${r.id}`}
                aria-label={`${roleText[o.role]}: ${o.name} on Amazon (opens in a new tab)`} className="pbr-blue hover:underline">{roleText[o.role]}: {o.name} ↗</a>
            ))}
          </p>
        )}
        <BackupLink item={item} />
      </div>
      <div className="flex sm:w-48"><ShopButton item={item} big /></div>
    </li>
  );
}

function Done({ text }: { text: string }) {
  return <p className="py-3 text-sm font-black"><span className="pbr-accent">✓</span> {text}</p>;
}

export default function FoodWaterBundle({ people, days, goal: wanted, only, way: asked }: { people: number; days: number; goal?: number; only: Only; way: WaterWay | null }) {
  const api = useLists();
  const plans = api.store.plans;
  const way = asked ?? defaultWay(days);
  const b = useMemo(() => bundle(people, days, api.ready ? plans : [], way), [people, days, plans, api.ready, way]);
  // The list this exact bundle was saved to; changing people, days or what to shop clears it.
  const [savedAs, setSavedAs] = useState<{ key: string; id: string } | null>(null);
  const [copied, setCopied] = useState("");
  const key = `${people}-${days}-${only}-${way}`;
  const facts = foodFacts(b.food.rows);
  const pd = Math.max(1e-9, b.food.gap);
  const copy = async () => {
    try { await navigator.clipboard.writeText(shoppingText(b, only)); setCopied("Copied. Paste it into notes or a text."); }
    catch { setCopied("Copy didn't work in this browser."); }
  };
  const markFilled = () => {
    if (!b.source) return;
    api.update(b.source.id, (p) => {
      const l = p.list["water-storage-container"];
      return l ? { ...p, list: { ...p.list, "water-storage-container": { ...l, filled: (l.filled ?? 0) + b.water.fill } } } : p;
    });
  };
  const saved = savedAs?.key === key ? savedAs.id : null;
  const rows = rowsFor(b, only);
  const showWater = only !== "food";
  const showFood = only !== "water";
  // Shopping a smaller stage keeps the goal in the link, so the stages stay on screen.
  const goal = Math.max(wanted ?? days, days);
  const stages = tripStages(goal);
  const href = (d: number, o: Only = only) => `${bundleHref(people, d, o)}${goal > d ? `&goal=${goal}` : ""}`;
  const had = [showWater && b.water.have >= 1 ? `${n(Math.floor(b.water.have))} gallons` : "", showFood && b.food.have >= 1 ? `${n(Math.floor(b.food.have))} person-days` : ""].filter(Boolean);

  const save = () => {
    const list = savedList(b, only);
    api.putPlan(list);
    setSavedAs({ key, id: list.id });
  };

  return (
    <>
      <FoodWaterPicker live heading="h1" people={people} days={days} only={only} />

      <nav aria-label="What to shop" className="mt-3 flex flex-wrap gap-2 text-sm font-black">
        {([[null, "Food & Water"], ["water", "Water only"], ["food", "Food only"]] as const).map(([o, t]) => (
          <Link key={t} href={href(days, o)} replace scroll={false} aria-current={only === o ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full border px-3 ${only === o ? "border-[#F97316] pbr-accent" : "border-[#26324c] text-[#e8edf5]"}`}>{t}</Link>
        ))}
      </nav>

      {stages.length > 1 && (
        <nav aria-label="Build up one trip at a time" className="mt-3">
          <p className="text-xs font-black uppercase tracking-wider text-[#94a3b8]">One trip at a time</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm font-black">
            {stages.map((d, i) => (
              <span key={d} className="inline-flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className="text-[#94a3b8]">→</span>}
                <Link href={href(d)} replace scroll={false} aria-current={d === days ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full border px-3 ${d === days ? "border-[#F97316] pbr-accent" : "border-[#26324c] text-[#e8edf5] hover:border-[#F97316]"}`}>{durationLabel(d)}</Link>
              </span>
            ))}
          </p>
          <p className={`mt-1 ${muted}`}>
            Too much at once? Shop a smaller stage first and save it. Tick what you buy on your <Link href="/lists" className="underline">list</Link>, and the next stage shows only what’s left.
          </p>
        </nav>
      )}

      {had.length > 0 && b.source && (
        <p className={`mt-3 ${muted}`}>
          Counting {had.join(" and ")} you already have, from{" "}
          <Link href={`/lists#list=${b.source.id}`} className="underline">{b.source.name}</Link>.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        {rows.length > 0 && (
          <button type="button" onClick={save} disabled={!api.ready} className={`${btnPrimary} min-h-12 text-base sm:w-auto`}>
            {saved ? "Saved ✓" : "Save entire bundle"}
          </button>
        )}
        {rows.length > 0 && <button type="button" onClick={copy} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#26324c] bg-[#1c2740] px-4 text-sm font-black text-[#e8edf5] hover:border-[#F97316]">Copy shopping list</button>}
        {copied && <p role="status" className={muted}>{copied}</p>}
        {saved && (
          <p role="status" className="text-sm font-black">
            Saved to <Link href={`/lists#list=${saved}`} className="pbr-accent underline">Food &amp; Water</Link> on this device.
          </p>
        )}
      </div>

      {showWater && (
        <section aria-labelledby="fw-water" className={`${card} mt-5 px-4 sm:px-5`}>
          <h2 id="fw-water" className="pt-4 text-xs font-black uppercase tracking-wider text-[#94a3b8]">
            Water · {b.water.gap > 0 ? `${n(Math.ceil(b.water.gap - 1e-9))} gallons needed` : "covered"}
          </h2>
          {days > ALL_BOTTLED_UP_TO && b.water.gap > 0 && (
            <nav aria-label="How to get the water" className="mt-2 flex flex-wrap gap-2 text-xs font-black">
              {([["stored", `${BOTTLED_DAYS} days bottled + store tap water`], ["bottled", "All bottled"]] as const).map(([w, t]) => (
                <Link key={w} href={`${href(days)}&water=${w}`} replace scroll={false} aria-current={way === w ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full border px-3 ${way === w ? "border-[#F97316] pbr-accent" : "border-[#26324c] text-[#e8edf5]"}`}>{t}</Link>
              ))}
            </nav>
          )}
          {b.water.fill > 0 && (
            <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
              <p className="min-w-0 flex-1 text-sm font-black">Fill the {plural(b.water.fill, "container", "containers")} you have <span className={muted}>· from your tap, after cleaning them. They count once filled.</span></p>
              <button type="button" onClick={markFilled} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#26324c] bg-[#1c2740] px-3 text-xs font-black text-[#e8edf5] hover:border-[#F97316] sm:w-48">Mark {b.water.fill} filled</button>
            </div>
          )}
          {b.water.rows.length ? (
            <ul className="divide-y divide-[var(--om-border)]">
              {b.water.rows.map((r) => <Line key={r.id} r={r} />)}
              <Line r={b.water.jugRow} />
            </ul>
          ) : b.water.fill ? null : <Done text={`Water covered for ${plural(people, "person", "people")}, ${durationLabel(days)}.`} />}
        </section>
      )}

      {showFood && (
        <section aria-labelledby="fw-food" className={`${card} mt-4 px-4 sm:px-5`}>
          <h2 id="fw-food" className="pt-4 text-xs font-black uppercase tracking-wider text-[#94a3b8]">
            Food · {b.food.gap > 0 ? `${n(Math.ceil(b.food.gap - 1e-9))} person-days needed` : "covered"} · 2,000 calories each
          </h2>
          {b.food.rows.length ? (
            <>
              <p className={`mt-1 ${muted}`}>
                From the labels: about {n(Math.round(facts.kcal / pd / 10) * 10)} calories and {n(Math.floor(facts.protein / pd))} g protein a person-day
                (we plan {n(CALORIES_PER_DAY)} and {PROTEIN_PER_DAY} g). Nothing needs water or cooking.
              </p>
              <ul className="divide-y divide-[var(--om-border)]">{b.food.rows.map((r) => <Line key={r.id} r={r} />)}</ul>
              <p className={`pb-4 ${muted}`}>
                Calories and protein only, not a complete diet: children need less, active adults more. Any grocery store works with the same
                amounts of foods your household eats. Plan for babies, allergies and special diets, and eat and replace what nears its date.
              </p>
            </>
          ) : <Done text={`Food counted for ${plural(people, "person", "people")}, ${durationLabel(days)}, at 2,000 calories a person-day.`} />}
        </section>
      )}

      <p className={`mt-4 ${muted}`}>
        Each button opens one product on Amazon. We can’t see its stock, and grocery listings can depend on your delivery area: if one is out, use the search link under it, or take the list to any store. 1 gallon of water per person per day (<a href={sources["rg-water"].href} target="_blank" rel="noopener noreferrer" className="underline">Ready.gov</a>); more for hot weather, nursing or illness.
        {" "}A person-day is a day of food for one person, counted as 2,000 calories.
      </p>
      <p className="mt-3 text-sm font-black">
        <Link href="/ready" className="pbr-accent">Full readiness plan: Get Ready →</Link>
      </p>
    </>
  );
}
