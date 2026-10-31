"use client";

// Home page: pick up where you left off. The most recently changed list with
// what's still to buy (each with its Amazon button), and the other lists. With
// no lists yet, one line on how lists work.

import Link from "next/link";
import { isDone, toBuy, unitWord } from "../../lib/stockup/calc";
import { primaryPick } from "../../lib/shop/picks";
import ShopButton from "../stockup/ShopButton";
import { listRows } from "../stockup/resolve";
import { card, muted } from "../stockup/ui";
import { useLists } from "./ListsProvider";

export default function ListsTeaser() {
  const api = useLists();
  const plans = [...api.store.plans].sort((a, b) => b.updated - a.updated);
  const latest = plans[0];
  const left = latest ? listRows(latest).filter((r) => r.s.item.kind === "product" && !isDone(r.line, r.s)) : [];

  return (
    <section aria-labelledby="lists-title" className={`${card} flex flex-col gap-3 p-5`}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="lists-title" className="text-xl font-black">{latest ? "⭐ Continue shopping" : "⭐ My Ready Lists"}</h2>
        <Link href="/lists" className="text-sm font-black pbr-accent">{plans.length ? `All lists (${plans.length}) →` : "Open →"}</Link>
      </div>
      {!api.ready ? (
        <p className={muted}>Loading your lists…</p>
      ) : !latest ? (
        <p className={muted}>Save one item or a whole kit and it lands here, with amounts, notes and what you’ve bought. Lists stay on this device. No account needed.</p>
      ) : (
        <>
          <Link href={`/lists#list=${latest.id}`} className="text-base font-black text-[#e8edf5] hover:underline">
            {latest.name} <span className="text-sm text-[#94a3b8]">· {left.length ? `${left.length} to buy` : "all bought"}</span>
          </Link>
          {left.length > 0 && (
            <ul className="flex flex-col gap-2">
              {left.slice(0, 3).map(({ s, line }) => {
                const need = toBuy(line, s);
                const pick = primaryPick(s.item.id);
                return (
                  <li key={s.item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#26324c] bg-[#0c1220] px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-[#e8edf5]">{s.item.name} <span className="font-bold text-[#94a3b8]">· {need.toLocaleString("en-US")} {unitWord(s.item, need)}</span></span>
                      {pick && <span className="block text-xs font-bold pbr-blue">{pick.name}</span>}
                    </span>
                    <span className="flex w-full sm:w-auto"><ShopButton item={s.item} big /></span>
                  </li>
                );
              })}
            </ul>
          )}
          {left.length > 3 && <Link href={`/lists#list=${latest.id}`} className="text-sm font-black pbr-accent">See all {left.length} on the list →</Link>}
          {plans.length > 1 && (
            <p className={muted}>
              Also saved:{" "}
              {plans.slice(1, 4).map((p, i) => (
                <span key={p.id}>{i ? ", " : ""}<Link href={`/lists#list=${p.id}`} className="font-black underline">{p.name}</Link></span>
              ))}
              {plans.length > 4 ? ` and ${plans.length - 4} more` : ""}
            </p>
          )}
        </>
      )}
    </section>
  );
}
