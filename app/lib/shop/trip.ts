// The everyday shop (owner direction 2026-11-27): five answers — what you're getting ready for,
// a budget, what matters first, how many people and how many days — give what to check at home,
// what to buy this trip and what can wait, with real package counts.
//
// Rules:
//  - Amounts reuse the site's math. Water: 1 gallon per person per day, CDC's planning baseline.
//    Food: person-days of 2,000 label calories (ready/nutrition.ts), each kind capped at its share
//    so one food never stands in for a whole diet, and always called an estimate. Packages: each
//    product's own count (offers.ts), recounted whenever the product or its pack size changes.
//  - We have no prices from an authorized source. A cost is only the shopper's own number, per
//    package, and a trip with an unpriced item is never said to fit the budget.
//  - What the shopper has lowers what they need by exactly that amount. Nothing is marked bought
//    because a link was opened.
//  - An empty container is storage, not water, until the shopper says it's filled.
//  - The plan is stored as answers and edits, never as packages, so a product that leaves the
//    store or changes its pack size changes the suggestion, never the amount.

import { CALORIES_PER_DAY, labelFor } from "../ready/nutrition";
import { FOOD_MIX, GALLON_OZ } from "../ready/supplies";
import { suggest, withDays } from "../stockup/calc";
import { itemById } from "../stockup/catalog";
import type { CatalogItem, OccasionId, Plan } from "../stockup/types";
import { localNote } from "./local";
import { offerFor, packText, unitsEach, type Offer } from "./offers";
import { picksFor, primaryPick, type Pick } from "./picks";

export type TripFor = "outage" | "water-off" | "boil-water" | "pantry" | "household";
export type Focus = "water" | "food" | "light" | "paper" | "cleaning";
export type Group = Focus | "extra";
export type Battery = "AA" | "AAA" | "D" | "USB" | "unsure";
export type Stage = "now" | "later";
export type WaterBuy = "jugs" | "bottles";

export type Source = { label: string; href: string; read: string };

/** Official pages these steps restate (read on the date shown). */
export const SOURCES = {
  cdcStore: { label: "CDC: How to Create an Emergency Water Supply", href: "https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html", read: "2026-11-27" },
  cdcAdvisory: { label: "CDC: Drinking Water Advisories", href: "https://www.cdc.gov/water-emergency/about/drinking-water-advisories-an-overview.html", read: "2026-11-27" },
  cdcSafe: { label: "CDC: How to Make Water Safe in an Emergency", href: "https://www.cdc.gov/water-emergency/about/index.html", read: "2026-11-27" },
  power: { label: "Ready.gov: Power Outages", href: "https://www.ready.gov/power-outages", read: "2026-11-27" },
  food: { label: "Ready.gov: Food", href: "https://www.ready.gov/food", read: "2026-10-30" },
  help: { label: "211", href: "https://www.211.org/", read: "2026-11-27" },
} satisfies Record<string, Source>;

export type Situation = {
  id: TripFor;
  label: string;
  emoji: string;
  /** What can come first, in the default order (Ready.gov's kit order: water, food, light). */
  focus: Focus[];
  /** Catalog items that help, after the focus groups. Never first, never counted toward coverage. */
  extras: string[];
  /** What "Check what you have" asks. */
  checks: ("water" | "food" | "lights" | "battery")[];
  /** Occasion for catalog amounts (meals a day and such). */
  occasion: OccasionId;
  /** The full checklist for this situation (kits.ts). */
  kit: string;
  /** Our guide (guides.ts), when there is one. */
  guide?: string;
};

export const SITUATIONS: Situation[] = [
  { id: "outage", label: "Power outage", emoji: "🔌", focus: ["water", "food", "light"], extras: [], checks: ["water", "food", "lights", "battery"], occasion: "outage", kit: "power-outage", guide: "power-outage" },
  { id: "water-off", label: "Water shutoff", emoji: "💧", focus: ["water", "food"], extras: ["wet-wipes", "hand-sanitizer", "paper-plates", "trash-bags"], checks: ["water", "food"], occasion: "emergency", kit: "water-storage", guide: "emergency-water" },
  { id: "boil-water", label: "Boil-water notice", emoji: "🫖", focus: ["water", "food"], extras: ["paper-plates"], checks: ["water", "food"], occasion: "emergency", kit: "water-storage", guide: "emergency-water" },
  { id: "pantry", label: "Pantry restock", emoji: "🥫", focus: ["food", "water"], extras: [], checks: ["food", "water"], occasion: "home", kit: "two-week-pantry", guide: "emergency-food" },
  { id: "household", label: "Household supplies", emoji: "🧻", focus: ["paper", "cleaning", "light"], extras: [], checks: ["battery"], occasion: "home", kit: "household-restock" },
];

export const situationFor = (id: TripFor) => SITUATIONS.find((s) => s.id === id) ?? SITUATIONS[0];

export const FOCUS_LABEL: Record<Group, string> = {
  water: "Water", food: "Food", light: "Batteries & light", paper: "Paper goods", cleaning: "Soap & cleaning", extra: "Also useful",
};
export const FOCUS_EMOJI: Record<Group, string> = { water: "💧", food: "🥫", light: "🔦", paper: "🧻", cleaning: "🧼", extra: "➕" };

// ── The answers ──────────────────────────────────────────────────────────────

export type Ask = { for: TripFor; budget: number; first: Focus; people: number; days: number };

/** A fresh visit: a small, editable example. */
export const EXAMPLE: Ask = { for: "outage", budget: 25, first: "water", people: 2, days: 3 };
export const BUDGETS = [0, 10, 25, 50] as const;
export const MAX_TRIP_PEOPLE = 20;
export const MAX_TRIP_DAYS = 30;
export const MAX_BUDGET = 5000;

export type AtHome = {
  /** Gallons of safe drinking water already in the house. */
  water: number;
  /** Gallons of clean, empty jugs and containers: storage, not water, until filled. */
  space: number;
  /** The empty containers are filled with safe water. */
  filled: boolean;
  /** Days of food already in the house, for everyone. */
  foodDays: number;
  /** Flashlights, lanterns and headlamps that work. */
  lights: number;
  /** What those lights run on. */
  battery: Battery;
};

export const NOTHING_YET: AtHome = { water: 0, space: 0, filled: false, foodDays: 0, lights: 0, battery: "unsure" };

/** The shopper's own changes to one row, by row key. */
export type Edit = {
  /** How many of the item (in its own unit) they already have. */
  have?: number;
  /** The product they chose instead of ours (an ASIN in picks.ts). */
  pick?: string;
  /** This trip or a later one, set by the shopper. Unset follows the plan. */
  stage?: Stage;
  /** Buy it at a store nearby instead of on Amazon. */
  local?: boolean;
};

export type Trip = {
  ask: Ask;
  home: AtHome;
  edits: Record<string, Edit>;
  /** Prices the shopper typed, per package (priceKey). */
  prices: Record<string, number>;
  water: WaterBuy;
};

export const freshTrip = (ask: Ask = EXAMPLE): Trip => ({ ask, home: { ...NOTHING_YET }, edits: {}, prices: {}, water: "jugs" });

// ── Rows ─────────────────────────────────────────────────────────────────────

export type Row = {
  /** Stable key for edits: "water-jugs", "food-peanut-butter", "flashlights", "batteries-AAA", "toilet-paper". */
  key: string;
  group: Group;
  item: CatalogItem;
  /** What it is, in a few words. */
  label: string;
  /** The requirement, in the item's unit, before what the shopper has. */
  full: number;
  /** What the shopper has (their own number). */
  have: number;
  /** Left to buy, in the item's unit. */
  need: number;
  /** How the amount was worked out. */
  how: string;
  /** Every product for the row with its own package count for this need, the one used first. */
  offers: Offer[];
  /** The product the row uses on Amazon; null when we have no exact product. */
  offer: Offer | null;
  /** The shopper's product left the store, so the row went back to ours. */
  stale: boolean;
  /** Buy it nearby: the shopper's choice, or there is no exact product. */
  local: boolean;
  /** There is no exact product, so nearby is the only way here. */
  localOnly: boolean;
  /** Where a store nearby makes sense, in a sentence. */
  nearby: string | null;
  /** The Amazon pack is far more than needed (a case of 48 for 6 cans). */
  big: boolean;
  /** Packages for the whole need, as bought (Amazon packs, or packages nearby). */
  packs: number;
  /** Item units one package covers. */
  unitsPer: number;
  /** Product units wanted when the whole need is bought (for merging rows that share a product). */
  want: number;
  priceKey: string;
  /** The shopper's price per package, if they typed one. */
  price: number | null;
  /** They priced this product before at another pack size: the old price no longer applies. */
  repriced: boolean;
  /** Packages this trip and on later trips, after the budget. */
  now: number;
  later: number;
  /** The shopper moved it themselves. */
  pinned: Stage | null;
  /** In this trip unless the budget says otherwise. */
  first: boolean;
  /** A short line worth knowing (battery size, runtime, a pack-size check). */
  note: string | null;
};

const n = (x: number) => x.toLocaleString("en-US");
const plural = (k: number, one: string, many: string) => `${n(k)} ${k === 1 ? one : many}`;
const BOTTLE_GALLONS = 16.9 / GALLON_OZ;
const clampInt = (x: unknown, lo: number, hi: number, d: number) => {
  const v = typeof x === "number" ? x : typeof x === "string" && x.trim() !== "" ? Number(x) : NaN;
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : d;
};
const clampNum = (x: unknown, lo: number, hi: number, d: number) => {
  const v = typeof x === "number" ? x : typeof x === "string" && x.trim() !== "" ? Number(x) : NaN;
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
};

/** Words for k packages of a row: "12 jugs", "4 cases of 24", "1 pack of 12", "3 cans". */
export function packWords(r: Row, k: number): string {
  if (r.local || !r.offer) {
    const per = localPer(r.item, r.key);
    if (per > 1) return `${plural(k, r.item.id === "bottled-water" ? "case" : "pack", r.item.id === "bottled-water" ? "cases" : "packs")} of ${per}`;
    const one = r.item.id === "water" ? "one-gallon jug" : r.item.unit.one;
    const many = r.item.id === "water" ? "one-gallon jugs" : r.item.unit.many;
    return plural(k, one, many);
  }
  return packText({ ...r.offer, packs: k }, r.item);
}

/** Packages nearby: a case of 24 bottles, a typical pack for paper goods, otherwise one at a time. */
function localPer(item: CatalogItem, key: string): number {
  if (item.id === "bottled-water") return 24;
  if (key.startsWith("food-") || key.startsWith("batteries") || item.id === "water") return 1;
  return item.pack ?? 1;
}

/** Nearby lines for household goods (local.ts covers water and groceries). */
const HOUSEHOLD_NEARBY = new Set(["toilet-paper", "paper-towels", "kitchen-trash-bags-13-gallon", "trash-bags", "dish-soap", "hand-soap",
  "laundry-detergent", "disinfecting-wipes", "wet-wipes", "hand-sanitizer", "paper-plates", "batteries", "aaa-batteries", "d-batteries"]);

function nearbyFor(item: CatalogItem, need: number): string | null {
  const own = localNote(item.id, need);
  if (own) return own;
  if (HOUSEHOLD_NEARBY.has(item.id)) return "Any grocery, drug or dollar store has it.";
  if (item.id === "manual-can-opener") return "Grocery and dollar stores sell them.";
  return null;
}

/**
 * The product that buys the least: fewest packages, then fewest units in them; ties keep our order.
 * One 40 oz jar beats a 2-jar pack for one jar's worth; two 12-can cases of different soups tie,
 * so our pick stays.
 */
function leastExtra(list: Pick[], need: number): Pick | undefined {
  let best: Pick | undefined;
  let bestPacks = Infinity;
  let bestUnits = Infinity;
  for (const p of list) {
    const o = offerFor(p, need);
    if (o.packs < bestPacks || (o.packs === bestPacks && o.units < bestUnits)) { best = p; bestPacks = o.packs; bestUnits = o.units; }
  }
  return best;
}

type RowSpec = { key: string; group: Group; itemId: string; label?: string; full: number; how: string; note?: string | null; prefer?: string };

function makeRow(spec: RowSpec, trip: Trip): Row | null {
  const item = itemById(spec.itemId);
  if (!item) return null;
  const edit = trip.edits[spec.key] ?? {};
  const full = Math.max(0, Math.ceil(spec.full - 1e-9));
  const have = Math.min(full, clampInt(edit.have, 0, 1e6, 0));
  const need = Math.max(0, full - have);
  const list = picksFor(item.id);
  const chosen = edit.pick ? list.find((p) => p.asin === edit.pick) : undefined;
  const stale = !!edit.pick && !chosen;
  const preferred = spec.prefer ? list.find((p) => p.asin === spec.prefer) : undefined;
  const first = chosen ?? preferred ?? leastExtra(list, need) ?? primaryPick(item.id);
  const offers = first ? [first, ...list.filter((p) => p !== first)].map((p) => offerFor(p, need)) : [];
  const offer = offers[0] ?? null;
  const localOnly = !offer;
  const local = localOnly || edit.local === true;
  const lp = localPer(item, spec.key);
  const packs = need <= 0 ? 0 : local ? Math.ceil(need / lp - 1e-9) : offer!.packs;
  const unitsPer = local ? lp : offer ? offer.per * unitsEach(offer.pick) : 1;
  const want = !local && offer ? Math.ceil(need / unitsEach(offer.pick) - 1e-9) : need;
  const priceKey = local ? `l:${item.id}:${lp}` : `a:${offer!.pick.asin}:${offer!.per}`;
  const raw = trip.prices[priceKey];
  const price = typeof raw === "number" && Number.isFinite(raw) && raw >= 0 ? raw : null;
  const repriced = price == null && !local && !!offer && Object.keys(trip.prices).some((k) => k.startsWith(`a:${offer.pick.asin}:`) && k !== priceKey);
  const big = !local && !!offer && offer.per > 1 && need > 0 && offer.covers > need * 2 + 1e-9;
  return {
    key: spec.key, group: spec.group, item, label: spec.label ?? item.name, full, have, need, how: spec.how,
    offers, offer, stale, local, localOnly, nearby: nearbyFor(item, need), big, packs, unitsPer, want, priceKey, price, repriced,
    now: 0, later: 0, pinned: edit.stage ?? null, first: false, note: spec.note ?? null,
  };
}

// ── Water ────────────────────────────────────────────────────────────────────

/** Gallons of safe water at home: what's stored, plus the empty containers once filled. */
export const waterAtHome = (h: AtHome) => Math.max(0, h.water) + (h.filled ? Math.max(0, h.space) : 0);

function waterRows(trip: Trip): RowSpec[] {
  const { people, days } = trip.ask;
  const need = people * days;
  const gap = Math.max(0, need - waterAtHome(trip.home));
  const had = waterAtHome(trip.home);
  const how = `${plural(people, "person", "people")} × ${plural(days, "day", "days")} × 1 gallon (CDC) = ${plural(need, "gallon", "gallons")}${had > 0 ? `, less ${n(Math.round(had * 10) / 10)} you have` : ""}`;
  if (trip.water === "bottles") {
    return [{ key: "water-bottles", group: "water", itemId: "bottled-water", label: "Drinking water", full: Math.ceil(gap / BOTTLE_GALLONS - 1e-9), how }];
  }
  return [{ key: "water-jugs", group: "water", itemId: "water", label: "Drinking water", full: Math.ceil(gap - 1e-9), how }];
}

/** Gallons in item units of a water row. */
const gallonsOf = (r: Row, units: number) => (r.item.id === "bottled-water" ? units * BOTTLE_GALLONS : r.item.id === "water" ? units : 0);

// ── Food ─────────────────────────────────────────────────────────────────────

/** Foods that are easy to use up on a small trip come first; the full mix for bigger gaps. */
const BASKET_ORDER = ["canned-soups-and-stews", "peanut-butter", "pretzels-and-crackers", "canned-beans", "granola-or-protein-bars",
  "canned-fruit", "shelf-stable-milk", "canned-tuna-or-chicken", "canned-vegetables"];
const CANS = new Set(["canned-soups-and-stews", "canned-tuna-or-chicken", "canned-beans", "canned-vegetables", "canned-fruit"]);

/**
 * The foods for a gap of `pd` person-days, each with its share of the calories (FOOD_MIX shares,
 * spread over the kinds used). Up to 3 person-days: a canned meal, peanut butter and crackers.
 * Up to 10: add beans and bars. More: the whole Food & Water mix.
 */
export function basket(pd: number): { id: string; share: number }[] {
  const kinds = pd <= 3 ? 3 : pd <= 10 ? 5 : BASKET_ORDER.length;
  const ids = BASKET_ORDER.slice(0, kinds);
  const shares = ids.map((id) => FOOD_MIX.find((m) => m.id === id)!.share);
  const sum = shares.reduce((t, s) => t + s, 0);
  return ids.map((id, i) => ({ id, share: shares[i] / sum }));
}

/** Person-days at home: days of food times people. */
export const foodAtHome = (trip: Trip) => Math.max(0, trip.home.foodDays) * trip.ask.people;

function foodRows(trip: Trip): RowSpec[] {
  const { people, days } = trip.ask;
  const gap = Math.max(0, people * days - foodAtHome(trip));
  if (gap <= 1e-9) return [];
  const rows: RowSpec[] = [];
  for (const b of basket(gap)) {
    const label = labelFor(b.id)!;
    const units = Math.ceil((b.share * gap * CALORIES_PER_DAY) / label.kcal - 1e-9);
    const group = FOOD_MIX.find((m) => m.id === b.id)!.group;
    const kcal = units * label.kcal;
    rows.push({ key: `food-${b.id}`, group: "food", itemId: b.id, label: group, full: units, how: `About ${n(Math.round(kcal / 10) * 10)} calories by the label.` });
  }
  if (rows.some((r) => CANS.has(r.itemId))) {
    rows.splice(1, 0, { key: "can-opener", group: "food", itemId: "manual-can-opener", label: "Manual can opener", full: 1, how: "One for the house, for the cans." });
  }
  return rows;
}

/** Calorie share each food row may count toward (person-days), keyed by item id. */
function foodCaps(trip: Trip): Map<string, number> {
  const gap = Math.max(0, trip.ask.people * trip.ask.days - foodAtHome(trip));
  return new Map(basket(gap).map((b) => [b.id, b.share * gap]));
}

// ── Batteries and light ──────────────────────────────────────────────────────

/** What our flashlight picks run on. A test keeps every flashlight pick in here. */
export const LIGHT_POWER: Record<string, Battery> = { B0DBLB2TS5: "USB", B072WHQFJ7: "AAA" };
const BATTERY_ITEM: Record<"AA" | "AAA" | "D", string> = { AA: "batteries", AAA: "aaa-batteries", D: "d-batteries" };
/** Our planning rule: one spare set per light, 3 batteries a set (check yours); two sets past 3 days. */
export const PER_LIGHT = 3;
export const RUNTIME = "How long batteries last depends on the light and how you use it. Check its package or the maker's page.";

function lightRows(trip: Trip): RowSpec[] {
  const { people, days } = trip.ask;
  const home = trip.home;
  const rows: RowSpec[] = [];
  const lightsNeed = Math.max(0, people - Math.max(0, home.lights));
  const flashEdit = trip.edits.flashlights ?? {};
  const flashPicks = picksFor("flashlights");
  const prefer = home.battery === "AAA" ? flashPicks.find((p) => LIGHT_POWER[p.asin] === "AAA")?.asin : flashPicks.find((p) => LIGHT_POWER[p.asin] === "USB")?.asin;
  if (lightsNeed > 0) {
    rows.push({ key: "flashlights", group: "light", itemId: "flashlights", label: "Flashlights", full: lightsNeed, prefer,
      how: `One per person: ${plural(people, "person", "people")}${home.lights ? `, less ${n(home.lights)} that work` : ""}` });
  }
  const chosenLight = flashPicks.find((p) => p.asin === flashEdit.pick) ?? flashPicks.find((p) => p.asin === prefer) ?? flashPicks[0];
  const newPower = chosenLight ? LIGHT_POWER[chosenLight.asin] : undefined;
  const sets = days > 3 ? 2 : 1;
  const count: Record<"AA" | "AAA" | "D", number> = { AA: 0, AAA: 0, D: 0 };
  const homeType = home.battery === "unsure" ? "AA" : home.battery;
  if (homeType !== "USB" && home.lights > 0) count[homeType] += home.lights;
  if (lightsNeed > 0 && newPower === "AAA") count.AAA += lightsNeed - Math.min(lightsNeed, clampInt(flashEdit.have, 0, 1e6, 0));
  for (const t of ["AA", "AAA", "D"] as const) {
    if (!count[t]) continue;
    const full = count[t] * PER_LIGHT * sets;
    const unsure = t === "AA" && home.battery === "unsure";
    rows.push({ key: `batteries-${t}`, group: "light", itemId: BATTERY_ITEM[t], label: `${t} batteries`, full,
      how: `${plural(count[t], "light", "lights")} × ${PER_LIGHT} × ${plural(sets, "spare set", "spare sets")}`,
      note: unsure ? "Check the battery door first: we guessed AA. " + RUNTIME : RUNTIME });
  }
  rows.push({ key: "power-bank", group: "light", itemId: "power-bank", label: "Power bank", full: 1,
    how: "One for the house.", note: home.battery === "USB" || newPower === "USB" ? "Keeps USB lights and phones charged. Charge it now." : "For phones. Charge it now." });
  return rows;
}

// ── Household goods ──────────────────────────────────────────────────────────

const PAPER = ["toilet-paper", "paper-towels", "kitchen-trash-bags-13-gallon"];
const CLEANING = ["hand-soap", "dish-soap", "laundry-detergent", "disinfecting-wipes"];

/** A catalog item's amount for this household and length, with the catalog's arithmetic. */
function ruled(itemId: string, trip: Trip, occasion: OccasionId): { full: number; how: string; note?: string } {
  const item = itemById(itemId)!;
  const plan: Plan = withDays({ id: "trip", name: "", occasion, people: trip.ask.people, kids: 0, babies: 0, pets: 0, needs: [], climate: [],
    days: trip.ask.days, nights: trip.ask.days, meals: 3, start: "", created: 0, updated: 0, list: {} }, trip.ask.days);
  const s = suggest(item, plan);
  return { full: s.qty, how: s.how, note: item.note };
}

function itemRows(ids: string[], group: Group, trip: Trip, occasion: OccasionId): RowSpec[] {
  return ids.filter((id) => itemById(id)).map((id) => {
    const r = ruled(id, trip, occasion);
    return { key: id, group, itemId: id, full: r.full, how: r.how, note: r.note ?? null };
  });
}

function householdBatteries(trip: Trip): RowSpec[] {
  const t = trip.home.battery === "AAA" || trip.home.battery === "D" ? trip.home.battery : "AA";
  const r = ruled("batteries", trip, "home");
  return [{ key: `batteries-${t}`, group: "light", itemId: BATTERY_ITEM[t], label: `${t} batteries`, full: r.full, how: r.how,
    note: trip.home.battery === "unsure" ? "Check what your remotes, lights and smoke alarms take. We guessed AA." : "Check the size each device takes." }];
}

// ── The plan ─────────────────────────────────────────────────────────────────

export type Step = { text: string; source?: Source };
export type Link = { label: string; href: string; official?: boolean };

export type Coverage = {
  /** Gallons, or person-days. */
  need: number;
  /** Before this trip. */
  now: number;
  /** After this trip. */
  after: number;
  /** Whole days covered after this trip (never more than the plan's days). */
  days: number;
  /** Whole days covered before this trip. */
  daysNow: number;
};

export type TripPlan = {
  ask: Ask;
  situation: Situation;
  /** Groups in priority order: the shopper's first, then the rest, then extras. */
  order: Group[];
  rows: Row[];
  budget: {
    amount: number;
    /** Sum of priced packages this trip. */
    known: number;
    /** Rows this trip without a price. */
    unpriced: number;
    left: number;
    over: number;
    /** true / false only when every row this trip has a price; null when we can't tell. */
    fits: boolean | null;
  };
  water: Coverage | null;
  food: Coverage | null;
  light: { have: number; after: number; people: number } | null;
  checks: Step[];
  store: Step[];
  links: Link[];
};

const ORDER: Focus[] = ["water", "food", "light", "paper", "cleaning"];

/** The shopper's first choice, then the situation's other groups in Ready.gov's order, then extras. */
export function groupOrder(s: Situation, first: Focus): Group[] {
  const f = s.focus.includes(first) ? first : s.focus[0];
  const rest = ORDER.filter((g) => g !== f && s.focus.includes(g));
  return [f, ...rest, ...(s.extras.length ? (["extra"] as const) : [])];
}

/** Keep answers in range and the first choice one the situation offers. */
export function cleanAsk(a: Partial<Ask> | null | undefined): Ask {
  const x = (a ?? {}) as Record<string, unknown>;
  const s = SITUATIONS.find((v) => v.id === x.for) ?? situationFor(EXAMPLE.for);
  const first = (typeof x.first === "string" && s.focus.includes(x.first as Focus) ? x.first : s.focus[0]) as Focus;
  return {
    for: s.id, first,
    budget: clampInt(x.budget, 0, MAX_BUDGET, EXAMPLE.budget),
    people: clampInt(x.people, 1, MAX_TRIP_PEOPLE, EXAMPLE.people),
    days: clampInt(x.days, 1, MAX_TRIP_DAYS, EXAMPLE.days),
  };
}

/** Fill this trip in priority order with what the budget covers at the shopper's own prices. */
export function fitBudget(rows: Row[], amount: number): TripPlan["budget"] {
  let left = amount;
  let known = 0;
  let unpriced = 0;
  for (const r of rows) {
    r.now = 0;
    r.later = r.packs;
    if (r.packs <= 0) continue;
    const want = r.pinned ? r.pinned === "now" : r.first && amount > 0;
    if (!want) continue;
    if (r.price == null) { r.now = r.packs; r.later = 0; unpriced += 1; continue; }
    const fits = r.price <= 0 ? r.packs : Math.floor((Math.max(0, left) + 1e-9) / r.price);
    r.now = r.pinned === "now" ? r.packs : Math.min(r.packs, fits);
    r.later = r.packs - r.now;
    known += r.now * r.price;
    left -= r.now * r.price;
  }
  // With money left and every row this trip priced, bring priced rows forward, most important first.
  if (unpriced === 0 && left > 1e-9) {
    for (const r of rows) {
      if (r.pinned === "later" || r.later <= 0 || r.price == null || amount <= 0) continue;
      const k = r.price <= 0 ? r.later : Math.min(r.later, Math.floor((left + 1e-9) / r.price));
      if (k <= 0) continue;
      r.now += k;
      r.later -= k;
      known += k * r.price;
      left -= k * r.price;
    }
  }
  const round = (x: number) => Math.round(x * 100) / 100;
  return { amount, known: round(known), unpriced, left: round(Math.max(0, left)), over: round(Math.max(0, -left)), fits: unpriced ? null : known <= amount + 1e-9 };
}

export function planTrip(trip: Trip): TripPlan {
  const ask = cleanAsk(trip.ask);
  const t: Trip = { ...trip, ask };
  const situation = situationFor(ask.for);
  const order = groupOrder(situation, ask.first);
  const specs: RowSpec[] = [];
  for (const g of order) {
    if (g === "water") specs.push(...waterRows(t));
    else if (g === "food") specs.push(...foodRows(t));
    else if (g === "light") specs.push(...(ask.for === "household" ? householdBatteries(t) : lightRows(t)));
    else if (g === "paper") specs.push(...itemRows(PAPER, "paper", t, situation.occasion));
    else if (g === "cleaning") specs.push(...itemRows(CLEANING, "cleaning", t, situation.occasion));
    else specs.push(...itemRows(situation.extras, "extra", t, situation.occasion));
  }
  const rows = specs.map((s) => makeRow(s, t)).filter((r): r is Row => !!r && r.full > 0);
  for (const r of rows) r.first = r.group === order[0];
  const budget = fitBudget(rows, ask.budget);

  const hasWater = situation.focus.includes("water");
  const hasFood = situation.focus.includes("food");
  const waterHave = waterAtHome(t.home);
  const waterAfter = waterHave + rows.filter((r) => r.group === "water").reduce((s, r) => s + gallonsOf(r, r.have + r.now * r.unitsPer), 0);
  const per = (x: number, people: number) => Math.floor(x / people + 1e-9);
  const water: Coverage | null = hasWater
    ? { need: ask.people * ask.days, now: waterHave, after: waterAfter, days: Math.min(ask.days, per(waterAfter, ask.people)), daysNow: Math.min(ask.days, per(waterHave, ask.people)) }
    : null;

  const caps = foodCaps(t);
  const foodHave = foodAtHome(t);
  const foodFrom = (r: Row, units: number) => {
    const label = labelFor(r.item.id);
    return label ? Math.min(caps.get(r.item.id) ?? 0, (units * label.kcal) / CALORIES_PER_DAY) : 0;
  };
  const foodRowsHere = rows.filter((r) => r.group === "food" && r.key.startsWith("food-"));
  const foodNow = foodHave + foodRowsHere.reduce((s, r) => s + foodFrom(r, r.have), 0);
  const foodAfter = foodHave + foodRowsHere.reduce((s, r) => s + foodFrom(r, r.have + r.now * r.unitsPer), 0);
  const food: Coverage | null = hasFood
    ? { need: ask.people * ask.days, now: foodNow, after: foodAfter, days: Math.min(ask.days, per(foodAfter, ask.people)), daysNow: Math.min(ask.days, per(foodNow, ask.people)) }
    : null;

  const flash = rows.find((r) => r.key === "flashlights");
  const lightsHave = Math.max(0, t.home.lights) + (flash ? flash.have : 0);
  const light = ask.for !== "household" && situation.focus.includes("light")
    ? { have: lightsHave, after: lightsHave + (flash ? flash.now * flash.unitsPer : 0), people: ask.people }
    : null;

  return { ask, situation, order, rows, budget, water, food, light, checks: checksFor(t, situation), store: storeFor(situation), links: linksFor(situation, ask) };
}

/** Rows with packages this trip, and rows with packages left for later (a partial row is in both). */
export const thisTrip = (p: TripPlan) => p.rows.filter((r) => r.now > 0);
export const laterTrips = (p: TripPlan) => p.rows.filter((r) => r.later > 0);
export const covered = (p: TripPlan) => p.rows.filter((r) => r.need === 0 && r.have > 0);

// ── Words ────────────────────────────────────────────────────────────────────

/** "You'll have water for 2 of your 3 days." */
export function coverageLine(kind: "water" | "food", c: Coverage, days: number): string {
  const what = kind === "water" ? "water" : "food";
  const est = kind === "food" ? "about " : "";
  if (c.days >= days) return days === 1 ? `You’ll have ${what} for your 1 day.` : `You’ll have ${what} for ${est}all ${n(days)} days.`;
  if (c.days <= 0) return c.after > 0 ? `Not quite 1 day of ${what} yet.` : `No ${what} counted yet.`;
  return `You’ll have ${what} for ${est}${n(c.days)} of your ${n(days)} days.`;
}

/** One line for the budget, never saying an unpriced trip fits. */
export function budgetLine(p: TripPlan): string {
  const b = p.budget;
  const money = (x: number) => `$${x.toLocaleString("en-US", { minimumFractionDigits: x % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const items = thisTrip(p).length;
  if (b.amount <= 0 && !items) return "A $0 trip: start with step 1, what’s free.";
  if (!items) return "Nothing to buy this trip.";
  if (b.unpriced) {
    const priced = b.known > 0 ? `Priced so far: ${money(b.known)} of ${money(b.amount)}. ` : "";
    return `${priced}${plural(b.unpriced, "item has", "items have")} no price yet, so we can’t tell if it fits ${money(b.amount)}. Add the price you see.`;
  }
  if (b.over > 0) return `This trip: ${money(b.known)}. That’s ${money(b.over)} over your ${money(b.amount)}.`;
  return `This trip: ${money(b.known)} of your ${money(b.amount)}${b.left > 0 ? `, ${money(b.left)} left` : ""}.`;
}

function checksFor(t: Trip, s: Situation): Step[] {
  const h = t.home;
  const steps: Step[] = [];
  const space = h.space > 0 && !h.filled;
  if (s.id === "outage") {
    steps.push({ text: "Charge phones and power banks now." });
    steps.push({ text: "Count the lights that work. Check what batteries each one takes." });
    steps.push({ text: "Keep the fridge and freezer closed. A fridge keeps food cold about 4 hours, a full freezer about 48.", source: SOURCES.power });
    steps.push({ text: "Generators, grills and camp stoves go outdoors only, at least 20 feet from windows and doors.", source: SOURCES.power });
    steps.push({ text: space ? `Fill your empty jugs (${n(h.space)} gallons) with tap water while it runs.` : "Fill clean jugs or pitchers with tap water while it runs." });
  } else if (s.id === "water-off") {
    steps.push({ text: space ? `Before it shuts off, fill your empty jugs (${n(h.space)} gallons) with tap water.` : "Before it shuts off, fill clean jugs, pots and bottles with tap water." });
    steps.push({ text: "Fill the bathtub for flushing toilets. Don’t drink it." });
    steps.push({ text: "Plan on 1 gallon per person per day for drinking, cooking and brushing teeth.", source: SOURCES.cdcStore });
  } else if (s.id === "boil-water") {
    steps.push({ text: "Follow your local notice. Use bottled water or boiled tap water to drink, cook and brush teeth.", source: SOURCES.cdcAdvisory });
    steps.push({ text: "To boil: a full rolling boil for 1 minute (3 minutes above 6,500 feet). Let it cool.", source: SOURCES.cdcAdvisory });
    steps.push({ text: space ? `Store boiled water in your clean jugs (${n(h.space)} gallons) with tight lids.` : "Store boiled water in clean containers with tight lids.", source: SOURCES.cdcSafe });
    steps.push({ text: "Don’t use the fridge’s water or ice dispenser.", source: SOURCES.cdcAdvisory });
  } else if (s.id === "pantry") {
    steps.push({ text: "Check the pantry first. Count the meals you could make now." });
    steps.push({ text: "Use what’s closest to its date first." });
    steps.push({ text: "Call 211 or visit 211.org to find food programs near you.", source: SOURCES.help });
  } else {
    steps.push({ text: "Check under the sinks and in the closets first." });
    steps.push({ text: "Buy what you’ll run out of first." });
  }
  return steps;
}

function storeFor(s: Situation): Step[] {
  const steps: Step[] = [];
  if (s.focus.includes("water")) {
    steps.push({ text: "Keep store-bought water sealed, somewhere cool and dark, and check its date.", source: SOURCES.cdcStore });
    steps.push({ text: "Replace water you fill yourself every 6 months.", source: SOURCES.cdcStore });
  }
  if (s.focus.includes("food")) {
    steps.push({ text: "New cans go to the back. Use from the front, and replace anything past its date." });
  }
  if (s.focus.includes("light")) {
    steps.push({ text: "Keep spare batteries in their package, next to the lights. One battery size for everything makes spares easy." });
  }
  if (s.id === "household") steps.push({ text: "Keep one spare of each, and add it to the next trip when you open it." });
  steps.push({ text: "When you buy something, add it under Have. The next trip shows only what’s left." });
  return steps;
}

function linksFor(s: Situation, a: Ask): Link[] {
  const links: Link[] = [{ label: `Full checklist: ${s.label.toLowerCase()}`, href: `/kits/${s.kit}?people=${a.people}&days=${a.days}` }];
  if (s.guide) links.push({ label: s.guide === "power-outage" ? "Guide: what to buy for an outage" : s.guide === "emergency-food" ? "Guide: emergency food" : "Guide: how much water to store", href: `/guides/${s.guide}` });
  if (s.focus.includes("food") || s.focus.includes("water")) links.push({ label: "Food & Water for bigger plans", href: `/food-water?people=${a.people}&days=${Math.max(3, a.days)}` });
  if (s.id === "outage") links.push({ label: SOURCES.power.label, href: SOURCES.power.href, official: true });
  if (s.id === "water-off") links.push({ label: SOURCES.cdcStore.label, href: SOURCES.cdcStore.href, official: true });
  if (s.id === "boil-water") links.push({ label: SOURCES.cdcAdvisory.label, href: SOURCES.cdcAdvisory.href, official: true }, { label: SOURCES.cdcSafe.label, href: SOURCES.cdcSafe.href, official: true });
  if (s.id === "pantry") links.push({ label: SOURCES.food.label, href: SOURCES.food.href, official: true });
  links.push({ label: "All emergency checklists", href: "/checklist" });
  return links;
}

// ── Saving on this device, and links ─────────────────────────────────────────

export const TRIP_KEY = "pbr:trip:v1";

/** A stored trip, cleaned field by field; anything unreadable falls back. */
export function parseTrip(raw: unknown): Trip | null {
  if (!raw || typeof raw !== "object") return null;
  const x = raw as Record<string, unknown>;
  const ask = cleanAsk(x.ask as Partial<Ask>);
  const h = (x.home && typeof x.home === "object" ? x.home : {}) as Record<string, unknown>;
  const battery = (["AA", "AAA", "D", "USB", "unsure"] as const).find((b) => b === h.battery) ?? "unsure";
  const home: AtHome = {
    water: clampNum(h.water, 0, 10000, 0), space: clampNum(h.space, 0, 10000, 0), filled: h.filled === true,
    foodDays: clampInt(h.foodDays, 0, 365, 0), lights: clampInt(h.lights, 0, 100, 0), battery,
  };
  const edits: Record<string, Edit> = {};
  if (x.edits && typeof x.edits === "object") {
    for (const [k, v] of Object.entries(x.edits as Record<string, unknown>)) {
      if (!v || typeof v !== "object" || k.length > 60) continue;
      const e = v as Record<string, unknown>;
      const out: Edit = {};
      if (e.have !== undefined) out.have = clampInt(e.have, 0, 1e6, 0);
      if (typeof e.pick === "string" && /^[A-Z0-9]{10}$/.test(e.pick)) out.pick = e.pick;
      if (e.stage === "now" || e.stage === "later") out.stage = e.stage;
      if (e.local === true) out.local = true;
      if (Object.keys(out).length) edits[k] = out;
    }
  }
  const prices: Record<string, number> = {};
  if (x.prices && typeof x.prices === "object") {
    for (const [k, v] of Object.entries(x.prices as Record<string, unknown>)) {
      if (k.length <= 60 && typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 10000) prices[k] = Math.round(v * 100) / 100;
    }
  }
  return { ask, home, edits, prices, water: x.water === "bottles" ? "bottles" : "jugs" };
}

/** Answers from a link: /?for=outage&budget=25&first=water&people=4&days=3. Null when the link has none. */
export function askFromQuery(search: string, base: Ask = EXAMPLE): Ask | null {
  const q = new URLSearchParams(search);
  if (!["for", "budget", "first", "people", "days"].some((k) => q.has(k))) return null;
  const s = SITUATIONS.find((v) => v.id === q.get("for"));
  return cleanAsk({
    for: s?.id ?? base.for,
    first: (q.get("first") as Focus) ?? (s ? s.focus[0] : base.first),
    budget: q.has("budget") ? Number(q.get("budget")) : base.budget,
    people: q.has("people") ? Number(q.get("people")) : base.people,
    days: q.has("days") ? Number(q.get("days")) : base.days,
  });
}

export const tripQuery = (a: Ask) => `?for=${a.for}&budget=${a.budget}&first=${a.first}&people=${a.people}&days=${a.days}`;

/** A changed answer keeps edits and prices; a changed situation keeps the first choice only if it fits. */
export function withAsk(trip: Trip, patch: Partial<Ask>): Trip {
  const next = { ...trip.ask, ...patch };
  if (patch.for && patch.for !== trip.ask.for && !patch.first) {
    const s = situationFor(patch.for);
    next.first = s.focus.includes(trip.ask.first) ? trip.ask.first : s.focus[0];
  }
  return { ...trip, ask: cleanAsk(next) };
}

export function withEdit(trip: Trip, key: string, patch: Partial<Edit>): Trip {
  const cur = { ...(trip.edits[key] ?? {}), ...patch };
  const clean: Edit = {};
  if (cur.have !== undefined && cur.have > 0) clean.have = Math.round(cur.have);
  if (cur.pick) clean.pick = cur.pick;
  if (cur.stage) clean.stage = cur.stage;
  if (cur.local) clean.local = true;
  const edits = { ...trip.edits };
  if (Object.keys(clean).length) edits[key] = clean;
  else delete edits[key];
  return { ...trip, edits };
}

export function withPrice(trip: Trip, key: string, price: number | null): Trip {
  const prices = { ...trip.prices };
  if (price == null || !Number.isFinite(price) || price < 0) delete prices[key];
  else prices[key] = Math.round(Math.min(price, 10000) * 100) / 100;
  return { ...trip, prices };
}
