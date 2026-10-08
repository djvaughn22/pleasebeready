"use client";

// On-device check marks for the checklist. Nothing leaves the browser.
// Storage can be missing (private windows, blocked site data); the checklist
// still works, it just forgets on reload.

import { useCallback, useEffect, useState } from "react";

const KEY = "pbr:checked:v1";
const EVENT = "pbr-checked";

// Fallback when storage throws, shared by every checklist on the page.
let memory: string[] = [];

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    memory = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    // keep the in-memory marks
  }
  return memory;
}

export function useChecks() {
  const [checked, setChecked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const sync = () => setChecked(new Set(read()));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const next = new Set(read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    memory = [...next];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(memory));
    } catch {
      // storage unavailable: keep the mark for this page view only
    }
    setChecked(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { checked, toggle };
}
