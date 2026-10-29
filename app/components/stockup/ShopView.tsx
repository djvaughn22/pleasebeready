"use client";

// The shopping run: what is left to buy, one Shop link each, tick it off as
// you go. There is no multi-item cart; this page says so plainly.

import { useMemo, useState } from "react";
import { toBuy, unitWord } from "../../lib/stockup/calc";
import { categories } from "../../lib/stockup/catalog";
import { encodePlan } from "../../lib/stockup/storage";
import { listText } from "../../lib/stockup/shop";
import type { Plan } from "../../lib/stockup/types";
import { listRows } from "./resolve";
import ShopButton from "./ShopButton";
import type { PlansApi } from "./usePlans";
import { GoodToKnow, btnPrimary, btnSmall, card, inset, muted } from "./ui";

export default function ShopView({ plan, api, onList }: { plan: Plan; api: PlansApi; onList: () => void }) {
  const rows = useMemo(() => listRows(plan), [plan]);
  const [msg, setMsg] = useState("");
  const [showDone, setShowDone] = useState(false);
  const left = rows.filter((r) => !r.line.got && toBuy(r.line, r.s) > 0);
  const done = rows.filter((r) => r.line.got || toBuy(r.line, r.s) === 0);
  const textRows = rows.map((r) => ({ s: r.s, qty: r.line.qty ?? r.s.qty, have: r.line.have, got: r.line.got }));

  const setGot = (id: string, got: boolean) =>
    api.update(plan.id, (p) => (p.list[id] ? { ...p, list: { ...p.list, [id]: { ...p.list[id], got } } } : p));

  const copy = async (text: string, ok: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(ok);
    } catch {
      setMsg("Copy did not work in this browser. Try Download instead.");
    }
  };
  const share = async () => {
    const url = `${window.location.origin}/planner#plan=${encodePlan(plan)}`;
    if (navigator.share) {
      try { await navigator.share({ title: plan.name, url }); setMsg("Shared."); return; } catch { /* fall back to copy */ }
    }
    copy(url, "Link copied. Whoever opens it gets their own copy of this plan.");
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
        <p className="text-base font-black">Nothing to shop for yet</p>
        <p className={`mt-1 ${muted}`}>Add items to your list first.</p>
        <button type="button" className={`${btnPrimary} mt-4`} onClick={onList}>Go to my list</button>
      </div>
    );
  }

  const groups = categories.map((c) => ({ c, rows: left.filter((r) => r.s.item.cat === c.id) })).filter((g) => g.rows.length);

  return (
    <>
    <div className="flex flex-col gap-6 print:hidden">
      <div className={`${card} flex flex-col gap-3 p-4`}>
        <p className="text-sm font-black">{left.length === 0 ? "Everything on your list is covered. 🎉" : `${left.length} ${left.length === 1 ? "item" : "items"} left to buy`}</p>
        <p className={muted}>
          Amazon does not let us fill a cart for you, so each Shop button opens one product page or search in a new tab.
          Tick items off as you get them, here or at any store.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSmall} onClick={() => copy(listText(plan, textRows), "List copied.")}>Copy list</button>
          <button type="button" className={btnSmall} onClick={share}>Share plan link</button>
          <button type="button" className={btnSmall} onClick={download}>Download .txt</button>
          <button type="button" className={btnSmall} onClick={() => window.print()}>Print</button>
        </div>
        <p className="min-h-5 text-xs font-bold pbr-accent" role="status" aria-live="polite">{msg}</p>
      </div>

      <GoodToKnow />

      {groups.map(({ c, rows }) => (
        <section key={c.id} aria-labelledby={`shop-${c.id}`}>
          <h3 id={`shop-${c.id}`} className="mb-2 text-lg font-black"><span aria-hidden>{c.emoji} </span>{c.title} <span className="text-sm text-[#94a3b8]">({rows.length})</span></h3>
          <ul className="flex flex-col gap-2">
            {rows.map(({ s, line }) => {
              const need = toBuy(line, s);
              return (
                <li key={s.item.id} className={`${inset} flex flex-wrap items-center justify-between gap-3 p-3`}>
                  <label className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <input type="checkbox" className="h-5 w-5 shrink-0" style={{ accentColor: "#34D399" }} checked={false} onChange={() => setGot(s.item.id, true)} aria-label={`Mark ${s.item.name} bought`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-black">{s.item.name}</span>
                      <span className={`block tabular-nums ${muted}`}>
                        {need.toLocaleString("en-US")} {unitWord(s.item, need)}
                        {s.item.pack && s.item.pack > 1 ? ` · ${Math.ceil(need / s.item.pack)} × ${s.item.pack}-pack` : ""}
                      </span>
                    </span>
                  </label>
                  <ShopButton item={s.item} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {done.length > 0 && (
        <section aria-labelledby="shop-done">
          <button type="button" id="shop-done" className={btnSmall} aria-expanded={showDone} onClick={() => setShowDone(!showDone)}>
            {showDone ? "Hide" : "Show"} covered items ({done.length})
          </button>
          {showDone && (
            <ul className="mt-2 flex flex-col gap-2">
              {done.map(({ s, line }) => (
                <li key={s.item.id} className={`${inset} flex items-center justify-between gap-3 p-3`}>
                  <span className="text-sm font-bold line-through decoration-2">{s.item.name}</span>
                  {line.got && <button type="button" className={btnSmall} onClick={() => setGot(s.item.id, false)}>Undo bought</button>}
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

/** Black-on-white list for printing; hidden on screen. */
function PrintList({ plan, rows }: { plan: Plan; rows: { s: { item: { id: string; name: string; unit: { one: string; many: string } } }; qty: number; have: number; got: boolean }[] }) {
  return (
    <div className="hidden print:block">
      <h2 className="text-xl font-black">{plan.name}</h2>
      <ul className="mt-2">
        {rows.map((r) => {
          const need = Math.max(0, r.qty - r.have);
          return <li key={r.s.item.id} className="py-0.5 text-sm">☐ {r.s.item.name}: {need} {need === 1 ? r.s.item.unit.one : r.s.item.unit.many}{r.got ? " (bought)" : ""}</li>;
        })}
      </ul>
      <p className="mt-3 text-xs">Amounts are planning estimates. pleasebeready.com/planner</p>
    </div>
  );
}
