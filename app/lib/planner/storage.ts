// On-device storage for the planner. Nothing here talks to a server.
//
// A saved plan holds counts (people, pets), yes/no needs, the plan length,
// per-item choices and budget numbers. No names, no addresses, no free text.
// Storage can be missing or full (private windows, blocked site data); every
// call fails quietly and the planner still works for the page view.

import { defaultHorizon, defaultHousehold, normalizeHorizon, normalizeHousehold } from "./calc";
import { catalog, bucketOrder } from "./catalog";
import type { Budget, BucketId, ItemState, PlanState, ScenarioId } from "./types";

export const STORAGE_KEY = "pbr:planner:v1";
export const OPT_OUT_KEY = "pbr:planner:off";
export const BACKUP_VERSION = 1;

const SCENARIOS: ScenarioId[] = ["outage", "weather", "water", "evacuation"];
const itemIds = new Set(catalog.map((c) => c.id));
const MAX_MONEY = 1_000_000;
const MAX_QTY = 100_000;

export function defaultState(): PlanState {
  return {
    household: { ...defaultHousehold },
    horizon: { ...defaultHorizon },
    scenarios: [],
    hotWeather: false,
    items: {},
    budget: { total: null, buckets: {} },
    picks: [],
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function money(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.min(MAX_MONEY, n);
}

function sanitizeItem(v: unknown): ItemState | null {
  if (!isObj(v)) return null;
  const status = v.status === "have" || v.status === "skip" ? v.status : "needs";
  const out: ItemState = { status };
  if (typeof v.qty === "number" && Number.isFinite(v.qty) && v.qty >= 0) out.qty = Math.min(MAX_QTY, Math.round(v.qty));
  if (typeof v.have === "number" && Number.isFinite(v.have) && v.have > 0) out.have = Math.min(MAX_QTY, Math.round(v.have));
  const cost = money(v.cost);
  if (cost !== undefined) out.cost = cost;
  return out;
}

function sanitizeBudget(v: unknown): Budget {
  const out: Budget = { total: null, buckets: {} };
  if (!isObj(v)) return out;
  out.total = money(v.total) ?? null;
  if (isObj(v.buckets)) {
    for (const b of bucketOrder) {
      const m = money((v.buckets as Record<string, unknown>)[b]);
      if (m !== undefined) out.buckets[b as BucketId] = m;
    }
  }
  return out;
}

/** Turns anything read from storage or an imported file into a safe plan. */
export function sanitizeState(raw: unknown): PlanState {
  const base = defaultState();
  if (!isObj(raw)) return base;
  const items: PlanState["items"] = {};
  if (isObj(raw.items)) {
    for (const [id, v] of Object.entries(raw.items)) {
      if (!itemIds.has(id)) continue;
      const s = sanitizeItem(v);
      if (s) items[id] = s;
    }
  }
  return {
    household: normalizeHousehold(isObj(raw.household) ? raw.household : base.household),
    horizon: normalizeHorizon(isObj(raw.horizon) ? raw.horizon : base.horizon),
    scenarios: Array.isArray(raw.scenarios)
      ? SCENARIOS.filter((s) => (raw.scenarios as unknown[]).includes(s))
      : [],
    hotWeather: raw.hotWeather === true,
    items,
    budget: sanitizeBudget(raw.budget),
    picks: Array.isArray(raw.picks)
      ? (raw.picks as unknown[]).filter((p): p is string => typeof p === "string" && itemIds.has(p))
      : [],
  };
}

export type Backup = { app: "pleasebeready-planner"; version: number; savedAt: string; plan: PlanState };

export function toBackup(state: PlanState, now: Date = new Date()): Backup {
  return { app: "pleasebeready-planner", version: BACKUP_VERSION, savedAt: now.toISOString(), plan: state };
}

/** Parses a backup file's text. Returns null when it is not one of ours. */
export function parseBackup(text: string): PlanState | null {
  try {
    const data: unknown = JSON.parse(text);
    if (!isObj(data) || data.app !== "pleasebeready-planner") return null;
    return sanitizeState(data.plan);
  } catch {
    return null;
  }
}

// ── Browser storage (all calls fail quietly) ────────────────────────────────

let memory: PlanState | null = null;

export function savingEnabled(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) !== "1";
  } catch {
    return true;
  }
}

export function setSavingEnabled(on: boolean): void {
  try {
    if (on) window.localStorage.removeItem(OPT_OUT_KEY);
    else {
      window.localStorage.setItem(OPT_OUT_KEY, "1");
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable: nothing is saved anyway
  }
}

/** The saved plan, or null if there is none. */
export function loadSaved(): PlanState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return sanitizeState(JSON.parse(raw));
  } catch {
    // fall through to the in-memory copy
  }
  return memory;
}

export function save(state: PlanState): void {
  memory = state;
  if (!savingEnabled()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked: the plan lasts for this page view only
  }
}

export function clearSaved(): void {
  memory = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear
  }
}

