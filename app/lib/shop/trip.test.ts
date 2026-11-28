import { describe, expect, it } from "vitest";
import { labelFor } from "../ready/nutrition";
import { itemById } from "../stockup/catalog";
import { amazonList, cartAllowed, cartUrl, flagFromSearch, MARKETS, MAX_CART_LINES, MAX_CART_QTY, type CartLine } from "./amazonCart";
import { offerFor } from "./offers";
import { pickByAsin, picksFor } from "./picks";
import {
  askFromQuery, basket, budgetLine, cleanAsk, coverageLine, EXAMPLE, fitBudget, freshTrip, laterTrips, LIGHT_POWER, packWords,
  parseTrip, planTrip, SITUATIONS, thisTrip, withAsk, withEdit, withPrice, type Ask, type Row, type Trip, type TripPlan,
} from "./trip";
import { tripText } from "./tripText";

const trip = (ask: Partial<Ask>, more: Partial<Trip> = {}): Trip => ({ ...freshTrip(cleanAsk({ ...EXAMPLE, ...ask })), ...more });
const row = (p: TripPlan, key: string) => p.rows.find((r) => r.key === key);

describe("the five answers", () => {
  it("opens on a small example: a power outage, $25, water first, 2 people, 3 days", () => {
    expect(EXAMPLE).toEqual({ for: "outage", budget: 25, first: "water", people: 2, days: 3 });
    const p = planTrip(freshTrip());
    expect(p.order).toEqual(["water", "food", "light"]);
    expect(p.rows[0].key).toBe("water-jugs");
  });

  it("offers Water, Food, and Batteries & light only where they fit", () => {
    const f = Object.fromEntries(SITUATIONS.map((s) => [s.id, s.focus]));
    expect(f.outage).toEqual(["water", "food", "light"]);
    expect(f["water-off"]).toEqual(["water", "food"]);
    expect(f["boil-water"]).toEqual(["water", "food"]);
    expect(f.pantry).toEqual(["food", "water"]);
    expect(f.household).toContain("light");
    expect(cleanAsk({ for: "water-off", first: "light" }).first).toBe("water");
  });

  it("keeps answers in range", () => {
    expect(cleanAsk({ people: 0, days: 999, budget: -5 })).toMatchObject({ people: 1, days: 30, budget: 0 });
    expect(cleanAsk({ people: 6.4, budget: 15 })).toMatchObject({ people: 6, budget: 15 });
  });

  it("reads answers from a link and leaves other links alone", () => {
    expect(askFromQuery("?for=water-off&budget=0&people=1&days=1")).toEqual({ for: "water-off", budget: 0, first: "water", people: 1, days: 1 });
    expect(askFromQuery("?for=outage&first=light&budget=15&people=2&days=3")?.first).toBe("light");
    expect(askFromQuery("?utm_source=x")).toBeNull();
    expect(askFromQuery("")).toBeNull();
  });

  it("switching situations keeps a first choice that still fits", () => {
    const t = trip({ for: "outage", first: "food" });
    expect(withAsk(t, { for: "water-off" }).ask.first).toBe("food");
    expect(withAsk(trip({ for: "outage", first: "light" }), { for: "pantry" }).ask.first).toBe("food");
  });
});

describe("water math (1 gallon per person per day, CDC)", () => {
  it("four people for three days need 12 gallons: 12 single jugs", () => {
    const p = planTrip(trip({ people: 4, days: 3 }));
    const w = row(p, "water-jugs")!;
    expect(w.full).toBe(12);
    expect(w.offer?.pick.asin).toBe("B0851WXNBQ");
    expect(w.packs).toBe(12);
    expect(packWords(w, w.packs)).toBe("12 jugs");
    expect(w.nearby).toContain("2 six-packs");
  });

  it("the same 12 gallons as cases of bottles: 4 cases of 24", () => {
    const p = planTrip(trip({ people: 4, days: 3 }, { water: "bottles" }));
    const w = row(p, "water-bottles")!;
    expect(w.full).toBe(91); // 12 gallons = 1,536 oz = 90.9 bottles of 16.9 oz
    expect(w.packs).toBe(4);
    expect(packWords(w, 4)).toBe("4 cases of 24");
  });

  it("counts safe water on hand; an empty jug is storage until it's filled", () => {
    const base = trip({ people: 4, days: 3 });
    const stored = planTrip({ ...base, home: { ...base.home, water: 5 } });
    expect(row(stored, "water-jugs")!.full).toBe(7);
    const empty = planTrip({ ...base, home: { ...base.home, space: 7 } });
    expect(row(empty, "water-jugs")!.full).toBe(12);
    expect(empty.water!.now).toBe(0);
    expect(empty.checks.some((s) => s.text.includes("7 gallons"))).toBe(true);
    const filled = planTrip({ ...base, home: { ...base.home, space: 7, filled: true } });
    expect(row(filled, "water-jugs")!.full).toBe(5);
    expect(filled.water!.now).toBe(7);
  });

  it("says how many days the water covers after this trip", () => {
    let t = trip({ people: 4, days: 3, budget: 25 });
    const key = row(planTrip(t), "water-jugs")!.priceKey;
    t = withPrice(t, key, 2.5);
    const p = planTrip(t);
    const w = row(p, "water-jugs")!;
    expect(w.now).toBe(10);
    expect(w.later).toBe(2);
    expect(p.water!.days).toBe(2);
    expect(coverageLine("water", p.water!, 3)).toBe("You’ll have water for 2 of your 3 days.");
  });
});

describe("food math (label calories, an estimate)", () => {
  it("uses a few easy foods for a small gap and the full mix for a big one", () => {
    expect(basket(2).map((b) => b.id)).toEqual(["canned-soups-and-stews", "peanut-butter", "pretzels-and-crackers"]);
    expect(basket(8)).toHaveLength(5);
    expect(basket(30)).toHaveLength(9);
    for (const pd of [1, 6, 40]) expect(basket(pd).reduce((t, b) => t + b.share, 0)).toBeCloseTo(1, 9);
    for (const b of basket(40)) expect(labelFor(b.id)).toBeTruthy();
  });

  it("buying every food row covers the gap; each kind counts only up to its share", () => {
    const t = trip({ for: "pantry", first: "food", people: 2, days: 7, budget: 50 });
    const p = planTrip(t);
    expect(p.food!.need).toBe(14);
    expect(p.food!.days).toBe(7);
    // One kind alone can't make a week: only the peanut butter this trip.
    let only = t;
    for (const r of p.rows.filter((r) => r.group === "food" && r.key !== "food-peanut-butter")) only = withEdit(only, r.key, { stage: "later" });
    const q = planTrip(only);
    expect(row(q, "food-peanut-butter")!.now).toBeGreaterThan(0);
    // Two 40 oz jars hold 6.65 person-days of calories, but peanut butter counts only up to its 20% share.
    expect(q.food!.after).toBeCloseTo(14 * 0.2, 6);
    expect(q.food!.days).toBe(1);
  });

  it("a pantry with food already on hand buys only the rest", () => {
    const base = trip({ for: "pantry", first: "food", people: 2, days: 7 });
    const p = planTrip({ ...base, home: { ...base.home, foodDays: 4, water: 10 } });
    expect(p.food!.daysNow).toBe(4);
    const kcal = p.rows.filter((r) => r.key.startsWith("food-")).reduce((t, r) => t + r.full * labelFor(r.item.id)!.kcal, 0);
    expect(kcal).toBeGreaterThanOrEqual(6 * 2000);
    expect(kcal).toBeLessThan(6 * 2000 * 1.6);
    expect(row(p, "water-jugs")!.full).toBe(4);
    expect(p.food!.days).toBe(7);
  });

  it("adds a can opener with canned food, and dropping it is the shopper's call", () => {
    const p = planTrip(trip({ first: "food" }));
    const opener = row(p, "can-opener")!;
    expect(opener.full).toBe(1);
    const had = planTrip(withEdit(trip({ first: "food" }), "can-opener", { have: 1 }));
    expect(row(had, "can-opener")!.need).toBe(0);
  });

  it("calls food an estimate", () => {
    const p = planTrip(trip({ first: "food", people: 1, days: 3 }));
    expect(coverageLine("food", p.food!, 3)).toBe("You’ll have food for about all 3 days.");
  });
});

describe("batteries and light", () => {
  it("two people, $15, three days, light first: two flashlights and a power bank", () => {
    const p = planTrip(trip({ first: "light", people: 2, days: 3, budget: 15 }));
    expect(p.order[0]).toBe("light");
    const f = row(p, "flashlights")!;
    expect(f.full).toBe(2);
    expect(f.packs).toBe(1);
    expect(LIGHT_POWER[f.offer!.pick.asin]).toBe("USB");
    expect(row(p, "power-bank")).toBeTruthy();
    expect(thisTrip(p).every((r) => r.group === "light")).toBe(true);
  });

  it("asks for the battery size and buys spares for the lights at home", () => {
    const base = trip({ first: "light", people: 2, days: 3 });
    const p = planTrip({ ...base, home: { ...base.home, lights: 1, battery: "AAA" } });
    const b = row(p, "batteries-AAA")!;
    // 1 light at home + 1 new AAA flashlight, 3 each, one spare set
    expect(b.full).toBe(6);
    expect(packWords(b, b.packs)).toBe("1 pack of 36");
    expect(b.note).toContain("depends on the light");
    const unsure = planTrip({ ...base, home: { ...base.home, lights: 2, battery: "unsure" } });
    expect(row(unsure, "batteries-AA")!.note).toContain("Check the battery door");
  });

  it("every flashlight we list says what it runs on", () => {
    for (const p of picksFor("flashlights")) expect(LIGHT_POWER[p.asin]).toBeDefined();
  });
});

describe("budget", () => {
  it("$0 buys nothing and still gives free steps and what to buy first later", () => {
    const p = planTrip(trip({ for: "water-off", budget: 0, people: 1, days: 1 }));
    expect(thisTrip(p)).toHaveLength(0);
    expect(budgetLine(p)).toBe("A $0 trip: start with step 1, what’s free.");
    expect(p.checks[0].text).toContain("fill clean jugs");
    expect(laterTrips(p)[0].key).toBe("water-jugs");
    expect(row(p, "water-jugs")!.full).toBe(1);
  });

  it("never says an unpriced trip fits", () => {
    const p = planTrip(trip({ people: 4, budget: 25 }));
    expect(p.budget.fits).toBeNull();
    expect(budgetLine(p)).toMatch(/can’t tell/);
  });

  it("fills this trip in order at the shopper's prices, and partly when only some fits", () => {
    let t = trip({ people: 4, days: 3, budget: 25, first: "water" });
    const w = row(planTrip(t), "water-jugs")!;
    t = withPrice(t, w.priceKey, 1.29);
    const p = planTrip(t);
    expect(row(p, "water-jugs")!.now).toBe(12);
    expect(p.budget).toMatchObject({ known: 15.48, unpriced: 0, fits: true, left: 9.52 });
    expect(budgetLine(p)).toBe("This trip: $15.48 of your $25, $9.52 left.");
  });

  it("brings the next priced thing forward when money is left", () => {
    let t = trip({ people: 1, days: 1, budget: 10, first: "water" });
    const p0 = planTrip(t);
    t = withPrice(t, row(p0, "water-jugs")!.priceKey, 1.5);
    const pb = row(p0, "food-peanut-butter")!;
    t = withPrice(t, pb.priceKey, 6);
    const p = planTrip(t);
    expect(row(p, "food-peanut-butter")!.now).toBe(1);
    expect(p.budget.known).toBe(7.5);
  });

  it("a row the shopper adds stays in, and the trip says it's over", () => {
    let t = trip({ budget: 0 });
    t = withEdit(t, "flashlights", { stage: "now" });
    const p0 = planTrip(t);
    t = withPrice(t, row(p0, "flashlights")!.priceKey, 12);
    const p = planTrip(t);
    expect(row(p, "flashlights")!.now).toBe(1);
    expect(p.budget.over).toBe(12);
    expect(budgetLine(p)).toContain("over your $0");
  });

  it("budget fit is pure arithmetic over rows in order", () => {
    const r = (key: string, packs: number, price: number | null, first = true) => ({ key, packs, price, first, pinned: null, now: 0, later: 0 }) as unknown as Row;
    const rows = [r("a", 3, 4), r("b", 2, 5), r("c", 1, null, false)];
    const b = fitBudget(rows, 20);
    expect(rows.map((x) => [x.now, x.later])).toEqual([[3, 0], [1, 1], [0, 1]]);
    expect(b).toMatchObject({ known: 17, left: 3, fits: true });
  });
});

describe("what the shopper has, and products that change", () => {
  it("having some lowers the need by exactly that much", () => {
    const t = trip({ for: "household", first: "paper", people: 4, days: 30 });
    const tp = row(planTrip(t), "toilet-paper")!;
    expect(tp.full).toBe(48);
    const p = planTrip(withEdit(t, "toilet-paper", { have: 10 }));
    expect(row(p, "toilet-paper")!.need).toBe(38);
    const all = planTrip(withEdit(t, "toilet-paper", { have: 99 }));
    expect(row(all, "toilet-paper")!.need).toBe(0);
    expect(row(all, "toilet-paper")!.packs).toBe(0);
  });

  it("a product that leaves the store falls back to ours with a note", () => {
    const t = withEdit(trip({ first: "food" }), "food-peanut-butter", { pick: "B0GONE0000" });
    const r = row(planTrip(t), "food-peanut-butter")!;
    expect(r.stale).toBe(true);
    expect(picksFor("peanut-butter").map((p) => p.asin)).toContain(r.offer!.pick.asin);
  });

  it("a changed pack size recounts packages and drops the old price", () => {
    const pick = pickByAsin("B003O3ACJ4")!;
    expect(offerFor(pick, 91).packs).toBe(4);
    expect(offerFor({ ...pick, count: 12 }, 91).packs).toBe(8);
    const t = trip({ people: 4 }, { water: "bottles" });
    const priced = planTrip(withPrice(t, "a:B003O3ACJ4:24", 6));
    expect(row(priced, "water-bottles")!.price).toBe(6);
    const old = planTrip(withPrice(t, "a:B003O3ACJ4:12", 6));
    expect(row(old, "water-bottles")!.price).toBeNull();
    expect(row(old, "water-bottles")!.repriced).toBe(true);
    expect(row(priced, "water-bottles")!.repriced).toBe(false);
  });

  it("two cases of the same size keep our pick", () => {
    const soup = row(planTrip(trip({ for: "water-off", budget: 0, people: 1, days: 1 })), "food-canned-soups-and-stews")!;
    expect(soup.need).toBe(3);
    expect(soup.offer!.pick.asin).toBe("B0014EW4L4");
  });

  it("picks the pack that buys the least extra, and a swap recounts", () => {
    const t = trip({ for: "pantry", first: "food", people: 1, days: 2 });
    const pb = row(planTrip(t), "food-peanut-butter")!;
    expect(pb.need).toBe(1);
    expect(pb.offer!.pick.asin).toBe("B0005ZH4QI"); // one 40 oz jar, not the 2-jar pack
    const swapped = row(planTrip(withEdit(t, "food-peanut-butter", { pick: "B07DTYVDJ6" })), "food-peanut-butter")!;
    expect(swapped.offer!.pick.asin).toBe("B07DTYVDJ6");
    expect(swapped.packs).toBe(1);
  });

  it("an item with no exact product stays on the local list", () => {
    const p = planTrip(trip({ for: "household", first: "cleaning", people: 2, days: 30, budget: 25 }));
    const soap = row(p, "hand-soap")!;
    expect(soap.offer).toBeNull();
    expect(soap.localOnly).toBe(true);
    const list = amazonList(p);
    expect(list.local.map((r) => r.key)).toContain("hand-soap");
    expect(list.lines.some((l) => l.rows.includes("hand-soap"))).toBe(false);
  });
});

describe("Amazon list and cart link", () => {
  it("one line per product with the exact package count; nearby rows stay local", () => {
    let t = trip({ people: 4, days: 3, budget: 50, first: "water" });
    t = withEdit(t, "food-peanut-butter", { stage: "now" });
    t = withEdit(t, "food-canned-soups-and-stews", { stage: "now", local: true });
    const list = amazonList(planTrip(t));
    expect(list.lines.find((l) => l.asin === "B0851WXNBQ")).toMatchObject({ qty: 12, words: "12 jugs" });
    expect(list.lines.some((l) => l.rows.includes("food-peanut-butter"))).toBe(true);
    expect(list.local.map((r) => r.key)).toEqual(["food-canned-soups-and-stews"]);
  });

  it("merges rows that share a product by the units they need together", () => {
    const pick = pickByAsin("B00LH3DMUO")!; // AAA, 36 to a pack
    const fake = (key: string, need: number): Row => {
      const offer = offerFor(pick, need);
      return { key, group: "light", item: itemById("aaa-batteries")!, label: "AAA", full: need, have: 0, need, how: "", offers: [offer], offer, stale: false,
        local: false, localOnly: false, nearby: null, big: false, packs: offer.packs, unitsPer: 36, want: need, priceKey: "", price: null, repriced: false,
        now: offer.packs, later: 0, pinned: null, first: true, note: null };
    };
    const plan = { rows: [fake("a", 20), fake("b", 10)] } as unknown as TripPlan;
    const list = amazonList(plan);
    expect(list.lines).toHaveLength(1);
    expect(list.lines[0]).toMatchObject({ asin: "B00LH3DMUO", qty: 1, rows: ["a", "b"] });
    const more = amazonList({ rows: [fake("a", 30), fake("b", 30)] } as unknown as TripPlan);
    expect(more.lines[0].qty).toBe(2);
  });

  it("builds Amazon's multi-item form link with the tag, ASIN.n and Quantity.n", () => {
    const lines = [{ asin: "B0851WXNBQ", qty: 12 }, { asin: "B0005ZH4QI", qty: 1 }] as CartLine[];
    expect(cartUrl(lines, "US", "pleasebeready-20")).toBe(
      "https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=pleasebeready-20&ASIN.1=B0851WXNBQ&Quantity.1=12&ASIN.2=B0005ZH4QI&Quantity.2=1");
    expect(cartUrl([], "US")).toBeNull();
    expect(cartUrl(lines, "UK")).toBeNull();
  });

  it("keeps lines past our caps off the cart link", () => {
    const mk = (i: number, qty = 1) => ({ asin: `B0TEST${String(i).padStart(4, "0")}`, qty }) as CartLine;
    const plan = { rows: [] } as unknown as TripPlan;
    expect(amazonList(plan).cart).toHaveLength(0);
    const lines = Array.from({ length: MAX_CART_LINES + 1 }, (_, i) => mk(i));
    const cart = lines.filter((l, i) => i < MAX_CART_LINES && l.qty <= MAX_CART_QTY);
    expect(cart).toHaveLength(20);
    expect(MAX_CART_QTY).toBe(99);
    const p = planTrip(trip({ people: 20, days: 30, budget: 5000 }));
    const list = amazonList(p);
    const jugs = list.lines.find((l) => l.asin === "B0851WXNBQ")!;
    expect(jugs.qty).toBe(600);
    expect(list.overflow).toContain(jugs);
    expect(list.cart).not.toContain(jugs);
  });

  it("is off by default, never on the live site or a production build", () => {
    expect(MARKETS.US.verified).toBe(false);
    expect(cartAllowed({ deploy: "preview", host: "pleasebeready-abc.vercel.app", flag: false })).toBe(false);
    expect(cartAllowed({ deploy: "preview", host: "pleasebeready-abc.vercel.app", flag: true })).toBe(true);
    expect(cartAllowed({ deploy: "production", host: "pleasebeready-abc.vercel.app", flag: true })).toBe(false);
    expect(cartAllowed({ deploy: "preview", host: "pleasebeready.com", flag: true })).toBe(false);
    expect(cartAllowed({ deploy: "preview", host: "www.pleasebeready.com", flag: true })).toBe(false);
    expect(cartAllowed({ deploy: "preview", host: "x.vercel.app", flag: true, market: "UK" })).toBe(false);
    expect(flagFromSearch("?amazon-cart=test")).toBe(true);
    expect(flagFromSearch("?amazon-cart=1")).toBe(false);
  });
});

describe("journeys", () => {
  it("one student, $0, one day, water shutoff", () => {
    const p = planTrip(trip({ for: "water-off", budget: 0, people: 1, days: 1 }));
    expect(p.water!.need).toBe(1);
    expect(coverageLine("water", p.water!, 1)).toBe("No water counted yet.");
    const filled = planTrip({ ...trip({ for: "water-off", budget: 0, people: 1, days: 1 }), home: { ...freshTrip().home, space: 2, filled: true } });
    expect(coverageLine("water", filled.water!, 1)).toBe("You’ll have water for your 1 day.");
    expect(row(filled, "water-jugs")).toBeUndefined();
  });

  it("a family of six gets the same kind of plan", () => {
    const p = planTrip(trip({ people: 6, days: 3, budget: 50 }));
    expect(row(p, "water-jugs")!.full).toBe(18);
    expect(p.food!.need).toBe(18);
    expect(p.rows.filter((r) => r.key.startsWith("food-")).length).toBe(9);
  });

  it("boil-water steps follow CDC: bottled or boiled, a full rolling boil for 1 minute", () => {
    const p = planTrip(trip({ for: "boil-water" }));
    const text = p.checks.map((s) => s.text).join(" ");
    expect(text).toContain("1 minute (3 minutes above 6,500 feet)");
    expect(p.checks.every((s) => !s.source || s.source.href.startsWith("https://www.cdc.gov/"))).toBe(true);
  });

  it("every situation builds rows from catalog items with real units", () => {
    for (const s of SITUATIONS) {
      for (const first of s.focus) {
        const p = planTrip(trip({ for: s.id, first, people: 3, days: 5, budget: 25 }));
        expect(p.rows.length).toBeGreaterThan(0);
        for (const r of p.rows) {
          expect(itemById(r.item.id)).toBeTruthy();
          expect(packWords(r, Math.max(1, r.packs))).toMatch(/^\d/);
        }
      }
    }
  });
});

describe("saving and the printed list", () => {
  it("parses a stored trip field by field", () => {
    expect(parseTrip(null)).toBeNull();
    const t = parseTrip({ ask: { for: "pantry", people: 99, first: "light" }, home: { water: "4", battery: "D", lights: -3 }, edits: { x: { have: 2.6, pick: "nope", stage: "later" } }, prices: { "a:B0851WXNBQ:1": 1.299, bad: -1 }, water: "bottles" })!;
    expect(t.ask).toMatchObject({ for: "pantry", people: 20, first: "food" });
    expect(t.home).toMatchObject({ water: 4, battery: "D", lights: 0 });
    expect(t.edits.x).toEqual({ have: 3, stage: "later" });
    expect(t.prices).toEqual({ "a:B0851WXNBQ:1": 1.3 });
    expect(t.water).toBe("bottles");
  });

  it("the downloaded list has counts and names but no Amazon links", () => {
    let t = trip({ people: 4, days: 3, budget: 25 });
    t = withPrice(t, row(planTrip(t), "water-jugs")!.priceKey, 1.29);
    const text = tripText(planTrip(t));
    expect(text).toContain("[ ] Drinking water: 12 jugs (12 gallons, single jugs) · Amazon: Pure Life purified water, 1-gallon jug · your price $1.29 each = $15.48");
    expect(text).toContain("NEXT TRIP");
    expect(text).not.toMatch(/amazon\.com|tag=|https?:\/\//i);
  });
});
