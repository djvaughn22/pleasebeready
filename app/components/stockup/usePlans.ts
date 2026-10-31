"use client";

// Every saved list, kept in this browser. Starts empty (so server and first
// client render match), then loads what this device saved and, on the Lists
// page, any list shared in the link (#plan=…) or started from one (?start=…),
// and saves each change back.

import { useCallback, useEffect, useRef, useState } from "react";
import { measure } from "../../lib/measure";
import { kitPlan, type KitNumbers } from "../../lib/shop/kitPlan";
import type { Kit } from "../../lib/shop/kits";
import { clampPlan } from "../../lib/stockup/calc";
import { occasions } from "../../lib/stockup/catalog";
import { STORAGE_KEY, decodePlan, emptyStore, loadStore, newId, newPlan, parseStore, saveStore, type Store } from "../../lib/stockup/storage";
import type { Line, OccasionId, Plan } from "../../lib/stockup/types";

/** The list Save buttons use when the visitor has none yet. */
const GENERAL: Partial<Plan> = { name: "My Ready List", people: 4, days: 7, nights: 7, meals: 3 };

const fresh = (): Line => ({ qty: null, have: 0, got: false });

export function usePlans({ importLinks = false }: { importLinks?: boolean } = {}) {
  const [store, setStore] = useState<Store>(emptyStore);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved" | "failed">("idle");
  const [imported, setImported] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      let s = loadStore();
      if (importLinks) {
        const m = window.location.hash.match(/^#plan=([A-Za-z0-9_-]+)$/);
        if (m) {
          const p = decodePlan(m[1]);
          if (p) {
            s = { ...s, plans: [p, ...s.plans], activeId: p.id };
            setImported(p.name);
            measure("plan_start", `shared-${p.occasion}`);
          }
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        // #list=<id> opens one saved list (the Open list links on shop pages).
        const open = window.location.hash.match(/^#list=([a-z0-9]+)$/);
        if (open) {
          if (s.plans.some((p) => p.id === open[1])) s = { ...s, activeId: open[1] };
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        // ?start=<situation> opens a new list of that kind (links from posts land here).
        // Only `start` is removed, so campaign tags (utm_…) stay for analytics.
        const params = new URLSearchParams(window.location.search);
        const start = params.get("start");
        if (start && occasions.some((o) => o.id === start)) {
          const p = newPlan(start as OccasionId);
          s = { ...s, plans: [p, ...s.plans], activeId: p.id };
          measure("plan_start", `link-${p.occasion}`);
          params.delete("start");
          const qs = params.toString();
          history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
        }
      }
      loaded.current = true;
      setStore(s);
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, [importLinks]);

  // Another tab changed the lists: take its copy, so tabs never overwrite each other.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !loaded.current) return;
      const next = parseStore(e.newValue);
      setStore((cur) => ({
        plans: next.plans,
        activeId: next.plans.some((p) => p.id === cur.activeId) ? cur.activeId : null,
        targetId: next.targetId ?? null,
      }));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    setSaved(saveStore(store) ? "saved" : "failed");
  }, [store]);

  const active = store.plans.find((p) => p.id === store.activeId) ?? null;

  /** Where Save buttons put things: the chosen list, else the most recently changed one. */
  const target = store.plans.find((p) => p.id === store.targetId)
    ?? [...store.plans].sort((a, b) => b.updated - a.updated)[0] ?? null;

  const open = useCallback((id: string | null) => {
    setStore((s) => ({ ...s, activeId: id }));
    window.scrollTo({ top: 0 });
  }, []);

  const create = useCallback((occasion: OccasionId, patch: Partial<Plan> = {}) => {
    const p = clampPlan({ ...newPlan(occasion), ...patch });
    measure("plan_start", `picker-${occasion}`);
    setStore((s) => ({ ...s, plans: [p, ...s.plans], activeId: p.id }));
    window.scrollTo({ top: 0 });
  }, []);

  const update = useCallback((id: string, fn: (p: Plan) => Plan) => {
    setStore((s) => ({
      ...s,
      plans: s.plans.map((p) => (p.id === id ? { ...clampPlan(fn(p)), updated: Date.now() } : p)),
    }));
  }, []);

  const duplicate = useCallback((id: string) => {
    setStore((s) => {
      const src = s.plans.find((p) => p.id === id);
      if (!src) return s;
      const list: Record<string, Line> = {};
      for (const [k, l] of Object.entries(src.list)) list[k] = { ...l, got: false, ready: undefined, restock: undefined };
      const copy: Plan = { ...src, id: newId(), name: `${src.name} (copy)`.slice(0, 80), created: Date.now(), updated: Date.now(), list };
      return { ...s, plans: [copy, ...s.plans], activeId: copy.id };
    });
    window.scrollTo({ top: 0 });
  }, []);

  const remove = useCallback((id: string) => {
    setStore((s) => ({
      plans: s.plans.filter((p) => p.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
      targetId: s.targetId === id ? null : s.targetId,
    }));
  }, []);

  const setTarget = useCallback((id: string | null) => setStore((s) => ({ ...s, targetId: id })), []);

  /** A new empty list for Save buttons to use, without opening it. Returns its id. */
  const makeList = useCallback((name?: string) => {
    const p = clampPlan({ ...newPlan("home"), ...GENERAL, ...(name ? { name: name.slice(0, 80) } : {}) });
    measure("plan_start", "save-home");
    setStore((s) => ({ ...s, plans: [p, ...s.plans], targetId: p.id }));
    return p.id;
  }, []);

  /**
   * Save catalog items to a list: the one given, else the current target, else a new
   * "My Ready List". Items already there stay as they are. Returns the list's name and
   * how many were new.
   */
  const saveItems = useCallback((ids: string[], planId?: string): { name: string; added: number } => {
    const into = (planId && store.plans.find((p) => p.id === planId)) || (!planId && target) || null;
    if (!into) {
      const p = clampPlan({ ...newPlan("home"), ...GENERAL });
      for (const id of ids) p.list[id] = fresh();
      measure("plan_start", "save-home");
      if (ids.length === 1) measure("save_item", ids[0]);
      setStore((s) => ({ ...s, plans: [p, ...s.plans], targetId: p.id }));
      return { name: p.name, added: ids.length };
    }
    const added = ids.filter((id) => !into.list[id]);
    if (added.length === 1) measure("save_item", added[0]);
    else if (added.length > 1) measure("plan_add", `many-${into.occasion}`);
    setStore((s) => ({
      ...s,
      targetId: into.id,
      plans: s.plans.map((p) => {
        if (p.id !== into.id) return p;
        const list = { ...p.list };
        for (const id of ids) if (!list[id]) list[id] = fresh();
        return { ...p, list, updated: Date.now() };
      }),
    }));
    return { name: into.name, added: added.length };
  }, [store.plans, target]);

  const unsave = useCallback((id: string, planId: string) => {
    update(planId, (p) => {
      const list = { ...p.list };
      delete list[id];
      return { ...p, list };
    });
  }, [update]);

  /** The list started from this kit, if the visitor has one. */
  const kitList = useCallback((slug: string) => store.plans.find((p) => p.kit === slug) ?? null, [store.plans]);

  /**
   * Save a kit's items as a list. Adds to the list already made from this kit, or
   * makes one with the kit's numbers. Returns the list id, its name and how many were new.
   */
  const saveKit = useCallback((kit: Kit, ids: string[], n: KitNumbers): { id: string; name: string; added: number; existing: boolean } => {
    measure("save_kit", kit.slug);
    const have = store.plans.find((p) => p.kit === kit.slug);
    if (have) {
      const r = saveItems(ids, have.id);
      return { id: have.id, name: r.name, added: r.added, existing: true };
    }
    const p = { ...kitPlan(kit, n), id: newId(), created: Date.now(), updated: Date.now(), list: {} as Record<string, Line> };
    for (const id of ids) p.list[id] = fresh();
    measure("plan_start", `kit-${kit.base}`);
    setStore((s) => ({ ...s, plans: [p, ...s.plans], targetId: p.id }));
    return { id: p.id, name: p.name, added: ids.length, existing: false };
  }, [store.plans, saveItems]);

  return { store, ready, saved, imported, active, target, open, create, update, duplicate, remove, setTarget, makeList, saveItems, unsave, kitList, saveKit };
}

export type PlansApi = ReturnType<typeof usePlans>;
