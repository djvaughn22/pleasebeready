// One preparedness ranking for the whole store: what a household should stock
// first. Home's Essentials tab, the Emergency department, emergency kits, Get
// Ready and broad emergency searches all sort with it, so they never disagree.
//
// Tiers follow Ready.gov's Build a Kit list (water, food, light, power, first
// aid, radio, sanitation), then fire safety, shelter and warmth, tools, and
// last convenience and upgrades. Other departments (parties, trips) keep their
// own order; this ranking is for household readiness.

import { itemById } from "../stockup/catalog";
import type { CatalogItem, OccasionId } from "../stockup/types";

export const TIERS = [
  "Drinking water and storage", "Food and food prep", "Flashlights, batteries and lighting", "Backup charging and power",
  "First aid and medicine", "Radio and communication", "Hygiene and sanitation", "Fire safety and alarms",
  "Shelter, warmth and weather", "Tools and household supplies", "Convenience", "Upgrades and accessories",
] as const;
export const CONVENIENCE_TIER = 10;
export const UPGRADE_TIER = 11;

/** Situations that use this ranking (and Get Ready's emergency order). */
export const EMERGENCY_KINDS: OccasionId[] = ["emergency", "outage", "winter", "hurricane", "heat", "wildfire", "flood"];
export const isEmergencyKind = (o: OccasionId) => EMERGENCY_KINDS.includes(o);

/**
 * Home's Essentials, in order. `CORE` is the first row of the store: drinking water before
 * containers, everyday food before ration kits, then one of each other necessity. `MORE` follows in the same tier order. Every id needs
 * an exact product in picks.ts (tested).
 */
export const CORE = [
  "bottled-water", "water-storage-container", "canned-soups-and-stews", "peanut-butter", "manual-can-opener",
  "flashlights", "batteries", "power-bank", "first-aid-kit", "weather-radio", "toilet-paper", "smoke-and-co-alarm",
];
export const MORE = [
  "water-bricks", "water-purification-tablets", "canned-tuna-or-chicken", "canned-vegetables", "shelf-stable-milk",
  "3-day-emergency-food-supply", "freeze-dried-meals", "headlamps", "lantern", "hand-crank-weather-radio-with-charger", "masks",
  "whistle", "trash-bags", "hand-sanitizer", "wet-wipes", "carbon-monoxide-alarm", "fire-extinguisher", "emergency-blankets", "rain-ponchos",
  "tarp", "multi-tool", "duct-tape", "document-bag",
];
export const ESSENTIALS = [...CORE, ...MORE];
const ESS = new Map(ESSENTIALS.map((id, i) => [id, i]));

const BY_CAT: Record<CatalogItem["cat"], number> = {
  water: 0, food: 1, cooking: 1, power: 3, health: 4, toiletries: 6, paper: 6, cleaning: 6, baby: 6,
  sleep: 8, weather: 8, safety: 9, tools: 9, outdoors: 9, car: 9, access: 9,
  travel: 10, pets: 10, drinks: 10, dining: 10, party: 10, fun: 10, school: 10, moving: 10, tasks: 9,
};

const BY_ID: Record<string, number> = {
  "pet-water": 0, "water-pouches-for-the-car": 0,
  "pet-food": 1, "baby-food-and-formula": 1, "shelf-stable-milk": 1, "emergency-food-bars-for-the-car": 1, "canned-pet-food": 1,
  "first-aid-kit-for-the-car": 4, masks: 4, meds: 4, "pet-first-aid-kit": 4,
  "weather-radio": 5, "hand-crank-weather-radio-with-charger": 5, "two-way-radios": 5, whistle: 5, "printed-contact-list": 5, "large-button-phone": 5,
  "smoke-and-co-alarm": 7, "carbon-monoxide-alarm": 7, "fire-extinguisher": 7, "escape-ladder": 7, "fire-blanket": 7,
  "emergency-blankets": 8, "go-bag": 8, "72-hour-kit": 8, "car-emergency-kit": 8, "leash-and-id-tag": 8, "pet-carrier-or-crate": 8,
};

/** Accessories that sit in a necessity's category but are not one ("Toiletries" → shower caddy). */
const CONVENIENCE = new Set([
  "shower-caddy", "bath-towels", "shower-curtain-and-rings", "handheld-shower-head", "non-slip-bath-mat", "car-trunk-organizer",
  "under-bed-storage", "command-hooks-and-strips", "hangers", "car-phone-mount", "car-trash-can", "dash-camera",
  "car-charger-for-every-row", "labels-and-markers", "airtight-food-storage-bin", "reusable-water-bottles", "kids-water-bottles",
  "collapsible-water-bowl-or-cup", "power-strip", "box-fan", "blackout-curtains", "pet-seat-cover", "headphones-for-kids",
]);

const LIGHT = /flashlight|lantern|headlamp|batter|light|candle|glow/;

/** The item's tier: 0 water … 10 convenience, 11 upgrades. */
export function prepTier(item: CatalogItem): number {
  if (CONVENIENCE.has(item.id)) return CONVENIENCE_TIER;
  const tier = BY_ID[item.id] ?? (item.cat === "power" && LIGHT.test(item.id) ? 2 : BY_CAT[item.cat] ?? CONVENIENCE_TIER);
  // An extra (a 55-gallon barrel, a generator) is an upgrade unless it's one of the essentials.
  if (item.pri === "extra" && !ESS.has(item.id)) return UPGRADE_TIER;
  return tier;
}

const PRI = { essential: 0, useful: 1, extra: 2 } as const;

/** The thing itself before what goes with it: drinking water before containers, food before the opener. */
const LEAD: Record<string, number> = { water: -3, "shelf-food": -3, "baby-food-and-formula": -2, "pet-water": -1, "pet-food": -1 };

/** Sort key: tier, then place in Essentials, then must-haves before useful. Lower comes first. */
export function prepRank(item: CatalogItem): number {
  return prepTier(item) * 10000 + (LEAD[item.id] ?? ESS.get(item.id) ?? 999) * 10 + PRI[item.pri];
}

/**
 * A short list that covers every necessity before doubling up: the first item of each tier (two of
 * lighting: a light and its batteries), in tier order, then everything else in preparedness order.
 */
export function spread(items: CatalogItem[]): CatalogItem[] {
  const sorted = byPrep(items);
  const taken = new Map<number, number>();
  const first: CatalogItem[] = [];
  const rest: CatalogItem[] = [];
  for (const i of sorted) {
    const t = prepTier(i);
    const n = taken.get(t) ?? 0;
    if (t < CONVENIENCE_TIER && n < (t === 2 ? 2 : 1)) { first.push(i); taken.set(t, n + 1); } else rest.push(i);
  }
  return [...first, ...rest];
}

/** Items (or ids) in preparedness order; ties keep their given order. Unknown ids go last. */
export function byPrep<T extends CatalogItem | string>(xs: T[]): T[] {
  const rank = (x: T) => {
    const item = typeof x === "string" ? itemById(x) : (x as CatalogItem);
    return item ? prepRank(item) : Infinity;
  };
  return xs.map((x, i) => ({ x, r: rank(x), i })).sort((a, b) => a.r - b.r || a.i - b.i).map((e) => e.x);
}
