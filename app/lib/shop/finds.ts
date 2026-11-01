// Ready Finds: the home page's editorial feed, in tabs. Everything here is an
// exact product from picks.ts; nothing claims a price or a discount.
//
// - Essentials (the default): what a household should stock first, in the
//   store's preparedness order (priority.ts). Fixed, never rotates.
// - New: products added to the store in the last NEW_DAYS days (picks.ts
//   `added`), newest first (same day: preparedness order), one per kind of
//   product. Empty when nothing is new.
// - Everyday: a hand-kept list, eight shown a week, rotating by week number.
// - Budget picks and Upgrades: every product with that role.
// Verified deals have their own tab only when deals.ts has a live one.

import { itemById } from "../stockup/catalog";
import { addedOn, picks, primaryPick, type Pick } from "./picks";
import { CORE, byPrep, prepRank } from "./priority";

export const NEW_DAYS = 60;

/** Useful in any home, any week. Edit freely; keep each id an item with an exact product. */
export const EVERYDAY = [
  "portable-jump-starter", "headlamps", "dash-camera", "rechargeable-lantern", "motion-sensor-night-lights", "cordless-drill",
  "reusable-water-bottles", "pet-first-aid-kit", "command-hooks-and-strips", "charging-cables", "car-charger-for-every-row",
  "stud-finder", "utility-knife", "tape-measure", "zip-ties", "light-bulbs", "non-slip-bath-mat", "handheld-shower-head",
  "car-trunk-organizer", "tire-pressure-gauge", "packing-tape", "under-bed-storage", "kids-water-bottles", "work-flashlight-with-magnet",
];

/** ISO-ish week number, so the Everyday tab changes once a week for everyone. */
export const weekOf = (d: Date) => Math.floor((d.getTime() / 86400000 + 3) / 7);

/** Products in the store's preparedness order (by their item). */
const prepOrder = (ps: Pick[]) => {
  const order = new Map(byPrep([...new Set(ps.map((p) => p.item))]).map((id, i) => [id, i]));
  return [...ps].sort((a, b) => order.get(a.item)! - order.get(b.item)!);
};

/** The Essentials tab: the first row of the store. */
export const essentialPicks = (): Pick[] => byPrep(CORE).map((id) => primaryPick(id)!).filter(Boolean);

export function findsTabs(now: Date, exclude: string[] = [], n = 8) {
  const essentials = essentialPicks();
  const skip = new Set([...exclude, ...essentials.map((p) => p.item)]);
  const since = new Date(now.getTime() - NEW_DAYS * 864e5).toISOString().slice(0, 10);
  // Newest first: by the date added; products added the same day in preparedness order.
  const rank = (p: Pick) => prepRank(itemById(p.item)!);
  const recent = picks.filter((p) => addedOn(p) >= since)
    .sort((a, b) => addedOn(b).localeCompare(addedOn(a)) || rank(a) - rank(b));
  const fresh: Pick[] = [];
  for (const p of recent) {
    if (fresh.length >= n) break;
    const cat = itemById(p.item)?.cat;
    if (p.role === "pick" && !skip.has(p.item) && !fresh.some((f) => itemById(f.item)?.cat === cat)) fresh.push(p);
  }
  const pool = EVERYDAY.filter((id) => !skip.has(id) && !fresh.some((f) => f.item === id));
  const start = (weekOf(now) * n) % Math.max(pool.length, 1);
  const everyday = [...pool.slice(start), ...pool.slice(0, start)].slice(0, n).map((id) => primaryPick(id)!).filter(Boolean);
  return {
    essentials,
    new: fresh,
    everyday,
    budget: prepOrder(picks.filter((p) => p.role === "value")),
    upgrade: prepOrder(picks.filter((p) => p.role === "upgrade")),
  };
}
