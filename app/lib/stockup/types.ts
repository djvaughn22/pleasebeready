// Stock-up planner types. Data (catalog.ts, sources.ts) and math (calc.ts)
// share these; nothing here touches React or the browser.

export type OccasionId =
  | "home" | "emergency" | "camping" | "sleepover" | "party" | "roadtrip"
  | "vacation" | "beach" | "tailgate" | "hosting" | "picnic";

export type CategoryId =
  | "water" | "food" | "drinks" | "dining" | "cooking" | "paper" | "cleaning"
  | "toiletries" | "health" | "power" | "sleep" | "outdoors" | "fun" | "baby"
  | "pets" | "party" | "travel" | "safety";

/** essential: most plans of this kind need it. useful: often worth having. extra: nice if it fits. */
export type Priority = "essential" | "useful" | "extra";

/** What one unit of the item is counted against. Plans count everyone in `people`;
 *  kids and babies are part of that total. */
export type Per =
  | "group"        // n for the whole group
  | "person" | "adult" | "kid" | "baby" | "pet"
  | "personDay" | "kidDay" | "babyDay" | "petDay"
  | "personNight"
  | "personMeal";  // people × days × meals a day

export type Rule = { per: Per; n: number };

export type Unit = { one: string; many: string };

export type SourceId =
  | "rc-kit" | "rg-kit" | "rg-water" | "rg-food" | "rg-power" | "rg-pets"
  | "rg-disability" | "rg-older" | "rg-plan" | "rg-financial" | "rg-winter"
  | "rg-evacuation" | "cdc-water";

export type Source = {
  id: SourceId;
  agency: string;
  title: string;
  href: string;
  /** The date this site last read the page (ISO). */
  checked: string;
  /** The "Last updated" date the page itself shows, when it shows one. */
  pageUpdated?: string;
};

export type CatalogItem = {
  id: string;
  name: string;
  cat: CategoryId;
  /** Occasions this item is suggested for. */
  occ: OccasionId[];
  rule: Rule;
  unit: Unit;
  pri: Priority;
  /** Only shown when the plan has kids, babies or pets. */
  needs?: "kids" | "babies" | "pets";
  /** Sold in packs of this many units; the list shows the pack count too. */
  pack?: number;
  /** One short line on the planning rule or a practical tip. */
  note?: string;
  /** Set only when the amount itself comes from this source. */
  source?: SourceId;
  /** A title-verified ASIN that already lives in readiness.ts gear. */
  asin?: string;
  /** Amazon search words when there is no verified product (defaults to the name). */
  q?: string;
};

export type Occasion = {
  id: OccasionId;
  emoji: string;
  label: string;
  hint: string;
  /** Starting values for a new plan; all editable. */
  days: number;
  nights: number;
  meals: number;
  /** Suggested plan name. */
  name: string;
};

export type Line = {
  /** null follows the suggestion; a number is the visitor's own amount. */
  qty: number | null;
  /** How many the visitor already has. */
  have: number;
  /** Marked as bought. */
  got: boolean;
};

export type Plan = {
  id: string;
  name: string;
  occasion: OccasionId;
  people: number;
  kids: number;
  babies: number;
  pets: number;
  days: number;
  nights: number;
  meals: number;
  /** ISO date (yyyy-mm-dd) or empty. */
  start: string;
  created: number;
  updated: number;
  /** Items on the stock-up list, by catalog id. */
  list: Record<string, Line>;
};

export type Suggestion = {
  item: CatalogItem;
  /** Suggested amount for this plan. */
  qty: number;
  /** The arithmetic behind qty, in words. */
  how: string;
  /** Packs to buy when the item has a pack size. */
  packs: number | null;
};
