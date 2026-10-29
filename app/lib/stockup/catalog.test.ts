// Catalog integrity: size, distinctness, required fields, links and quantity
// rules. These run in CI-like `npm test`, so a bad data edit fails loudly.
import { describe, expect, it } from "vitest";
import { AMAZON_TAG } from "../gear";
import { catalog, categories, gearFor, occasions } from "./catalog";
import { clampPlan, suggest, suggestionsFor } from "./calc";
import { parseBlock, slug } from "./data/parse";
import { shopLink } from "./shop";
import { sources } from "./sources";
import { newPlan } from "./storage";

const norm = (s: string) => slug(s).replace(/-(and|or|the|a|for|of)-/g, "-");

describe("catalog size and distinctness", () => {
  it("has at least 1,000 entries", () => {
    expect(catalog.length).toBeGreaterThanOrEqual(1000);
  });
  it("has unique ids, names and normalized names", () => {
    const dup = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
    expect(dup(catalog.map((c) => c.id))).toEqual([]);
    expect(dup(catalog.map((c) => c.name.toLowerCase()))).toEqual([]);
    expect(dup(catalog.map((c) => norm(c.name)))).toEqual([]);
  });
  it("mixes products and clearly marked tasks", () => {
    const tasks = catalog.filter((c) => c.kind === "task");
    expect(tasks.length).toBeGreaterThan(50);
    for (const t of tasks) {
      expect(t.cat, t.id).toBe("tasks");
      expect(t.rule.per, t.id).toBe("task");
      expect(t.asin ?? t.pack ?? t.q, t.id).toBeUndefined();
    }
    for (const p of catalog.filter((c) => c.kind === "product")) expect(p.cat, p.id).not.toBe("tasks");
  });
});

describe("catalog fields", () => {
  const catIds = new Set(categories.map((c) => c.id));
  const occIds = new Set(occasions.map((o) => o.id));
  it("every entry is complete and valid", () => {
    for (const c of catalog) {
      expect(c.id, c.name).toMatch(/^[a-z0-9-]+$/);
      expect(c.name.trim().length, c.id).toBeGreaterThan(2);
      expect(c.name, c.id).toBe(c.name.trim());
      expect(catIds.has(c.cat), c.id).toBe(true);
      expect(c.occ.length, c.id).toBeGreaterThan(0);
      for (const o of c.occ) expect(occIds.has(o), `${c.id} ${o}`).toBe(true);
      expect(["essential", "useful", "extra"]).toContain(c.pri);
      expect(["year-round", "seasonal", "event"]).toContain(c.season);
      expect(c.unit.one.length && c.unit.many.length, c.id).toBeTruthy();
      if (c.source) expect(sources[c.source], c.id).toBeDefined();
      if (c.note) expect(c.note.length, c.id).toBeLessThan(260);
    }
  });
  it("only uses ASINs that readiness.ts gear already holds", () => {
    for (const c of catalog) if (c.asin) expect(gearFor(c.asin), c.id).toBeDefined();
  });
  it("uses every category", () => {
    for (const k of categories) expect(catalog.some((c) => c.cat === k.id), k.id).toBe(true);
  });
});

describe("quantity rules make sense", () => {
  it("rates are positive and within sane bounds for their kind", () => {
    for (const c of catalog) {
      const { per, n } = c.rule;
      expect(n, c.id).toBeGreaterThan(0);
      if (per === "group") expect(n, c.id).toBeLessThanOrEqual(60);
      if (/Day$|Night$|Meal$/.test(per)) expect(n, c.id).toBeLessThanOrEqual(30);
      if (["person", "adult", "kid", "baby", "pet"].includes(per)) expect(n, c.id).toBeLessThanOrEqual(30);
      if (c.pack !== undefined) expect(Number.isInteger(c.pack) && c.pack > 1, c.id).toBe(true);
      if (per === "varies") expect(c.note, `${c.id} needs a note saying why it varies`).toBeTruthy();
      if (per === "kid" || per === "kidDay") expect(c.needs, `${c.id} counts kids, so needs=kids`).toBe("kids");
      if (per === "baby" || per === "babyDay") expect(c.needs, c.id).toBe("babies");
      if (per === "pet" || per === "petDay") expect(c.needs, c.id).toBe("pets");
    }
  });
  it("gives whole, finite amounts for a huge group and a tiny one", () => {
    const big = clampPlan({ ...newPlan("home", 0), people: 500, kids: 200, babies: 50, pets: 20, days: 365 });
    const small = clampPlan({ ...newPlan("party", 0), people: 1 });
    for (const c of catalog) {
      for (const p of [big, small]) {
        const s = suggest(c, p);
        expect(Number.isInteger(s.qty) && s.qty >= 0, c.id).toBe(true);
        expect(s.how.length, c.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("shopping links", () => {
  it("every product has a valid, tagged Amazon link; tasks have none shown", () => {
    for (const c of catalog.filter((x) => x.kind === "product")) {
      const l = shopLink(c);
      const url = new URL(l.url);
      expect(url.hostname, c.id).toBe("www.amazon.com");
      expect(url.searchParams.get("tag"), c.id).toBe(AMAZON_TAG);
      if (l.kind === "search") {
        const k = url.searchParams.get("k") ?? "";
        expect(k.length > 1 && k.length <= 80, c.id).toBe(true);
      } else {
        expect(url.pathname, c.id).toMatch(/^\/dp\/[A-Z0-9]{10}$/);
      }
    }
  });
});

describe("situations", () => {
  it("every situation gets a broad, varied list", () => {
    for (const o of occasions) {
      const p = clampPlan({ ...newPlan(o.id, 0), kids: 1, babies: 1, pets: 1, needs: ["older", "mobility", "medical"], climate: ["cold", "hot", "wet"] });
      const s = suggestionsFor(p);
      expect(s.length, o.id).toBeGreaterThanOrEqual(30);
      expect(new Set(s.map((x) => x.item.cat)).size, o.id).toBeGreaterThanOrEqual(5);
    }
  });
  it("hides need and weather items until the plan has them", () => {
    const ids = (p: ReturnType<typeof clampPlan>) => suggestionsFor(p).map((s) => s.item.id);
    const base = clampPlan(newPlan("caregiving", 0));
    expect(ids(base)).not.toContain("grab-bars");
    expect(ids({ ...base, needs: ["older"] })).toContain("grab-bars");
    const camp = clampPlan(newPlan("camping", 0));
    expect(ids(camp)).not.toContain("wool-socks");
    expect(ids({ ...camp, climate: ["cold"] })).toContain("wool-socks");
    expect(ids(clampPlan(newPlan("winter", 0)))).toContain("winter-hats");
  });
});

describe("line format parser", () => {
  it("rejects malformed lines", () => {
    expect(() => parseBlock("## food\nJust a name")).toThrow();
    expect(() => parseBlock("## food\nThing ; nope ; g:1 ; can ; e")).toThrow(/situation/);
    expect(() => parseBlock("## food\nThing ; hom ; zz:1 ; can ; e")).toThrow(/rule/);
    expect(() => parseBlock("## food\nThing ; hom ; g:0 ; can ; e")).toThrow(/rate/);
    expect(() => parseBlock("## food\nThing ; hom ; g:1 ; can ; q")).toThrow(/priority/);
    expect(() => parseBlock("## food\nThing ; hom ; g:1 ; can ; e ; wat=1")).toThrow(/extra/);
  });
  it("parses tasks into the tasks category", () => {
    const [t] = parseBlock("## safety\nDo a thing ; hom ; t ; task ; u ; n=Why");
    expect(t).toMatchObject({ kind: "task", cat: "tasks", note: "Why" });
  });
});
