"use client";

// The shop: everything this plan needs as product cards, each with the amount
// to buy and a buy button. Search and filters reach the whole catalog.
// Categories open a few cards at a time so phones stay fast.

import { memo, useMemo, useState } from "react";
import { measure } from "../../lib/measure";
import { everything, matches, unitWord } from "../../lib/stockup/calc";
import { categories, occasionById, occasions } from "../../lib/stockup/catalog";
import type { CategoryId, Need, OccasionId, Plan, Priority, Suggestion } from "../../lib/stockup/types";
import QuickBar from "./QuickBar";
import ShopButton from "./ShopButton";
import type { PlansApi } from "./usePlans";
import { GoodToKnow, btnPrimary, btnSmall, input, inset, label, muted } from "./ui";

type Level = "essential" | "useful" | "all";
type Who = "all" | Need;
const levelText: Record<Level, string> = { essential: "Must-haves", useful: "Must-haves + good to have", all: "Everything" };
const whoText: Record<Who, string> = {
  all: "Everyone", kids: "Kids", babies: "Babies", pets: "Pets", older: "Older adults", mobility: "Mobility needs", medical: "Medical needs",
};
const allowed = (pri: Priority, level: Level) =>
  level === "all" || pri === "essential" || (level === "useful" && pri === "useful");
const rank: Record<Priority, number> = { essential: 0, useful: 1, extra: 2 };
const FIRST = 4;

export default function Suggestions({ plan, api, suggestions, onList }: {
  plan: Plan; api: PlansApi; suggestions: Suggestion[]; onList: () => void; onSetup: () => void;
}) {
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState<"plan" | "any" | OccasionId>("plan");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [level, setLevel] = useState<Level>("all");
  const [who, setWho] = useState<Who>("all");
  const [open, setOpen] = useState<Set<CategoryId>>(() => new Set());
  const [note, setNote] = useState("");

  const all = useMemo(() => everything(plan), [plan]);
  const searching = query.trim() !== "";
  // A search looks through the whole catalog; browsing shows this plan's picks.
  const pool = situation === "any" || (searching && situation === "plan") ? all
    : situation === "plan" ? suggestions : all.filter((s) => s.item.occ.includes(situation));
  const shown = useMemo(
    () => pool.filter((s) => s.item.kind === "product" && (cat === "all" || s.item.cat === cat)
      && allowed(s.item.pri, level) && (who === "all" || s.item.needs === who) && matches(s.item, query)),
    [pool, cat, level, who, query],
  );
  const tasks = useMemo(() => (situation === "plan" && !searching ? suggestions.filter((s) => s.item.kind === "task") : []), [situation, searching, suggestions]);
  const groups = useMemo(() => {
    const m = new Map<CategoryId, Suggestion[]>();
    for (const s of shown) m.set(s.item.cat, [...(m.get(s.item.cat) ?? []), s]);
    return categories.filter((c) => m.has(c.id))
      .map((c) => ({ c, items: m.get(c.id)!.sort((a, b) => rank[a.item.pri] - rank[b.item.pri]) }));
  }, [shown]);

  const onListIds = plan.list;
  const listCount = Object.keys(onListIds).length;
  const add = (ids: string[], scope: "one" | "category" | "all") => {
    const fresh = ids.filter((id) => !onListIds[id]);
    if (fresh.length) {
      measure("plan_add", `${scope}-${plan.occasion}`);
      api.update(plan.id, (p) => {
        const list = { ...p.list };
        for (const id of fresh) if (!list[id]) list[id] = { qty: null, have: 0, got: false };
        return { ...p, list };
      });
    }
    setNote(fresh.length ? `Saved ${fresh.length} to your list.` : "Already on your list.");
  };
  const removeOne = (id: string) => {
    api.update(plan.id, (p) => {
      const list = { ...p.list };
      delete list[id];
      return { ...p, list };
    });
    setNote("Removed from your list.");
  };
  const toggleOpen = (id: CategoryId) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const filtered = cat !== "all" || level !== "all" || who !== "all" || situation !== "plan";
  const reset = () => { setQuery(""); setSituation("plan"); setCat("all"); setLevel("all"); setWho("all"); };
  const shownNotOn = shown.filter((s) => !onListIds[s.item.id]).map((s) => s.item.id);

  return (
    <div>
      <QuickBar plan={plan} api={api} />

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="sugg-search" className="sr-only">Search every item</label>
        <input id="sugg-search" type="search" className={`${input} h-12`} placeholder="🔎 Search 950+ items: water, batteries, diapers…"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Jump to a category">
        <Chip on={cat === "all"} onClick={() => setCat("all")}>All</Chip>
        {categories.filter((c) => c.id !== "tasks" && suggestions.some((s) => s.item.cat === c.id)).map((c) => (
          <Chip key={c.id} on={cat === c.id} onClick={() => setCat(cat === c.id ? "all" : c.id)}>{c.emoji} {c.title}</Chip>
        ))}
      </div>

      <details className="mt-3" open={filtered || undefined}>
        <summary className="cursor-pointer text-sm font-black text-[#94a3b8]">More filters{filtered ? " (on)" : ""}</summary>
        <div className={`${inset} mt-2 grid gap-3 p-4 sm:grid-cols-3`}>
          <Select id="f-situation" text="For" value={situation} onChange={(v) => setSituation(v as typeof situation)}>
            <option value="plan">This list: {occasionById(plan.occasion).label}</option>
            <option value="any">Every situation</option>
            {occasions.filter((o) => o.id !== plan.occasion).map((o) => <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>)}
          </Select>
          <Select id="f-who" text="Who" value={who} onChange={(v) => setWho(v as Who)}>
            {(Object.keys(whoText) as Who[]).map((w) => <option key={w} value={w}>{whoText[w]}</option>)}
          </Select>
          <Select id="f-level" text="Show" value={level} onChange={(v) => setLevel(v as Level)}>
            {(Object.keys(levelText) as Level[]).map((l) => <option key={l} value={l}>{levelText[l]}</option>)}
          </Select>
          {(filtered || searching) && <button type="button" className={`${btnSmall} sm:col-span-3`} onClick={reset}>Clear search and filters</button>}
        </div>
      </details>

      <p className={`mb-5 mt-3 ${muted}`}>
        {shown.length} {shown.length === 1 ? "item" : "items"}{searching ? " match" : ""}. Amounts are worked out for {plan.people} {plan.people === 1 ? "person" : "people"}; change any of them on your list.
      </p>

      {groups.length === 0 && (
        <div className={`${inset} p-5 text-center`}>
          <p className="text-sm font-bold">Nothing matches.</p>
          <p className={muted}>Try a shorter word, or clear the filters.</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {groups.map(({ c, items }) => {
          const missing = items.filter((s) => !onListIds[s.item.id]).map((s) => s.item.id);
          const expanded = open.has(c.id) || searching || cat !== "all" || items.length <= FIRST + 2;
          const visible = expanded ? items : items.slice(0, FIRST);
          return (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 id={`cat-${c.id}`} className="text-lg font-black"><span aria-hidden>{c.emoji} </span>{c.title} <span className="text-sm text-[#94a3b8]">({items.length})</span></h3>
                <button type="button" className={btnSmall} disabled={missing.length === 0} onClick={() => add(missing, "category")}>
                  {missing.length === 0 ? "✓ All saved" : `Save all ${missing.length} to list`}
                </button>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {visible.map((s) => (
                  <Card key={s.item.id} s={s} on={!!onListIds[s.item.id]} onAdd={(id) => add([id], "one")} onRemove={removeOne} />
                ))}
              </ul>
              {items.length > FIRST + 2 && !searching && cat === "all" ? (
                <button type="button" className={`${btnSmall} mt-3 w-full`} aria-expanded={expanded} onClick={() => toggleOpen(c.id)}>
                  {expanded ? "Show fewer" : `See all ${items.length} ${c.title.toLowerCase()}`}
                </button>
              ) : null}
            </section>
          );
        })}
      </div>

      {tasks.length > 0 && (
        <details className={`${inset} mt-8 p-4`}>
          <summary className="cursor-pointer text-sm font-black">✅ Also worth doing ({tasks.length}), no shopping needed</summary>
          <ul className="mt-3 flex flex-col gap-2">
            {tasks.map((s) => {
              const on = !!onListIds[s.item.id];
              return (
                <li key={s.item.id} className="flex items-start justify-between gap-3 border-t border-[#26324c] pt-2">
                  <span className="min-w-0">
                    <span className="block text-sm font-black">{s.item.name}</span>
                    {s.item.note && <span className={`block ${muted}`}>{s.item.note}</span>}
                  </span>
                  <button type="button" className={btnSmall} onClick={() => (on ? removeOne(s.item.id) : add([s.item.id], "one"))}
                    aria-label={on ? `Remove ${s.item.name} from list` : `Add ${s.item.name} to list`}>{on ? "✓ On list" : "+ List"}</button>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      <div className="mt-8"><GoodToKnow> “Buy on Amazon” opens a product we checked; “Find on Amazon” opens search results. Each opens one item; there is no combined cart.</GoodToKnow></div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-[#26324c] bg-[#0b1220] px-4 py-3 sm:mx-0 sm:rounded-t-xl sm:border-x print:hidden">
        <p className="mb-2 min-h-4 text-xs font-bold text-[#e8edf5]" role="status" aria-live="polite">{note}</p>
        <div className="flex gap-2">
          <button type="button" className={`${btnSmall} flex-1`} disabled={shownNotOn.length === 0} onClick={() => add(shownNotOn, "all")}>
            {shownNotOn.length === 0 ? "All saved" : `Save all ${shownNotOn.length}`}
          </button>
          <button type="button" className={`${btnPrimary} flex-[2]`} onClick={onList} disabled={listCount === 0}>
            My list ({listCount}) · Buy →
          </button>
        </div>
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

function Select({ id, text, value, onChange, children }: {
  id: string; text: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={label}>{text}</label>
      <select id={id} className={input} value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </div>
  );
}

const Card = memo(function Card({ s, on, onAdd, onRemove }: {
  s: Suggestion; on: boolean; onAdd: (id: string) => void; onRemove: (id: string) => void;
}) {
  const varies = s.item.rule.per === "varies";
  return (
    <li className={`flex flex-col gap-3 rounded-2xl border bg-[#141d2e] p-4 ${on ? "border-[#34D399]" : "border-[#26324c]"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {s.item.pri === "essential" && <span className="rounded-md border border-[#34D399] px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider pbr-accent">Must-have</span>}
          {s.item.pro && <span className="rounded-md border border-[#26324c] px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider pbr-amber">Check with a pro</span>}
        </div>
        <h4 className="mt-1 text-base font-black leading-snug text-[#e8edf5]">{s.item.name}</h4>
        <p className="mt-1 text-sm font-bold tabular-nums text-[#e8edf5]">
          {varies ? "Amount varies" : <>Get about {s.qty.toLocaleString("en-US")} {unitWord(s.item, s.qty)}</>}
          {s.packs !== null && s.item.pack! > 1 && <span className="text-[#94a3b8]"> ({s.packs} × {s.item.pack}-pack)</span>}
        </p>
        <p className={muted}>{s.how}{s.item.source ? " · official amount" : ""}</p>
        {s.item.note && <p className={`mt-1 ${muted}`}>{s.item.note}</p>}
      </div>
      <div className="flex gap-2">
        <ShopButton item={s.item} big />
        {on ? (
          <button type="button" className={`${btnSmall} min-h-11 pbr-accent`} onClick={() => onRemove(s.item.id)} aria-label={`Remove ${s.item.name} from list`}>✓ Saved</button>
        ) : (
          <button type="button" className={`${btnSmall} min-h-11`} onClick={() => onAdd(s.item.id)} aria-label={`Save ${s.item.name} to list`}>+ List</button>
        )}
      </div>
    </li>
  );
});
