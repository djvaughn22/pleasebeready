// Shopping links. There is no multi-item Amazon cart here: each item opens
// one page — our exact product when picks.ts has one, otherwise a tagged
// Amazon search, labelled as a search. Both carry the Associates tag from gear.ts.

import { amazonSearchUrl, amazonUrl } from "../gear";
import { backupQuery } from "../shop/backups";
import { primaryPick, type Pick as Product } from "../shop/picks";
import { toBuy, unitWord } from "./calc";
import type { CatalogItem, Plan, Suggestion } from "./types";

export type ShopLink = { url: string; kind: "product" | "search"; label: string; pick?: Product };

export function shopLink(item: CatalogItem): ShopLink {
  const pick = primaryPick(item.id);
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

/** An amount in packages of our pick, when the pick says how many are in one: "4 cases of 24", "2 packs of 2". */
export function packsText(item: CatalogItem, qty: number): string | null {
  const per = primaryPick(item.id)?.count;
  if (!per || per <= 1 || qty <= 0) return null;
  const packs = Math.ceil(qty / per);
  const one = item.cat === "water" ? "case" : "pack";
  return `${packs.toLocaleString("en-US")} ${packs === 1 ? one : `${one}s`} of ${per}`;
}

/** Plain-text list for copying, texting or saving. */
export type TextRow = { s: Suggestion; qty: number; have: number; got: boolean; ready?: boolean; restock?: boolean; note?: string };

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
    const exact = packsText(r.s.item, need);
    const packs = exact ? ` (${exact})` : !primaryPick(r.s.item.id) && r.s.item.pack && need > 0 ? ` (${Math.ceil(need / r.s.item.pack)} × ${r.s.item.pack}-pack)` : "";
    const status = statusText(r);
    lines.push(`${mark} ${r.s.item.name}: ${need} ${unitWord(r.s.item, need)}${packs}${r.have ? ` · have ${r.have}` : ""}${status ? ` · ${status}` : ""}${note}`);
  }
  lines.push("", "Amounts are planning estimates. Adjust them for your group.");
  return lines.join("\n");
}

export { toBuy };
