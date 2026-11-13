import { describe, expect, it } from "vitest";
import { kitNumbers, kitPlan, kitRows, kitSharePath, numbersFromQuery } from "./kitPlan";
import { kits } from "./kits";

describe("kitSharePath", () => {
  it("is the plain kit link when nothing changed", () => {
    for (const kit of kits) expect(kitSharePath(kit, kitNumbers(kit))).toBe(`/kits/${kit.slug}`);
  });

  it("round-trips through numbersFromQuery, so the opener sees the same amounts", () => {
    for (const kit of kits) {
      const base = kitNumbers(kit);
      const n = { ...base, people: base.people + 2, kids: Math.min(base.kids + 1, base.people + 2), pets: base.pets + 1, days: base.days + 1 };
      const path = kitSharePath(kit, n);
      const back = numbersFromQuery(path.slice(path.indexOf("?")), base);
      expect(back).toEqual(n);
      const qty = (x: typeof n) => kitRows(kit.essentials, kitPlan(kit, x)).map((r) => [r.item.id, r.qty]);
      expect(qty(back)).toEqual(qty(n));
    }
  });
});
