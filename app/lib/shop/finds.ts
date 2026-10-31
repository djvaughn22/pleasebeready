// Ready Finds: the home page's editorial feed, in tabs. Everything here is an
// exact product from picks.ts; nothing claims a price or a discount.
//
// - New: the products most recently added to picks.ts (the file is append-only,
//   so its order is the order we added them), one per kind of product.
// - Everyday: a hand-kept list, eight shown a week, rotating by week number.
// - Budget picks and Upgrades: every product with that role.
// Verified deals have their own tab only when deals.ts has a live one.

import { itemById } from "../stockup/catalog";
import { picks, primaryPick, type Pick } from "./picks";

/** Useful in any home, any week. Edit freely; keep each id an item with an exact product. */
export const EVERYDAY = [
  "portable-jump-starter", "headlamps", "dash-camera", "rechargeable-lantern", "motion-sensor-night-lights", "cordless-drill",
  "reusable-water-bottles", "pet-first-aid-kit", "command-hooks-and-strips", "charging-cables", "car-charger-for-every-row",
  "stud-finder", "utility-knife", "tape-measure", "zip-ties", "light-bulbs", "non-slip-bath-mat", "handheld-shower-head",
  "car-trunk-organizer", "tire-pressure-gauge", "packing-tape", "under-bed-storage", "kids-water-bottles", "work-flashlight-with-magnet",
];

/** ISO-ish week number, so the Everyday tab changes once a week for everyone. */
export const weekOf = (d: Date) => Math.floor((d.getTime() / 86400000 + 3) / 7);

export function findsTabs(now: Date, exclude: string[], n = 8) {
  const skip = new Set(exclude);
  const fresh: Pick[] = [];
  for (const p of [...picks].reverse()) {
    if (fresh.length >= n) break;
    const cat = itemById(p.item)?.cat;
    if (p.role === "pick" && !skip.has(p.item) && !fresh.some((f) => itemById(f.item)?.cat === cat)) fresh.push(p);
  }
  const pool = EVERYDAY.filter((id) => !skip.has(id) && !fresh.some((f) => f.item === id));
  const start = (weekOf(now) * n) % Math.max(pool.length, 1);
  const everyday = [...pool.slice(start), ...pool.slice(0, start)].slice(0, n).map((id) => primaryPick(id)!).filter(Boolean);
  return {
    new: fresh,
    everyday,
    budget: picks.filter((p) => p.role === "value"),
    upgrade: picks.filter((p) => p.role === "upgrade"),
  };
}
