// What to buy for one line, product by product.
//
// A list line holds the requirement in the catalog item's own unit: 28 gallons,
// 213 bottles, 13 cans. Each product we picked is an offer that fills it in its
// own packages, so a swap keeps the requirement and recounts the packages: for
// 28 gallons, a 6-pack of gallon jugs is 5 packs and a single jug is 28 jugs.
//
// Food is counted by label calories (ready/nutrition.ts). A product with a
// label of its own is recounted by calories: 25 cans of tuna (90 calories each)
// are 15 cans of chicken (160 each). Without one, a unit of the product counts
// as one unit of the item.
//
// The list never stores packages, only the requirement and, when the visitor
// swaps, the product they chose (Line.pick). So a product leaving the store
// changes the suggestion, never the amount or what was bought.

import { labelFor, labelForAsin } from "../ready/nutrition";
import type { CatalogItem } from "../stockup/types";
import { picksFor, primaryPick, type Pick } from "./picks";

/** Units of the catalog item that one unit of this product counts as. */
export function unitsEach(p: Pick): number {
  const base = labelFor(p.item);
  const own = labelForAsin(p.asin);
  return base && own && base.kcal > 0 ? own.kcal / base.kcal : 1;
}

export type Offer = {
  pick: Pick;
  /** Packages to buy (0 when nothing is needed). */
  packs: number;
  /** Units of this product in one package. */
  per: number;
  /** Units of this product in those packages. */
  units: number;
  /** How much of the requirement those packages cover, in the item's unit. */
  covers: number;
  /** True when this product's units differ in size from the item's (counted by calories). */
  recounted: boolean;
};

/** Packages of one product that cover `need` units of its catalog item. */
export function offerFor(p: Pick, need: number): Offer {
  const per = p.count ?? 1;
  const each = unitsEach(p);
  const want = need > 0 ? Math.ceil(need / each - 1e-9) : 0;
  const packs = Math.ceil(want / per - 1e-9);
  return { pick: p, packs, per, units: packs * per, covers: packs * per * each, recounted: Math.abs(each - 1) > 1e-9 };
}

/** The product a line opens: the visitor's choice while we still list it, else our pick. */
export function chosenPick(itemId: string, chosen?: string): Pick | undefined {
  return (chosen ? picksFor(itemId).find((p) => p.asin === chosen) : undefined) ?? primaryPick(itemId);
}

/** A line that names a product we no longer list (it left after a listing check). */
export const staleChoice = (itemId: string, chosen?: string) => !!chosen && !picksFor(itemId).some((p) => p.asin === chosen);

/** Every product for an item with its own package count, the chosen one (else our pick) first. */
export function offersFor(itemId: string, need: number, chosen?: string): Offer[] {
  const first = chosenPick(itemId, chosen);
  if (!first) return [];
  return [first, ...picksFor(itemId).filter((p) => p !== first)].map((p) => offerFor(p, need));
}

const n = (x: number) => x.toLocaleString("en-US");

/** "5 packs of 6", "9 cases of 24", "28 jugs", "1 can opener". */
export function packText(o: Offer, item: CatalogItem): string {
  if (o.per <= 1) {
    const one = o.pick.each ?? item.unit.one;
    const many = o.pick.each ? `${o.pick.each}s` : item.unit.many;
    return `${n(o.packs)} ${o.packs === 1 ? one : many}`;
  }
  const word = item.cat === "water" ? "case" : "pack";
  return `${n(o.packs)} ${o.packs === 1 ? word : `${word}s`} of ${o.per}`;
}

/** What the packages hold, when that isn't obvious from packText: "48 cans", "15 cans, counted by calories". */
export function holdsText(o: Offer, item: CatalogItem): string {
  const unit = o.units === 1 ? item.unit.one : item.unit.many;
  if (o.recounted) return `${n(o.units)} ${unit}, counted by calories`;
  return o.per > 1 ? `${n(o.units)} ${unit}` : "";
}
