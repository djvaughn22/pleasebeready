"use client";

// My list: everything saved, ready to buy. Change amounts, open each item on
// Amazon, tick it when bought, mark it ready once it's put away, flag it for a
// restock when it runs out, add notes, and share or print the list.
// Ticking "Bought" is the visitor's own mark: a click on an Amazon link never
// counts as a purchase.

import { useMemo, useState } from "react";
import { measure } from "../../lib/measure";
import { durationLabel, isDone, lineQty, toBuy, unitWord } from "../../lib/stockup/calc";
import { categories } from "../../lib/stockup/catalog";
import { listText, statusText, type TextRow } from "../../lib/stockup/shop";
import { LIST_NOTE_MAX, NOTE_MAX, encodePlan } from "../../lib/stockup/storage";
import type { Line, Plan } from "../../lib/stockup/types";
import { listRows, type Row } from "./resolve";
import ShopButton from "./ShopButton";
import type { PlansApi } from "./usePlans";
import { GoodToKnow, Stepper, btnPrimary, btnSmall, card, inset, input, muted } from "./ui";

type SetLine = (id: string, patch: Partial<Line>) => void;

export default function ListView({ plan, api, onIdeas }: { plan: Plan; api: PlansApi; onIdeas: () => void }) {
  const rows = useMemo(() => listRows(plan), [plan]);
  const [msg, setMsg] = useState("");
  const [showReady, setShowReady] = useState(false);
  const setLine: SetLine = (id, patch) =>
    api.update(plan.id, (p) => (p.list[id] ? { ...p, list: { ...p.list, [id]: { ...p.list[id], ...patch } } } : p));
  const remove = (id: string) => api.update(plan.id, (p) => {
    const list = { ...p.list };
    delete list[id];
    return { ...p, list };
  });

  const textRows: TextRow[] = rows.map((r) => ({ s: r.s, qty: lineQty(r.line, r.s), have: r.line.have, got: r.line.got, ready: r.line.ready, restock: r.line.restock, note: r.line.note }));
  const copy = async (text: string, ok: string) => {
    try { await navigator.clipboard.writeText(text); setMsg(ok); } catch { setMsg("Copy didn't work in this browser. Try Download."); }
  };
  const share = async () => {
    measure("list_share", plan.occasion);
    const url = `${window.location.origin}/lists#plan=${encodePlan(plan)}`;
    const text = `${plan.name}: my list for ${plan.people} ${plan.people === 1 ? "person" : "people"}, ${durationLabel(plan.days)}.`;
    if (navigator.share) {
      try { await navigator.share({ title: plan.name, text, url }); setMsg("Shared."); return; } catch { /* fall back to copy */ }
    }
    copy(`${text} ${url}`, "Link copied. Whoever opens it gets their own copy to shop from.");
  };
  const download = () => {
    const blob = new Blob([listText(plan, textRows)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${plan.name.replace(/[^\w -]+/g, "").trim() || "ready-list"}.txt`;
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
  const ready = products.filter((r) => r.line.ready);
  const bought = products.filter((r) => !r.line.ready && isDone(r.line, r.s));
  const left = products.filter((r) => !r.line.ready && !isDone(r.line, r.s));
  const tasks = rows.filter((r) => r.s.item.kind === "task");
  const groups = categories.map((c) => ({ c, rows: left.filter((r) => r.s.item.cat === c.id) })).filter((g) => g.rows.length);
  const restocks = left.filter((r) => r.line.restock).length;
  const doneShare = products.length ? Math.round(((ready.length + bought.length) / products.length) * 100) : 0;

  return (
    <>
      <div className="flex flex-col gap-6 print:hidden">
        <div className={`${card} flex flex-col gap-3 p-4`}>
          <div aria-live="polite">
            <p className="text-lg font-black">
              {left.length === 0 ? "Everything is bought. 🎉" : `${left.length} to buy`}
              <span className="text-sm text-[#94a3b8]"> · {bought.length} bought · {ready.length} ready{restocks ? ` · ${restocks} to restock` : ""}</span>
            </p>
            {products.length > 0 && (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#0c1220]" aria-hidden>
                <div className="h-full bg-[#34D399]" style={{ width: `${doneShare}%` }} />
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
          <details open={!!plan.note || undefined}>
            <summary className="cursor-pointer text-sm font-black text-[#94a3b8]">📝 Notes for this list{plan.note ? "" : " (optional)"}</summary>
            <label htmlFor="list-note" className="sr-only">Notes for this list</label>
            <textarea id="list-note" rows={3} maxLength={LIST_NOTE_MAX} defaultValue={plan.note ?? ""}
              placeholder="Where things are kept, who is buying what, sizes…"
              onBlur={(e) => { const v = e.target.value.trim(); if (v !== (plan.note ?? "")) api.update(plan.id, (p) => ({ ...p, note: v || undefined })); }}
              className={`${input} mt-2 h-auto w-full py-2 text-sm`} />
          </details>
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
                <li key={s.item.id} className={`${inset} flex flex-col gap-2 p-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex min-h-10 min-w-0 cursor-pointer items-start gap-3">
                      <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0" style={{ accentColor: "#34D399" }} checked={line.got} onChange={(e) => setLine(s.item.id, { got: e.target.checked })} />
                      <span className={`text-sm font-black ${line.got ? "line-through decoration-2 opacity-75" : ""}`}>{s.item.name}</span>
                    </label>
                    <button type="button" className={btnSmall} onClick={() => remove(s.item.id)} aria-label={`Remove ${s.item.name}`}>✕</button>
                  </div>
                  <NoteField id={s.item.id} name={s.item.name} line={line} setLine={setLine} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {bought.length > 0 && (
          <section aria-labelledby="list-bought">
            <h3 id="list-bought" className="mb-1 text-lg font-black">🛍️ Bought, not put away yet <span className="text-sm text-[#94a3b8]">({bought.length})</span></h3>
            <p className={`mb-2 ${muted}`}>Mark each one ready once it’s in the kit, the pantry or the car.</p>
            <ul className="flex flex-col gap-2">
              {bought.map((r) => (
                <DoneRow key={r.s.item.id} r={r} setLine={setLine} remove={remove}>
                  <button type="button" className={`${btnSmall} pbr-accent`} onClick={() => setLine(r.s.item.id, { ready: true, got: true, restock: undefined })}>✓ Mark ready</button>
                  <button type="button" className={btnSmall} onClick={() => setLine(r.s.item.id, { got: false, have: 0 })}>Undo</button>
                </DoneRow>
              ))}
            </ul>
          </section>
        )}

        {ready.length > 0 && (
          <section aria-labelledby="list-ready">
            <button type="button" id="list-ready" className={btnSmall} aria-expanded={showReady} onClick={() => setShowReady(!showReady)}>
              {showReady ? "Hide" : "Show"} ready ({ready.length})
            </button>
            {showReady && (
              <ul className="mt-2 flex flex-col gap-2">
                {ready.map((r) => (
                  <DoneRow key={r.s.item.id} r={r} setLine={setLine} remove={remove} isReady>
                    <button type="button" className={`${btnSmall} pbr-amber`} onClick={() => setLine(r.s.item.id, { restock: true, got: false, ready: undefined, have: 0 })}>Used up: restock</button>
                    <button type="button" className={btnSmall} onClick={() => setLine(r.s.item.id, { ready: undefined })}>Undo</button>
                  </DoneRow>
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

function NoteField({ id, name, line, setLine }: { id: string; name: string; line: Line; setLine: SetLine }) {
  const [open, setOpen] = useState(false);
  if (!open && !line.note) {
    return <button type="button" className="self-start text-xs font-black text-[#94a3b8] hover:underline" onClick={() => setOpen(true)}>📝 Add a note</button>;
  }
  return (
    <div>
      <label htmlFor={`note-${id}`} className="sr-only">Note for {name}</label>
      <input id={`note-${id}`} type="text" maxLength={NOTE_MAX} defaultValue={line.note ?? ""} autoFocus={open && !line.note}
        placeholder="Size, brand, who is buying it…"
        onBlur={(e) => { const v = e.target.value.trim(); if (v !== (line.note ?? "")) setLine(id, { note: v || undefined }); if (!v) setOpen(false); }}
        className={`${input} h-10 w-full text-sm`} />
    </div>
  );
}

function BuyRow({ r, setLine, remove }: { r: Row; setLine: SetLine; remove: (id: string) => void }) {
  const { s, line } = r;
  const id = s.item.id;
  const qty = lineQty(line, s);
  const need = toBuy(line, s);
  const own = line.qty !== null && line.qty !== s.qty;
  return (
    <li className={`${inset} flex flex-col gap-3 p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {line.restock && <span className="mb-1 inline-block rounded-md border border-[#26324c] px-1.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider pbr-amber">Restock</span>}
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
          <input type="checkbox" className="h-5 w-5" style={{ accentColor: "#34D399" }} checked={line.got} onChange={(e) => setLine(id, { got: e.target.checked, restock: undefined })} />
          Bought<span className="sr-only">: {s.item.name}</span>
        </label>
      </div>
      <NoteField id={id} name={s.item.name} line={line} setLine={setLine} />
      {need === 0 && !line.got && <p className={muted}>Amount is 0, so there is nothing to buy.</p>}
      <span className="sr-only">{need} {unitWord(s.item, need)} to buy</span>
    </li>
  );
}

function DoneRow({ r, setLine, remove, isReady, children }: { r: Row; setLine: SetLine; remove: (id: string) => void; isReady?: boolean; children: React.ReactNode }) {
  const { s, line } = r;
  return (
    <li className={`${inset} flex flex-col gap-2 p-3`}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-bold">
          <span className={isReady ? "pbr-accent" : "text-[#94a3b8]"}>{isReady ? "✓ Ready" : "🛍️ Bought"}</span> · <span className="text-[#e8edf5]">{s.item.name}</span>
        </p>
        <button type="button" className={btnSmall} onClick={() => remove(s.item.id)} aria-label={`Remove ${s.item.name}`}>✕</button>
      </div>
      <NoteField id={s.item.id} name={s.item.name} line={line} setLine={setLine} />
      <div className="flex flex-wrap gap-2">{children}</div>
    </li>
  );
}

/** Black-on-white list for printing; hidden on screen. */
function PrintList({ plan, rows }: { plan: Plan; rows: TextRow[] }) {
  return (
    <div className="hidden print:block">
      <h2 className="text-xl font-black">{plan.name}</h2>
      {plan.note && <p className="mt-1 text-sm">{plan.note}</p>}
      <ul className="mt-2">
        {rows.map((r) => {
          const need = Math.max(0, r.qty - r.have);
          const note = r.note ? ` — ${r.note}` : "";
          if (r.s.item.kind === "task") return <li key={r.s.item.id} className="py-0.5 text-sm">{r.got ? "☑" : "☐"} To do: {r.s.item.name}{note}</li>;
          const status = statusText(r);
          return <li key={r.s.item.id} className="py-0.5 text-sm">{r.got || r.ready ? "☑" : "☐"} {r.s.item.name}: {need} {need === 1 ? r.s.item.unit.one : r.s.item.unit.many}{status ? ` (${status})` : ""}{note}</li>;
        })}
      </ul>
      <p className="mt-3 text-xs">Amounts are planning estimates. pleasebeready.com/lists</p>
    </div>
  );
}
