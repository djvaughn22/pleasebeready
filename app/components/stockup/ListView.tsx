"use client";

// The stock-up list: change any amount, note what you already have, mark
// what you bought. Suggested amounts stay visible next to your own.

import { useMemo } from "react";
import { isDone, lineQty, toBuy, unitWord } from "../../lib/stockup/calc";
import { categories } from "../../lib/stockup/catalog";
import type { Line, Plan } from "../../lib/stockup/types";
import { listRows, type Row } from "./resolve";
import ShopButton from "./ShopButton";
import type { PlansApi } from "./usePlans";
import { Stepper, btnPrimary, btnSmall, card, inset, muted } from "./ui";

export default function ListView({ plan, api, onIdeas, onShop }: {
  plan: Plan; api: PlansApi; onIdeas: () => void; onShop: () => void;
}) {
  const rows = useMemo(() => listRows(plan), [plan]);
  const setLine = (id: string, patch: Partial<Line>) =>
    api.update(plan.id, (p) => (p.list[id] ? { ...p, list: { ...p.list, [id]: { ...p.list[id], ...patch } } } : p));
  const remove = (id: string) => api.update(plan.id, (p) => {
    const list = { ...p.list };
    delete list[id];
    return { ...p, list };
  });

  if (rows.length === 0) {
    return (
      <div className={`${card} p-6 text-center`}>
        <p className="text-base font-black">Your list is empty</p>
        <p className={`mt-1 ${muted}`}>Add items from the suggestions: one at a time, a whole category, or everything at once.</p>
        <button type="button" className={`${btnPrimary} mt-4`} onClick={onIdeas}>See suggestions</button>
      </div>
    );
  }

  const left = rows.filter((r) => r.s.item.kind === "product" && !isDone(r.line, r.s)).length;
  const todo = rows.filter((r) => r.s.item.kind === "task" && !r.line.got).length;
  const done = rows.filter((r) => isDone(r.line, r.s)).length;
  const groups = categories.map((c) => ({ c, rows: rows.filter((r) => r.s.item.cat === c.id) })).filter((g) => g.rows.length);

  return (
    <div className="flex flex-col gap-6">
      <div className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`} aria-live="polite">
        <p className="text-sm font-black">
          {rows.length} {rows.length === 1 ? "item" : "items"} · {left} left to buy{todo ? ` · ${todo} to do` : ""} · {done} done
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSmall} onClick={onIdeas}>+ Add more</button>
          <button type="button" className={btnPrimary} onClick={onShop} disabled={left === 0}>Shop the list →</button>
        </div>
      </div>

      {groups.map(({ c, rows }) => (
        <section key={c.id} aria-labelledby={`list-${c.id}`}>
          <h3 id={`list-${c.id}`} className="mb-2 text-lg font-black"><span aria-hidden>{c.emoji} </span>{c.title}</h3>
          <ul className="flex flex-col gap-2">
            {rows.map((r) => <ListRow key={r.s.item.id} r={r} setLine={setLine} remove={remove} />)}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ListRow({ r, setLine, remove }: {
  r: Row; setLine: (id: string, patch: Partial<Line>) => void; remove: (id: string) => void;
}) {
  const { s, line } = r;
  const id = s.item.id;
  const qty = lineQty(line, s);
  const need = toBuy(line, s);
  const own = line.qty !== null && line.qty !== s.qty;
  const covered = isDone(line, s);

  if (s.item.kind === "task") {
    return (
      <li className={`${inset} flex items-start justify-between gap-3 p-3 ${covered ? "opacity-75" : ""}`}>
        <label className="flex min-h-10 min-w-0 cursor-pointer items-start gap-3">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" style={{ accentColor: "#34D399" }} checked={line.got} onChange={(e) => setLine(id, { got: e.target.checked })} />
          <span className="min-w-0">
            <span className={`block text-sm font-black ${covered ? "line-through decoration-2" : ""}`}>{s.item.name}<span className="sr-only">{line.got ? ", done" : ", to do"}</span></span>
            {s.item.note && <span className={`block ${muted}`}>{s.item.note}</span>}
          </span>
        </label>
        <button type="button" className={btnSmall} onClick={() => remove(id)} aria-label={`Remove ${s.item.name}`}>Remove</button>
      </li>
    );
  }

  return (
    <li className={`${inset} flex flex-col gap-3 p-3 ${covered ? "opacity-75" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-black text-[#e8edf5] ${covered ? "line-through decoration-2" : ""}`}>{s.item.name}</p>
          <p className={muted}>
            {own ? <>Your amount. Suggested {s.qty.toLocaleString("en-US")} ({s.how}). </> : <>Suggested: {s.how}. </>}
            {own && <button type="button" className="font-black underline pbr-accent" onClick={() => setLine(id, { qty: null })}>Use suggestion</button>}
          </p>
        </div>
        <button type="button" className={btnSmall} onClick={() => remove(id)} aria-label={`Remove ${s.item.name}`}>Remove</button>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <Stepper compact sr={s.item.name} id={`qty-${id}`} text={`Need (${s.item.unit.many})`} value={qty} min={0} max={99999} onChange={(n) => setLine(id, { qty: n })} />
        <Stepper compact sr={s.item.name} id={`have-${id}`} text="Already have" value={line.have} min={0} max={99999} onChange={(n) => setLine(id, { have: n })} />
        <div className="min-w-[7rem]">
          <p className={muted}>To buy</p>
          <p className="text-lg font-black tabular-nums">{need.toLocaleString("en-US")} <span className="text-sm">{unitWord(s.item, need)}</span></p>
          {s.item.pack && s.item.pack > 1 && need > 0 && <p className={muted}>{Math.ceil(need / s.item.pack)} × {s.item.pack}-pack</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-bold">
          <input type="checkbox" className="h-5 w-5" style={{ accentColor: "#34D399" }} checked={line.got} onChange={(e) => setLine(id, { got: e.target.checked })} />
          Bought<span className="sr-only">: {s.item.name}</span>
        </label>
        {!covered && <ShopButton item={s.item} />}
      </div>
    </li>
  );
}
