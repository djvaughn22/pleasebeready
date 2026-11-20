// Shopping links. There is no multi-item Amazon cart here: each item opens
// one page — our exact product when picks.ts has one, otherwise a tagged
// Amazon search, labelled as a search. Both carry the Associates tag from gear.ts.

import { amazonSearchUrl, amazonUrl } from "../gear";
import { backupQuery } from "../shop/backups";
import { chosenPick, offerFor, packText } from "../shop/offers";
import { primaryPick, type Pick as Product } from "../shop/picks";
import { toBuy, unitWord } from "./calc";
import type { CatalogItem, Plan, Suggestion } from "./types";

export type ShopLink = { url: string; kind: "product" | "search"; label: string; pick?: Product };

/** `chosen`: the ASIN a visitor swapped to on their list, while we still list it. */
export function shopLink(item: CatalogItem, chosen?: string): ShopLink {
  const pick = chosenPick(item.id, chosen);
  if (pick) return { url: amazonUrl(pick.asin), kind: "product", label: pick.name, pick };
  const q = item.q ?? item.name;
  return { url: amazonSearchUrl(q), kind: "search", label: `Amazon search: “${q}”` };
}

/** The labelled search beside an exact product, for when it's sold out. Null when the main button is already a search. */
export function backupLink(item: CatalogItem): { url: string; q: string } | null {
  if (!primaryPick(item.id)) return null;
  const q = backupQuery(item.id, item.q ?? item.name.toLowerCase());
  return { url: amazonSearchUrl(q), q };
}

/**
 * An amount in packages of the product a line opens (our pick, or the visitor's swap), when it
 * comes in packs: "4 cases of 24", "2 packs of 2". Null for single items and when nothing is needed.
 */
export function packsText(item: CatalogItem, qty: number, chosen?: string): string | null {
  const pick = chosenPick(item.id, chosen);
  if (!pick?.count || pick.count <= 1 || qty <= 0) return null;
  return packText(offerFor(pick, qty), item);
}

/** Plain-text list for copying, texting or saving. */
export type TextRow = { s: Suggestion; qty: number; have: number; got: boolean; ready?: boolean; restock?: boolean; note?: string; pick?: string };

/** One line's status in words: ready beats bought; restock means buy it again. */
export const statusText = (r: Pick<TextRow, "got" | "ready" | "restock">) =>
  r.ready ? "ready" : r.got ? "bought" : r.restock ? "restock" : "";

export function listText(plan: Plan, rows: TextRow[]): string {
  const lines = [`${plan.name} — PleaseBeReady list`, ""];
  if (plan.note) lines.push(plan.note, "");
  for (const r of rows) {
    const note = r.note ? ` — ${r.note}` : "";
    if (r.s.item.kind === "task") {
      lines.push(`${r.got ? "[x]" : "[ ]"} To do: ${r.s.item.name}${note}`);
      continue;
    }
    const need = Math.max(0, r.qty - r.have);
    const mark = r.got || r.ready || need === 0 ? "[x]" : "[ ]";
    const product = chosenPick(r.s.item.id, r.pick);
    const offer = product && need > 0 ? offerFor(product, need) : null;
    const buy = offer && (offer.per > 1 || offer.recounted || product!.each) ? ` (buy ${packText(offer, r.s.item)})` : !product && r.s.item.pack && need > 0 ? ` (${Math.ceil(need / r.s.item.pack)} × ${r.s.item.pack}-pack)` : "";
    const status = statusText(r);
    const named = product ? ` — ${product.name}` : "";
    lines.push(`${mark} ${r.s.item.name}: ${need} ${unitWord(r.s.item, need)}${buy}${named}${r.have ? ` · have ${r.have}` : ""}${status ? ` · ${status}` : ""}${note}`);
  }
  lines.push("", "Amounts are planning estimates. Adjust them for your group.");
  return lines.join("\n");
}

export { toBuy };
