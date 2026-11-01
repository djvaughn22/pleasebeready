import { describe, expect, it } from "vitest";
import { withDays } from "../stockup/calc";
import { itemById } from "../stockup/catalog";
import { decodePlan, encodePlan, newPlan, parsePlan } from "../stockup/storage";
import type { Line, OccasionId, Pace, Plan } from "../stockup/types";
import { KIT_IDS, defaultGuide, gaps, readiness, waterHint } from "./engine";

const TODAY = "2026-10-31";

function plan(o: { occ?: OccasionId; people?: number; days?: number; pace?: Pace; size?: number; pets?: number; babies?: number; kids?: number; needs?: Plan["needs"]; list?: Record<string, Line> } = {}): Plan {
  const p = withDays({ ...newPlan(o.occ ?? "emergency"), people: o.people ?? 4, pets: o.pets ?? 0, babies: o.babies ?? 0, kids: o.kids ?? 0, needs: o.needs ?? [] }, o.days ?? 14);
  const guide = defaultGuide(o.pace ?? "weekly", TODAY);
  return { ...p, guide: o.size ? { ...guide, size: o.size } : guide, list: o.list ?? {} };
}
const line = (l: Partial<Line> = {}): Line => ({ qty: null, have: 0, got: false, ...l });
const item = (r: ReturnType<typeof readiness>, id: string) => r.items.find((i) => i.item.id === id);
const scheduled = (r: ReturnType<typeof readiness>, id: string) => r.steps.flatMap((s) => s.entries).filter((e) => e.id === id);

describe("readiness plan", () => {
  it("every kit row is a real catalog item", () => {
    for (const id of KIT_IDS) expect(itemById(id), id).toBeTruthy();
  });

  it("one person for three days: 3 gallons and 3 person-days of food, all in one base", () => {
    const r = readiness(plan({ people: 1, days: 3 }), TODAY);
    expect(item(r, "water")!.need).toBe(3);
    expect(item(r, "shelf-food")!.need).toBe(3);
    expect(r.baseDays).toBe(3);
    expect(scheduled(r, "water").map((e) => e.buy)).toEqual([3]);
  });

  it("four people for two weeks, weekly: water and food first, a 3-day base before more", () => {
    const r = readiness(plan({ people: 4, days: 14, pace: "weekly" }), TODAY);
    expect(item(r, "water")!.need).toBe(56);
    const first = r.steps[0].entries.map((e) => e.id);
    expect(first.slice(0, 3)).toEqual(["meds", "water", "shelf-food"]);
    expect(first).toContain("manual-can-opener");
    expect(r.steps[0].entries.find((e) => e.id === "water")!.buy).toBe(12);
    // Water steps add up to the full 56 gallons, in order of growing targets.
    const w = scheduled(r, "water");
    expect(w.reduce((t, e) => t + e.buy, 0)).toBe(56);
    expect(w.map((e) => e.upto)).toEqual([12, 28, 56]);
    // Every essential's base comes before any recommended thing.
    const firstRec = r.steps.findIndex((s) => s.entries.some((e) => e.tier === "recommended"));
    const lastBase = r.steps.findLastIndex((s) => s.entries.some((e) => e.why === "3-day base"));
    expect(firstRec).toBeGreaterThanOrEqual(lastBase);
    expect(r.steps[1].date).toBe("2026-11-07");
  });

  it("eight people for a month: 240 gallons with a storage note; upgrades are never scheduled", () => {
    const r = readiness(plan({ people: 8, days: 30, pace: "monthly" }), TODAY);
    expect(item(r, "water")!.need).toBe(240);
    expect(waterHint(240)).toMatch(/35 seven-gallon/);
    const all = r.steps.flatMap((s) => s.entries);
    expect(all.some((e) => e.tier === "upgrade")).toBe(false);
    expect(all.some((e) => e.stage === "extras")).toBe(false);
    expect(r.steps[1].date).toBe("2026-11-30");
  });

  it("a monthly plan with a small budget keeps each step small, but critical things never wait", () => {
    const r = readiness(plan({ people: 2, days: 30, pace: "monthly", size: 3, babies: 1 }), TODAY);
    const buys = (n: number) => r.steps[n].entries.filter((e) => !e.task);
    // Step 1: critical (medicine, formula, diapers) plus the base water, food and its opener.
    expect(buys(0).map((e) => e.id)).toEqual(expect.arrayContaining(["meds", "baby-food-and-formula", "diapers", "water"]));
    for (const s of r.steps.slice(1)) expect(s.entries.filter((e) => !e.task).length).toBeLessThanOrEqual(4);
  });

  it("pets add pet food, pet water and a leash; no pets, no pet items", () => {
    const withPets = readiness(plan({ pets: 2 }), TODAY);
    for (const id of ["pet-food", "pet-water", "leash-and-id-tag"]) expect(item(withPets, id), id).toBeTruthy();
    expect(item(withPets, "pet-food")!.need).toBe(28);
    const none = readiness(plan(), TODAY);
    expect(none.items.some((i) => i.item.cat === "pets")).toBe(false);
  });

  it("a household with water but no food goes straight to food", () => {
    const r = readiness(plan({ list: { water: line({ have: 56 }), meds: line({ got: true }) } }), TODAY);
    expect(item(r, "water")!.state).toBe("have");
    expect(scheduled(r, "water")).toHaveLength(0);
    expect(r.next!.id).toBe("shelf-food");
  });

  it("a household with most essentials is nearly ready, and its next step is what's missing", () => {
    const p = plan({ people: 2, days: 7 });
    const r0 = readiness(p, TODAY);
    const list: Record<string, Line> = {};
    for (const i of r0.items) if ((i.tier === "essential" || i.tier === "critical") && i.item.id !== "first-aid-kit") list[i.item.id] = i.item.kind === "task" ? line({ got: true }) : line({ have: i.need });
    const r = readiness({ ...p, list }, TODAY);
    expect(r.ready).toBeGreaterThan(0.9);
    expect(r.ready).toBeLessThan(1);
    expect(r.next!.id).toBe("first-aid-kit");
  });

  it("Ready Now puts every essential in one step at its full amount", () => {
    const r = readiness(plan({ people: 4, days: 14, pace: "now" }), TODAY);
    expect(r.steps.length).toBe(2);
    expect(r.steps[0].entries.every((e) => e.tier !== "recommended")).toBe(true);
    expect(r.steps[0].entries.find((e) => e.id === "water")!.buy).toBe(56);
    expect(r.steps[1].entries.every((e) => e.tier === "recommended")).toBe(true);
  });

  it("changing people or days keeps what you have and recounts what's missing", () => {
    const p = plan({ people: 2, days: 7, list: { water: line({ have: 14 }) } });
    expect(item(readiness(p, TODAY), "water")!.state).toBe("have");
    const bigger = { ...p, people: 4 };
    const w = item(readiness(bigger, TODAY), "water")!;
    expect([w.need, w.covered]).toEqual([28, 14]);
    const longer = withDays(p, 30);
    expect(item(readiness(longer, TODAY), "water")!.need).toBe(60);
  });

  it("partial buys, filled containers and 3-day food kits count toward the amounts", () => {
    const r = readiness(plan({ people: 4, days: 14, list: {
      water: line({ bought: 10 }), "water-storage-container": line({ got: true }), "3-day-emergency-food-supply": line({ have: 4 }),
    } }), TODAY);
    const w = item(r, "water")!;
    expect([w.bought, w.extra, w.covered, w.state]).toEqual([10, 14, 24, "saved"]);
    expect(item(r, "shelf-food")!.covered).toBe(12);
  });

  it("an upgrade never counts as missing and marking one doesn't move readiness", () => {
    const p = plan();
    const before = readiness(p, TODAY);
    const after = readiness({ ...p, list: { "portable-power-station": line({ got: true }) } }, TODAY);
    expect(item(before, "portable-power-station")!.tier).toBe("upgrade");
    expect(after.ready).toBe(before.ready);
  });

  it("restock means it needs buying again", () => {
    const r = readiness(plan({ list: { flashlights: line({ got: true, restock: true }) } }), TODAY);
    expect(item(r, "flashlights")!.state).toBe("restock");
    expect(item(r, "flashlights")!.covered).toBe(0);
  });

  it("hazard rules move urgent needs to the first step", () => {
    const med = readiness(plan({ needs: ["medical"] }), TODAY);
    expect(med.urgent.length).toBeGreaterThan(0);
    expect(med.steps[0].entries.map((e) => e.id)).toEqual(expect.arrayContaining(["power-device-plan", "medical-device-backup-batteries"]));
    const fire = readiness(plan({ occ: "wildfire", days: 5 }), TODAY);
    expect(fire.steps[0].entries.map((e) => e.id)).toContain("go-bag");
    expect(item(fire, "masks")!.tier).toBe("essential");
    const heat = readiness(plan({ occ: "heat", days: 5 }), TODAY);
    expect(item(heat, "water")!.tier).toBe("critical");
    const cold = readiness(plan({ occ: "winter", days: 3 }), TODAY);
    expect(item(cold, "warm-layers")!.tier).toBe("essential");
  });

  it("a birthday party uses its own essentials, not emergency priorities", () => {
    const r = readiness(plan({ occ: "party", people: 12, days: 1, pace: "now" }), TODAY);
    expect(r.kind).toBe("general");
    expect(r.urgent).toEqual([]);
    for (const id of ["water", "shelf-food", "weather-radio", "flashlights"]) expect(item(r, id), id).toBeFalsy();
    expect(r.steps[0].entries.map((e) => e.id)).toEqual(expect.arrayContaining(["paper-plates", "cups", "napkins"]));
    expect(r.steps[0].entries.every((e) => e.tier === "essential" || e.tier === "critical")).toBe(true);
  });

  it("a kit only adds what the plan still needs, once", () => {
    const r = readiness(plan({ list: { flashlights: line({ have: 4 }), batteries: line() } }), TODAY);
    expect(gaps(r, ["flashlights", "batteries", "power-bank", "lantern", "portable-power-station", "paper-plates"])).toEqual(["lantern", "power-bank"]);
  });

  it("a plan survives save, share and restore with its pace and partial buys", () => {
    const p = plan({ pace: "custom", size: 4, list: { water: line({ bought: 7, note: "garage" }) } });
    const back = parsePlan(JSON.parse(JSON.stringify(p)))!;
    expect(back.guide).toEqual(p.guide);
    expect(back.list.water.bought).toBe(7);
    const shared = decodePlan(encodePlan(p))!;
    expect(shared.guide).toEqual(p.guide);
    expect(readiness(shared, TODAY).ready).toBe(readiness(p, TODAY).ready);
  });
});
