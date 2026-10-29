"use client";

// My list: everything saved for this plan, ready to buy. Change amounts, open
// each item on Amazon, tick it when bought, and share or print the list.

import { useMemo, useState } from "react";
import { durationLabel, isDone, lineQty, toBuy, unitWord } from "../../lib/stockup/calc";
import { categories } from "../../lib/stockup/catalog";
import { listText } from "../../lib/stockup/shop";
import { encodePlan } from "../../lib/stockup/storage";
import type { Line, Plan, Suggestion } from "../../lib/stockup/types";
import { listRows, type Row } from "./resolve";
import ShopButton from "./ShopButton";
import type { PlansApi } from "./usePlans";
import { GoodToKnow, Stepper, btnPrimary, btnSmall, card, inset, muted } from "./ui";

export default function ListView({ plan, api, onIdeas }: { plan: Plan; api: PlansApi; onIdeas: () => void }) {
  const rows = useMemo(() => listRows(plan), [plan]);
  const [msg, setMsg] = useState("");
  const [showDone, setShowDone] = useState(false);
  const setLine = (id: string, patch: Partial<Line>) =>
    api.update(plan.id, (p) => (p.list[id] ? { ...p, list: { ...p.list, [id]: { ...p.list[id], ...patch } } } : p));
  const remove = (id: string) => api.update(plan.id, (p) => {
    const list = { ...p.list };
    delete list[id];
    return { ...p, list };
  });

  const textRows = rows.map((r) => ({ s: r.s, qty: lineQty(r.line, r.s), have: r.line.have, got: r.line.got }));
  const copy = async (text: string, ok: string) => {
    try { await navigator.clipboard.writeText(text); setMsg(ok); } catch { setMsg("Copy didn't work in this browser. Try Download."); }
  };
  const share = async () => {
    const url = `${window.location.origin}/planner#plan=${encodePlan(plan)}`;
    const text = `${plan.name}: my stock-up list for ${plan.people} ${plan.people === 1 ? "person" : "people"}, ${durationLabel(plan.days)}.`;
    if (navigator.share) {
      try { await navigator.share({ title: plan.name, text, url }); setMsg("Shared."); return; } catch { /* fall back to copy */ }
    }
    copy(`${text} ${url}`, "Link copied. Whoever opens it gets their own copy to shop from.");
  };
  const download = () => {
    const blob = new Blob([listText(plan, textRows)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan.name.replace(/[^\w -]+/g, "").trim() || "stock-up-list"}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("Downloaded.");
  };

  if (rows.length === 0) {
    return (
      <div className={`${card} p-6 text-center`}>
        <p className="text-base font-black">Nothing saved yet</p>
        <p className={`mt-1 ${muted}`}>Tap “+ List” on anything in the shop, or “Save all” for a whole category.</p>
        <button type="button" className={`${btnPrimary} mt-4`} onClick={onIdeas}>Go to the shop</button>
      </div>
    );
  }

  const products = rows.filter((r) => r.s.item.kind === "product");
  const left = products.filter((r) => !isDone(r.line, r.s));
  const done = products.filter((r) => isDone(r.line, r.s));
  const tasks = rows.filter((r) => r.s.item.kind === "task");
  const groups = categories.map((c) => ({ c, rows: left.filter((r) => r.s.item.cat === c.id) })).filter((g) => g.rows.length);

  return (
    <>
      <div className="flex flex-col gap-6 print:hidden">
        <div className={`${card} flex flex-col gap-3 p-4`}>
          <div aria-live="polite">
            <p className="text-lg font-black">
              {left.length === 0 ? "Everything is bought. 🎉" : `${left.length} to buy`}
              <span className="text-sm text-[#94a3b8]"> · {done.length} of {products.length} bought</span>
            </p>
            {products.length > 0 && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#0c1220]" aria-hidden>
                <div className="h-full bg-[#34D399]" style={{ width: `${Math.round((done.length / products.length) * 100)}%` }} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={share}>Share this list</button>
            <button type="button" className={btnSmall} onClick={() => copy(listText(plan, textRows), "List copied.")}>Copy</button>
            <button type="button" className={btnSmall} onClick={download}>Download</button>
            <button type="button" className={btnSmall} onClick={() => window.print()}>Print</button>
            <button type="button" className={btnSmall} onClick={onIdeas}>+ Add more</button>
          </div>
          <p className="min-h-4 text-xs font-bold pbr-accent" role="status" aria-live="polite">{msg}</p>
        </div>

        <GoodToKnow> Each button opens one item on Amazon in a new tab; there is no combined cart. Tick items off as you buy them, here or at any store.</GoodToKnow>

        {groups.map(({ c, rows }) => (
          <section key={c.id} aria-labelledby={`list-${c.id}`}>
            <h3 id={`list-${c.id}`} className="mb-2 text-lg font-black"><span aria-hidden>{c.emoji} </span>{c.title} <span className="text-sm text-[#94a3b8]">({rows.length})</span></h3>
            <ul className="flex flex-col gap-2">
              {rows.map((r) => <BuyRow key={r.s.item.id} r={r} setLine={setLine} remove={remove} />)}
            </ul>
          </section>
        ))}

        {tasks.length > 0 && (
          <section aria-labelledby="list-tasks">
            <h3 id="list-tasks" className="mb-2 text-lg font-black">✅ To do</h3>
            <ul className="flex flex-col gap-2">
              {tasks.map(({ s, line }) => (
                <li key={s.item.id} className={`${inset} flex items-start justify-between gap-3 p-3`}>
                  <label className="flex min-h-10 min-w-0 cursor-pointer items-start gap-3">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" style={{ accentColor: "#34D399" }} checked={line.got} onChange={(e) => setLine(s.item.id, { got: e.target.checked })} />
                    <span className={`text-sm font-black ${line.got ? "line-through decoration-2 opacity-75" : ""}`}>{s.item.name}</span>
                  </label>
                  <button type="button" className={btnSmall} onClick={() => remove(s.item.id)} aria-label={`Remove ${s.item.name}`}>✕</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {done.length > 0 && (
          <section aria-labelledby="list-done">
            <button type="button" id="list-done" className={btnSmall} aria-expanded={showDone} onClick={() => setShowDone(!showDone)}>
              {showDone ? "Hide" : "Show"} bought ({done.length})
            </button>
            {showDone && (
              <ul className="mt-2 flex flex-col gap-2">
                {done.map(({ s }) => (
                  <li key={s.item.id} className={`${inset} flex items-center justify-between gap-3 p-3`}>
                    <span className="text-sm font-bold line-through decoration-2">{s.item.name}</span>
                    <button type="button" className={btnSmall} onClick={() => setLine(s.item.id, { got: false, have: 0 })}>Undo</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
      <PrintList plan={plan} rows={textRows} />
    </>
  );
}

function BuyRow({ r, setLine, remove }: { r: Row; setLine: (id: string, patch: Partial<Line>) => void; remove: (id: string) => void }) {
  const { s, line } = r;
  const id = s.item.id;
  const qty = lineQty(line, s);
  const need = toBuy(line, s);
  const own = line.qty !== null && line.qty !== s.qty;
  return (
    <li className={`${inset} flex flex-col gap-3 p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-[#e8edf5]">{s.item.name}</p>
          <p className={muted}>
            {own ? <>Suggested {s.qty.toLocaleString("en-US")}. <button type="button" className="font-black underline pbr-accent" onClick={() => setLine(id, { qty: null })}>Reset</button></> : s.how}
            {line.have > 0 && <> · you have {line.have} <button type="button" className="font-black underline pbr-accent" onClick={() => setLine(id, { have: 0 })}>clear</button></>}
          </p>
        </div>
        <button type="button" className={btnSmall} onClick={() => remove(id)} aria-label={`Remove ${s.item.name}`}>✕</button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Stepper compact sr={s.item.name} id={`qty-${id}`} text={`Amount (${s.item.unit.many})`} value={qty} min={0} max={99999} onChange={(n) => setLine(id, { qty: n })} />
        {s.item.pack && s.item.pack > 1 && need > 0 && <p className={`${muted} self-center`}>{Math.ceil(need / s.item.pack)} × {s.item.pack}-pack</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ShopButton item={s.item} big />
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#26324c] px-3 text-sm font-black">
          <input type="checkbox" className="h-5 w-5" style={{ accentColor: "#34D399" }} checked={line.got} onChange={(e) => setLine(id, { got: e.target.checked })} />
          Bought<span className="sr-only">: {s.item.name}</span>
        </label>
      </div>
      {need === 0 && !line.got && <p className={muted}>Amount is 0, so there is nothing to buy.</p>}
      <span className="sr-only">{need} {unitWord(s.item, need)} to buy</span>
    </li>
  );
}

/** Black-on-white list for printing; hidden on screen. */
function PrintList({ plan, rows }: { plan: Plan; rows: { s: Suggestion; qty: number; have: number; got: boolean }[] }) {
  return (
    <div className="hidden print:block">
      <h2 className="text-xl font-black">{plan.name}</h2>
      <ul className="mt-2">
        {rows.map((r) => {
          const need = Math.max(0, r.qty - r.have);
          if (r.s.item.kind === "task") return <li key={r.s.item.id} className="py-0.5 text-sm">{r.got ? "☑" : "☐"} To do: {r.s.item.name}</li>;
          return <li key={r.s.item.id} className="py-0.5 text-sm">☐ {r.s.item.name}: {need} {need === 1 ? r.s.item.unit.one : r.s.item.unit.many}{r.got ? " (bought)" : ""}</li>;
        })}
      </ul>
      <p className="mt-3 text-xs">Amounts are planning estimates. pleasebeready.com/planner</p>
    </div>
  );
}
