"use client";

// One copy of the visitor's saved lists per page, shared by every Save button,
// the Saving-to bar and the Lists page. The lists themselves live in this
// browser's storage (see lib/stockup/storage.ts).

import { createContext, useContext, type ReactNode } from "react";
import { usePlans, type PlansApi } from "../stockup/usePlans";

const ListsContext = createContext<PlansApi | null>(null);

export default function ListsProvider({ children, importLinks = false }: { children: ReactNode; importLinks?: boolean }) {
  const api = usePlans({ importLinks });
  return <ListsContext.Provider value={api}>{children}</ListsContext.Provider>;
}

export function useLists(): PlansApi {
  const api = useContext(ListsContext);
  if (!api) throw new Error("useLists() needs <ListsProvider>");
  return api;
}
