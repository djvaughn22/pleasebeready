import { describe, expect, it } from "vitest";
import { newPlan } from "../stockup/storage";
import { foodMix, waterOptions } from "./supplies";

describe("water and food amounts", () => {
  it("four people for seven days: 28 gallons, filled three ways", () => {
    expect(waterOptions(28)).toEqual({ cases: 9, jugs: 28, containers: 4 });
    expect(waterOptions(3)).toEqual({ cases: 1, jugs: 3, containers: 1 });
    expect(waterOptions(240)).toEqual({ cases: 76, jugs: 240, containers: 35 });
  });

  it("28 person-days of food as a grocery mix, counted by label calories, no single product standing in for a day", () => {
    const mix = Object.fromEntries(foodMix(28).map((m) => [m.id, m.qty]));
    expect(mix).toEqual({
      "canned-soups-and-stews": 43, "canned-tuna-or-chicken": 25, "canned-beans": 17, "canned-vegetables": 23, "canned-fruit": 22,
      "shelf-stable-milk": 30, "peanut-butter": 2, "pretzels-and-crackers": 3, "granola-or-protein-bars": 71,
    });
    expect(foodMix(3).every((m) => m.qty >= 1)).toBe(true);
  });

  it("a kind of food at its share drops out of what's left to buy", () => {
    const p = { ...newPlan("emergency"), people: 4, days: 7, list: { "canned-soups-and-stews": { qty: null, have: 43, got: false } } };
    const mix = foodMix(28 - 0.26 * 28, p, 28);
    expect(mix.some((m) => m.id === "canned-soups-and-stews")).toBe(false);
    expect(mix.find((m) => m.id === "canned-beans")!.qty).toBe(17);
  });
});
