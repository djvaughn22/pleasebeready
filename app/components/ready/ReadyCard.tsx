"use client";

// Home's Get Ready door: "Continue my plan" with progress and the next small
// action when the visitor has a guided plan, else a plain start. Keeps one
// height while lists load, so the page doesn't jump.

import Link from "next/link";
import { useMemo } from "react";
import { amountText, currentGuided, readiness } from "../../lib/ready/engine";
import { itemById } from "../../lib/stockup/catalog";
import { useLists } from "../shop/ListsProvider";

export default function ReadyCard() {
  const api = useLists();
  const plan = api.ready ? currentGuided(api.store.plans) : null;
  const r = useMemo(() => (plan ? readiness(plan) : null), [plan]);
  const next = r?.next;
  const item = next ? itemById(next.id) : null;
  const body = !api.ready ? null : plan && r ? (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-[#e8edf5]">Continue my plan · <span className="pbr-accent">{Math.floor(r.ready * 100)}% ready</span></span>
        <span className="block truncate text-xs font-bold text-[#94a3b8]">
          {item && next ? `Next: ${item.name}${next.task ? "" : `, ${amountText(item, next.buy)}`}` : "Every essential is covered"}
        </span>
      </span>
      <span aria-hidden className="pbr-accent shrink-0 text-lg font-black">→</span>
    </>
  ) : (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-[#e8edf5]">Get Ready</span>
        <span className="block truncate text-xs font-bold text-[#94a3b8]">Start with what you need most.</span>
      </span>
      <span className="pbr-edge shrink-0 rounded-lg border-2 bg-[#F97316] px-3 py-1.5 text-xs font-black text-[#0b1220]">Start</span>
    </>
  );
  return (
    <Link href="/ready" aria-label={plan ? "Continue my readiness plan" : "Get Ready: start a readiness plan"}
      className="pbr-edge flex min-h-[3.75rem] items-center gap-3 rounded-2xl border-2 bg-[#141d2e] px-4 py-2.5">
      {body ?? <span className="text-xs font-bold text-[#94a3b8]">Get Ready</span>}
    </Link>
  );
}
