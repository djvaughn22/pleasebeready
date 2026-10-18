"use client";

// The planner's state. It starts as the default plan (so server and first
// client render match), then loads whatever this device saved, and saves every
// change back to this device. Nothing here sends data anywhere.

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeHorizon, normalizeHousehold } from "../../lib/planner/calc";
import {
  clearSaved, defaultState, loadSaved, save, savingEnabled, setSavingEnabled,
} from "../../lib/planner/storage";
import type {
  BucketId, Horizon, Household, ItemState, PlanState, ScenarioId,
} from "../../lib/planner/types";

export function usePlanner() {
  const [state, setState] = useState<PlanState>(defaultState);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(true);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  // Load after the first render so server and client markup match.
  useEffect(() => {
    const t = setTimeout(() => {
      const saved = loadSaved();
      if (saved) {
        setState(saved);
        setRestored(true);
      }
      setSaving(savingEnabled());
      loaded.current = true;
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loaded.current) save(state);
  }, [state]);

  const setHousehold = useCallback((patch: Partial<Household>) => {
    setState((s) => ({ ...s, household: normalizeHousehold({ ...s.household, ...patch }) }));
  }, []);

  const setHorizon = useCallback((patch: Partial<Horizon>) => {
    setState((s) => ({ ...s, horizon: normalizeHorizon({ ...s.horizon, ...patch }) }));
  }, []);

  const toggleScenario = useCallback((id: ScenarioId) => {
    setState((s) => ({
      ...s,
      scenarios: s.scenarios.includes(id) ? s.scenarios.filter((x) => x !== id) : [...s.scenarios, id],
    }));
  }, []);

  const setHotWeather = useCallback((on: boolean) => setState((s) => ({ ...s, hotWeather: on })), []);

  const setItem = useCallback((id: string, patch: Partial<ItemState>) => {
    setState((s) => {
      const merged: ItemState = { ...s.items[id], ...patch, status: patch.status ?? s.items[id]?.status ?? "needs" };
      // Drop fields set back to "no override" so saved plans stay small.
      for (const k of ["qty", "have", "cost"] as const) if (merged[k] === undefined) delete merged[k];
      const items = { ...s.items };
      if (merged.status === "needs" && Object.keys(merged).length === 1) delete items[id];
      else items[id] = merged;
      return { ...s, items };
    });
  }, []);

  const setBudgetTotal = useCallback((total: number | null) => {
    setState((s) => ({ ...s, budget: { ...s.budget, total } }));
  }, []);

  const setBucketBudget = useCallback((bucket: BucketId, value: number | null) => {
    setState((s) => {
      const buckets = { ...s.budget.buckets };
      if (value === null) delete buckets[bucket];
      else buckets[bucket] = value;
      return { ...s, budget: { ...s.budget, buckets } };
    });
  }, []);

  const togglePick = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      picks: s.picks.includes(id) ? s.picks.filter((x) => x !== id) : [...s.picks, id],
    }));
  }, []);

  const replace = useCallback((next: PlanState) => setState(next), []);

  const reset = useCallback(() => {
    clearSaved();
    setState(defaultState());
    setRestored(false);
  }, []);

  const setSavingOn = useCallback((on: boolean) => {
    setSavingEnabled(on);
    setSaving(on);
    if (on) save(state);
  }, [state]);

  return {
    state, ready, saving, restored,
    setHousehold, setHorizon, toggleScenario, setHotWeather, setItem,
    setBudgetTotal, setBucketBudget, togglePick, replace, reset, setSavingOn,
  };
}

export type Planner = ReturnType<typeof usePlanner>;
