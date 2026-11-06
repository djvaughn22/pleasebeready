import { CONVENIENCE_TIER, prepTier } from "./priority";
import { describe, expect, it } from "vitest";
import { itemById } from "../stockup/catalog";
import { SECONDARY, isSecondary, laneById, laneFeatured, laneItems, laneSort, lanes } from "./lanes";
import { hasPick } from "./picks";

describe("department relevance", () => {
  it("never leads a department with convenience items it isn't about", () => {
    for (const lane of lanes) {
      for (const i of laneFeatured(lane, hasPick)) {
        const own = lane.cats.includes(i.cat) || lane.order?.includes(i.cat) || lane.featured?.includes(i.id);
        if (!own) expect(SECONDARY, `${lane.id}: ${i.id}`).not.toContain(i.cat);
      }
    }
  });

  it("puts emergency essentials first, in the shared preparedness order", () => {
    const e = laneById("emergency")!;
    const feat = laneFeatured(e, hasPick, 12).map((i) => i.cat);
    expect(feat.slice(0, 5)).toEqual(["water", "water", "water", "food", "food"]);
    expect(feat).toEqual(expect.arrayContaining(["power", "health"]));
    // Party plates, cups and games sit at the very end of the Emergency department.
    const sorted = laneSort(e, laneItems(e), hasPick);
    // Shelf-stable milk is a drink but it's food here; convenience is by tier in this department.
    const firstSecondary = sorted.findIndex((i) => isSecondary(i, e));
    // After the first convenience item come only more convenience items and upgrades.
    expect(sorted.slice(firstSecondary).every((i) => prepTier(i) >= CONVENIENCE_TIER)).toBe(true);
    expect(firstSecondary).toBeGreaterThan(sorted.length * 0.5);
    expect(sorted.slice(0, 40).map((i) => i.id)).not.toEqual(expect.arrayContaining(["paper-plates"]));
  });

  it("uses only real catalog products in hand-ranked lists", () => {
    for (const lane of lanes) for (const id of lane.featured ?? []) {
      expect(itemById(id)?.kind, `${lane.id}: ${id}`).toBe("product");
      expect(laneItems(lane).some((i) => i.id === id), `${lane.id}: ${id}`).toBe(true);
    }
  });

  it("features exact products in every department that has them", () => {
    for (const lane of lanes) {
      const withPicks = laneItems(lane).filter((i) => hasPick(i.id) && i.pri !== "extra").length;
      if (withPicks >= 4) expect(laneFeatured(lane, hasPick).length, lane.id).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("disaster searches", () => {
  it("answer with emergency essentials, even with no kit of their own", async () => {
    const { searchItems } = await import("./search");
    for (const q of ["hurricane", "earthquake", "flood", "emergency"]) {
      const top = searchItems(q, 8).map((i) => i.id);
      expect(top, q).toEqual(expect.arrayContaining(["flashlights", "water", "first-aid-kit"]));
      expect(top.some((id) => SECONDARY.includes(itemById(id)!.cat)), q).toBe(false);
    }
  });
});

describe("home page feed", () => {
  it("shows no product twice and New covers different kinds of product", async () => {
    const { findsTabs } = await import("./finds");
    const { primaryPick } = await import("./picks");
    const emergency = laneFeatured(laneById("emergency")!, hasPick, 8);
    const f = findsTabs(new Date("2026-11-02"), emergency.map((i) => i.id));
    const asins = [...emergency.map((i) => primaryPick(i.id)!.asin), ...f.new.map((p) => p.asin), ...f.everyday.map((p) => p.asin)];
    expect(new Set(asins).size).toBe(asins.length);
    const cats = f.new.map((p) => itemById(p.item)!.cat);
    expect(new Set(cats).size).toBe(cats.length);
    expect(f.everyday.length).toBe(8);
  });
});
