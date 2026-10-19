// Planner math. Pure functions only: no React, no storage, no browser.
//
// Flow: household + horizon + situations → resolvePlan() → ResolvedItem[]
// → the visitor's per-item choices (ItemState) → totals, stages, shopping.

import { catalog, bucketOrder } from "./catalog";
import type {
  Basis, BucketId, CatalogItem, Horizon, Household, ItemState, PlanState, Priority,
  ResolvedItem, ScenarioId, Subject,
} from "./types";

export const MAX_PEOPLE = 20;
export const MAX_PETS = 20;
export const MAX_DAYS = 365;
/** Red Cross gives a 2-week figure for home. Past it we only multiply. */
export const OFFICIAL_DAYS = 14;
export const STAGE_ONE_DAYS = 3;
export const DAYS_PER_WEEK = 7;
export const DAYS_PER_MONTH = 30;

const PRIORITY_RANK: Record<Priority, number> = { essential: 3, next: 2, optional: 1 };

// ── Inputs ──────────────────────────────────────────────────────────────────

export function clampInt(n: unknown, min: number, max: number): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, Math.round(v)));
}

export const defaultHousehold: Household = {
  people: 2, children: 0, babies: 0, olderAdults: 0, pets: 0,
  takesMeds: false, electricMedical: false, mobility: false, senseComm: false,
};

export const defaultHorizon: Horizon = { mode: "3d", amount: 4, unit: "weeks" };

/** Counts are kept consistent: babies ⊆ children, children + older adults ≤ people. */
export function normalizeHousehold(h: Partial<Household>): Household {
  const people = clampInt(h.people ?? defaultHousehold.people, 1, MAX_PEOPLE);
  const children = clampInt(h.children ?? 0, 0, people);
  const babies = clampInt(h.babies ?? 0, 0, children);
  const olderAdults = clampInt(h.olderAdults ?? 0, 0, people - children);
  return {
    people, children, babies, olderAdults,
    pets: clampInt(h.pets ?? 0, 0, MAX_PETS),
    takesMeds: !!h.takesMeds, electricMedical: !!h.electricMedical,
    mobility: !!h.mobility, senseComm: !!h.senseComm,
  };
}

export function normalizeHorizon(hz: Partial<Horizon>): Horizon {
  const mode = hz.mode === "2w" || hz.mode === "1m" || hz.mode === "custom" ? hz.mode : "3d";
  const unit = hz.unit === "months" ? "months" : "weeks";
  const amount = clampInt(hz.amount ?? defaultHorizon.amount, 1, unit === "months" ? 12 : 52);
  return { mode, amount, unit };
}

export function horizonDays(hz: Horizon): number {
  const h = normalizeHorizon(hz);
  if (h.mode === "3d") return 3;
  if (h.mode === "2w") return 14;
  if (h.mode === "1m") return DAYS_PER_MONTH;
  return Math.min(MAX_DAYS, h.amount * (h.unit === "months" ? DAYS_PER_MONTH : DAYS_PER_WEEK));
}

export function horizonLabel(hz: Horizon): string {
  const h = normalizeHorizon(hz);
  if (h.mode === "3d") return "3 days";
  if (h.mode === "2w") return "2 weeks";
  if (h.mode === "1m") return "1 month";
  return `${h.amount} ${h.amount === 1 ? h.unit.slice(0, -1) : h.unit}`;
}

export function subjectCount(h: Household, s: Subject): number {
  switch (s) {
    case "household": return 1;
    case "people": return h.people;
    case "adults": return h.people - h.children;
    case "children": return h.children;
    case "babies": return h.babies;
    case "olderAdults": return h.olderAdults;
    case "pets": return h.pets;
  }
}

function hasNeed(h: Household, need: NonNullable<CatalogItem["needs"]>): boolean {
  switch (need) {
    case "baby": return h.babies > 0;
    case "child": return h.children > 0;
    case "pet": return h.pets > 0;
    case "olderAdult": return h.olderAdults > 0;
    case "takesMeds": return h.takesMeds;
    case "electricMedical": return h.electricMedical;
    case "mobility": return h.mobility;
    case "senseComm": return h.senseComm;
  }
}

// ── Resolving the plan ──────────────────────────────────────────────────────

type QtyContext = { household: Household; days: number; hotWeather: boolean };

/** Suggested quantity for one item; null for tasks. */
export function rawQuantity(item: CatalogItem, ctx: QtyContext, byId?: Map<string, number | null>): number | null {
  const r = item.qty;
  switch (r.kind) {
    case "none": return null;
    case "fixed": return r.n;
    case "each": return Math.ceil(subjectCount(ctx.household, r.subject) * r.n);
    case "daily": {
      const base = subjectCount(ctx.household, r.subject) * ctx.days * r.n;
      return Math.ceil(item.hotWeather && ctx.hotWeather ? base * 2 : base);
    }
    case "coverOf": {
      const target = byId?.get(r.itemId);
      return target ? Math.ceil(target / r.per) : 0;
    }
  }
}

function raisePriority(item: CatalogItem, picked: ScenarioId[]): { priority: Priority; because: ScenarioId[] } {
  let priority = item.priority;
  const because: ScenarioId[] = [];
  for (const s of picked) {
    const r = item.raise?.[s];
    if (r && PRIORITY_RANK[r] > PRIORITY_RANK[priority]) priority = r;
    if (r && PRIORITY_RANK[r] >= PRIORITY_RANK[priority]) because.push(s);
    if (item.scenarioOnly?.includes(s) && !because.includes(s)) because.push(s);
  }
  return { priority, because };
}

export type PlanInputs = Pick<PlanState, "household" | "horizon" | "scenarios" | "hotWeather">;

export function resolvePlan(inputs: PlanInputs): ResolvedItem[] {
  const household = normalizeHousehold(inputs.household);
  const days = horizonDays(inputs.horizon);
  const picked = inputs.scenarios;
  const visible = catalog.filter((it) => {
    if (it.needs && !hasNeed(household, it.needs)) return false;
    if (it.scenarioOnly && !it.scenarioOnly.some((s) => picked.includes(s))) return false;
    return true;
  });

  const full = new Map<string, number | null>();
  const first = new Map<string, number | null>();
  const ctx: QtyContext = { household, days, hotWeather: inputs.hotWeather };
  const ctx3: QtyContext = { ...ctx, days: Math.min(days, STAGE_ONE_DAYS) };
  // coverOf depends on another item, so resolve plain items first.
  for (const it of visible) {
    if (it.qty.kind === "coverOf") continue;
    full.set(it.id, rawQuantity(it, ctx));
    first.set(it.id, rawQuantity(it, ctx3));
  }
  for (const it of visible) {
    if (it.qty.kind !== "coverOf") continue;
    full.set(it.id, rawQuantity(it, ctx, full));
    first.set(it.id, rawQuantity(it, ctx3, first));
  }

  const items = visible.map((it): ResolvedItem => {
    const { priority, because } = raisePriority(it, picked);
    const scaledByDays = it.qty.kind === "daily" || it.qty.kind === "coverOf";
    const basis: Basis = it.basis === "official" && days > OFFICIAL_DAYS && scaledByDays ? "derived" : it.basis;
    return {
      ...it,
      suggested: full.get(it.id) ?? null,
      suggested3: first.get(it.id) ?? null,
      effective: priority,
      effectiveBasis: basis,
      because,
    };
  });

  return items.sort((a, b) => {
    const bucket = bucketOrder.indexOf(a.bucket) - bucketOrder.indexOf(b.bucket);
    if (bucket !== 0) return bucket;
    return PRIORITY_RANK[b.effective] - PRIORITY_RANK[a.effective];
  });
}

// ── The visitor's choices ───────────────────────────────────────────────────

const DEFAULT_STATE: ItemState = { status: "needs" };

export function stateFor(items: PlanState["items"], id: string): ItemState {
  return items[id] ?? DEFAULT_STATE;
}

/** Quantity the plan asks for: the visitor's edit if there is one, else the suggestion. */
export function planQuantity(r: ResolvedItem, st: ItemState): number | null {
  if (r.suggested === null) return null;
  return st.qty !== undefined ? Math.max(0, Math.round(st.qty)) : r.suggested;
}

/** How many are still to get. Zero when marked "have" or skipped. */
export function remainingQuantity(r: ResolvedItem, st: ItemState): number {
  const q = planQuantity(r, st);
  if (q === null || st.status !== "needs") return 0;
  return Math.max(0, q - Math.max(0, Math.round(st.have ?? 0)));
}

/** Quantity already owned (for the owned-value line). */
export function ownedQuantity(r: ResolvedItem, st: ItemState): number {
  const q = planQuantity(r, st);
  if (q === null || st.status === "skip") return 0;
  if (st.status === "have") return q;
  return Math.min(q, Math.max(0, Math.round(st.have ?? 0)));
}

/** The visitor's own price per unit. There is no default price: 0 means none entered. */
export function unitCost(_r: ResolvedItem, st: ItemState): number {
  const c = st.cost;
  return c !== undefined && Number.isFinite(c) && c > 0 ? c : 0;
}

/** True when the visitor has entered a price for this item. */
export function hasPrice(r: ResolvedItem, st: ItemState): boolean {
  return unitCost(r, st) > 0;
}

// ── Totals ──────────────────────────────────────────────────────────────────

export type Totals = {
  /** Cost of everything still to get that has a price entered (not skipped, not owned). */
  needed: number;
  essentialNeeded: number;
  nextNeeded: number;
  optionalNeeded: number;
  /** Rough value of what is already owned. */
  owned: number;
  /** Rough cost of what was skipped, for reference. */
  skipped: number;
  /** Items still to get that have no price entered, so they are not in the totals. */
  unpriced: number;
  counts: { total: number; have: number; needs: number; skip: number };
};

export type BucketTotals = Totals & { bucket: BucketId; budget: number | null; over: number };

const emptyTotals = (): Totals => ({
  needed: 0, essentialNeeded: 0, nextNeeded: 0, optionalNeeded: 0, owned: 0, skipped: 0, unpriced: 0,
  counts: { total: 0, have: 0, needs: 0, skip: 0 },
});

function addItem(t: Totals, r: ResolvedItem, st: ItemState) {
  const cost = unitCost(r, st);
  const q = planQuantity(r, st);
  const rem = remainingQuantity(r, st) * cost;
  t.counts.total += 1;
  t.counts[st.status] += 1;
  if (st.status === "needs") {
    if (remainingQuantity(r, st) > 0 && cost === 0) t.unpriced += 1;
    t.needed += rem;
    if (r.effective === "essential") t.essentialNeeded += rem;
    else if (r.effective === "next") t.nextNeeded += rem;
    else t.optionalNeeded += rem;
  }
  t.owned += ownedQuantity(r, st) * cost;
  if (st.status === "skip" && q !== null) t.skipped += q * cost;
}

export type Summary = { totals: Totals; buckets: BucketTotals[]; budget: number | null; over: number };

export function summarize(resolved: ResolvedItem[], state: Pick<PlanState, "items" | "budget">): Summary {
  const totals = emptyTotals();
  const perBucket = new Map<BucketId, Totals>(bucketOrder.map((b) => [b, emptyTotals()]));
  for (const r of resolved) {
    const st = stateFor(state.items, r.id);
    addItem(totals, r, st);
    addItem(perBucket.get(r.bucket)!, r, st);
  }
  const buckets = bucketOrder.map((b): BucketTotals => {
    const t = perBucket.get(b)!;
    const budget = state.budget.buckets[b] ?? null;
    return { ...t, bucket: b, budget, over: budget !== null ? Math.max(0, t.needed - budget) : 0 };
  });
  const budget = state.budget.total;
  return { totals, buckets, budget, over: budget !== null ? Math.max(0, totals.needed - budget) : 0 };
}

// ── Staging ─────────────────────────────────────────────────────────────────

export type Stage = {
  id: "first-days" | "finish-essentials" | "next-steps" | "optional";
  title: string;
  detail: string;
  /** Sum of the prices the visitor entered; unpriced items add nothing. */
  cost: number;
  /** Items in this stage with no price entered. */
  unpriced: number;
  /** Running total through this stage. */
  cumulative: number;
  /** Whether the running total fits the total budget (null when no budget). */
  fits: boolean | null;
  itemIds: string[];
};

/** Quantity still to get for a stage-one slice (first 3 days of time-scaled items). */
function firstSliceRemaining(r: ResolvedItem, st: ItemState): number {
  if (st.status !== "needs" || r.suggested === null || r.suggested3 === null) return 0;
  const full = planQuantity(r, st) ?? 0;
  const slice = Math.min(full, r.suggested3);
  return Math.max(0, slice - Math.max(0, Math.round(st.have ?? 0)));
}

/**
 * Splits what is still needed into steps a smaller budget can reach:
 * the essentials for the first 3 days, the rest of the essentials, the useful
 * next steps, then optional items. Nothing here is a rule; it is one way to order.
 */
export function buildStages(resolved: ResolvedItem[], state: Pick<PlanState, "items" | "budget">): Stage[] {
  const raw: Omit<Stage, "cumulative" | "fits">[] = [
    { id: "first-days", title: "Essentials for the first 3 days", detail: "The basics every household needs, sized for 3 days.", cost: 0, unpriced: 0, itemIds: [] },
    { id: "finish-essentials", title: "Finish the essentials", detail: "The rest of the essentials, up to your plan length.", cost: 0, unpriced: 0, itemIds: [] },
    { id: "next-steps", title: "Useful next steps", detail: "Helpful additions once the essentials are in place.", cost: 0, unpriced: 0, itemIds: [] },
    { id: "optional", title: "Nice to have", detail: "Optional items from the sources' \"consider\" lists.", cost: 0, unpriced: 0, itemIds: [] },
  ];
  const [first, rest, next, opt] = raw;
  for (const r of resolved) {
    const st = stateFor(state.items, r.id);
    const cost = unitCost(r, st);
    const remaining = remainingQuantity(r, st);
    if (remaining === 0) continue;
    const add = (stage: (typeof raw)[number], qty: number) => {
      stage.cost += qty * cost;
      if (cost === 0) stage.unpriced += 1;
      stage.itemIds.push(r.id);
    };
    if (r.effective === "essential") {
      const slice = firstSliceRemaining(r, st);
      if (slice > 0) add(first, slice);
      if (remaining - slice > 0) add(rest, remaining - slice);
    } else if (r.effective === "next") add(next, remaining);
    else add(opt, remaining);
  }
  let run = 0;
  return raw.map((s) => {
    run += s.cost;
    return { ...s, cumulative: run, fits: state.budget.total === null ? null : run <= state.budget.total };
  });
}

// ── Display helpers ─────────────────────────────────────────────────────────

export function formatQuantity(n: number, unit: { one: string; many: string }): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? unit.one : unit.many}`;
}

/** Whole dollars. Only ever used for numbers the visitor typed, or sums of them. */
export function formatMoney(n: number): string {
  const cents = Math.round(Math.max(0, n) * 100) / 100;
  return `$${cents.toLocaleString("en-US", Number.isInteger(cents) ? undefined : { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
