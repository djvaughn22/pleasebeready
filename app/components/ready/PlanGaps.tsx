"use client";

// On a kit or department page: what the visitor's Get Ready plan still needs
// from this page, and one button to put those on the plan. Only items the plan
// itself counts show (an emergency plan never picks up party plates), and an
// item already on the plan is never added twice.

import Link from "next/link";
import { useMemo, useState } from "react";
import { currentGuided, gaps, readiness } from "../../lib/ready/engine";
import { itemById } from "../../lib/stockup/catalog";
import { useLists } from "../shop/ListsProvider";
import { btnSmall, muted } from "../stockup/ui";

export default function PlanGaps({ ids, className = "" }: { ids: string[]; className?: string }) {
  const api = useLists();
  const plan = api.ready ? currentGuided(api.store.plans) : null;
  const need = useMemo(() => (plan ? gaps(readiness(plan), ids) : []), [plan, ids]);
  const [added, setAdded] = useState(0);
  if (plan && added) {
    return (
      <p role="status" className={`rounded-xl border border-[#26324c] bg-[#141d2e] px-3 py-2 print:hidden ${muted} ${className}`}>
        Added {added} to <Link href="/ready" className="font-black pbr-accent hover:underline">{plan.name} →</Link>
      </p>
    );
  }
  if (!plan || !need.length) return null;
  const names = need.map((id) => itemById(id)!.name);
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[#26324c] bg-[#141d2e] px-3 py-2 print:hidden ${className}`}>
      <p className={`min-w-0 flex-1 ${muted}`}>
        <Link href="/ready" className="font-black pbr-accent hover:underline">{plan.name}</Link> still needs {need.length} of these:{" "}
        {names.slice(0, 4).join(", ")}{names.length > 4 ? ` and ${names.length - 4} more` : ""}.
      </p>
      <button type="button" className={btnSmall} onClick={() => { api.saveItems(need, plan.id); setAdded(need.length); }}>Add to my plan</button>
    </div>
  );
}
