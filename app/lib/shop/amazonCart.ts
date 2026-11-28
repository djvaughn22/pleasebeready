// This trip on Amazon: which products go there, how many packages of each, and what stays on the
// local list. Two ways out, never more:
//
//  1. Review my Amazon list (always): one row per product with its exact package count and one
//     link to that product. Each link is a tap by the shopper; nothing opens by itself and nothing
//     is added in the background.
//  2. Add this trip to Amazon cart (OFF): one link to Amazon's multi-item cart form with every
//     product and its count. Checked 2026-11-27, Amazon no longer documents that form: the PA-API
//     "Add to Cart form" page redirects to the PA-API 5 deprecation notice, the Creators API that
//     replaced it has no cart operation, and the Associates Operating Agreement and Program Policies
//     never mention it. Community reports from Oct–Nov 2026 disagree on whether it still adds items,
//     and none confirms commissions. So the US marketplace is `verified: false`: the button only
//     appears for a test flag on a preview build, never on pleasebeready.com or a production build.
//     Evidence: docs/AMAZON-CART-HANDOFF.md.
//
// Merging: rows that share a product (same ASIN) become one line, counted by the units they need
// together, so two rows needing 20 and 10 AAA batteries buy one 36-pack, not two.

import { AMAZON_TAG, amazonUrl } from "../gear";
import type { Row, TripPlan } from "./trip";
import { thisTrip } from "./trip";

export type Market = {
  /** Where the multi-item cart form lives. */
  cartForm: string;
  /** Verified end to end: products, titles and counts seen on Amazon's own screen from a real tap. */
  verified: boolean;
  checked: string;
};

/** Only the US store is linked from this site. Unverified: the cart button stays off. */
export const MARKETS: Record<string, Market> = {
  US: { cartForm: "https://www.amazon.com/gp/aws/cart/add.html", verified: false, checked: "2026-11-27" },
};

/** Our own caps for one cart link (Amazon documents none today). Anything past them stays on the review list. */
export const MAX_CART_LINES = 20;
export const MAX_CART_QTY = 99;

export type CartLine = {
  asin: string;
  /** Packages to add. */
  qty: number;
  /** Our name for the product. */
  name: string;
  /** Units in one package. */
  per: number;
  /** The rows this line covers. */
  rows: string[];
  /** Words for the packages: "12 jugs", "1 pack of 36". */
  words: string;
  url: string;
};

export type AmazonList = {
  /** Products for Amazon, merged by ASIN, in the trip's priority order. */
  lines: CartLine[];
  /** Lines the cart link can carry (within the caps), and the ones it can't. */
  cart: CartLine[];
  overflow: CartLine[];
  /** Rows this trip that stay on the local list: bought nearby, or no exact product. */
  local: Row[];
  /** Packages across the Amazon lines. */
  packs: number;
};

/** Product units a row wants this trip: all it needs when the whole row is in, else whole packages. */
function unitsNow(r: Row): number {
  if (!r.offer) return 0;
  return r.now >= r.packs ? r.want : r.now * r.offer.per;
}

/** The trip's Amazon lines: every row this trip with an exact product, not marked nearby. */
export function amazonList(plan: TripPlan): AmazonList {
  const rows = thisTrip(plan);
  const byAsin = new Map<string, { units: number; rows: Row[] }>();
  const local: Row[] = [];
  for (const r of rows) {
    if (r.local || !r.offer) { local.push(r); continue; }
    const a = r.offer.pick.asin;
    const cur = byAsin.get(a) ?? { units: 0, rows: [] };
    cur.units += unitsNow(r);
    cur.rows.push(r);
    byAsin.set(a, cur);
  }
  const lines: CartLine[] = [];
  for (const [asin, v] of byAsin) {
    const first = v.rows[0];
    const offer = first.offer!;
    const qty = Math.max(1, Math.ceil(v.units / offer.per - 1e-9));
    lines.push({ asin, qty, name: offer.pick.name, per: offer.per, rows: v.rows.map((r) => r.key), words: wordsFor(first, qty), url: amazonUrl(asin) });
  }
  const cart: CartLine[] = [];
  const overflow: CartLine[] = [];
  for (const l of lines) (cart.length < MAX_CART_LINES && l.qty <= MAX_CART_QTY ? cart : overflow).push(l);
  return { lines, cart, overflow, local, packs: lines.reduce((t, l) => t + l.qty, 0) };
}

// Kept here, not imported from trip.ts's packWords, so the line reads the same for a merged product.
function wordsFor(r: Row, qty: number): string {
  const o = r.offer!;
  if (o.per <= 1) {
    const one = o.pick.each ?? r.item.unit.one;
    const many = o.pick.each ? `${o.pick.each}s` : r.item.unit.many;
    return `${qty.toLocaleString("en-US")} ${qty === 1 ? one : many}`;
  }
  const word = r.item.cat === "water" ? "case" : "pack";
  return `${qty.toLocaleString("en-US")} ${qty === 1 ? word : `${word}s`} of ${o.per}`;
}

/**
 * Amazon's multi-item cart form as one GET link: AssociateTag plus ASIN.n / Quantity.n for each line.
 * Null when there is nothing to send or the market has no form.
 */
export function cartUrl(lines: CartLine[], market = "US", tag = AMAZON_TAG): string | null {
  const m = MARKETS[market];
  if (!m || !lines.length) return null;
  const q = new URLSearchParams();
  if (tag) q.set("AssociateTag", tag);
  lines.forEach((l, i) => {
    q.set(`ASIN.${i + 1}`, l.asin);
    q.set(`Quantity.${i + 1}`, String(l.qty));
  });
  return `${m.cartForm}?${q.toString()}`;
}

/** The live site's own hosts: the test flag never works there. */
const LIVE_HOST = /(^|\.)pleasebeready\.com$/i;

/**
 * May this page show the cart button? Only for a verified market, or for an explicit test flag on a
 * build that isn't production and a host that isn't the live site. Default: no.
 */
export function cartAllowed(o: { market?: string; deploy: string | undefined; host: string; flag: boolean }): boolean {
  const m = MARKETS[o.market ?? "US"];
  if (!m) return false;
  if (m.verified) return true;
  const live = o.deploy === "production" || LIVE_HOST.test(o.host);
  return !live && o.flag;
}

/** The test flag in a page address: ?amazon-cart=test. */
export const CART_FLAG = "amazon-cart";
export const flagFromSearch = (search: string) => new URLSearchParams(search).get(CART_FLAG) === "test";
