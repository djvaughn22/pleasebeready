// Plans live only in this browser's localStorage. Nothing is sent anywhere.
// Share links carry a plan in the URL fragment (#plan=…), which browsers do
// not send to the server.

import { itemById, occasionById, occasions } from "./catalog";
import { clampPlan } from "./calc";
import type { Line, OccasionId, Plan } from "./types";

// The key keeps its v1 name so lists saved before Ready Lists still load. The
// stored object carries its own version (v) for future changes; v1 data has
// none and parses the same way, with the new fields simply absent.
export const STORAGE_KEY = "pbr:stockup:v1";
export const STORE_VERSION = 2;

/** activeId: the list open on the Lists page. targetId: where Save buttons on shop pages put things. */
export type Store = { plans: Plan[]; activeId: string | null; targetId?: string | null };

export const emptyStore = (): Store => ({ plans: [], activeId: null, targetId: null });

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const NOTE_MAX = 140;
export const LIST_NOTE_MAX = 500;

export function newPlan(occasion: OccasionId, now = Date.now()): Plan {
  const o = occasionById(occasion);
  return {
    id: newId(), name: o.name, occasion, people: 4, kids: 0, babies: 0, pets: 0, needs: [], climate: [],
    days: o.days, nights: o.nights, meals: o.meals, start: "",
    created: now, updated: now, list: {},
  };
}

const isOccasion = (v: unknown): v is OccasionId => occasions.some((o) => o.id === v);

/** Accepts anything, returns a valid plan or null. Unknown item ids are dropped. */
export function parsePlan(v: unknown): Plan | null {
  if (!v || typeof v !== "object") return null;
  const p = v as Partial<Plan>;
  if (!isOccasion(p.occasion)) return null;
  const list: Record<string, Line> = {};
  if (p.list && typeof p.list === "object") {
    for (const [id, l] of Object.entries(p.list as Record<string, Partial<Line>>)) {
      if (!itemById(id) || !l || typeof l !== "object") continue;
      const qty = typeof l.qty === "number" && l.qty >= 0 ? Math.round(l.qty) : null;
      const line: Line = { qty, have: typeof l.have === "number" && l.have > 0 ? Math.round(l.have) : 0, got: l.got === true };
      if (l.ready === true) line.ready = true;
      if (l.restock === true) line.restock = true;
      if (typeof l.note === "string" && l.note.trim()) line.note = l.note.slice(0, NOTE_MAX);
      list[id] = line;
    }
  }
  const n = (x: unknown, d: number) => (typeof x === "number" ? x : d);
  const o = occasionById(p.occasion);
  return clampPlan({
    id: typeof p.id === "string" && p.id ? p.id : newId(),
    name: typeof p.name === "string" && p.name.trim() ? p.name.slice(0, 80) : o.name,
    occasion: p.occasion,
    people: n(p.people, 4), kids: n(p.kids, 0), babies: n(p.babies, 0), pets: n(p.pets, 0),
    needs: Array.isArray(p.needs) ? p.needs : [],
    climate: Array.isArray(p.climate) ? p.climate : [],
    days: n(p.days, o.days), nights: n(p.nights, o.nights), meals: n(p.meals, o.meals),
    start: typeof p.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.start) ? p.start : "",
    created: n(p.created, Date.now()), updated: n(p.updated, Date.now()),
    list,
    ...(typeof p.note === "string" && p.note.trim() ? { note: p.note.slice(0, LIST_NOTE_MAX) } : {}),
    ...(typeof p.kit === "string" && /^[a-z0-9-]{1,60}$/.test(p.kit) ? { kit: p.kit } : {}),
  });
}

export function parseStore(raw: string | null): Store {
  if (!raw) return emptyStore();
  try {
    const v = JSON.parse(raw) as Partial<Store>;
    const plans = Array.isArray(v.plans) ? v.plans.map(parsePlan).filter((p): p is Plan => !!p) : [];
    const activeId = plans.some((p) => p.id === v.activeId) ? (v.activeId as string) : null;
    const targetId = plans.some((p) => p.id === v.targetId) ? (v.targetId as string) : null;
    return { plans, activeId, targetId };
  } catch {
    return emptyStore();
  }
}

export function loadStore(): Store {
  try {
    return parseStore(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: Store): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORE_VERSION, ...store }));
    return true;
  } catch {
    return false;
  }
}

/** A share link's fragment: the plan without its id or timestamps. */
export function encodePlan(plan: Plan): string {
  const { id: _id, created: _c, updated: _u, ...rest } = plan;
  void _id; void _c; void _u;
  const json = JSON.stringify(rest);
  const b64 = typeof btoa === "function" ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodePlan(fragment: string): Plan | null {
  try {
    const b64 = fragment.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function" ? decodeURIComponent(escape(atob(b64))) : Buffer.from(b64, "base64").toString("utf8");
    const p = parsePlan(JSON.parse(json));
    return p ? { ...p, id: newId(), created: Date.now(), updated: Date.now() } : null;
  } catch {
    return null;
  }
}
