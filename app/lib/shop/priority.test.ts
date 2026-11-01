import { describe, expect, it } from "vitest";
import { readiness } from "../ready/engine";
import { withDays } from "../stockup/calc";
import { catalog, itemById } from "../stockup/catalog";
import { newPlan, parseStore } from "../stockup/storage";
import { NEW_DAYS, findsTabs } from "./finds";
import { kits } from "./kits";
import { laneById, laneFeatured, laneItems, laneSort } from "./lanes";
import { FIRST_ADDED, addedOn, hasPick, picks } from "./picks";
import { CONVENIENCE_TIER, CORE, ESSENTIALS, UPGRADE_TIER, byPrep, isEmergencyKind, prepRank, prepTier } from "./priority";
import { searchItems } from "./search";

const NOW = new Date("2026-11-01T12:00:00Z");
const tier = (id: string) => prepTier(itemById(id)!);
const tiers = (ids: string[]) => ids.map(tier);
const nonDecreasing = (xs: number[]) => xs.every((x, i) => i === 0 || x >= xs[i - 1]);

describe("one preparedness ranking", () => {
  it("Essentials: water and food lead, then light, power and first aid", () => {
    const ess = findsTabs(NOW).essentials.map((p) => p.item);
    expect(ess).toEqual(CORE);
    expect(tiers(ess.slice(0, 5))).toEqual([0, 0, 1, 1, 1]);
    // Drinking water before an empty container; everyday food before ration kits.
    expect(ess[0]).toBe("bottled-water");
    expect(ess.slice(2, 4)).toEqual(["canned-soups-and-stews", "peanut-butter"]);
    expect(ess.slice(5, 9)).toEqual(["flashlights", "batteries", "power-bank", "first-aid-kit"]);
    expect(nonDecreasing(tiers(ess))).toBe(true);
  });

  it("every essential is an exact product and a necessity", () => {
    for (const id of ESSENTIALS) {
      expect(hasPick(id), id).toBe(true);
      expect(tier(id), id).toBeLessThan(CONVENIENCE_TIER);
    }
    expect(nonDecreasing(tiers(CORE))).toBe(true);
  });

  it("convenience and accessories never rank ahead of a necessity", () => {
    for (const id of ["shower-caddy", "car-trunk-organizer", "under-bed-storage", "command-hooks-and-strips", "reusable-water-bottles", "paper-plates"]) {
      expect(tier(id), id).toBeGreaterThanOrEqual(CONVENIENCE_TIER);
    }
    expect(tier("generator")).toBe(UPGRADE_TIER);
    const all = byPrep(catalog.filter((i) => i.kind === "product"));
    const firstConvenience = all.findIndex((i) => prepTier(i) >= CONVENIENCE_TIER);
    expect(all.slice(firstConvenience).every((i) => prepTier(i) >= CONVENIENCE_TIER)).toBe(true);
    expect(all[0].id).toBe("water");
    expect(byPrep(["manual-can-opener", "shelf-food"])).toEqual(["shelf-food", "manual-can-opener"]);
  });

  it("the Emergency department opens with the same Essentials", () => {
    const e = laneById("emergency")!;
    expect(laneFeatured(e, hasPick, 12).map((i) => i.id)).toEqual(CORE);
    const sorted = laneSort(e, laneItems(e), hasPick);
    expect(nonDecreasing(sorted.map(prepTier))).toBe(true);
  });

  it("emergency kits list must-haves in the same order; other kits keep their own", () => {
    for (const k of kits.filter((k) => isEmergencyKind(k.base))) {
      const r = k.essentials.map((id) => prepRank(itemById(id)!));
      expect(r.every((x, i) => i === 0 || x >= r[i - 1]), k.slug).toBe(true);
    }
    const party = kits.find((k) => k.slug === "birthday-party")!;
    expect(party.essentials.some((id) => ["water", "flashlights", "shelf-food"].includes(id))).toBe(false);
  });

  it("Get Ready sorts each stage the same way", () => {
    const r = readiness({ ...withDays(newPlan("emergency"), 14), guide: { pace: "now", every: 1, size: 50, started: "2026-11-01" } }, "2026-11-01");
    const power = r.items.filter((i) => i.stage === "power").map((i) => i.item.id);
    expect(power.indexOf("flashlights")).toBeLessThan(power.indexOf("power-bank"));
    expect(r.items[0].item.id).toBe("water");
  });

  it("New means recently added, newest first", () => {
    const fresh = findsTabs(NOW).new;
    expect(fresh.length).toBeGreaterThan(0);
    const since = new Date(NOW.getTime() - NEW_DAYS * 864e5).toISOString().slice(0, 10);
    for (const p of fresh) expect(addedOn(p) >= since, p.item).toBe(true);
    const dates = fresh.map(addedOn);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(dates[0]).toBe([...picks].map(addedOn).sort().at(-1));
    expect(fresh.some((p) => CORE.includes(p.item))).toBe(false);
    // Nothing added in the last NEW_DAYS days: no New tab at all, rather than old products called new.
    expect(findsTabs(new Date("2027-06-01T12:00:00Z")).new).toEqual([]);
    expect(picks.every((p) => /^\d{4}-\d{2}-\d{2}$/.test(addedOn(p)) && addedOn(p) >= FIRST_ADDED)).toBe(true);
  });

  it("broad readiness searches start with water, food, light, power and first aid", () => {
    for (const q of ["emergency", "hurricane", "earthquake", "preparedness", "power outage"]) {
      const ids = searchItems(q, 10).map((i) => i.id);
      expect(ids.slice(0, 2), q).toEqual(["water", "shelf-food"]);
      expect(ids.slice(0, 7), q).toEqual(expect.arrayContaining(["flashlights", "batteries", "power-bank", "first-aid-kit"]));
      expect(ids.slice(0, 8).some((id) => tier(id) >= CONVENIENCE_TIER), q).toBe(false);
    }
  });

  it("specific searches still find the thing asked for", () => {
    expect(searchItems("shower caddy")[0].id).toBe("shower-caddy");
    expect(searchItems("flashlight")[0].id).toBe("flashlights");
    expect(searchItems("trunk organizer")[0].id).toBe("car-trunk-organizer");
    expect(searchItems("water").slice(0, 2).map((i) => i.id)).toEqual(expect.arrayContaining(["water", "bottled-water"]));
    const party = searchItems("birthday party for 20", 8).map((i) => i.id);
    expect(party).not.toEqual(expect.arrayContaining(["water"]));
    expect(party).toContain("paper-plates");
  });

  it("saved lists and plans load unchanged", () => {
    const old = JSON.stringify({ plans: [{ id: "a1", name: "Car kit", occasion: "vehicle", people: 2, kids: 0, babies: 0, pets: 0, needs: [], climate: [], days: 2, nights: 1, meals: 2, start: "", created: 1, updated: 2, list: { "jumper-cables": { qty: null, have: 0, got: true } } }], activeId: "a1" });
    const v2 = JSON.stringify({ v: 2, targetId: "b2", activeId: null, plans: [{ id: "b2", name: "Emergency plan", occasion: "emergency", people: 4, kids: 0, babies: 0, pets: 1, needs: [], climate: [], days: 14, nights: 14, meals: 3, start: "", created: 1, updated: 2, guide: { pace: "weekly", every: 7, size: 6, started: "2026-10-31" }, list: { water: { qty: null, have: 0, got: false, bought: 12 }, flashlights: { qty: null, have: 4, got: false, ready: true } } }] });
    const a = parseStore(old);
    expect(a.activeId).toBe("a1");
    expect(a.plans[0].list["jumper-cables"]).toEqual({ qty: null, have: 0, got: true });
    const b = parseStore(v2);
    expect(b.targetId).toBe("b2");
    expect(b.plans[0].guide).toEqual({ pace: "weekly", every: 7, size: 6, started: "2026-10-31" });
    expect(b.plans[0].list.water.bought).toBe(12);
    expect(b.plans[0].list.flashlights).toEqual({ qty: null, have: 4, got: false, ready: true });
  });
});
