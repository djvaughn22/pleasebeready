// Ready Deals: discounts on our exact products, only when verified.
//
// Amazon's Associates rules allow showing a price or discount only from its
// Creators API, with the time it was fetched. The site has no API access yet,
// so this list is empty and the home page hides Ready Deals. Never add a deal
// from memory, a screenshot, another deal site or a product page you read.

import { pickByAsin } from "./picks";

export type Deal = {
  asin: string; // must be one of our exact products (picks.ts)
  off: string; // the discount as the source states it, e.g. "20% off"
  source: string; // where it was verified, e.g. "Creators API"
  checked: string; // ISO date it was verified
  ends: string; // ISO date it ends; shown only before this day
};

export const deals: Deal[] = [];

/** Deals live on `today` (ISO date), with an exact product behind them. */
export const activeDeals = (today: string) =>
  deals.filter((d) => d.checked <= today && today < d.ends && pickByAsin(d.asin));
