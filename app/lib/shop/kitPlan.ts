// A kit as a plan: the numbers its page shows amounts for, and the list a
// "Save this kit" makes. One function, so the page and the saved list agree.

import { MAX_DAYS, MAX_PEOPLE, clampPlan, suggest, withDays } from "../stockup/calc";
import { itemById } from "../stockup/catalog";
import { newPlan } from "../stockup/storage";
import type { Plan, Suggestion } from "../stockup/types";
import type { Kit } from "./kits";

export type KitNumbers = { people: number; kids: number; babies: number; pets: number; days: number };

export const kitNumbers = (kit: Kit): KitNumbers => ({
  people: kit.preset.people, kids: kit.preset.kids ?? 0, babies: kit.preset.babies ?? 0, pets: kit.preset.pets ?? 0, days: kit.preset.days,
});

export function kitPlan(kit: Kit, n: KitNumbers = kitNumbers(kit)): Plan {
  let p = withDays(newPlan(kit.base), kit.preset.days);
  if (kit.preset.nights !== undefined) p = { ...p, nights: kit.preset.nights };
  if (kit.preset.meals !== undefined) p = { ...p, meals: kit.preset.meals };
  p = clampPlan({
    ...p, name: kit.title, kit: kit.slug, people: n.people, kids: n.kids, babies: n.babies, pets: n.pets,
    needs: kit.preset.needs ?? [], climate: kit.preset.climate ?? [],
  });
  return n.days === kit.preset.days ? p : withDays(p, n.days);
}

/**
 * Numbers from a kit link (?people=6&kids=2&pets=1&days=5). A number that is
 * missing, blank or out of range keeps the current value; an absent ?pets= is
 * not "0 pets".
 */
export function numbersFromQuery(search: string, cur: KitNumbers): KitNumbers {
  const q = new URLSearchParams(search);
  const num = (k: string, lo: number, hi: number) => {
    const raw = q.get(k)?.trim();
    if (!raw) return undefined;
    const v = Number(raw);
    return Number.isInteger(v) && v >= lo && v <= hi ? v : undefined;
  };
  const next = { ...cur };
  next.people = num("people", 1, MAX_PEOPLE) ?? next.people;
  next.kids = num("kids", 0, MAX_PEOPLE) ?? next.kids;
  next.pets = num("pets", 0, 50) ?? next.pets;
  next.days = num("days", 1, MAX_DAYS) ?? next.days;
  next.people = Math.max(next.people, next.kids + next.babies);
  return next;
}

/** Amounts for a list of catalog ids under a plan; unknown ids are skipped. */
export function kitRows(ids: string[], plan: Plan): Suggestion[] {
  return ids.flatMap((id) => {
    const item = itemById(id);
    return item ? [suggest(item, plan)] : [];
  });
}

/**
 * The kit's link with this group's numbers, for "Share this kit". Only numbers
 * that differ from the kit's own preset go in, using the same names
 * numbersFromQuery reads, so the person who opens it sees the same amounts.
 * Nothing about the family but four counts; no list contents, no names.
 */
export function kitSharePath(kit: Kit, n: KitNumbers): string {
  const base = kitNumbers(kit);
  const q = new URLSearchParams();
  for (const k of ["people", "kids", "pets", "days"] as const) if (n[k] !== base[k]) q.set(k, String(n[k]));
  const s = q.toString();
  return s ? `/kits/${kit.slug}?${s}` : `/kits/${kit.slug}`;
}
