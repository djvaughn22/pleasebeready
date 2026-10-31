// Kits, lanes, picks and search: every id resolves, every lane has a way in,
// checked products stay the title-verified set, and the search phrases people
// actually type land on the right kit.
import { describe, expect, it } from "vitest";
import { catalog, gearFor, itemById, occasions } from "../stockup/catalog";
import { NOTE_MAX, decodePlan, encodePlan, parseStore } from "../stockup/storage";
import { kitNumbers, kitPlan, kitRows } from "./kitPlan";
import { kitBySlug, kits, kitsInLane } from "./kits";
import { laneItems, lanes } from "./lanes";
import { pickForItem, picks } from "./picks";
import { kitHref, parseIntent, searchItems, searchKits } from "./search";

describe("kits", () => {
  it("has at least 20 kits with unique slugs", () => {
    expect(kits.length).toBeGreaterThanOrEqual(20);
    const slugs = kits.map((k) => k.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("only uses catalog ids, products to buy and tasks to do", () => {
    for (const k of kits) {
      const products = [...k.essentials, ...k.upgrades, ...(k.forget ?? []), ...(k.budget ?? []).flatMap((b) => [b.id, b.instead])];
      for (const id of products) {
        expect(itemById(id), `${k.slug}: ${id}`).toBeDefined();
        expect(itemById(id)?.kind, `${k.slug}: ${id} should be a product`).toBe("product");
      }
      for (const id of k.todo ?? []) expect(itemById(id)?.kind, `${k.slug}: ${id} should be a task`).toBe("task");
      for (const b of k.budget ?? []) expect([...k.essentials, ...k.upgrades], `${k.slug}: ${b.instead}`).toContain(b.instead);
    }
  });

  it("never lists one item twice in a kit", () => {
    for (const k of kits) {
      const all = [...k.essentials, ...k.upgrades, ...(k.forget ?? []), ...(k.todo ?? [])];
      expect(all.filter((x, i) => all.indexOf(x) !== i), k.slug).toEqual([]);
    }
  });

  it("has a real plan type, sane starting numbers and search words", () => {
    for (const k of kits) {
      expect(occasions.some((o) => o.id === k.base), k.slug).toBe(true);
      expect(k.preset.people).toBeGreaterThan(0);
      expect((k.preset.kids ?? 0) + (k.preset.babies ?? 0)).toBeLessThanOrEqual(k.preset.people);
      expect(k.preset.days).toBeGreaterThan(0);
      expect(k.essentials.length, k.slug).toBeGreaterThanOrEqual(6);
      expect(k.intro.length, k.slug).toBeLessThan(200);
      expect(k.terms.length, k.slug).toBeGreaterThan(3);
      if (k.guide) expect(k.guide.href).toMatch(/^https:\/\/www\.(ready\.gov|redcross\.org|cdc\.gov)\//);
    }
  });

  it("gives every lane at least one kit", () => {
    for (const l of lanes) expect(kitsInLane(l.id).length, l.id).toBeGreaterThan(0);
  });

  it("finds kits by slug", () => {
    expect(kitBySlug("power-outage")?.base).toBe("outage");
    expect(kitBySlug("nope")).toBeUndefined();
  });
});

describe("lanes", () => {
  it("has the sixteen lanes, each with products", () => {
    expect(lanes.length).toBe(16);
    for (const l of lanes) {
      expect(laneItems(l).length, l.id).toBeGreaterThan(10);
      for (const id of l.ids ?? []) expect(itemById(id), `${l.id}: ${id}`).toBeDefined();
    }
  });

  it("puts every catalog product in at least one lane", () => {
    const products = catalog.filter((c) => c.kind === "product");
    const orphans = products.filter((p) => !lanes.some((l) => laneItems(l).includes(p)));
    expect(orphans.map((o) => o.id)).toEqual([]);
  });
});

describe("checked products", () => {
  it("are exactly the title-verified ASINs from readiness.ts, one per catalog item", () => {
    for (const p of picks) {
      expect(gearFor(p.asin), p.asin).toBeDefined();
      expect(itemById(p.item)?.asin, p.item).toBe(p.asin);
      if (p.checked) expect(p.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.why.length).toBeLessThan(90);
    }
    for (const c of catalog) if (c.asin) expect(pickForItem(c.id)?.asin, c.id).toBe(c.asin);
    expect(new Set(picks.map((p) => p.asin)).size).toBe(picks.length);
  });
});

describe("search", () => {
  const cases: [string, string, Record<string, number>][] = [
    ["Five days without electricity", "power-outage", { days: 5 }],
    ["Water for four people", "water-storage", { people: 4 }],
    ["New puppy", "new-puppy", { pets: 1 }],
    ["Teenager's first car", "teen-driver", {}],
    ["Winter storm", "winter-storm", {}],
    ["Kids' field hockey tournament", "sports-tournament", {}],
    ["Weekend camping", "weekend-camping", { days: 3, nights: 2 }],
    ["Birthday party for 20", "birthday-party", { people: 20 }],
    ["Elderly parent living alone", "aging-parent", {}],
    ["Road trip with dogs", "dog-travel", { pets: 2 }],
    ["First apartment", "first-apartment", {}],
    ["Holiday guests", "overnight-guests", {}],
  ];
  it.each(cases)("%s → %s", (q, slug, intent) => {
    expect(searchKits(q)[0]?.slug).toBe(slug);
    expect(parseIntent(q)).toEqual(intent);
  });

  it("reads groups and lengths", () => {
    expect(parseIntent("family of 5 for 2 weeks")).toEqual({ people: 5, days: 14 });
    expect(parseIntent("sleepover for 8 kids")).toMatchObject({ kids: 8 });
    expect(parseIntent("party for a crowd")).toEqual({});
    expect(parseIntent("3 months of food for 2 people")).toEqual({ people: 2, days: 90 });
    expect(parseIntent("camping 2 nights")).toEqual({ nights: 2, days: 3 });
  });

  it("finds products without exact names", () => {
    const names = (q: string) => searchItems(q, 10).map((i) => i.id);
    expect(names("water for four people").some((id) => id.includes("water"))).toBe(true);
    expect(names("five days without electricity").some((id) => id.includes("power"))).toBe(true);
    expect(names("puppy")).toContain("puppy-pads");
    expect(names("flashlight")).toContain("flashlights");
    expect(searchItems("zzqx")).toEqual([]);
  });

  it("carries the numbers into the kit link", () => {
    const outage = searchKits("five days without electricity")[0];
    expect(kitHref(outage, parseIntent("five days without electricity for 6 people"))).toBe("/kits/power-outage?people=6&days=5");
  });
});

describe("ready lists storage", () => {
  const v1 = JSON.stringify({
    plans: [{ id: "abc", name: "Camping", occasion: "camping", people: 4, kids: 0, babies: 0, pets: 0, needs: [], climate: [], days: 3, nights: 2, meals: 3,
      start: "", created: 1, updated: 2, list: { tent: { qty: null, have: 0, got: true }, headlamps: { qty: 5, have: 1, got: false } } }],
    activeId: "abc",
  });

  it("still loads lists saved before Ready Lists (v1, no version field)", () => {
    const s = parseStore(v1);
    expect(s.plans).toHaveLength(1);
    expect(s.activeId).toBe("abc");
    expect(s.targetId).toBeNull();
    expect(s.plans[0].list.tent).toEqual({ qty: null, have: 0, got: true });
    expect(s.plans[0].list.headlamps).toEqual({ qty: 5, have: 1, got: false });
  });

  it("keeps ready, restock and notes, and trims notes to size", () => {
    const raw = JSON.parse(v1);
    raw.v = 2;
    raw.targetId = "abc";
    raw.plans[0].note = "Garage shelf";
    raw.plans[0].kit = "weekend-camping";
    raw.plans[0].list.tent = { qty: null, have: 0, got: true, ready: true, note: "x".repeat(400) };
    raw.plans[0].list.headlamps = { qty: 5, have: 0, got: false, restock: true, note: 42 };
    const p = parseStore(JSON.stringify(raw)).plans[0];
    expect(p.note).toBe("Garage shelf");
    expect(p.kit).toBe("weekend-camping");
    expect(p.list.tent.ready).toBe(true);
    expect(p.list.tent.note).toHaveLength(NOTE_MAX);
    expect(p.list.headlamps.restock).toBe(true);
    expect(p.list.headlamps.note).toBeUndefined();
    expect(parseStore(JSON.stringify(raw)).targetId).toBe("abc");
  });

  it("carries notes and marks through a share link", () => {
    const p = parseStore(v1).plans[0];
    p.note = "For the lake trip";
    p.list.tent = { ...p.list.tent, ready: true, note: "The blue one" };
    const back = decodePlan(encodePlan(p))!;
    expect(back.note).toBe("For the lake trip");
    expect(back.list.tent).toMatchObject({ ready: true, note: "The blue one" });
    expect(back.id).not.toBe(p.id);
  });
});

describe("kit amounts", () => {
  it("starts from the kit's numbers and follows changes", () => {
    const outage = kitBySlug("power-outage")!;
    const p = kitPlan(outage);
    expect(p).toMatchObject({ occasion: "outage", people: 4, days: 3, nights: 3, kit: "power-outage" });
    expect(kitPlan(outage, { ...kitNumbers(outage), days: 5 })).toMatchObject({ days: 5, nights: 5 });
    expect(kitPlan(kitBySlug("weekend-camping")!)).toMatchObject({ days: 3, nights: 2 });
    expect(kitPlan(kitBySlug("holiday-dinner")!)).toMatchObject({ days: 1, nights: 0, meals: 1, people: 12 });
    expect(kitPlan(kitBySlug("aging-parent")!).needs).toEqual(["older", "mobility"]);
  });

  it("works out water from the official rule: 1 gallon per person per day", () => {
    const kit = kitBySlug("water-storage")!;
    const [water] = kitRows(["water"], kitPlan(kit, { ...kitNumbers(kit), people: 4, days: 3 }));
    expect(water.qty).toBe(12);
    expect(water.item.source).toBe("rg-water");
  });
});
