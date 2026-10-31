"use client";

// Saving, without covering the shop. ListPicker sits in the page near the top:
// which list Save buttons fill, its count, and a link to open it; it keeps its
// height while lists load, so nothing jumps. SaveToast confirms each save for
// a few seconds in a small note at the bottom, then gets out of the way.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLists } from "./ListsProvider";
import { useSaver } from "./Saver";

const NEW = "__new__";
const count = (list: Record<string, unknown>) => Object.keys(list).length;

export function ListPicker({ className = "" }: { className?: string }) {
  const api = useLists();
  const saver = useSaver();
  const t = saver.target;
  const href = t ? `/lists#list=${t.id}` : "/lists";
  return (
    <div className={`flex min-h-11 items-center gap-2 text-sm print:hidden ${className}`}>
      <span aria-hidden className="pbr-accent text-lg leading-none">★</span>
      {!api.ready ? (
        <span className="text-xs font-bold text-[#94a3b8]">Loading your lists…</span>
      ) : saver.kit || api.store.plans.length === 0 ? (
        <span className="min-w-0 truncate text-xs font-bold text-[#94a3b8]">
          {t ? <>Saving to <b className="text-[#e8edf5]">{t.name}</b> ({count(t.list)})</> : "Tap ☆ to save to a Ready List"}
        </span>
      ) : (
        <label className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs font-bold text-[#94a3b8]">Saving to</span>
          <select value={t?.id ?? ""} onChange={(e) => (e.target.value === NEW ? api.makeList() : api.setTarget(e.target.value))}
            className="h-9 min-w-0 max-w-[13rem] rounded-lg border border-[#26324c] bg-[#141d2e] px-2 text-xs font-black text-[#e8edf5]">
            {api.store.plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({count(p.list)})</option>)}
            <option value={NEW}>+ New list</option>
          </select>
        </label>
      )}
      {api.ready && t && <Link href={href} className="shrink-0 text-xs font-black pbr-accent hover:underline">Open →</Link>}
    </div>
  );
}

export default function SaveToast() {
  const saver = useSaver();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!saver.seq) return;
    const on = setTimeout(() => setShown(saver.seq), 0);
    const off = setTimeout(() => setShown(0), 3500);
    return () => { clearTimeout(on); clearTimeout(off); };
  }, [saver.seq]);
  const t = saver.target;
  const visible = shown !== 0 && shown === saver.seq;
  return (
    <div role="status" aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 print:hidden ${visible ? "" : "sr-only"}`}>
      {saver.message && (
        <p className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-full border border-[#26324c] bg-[#141d2e] py-2 pl-4 pr-2 text-xs font-bold text-[#e8edf5] shadow-lg">
          <span className="min-w-0 truncate">{saver.message}</span>
          {t && <Link href={`/lists#list=${t.id}`} className="shrink-0 rounded-full px-2 py-1 font-black pbr-accent hover:underline">Open</Link>}
        </p>
      )}
    </div>
  );
}
