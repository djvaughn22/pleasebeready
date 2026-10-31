"use client";

// Where the Save buttons on a page put things. On a kit page that is the
// visitor's list for that kit (made on the first save, with the kit page's
// numbers); everywhere else it is the list picked in the Saving-to bar.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { KitNumbers } from "../../lib/shop/kitPlan";
import type { Kit } from "../../lib/shop/kits";
import { itemById } from "../../lib/stockup/catalog";
import type { Plan } from "../../lib/stockup/types";
import { useLists } from "./ListsProvider";

export type SaverApi = {
  ready: boolean;
  target: Plan | null;
  kit: Kit | null;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  saveMany: (ids: string[]) => void;
  message: string;
};

const SaverContext = createContext<SaverApi | null>(null);

export default function Saver({ kit = null, numbers, children }: { kit?: Kit | null; numbers?: KitNumbers; children: ReactNode }) {
  const api = useLists();
  const [message, setMessage] = useState("");
  const target = kit ? api.kitList(kit.slug) : api.target;

  const has = useCallback((id: string) => !!target?.list[id], [target]);

  const saveMany = useCallback((ids: string[]) => {
    if (!ids.length) return;
    const r = kit && numbers ? api.saveKit(kit, ids, numbers) : api.saveItems(ids);
    const one = ids.length === 1 ? itemById(ids[0])?.name : null;
    setMessage(r.added === 0 ? `Already on ${r.name}.` : one ? `Saved ${one} to ${r.name}.` : `Saved ${r.added} to ${r.name}.`);
  }, [api, kit, numbers]);

  const toggle = useCallback((id: string) => {
    if (target?.list[id]) {
      api.unsave(id, target.id);
      setMessage(`Removed ${itemById(id)?.name ?? "it"} from ${target.name}.`);
    } else saveMany([id]);
  }, [api, target, saveMany]);

  const value = useMemo<SaverApi>(() => ({ ready: api.ready, target, kit, has, toggle, saveMany, message }),
    [api.ready, target, kit, has, toggle, saveMany, message]);
  return <SaverContext.Provider value={value}>{children}</SaverContext.Provider>;
}

export function useSaver(): SaverApi {
  const s = useContext(SaverContext);
  if (!s) throw new Error("useSaver() needs <Saver>");
  return s;
}
