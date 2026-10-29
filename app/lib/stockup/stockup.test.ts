import { describe, expect, it } from "vitest";
import { AMAZON_TAG } from "../gear";
import { catalog, categories, gearFor, itemById, occasions } from "./catalog";
import { clampPlan, lineQty, suggest, suggestionsFor, toBuy } from "./calc";
import { listText, shopLink } from "./shop";
import { decodePlan, encodePlan, newPlan, parseStore } from "./storage";

const plan = (patch = {}) => clampPlan({ ...newPlan("camping", 0), ...patch });

describe("catalog", () => {
  it("has one entry per id and per name", () => {
    expect(new Set(catalog.map((c) => c.id)).size).toBe(catalog.length);
    expect(new Set(catalog.map((c) => c.name.toLowerCase())).size).toBe(catalog.length);
  });
  it("only uses ASINs that readiness.ts gear already holds", () => {
    for (const c of catalog) if (c.asin) expect(gearFor(c.asin), c.id).toBeDefined();
  });
  it("gives every occasion a broad list in several categories", () => {
    for (const o of occasions) {
      const s = suggestionsFor(plan({ occasion: o.id, kids: 1, babies: 1, pets: 1 }));
      expect(s.length, o.id).toBeGreaterThanOrEqual(35);
      expect(new Set(s.map((x) => x.item.cat)).size, o.id).toBeGreaterThanOrEqual(8);
    }
  });
  it("uses only known categories and positive rates", () => {
    const ids = new Set(categories.map((c) => c.id));
    for (const c of catalog) {
      expect(ids.has(c.cat), c.id).toBe(true);
      expect(c.rule.n, c.id).toBeGreaterThan(0);
      expect(c.occ.length, c.id).toBeGreaterThan(0);
    }
  });
});

describe("amounts", () => {
  it("multiplies emergency water by people and days, from the source", () => {
    const p = clampPlan({ ...newPlan("emergency", 0), people: 37, days: 14 });
    const w = suggest(itemById("water")!, p);
    expect(w.qty).toBe(518);
    expect(w.how).toBe("37 people × 14 days × 1 = 518 gallons");
    expect(w.item.source).toBe("rg-water");
  });
  it("rounds up and says so", () => {
    const s = suggest(itemById("tent")!, plan({ people: 9 }));
    expect(s.qty).toBe(3);
    expect(s.how).toContain("(rounded up)");
  });
  it("counts meals for plates and shows pack counts", () => {
    const s = suggest(itemById("paper-plates")!, plan({ people: 12, days: 2, meals: 3 }));
    expect(s.qty).toBe(108);
    expect(s.packs).toBe(2);
  });
  it("hides kid, baby and pet items until the plan has them", () => {
    const ids = (p: ReturnType<typeof plan>) => suggestionsFor(p).map((s) => s.item.id);
    expect(ids(plan({ occasion: "sleepover" }))).not.toContain("juice-boxes");
    expect(ids(plan({ occasion: "sleepover", kids: 3 }))).toContain("juice-boxes");
    expect(ids(plan({ occasion: "home" }))).not.toContain("diapers");
    expect(ids(plan({ occasion: "home", babies: 1 }))).toContain("diapers");
  });
  it("keeps kids and babies within the group and handles large groups", () => {
    const p = plan({ people: 250, kids: 400, babies: 10 });
    expect(p.kids).toBe(240);
    expect(clampPlan({ ...p, people: 9999 }).people).toBe(500);
  });
  it("lets the visitor override and subtracts what they have", () => {
    const s = suggest(itemById("water")!, clampPlan({ ...newPlan("emergency", 0), people: 2, days: 3 }));
    expect(lineQty({ qty: null, have: 0, got: false }, s)).toBe(6);
    expect(toBuy({ qty: 10, have: 4, got: false }, s)).toBe(6);
    expect(toBuy({ qty: null, have: 9, got: false }, s)).toBe(0);
  });
});

describe("shopping links", () => {
  it("opens the verified product when there is one, tagged", () => {
    const l = shopLink(itemById("first-aid-kit")!);
    expect(l.kind).toBe("product");
    expect(l.url).toBe(`https://www.amazon.com/dp/B000069EYA?tag=${AMAZON_TAG}`);
  });
  it("otherwise opens a tagged Amazon search, labelled as a search", () => {
    const l = shopLink(itemById("paper-plates")!);
    expect(l.kind).toBe("search");
    expect(l.url).toBe(`https://www.amazon.com/s?k=Paper+plates&tag=${AMAZON_TAG}`);
    expect(l.label).toMatch(/search/i);
  });
  it("writes a plain list with what is left", () => {
    const p = plan({ people: 4 });
    const s = suggest(itemById("tent")!, p);
    const t = listText(p, [{ s, qty: 2, have: 1, got: false }]);
    expect(t).toContain("[ ] Tent: 1 tent · have 1");
    expect(t).toContain("planning estimates");
  });
});

describe("storage", () => {
  it("round-trips a share link and drops unknown items", () => {
    const p = { ...plan({ people: 15, name: "Gianna’s sleepover", occasion: "sleepover", kids: 8 }), list: { "juice-boxes": { qty: 20, have: 2, got: false }, bogus: { qty: 1, have: 0, got: false } } };
    const back = decodePlan(encodePlan(p))!;
    expect(back.name).toBe("Gianna’s sleepover");
    expect(back.people).toBe(15);
    expect(back.list).toEqual({ "juice-boxes": { qty: 20, have: 2, got: false } });
    expect(back.id).not.toBe(p.id);
  });
  it("survives junk", () => {
    expect(parseStore("not json").plans).toEqual([]);
    expect(parseStore(JSON.stringify({ plans: [{ occasion: "nope" }, newPlan("party", 1)], activeId: "x" })).plans).toHaveLength(1);
    expect(decodePlan("%%%")).toBeNull();
  });
});
