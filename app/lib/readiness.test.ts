import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { areaById, areas, itemId, levels, needs, resources, supplyMath } from "./readiness";

const appDir = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(appDir, rel), "utf8");

const OFFICIAL = /^https:\/\/www\.(ready\.gov|redcross\.org|fema\.gov|cdc\.gov)\//;

describe("checklist content", () => {
  test("keeps all eleven areas, each with an official guide", () => {
    expect(areas).toHaveLength(11);
    for (const a of areas) {
      expect(a.href, a.title).toMatch(OFFICIAL);
      expect(a.details.length, a.title).toBeGreaterThan(0);
    }
  });

  test("area ids are unique", () => {
    expect(new Set(areas.map((a) => a.id)).size).toBe(areas.length);
  });

  test("official resources stay official", () => {
    for (const r of resources) expect(r.href).toMatch(OFFICIAL);
  });

  test("every gear item has a well-formed ASIN", () => {
    for (const g of [...areas.flatMap((a) => a.gear), ...levels.flatMap((l) => l.gear)]) {
      expect(g.asin, g.name).toMatch(/^[A-Z0-9]{10}$/);
    }
  });

  test("the dead smoke/CO alarm listing (404 on 2026-10-07) is gone", () => {
    expect(areas.flatMap((a) => a.gear).map((g) => g.asin)).not.toContain("B000MXJ498");
  });

  test("checklist line ids are unique", () => {
    const ids = areas.flatMap((a) => a.details.map((d) => itemId(a.id, d)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("first-time path", () => {
  test("every need has one short free step, an official guide, and real areas", () => {
    expect(needs.length).toBeGreaterThanOrEqual(6);
    for (const n of needs) {
      expect(n.step.minutes, n.id).toBeLessThanOrEqual(15);
      expect(n.guide.href, n.id).toMatch(OFFICIAL);
      for (const id of n.areaIds) expect(areaById(id), `${n.id} → ${id}`).toBeDefined();
    }
  });
});

describe("supply math", () => {
  test("one gallon per person per day", () => {
    expect(supplyMath(4, 3)).toEqual({ gallons: 12, personDays: 12 });
    expect(supplyMath(2, 14)).toEqual({ gallons: 28, personDays: 28 });
  });

  test("bad input is clamped, never NaN or zero", () => {
    expect(supplyMath(Number.NaN, 3).gallons).toBe(3);
    expect(supplyMath(0, 3).gallons).toBe(3);
    expect(supplyMath(999, 999).gallons).toBe(20 * 30);
  });
});

describe("homepage honesty and privacy", () => {
  // The checklist was the home page until Oct 30, 2026; both carry the same notices.
  const page = read("page.tsx");
  const checklist = read("checklist/page.tsx");
  const shopPages = [page, checklist, read("kits/[slug]/page.tsx"), read("shop/[lane]/page.tsx"), read("search/page.tsx")];

  test("keeps the safety disclaimer and the Amazon Associate disclosure", () => {
    for (const p of [page, checklist]) expect(p).toContain("not professional or medical advice");
    for (const p of shopPages) expect(p).toContain("As an Amazon Associate, PleaseBeReady earns from qualifying purchases.");
  });

  // 2026-10-17 (owner): no free/paid/price framing on the site for now.
  test("talks about what is here, not about paid tools or prices", () => {
    expect(checklist).toContain("Checklists and tools");
    for (const p of shopPages) expect(p).not.toMatch(/Paid tools|its price|\bFree help\b|\$\d/);
  });

  test("gear links carry the commission note and rel=sponsored", () => {
    const gear = read("components/GearList.tsx");
    expect(gear).toContain("may earn Open Mirror LLC a commission");
    expect(gear).toContain('rel="noopener noreferrer sponsored"');
  });

  test("the free tools never send what someone typed", () => {
    const visitorTools = ["StartHere.tsx", "SupplyMath.tsx", "ChecklistLines.tsx", "GearList.tsx", "useChecks.ts", "ClickMeasure.tsx"];
    expect(readdirSync(join(appDir, "components"))).toEqual(expect.arrayContaining(visitorTools));
    for (const f of visitorTools) {
      const src = read(join("components", f));
      expect(src, f).not.toMatch(/\bfetch\(|<form|navigator\.sendBeacon|gtag\(/);
    }
    // Supply math and check marks are never measured at all.
    for (const f of ["SupplyMath.tsx", "ChecklistLines.tsx", "useChecks.ts"]) {
      expect(read(join("components", f)), f).not.toMatch(/measure/);
    }
  });

  test("aggregate measurement sends labels only and honors Do Not Track", () => {
    const m = read("lib/measure.ts");
    expect(m).toContain('"need_select" | "guide_click" | "gear_click"');
    expect(m).toContain('nav.doNotTrack === "1"');
    expect(m).toContain("globalPrivacyControl");
    expect(m).toMatch(/gtag\("event", event, \{ label: /);
    expect(read("components/StartHere.tsx")).toContain('measure("need_select", n.id)');
  });

  test("About says what is counted", () => {
    expect(read("about/page.tsx")).toContain("Nothing you type is sent.");
  });
});
