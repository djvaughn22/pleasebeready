"use client";

// Home page: the visitor's saved lists, or how lists work if there are none.

import Link from "next/link";
import { countLeft } from "../stockup/resolve";
import { card, muted } from "../stockup/ui";
import { useLists } from "./ListsProvider";

export default function ListsTeaser() {
  const api = useLists();
  const plans = [...api.store.plans].sort((a, b) => b.updated - a.updated);

  return (
    <section aria-labelledby="lists-title" className={`${card} flex flex-col gap-3 p-5`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="lists-title" className="text-xl font-black">⭐ My Ready Lists</h2>
        <Link href="/lists" className="text-sm font-black pbr-accent">{plans.length ? "All lists →" : "Open →"}</Link>
      </div>
      {!api.ready ? (
        <p className={muted}>Loading your lists…</p>
      ) : plans.length === 0 ? (
        <p className={muted}>Save one item or a whole kit and it lands here. Lists stay on this device, with amounts, notes and what you’ve bought. No account needed.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {plans.slice(0, 3).map((p) => {
            const n = Object.keys(p.list).length;
            const left = countLeft(p);
            return (
              <li key={p.id}>
                <Link href={`/lists#list=${p.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#26324c] bg-[#1c2740] px-4 py-3 hover:border-[#34D399]">
                  <span className="min-w-0 truncate text-sm font-black text-[#e8edf5]">{p.name}</span>
                  <span className="shrink-0 text-xs font-bold text-[#94a3b8]">{n === 0 ? "empty" : left === 0 ? `${n} · all bought` : `${left} to buy`}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
