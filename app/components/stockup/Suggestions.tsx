"use client";

// Suggestions for the plan, by category, with filters that scale to the whole
// catalog. Categories start short (essentials first) and expand on request, so
// a phone never renders a thousand rows at once. Adding twice never duplicates.

import { memo, useMemo, useState } from "react";
import { everything, matches, planSummary, unitWord } from "../../lib/stockup/calc";
import { categories, occasionById, occasions } from "../../lib/stockup/catalog";
import type { CategoryId, Need, OccasionId, Plan, Priority, Suggestion } from "../../lib/stockup/types";
import ShopButton from "./ShopButton";
import type { PlansApi } from "./usePlans";
import { GoodToKnow, PriorityTag, btn, btnPrimary, btnSmall, input, inset, label, muted } from "./ui";

type Level = "essential" | "useful" | "all";
type Kind = "all" | "product" | "task";
type Who = "all" | Need;
const levelText: Record<Level, string> = { essential: "Essentials", useful: "Essentials + useful", all: "Everything" };
const whoText: Record<Who, string> = {
  all: "Everyone", kids: "Kids", babies: "Babies", pets: "Pets", older: "Older adults", mobility: "Mobility needs", medical: "Medical needs",
};
const allowed = (pri: Priority, level: Level) =>
  level === "all" || pri === "essential" || (level === "useful" && pri === "useful");
const rank: Record<Priority, number> = { essential: 0, useful: 1, extra: 2 };
const FIRST = 5;

export default function Suggestions({ plan, api, suggestions, onList, onSetup }: {
  plan: Plan; api: PlansApi; suggestions: Suggestion[]; onList: () => void; onSetup: () => void;
}) {
  const [query, setQuery] = useState("");
  const [situation, setSituation] = useState<"plan" | "any" | OccasionId>("plan");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [level, setLevel] = useState<Level>("all");
  const [kind, setKind] = useState<Kind>("all");
  const [who, setWho] = useState<Who>("all");
  const [open, setOpen] = useState<Set<CategoryId>>(() => new Set());
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [note, setNote] = useState("");

  const all = useMemo(() => everything(plan), [plan]);
  const pool = situation === "plan" ? suggestions : situation === "any" ? all : all.filter((s) => s.item.occ.includes(situation));
  const shown = useMemo(
    () => pool.filter((s) =>
      (cat === "all" || s.item.cat === cat) && allowed(s.item.pri, level) && (kind === "all" || s.item.kind === kind)
      && (who === "all" || s.item.needs === who) && matches(s.item, query)),
    [pool, cat, level, kind, who, query],
  );
  const groups = useMemo(() => {
    const m = new Map<CategoryId, Suggestion[]>();
    for (const s of shown) m.set(s.item.cat, [...(m.get(s.item.cat) ?? []), s]);
    return categories.filter((c) => m.has(c.id))
      .map((c) => ({ c, items: m.get(c.id)!.sort((a, b) => rank[a.item.pri] - rank[b.item.pri]) }));
  }, [shown]);

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
  const toggleOpen = (id: CategoryId) => setOpen((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const filtered = query.trim() !== "" || cat !== "all" || level !== "all" || kind !== "all" || who !== "all" || situation !== "plan";
  const reset = () => { setQuery(""); setSituation("plan"); setCat("all"); setLevel("all"); setKind("all"); setWho("all"); };

  const shownNotOn = shown.filter((s) => !onListIds[s.item.id]).map((s) => s.item.id);
  const plain = occasionById(plan.occasion);

  return (
    <div>
      <div className={`${inset} mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-3`}>
        <p className="text-sm font-bold text-[#e8edf5]">{planSummary(plan)}</p>
        <button type="button" className={btnSmall} onClick={onSetup}>Change</button>
      </div>

      <div className="mb-3 flex flex-col gap-1.5">
        <label htmlFor="sugg-search" className={label}>Search {situation === "any" ? "all items" : ""}</label>
        <input id="sugg-search" type="search" className={input} placeholder="Try “cups”, “batteries”, “smoke” or “dorm”"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <details className={`${inset} mb-4 px-4 py-3`} open={filtered || undefined}>
        <summary className="cursor-pointer text-sm font-black">Filters{filtered ? " (on)" : ""}</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select id="f-situation" text="Situation" value={situation} onChange={(v) => setSituation(v as typeof situation)}>
            <option value="plan">This plan: {plain.label} ({suggestions.length})</option>
            <option value="any">Every situation ({all.length})</option>
            {occasions.filter((o) => o.id !== plan.occasion).map((o) => <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>)}
          </Select>
          <Select id="f-cat" text="Category" value={cat} onChange={(v) => setCat(v as CategoryId | "all")}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
          </Select>
          <Select id="f-who" text="Person or need" value={who} onChange={(v) => setWho(v as Who)}>
            {(Object.keys(whoText) as Who[]).map((w) => <option key={w} value={w}>{w === "all" ? "Everyone (no filter)" : whoText[w]}</option>)}
          </Select>
          <Select id="f-level" text="Priority" value={level} onChange={(v) => setLevel(v as Level)}>
            {(Object.keys(levelText) as Level[]).map((l) => <option key={l} value={l}>{levelText[l]}</option>)}
          </Select>
          <Select id="f-kind" text="Type" value={kind} onChange={(v) => setKind(v as Kind)}>
            <option value="all">Things to buy and things to do</option>
            <option value="product">Things to buy</option>
            <option value="task">Things to do</option>
          </Select>
          {filtered && <button type="button" className={`${btnSmall} self-end`} onClick={reset}>Clear filters</button>}
        </div>
      </details>

      <p className={`mb-4 ${muted}`}>
        {shown.length} {shown.length === 1 ? "match" : "matches"}. Amounts are planning rules worked out from your numbers, not exact needs; each item shows its math.
        Items marked “Ask a professional” need a doctor’s, vet’s or official advice.
      </p>

      {groups.length === 0 && (
        <div className={`${inset} p-5 text-center`}>
          <p className="text-sm font-bold">Nothing matches.</p>
          <p className={muted}>{situation === "plan" ? "Try another word, or set Situation to “Every situation”." : "Try a shorter word or clear the filters."}</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {groups.map(({ c, items }) => {
          const missing = items.filter((s) => !onListIds[s.item.id]).map((s) => s.item.id);
          const expanded = open.has(c.id) || query.trim() !== "" || items.length <= FIRST + 2;
          const visible = expanded ? items : items.slice(0, FIRST);
          return (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 id={`cat-${c.id}`} className="text-lg font-black"><span aria-hidden>{c.emoji} </span>{c.title} <span className="text-sm text-[#94a3b8]">({items.length})</span></h3>
                <button type="button" className={btnSmall} disabled={missing.length === 0} onClick={() => add(missing)}>
                  {missing.length === 0 ? "✓ All on list" : `Add ${missing.length === items.length ? "all" : "the other"} ${missing.length}`}
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {visible.map((s) => (
                  <SuggestionRow key={s.item.id} s={s} on={!!onListIds[s.item.id]} picked={picked.has(s.item.id)}
                    onPick={togglePick} onAdd={add} onRemove={removeOne} />
                ))}
              </ul>
              {items.length > FIRST + 2 && !query.trim() ? (
                <button type="button" className={`${btnSmall} mt-2 w-full`} aria-expanded={expanded} onClick={() => toggleOpen(c.id)}>
                  {expanded ? "Show fewer" : `Show all ${items.length} in ${c.title}`}
                </button>
              ) : null}
            </section>
          );
        })}
      </div>

      <div className="mt-8"><GoodToKnow> “Shop” opens a product page we have checked; “Search” opens Amazon search results, not one chosen product. There is no multi-item cart.</GoodToKnow></div>

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
              {shownNotOn.length === 0 ? "All matches on list" : `Add all matches (${shownNotOn.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
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

const SuggestionRow = memo(function SuggestionRow({ s, on, picked, onPick, onAdd, onRemove }: {
  s: Suggestion; on: boolean; picked: boolean;
  onPick: (id: string) => void; onAdd: (ids: string[]) => void; onRemove: (id: string) => void;
}) {
  const id = `pick-${s.item.id}`;
  const task = s.item.kind === "task";
  return (
    <li className={`${inset} flex flex-col gap-2 p-3 ${on ? "border-[#34D399]" : ""}`}>
      <div className="flex items-start gap-3">
        {on ? (
          <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#34D399] text-xs font-black text-[#0b1220]">✓</span>
        ) : (
          <input id={id} type="checkbox" checked={picked} onChange={() => onPick(s.item.id)} className="mt-1 h-5 w-5 shrink-0" style={{ accentColor: "#34D399" }}
            aria-label={`Tick ${s.item.name}`} />
        )}
        <div className="min-w-0 flex-1">
          <label htmlFor={on ? undefined : id} className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-[#e8edf5]">{s.item.name}</span>
            {task ? <span className="rounded-md border border-[#26324c] px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider pbr-blue">To do</span> : <PriorityTag pri={s.item.pri} />}
            {s.item.pro && <span className="rounded-md border border-[#26324c] px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider pbr-amber">Ask a professional</span>}
            {on && <span className="text-xs font-black pbr-accent">On your list</span>}
          </label>
          {task ? (
            <p className={`mt-1 ${muted}`}>{s.item.pri === "essential" ? "Worth doing first." : "When you have time."}</p>
          ) : (
            <>
              <p className="mt-1 text-sm font-bold tabular-nums text-[#e8edf5]">
                {s.item.rule.per === "varies" ? "Amount varies" : <>About {s.qty.toLocaleString("en-US")} {unitWord(s.item, s.qty)}</>}
                {s.packs !== null && s.item.pack! > 1 && <span className="text-[#94a3b8]"> · {s.packs} {s.packs === 1 ? "pack" : "packs"} of {s.item.pack}</span>}
              </p>
              <p className={muted}>{s.how}{s.item.source ? " · source amount" : s.item.rule.per === "varies" ? "" : " · our planning rule"}</p>
            </>
          )}
          {s.item.note && <p className={`mt-0.5 ${muted}`}>{s.item.note}</p>}
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <ShopButton item={s.item} />
        {on ? (
          <button type="button" className={btnSmall} onClick={() => onRemove(s.item.id)} aria-label={`Remove ${s.item.name} from list`}>Remove</button>
        ) : (
          <button type="button" className={`${btnSmall} border-[#34D399]`} onClick={() => onAdd([s.item.id])} aria-label={`Add ${s.item.name} to list`}>+ Add</button>
        )}
      </div>
    </li>
  );
});
