"use client";

// One department: its featured exact products (most important first, see
// laneFeatured), the page's kits and guides (passed in), budget-to-upgrade
// choices, then everything in the lane with filters: type, must-haves or more,
// the situation it's for, exact products only, and words. Categories run in
// the lane's order of importance, and open a few cards at a time.

import { useState, type ReactNode } from "react";
import { catRank, isSecondary, laneById, laneFeatured, laneItems, laneSort, type LaneId } from "../../lib/shop/lanes";
import { hasPick, picksFor, primaryPick } from "../../lib/shop/picks";
import { matches } from "../../lib/stockup/calc";
import { categories, occasions } from "../../lib/stockup/catalog";
import type { CategoryId, OccasionId, Priority } from "../../lib/stockup/types";
import { btnSmall, input, inset, label, muted } from "../stockup/ui";
import ItemCard from "./ItemCard";
import ListsProvider from "./ListsProvider";
import SaveToast, { ListPicker } from "./SaveBar";
import Saver from "./Saver";
import { CompareCard, ProductTile } from "./Store";

type Level = "essential" | "useful" | "all";
const levelText: Record<Level, string> = { essential: "Must-haves", useful: "Must-haves + useful", all: "Everything" };
const allowed = (pri: Priority, level: Level) => level === "all" || pri === "essential" || (level === "useful" && pri === "useful");
const FIRST = 6;

export default function LaneShop({ laneId, children }: { laneId: LaneId; children?: ReactNode }) {
  const lane = laneById(laneId)!;
  const featured = laneFeatured(lane, hasPick, lane.featured ? 12 : 8);
  const compare = laneSort(lane, laneItems(lane), hasPick)
    .filter((i) => picksFor(i.id).length > 1 && !featured.includes(i)).slice(0, 4);
  return (
    <ListsProvider>
      <Saver>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2"><ListPicker /></div>
        {featured.length > 0 && (
          <section aria-labelledby="lane-picks" className="mb-10">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
              <h2 id="lane-picks" className="pbr-display scroll-mt-20 text-xl font-black sm:text-2xl">{lane.featured ? "Essentials first" : "Top picks"}</h2>
              {lane.id === "emergency" && <a href="https://www.ready.gov/kit" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#94a3b8] underline">In Ready.gov basic-kit order ↗</a>}
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((i) => <ProductTile key={i.id} pick={primaryPick(i.id)!} tag={i.pri === "essential" ? "Must-have" : undefined} />)}
            </ul>
          </section>
        )}
        {children}
        {compare.length > 0 && (
          <section aria-labelledby="lane-compare" className="mb-10">
            <h2 id="lane-compare" className="pbr-display mb-3 text-xl font-black sm:text-2xl">Budget, our pick, upgrade</h2>
            <ul className="grid gap-3 md:grid-cols-2">{compare.map((i) => <CompareCard key={i.id} id={i.id} />)}</ul>
          </section>
        )}
        <section aria-labelledby="lane-all">
          <h2 id="lane-all" className="pbr-display mb-3 text-xl font-black sm:text-2xl">Everything <span className="text-sm text-[#94a3b8]">({laneItems(lane).length})</span></h2>
          <LaneBody laneId={laneId} />
        </section>
        <SaveToast />
      </Saver>
    </ListsProvider>
  );
}

function LaneBody({ laneId }: { laneId: LaneId }) {
  const lane = laneById(laneId)!;
  const items = laneItems(lane);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [level, setLevel] = useState<Level>("useful");
  const [situation, setSituation] = useState<OccasionId | "any">("any");
  const [picksOnly, setPicksOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<CategoryId>>(() => new Set());

  // A lane holds a few hundred items at most, so filtering on each render is cheap (and the compiler memoizes it).
  const cats = categories.filter((c) => items.some((i) => i.cat === c.id)).sort((a, b) => catRank(lane, a.id) - catRank(lane, b.id));
  const situations = occasions.filter((o) => items.some((i) => i.occ.includes(o.id)));
  const searching = query.trim() !== "";
  const shown = items.filter((i) => (cat === "all" || i.cat === cat) && (searching || allowed(i.pri, level))
    && (situation === "any" || i.occ.includes(situation)) && (!picksOnly || hasPick(i.id)) && matches(i, query));
  // Must-haves first, and within each level our exact products before plain searches.
  const groups = cats.map((c) => ({ c, list: laneSort(lane, shown.filter((i) => i.cat === c.id), hasPick) }))
    .filter((g) => g.list.length);
  const filtered = cat !== "all" || level !== "useful" || situation !== "any" || picksOnly || searching;
  const reset = () => { setCat("all"); setLevel("useful"); setSituation("any"); setPicksOnly(false); setQuery(""); };

  return (
    <div className="pbr-planner lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-8">
      <div>
      <label htmlFor="lane-search" className="sr-only">Search {lane.title.toLowerCase()}</label>
      <input id="lane-search" type="search" className={`${input} h-12 w-full`} placeholder={`🔎 Search ${items.length} items in ${lane.title.toLowerCase()}`}
        value={query} onChange={(e) => setQuery(e.target.value)} />

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 lg:flex-col lg:items-stretch" role="group" aria-label="Type of item">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>All</Chip>
        {cats.map((c) => <Chip key={c.id} on={cat === c.id} onClick={() => setCat(cat === c.id ? "all" : c.id)}>{c.emoji} {c.title}</Chip>)}
      </div>

      <details className="mt-3" open={(level !== "useful" || situation !== "any" || picksOnly) || undefined}>
        <summary className="cursor-pointer text-sm font-black text-[#94a3b8]">More filters{filtered && !searching && cat === "all" ? " (on)" : ""}</summary>
        <div className={`${inset} mt-2 grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-1`}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lane-level" className={label}>Show</label>
            <select id="lane-level" className={input} value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              {(Object.keys(levelText) as Level[]).map((l) => <option key={l} value={l}>{levelText[l]}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lane-for" className={label}>For</label>
            <select id="lane-for" className={input} value={situation} onChange={(e) => setSituation(e.target.value as OccasionId | "any")}>
              <option value="any">Any situation</option>
              {situations.map((o) => <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>)}
            </select>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 self-end text-sm font-black text-[#e8edf5]">
            <input type="checkbox" className="h-5 w-5" style={{ accentColor: "#F97316" }} checked={picksOnly} onChange={(e) => setPicksOnly(e.target.checked)} />
            Our checked products only
          </label>
          {filtered && <button type="button" className={`${btnSmall} sm:col-span-3 lg:col-span-1`} onClick={reset}>Clear search and filters</button>}
        </div>
      </details>
      </div>
      <div>

      <p className={`mb-5 mt-3 lg:mt-0 ${muted}`} aria-live="polite">
        {shown.length} {shown.length === 1 ? "item" : "items"}{searching ? " match" : ""}
      </p>

      {groups.length === 0 && (
        <div className={`${inset} p-5 text-center`}>
          <p className="text-sm font-bold">Nothing matches.</p>
          <p className={muted}>Try a shorter word, or clear the filters.</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {groups.map(({ c, list }) => {
          const expanded = open.has(c.id) || searching || cat !== "all" || list.length <= FIRST + 2;
          return (
            <section key={c.id} aria-labelledby={`lane-${c.id}`}>
              <h2 id={`lane-${c.id}`} className="mb-3 text-lg font-black"><span aria-hidden>{c.emoji} </span>{c.title} <span className="text-sm text-[#94a3b8]">({list.length})</span></h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {(expanded ? list : list.slice(0, FIRST)).map((i) => <ItemCard key={i.id} item={i} minor={isSecondary(i, lane)} />)}
              </ul>
              {list.length > FIRST + 2 && !searching && cat === "all" && (
                <button type="button" className={`${btnSmall} mt-3 w-full`} aria-expanded={expanded}
                  onClick={() => setOpen((s) => { const x = new Set(s); if (x.has(c.id)) x.delete(c.id); else x.add(c.id); return x; })}>
                  {expanded ? "Show fewer" : `See all ${list.length} ${c.title.toLowerCase()}`}
                </button>
              )}
            </section>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-3 text-sm font-black transition ${on ? "border-[#F97316] bg-[#1c2740] pbr-accent" : "border-[#26324c] text-[#94a3b8] hover:text-[#e8edf5]"}`}>
      {children}
    </button>
  );
}
