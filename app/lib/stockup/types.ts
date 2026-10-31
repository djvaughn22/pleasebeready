// Stock-up planner types. Data (catalog.ts, sources.ts) and math (calc.ts)
// share these; nothing here touches React or the browser.

export type OccasionId =
  | "home" | "emergency" | "camping" | "sleepover" | "party" | "roadtrip"
  | "vacation" | "beach" | "tailgate" | "hosting" | "picnic"
  | "outage" | "winter" | "hurricane" | "heat" | "wildfire" | "flood" | "vehicle"
  | "school" | "college" | "work" | "moving" | "sick" | "newbaby" | "caregiving"
  | "petprep" | "hiking" | "sports";

export type CategoryId =
  | "water" | "food" | "drinks" | "dining" | "cooking" | "paper" | "cleaning"
  | "toiletries" | "health" | "power" | "sleep" | "outdoors" | "fun" | "baby"
  | "pets" | "party" | "travel" | "safety" | "weather" | "tools" | "car"
  | "school" | "access" | "moving" | "tasks";

/** Who an item serves; items with one only show when the plan has that need. */
export type Need = "kids" | "babies" | "pets" | "older" | "mobility" | "medical";

export type Climate = "cold" | "hot" | "wet";

export type Season = "year-round" | "seasonal" | "event";

/** essential: most plans of this kind need it. useful: often worth having. extra: nice if it fits. */
export type Priority = "essential" | "useful" | "extra";

/** What one unit of the item is counted against. Plans count everyone in `people`;
 *  kids and babies are part of that total. */
export type Per =
  | "group"        // n for the whole group
  | "person" | "adult" | "kid" | "baby" | "pet"
  | "personDay" | "kidDay" | "babyDay" | "petDay"
  | "personNight"
  | "personMeal"   // people × days × meals a day
  | "varies"       // depends on things we cannot count; `note` explains
  | "task";        // something to do, not to buy

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
  /** product: something to buy. task: something to do, never shown with a Shop link. */
  kind: "product" | "task";
  /** Only shown when the plan has this need. */
  needs?: Need;
  /** Only suggested when the plan's weather includes this (or the situation implies it). */
  climate?: Climate;
  /** year-round, seasonal, or tied to one event. */
  season: Season;
  /** Follow a doctor's, vet's or official guidance for this one. */
  pro?: boolean;
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
  /** Weather this situation brings with it. */
  implies?: Climate[];
  /** Group in the occasion picker. */
  group: "Everyday" | "Events and trips" | "Weather and emergencies" | "Life changes";
};

export type Line = {
  /** null follows the suggestion; a number is the visitor's own amount. */
  qty: number | null;
  /** How many the visitor already has. */
  have: number;
  /** Marked as bought. */
  got: boolean;
  /** Bought and put where it belongs (the kit is packed, the shelf is stocked). */
  ready?: boolean;
  /** Used up or expired: needs buying again. */
  restock?: boolean;
  /** The visitor's own note, such as a size, a brand or who is buying it. */
  note?: string;
};

export type Plan = {
  id: string;
  name: string;
  occasion: OccasionId;
  people: number;
  kids: number;
  babies: number;
  pets: number;
  /** Extra needs in the group (older adults, mobility, medical). */
  needs: Need[];
  /** Expected weather. */
  climate: Climate[];
  days: number;
  nights: number;
  meals: number;
  /** ISO date (yyyy-mm-dd) or empty. */
  start: string;
  created: number;
  updated: number;
  /** Items on the stock-up list, by catalog id. */
  list: Record<string, Line>;
  /** A note for the whole list. */
  note?: string;
  /** The kit this list was started from, if any (kits.ts slug). */
  kit?: string;
};

export type Suggestion = {
  item: CatalogItem;
  /** Suggested amount for this plan; 0 for tasks. */
  qty: number;
  /** The arithmetic behind qty, in words. */
  how: string;
  /** Packs to buy when the item has a pack size. */
  packs: number | null;
};
