// Food & Water: the fast shopping path. Two answers (people, days) give a
// ready-to-buy bundle of drinking water and practical groceries, with package
// counts. The amounts come from the same readiness math as Get Ready
// (engine.ts + supplies.ts): 1 gallon per person per day, food in person-days,
// the grocery mix with each kind capped at its share.
//
// What the household already has comes from one list only, so nothing is
// counted twice: the saved Food & Water list if there is one, else the Get
// Ready plan. Empty containers never count as water.
//
// Amazon has no multi-item cart link in its current Associates tools (the
// Creators API is lookup and search only), so each row opens one product page.

import { currentGuided, readiness } from "./engine";
import { labelFor } from "./nutrition";
import { FOOD_KITS, FOOD_MIX, WATER_WAYS, foodMix, total, units, waterParts } from "./supplies";
import { picksFor, primaryPick, type Pick } from "../shop/picks";
import { withDays } from "../stockup/calc";
import { itemById } from "../stockup/catalog";
import { newPlan } from "../stockup/storage";
import type { Line, Plan } from "../stockup/types";

export const PEOPLE = [1, 2, 3, 4, 5];
export const DAYS = [3, 5, 7, 14, 30];
export const MAX_FW_PEOPLE = 50;
export const MAX_FW_DAYS = 365;

/** The saved Food & Water list carries this in `kit` (not a kits.ts slug). */
export const FOOD_WATER = "food-water";

export type Only = "water" | "food" | null;
/** bottled: all sealed bottled water (Ready.gov's first choice). stored: a few days bottled, the rest tap water in food-grade containers. */
export type WaterWay = "bottled" | "stored";

export type Row = {
  id: string;
  group: string;
  /** Units the gap needs, in the catalog item's unit (bottles, cans, jars). */
  units: number;
  unit: string;
  pick?: Pick;
  /** Packages of the pick to buy, and units in them. */
  packs: number;
  packUnits: number;
  others: Pick[];
  prep?: string;
};

export type Bundle = {
  people: number;
  days: number;
  way: WaterWay;
  water: {
    need: number; have: number; gap: number; rows: Row[];
    /** The whole gap as one-gallon jugs, or as cases of bottles. */
    jugs: number; cases: number;
    /** Gallons bought in bottles and gallons to store from the tap. */
    bottled: number; stored: number;
    /** Containers the household has, empty, to fill from the tap (not bought again). */
    fill: number;
  };
  food: { need: number; have: number; gap: number; rows: Row[] };
  /** The list existing supplies were read from, if any. */
  source: Plan | null;
};

const whole = (x: unknown, lo: number, hi: number, d: number) => {
  const n = typeof x === "string" ? Number.parseInt(x, 10) : typeof x === "number" ? x : NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : d;
};
export const parsePeople = (x: unknown) => whole(x, 1, MAX_FW_PEOPLE, 4);
export const parseDays = (x: unknown) => whole(x, 1, MAX_FW_DAYS, 7);
export const parseOnly = (x: unknown): Only => (x === "water" || x === "food" ? x : null);
export const parseWay = (x: unknown): WaterWay | null => (x === "bottled" || x === "stored" ? x : null);
/** Up to a week, bottles; longer, mostly stored tap water, so a month isn't dozens of cases. */
export const defaultWay = (days: number): WaterWay => (days > ALL_BOTTLED_UP_TO ? "stored" : "bottled");

/** Where existing supplies come from: the Food & Water list, else the Get Ready plan. Never both. */
export function supplySource(plans: Plan[]): Plan | null {
  return [...plans].filter((p) => p.kit === FOOD_WATER).sort((a, b) => b.updated - a.updated)[0] ?? currentGuided(plans);
}

/** Lines that hold water or food (and the opener that goes with cans). */
const SUPPLY_IDS = ["water", "shelf-food", ...WATER_WAYS.map((w) => w.id), ...FOOD_MIX.map((f) => f.id), ...FOOD_KITS.map((k) => k.id), "manual-can-opener"];
const CANS = new Set(["canned-soups-and-stews", "canned-tuna-or-chicken", "canned-beans", "canned-vegetables", "canned-fruit"]);

/** The source's supply lines. Water and food drop any set amount, so the need is this household's. */
function supplyLines(source: Plan | null): Record<string, Line> {
  const list: Record<string, Line> = {};
  for (const id of SUPPLY_IDS) {
    const l = source?.list[id];
    if (l) list[id] = id === "water" || id === "shelf-food" ? { ...l, qty: null } : { ...l };
  }
  return list;
}

/** An emergency plan for this household holding only the source's supply lines. */
function basis(people: number, days: number, source: Plan | null): Plan {
  const list = supplyLines(source);
  return { ...withDays({ ...newPlan("emergency", 0), people }, days), id: "fw", list };
}

const unitWord = (id: string, n: number) => {
  const u = itemById(id)!.unit;
  return n === 1 ? u.one : u.many;
};

function row(id: string, group: string, units: number, prep?: string): Row {
  const pick = primaryPick(id);
  const per = pick?.count ?? 1;
  const packs = Math.ceil(units / per);
  return { id, group, units, unit: unitWord(id, units), pick, packs, packUnits: packs * per, others: picksFor(id).filter((p) => p !== pick), prep };
}

const BOTTLE = WATER_WAYS[0].gallons;
const CONTAINER = WATER_WAYS[1].gallons;

/** Up to a week, bottled water. Longer, the first BOTTLED_DAYS in bottles and the rest stored from the tap. */
export const BOTTLED_DAYS = 3;
export const ALL_BOTTLED_UP_TO = 7;

export function bundle(people: number, days: number, plans: Plan[] = [], way: WaterWay = defaultWay(days)): Bundle {
  const source = supplySource(plans);
  const plan = basis(people, days, source);
  const r = readiness(plan);
  const at = (id: string) => r.items.find((i) => i.item.id === id && i.tier !== "way")!;
  const w = at("water");
  const f = at("shelf-food");
  const wGap = Math.max(0, w.need - w.covered);
  const fGap = Math.max(0, f.need - f.covered);

  // Stored: a few days in bottles, the rest in food-grade containers filled from the tap (Ready.gov: buy sealed
  // bottled water; if you prepare your own, food-grade containers, replaced every 6 months). Containers count only once filled.
  const water: Row[] = [];
  // The bottled days count bottles and jugs already in hand, so buying them doesn't move the target.
  const inBottles = total(waterParts(plan).filter((x) => x.id === "bottled-water" || x.id === "water"));
  const bottled = way === "stored" ? Math.min(wGap, Math.max(0, people * BOTTLED_DAYS - inBottles)) : wGap;
  const stored = Math.max(0, wGap - bottled);
  if (bottled > 1e-9) water.push(row("bottled-water", "Bottled water", Math.ceil(bottled / BOTTLE - 1e-9)));
  const box = plan.list["water-storage-container"];
  const empty = box && !box.restock ? Math.max(0, units(box, 0) - (box.filled ?? 0)) : 0;
  const boxes = Math.ceil(stored / CONTAINER - 1e-9);
  const fill = Math.min(empty, boxes);
  if (boxes > fill) water.push(row("water-storage-container", "Store tap water", boxes - fill, "Empty when it arrives: fill from your tap"));

  const food: Row[] = foodMix(fGap, plan, f.need).map((m) => row(m.id, m.group, m.qty, m.prep));
  const opener = plan.list["manual-can-opener"];
  const hasOpener = opener && !opener.restock && (opener.got || opener.have + (opener.bought ?? 0) > 0);
  if (!hasOpener && food.some((x) => CANS.has(x.id))) food.push(row("manual-can-opener", "For the cans", 1));

  return {
    people, days, source, way,
    water: { need: w.need, have: w.covered, gap: wGap, rows: water, jugs: Math.ceil(wGap - 1e-9), cases: Math.ceil(wGap / BOTTLE / 24 - 1e-9), bottled, stored, fill },
    food: { need: f.need, have: f.covered, gap: fGap, rows: food },
  };
}

export const rowsFor = (b: Bundle, only: Only) => [...(only === "food" ? [] : b.water.rows), ...(only === "water" ? [] : b.food.rows)];

/**
 * The Food & Water list after saving a bundle: this household, every row's amount on top of what
 * each line already holds. Started from the Get Ready plan's supply lines when there's no list yet,
 * so what the household has keeps counting. Saving buys nothing: the bundle stays the same until
 * rows are marked bought or had.
 */
export function savedList(b: Bundle, only: Only, now = Date.now()): Plan {
  const own = b.source?.kit === FOOD_WATER ? b.source : null;
  const start = own ?? { ...newPlan("emergency", now), name: "Food & Water", kit: FOOD_WATER, list: {} as Record<string, Line> };
  const list: Record<string, Line> = { ...start.list };
  if (!own && b.source) Object.assign(list, supplyLines(b.source));
  for (const x of rowsFor(b, only)) {
    const l = list[x.id] ?? { qty: null, have: 0, got: false };
    // What the line already holds stays counted (a ticked line as bought); the bundle's amount goes on top.
    const held = units(l, 0);
    const bought = l.restock ? 0 : Math.max(0, held - l.have);
    list[x.id] = { ...l, got: false, restock: undefined, ...(bought ? { bought } : { bought: undefined }), have: l.restock ? 0 : l.have, qty: held + x.units };
  }
  return { ...withDays({ ...start, people: b.people }, b.days), list, updated: now };
}

/** Calories and protein in rows of the mix, from the labels (nutrition.ts); protein only where a label showed it. */
export function foodFacts(rows: Row[]) {
  return rows.reduce((t, r) => {
    const l = labelFor(r.id);
    return l ? { kcal: t.kcal + r.units * l.kcal, protein: t.protein + r.units * (l.protein ?? 0) } : t;
  }, { kcal: 0, protein: 0 });
}

const word = (r: Row) => {
  const per = r.pick?.count ?? 1;
  if (per === 1) return `${r.packs} ${r.unit}`;
  return `${r.packs} ${r.id === "bottled-water" ? (r.packs === 1 ? "case" : "cases") : r.packs === 1 ? "pack" : "packs"} of ${per} (${r.packUnits} ${unitWord(r.id, r.packUnits)})`;
};

/** The bundle as a plain shopping list for any store: what, how many, our pick as an example. */
export function shoppingText(b: Bundle, only: Only): string {
  const lines = [`Food & Water for ${b.people} ${b.people === 1 ? "person" : "people"}, ${b.days} ${b.days === 1 ? "day" : "days"} — PleaseBeReady`, ""];
  const add = (title: string, rows: Row[]) => {
    if (!rows.length) return;
    lines.push(title);
    for (const r of rows) lines.push(`[ ] ${r.group}: ${word(r)}${r.pick ? ` — e.g. ${r.pick.name}` : ""}`);
    lines.push("");
  };
  if (only !== "food") {
    add(`Water: ${Math.ceil(b.water.gap - 1e-9)} gallons`, b.water.rows);
    if (b.water.fill) lines.push(`[ ] Fill ${b.water.fill} water containers you have from the tap`, "");
  }
  if (only !== "water") add(`Food: ${Math.ceil(b.food.gap - 1e-9)} person-days (2,000 calories each)`, b.food.rows);
  lines.push("Any brand works. Water containers are empty until you fill them. Replace stored tap water every 6 months.");
  return lines.join("\n");
}
