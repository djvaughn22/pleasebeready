// Water and food, counted as supplies, not equipment. One source for the Get
// Ready plan, the Lists page, kits and the home page.
//
// Water is counted in gallons on the `water` line: water already stored
// (have) and drinking water bought (bought). Bottled water counts by the
// bottle, and a storage container counts only once it is filled (`filled`).
// An empty container is never water, and a filter or tablets never are.
//
// Food is counted in person-days (a day of food for one person) on the
// `shelf-food` line: food already in the house (have) and food bought. The
// grocery mix below fills the rest; each kind of food can fill only its own
// share, so 40 cans of beans never count as a week of food. A ration pack
// counts by the calories on its label. Nothing here claims complete nutrition.

import type { Line, Plan } from "../stockup/types";

export const GALLON_OZ = 128;

/** Things that hold or are drinking water, with gallons per unit. `fill`: counts only when filled. */
export const WATER_WAYS: { id: string; gallons: number; fill?: boolean; where: string }[] = [
  { id: "bottled-water", gallons: 16.9 / GALLON_OZ, where: "in bottles" },
  { id: "water-storage-container", gallons: 7, fill: true, where: "in filled containers" },
  { id: "water-bricks", gallons: 3.5, fill: true, where: "in filled bricks" },
  { id: "55-gallon-water-barrel", gallons: 55, fill: true, where: "in a filled barrel" },
];

export type Prep = "Ready to eat" | "Better heated" | "Refrigerate after opening" | "Needs hot water";

/**
 * A practical shelf-stable mix, per person-day (our planning rule, built from Ready.gov's food list:
 * canned meats, fruit and vegetables, protein bars, cereal, peanut butter, shelf-stable milk).
 * `share` is the part of the food each kind fills; shares add up to 1.
 */
export const FOOD_MIX: { id: string; group: string; perDay: number; share: number; prep: Prep }[] = [
  { id: "canned-soups-and-stews", group: "Canned meals", perDay: 1, share: 0.3, prep: "Better heated" },
  { id: "canned-tuna-or-chicken", group: "Proteins", perDay: 0.3, share: 0.1, prep: "Ready to eat" },
  { id: "canned-beans", group: "Beans", perDay: 0.3, share: 0.1, prep: "Ready to eat" },
  { id: "canned-vegetables", group: "Vegetables", perDay: 0.5, share: 0.1, prep: "Ready to eat" },
  { id: "canned-fruit", group: "Fruit", perDay: 0.3, share: 0.05, prep: "Ready to eat" },
  { id: "shelf-stable-milk", group: "Shelf-stable milk", perDay: 1, share: 0.05, prep: "Refrigerate after opening" },
  { id: "peanut-butter", group: "Peanut butter", perDay: 0.07, share: 0.1, prep: "Ready to eat" },
  { id: "pretzels-and-crackers", group: "Crackers and cereal", perDay: 0.1, share: 0.1, prep: "Ready to eat" },
  { id: "granola-or-protein-bars", group: "Bars", perDay: 2, share: 0.1, prep: "Ready to eat" },
];

/** Packaged food that counts by its label: a 3,600-calorie ration is 1.8 person-days at 2,000 calories a day. */
export const FOOD_KITS: { id: string; days: number; note: string }[] = [
  { id: "3-day-emergency-food-supply", days: 1.8, note: "3,600 calories each, counted as 1.8 person-days" },
];
export const CALORIES_PER_DAY = 2000;

/** Ways that are part of water or food, not separate essentials. */
export const SUPPLY_WAYS = new Set([...WATER_WAYS.map((w) => w.id), ...FOOD_MIX.map((f) => f.id), ...FOOD_KITS.map((k) => k.id)]);

/** Units a line holds: what you had plus what you bought (all of it when ticked bought). Restock means used up. */
function units(line: Line | undefined, need: number): number {
  if (!line || line.restock) return 0;
  return line.got ? Math.max(need, line.have) : line.have + (line.bought ?? 0);
}

export type Part = { id: string; label: string; amount: number };

/** Gallons of water a plan has, by where it is: stored, bought jugs, bottles, filled containers. */
export function waterParts(plan: Plan): Part[] {
  const w = plan.list.water;
  const parts: Part[] = [];
  if (w && !w.restock) {
    if (w.have) parts.push({ id: "water", label: "stored", amount: w.have });
    if (w.bought) parts.push({ id: "water", label: "bought", amount: w.bought });
  }
  for (const way of WATER_WAYS) {
    const l = plan.list[way.id];
    if (!l || l.restock) continue;
    const n = way.fill ? l.filled ?? 0 : units(l, 0);
    if (n > 0) parts.push({ id: way.id, label: way.where, amount: n * way.gallons });
  }
  return parts;
}

/** Person-days of food a plan has: food in the house, the mix (each capped at its share), ration packs. */
export function foodParts(plan: Plan, target: number): Part[] {
  const f = plan.list["shelf-food"];
  const parts: Part[] = [];
  if (f && !f.restock) {
    if (f.have) parts.push({ id: "shelf-food", label: "in the house", amount: f.have });
    if (f.bought) parts.push({ id: "shelf-food", label: "bought", amount: f.bought });
  }
  for (const m of FOOD_MIX) {
    const n = units(plan.list[m.id], 0);
    if (n > 0) parts.push({ id: m.id, label: `from ${m.group.toLowerCase()}`, amount: Math.min(m.share * target, (n * m.share) / m.perDay) });
  }
  for (const k of FOOD_KITS) {
    const n = units(plan.list[k.id], 0);
    if (n > 0) parts.push({ id: k.id, label: "from ration packs", amount: n * k.days });
  }
  return parts;
}

export const total = (parts: Part[]) => parts.reduce((t, p) => t + p.amount, 0);

/** How to fill a water gap: cases of bottles, gallon jugs, or containers to fill from the tap. */
export function waterOptions(gallons: number) {
  const g = Math.max(0, gallons);
  return {
    cases: Math.ceil(g / (24 * WATER_WAYS[0].gallons)),
    jugs: Math.ceil(g),
    containers: Math.ceil(g / 7),
  };
}

/**
 * How much of each kind of food fills a gap of `days` person-days. Each kind can fill only its share of
 * `target`, so the gap is split over the room each kind has left: a kind already at its share drops out.
 */
export function foodMix(days: number, plan?: Plan, target = days): { id: string; group: string; qty: number; prep: Prep }[] {
  const room = FOOD_MIX.map((m) => {
    const had = plan ? Math.min(m.share * target, (units(plan.list[m.id], 0) * m.share) / m.perDay) : 0;
    return Math.max(0, m.share * target - had);
  });
  const free = room.reduce((t, r) => t + r, 0);
  const gap = Math.min(Math.max(0, days), free);
  return FOOD_MIX.map((m, i) => {
    const pd = free ? (gap * room[i]) / free : 0;
    return { id: m.id, group: m.group, prep: m.prep, qty: Math.ceil((pd * m.perDay) / m.share - 1e-9) };
  }).filter((m) => m.qty > 0);
}

/** Round for display: whole gallons and person-days, down, so nothing looks more stocked than it is. */
export const floor1 = (x: number) => Math.floor(x + 1e-9);
