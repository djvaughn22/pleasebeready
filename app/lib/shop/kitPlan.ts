// A kit as a plan: the numbers its page shows amounts for, and the list a
// "Save this kit" makes. One function, so the page and the saved list agree.

import { clampPlan, suggest, withDays } from "../stockup/calc";
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

/** Amounts for a list of catalog ids under a plan; unknown ids are skipped. */
export function kitRows(ids: string[], plan: Plan): Suggestion[] {
  return ids.flatMap((id) => {
    const item = itemById(id);
    return item ? [suggest(item, plan)] : [];
  });
}
