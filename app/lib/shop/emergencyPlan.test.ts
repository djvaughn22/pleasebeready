// Home leads with emergency preparedness (Nov 20 2026, night): a fresh visit's default,
// a returning visitor's own choice, and older saved state.
import { describe, expect, it } from "vitest";
import { kitNumbers, kitPlan, numbersFromQuery } from "./kitPlan";
import { kitBySlug } from "./kits";
import { ALL_SITUATIONS, EVERYDAY, FRESH, LENGTHS, allKitsExist, planHref, planSummary, situationsFor, startingPlan } from "./emergencyPlan";

describe("home emergency planner", () => {
  it("a fresh visit with nothing saved plans a power outage for 4 people, 3 days", () => {
    expect(startingPlan(null, null)).toEqual({ kit: "power-outage", people: 4, days: 3 });
    expect(FRESH).toEqual({ kit: "power-outage", people: 4, days: 3 });
    expect(planHref(startingPlan(null, null))).toBe("/kits/power-outage?people=4&days=3");
  });

  it("every month leads with the power outage and offers only emergencies on top", () => {
    for (let m = 1; m <= 12; m++) {
      const s = situationsFor(m);
      expect(s[0].kit).toBe("power-outage");
      expect(s).toHaveLength(4);
      for (const x of s) expect(kitBySlug(x.kit)?.lane === "emergency" || kitBySlug(x.kit)?.also?.includes("emergency") || x.kit === "heat-wave" || x.kit === "hurricane", x.kit).toBe(true);
      for (const e of EVERYDAY) expect(s.some((x) => x.kit === e.kit)).toBe(false);
    }
    expect(situationsFor(12)[1].kit).toBe("winter-storm");
    expect(situationsFor(7)[1].kit).toBe("heat-wave");
  });

  it("a returning visitor's own choice comes back", () => {
    expect(startingPlan({ kit: "water-storage", people: 6, days: 14 }, { people: 2, days: 30 })).toEqual({ kit: "water-storage", people: 6, days: 14 });
    // a choice from another season still opens
    expect(startingPlan({ kit: "heat-wave", people: 3, days: 7 }, null).kit).toBe("heat-wave");
  });

  it("older saved state: the Food & Water household size seeds People; bad values fall back one field at a time", () => {
    expect(startingPlan(null, { people: 5, days: 30 })).toEqual({ kit: "power-outage", people: 5, days: 3 });
    expect(startingPlan({ kit: "kids-sleepover", people: -1, days: "x" }, { people: 999 })).toEqual(FRESH);
    expect(startingPlan("garbage", 42)).toEqual(FRESH);
  });

  it("every button opens a real kit checklist with the people and days chosen", () => {
    expect(allKitsExist()).toBe(true);
    for (const s of ALL_SITUATIONS) {
      const kit = kitBySlug(s.kit)!;
      expect(kit.ask, s.kit).toContain("people");
      for (const l of LENGTHS) {
        const href = planHref({ kit: s.kit, people: 4, days: l.days });
        const n = numbersFromQuery(href.slice(href.indexOf("?")), kitNumbers(kit));
        const plan = kitPlan(kit, n);
        expect(plan.people, s.kit).toBe(4);
        expect(plan.days, `${s.kit} ${l.days}`).toBe(l.days);
      }
    }
  });

  it("says what the button opens", () => {
    expect(planSummary(FRESH)).toBe("Power outage · 4 people · 3 days");
    expect(planSummary({ kit: "five-day-emergency", people: 1, days: 14 })).toBe("Emergency kit · 1 person · 2 weeks");
  });
});
