// Stock-up math. Every amount is a planning rule applied to the plan's
// people and length; `how` spells out the arithmetic so nothing looks exact.

import { catalog, categories, occasionById } from "./catalog";
import type { CatalogItem, Climate, Line, Need, Per, Plan, Suggestion } from "./types";

export const MAX_PEOPLE = 500;
export const MAX_DAYS = 365;

/** Needs a plan can switch on. Kids, babies and pets come from their counts. */
export const NEED_IDS: Need[] = ["older", "mobility", "medical"];
export const CLIMATE_IDS: Climate[] = ["cold", "hot", "wet"];

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

export function adults(plan: Plan): number {
  return Math.max(0, plan.people - plan.kids - plan.babies);
}

/** Keep counts whole, in range, and kids + babies within the group. */
export function clampPlan(plan: Plan): Plan {
  const int = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(Number.isFinite(n) ? n : lo)));
  const people = int(plan.people, 1, MAX_PEOPLE);
  const babies = int(plan.babies, 0, people);
  const kids = int(plan.kids, 0, people - babies);
  return {
    ...plan, people, kids, babies,
    pets: int(plan.pets, 0, 50),
    needs: [...new Set(plan.needs ?? [])].filter((n) => NEED_IDS.includes(n)),
    climate: [...new Set(plan.climate ?? [])].filter((c) => CLIMATE_IDS.includes(c)),
    days: int(plan.days, 1, MAX_DAYS),
    nights: int(plan.nights, 0, MAX_DAYS),
    meals: int(plan.meals, 0, 6),
  };
}

/** The count a rule multiplies, and the words for it. */
function base(per: Per, plan: Plan): { count: number; words: string } {
  const p = plural(plan.people, "person", "people");
  const d = plural(plan.days, "day", "days");
  switch (per) {
    case "group": return { count: 1, words: "for the group" };
    case "person": return { count: plan.people, words: p };
    case "adult": return { count: adults(plan), words: plural(adults(plan), "adult", "adults") };
    case "kid": return { count: plan.kids, words: plural(plan.kids, "kid", "kids") };
    case "baby": return { count: plan.babies, words: plural(plan.babies, "baby", "babies") };
    case "pet": return { count: plan.pets, words: plural(plan.pets, "pet", "pets") };
    case "personDay": return { count: plan.people * plan.days, words: `${p} × ${d}` };
    case "kidDay": return { count: plan.kids * plan.days, words: `${plural(plan.kids, "kid", "kids")} × ${d}` };
    case "babyDay": return { count: plan.babies * plan.days, words: `${plural(plan.babies, "baby", "babies")} × ${d}` };
    case "petDay": return { count: plan.pets * plan.days, words: `${plural(plan.pets, "pet", "pets")} × ${d}` };
    case "personNight": {
      const nights = Math.max(1, plan.nights);
      return { count: plan.people * nights, words: `${p} × ${plural(nights, "night", "nights")}` };
    }
    case "varies": case "task": return { count: 1, words: "" };
    case "personMeal": {
      const meals = Math.max(1, plan.days * plan.meals);
      return { count: plan.people * meals, words: `${p} × ${plural(meals, "meal", "meals")}` };
    }
  }
}

export function unitWord(item: CatalogItem, n: number): string {
  return n === 1 ? item.unit.one : item.unit.many;
}

/** Suggested amount for one item; always at least 1 when the item applies. */
export function suggest(item: CatalogItem, plan: Plan): Suggestion {
  if (item.rule.per === "task") return { item, qty: 0, how: "A task, not something to buy", packs: null };
  if (item.rule.per === "varies") return { item, qty: 1, how: "Amount varies; start with 1 and adjust", packs: null };
  const { count, words } = base(item.rule.per, plan);
  const raw = count * item.rule.n;
  const qty = Math.max(1, Math.ceil(raw - 1e-9));
  const rate = item.rule.per === "group" ? "" : ` × ${item.rule.n.toLocaleString("en-US")}`;
  const how = item.rule.per === "group"
    ? `${plural(qty, item.unit.one, item.unit.many)} for the group`
    : `${words}${rate} = ${plural(qty, item.unit.one, item.unit.many)}${raw < qty - 1e-9 && raw > 0 ? " (rounded up)" : ""}`;
  return { item, qty, how, packs: item.pack ? Math.ceil(qty / item.pack) : null };
}

/** Does the item fit this plan's people? (kids, babies and pets only when present) */
export function fitsPeople(item: CatalogItem, plan: Plan): boolean {
  if (item.needs === "kids") return plan.kids > 0;
  if (item.needs === "babies") return plan.babies > 0;
  if (item.needs === "pets") return plan.pets > 0;
  if (item.needs) return plan.needs.includes(item.needs);
  return true;
}

/** Weather-only items show when the plan's weather (or its situation) includes it. */
export function fitsClimate(item: CatalogItem, plan: Plan): boolean {
  if (!item.climate) return true;
  return plan.climate.includes(item.climate) || !!occasionById(plan.occasion).implies?.includes(item.climate);
}

/** Suggestions for the plan's occasion, in category order. */
export function suggestionsFor(plan: Plan): Suggestion[] {
  return catalog
    .filter((c) => c.occ.includes(plan.occasion) && fitsPeople(c, plan) && fitsClimate(c, plan))
    .map((c) => suggest(c, plan))
    .sort((a, b) => catIndex(a.item) - catIndex(b.item));
}

/** Every catalog item, for browsing and "search every item". Nothing is hidden here. */
export function everything(plan: Plan): Suggestion[] {
  return catalog
    .map((c) => suggest(c, plan))
    .sort((a, b) => catIndex(a.item) - catIndex(b.item));
}

const catIndex = (c: CatalogItem) => categories.findIndex((k) => k.id === c.cat);

/** The amount on the list: the visitor's own number, or the suggestion. */
export function lineQty(line: Line, s: Suggestion): number {
  return line.qty ?? s.qty;
}

/** What is left to buy after what the visitor already has. Tasks are never bought. */
export function toBuy(line: Line, s: Suggestion): number {
  if (s.item.kind === "task") return 0;
  return Math.max(0, lineQty(line, s) - line.have);
}

/** Done: a task ticked off, or a product bought or already covered. */
export function isDone(line: Line, s: Suggestion): boolean {
  return line.got || (s.item.kind === "product" && toBuy(line, s) === 0);
}

export function matches(item: CatalogItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${item.name} ${item.q ?? ""} ${item.note ?? ""} ${categories.find((k) => k.id === item.cat)?.title ?? ""}`.toLowerCase();
  return q.split(/\s+/).every((w) => hay.includes(w));
}

/** "8 people · 3 days, 2 nights" */
export function planSummary(plan: Plan): string {
  const o = occasionById(plan.occasion);
  const parts = [plural(plan.people, "person", "people")];
  if (plan.kids) parts.push(plural(plan.kids, "kid", "kids"));
  if (plan.babies) parts.push(plural(plan.babies, "baby", "babies"));
  if (plan.pets) parts.push(plural(plan.pets, "pet", "pets"));
  const time = plan.nights > 0 ? `${plural(plan.days, "day", "days")}, ${plural(plan.nights, "night", "nights")}` : plural(plan.days, "day", "days");
  return `${o.emoji} ${o.label} · ${parts.join(", ")} · ${time}`;
}
