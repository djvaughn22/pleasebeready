"use client";

// Suggestions for the plan, by category. Add one item, a whole category,
// the ones you tick, or everything shown. Adding twice never duplicates.

import { useMemo, useState } from "react";
import { everything, matches, planSummary, unitWord } from "../../lib/stockup/calc";
import { categories } from "../../lib/stockup/catalog";
import type { CategoryId, Plan, Priority, Suggestion } from "../../lib/stockup/types";
import ShopButton from "./ShopButton";
import type { PlansApi } from "./usePlans";
import { GoodToKnow, PriorityTag, btn, btnPrimary, btnSmall, input, inset, label, muted } from "./ui";

type Level = "essential" | "useful" | "all";
const levelText: Record<Level, string> = { essential: "Essentials", useful: "Essentials + useful", all: "Everything" };
const allowed = (pri: Priority, level: Level) =>
  level === "all" || pri === "essential" || (level === "useful" && pri === "useful");

export default function Suggestions({ plan, api, suggestions, onList, onSetup }: {
  plan: Plan; api: PlansApi; suggestions: Suggestion[]; onList: () => void; onSetup: () => void;
}) {
  const [query, setQuery] = useState("");
  const [wide, setWide] = useState(false);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [level, setLevel] = useState<Level>("all");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [note, setNote] = useState("");

  const pool = useMemo(() => (wide && query.trim() ? everything(plan) : suggestions), [wide, query, plan, suggestions]);
  const shown = useMemo(
    () => pool.filter((s) => (cat === "all" || s.item.cat === cat) && allowed(s.item.pri, level) && matches(s.item, query)),
    [pool, cat, level, query],
  );
  const groups = useMemo(() => {
    const m = new Map<CategoryId, Suggestion[]>();
    for (const s of shown) m.set(s.item.cat, [...(m.get(s.item.cat) ?? []), s]);
    return categories.filter((c) => m.has(c.id)).map((c) => ({ c, items: m.get(c.id)! }));
  }, [shown]);
  const catCounts = useMemo(() => {
    const m = new Map<CategoryId, number>();
    for (const s of suggestions) m.set(s.item.cat, (m.get(s.item.cat) ?? 0) + 1);
    return m;
  }, [suggestions]);

  const onListIds = plan.list;
  const add = (ids: string[]) => {
    const fresh = ids.filter((id) => !onListIds[id]);
    if (fresh.length) {
      api.update(plan.id, (p) => {
        const list = { ...p.list };
        for (const id of fresh) if (!list[id]) list[id] = { qty: null, have: 0, got: false };
        return { ...p, list };
      });
    }
    const dupes = ids.length - fresh.length;
    setNote(fresh.length
      ? `Added ${fresh.length} ${fresh.length === 1 ? "item" : "items"} to your list.${dupes ? ` ${dupes} ${dupes === 1 ? "was" : "were"} already on it.` : ""}`
      : "Those are already on your list.");
    setPicked(new Set());
  };
  const removeOne = (id: string) => {
    api.update(plan.id, (p) => {
      const list = { ...p.list };
      delete list[id];
      return { ...p, list };
    });
    setNote("Removed from your list.");
  };
  const togglePick = (id: string) => setPicked((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const shownNotOn = shown.filter((s) => !onListIds[s.item.id]).map((s) => s.item.id);

  return (
    <div>
      <div className={`${inset} mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-3`}>
        <p className="text-sm font-bold text-[#e8edf5]">{planSummary(plan)}</p>
        <button type="button" className={btnSmall} onClick={onSetup}>Change</button>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sugg-search" className={label}>Search</label>
          <input id="sugg-search" type="search" className={input} placeholder="Try “cups”, “batteries” or “tent”"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <label className={`flex items-center gap-2 ${muted}`}>
            <input type="checkbox" checked={wide} onChange={(e) => setWide(e.target.checked)} className="h-4 w-4" style={{ accentColor: "#34D399" }} />
            Search every item, not only this kind of plan
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sugg-cat" className={label}>Category</label>
            <select id="sugg-cat" className={input} value={cat} onChange={(e) => setCat(e.target.value as CategoryId | "all")}>
              <option value="all">All categories ({suggestions.length})</option>
              {categories.filter((c) => catCounts.has(c.id)).map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.title} ({catCounts.get(c.id)})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sugg-level" className={label}>Show</label>
            <select id="sugg-level" className={input} value={level} onChange={(e) => setLevel(e.target.value as Level)}>
              {(Object.keys(levelText) as Level[]).map((l) => <option key={l} value={l}>{levelText[l]}</option>)}
            </select>
          </div>
        </div>
      </div>

      <p className={`mb-4 ${muted}`}>
        Amounts are planning rules worked out from your numbers, not exact needs. Each item shows its math. Change any amount on your list.
      </p>

      {groups.length === 0 && (
        <div className={`${inset} p-5 text-center`}>
          <p className="text-sm font-bold">Nothing matches.</p>
          <p className={muted}>{wide ? "Try a shorter word." : "Try another word, or tick “Search every item”."}</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {groups.map(({ c, items }) => {
          const missing = items.filter((s) => !onListIds[s.item.id]).map((s) => s.item.id);
          return (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 id={`cat-${c.id}`} className="text-lg font-black"><span aria-hidden>{c.emoji} </span>{c.title} <span className="text-sm text-[#94a3b8]">({items.length})</span></h3>
                <button type="button" className={btnSmall} disabled={missing.length === 0} onClick={() => add(missing)}>
                  {missing.length === 0 ? "✓ All on list" : `Add ${missing.length === items.length ? "all" : "the other"} ${missing.length}`}
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {items.map((s) => (
                  <SuggestionRow key={s.item.id} s={s} on={!!onListIds[s.item.id]} picked={picked.has(s.item.id)}
                    onPick={() => togglePick(s.item.id)} onAdd={() => add([s.item.id])} onRemove={() => removeOne(s.item.id)} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-8"><GoodToKnow> “Shop” opens a product page when we have checked one, otherwise an Amazon search.</GoodToKnow></div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-[#26324c] bg-[#0b1220] px-4 py-3 sm:mx-0 sm:rounded-t-xl sm:border-x print:hidden">
        <div className="flex flex-col gap-2">
          <p className="min-h-5 text-xs font-bold text-[#e8edf5]" role="status" aria-live="polite">
            {note}{note && Object.keys(onListIds).length > 0 && (<> <button type="button" onClick={onList} className="underline pbr-accent">See list</button></>)}
          </p>
          <div className="flex gap-2">
            <button type="button" className={`${btn} flex-1`} disabled={picked.size === 0} onClick={() => add([...picked])}>
              Add ticked ({picked.size})
            </button>
            <button type="button" className={`${btnPrimary} flex-1`} disabled={shownNotOn.length === 0} onClick={() => add(shownNotOn)}>
              {shownNotOn.length === 0 ? "All shown are on list" : `Add all shown (${shownNotOn.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionRow({ s, on, picked, onPick, onAdd, onRemove }: {
  s: Suggestion; on: boolean; picked: boolean; onPick: () => void; onAdd: () => void; onRemove: () => void;
}) {
  const id = `pick-${s.item.id}`;
  return (
    <li className={`${inset} flex flex-col gap-2 p-3 ${on ? "border-[#34D399]" : ""}`}>
      <div className="flex items-start gap-3">
        {on ? (
          <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#34D399] text-xs font-black text-[#0b1220]">✓</span>
        ) : (
          <input id={id} type="checkbox" checked={picked} onChange={onPick} className="mt-1 h-5 w-5 shrink-0" style={{ accentColor: "#34D399" }}
            aria-label={`Tick ${s.item.name}`} />
        )}
        <div className="min-w-0 flex-1">
          <label htmlFor={on ? undefined : id} className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-[#e8edf5]">{s.item.name}</span>
            <PriorityTag pri={s.item.pri} />
            {on && <span className="text-xs font-black pbr-accent">On your list</span>}
          </label>
          <p className="mt-1 text-sm font-bold tabular-nums text-[#e8edf5]">
            About {s.qty.toLocaleString("en-US")} {unitWord(s.item, s.qty)}
            {s.packs !== null && s.item.pack! > 1 && <span className="text-[#94a3b8]"> · {s.packs} {s.packs === 1 ? "pack" : "packs"} of {s.item.pack}</span>}
          </p>
          <p className={muted}>{s.how}{s.item.source ? " · source amount" : " · our planning rule"}</p>
          {s.item.note && <p className={`mt-0.5 ${muted}`}>{s.item.note}</p>}
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <ShopButton item={s.item} />
        {on ? (
          <button type="button" className={btnSmall} onClick={onRemove} aria-label={`Remove ${s.item.name} from list`}>Remove</button>
        ) : (
          <button type="button" className={`${btnSmall} border-[#34D399]`} onClick={onAdd} aria-label={`Add ${s.item.name} to list`}>+ Add</button>
        )}
      </div>
    </li>
  );
}
