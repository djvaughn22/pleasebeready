// The shopping-list requirement and the retailer offer are separate: a swap keeps
// the amount and recounts the packages, and a saved list keeps its amounts and
// progress when products change.
import { describe, expect, it } from "vitest";
import { bundle, savedList } from "../ready/bundle";
import { itemById } from "../stockup/catalog";
import { listText, packsText, shopLink } from "../stockup/shop";
import { decodePlan, encodePlan, newPlan, parsePlan } from "../stockup/storage";
import { suggest } from "../stockup/calc";
import { localNote } from "./local";
import { chosenPick, offerFor, offersFor, packText, staleChoice, unitsEach } from "./offers";
import { picksFor, primaryPick, type Pick } from "./picks";

const jug = (count: number): Pick => ({ item: "water", role: "pick", asin: "B000000000", name: `Test water, ${count} × 1-gallon jugs`, why: "", use: "", via: "search", seen: "", count });

describe("one requirement, many offers", () => {
  it("the 28-gallon plan: five six-packs or 28 single gallons", () => {
    const water = itemById("water")!;
    const six = offerFor(jug(6), 28);
    expect([six.packs, six.units]).toEqual([5, 30]);
    expect(packText(six, water)).toBe("5 cases of 6");
    const one = offerFor({ ...jug(1), each: "jug" }, 28);
    expect([one.packs, one.units]).toEqual([28, 28]);
    expect(packText(one, water)).toBe("28 jugs");
    expect(localNote("water", 28)).toBe("Or nearby: 28 one-gallon jugs, or 5 six-packs of jugs, at any grocery store.");
  });

  it("every offer covers the same amount, whatever the package", () => {
    for (const id of ["bottled-water", "water", "peanut-butter", "canned-beans", "canned-tuna-or-chicken", "canned-soups-and-stews", "headlamps"]) {
      for (const need of [1, 7, 28, 213]) {
        for (const o of offersFor(id, need)) {
          expect(o.covers, `${id} ${o.pick.asin} ${need}`).toBeGreaterThanOrEqual(need - 1e-9);
          // Never a whole package more than the amount needs.
          expect(o.covers - need, `${id} ${o.pick.asin} ${need}`).toBeLessThan(o.per * unitsEach(o.pick) + 1e-9);
        }
      }
    }
  });

  it("food swaps are recounted by label calories", () => {
    // 25 cans of tuna at 90 calories are 15 cans of chicken at 160: 3 packs of 6.
    const chicken = picksFor("canned-tuna-or-chicken").find((p) => p.asin === "B0D81L6MD5")!;
    const o = offerFor(chicken, 25);
    expect([o.units, o.packs, o.recounted]).toEqual([18, 3, true]);
    expect(o.covers * 90).toBeGreaterThanOrEqual(25 * 90);
    // 43 cans of chicken and dumplings (340 each) are 82 cans of vegetable soup (180 each): 7 packs of 12.
    const veg = picksFor("canned-soups-and-stews").find((p) => p.asin === "B0014EOUU2")!;
    expect(offerFor(veg, 43).packs).toBe(7);
    // The same jar in a different pack is not recounted: 2 jars are 1 two-pack or 2 single jars.
    expect(offersFor("peanut-butter", 2).map((x) => [x.packs, x.units, x.recounted])).toEqual([[1, 2, false], [2, 2, false]]);
  });

  it("the Food & Water rows carry every offer with its own count", () => {
    const b = bundle(4, 7);
    const soup = b.food.rows.find((r) => r.id === "canned-soups-and-stews")!;
    expect(soup.offers.map((o) => o.packs)).toEqual([4, 7]);
    for (const r of [...b.water.rows, ...b.food.rows]) expect(r.offers[0].pick, r.id).toBe(r.pick);
  });
});

describe("swapping a product on a list", () => {
  it("the swap changes which product opens, never the amount or progress", () => {
    const item = itemById("peanut-butter")!;
    const single = picksFor("peanut-butter").find((p) => p.count === 1)!;
    expect(chosenPick("peanut-butter", single.asin)).toBe(single);
    expect(shopLink(item, single.asin).url).toContain(`/dp/${single.asin}?tag=`);
    expect(packsText(item, 2)).toBe("1 pack of 2");
    expect(packsText(item, 2, single.asin)).toBeNull();
    const plan = { ...newPlan("emergency", 1), list: { "peanut-butter": { qty: 2, have: 1, got: false, bought: 1, note: "creamy", pick: single.asin } } };
    const back = decodePlan(encodePlan(plan))!;
    expect(back.list["peanut-butter"]).toEqual({ qty: 2, have: 1, got: false, bought: 1, note: "creamy", pick: single.asin });
    const text = listText(plan, [{ s: suggest(item, plan), qty: 2, have: 1, got: false, pick: single.asin }]);
    expect(text).toContain(`[ ] Peanut butter: 1 jar — ${single.name} · have 1`);
  });

  it("a product that leaves the store falls back to our pick and keeps the line", () => {
    const gone = "B07QJ5NCBP"; // StarKist 12-pack: out after the Nov 19 listing check
    expect(staleChoice("canned-tuna-or-chicken", gone)).toBe(true);
    expect(chosenPick("canned-tuna-or-chicken", gone)).toBe(primaryPick("canned-tuna-or-chicken"));
    const parsed = parsePlan({ ...newPlan("emergency", 1), list: { "canned-tuna-or-chicken": { qty: 25, have: 0, got: true, pick: gone } } })!;
    expect(parsed.list["canned-tuna-or-chicken"]).toMatchObject({ qty: 25, got: true, pick: gone });
    expect(parsePlan({ ...newPlan("emergency", 1), list: { "canned-tuna-or-chicken": { qty: 25, have: 0, got: false, pick: "<script>" } } })!.list["canned-tuna-or-chicken"].pick).toBeUndefined();
  });

  it("switching Food & Water from cases to jugs swaps the unbought water line and keeps bought ones", () => {
    const cases = savedList(bundle(4, 7), null, 1);
    expect(cases.list["bottled-water"].qty).toBe(213);
    const jugs = savedList(bundle(4, 7, [cases], "jugs"), null, 2);
    expect(jugs.id).toBe(cases.id);
    expect(jugs.list["bottled-water"]).toBeUndefined();
    expect(jugs.list.water.qty).toBe(28);
    // With bottles already bought, they stay, and the jugs cover only the rest.
    const bought = { ...cases, list: { ...cases.list, "bottled-water": { ...cases.list["bottled-water"], got: true } } };
    const after = savedList(bundle(4, 7, [bought], "jugs"), null, 3);
    expect(after.list["bottled-water"].got).toBe(true);
    expect(after.list.water?.qty ?? 0).toBe(0);
  });
});
