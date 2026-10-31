"use client";

// Everything in one lane, with quick filters: type, must-haves or more, the
// situation it's for, our checked products only, and words. Categories open a
// few cards at a time so phones stay fast.

import { useState } from "react";
import { laneById, laneItems, type LaneId } from "../../lib/shop/lanes";
import { hasPick } from "../../lib/shop/picks";
import { matches } from "../../lib/stockup/calc";
import { categories, occasions } from "../../lib/stockup/catalog";
import type { CatalogItem, CategoryId, OccasionId, Priority } from "../../lib/stockup/types";
import { btnSmall, input, inset, label, muted } from "../stockup/ui";
import ItemCard from "./ItemCard";
import ListsProvider from "./ListsProvider";
import SaveBar from "./SaveBar";
import Saver from "./Saver";

type Level = "essential" | "useful" | "all";
const levelText: Record<Level, string> = { essential: "Must-haves", useful: "Must-haves + useful", all: "Everything" };
const allowed = (pri: Priority, level: Level) => level === "all" || pri === "essential" || (level === "useful" && pri === "useful");
const rank: Record<Priority, number> = { essential: 0, useful: 1, extra: 2 };
const FIRST = 6;

export default function LaneShop({ laneId }: { laneId: LaneId }) {
  return (
    <ListsProvider>
      <Saver>
        <LaneBody laneId={laneId} />
        <SaveBar />
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
  const cats = categories.filter((c) => items.some((i) => i.cat === c.id));
  const situations = occasions.filter((o) => items.some((i) => i.occ.includes(o.id)));
  const searching = query.trim() !== "";
  const shown = items.filter((i) => (cat === "all" || i.cat === cat) && (searching || allowed(i.pri, level))
    && (situation === "any" || i.occ.includes(situation)) && (!picksOnly || hasPick(i.id)) && matches(i, query));
  // Must-haves first, and within each level our exact products before plain searches.
  const order = (i: CatalogItem) => rank[i.pri] * 2 + (hasPick(i.id) ? 0 : 1);
  const groups = cats.map((c) => ({ c, list: shown.filter((i) => i.cat === c.id).sort((a, b) => order(a) - order(b)) }))
    .filter((g) => g.list.length);
  const ourPicks = items.filter((i) => hasPick(i.id)).sort((a, b) => order(a) - order(b)).slice(0, 6);
  const filtered = cat !== "all" || level !== "useful" || situation !== "any" || picksOnly || searching;
  const reset = () => { setCat("all"); setLevel("useful"); setSituation("any"); setPicksOnly(false); setQuery(""); };

  return (
    <div className="pbr-planner">
      {ourPicks.length > 0 && !filtered && (
        <section aria-labelledby="lane-picks" className="mb-8">
          <h3 id="lane-picks" className="mb-1 scroll-mt-20 text-lg font-black">Products we picked</h3>
          <p className={`mb-3 ${muted}`}>Exact products for the most-needed things here. Everything else opens an Amazon search.</p>
          <ul className="grid gap-3 sm:grid-cols-2">{ourPicks.map((i) => <ItemCard key={i.id} item={i} compact />)}</ul>
        </section>
      )}
      <label htmlFor="lane-search" className="sr-only">Search {lane.title.toLowerCase()}</label>
      <input id="lane-search" type="search" className={`${input} h-12 w-full`} placeholder={`🔎 Search ${items.length} items in ${lane.title.toLowerCase()}`}
        value={query} onChange={(e) => setQuery(e.target.value)} />

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Type of item">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>All</Chip>
        {cats.map((c) => <Chip key={c.id} on={cat === c.id} onClick={() => setCat(cat === c.id ? "all" : c.id)}>{c.emoji} {c.title}</Chip>)}
      </div>

      <details className="mt-3" open={(level !== "useful" || situation !== "any" || picksOnly) || undefined}>
        <summary className="cursor-pointer text-sm font-black text-[#94a3b8]">More filters{filtered && !searching && cat === "all" ? " (on)" : ""}</summary>
        <div className={`${inset} mt-2 grid gap-3 p-4 sm:grid-cols-3`}>
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
            <input type="checkbox" className="h-5 w-5" style={{ accentColor: "#34D399" }} checked={picksOnly} onChange={(e) => setPicksOnly(e.target.checked)} />
            Our checked products only
          </label>
          {filtered && <button type="button" className={`${btnSmall} sm:col-span-3`} onClick={reset}>Clear search and filters</button>}
        </div>
      </details>

      <p className={`mb-5 mt-3 ${muted}`} aria-live="polite">
        {shown.length} {shown.length === 1 ? "item" : "items"}{searching ? " match" : ""}. Kits above work out amounts for your group; here, save anything to a list.
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
              <ul className="grid gap-3 sm:grid-cols-2">
                {(expanded ? list : list.slice(0, FIRST)).map((i) => <ItemCard key={i.id} item={i} />)}
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
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-3 text-sm font-black transition ${on ? "border-[#34D399] bg-[#1c2740] pbr-accent" : "border-[#26324c] text-[#94a3b8] hover:text-[#e8edf5]"}`}>
      {children}
    </button>
  );
}
