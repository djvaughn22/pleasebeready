"use client";

// The bar along the bottom of shop pages: which list Save buttons fill, how
// many things are on it, and a way to open it. Shows once the visitor has a
// list (or has just saved something), so first visits stay uncluttered.

import Link from "next/link";
import { useLists } from "./ListsProvider";
import { useSaver } from "./Saver";

const NEW = "__new__";

export default function SaveBar() {
  const api = useLists();
  const saver = useSaver();
  if (!api.ready || (api.store.plans.length === 0 && !saver.message)) return null;
  const t = saver.target;
  const count = t ? Object.keys(t.list).length : 0;
  const href = t ? `/lists#list=${t.id}` : "/lists";

  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-[#26324c] bg-[#0b1220] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:mx-0 sm:rounded-t-xl sm:border-x print:hidden">
      <p className="mb-2 min-h-4 text-xs font-bold text-[#e8edf5]" role="status" aria-live="polite">{saver.message}</p>
      <div className="flex items-center gap-2">
        {saver.kit || api.store.plans.length === 0 ? (
          <p className="min-w-0 flex-1 truncate text-sm font-black text-[#e8edf5]">
            {t ? <>⭐ {t.name} <span className="text-[#94a3b8]">({count})</span></> : "⭐ Not saved yet"}
          </p>
        ) : (
          <label className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-xs font-black text-[#94a3b8]">Saving to</span>
            <select value={t?.id ?? ""} onChange={(e) => (e.target.value === NEW ? api.makeList() : api.setTarget(e.target.value))}
              className="h-11 min-w-0 flex-1 rounded-lg border border-[#26324c] bg-[#0c1220] px-2 text-sm font-black text-[#e8edf5]">
              {api.store.plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({Object.keys(p.list).length})</option>)}
              <option value={NEW}>+ New list</option>
            </select>
          </label>
        )}
        <Link href={href}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl border border-[#34D399] bg-[#34D399] px-4 text-sm font-black text-[#0b1220] transition hover:brightness-110">
          Open list →
        </Link>
      </div>
    </div>
  );
}
