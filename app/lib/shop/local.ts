// Things a nearby store does better than a delivery: heavy water, groceries,
// ice and food for the day of. Shown beside the Amazon links as a plain
// sentence, never instead of them. `first`: a nearby store is the practical
// way to buy it, so the card says so before the Amazon search.

import { FOOD_MIX } from "../ready/supplies";

const n = (x: number) => x.toLocaleString("en-US");
const plural = (k: number, one: string, many: string) => `${n(k)} ${k === 1 ? one : many}`;

type Local = { text: (need: number) => string; first?: boolean };

const GROCERY: Local = { text: () => "Any grocery store has it too, in the same amounts." };

export const LOCAL: Record<string, Local> = {
  water: { text: (g) => (g > 0 ? `Or nearby: ${plural(g, "one-gallon jug", "one-gallon jugs")}, or ${plural(Math.ceil(g / 6), "six-pack", "six-packs")} of jugs, at any grocery store.` : "Or nearby: any grocery store sells gallon jugs.") },
  "bottled-water": { text: (b) => (b > 0 ? `Or nearby: ${plural(Math.ceil(b / 24), "case", "cases")} of 24 at any grocery store.` : "Or nearby: any grocery store sells cases of bottled water.") },
  ...Object.fromEntries(FOOD_MIX.map((m) => [m.id, GROCERY])),
  ice: { text: () => "Buy it the day you need it: grocery stores and gas stations sell bagged ice.", first: true },
  pizza: { text: () => "Order from a local pizzeria, or pick up frozen pizzas at a grocery store.", first: true },
  "birthday-cake-or-cupcakes": { text: () => "A grocery store bakery or a local bakery. Order a few days ahead.", first: true },
  "ice-cream": { text: () => "Any grocery store, the day of the party.", first: true },
  "propane-canisters": { text: () => "Hardware, camping and big-box stores sell 1 lb propane cylinders.", first: true },
  chips: { text: () => "Any grocery store has them." },
  "juice-boxes": { text: () => "Any grocery store has them." },
};

/** The nearby-store sentence for an item and amount, if a store nearby is a practical way to buy it. */
export const localNote = (itemId: string, need: number): string | null => LOCAL[itemId]?.text(need) ?? null;

/** True when a nearby store is the practical way to buy it (ice, pizza, cake). */
export const localFirst = (itemId: string) => LOCAL[itemId]?.first === true;
