// Shopping lists for the planner.
//
// What this module does NOT do: it never builds a cart, never claims a
// product is in stock, never shows an Amazon price, and never sends the list
// anywhere. Every Amazon link goes through gear.ts's amazonUrl() so the
// Associates tag stays in one place. Product names come from gear.ts.

import { AMAZON_TAG, amazonUrl } from "../gear";
import { formatMoney, formatQuantity, planQuantity, remainingQuantity, stateFor, unitCost } from "./calc";
import { gearFor } from "./catalog";
import type { BucketId, PlanState, ResolvedItem, Unit } from "./types";

export type ShopScope =
  | { mode: "plan"; onlyNeeded: boolean }
  | { mode: "bucket"; bucket: BucketId; onlyNeeded: boolean }
  | { mode: "picks" };

export type ShopLine = {
  itemId: string;
  bucket: BucketId;
  name: string;
  /** How many of the item to get. */
  toBuy: number;
  unit: Unit;
  /** Rough cost for these, from planning estimates (never an Amazon price). */
  estCost: number;
  product?: {
    asin: string;
    name: string;
    /** Tagged Amazon link, from gear.ts. */
    url: string;
    /** How many of this product to open the listing for; 1 when the product is only an example. */
    units: number;
    /** True when we know how many items one product covers. */
    exactCount: boolean;
  };
};

/** The lines for a scope. Tasks and anything skipped never appear. */
export function shoppingLines(resolved: ResolvedItem[], state: PlanState, scope: ShopScope): ShopLine[] {
  const lines: ShopLine[] = [];
  for (const r of resolved) {
    const st = stateFor(state.items, r.id);
    if (st.status === "skip") continue;
    const planned = planQuantity(r, st);
    if (planned === null) continue;
    if (scope.mode === "bucket" && r.bucket !== scope.bucket) continue;
    if (scope.mode === "picks" && !state.picks.includes(r.id)) continue;

    const remaining = remainingQuantity(r, st);
    let toBuy: number;
    if (scope.mode === "picks") toBuy = remaining > 0 ? remaining : planned;
    else toBuy = scope.onlyNeeded ? remaining : planned;
    if (toBuy <= 0) continue;

    const gear = r.product ? gearFor(r.product.asin) : undefined;
    const covers = r.product?.covers;
    lines.push({
      itemId: r.id, bucket: r.bucket, name: r.name, toBuy, unit: r.unit,
      estCost: toBuy * unitCost(r, st),
      product: r.product && gear
        ? {
            asin: gear.asin, name: gear.name, url: amazonUrl(gear.asin),
            units: covers ? Math.ceil(toBuy / covers) : 1,
            exactCount: !!covers,
          }
        : undefined,
    });
  }
  return lines;
}

export function linesTotal(lines: ShopLine[]): number {
  return lines.reduce((sum, l) => sum + l.estCost, 0);
}

// ── Plain-text list (copy and print) ────────────────────────────────────────

export function listText(lines: ShopLine[], heading: string): string {
  const out = [heading, ""];
  for (const l of lines) {
    const cost = l.estCost > 0 ? ` (about ${formatMoney(l.estCost)})` : "";
    out.push(`[ ] ${formatQuantity(l.toBuy, l.unit)} - ${l.name}${cost}`);
  }
  const total = linesTotal(lines);
  if (total > 0) out.push("", `Rough total: about ${formatMoney(total)}`);
  out.push(
    "",
    "Amounts are suggestions and costs are rough planning figures, not store prices.",
    "Made with the PleaseBeReady household planner (pleasebeready.com/planner).",
  );
  return out.join("\n");
}

// ── Amazon's multi-item cart form (off by default) ──────────────────────────
//
// Checked 2026-10-17: the form's endpoint still answers, but it sends a
// signed-out shopper to an Amazon sign-in page first; Amazon's US
// documentation page for it now redirects to the PA-API deprecation notice,
// and the Creators API docs have no cart-form page. We could not confirm the
// form is covered by the current Associates rules or works end to end for this
// account, so the planner does not offer it unless the owner turns it on
// (NEXT_PUBLIC_AMAZON_CART_FORM=1) after confirming with Associates support.
// Keep the individual tagged links as the default.

export const CART_FORM_ENABLED = process.env.NEXT_PUBLIC_AMAZON_CART_FORM === "1";

const CART_FORM_URL = "https://www.amazon.com/gp/aws/cart/add.html";

/** Amazon's cart-form URL for these lines, or null when there is nothing to send.
 *  Products are merged by ASIN, so the same product never appears twice. */
export function cartFormUrl(lines: ShopLine[], tag: string = AMAZON_TAG): string | null {
  const byAsin = new Map<string, number>();
  for (const l of lines) {
    if (!l.product) continue;
    byAsin.set(l.product.asin, (byAsin.get(l.product.asin) ?? 0) + l.product.units);
  }
  if (byAsin.size === 0) return null;
  const params = new URLSearchParams();
  if (tag) params.set("AssociateTag", tag);
  let i = 1;
  for (const [asin, qty] of byAsin) {
    params.set(`ASIN.${i}`, asin);
    params.set(`Quantity.${i}`, String(qty));
    i += 1;
  }
  return `${CART_FORM_URL}?${params.toString()}`;
}

// ── Reporting a problem (opens the visitor's own email app) ─────────────────

export const FEEDBACK_EMAIL = "ask@openmirrorllc.com";

/** A mailto: link that names only the item, never anything from the plan. */
export function reportItemUrl(item: { id: string; name: string } | null): string {
  const subject = item ? `Planner item: ${item.name}` : "Planner: missing or confusing item";
  const body = item
    ? `Item: ${item.name} (${item.id})\n\nWhat is missing, wrong or confusing?\n`
    : "What is missing or confusing?\n";
  return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
