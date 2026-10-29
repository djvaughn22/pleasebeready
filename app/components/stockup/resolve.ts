// A plan's list lines, resolved against the whole catalog (not only this
// occasion's suggestions), so items added through "search every item" still
// get an amount. Rows come back in category order.
import { suggest, toBuy } from "../../lib/stockup/calc";
import { catalog, categories } from "../../lib/stockup/catalog";
import type { Line, Plan, Suggestion } from "../../lib/stockup/types";

export type Row = { s: Suggestion; line: Line };

const order = new Map(categories.map((c, i) => [c.id, i]));

export function listRows(plan: Plan): Row[] {
  return catalog
    .filter((c) => plan.list[c.id])
    .sort((a, b) => order.get(a.cat)! - order.get(b.cat)!)
    .map((c) => ({ s: suggest(c, plan), line: plan.list[c.id] }));
}

export function countLeft(plan: Plan): number {
  return listRows(plan).filter((r) => !r.line.got && toBuy(r.line, r.s) > 0).length;
}
