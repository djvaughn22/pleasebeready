// The guided readiness plan (Get Ready). One planning model for every
// situation: a Ready List (stockup Plan) with `guide` set, read through
// situation-specific priority rules into stages, amounts, progress and a
// shopping schedule. Nothing here touches React or the browser.
//
// Emergency situations use a household-kit order (water, food, light and
// power, health, alerts, sanitation, shelter and leaving, then extras) built
// from Ready.gov's Build a Kit list. That order is a default shopping
// sequence, not a claim that every emergency has the same survival
// priorities, so hazard rules (heat, cold, evacuation, medical power) move
// what a household needs first to the front. Every other situation uses its
// own essentials, then useful things, then extras; emergency priorities never
// apply to a party.
//
// Amounts come from calc.ts (planning rules × people × days); only water's
// 1 gallon per person per day is a published baseline. Progress counts the
// amounts covered, not checkboxes.

import { durationLabel, fitsClimate, fitsPeople, suggest, suggestionsFor, unitWord, withDays } from "../stockup/calc";
import { categoryById, itemById } from "../stockup/catalog";
import type { CatalogItem, Guide, Line, OccasionId, Pace, Plan, SourceId } from "../stockup/types";

export type StageId = string;
export type Stage = { id: StageId; title: string; emoji: string };

/** critical: in the first step whatever the pace. essential: counts toward Ready. recommended: worth having, scheduled after. upgrade: optional, never counted as missing. */
export type Tier = "critical" | "essential" | "recommended" | "upgrade";

export type State = "needed" | "have" | "saved" | "bought" | "ready" | "restock";

export type PlanItem = {
  item: CatalogItem;
  stage: StageId;
  tier: Tier;
  /** The full amount for the plan's people and length (the visitor's own amount when set). */
  need: number;
  /** Already had. */
  have: number;
  /** Bought through the plan. */
  bought: number;
  /** Counted from other items, such as filled water containers toward water. */
  extra: number;
  /** have + bought + extra, at most need (0 when marked for restock). */
  covered: number;
  state: State;
  /** Amount grows with the number of days (water, food, toilet paper…). */
  daily: boolean;
  line?: Line;
};

export type Entry = { id: string; upto: number; buy: number; why: string; tier: Tier; stage: StageId; task: boolean };
export type Step = { n: number; date: string; entries: Entry[] };
export type Urgent = { text: string; source?: SourceId };

export type Readiness = {
  kind: "emergency" | "general";
  stages: Stage[];
  items: PlanItem[];
  urgent: Urgent[];
  /** 0–1: essential amounts covered. */
  ready: number;
  /** 0–1: essentials covered for the first three days (the base a slow plan builds first). */
  base: number;
  baseDays: number;
  steps: Step[];
  next: Entry | null;
};

// ── Emergency: stages and the household kit ────────────────────────────────

export const EMERGENCY_STAGES: Stage[] = [
  { id: "water", title: "Water", emoji: "💧" },
  { id: "food", title: "Food", emoji: "🥫" },
  { id: "power", title: "Light and power", emoji: "🔦" },
  { id: "health", title: "First aid and medicine", emoji: "🩹" },
  { id: "alerts", title: "Alerts and contact", emoji: "📻" },
  { id: "sanitation", title: "Sanitation", emoji: "🧻" },
  { id: "shelter", title: "Shelter, warmth and leaving", emoji: "🎒" },
  { id: "extras", title: "Extras and upgrades", emoji: "➕" },
];

/** Situations that use the emergency order. */
export const EMERGENCY_KINDS: OccasionId[] = ["emergency", "outage", "winter", "hurricane", "heat", "wildfire", "flood"];

type K = [id: string, stage: StageId, tier: Tier];
// Ready.gov Build a Kit, in shopping order. Need-specific rows only show when the plan has that need (catalog `needs`).
const KIT: K[] = [
  ["water", "water", "essential"], ["pet-water", "water", "essential"],
  ["water-storage-container", "water", "recommended"], ["water-purification-tablets", "water", "recommended"], ["unscented-household-bleach", "water", "recommended"],
  ["55-gallon-water-barrel", "water", "upgrade"], ["water-bricks", "water", "upgrade"], ["gravity-water-filter", "water", "upgrade"], ["personal-water-filter", "water", "upgrade"],
  ["baby-food-and-formula", "food", "critical"], ["shelf-food", "food", "essential"], ["manual-can-opener", "food", "essential"], ["pet-food", "food", "essential"],
  ["special-diet-foods", "food", "recommended"], ["lighter-or-matches", "food", "recommended"], ["fridge-and-freezer-thermometers", "food", "recommended"],
  ["3-day-emergency-food-supply", "food", "upgrade"], ["30-day-food-supply", "food", "upgrade"], ["camp-stove", "food", "upgrade"],
  ["medical-device-backup-batteries", "power", "critical"], ["flashlights", "power", "essential"], ["batteries", "power", "essential"], ["power-bank", "power", "essential"],
  ["lantern", "power", "recommended"], ["car-phone-charger", "power", "recommended"],
  ["portable-power-station", "power", "upgrade"], ["generator", "power", "upgrade"], ["rechargeable-lantern", "power", "upgrade"],
  ["meds", "health", "critical"], ["diabetes-supplies", "health", "critical"], ["first-aid-kit", "health", "essential"], ["med-list", "health", "essential"],
  ["hearing-aid-batteries", "health", "essential"], ["spare-mobility-device-batteries", "health", "essential"],
  ["masks", "health", "recommended"], ["pain-and-fever-reliever", "health", "recommended"], ["children-s-pain-and-fever-reliever", "health", "recommended"],
  ["cooler-for-insulin-or-medicines", "health", "recommended"], ["contact-lens-supplies-or-spare-glasses", "health", "recommended"], ["thermometer", "health", "recommended"],
  ["weather-radio", "alerts", "essential"], ["local-alerts", "alerts", "essential"], ["family-plan", "alerts", "essential"], ["whistle", "alerts", "essential"],
  ["printed-contact-list", "alerts", "recommended"], ["out-of-area-contact", "alerts", "recommended"], ["two-way-radios", "alerts", "upgrade"],
  ["diapers", "sanitation", "critical"], ["toilet-paper", "sanitation", "essential"], ["wet-wipes", "sanitation", "essential"], ["trash-bags", "sanitation", "essential"],
  ["hand-sanitizer", "sanitation", "essential"], ["baby-wipes", "sanitation", "essential"],
  ["portable-toilet-bags", "sanitation", "recommended"], ["feminine-hygiene-supplies", "sanitation", "recommended"], ["poop-bags", "sanitation", "recommended"],
  ["cat-litter", "sanitation", "recommended"], ["toothbrushes", "sanitation", "recommended"], ["toothpaste", "sanitation", "recommended"],
  ["multi-tool", "shelter", "essential"], ["plastic-sheeting", "shelter", "essential"], ["duct-tape", "shelter", "essential"], ["emergency-blankets", "shelter", "essential"],
  ["paper-road-map", "shelter", "essential"], ["document-bag", "shelter", "essential"], ["copy-documents", "shelter", "essential"], ["meeting-places", "shelter", "essential"],
  ["leash-and-id-tag", "shelter", "essential"],
  ["warm-layers", "shelter", "recommended"], ["gloves-or-mittens", "shelter", "recommended"], ["winter-hats", "shelter", "recommended"], ["rain-ponchos", "shelter", "recommended"],
  ["go-bag", "shelter", "recommended"], ["cash-in-small-bills", "shelter", "recommended"], ["smoke-and-co-alarm", "shelter", "recommended"],
  ["pet-carrier-or-crate", "shelter", "recommended"], ["microchip-check", "shelter", "recommended"],
  ["sleeping-bags", "extras", "upgrade"], ["card-games", "extras", "upgrade"], ["coloring-books-and-crayons", "extras", "upgrade"],
  ["paper-plates", "extras", "upgrade"], ["cups", "extras", "upgrade"], ["plastic-utensils", "extras", "upgrade"],
];
export const KIT_IDS = KIT.map((k) => k[0]);

/** Where a hazard situation's own items go, by catalog category. */
const STAGE_BY_CAT: Partial<Record<CatalogItem["cat"], StageId>> = {
  water: "water", food: "food", cooking: "food", baby: "food", power: "power", health: "health", access: "health",
  paper: "sanitation", cleaning: "sanitation", toiletries: "sanitation", safety: "shelter", sleep: "shelter", weather: "shelter",
  outdoors: "shelter", travel: "shelter", tools: "shelter", car: "shelter", pets: "shelter", tasks: "shelter",
  dining: "extras", party: "extras", fun: "extras", drinks: "extras", school: "extras", moving: "extras",
};

/** Items that fill another item's amount: a filled 7-gallon container is 7 gallons of water. */
const COUNTS_TOWARD: Record<string, { to: string; each: number }> = {
  "water-storage-container": { to: "water", each: 7 },
  "55-gallon-water-barrel": { to: "water", each: 55 },
  "3-day-emergency-food-supply": { to: "shelf-food", each: 3 },
  "30-day-food-supply": { to: "shelf-food", each: 30 },
};

/** Bought together: food that comes in cans needs the opener; flashlights need batteries. */
const WITH: Record<string, string[]> = { "shelf-food": ["manual-can-opener"], flashlights: ["batteries"] };

/** Another kind of something the kit already counts (a second radio): offered as an upgrade, never a second must-have. */
const ALSO = new Set(["hand-crank-weather-radio-with-charger", "large-power-bank-20-000-mah", "rechargeable-lantern", "collapsible-water-containers"]);

const FIRST = ["water", "shelf-food"];

const DAILY = new Set(["personDay", "kidDay", "babyDay", "petDay", "personMeal", "personNight"]);
const HAZARD_EVAC: OccasionId[] = ["wildfire", "hurricane", "flood"];
const MILESTONES = [3, 7, 14, 30, 90, 180, 365];

export const isEmergencyKind = (o: OccasionId) => EMERGENCY_KINDS.includes(o);

/** Hazard rules: what moves to the front, and the notes shown above the plan. */
function hazards(plan: Plan): { urgent: Urgent[]; promote: Map<string, Tier> } {
  const urgent: Urgent[] = [];
  const promote = new Map<string, Tier>();
  const o = plan.occasion;
  const cold = o === "winter" || plan.climate.includes("cold");
  const hot = o === "heat" || plan.climate.includes("hot");
  if (plan.needs.includes("medical")) {
    urgent.push({ text: "If anyone relies on powered medical equipment or medicine kept cold, plan backup power and a cold-storage option first, and talk with their doctor and your power company.", source: "rg-disability" });
    promote.set("power-device-plan", "critical");
    promote.set("cooler-for-insulin-or-medicines", "essential");
  }
  if (HAZARD_EVAC.includes(o)) {
    urgent.push({ text: "If officials tell you to leave, leave. Know your route out and keep a go-bag by the door; your supplies at home come second.", source: "rg-evacuation" });
    promote.set("go-bag", "critical");
    promote.set("pack-go-bags", "critical");
  }
  if (o === "wildfire") promote.set("masks", "essential");
  if (cold) {
    urgent.push({ text: "In the cold, staying warm comes right after water. Never run a generator, grill or camp stove indoors or in a garage.", source: "rg-winter" });
    for (const id of ["warm-layers", "gloves-or-mittens", "winter-hats", "extra-blankets"]) promote.set(id, "essential");
    promote.set("emergency-blankets", "critical");
  }
  if (hot) {
    urgent.push({ text: "In extreme heat, drinking water and a cool place come first. Hot weather can mean more than a gallon a day; know where your nearest cooling center is." });
    promote.set("water", "critical");
  }
  return { urgent, promote };
}

const rank: Record<Tier, number> = { critical: 0, essential: 1, recommended: 2, upgrade: 3 };

/** The items a plan works through, with stage and tier. */
export function planItems(plan: Plan): { stages: Stage[]; rows: { item: CatalogItem; stage: StageId; tier: Tier }[]; urgent: Urgent[] } {
  const fits = (c: CatalogItem) => fitsPeople(c, plan) && fitsClimate(c, plan);
  if (!isEmergencyKind(plan.occasion)) {
    // Any other situation: its own items, essentials first, in catalog category order.
    const rows = suggestionsFor(plan).map((s) => ({
      item: s.item, stage: s.item.cat as StageId,
      tier: (s.item.pri === "essential" ? "essential" : s.item.pri === "useful" ? "recommended" : "upgrade") as Tier,
    }));
    const stages = [...new Set(rows.map((r) => r.stage))].map((id) => {
      const c = categoryById(id as CatalogItem["cat"]);
      return { id, title: c.title, emoji: c.emoji };
    });
    return { stages, rows, urgent: [] };
  }
  const { urgent, promote } = hazards(plan);
  const rows = new Map<string, { item: CatalogItem; stage: StageId; tier: Tier }>();
  for (const [id, stage, tier] of KIT) {
    const item = itemById(id);
    if (item && fits(item)) rows.set(id, { item, stage, tier });
  }
  // A hazard's own items (power outage, winter storm…) join the kit in their stage.
  if (plan.occasion !== "emergency") {
    for (const s of suggestionsFor(plan)) {
      if (rows.has(s.item.id)) continue;
      const stage = STAGE_BY_CAT[s.item.cat] ?? "extras";
      const tier: Tier = stage === "extras" || s.item.pri === "extra" || ALSO.has(s.item.id) ? "upgrade" : s.item.pri === "essential" ? "essential" : "recommended";
      rows.set(s.item.id, { item: s.item, stage, tier });
    }
  }
  for (const [id, tier] of promote) {
    const r = rows.get(id);
    if (r) { if (rank[tier] < rank[r.tier]) r.tier = tier; continue; }
    const item = itemById(id);
    if (item && fits(item)) rows.set(id, { item, stage: STAGE_BY_CAT[item.cat] ?? "shelter", tier });
  }
  const order = new Map(EMERGENCY_STAGES.map((s, i) => [s.id, i]));
  const list = [...rows.values()].sort((a, b) => order.get(a.stage)! - order.get(b.stage)!);
  return { stages: EMERGENCY_STAGES, rows: list, urgent };
}

// ── Amounts and progress ────────────────────────────────────────────────────

const isDaily = (item: CatalogItem) => DAILY.has(item.rule.per);

/** The amount for one item at a given number of days (the plan's own length by default). */
export function needAt(item: CatalogItem, plan: Plan, days = plan.days): number {
  if (item.kind === "task") return 1;
  const own = plan.list[item.id]?.qty;
  const full = own ?? suggest(item, plan).qty;
  if (days >= plan.days || !isDaily(item)) return full;
  if (own != null) return Math.max(1, Math.ceil((own * days) / plan.days));
  return suggest(item, withDays(plan, days)).qty;
}

function lineState(line: Line | undefined, covered: number, need: number, have: number): State {
  if (!line) return covered >= need && need > 0 ? "have" : "needed";
  if (line.restock) return "restock";
  if (line.ready) return "ready";
  if (covered >= need) return have >= need ? "have" : "bought";
  return "saved";
}

export function readiness(plan: Plan, today = new Date().toISOString().slice(0, 10)): Readiness {
  const { stages, rows, urgent } = planItems(plan);
  const kind = isEmergencyKind(plan.occasion) ? "emergency" : "general";
  // What each item has, before counting other items toward it.
  const own = (item: CatalogItem, need: number) => {
    const line = plan.list[item.id];
    if (!line || line.restock) return 0;
    if (item.kind === "task") return line.got ? 1 : 0;
    return line.got ? Math.max(need, line.have) : line.have + (line.bought ?? 0);
  };
  const extraFor = new Map<string, number>();
  for (const [id, c] of Object.entries(COUNTS_TOWARD)) {
    const item = itemById(id);
    if (!item || !plan.list[id]) continue;
    extraFor.set(c.to, (extraFor.get(c.to) ?? 0) + own(item, needAt(item, plan)) * c.each);
  }
  const items: PlanItem[] = rows.map(({ item, stage, tier }) => {
    const line = plan.list[item.id];
    const need = needAt(item, plan);
    const have = line && !line.restock ? (item.kind === "task" ? 0 : line.have) : 0;
    const bought = line && !line.restock ? (item.kind === "task" ? (line.got ? 1 : 0) : line.got ? Math.max(0, need - line.have) : line.bought ?? 0) : 0;
    const extra = line?.restock ? 0 : extraFor.get(item.id) ?? 0;
    const covered = Math.min(need, own(item, need) + extra);
    return { item, stage, tier, need, have, bought, extra, covered, state: lineState(line, covered, need, have), daily: isDaily(item), line };
  });

  const counted = items.filter((i) => i.tier === "critical" || i.tier === "essential");
  const share = (xs: { covered: number; need: number }[]) => (xs.length ? xs.reduce((t, x) => t + Math.min(1, x.covered / Math.max(1, x.need)), 0) / xs.length : 1);
  const baseDays = kind === "emergency" ? Math.min(3, plan.days) : plan.days;
  const ready = share(counted);
  const base = share(counted.map((i) => ({ covered: i.covered, need: i.daily ? needAt(i.item, plan, baseDays) : i.need })));
  const steps = schedule(plan, items, kind, today);
  return { kind, stages, items, urgent, ready, base, baseDays, steps, next: steps[0]?.entries[0] ?? null };
}

// ── The schedule ────────────────────────────────────────────────────────────

/** Defaults per pace; custom keeps the visitor's own `every` and `size`. */
export const PACES: { id: Pace; label: string; hint: string; every: number; size: number }[] = [
  { id: "now", label: "Ready Now", hint: "Everything that's left, in one go", every: 1, size: 50 },
  { id: "weekly", label: "Weekly", hint: "A few things each week", every: 7, size: 5 },
  { id: "monthly", label: "Monthly", hint: "A bigger shop once a month", every: 30, size: 8 },
  { id: "custom", label: "Custom", hint: "Your own timing and trip size", every: 14, size: 4 },
];

/** Trip sizes stand in for a budget: the site shows no prices, so a budget is how many things you buy per step. */
export const SIZES = [{ size: 3, label: "Small" }, { size: 6, label: "Medium" }, { size: 10, label: "Large" }];

export function defaultGuide(pace: Pace, today = new Date().toISOString().slice(0, 10)): Guide {
  const p = PACES.find((x) => x.id === pace)!;
  return { pace, every: p.every, size: p.size, started: today };
}

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/**
 * Shopping steps from today: what is still missing, in order. A slow plan buys
 * a three-day base of every essential first, then raises the daily amounts
 * (water, food…) through 1 week, 2 weeks, 1 month… to the plan's length, then
 * the recommended things. Critical items always go in the first step, and
 * paired items (opener with canned food, batteries with flashlights) go together.
 */
export function schedule(plan: Plan, items: PlanItem[], kind: Readiness["kind"], today: string): Step[] {
  const g = plan.guide ?? defaultGuide("now", today);
  const byId = new Map(items.map((i) => [i.item.id, i]));
  const queue: Entry[] = [];
  const upto = new Map<string, number>();
  const push = (i: PlanItem, to: number, why: string) => {
    const from = Math.max(i.covered, upto.get(i.item.id) ?? 0);
    if (to <= from) return;
    upto.set(i.item.id, to);
    queue.push({ id: i.item.id, upto: to, buy: to - from, why, tier: i.tier, stage: i.stage, task: i.item.kind === "task" });
  };
  const live = items.filter((i) => i.tier !== "upgrade" && i.state !== "ready");
  const core = live.filter((i) => i.tier === "critical" || i.tier === "essential");
  const crit = core.filter((i) => i.tier === "critical");
  const ess = core.filter((i) => i.tier === "essential");
  const rec = live.filter((i) => i.tier === "recommended");
  const length = durationLabel(plan.days);

  if (g.pace === "now" || kind === "general" || plan.days <= 3) {
    for (const i of [...crit, ...ess]) push(i, i.need, kind === "emergency" && i.daily ? `for ${length}` : "essential");
  } else {
    const base = Math.min(3, plan.days);
    for (const i of [...crit, ...ess]) push(i, i.daily ? needAt(i.item, plan, base) : i.need, i.daily ? "3-day base" : "essential");
    const marks = [...MILESTONES.filter((d) => d > base && d < plan.days), plan.days];
    for (const d of marks) for (const i of core) if (i.daily) push(i, needAt(i.item, plan, d), `to reach ${durationLabel(d)}`);
  }
  for (const i of rec) push(i, i.need, "recommended");

  const steps: Step[] = [];
  const now = g.pace === "now";
  const size = now ? Infinity : Math.max(1, g.size);
  const placed = new Set<number>();
  const take = (step: Entry[], k: number) => {
    if (placed.has(k)) return;
    placed.add(k);
    const e = queue[k];
    const same = step.find((x) => x.id === e.id);
    if (same) { same.upto = Math.max(same.upto, e.upto); same.buy += e.buy; same.why = e.why; } else step.push({ ...e });
    for (const w of WITH[e.id] ?? []) {
      const j = queue.findIndex((x, n) => !placed.has(n) && x.id === w);
      if (j >= 0 && byId.has(w)) take(step, j);
    }
  };
  const cost = (es: Entry[]) => es.filter((e) => !e.task).length;
  while (placed.size < queue.length) {
    const step: Entry[] = [];
    // The first step always has the critical things and the first water and food, whatever the budget.
    if (!steps.length) queue.forEach((e, k) => {
      if (e.tier === "critical" || (FIRST.includes(e.id) && !step.some((x) => x.id === e.id))) take(step, k);
    });
    let tasks = 0;
    for (let k = 0; k < queue.length; k++) {
      if (placed.has(k)) continue;
      const e = queue[k];
      // An item's next amount waits for a later step, so one step never asks for water twice.
      if (step.some((x) => x.id === e.id)) continue;
      // Ready Now: every essential in one step, then the recommended things in a second.
      if (now && e.tier === "recommended" && step.some((x) => x.tier !== "recommended")) continue;
      if (e.task) { if (now || tasks < 2) { take(step, k); tasks++; } continue; }
      if (cost(step) >= size) continue;
      take(step, k);
    }
    if (!step.length) break;
    steps.push({ n: steps.length + 1, date: addDays(today, steps.length * (g.pace === "now" ? 0 : g.every)), entries: step });
  }
  return steps;
}

// ── Words ───────────────────────────────────────────────────────────────────

const n = (x: number) => x.toLocaleString("en-US");

/** "12 gallons" or "3 packs of 12 (36 rolls)". */
export function amountText(item: CatalogItem, qty: number): string {
  if (item.kind === "task") return "To do";
  const base = `${n(qty)} ${unitWord(item, qty)}`;
  if (!item.pack || qty <= item.pack) return base;
  const packs = Math.ceil(qty / item.pack);
  return `${n(packs)} packs of ${n(item.pack)} (${base})`;
}

/** The next small action, in words: "Get 12 gallons of drinking water (3-day base)". */
export function entryText(e: Entry): string {
  const item = itemById(e.id)!;
  if (e.task) return item.name;
  return `${item.name}: ${n(e.buy)} ${unitWord(item, e.buy)} more`;
}

/** Water storage sense check for big amounts. */
export function waterHint(gallons: number): string | null {
  if (gallons < 50) return null;
  return `${n(gallons)} gallons is a lot to store: about ${n(Math.ceil(gallons / 7))} seven-gallon containers or ${n(Math.ceil(gallons / 55))} 55-gallon barrels. Store it somewhere cool and dark, and refill on a schedule.`;
}

export const STATE_TEXT: Record<State, string> = {
  needed: "Needed", have: "Have it", saved: "Saved to buy", bought: "Bought", ready: "Ready", restock: "Restock",
};

/** The guided plan to show: the most recently changed list with a guide. */
export function currentGuided(plans: Plan[]): Plan | null {
  return [...plans].filter((p) => p.guide).sort((a, b) => b.updated - a.updated)[0] ?? null;
}

/** Catalog ids from a kit or page that the plan still needs (essential or recommended). */
export function gaps(r: Readiness, ids: string[]): string[] {
  const want = new Set(ids);
  return r.items.filter((i) => want.has(i.item.id) && i.tier !== "upgrade" && i.covered < i.need && i.state !== "saved").map((i) => i.item.id);
}
