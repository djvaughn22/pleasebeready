import { describe, expect, it } from "vitest";
import { AMAZON_TAG } from "../gear";
import { picks } from "../shop/picks";
import { shopLink } from "../stockup/shop";
import { itemById } from "../stockup/catalog";
import { newPlan, parseStore } from "../stockup/storage";
import { withDays } from "../stockup/calc";
import { readiness } from "./engine";
import { DAYS, FOOD_WATER, PEOPLE, bundle, parseDays, parseOnly, parsePeople, rowsFor, savedList } from "./bundle";
import { WATER_WAYS } from "./supplies";

const BOTTLE = WATER_WAYS[0].gallons;
/** Mark every row bought, as a visitor would after shopping. */
const boughtAll = (p: ReturnType<typeof savedList>) => ({ ...p, list: Object.fromEntries(Object.entries(p.list).map(([k, l]) => [k, { ...l, bought: (l.bought ?? 0) + Math.max(0, (l.qty ?? 0) - l.have - (l.bought ?? 0)) }])) });

describe("Food & Water bundle", () => {
  it("every household from 1–5 people and 3–30 days: right totals, packages that cover them, exact tagged products", () => {
    for (const p of PEOPLE) for (const d of DAYS) {
      const b = bundle(p, d);
      const at = `${p}×${d}`;
      expect(b.water.need, at).toBe(p * d);
      expect(b.food.need, at).toBe(p * d);
      expect(b.water.have + b.food.have, at).toBe(0);
      // Drinking water leads; never an empty container, never a ration kit, never a filter.
      expect(b.water.rows.map((r) => r.id), at).toEqual(["bottled-water"]);
      const w = b.water.rows[0];
      expect(w.units * BOTTLE, at).toBeGreaterThanOrEqual(p * d - 1e-9);
      expect((w.units - 1) * BOTTLE, at).toBeLessThan(p * d);
      expect(w.packs, at).toBe(Math.ceil(w.units / 24));
      expect(b.water.jugs, at).toBe(p * d);
      const ids = rowsFor(b, null).map((r) => r.id);
      for (const bad of ["water-storage-container", "water-bricks", "3-day-emergency-food-supply", "30-day-food-supply", "water-purification-tablets"]) expect(ids, at).not.toContain(bad);
      expect(b.food.rows[0].id, at).toBe("canned-soups-and-stews");
      for (const r of rowsFor(b, null)) {
        expect(r.pick, `${at} ${r.id}`).toBeTruthy();
        expect(r.packUnits, `${at} ${r.id}`).toBeGreaterThanOrEqual(r.units);
        expect(r.packUnits - r.units, `${at} ${r.id}`).toBeLessThan(r.pick!.count ?? 1);
        const link = shopLink(itemById(r.id)!);
        expect(link.kind).toBe("product");
        expect(link.url).toBe(`https://www.amazon.com/dp/${r.pick!.asin}?tag=${AMAZON_TAG}`);
      }
      expect(AMAZON_TAG).toBe("pleasebeready-20");
      // Bought as listed, the food covers every person-day and the water every gallon.
      const after = readiness(boughtAll(savedList(b, null)));
      for (const id of ["water", "shelf-food"]) {
        const i = after.items.find((x) => x.item.id === id && x.tier !== "way")!;
        expect(i.covered, `${at} ${id}`).toBeCloseTo(p * d, 6);
      }
      expect(bundle(p, d, [boughtAll(savedList(b, null))]).food.rows, at).toEqual([]);
    }
  });

  it("four people, one week: 28 gallons, 28 person-days, the exact packages", () => {
    const b = bundle(4, 7);
    const pk = Object.fromEntries(rowsFor(b, null).map((r) => [r.id, [r.units, r.packs, r.packUnits]]));
    expect(b.water.gap).toBe(28);
    expect(b.food.gap).toBe(28);
    expect(pk).toEqual({
      "bottled-water": [213, 9, 216],
      "canned-soups-and-stews": [28, 3, 36],
      "canned-tuna-or-chicken": [9, 1, 12],
      "canned-beans": [9, 1, 12],
      "canned-vegetables": [14, 3, 18],
      "canned-fruit": [9, 1, 12],
      "shelf-stable-milk": [28, 3, 36],
      "peanut-butter": [2, 2, 2],
      "pretzels-and-crackers": [3, 1, 3],
      "granola-or-protein-bars": [56, 2, 96],
      "manual-can-opener": [1, 1, 1],
    });
    expect(rowsFor(b, "water").map((r) => r.id)).toEqual(["bottled-water"]);
    expect(rowsFor(b, "food").map((r) => r.id)).not.toContain("bottled-water");
  });

  it("counts what the household already has, once, and never an empty container", () => {
    const guided = { ...withDays(newPlan("emergency"), 30), updated: 1, guide: { pace: "now" as const, every: 1, size: 50, started: "2026-10-31" },
      list: { "bottled-water": { qty: null, have: 0, got: false, bought: 48 }, "water-storage-container": { qty: null, have: 4, got: false },
        "peanut-butter": { qty: null, have: 2, got: false }, "manual-can-opener": { qty: null, have: 1, got: false } } };
    const b = bundle(4, 7, [guided]);
    expect(b.source?.id).toBe(guided.id);
    // 48 bottles ≈ 6.3 gallons; four empty containers add nothing.
    expect(b.water.have).toBeCloseTo(48 * BOTTLE, 6);
    expect(b.water.rows[0].units).toBe(Math.ceil((28 - 48 * BOTTLE) / BOTTLE - 1e-9));
    expect(rowsFor(b, null).map((r) => r.id)).not.toContain("peanut-butter");
    expect(rowsFor(b, null).map((r) => r.id)).not.toContain("manual-can-opener");
    // Filled containers do count.
    const filled = { ...guided, list: { ...guided.list, "water-storage-container": { qty: null, have: 4, got: false, filled: 2 } } };
    expect(bundle(4, 7, [filled]).water.have).toBeCloseTo(14 + 48 * BOTTLE, 6);
    // Partial: half the soup bought.
    const half = { ...guided, list: { ...guided.list, "canned-soups-and-stews": { qty: 28, have: 0, got: false, bought: 14 } } };
    expect(bundle(4, 7, [half]).food.rows.find((r) => r.id === "canned-soups-and-stews")!.units).toBeLessThan(28);

    // With a Food & Water list too, only that list counts: the plan's bottles are not added again.
    const list = savedList(b, null, 5);
    expect(list.kit).toBe(FOOD_WATER);
    expect(list.list["bottled-water"].bought).toBe(48);
    const again = bundle(4, 7, [guided, list]);
    expect(again.source?.id).toBe(list.id);
    expect(again.water.have).toBeCloseTo(48 * BOTTLE, 6);
    expect(again.water.rows).toEqual(b.water.rows);
  });

  it("Save entire bundle: one list, kept across reloads, updated in place", () => {
    const b = bundle(4, 7);
    const list = savedList(b, null, 10);
    expect(list.people).toBe(4);
    expect(list.days).toBe(7);
    expect(list.name).toBe("Food & Water");
    expect(list.guide).toBeUndefined();
    expect(list.list["bottled-water"].qty).toBe(213);
    expect(list.list["canned-soups-and-stews"].qty).toBe(28);
    const back = parseStore(JSON.stringify({ v: 2, plans: [list], activeId: null, targetId: list.id })).plans[0];
    expect(back.kit).toBe(FOOD_WATER);
    expect(back.list).toEqual(list.list);
    // Saving doesn't count as stocked; marking bought does.
    expect(rowsFor(bundle(4, 7, [back]), null)).toEqual(rowsFor(b, null));
    // Ticked bought on the list (got, no count): the list's whole amount counts.
    const ticked = { ...back, list: { ...back.list, "bottled-water": { ...back.list["bottled-water"], got: true }, "canned-soups-and-stews": { ...back.list["canned-soups-and-stews"], got: true } } };
    const t = bundle(4, 7, [ticked]);
    expect(t.water.rows).toEqual([]);
    expect(t.food.rows.map((r) => r.id)).not.toContain("canned-soups-and-stews");
    // Saving again for a bigger household updates the same list.
    const again = savedList(bundle(5, 14, [back]), "water", 20);
    expect(again.id).toBe(list.id);
    expect(again.people).toBe(5);
    expect(again.list["bottled-water"].qty).toBe(Math.ceil(70 / BOTTLE - 1e-9));
    expect(again.list["canned-soups-and-stews"].qty).toBe(28);
  });

  it("reads people and days from a link safely", () => {
    expect([parsePeople("3"), parsePeople("0"), parsePeople("999"), parsePeople("x")]).toEqual([3, 1, 50, 4]);
    expect([parseDays("14"), parseDays("-2"), parseDays("9999"), parseDays(undefined)]).toEqual([14, 1, 365, 7]);
    expect([parseOnly("water"), parseOnly("food"), parseOnly("x")]).toEqual(["water", "food", null]);
  });

  it("package counts match the product names", () => {
    for (const p of picks.filter((x) => x.count)) {
      if (p.count === 1) continue;
      expect(p.name, p.asin).toMatch(new RegExp(`\\b${p.count}\\b`));
    }
  });
});
