// The home planner (Nov 20 2026) and the way out when a listing is unavailable.
import { describe, expect, it } from "vitest";
import { AMAZON_TAG } from "../gear";
import { itemById } from "../stockup/catalog";
import { backupLink, shopLink } from "../stockup/shop";
import { kitNumbers, kitPlan, kitRows, numbersFromQuery } from "./kitPlan";
import { WINTER_MONTHS, kitBySlug } from "./kits";
import { maxPeople, occasionHref, occasionsFor } from "./occasions";
import { offersFor, packText, staleChoice } from "./offers";
import { pickByAsin } from "./picks";

describe("the home planner", () => {
  it("leads with a sleepover, a birthday party and camping, then storm or outage, then Food & Water", () => {
    for (let m = 1; m <= 12; m++) {
      const ids = occasionsFor(m).map((o) => o.id);
      expect(ids.slice(0, 3)).toEqual(["kids-sleepover", "birthday-party", "weekend-camping"]);
      expect(ids).toHaveLength(6);
      expect(ids.at(-1)).toBe("food-water");
      expect(ids[4]).toBe(WINTER_MONTHS.includes(m) ? "winter-storm" : "power-outage");
    }
  });

  it("every occasion opens a real plan for the people chosen", () => {
    for (const o of [...occasionsFor(1), ...occasionsFor(6)]) {
      if (!o.kit) {
        expect(occasionHref(o, 4)).toBe("/food-water?people=4&days=7");
        continue;
      }
      const kit = kitBySlug(o.kit)!;
      expect(kit, o.kit).toBeTruthy();
      expect(kit.ask, o.kit).toContain("people");
      const href = occasionHref(o, 4);
      expect(href).toBe(`/kits/${o.kit}?people=4`);
      const n = numbersFromQuery(href.slice(href.indexOf("?")), kitNumbers(kit));
      expect(kitPlan(kit, n).people, o.id).toBe(4);
    }
  });

  it("the button says what it opens", () => {
    const [sleepover, party, camping] = occasionsFor(11);
    expect(sleepover.cta(4)).toBe("Plan a sleepover for 4");
    expect(party.cta(20)).toBe("Plan a birthday party for 20");
    expect(camping.cta(4)).toBe("Plan a camping trip for 4");
    expect(occasionsFor(11)[4].cta(1)).toBe("Plan for a winter storm, 1 person");
    expect(occasionsFor(7)[4].cta(3)).toBe("Plan for a power outage, 3 people");
  });

  it("Food & Water keeps its own limit and this device's days", () => {
    const fw = occasionsFor(6).at(-1)!;
    expect(maxPeople(fw)).toBe(50);
    expect(occasionHref(fw, 80, 14)).toBe("/food-water?people=50&days=14");
  });
});

describe("a four-person sleepover", () => {
  const kit = kitBySlug("kids-sleepover")!;
  const plan = kitPlan(kit, numbersFromQuery("?people=4", kitNumbers(kit)));
  const rows = Object.fromEntries(kitRows(kit.essentials, plan).map((r) => [r.item.id, r]));

  it("plans kids' sleeping bags, not camping bags, one per kid", () => {
    expect(rows["sleeping-bags"]).toBeUndefined();
    expect(rows["kids-sleeping-bags"].qty).toBe(4);
    expect(shopLink(rows["kids-sleeping-bags"].item).url).toBe(`https://www.amazon.com/s?k=kids+sleeping+bag&tag=${AMAZON_TAG}`);
  });

  it("buys plates, cups and napkins in their real packs", () => {
    const pack = (id: string) => packText(offersFor(id, rows[id].qty)[0], rows[id].item);
    expect([rows["paper-plates"].qty, pack("paper-plates")]).toEqual([24, "1 pack of 176"]);
    expect([rows.cups.qty, pack("cups")]).toEqual([32, "1 pack of 200"]);
    expect([rows.napkins.qty, pack("napkins")]).toEqual([48, "1 pack of 200"]);
  });
});

describe("when a listing is unavailable or wrong", () => {
  it("a product that left the store opens a labelled Amazon search for the same item, with no extra tap", () => {
    // Nov 20 2026: the tent (used offer only, twice) and the cookset (listing is the small set) left the store.
    for (const asin of ["B07XGDP7D7", "B0CXC4JG7D"]) expect(pickByAsin(asin), asin).toBeUndefined();
    const tent = shopLink(itemById("tent")!);
    expect(tent.kind).toBe("search");
    expect(tent.url).toBe(`https://www.amazon.com/s?k=4+person+tent&tag=${AMAZON_TAG}`);
    expect(tent.label).toBe("Amazon search: “4 person tent”");
    expect(shopLink(itemById("camp-cookware-set")!).kind).toBe("search");
  });

  it("a list that chose a product we later removed opens our current pick and says so", () => {
    // B0DDQL8T6Z: the Energizer 2-pack listing Amazon showed as Currently unavailable on Nov 19.
    expect(pickByAsin("B0DDQL8T6Z")).toBeUndefined();
    expect(staleChoice("headlamps", "B0DDQL8T6Z")).toBe(true);
    const link = shopLink(itemById("headlamps")!, "B0DDQL8T6Z");
    expect(link.kind).toBe("product");
    expect(link.pick?.asin).toBe("B0BN4K3PT6");
  });

  it("every exact product in the three journeys has a one-tap search beside it, named as Amazon's", () => {
    for (const slug of ["kids-sleepover", "birthday-party", "weekend-camping"]) {
      const k = kitBySlug(slug)!;
      for (const r of kitRows(k.essentials, kitPlan(k))) {
        const link = shopLink(r.item);
        if (link.kind === "search") {
          expect(backupLink(r.item), r.item.id).toBeNull();
          expect(link.url, r.item.id).toContain(`tag=${AMAZON_TAG}`);
          continue;
        }
        const b = backupLink(r.item)!;
        expect(b.url, r.item.id).toContain("/s?k=");
        expect(b.url, r.item.id).toContain(`tag=${AMAZON_TAG}`);
      }
    }
  });

  it("the match kit counts in kits, not lighters", () => {
    const item = itemById("lighter-or-matches")!;
    expect(packText(offersFor(item.id, 2)[0], item)).toBe("2 match kits");
  });
});
