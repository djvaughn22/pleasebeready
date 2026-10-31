// Kits, lanes, picks and search: every id resolves, every lane has a way in,
// checked products stay the title-verified set, and the search phrases people
// actually type land on the right kit.
import { describe, expect, it } from "vitest";
import { catalog, itemById, occasions } from "../stockup/catalog";
import { NOTE_MAX, decodePlan, encodePlan, parseStore } from "../stockup/storage";
import { guideForKit, guides } from "./guides";
import { kitNumbers, kitPlan, kitRows, numbersFromQuery } from "./kitPlan";
import { kitBySlug, kits, kitsInLane } from "./kits";
import { laneItems, lanes } from "./lanes";
import { areas, levels } from "../readiness";
import { READINESS_TASKS as dailyTasks } from "../dailyReadiness";
import { AMAZON_TAG } from "../gear";
import { shopLink } from "../stockup/shop";
import { checkedOn, hasPick, pickByAsin, picks, primaryPick } from "./picks";
import { kitHref, parseIntent, searchItems, searchKits, searchLanes } from "./search";

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
      expect(k.essentials.length, k.slug).toBeGreaterThanOrEqual(5);
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

  it("keeps catch-all items in their own category's lane", () => {
    const pets = lanes.find((l) => l.id === "pets")!;
    expect(laneItems(pets).map((i) => i.id)).not.toContain("diapers");
    expect(laneItems(pets).map((i) => i.id)).toContain("pet-food");
    expect(searchLanes("new puppy").map((l) => l.id)).not.toContain("moving");
  });

  it("puts every catalog product in at least one lane", () => {
    const products = catalog.filter((c) => c.kind === "product");
    const orphans = products.filter((p) => !lanes.some((l) => laneItems(l).includes(p)));
    expect(orphans.map((o) => o.id)).toEqual([]);
  });
});

describe("exact products", () => {
  it("each fills a real catalog product, with evidence and a date", () => {
    expect(picks.length).toBeGreaterThanOrEqual(100);
    for (const p of picks) {
      expect(itemById(p.item)?.kind, p.asin).toBe("product");
      expect(p.asin, p.item).toMatch(/^[0-9A-Z]{10}$/);
      expect(["page", "search"]).toContain(p.via);
      expect(p.seen.length, p.asin).toBeGreaterThan(5);
      expect(checkedOn(p)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.why.length, p.asin).toBeLessThanOrEqual(90);
      for (const text of [p.name, p.why, p.use]) expect(text, p.asin).not.toMatch(/\bbest\b|#1|guarantee|\$\d|\bfree\b|on sale|deal/i);
    }
  });

  it("has one entry per role per item and no ASIN twice for one item", () => {
    const keys = picks.map((p) => `${p.item}:${p.role}`);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
    const pairs = picks.map((p) => `${p.item}:${p.asin}`);
    expect(pairs.filter((k, i) => pairs.indexOf(k) !== i)).toEqual([]);
  });

  it("covers every Amazon product the checklist and daily tasks link to", () => {
    const linked = [...areas.flatMap((a) => a.gear), ...levels.flatMap((l) => l.gear), ...dailyTasks.flatMap((t) => (t.gear ? [t.gear] : []))];
    for (const g of linked) expect(pickByAsin(g.asin), `${g.name} ${g.asin}`).toBeDefined();
  });

  it("sends the main Amazon button to the item's first pick, and everything else to a labelled search", () => {
    const radio = itemById("weather-radio")!;
    expect(primaryPick("weather-radio")?.role).toBe("pick");
    expect(shopLink(radio)).toMatchObject({ kind: "product", url: `https://www.amazon.com/dp/B015QIC1PW?tag=${AMAZON_TAG}` });
    const chili = itemById("canned-chili")!;
    expect(hasPick("canned-chili")).toBe(false);
    expect(shopLink(chili).kind).toBe("search");
    expect(shopLink(chili).url).toContain(`tag=${AMAZON_TAG}`);
    expect(AMAZON_TAG).toBe("pleasebeready-20");
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

  it("keeps everyday searches on target", () => {
    const ids = (q: string, n = 6) => searchItems(q, n).map((i) => i.id);
    expect(ids("dog")).not.toContain("hot-dogs");
    expect(ids("hot dogs")).toContain("hot-dogs");
    expect(ids("car")).not.toContain("carbon-monoxide-alarm");
    expect(ids("grab bar")).not.toContain("granola-or-protein-bars");
    expect(ids("grab bar")[0]).toBe("grab-bars");
    expect(ids("coleman")).toEqual(expect.arrayContaining(["tent", "camp-stove", "cooler"]));
    expect(ids("midland")).toContain("weather-radio");
    expect(searchKits("storm").map((k) => k.slug)).toEqual(expect.arrayContaining(["winter-storm", "tornado", "hurricane"]));
    expect(searchKits("generator")[0]?.slug).toBe("power-outage");
    expect(searchKits("diapers")[0]?.slug).toBe("new-baby");
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

  it("reads numbers from a kit link without zeroing what the link leaves out", () => {
    const puppy = kitNumbers(kitBySlug("new-puppy")!);
    const family = kitNumbers(kitBySlug("family-emergency-kit")!);
    expect(numbersFromQuery("", puppy)).toEqual(puppy);
    expect(numbersFromQuery("?utm_source=ig", puppy).pets).toBe(1);
    expect(numbersFromQuery("?days=5", family)).toMatchObject({ kids: 2, people: 4, days: 5 });
    expect(numbersFromQuery("?pets=2", puppy).pets).toBe(2);
    expect(numbersFromQuery("?kids=0", family).kids).toBe(0);
    expect(numbersFromQuery("?people=0&days=9999&pets=x", puppy)).toEqual(puppy);
    expect(numbersFromQuery("?kids=7", family).people).toBe(7);
  });

  it("works out water from the official rule: 1 gallon per person per day", () => {
    const kit = kitBySlug("water-storage")!;
    const [water] = kitRows(["water"], kitPlan(kit, { ...kitNumbers(kit), people: 4, days: 3 }));
    expect(water.qty).toBe(12);
    expect(water.item.source).toBe("rg-water");
  });
});

describe("guides", () => {
  it("each leads to a real kit, cites its own sources, and stays plain", () => {
    expect(guides.length).toBeGreaterThanOrEqual(6);
    expect(new Set(guides.map((g) => g.slug)).size).toBe(guides.length);
    for (const g of guides) {
      expect(kitBySlug(g.kit), g.slug).toBeDefined();
      expect(guideForKit(g.kit)?.slug).toBe(g.slug);
      const ids = new Set(g.sources.map((s) => s.id));
      for (const s of g.sources) {
        expect(s.href).toMatch(/^https:\/\/www\.(ready\.gov|redcross\.org|cdc\.gov)\//);
        expect(s.read).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      for (const sec of g.sections) {
        for (const id of sec.from ?? []) expect(ids.has(id), `${g.slug}: ${id}`).toBe(true);
        for (const p of sec.points) expect(p, g.slug).not.toMatch(/\$\d|best seller|guarantee|\bfree\b/i);
      }
    }
  });
});
