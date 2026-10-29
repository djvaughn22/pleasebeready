"use client";

// Every saved plan, kept in this browser. Starts empty (so server and first
// client render match), then loads what this device saved and any plan
// shared in the link (#plan=…), and saves each change back.

import { useCallback, useEffect, useRef, useState } from "react";
import { measure } from "../../lib/measure";
import { clampPlan } from "../../lib/stockup/calc";
import { occasions } from "../../lib/stockup/catalog";
import { STORAGE_KEY, decodePlan, emptyStore, loadStore, newId, newPlan, parseStore, saveStore, type Store } from "../../lib/stockup/storage";
import type { Line, OccasionId, Plan } from "../../lib/stockup/types";

export function usePlans() {
  const [store, setStore] = useState<Store>(emptyStore);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saved" | "failed">("idle");
  const [imported, setImported] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      let s = loadStore();
      const m = window.location.hash.match(/^#plan=([A-Za-z0-9_-]+)$/);
      if (m) {
        const p = decodePlan(m[1]);
        if (p) {
          s = { plans: [p, ...s.plans], activeId: p.id };
          setImported(p.name);
          measure("plan_start", `shared-${p.occasion}`);
        }
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      // ?start=<situation> opens a new plan of that kind (links from posts land here).
      const start = new URLSearchParams(window.location.search).get("start");
      if (start && occasions.some((o) => o.id === start)) {
        const p = newPlan(start as OccasionId);
        s = { plans: [p, ...s.plans], activeId: p.id };
        measure("plan_start", `link-${p.occasion}`);
        history.replaceState(null, "", window.location.pathname + window.location.hash);
      }
      loaded.current = true;
      setStore(s);
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Another tab changed the plans: take its copy, so tabs never overwrite each other.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !loaded.current) return;
      const next = parseStore(e.newValue);
      setStore((cur) => ({ plans: next.plans, activeId: next.plans.some((p) => p.id === cur.activeId) ? cur.activeId : null }));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    setSaved(saveStore(store) ? "saved" : "failed");
  }, [store]);

  const active = store.plans.find((p) => p.id === store.activeId) ?? null;

  const open = useCallback((id: string | null) => {
    setStore((s) => ({ ...s, activeId: id }));
    window.scrollTo({ top: 0 });
  }, []);

  const create = useCallback((occasion: OccasionId, patch: Partial<Plan> = {}) => {
    const p = clampPlan({ ...newPlan(occasion), ...patch });
    measure("plan_start", `picker-${occasion}`);
    setStore((s) => ({ plans: [p, ...s.plans], activeId: p.id }));
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
      for (const [k, l] of Object.entries(src.list)) list[k] = { ...l, got: false };
      const copy: Plan = { ...src, id: newId(), name: `${src.name} (copy)`.slice(0, 80), created: Date.now(), updated: Date.now(), list };
      return { plans: [copy, ...s.plans], activeId: copy.id };
    });
    window.scrollTo({ top: 0 });
  }, []);

  const remove = useCallback((id: string) => {
    setStore((s) => ({ plans: s.plans.filter((p) => p.id !== id), activeId: s.activeId === id ? null : s.activeId }));
  }, []);

  return { store, ready, saved, imported, active, open, create, update, duplicate, remove };
}

export type PlansApi = ReturnType<typeof usePlans>;
