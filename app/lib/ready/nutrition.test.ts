import { describe, expect, it } from "vitest";
import { primaryPick } from "../shop/picks";
import { DAYS, PEOPLE, bundle } from "./bundle";
import { CALORIES_PER_DAY, LABELS, PROTEIN_PER_DAY, labelFor } from "./nutrition";
import { FOOD_MIX, foodMix } from "./supplies";

const kcal = (rows: { id: string; qty?: number; units?: number }[]) => rows.reduce((t, r) => t + (r.qty ?? r.units ?? 0) * (labelFor(r.id)?.kcal ?? 0), 0);
const protein = (rows: { id: string; qty?: number; units?: number }[]) => rows.reduce((t, r) => t + (r.qty ?? r.units ?? 0) * (labelFor(r.id)?.protein ?? 0), 0);

describe("food is counted by label calories, not by cans", () => {
  it("every food in the mix has a label for the product we link", () => {
    expect(FOOD_MIX.reduce((t, m) => t + m.share, 0)).toBeCloseTo(1, 9);
    for (const m of FOOD_MIX) {
      const l = labelFor(m.id);
      expect(l, m.id).toBeTruthy();
      expect(l!.asin, m.id).toBe(primaryPick(m.id)!.asin);
      expect(l!.kcal, m.id).toBeGreaterThan(0);
      expect(l!.source, m.id).toMatch(/^https:\/\//);
    }
    expect(LABELS.every((l) => !l.source.includes("amazon."))).toBe(true);
  });

  it("the mix gives at least 2,000 calories and 50 g of protein per person-day, counting only proteins a label showed", () => {
    for (const d of [1, 3, 5, 7, 28, 150]) {
      const m = foodMix(d);
      expect(kcal(m), `${d}`).toBeGreaterThanOrEqual(d * CALORIES_PER_DAY);
      expect(protein(m), `${d}`).toBeGreaterThanOrEqual(d * PROTEIN_PER_DAY);
    }
  });

  it("every Food & Water bundle covers its person-days in calories and protein", () => {
    for (const p of PEOPLE) for (const d of DAYS) {
      const rows = bundle(p, d).food.rows;
      expect(kcal(rows), `${p}×${d}`).toBeGreaterThanOrEqual(p * d * CALORIES_PER_DAY);
      expect(protein(rows), `${p}×${d}`).toBeGreaterThanOrEqual(p * d * PROTEIN_PER_DAY);
    }
  });

  it("the old count would have claimed a week for four on about 45,000 calories: no longer", () => {
    // Before Nov 2026: 28 cans of soup, 9 tuna, 9 beans, 14 vegetables, 9 fruit, 28 milk, 2 jars, 3 boxes, 56 bars = 28 person-days.
    const old = [["canned-soups-and-stews", 28], ["canned-tuna-or-chicken", 9], ["canned-beans", 9], ["canned-vegetables", 14], ["canned-fruit", 9],
      ["shelf-stable-milk", 28], ["peanut-butter", 2], ["pretzels-and-crackers", 3], ["granola-or-protein-bars", 56]].map(([id, qty]) => ({ id: id as string, qty: qty as number }));
    expect(kcal(old)).toBeLessThan(28 * CALORIES_PER_DAY * 0.85);
  });
});
