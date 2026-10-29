// Shopping links. There is no multi-item Amazon cart here: each item opens
// one page — the title-verified product when readiness.ts has one, otherwise
// a tagged Amazon search. Both carry the Associates tag from gear.ts.

import { amazonSearchUrl, amazonUrl } from "../gear";
import { gearFor } from "./catalog";
import { toBuy, unitWord } from "./calc";
import type { CatalogItem, Plan, Suggestion } from "./types";

export type ShopLink = { url: string; kind: "product" | "search"; label: string };

export function shopLink(item: CatalogItem): ShopLink {
  const gear = item.asin ? gearFor(item.asin) : undefined;
  if (gear) return { url: amazonUrl(gear.asin), kind: "product", label: gear.name };
  const q = item.q ?? item.name;
  return { url: amazonSearchUrl(q), kind: "search", label: `Amazon search: “${q}”` };
}

/** Plain-text list for copying, texting or saving. */
export function listText(plan: Plan, rows: { s: Suggestion; qty: number; have: number; got: boolean }[]): string {
  const lines = [`${plan.name} — PleaseBeReady stock-up list`, ""];
  for (const r of rows) {
    const need = Math.max(0, r.qty - r.have);
    const mark = r.got || need === 0 ? "[x]" : "[ ]";
    const packs = r.s.item.pack && need > 0 ? ` (${Math.ceil(need / r.s.item.pack)} × ${r.s.item.pack}-pack)` : "";
    lines.push(`${mark} ${r.s.item.name}: ${need} ${unitWord(r.s.item, need)}${packs}${r.have ? ` · have ${r.have}` : ""}`);
  }
  lines.push("", "Amounts are planning estimates. Adjust them for your group.");
  return lines.join("\n");
}

export { toBuy };
