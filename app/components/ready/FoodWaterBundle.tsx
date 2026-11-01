"use client";

// The Food & Water bundle: every product and package count for the household,
// one Shop button each, and Save entire bundle. Math: lib/ready/bundle.ts.

import Link from "next/link";
import { useMemo, useState } from "react";
import { amazonUrl } from "../../lib/gear";
import { bundle, rowsFor, savedList, type Only, type Row } from "../../lib/ready/bundle";
import { roleText } from "../../lib/shop/picks";
import { durationLabel } from "../../lib/stockup/calc";
import { itemById } from "../../lib/stockup/catalog";
import { shopLink } from "../../lib/stockup/shop";
import { sources } from "../../lib/stockup/sources";
import { useLists } from "../shop/ListsProvider";
import ShopButton from "../stockup/ShopButton";
import { btnPrimary, card, muted } from "../stockup/ui";
import FoodWaterPicker, { bundleHref } from "./FoodWaterPicker";

const n = (x: number) => x.toLocaleString("en-US");
const plural = (k: number, one: string, many: string) => `${n(k)} ${k === 1 ? one : many}`;

/** "9 cases of 24", "3 packs of 12", "2 jars". */
function packText(r: Row) {
  const per = r.pick?.count ?? 1;
  if (per === 1) return `${n(r.packs)} ${r.unit}`;
  return r.id === "bottled-water" ? `${plural(r.packs, "case", "cases")} of ${per}` : `${plural(r.packs, "pack", "packs")} of ${per}`;
}

function detail(r: Row) {
  const unit = itemById(r.id)!.unit;
  const got = `${n(r.packUnits)} ${r.packUnits === 1 ? unit.one : unit.many}`;
  if (r.id === "bottled-water") return `${got}, about ${n(Math.floor((r.packUnits * 16.9) / 128))} gallons`;
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
      </div>
      <div className="flex sm:w-48"><ShopButton item={item} big /></div>
    </li>
  );
}

function Done({ text }: { text: string }) {
  return <p className="py-3 text-sm font-black"><span className="pbr-accent">✓</span> {text}</p>;
}

export default function FoodWaterBundle({ people, days, only }: { people: number; days: number; only: Only }) {
  const api = useLists();
  const plans = api.store.plans;
  const b = useMemo(() => bundle(people, days, api.ready ? plans : []), [people, days, plans, api.ready]);
  // The list this exact bundle was saved to; changing people, days or what to shop clears it.
  const [savedAs, setSavedAs] = useState<{ key: string; id: string } | null>(null);
  const key = `${people}-${days}-${only}`;
  const saved = savedAs?.key === key ? savedAs.id : null;
  const rows = rowsFor(b, only);
  const showWater = only !== "food";
  const showFood = only !== "water";
  const jugs = shopLink(itemById("water")!);
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
          <Link key={t} href={bundleHref(people, days, o)} replace scroll={false} aria-current={only === o ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full border px-3 ${only === o ? "border-[#F97316] pbr-accent" : "border-[#26324c] text-[#e8edf5]"}`}>{t}</Link>
        ))}
      </nav>

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
        {saved && (
          <p role="status" className="text-sm font-black">
            Saved to <Link href={`/lists#list=${saved}`} className="pbr-accent underline">Food &amp; Water</Link> on this device.
          </p>
        )}
      </div>

      {showWater && (
        <section aria-labelledby="fw-water" className={`${card} mt-5 px-4 sm:px-5`}>
          <h2 id="fw-water" className="pt-4 text-xs font-black uppercase tracking-wider text-[#94a3b8]">
            Water · {b.water.gap > 0 ? `${n(Math.ceil(b.water.gap - 1e-9))} gallons to buy` : "covered"}
          </h2>
          {b.water.rows.length ? (
            <ul className="divide-y divide-[var(--om-border)]">
              {b.water.rows.map((r) => <Line key={r.id} r={r} />)}
              <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                <p className="min-w-0 flex-1 text-sm font-black">Or {plural(b.water.jugs, "one-gallon jug", "one-gallon jugs")} <span className={muted}>· any grocery store</span></p>
                <a href={jugs.url} target="_blank" rel="noopener noreferrer sponsored" data-measure="shop" data-measure-label="water-s-water"
                  className="pbr-edge pbr-accent inline-flex min-h-10 items-center justify-center rounded-lg border-2 bg-transparent px-3 text-xs font-black sm:w-48">
                  Search Amazon ↗
                </a>
              </li>
            </ul>
          ) : <Done text={`Water covered for ${plural(people, "person", "people")}, ${durationLabel(days)}.`} />}
        </section>
      )}

      {showFood && (
        <section aria-labelledby="fw-food" className={`${card} mt-4 px-4 sm:px-5`}>
          <h2 id="fw-food" className="pt-4 text-xs font-black uppercase tracking-wider text-[#94a3b8]">
            Food · {b.food.gap > 0 ? `${n(Math.ceil(b.food.gap - 1e-9))} person-days to buy` : "covered"}
          </h2>
          {b.food.rows.length ? (
            <>
              <ul className="divide-y divide-[var(--om-border)]">{b.food.rows.map((r) => <Line key={r.id} r={r} />)}</ul>
              <p className={`pb-4 ${muted}`}>Any grocery store works: the same amounts of foods your household eats. Plan for babies, allergies and special diets.</p>
            </>
          ) : <Done text={`Food covered for ${plural(people, "person", "people")}, ${durationLabel(days)}.`} />}
        </section>
      )}

      <p className={`mt-4 ${muted}`}>
        Each button opens one product on Amazon. 1 gallon of water per person per day (<a href={sources["rg-water"].href} target="_blank" rel="noopener noreferrer" className="underline">Ready.gov</a>); more for hot weather, nursing or illness.
        {" "}A person-day is a day of food for one person.
      </p>
      <p className="mt-3 text-sm font-black">
        <Link href="/ready" className="pbr-accent">Full readiness plan: Get Ready →</Link>
      </p>
    </>
  );
}
