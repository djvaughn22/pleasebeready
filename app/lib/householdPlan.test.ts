import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  MAX_FIELD, MAX_ROWS, PLAN_KEY, POISON_HELP, READY_FORM_URL, READY_PLAN_URL,
  emptyPlan, erasePlan, filledRows, isEmpty, loadPlan, parsePlan, savePlan, walletLines,
} from "./householdPlan";

const appDir = join(__dirname, "..");
const read = (p: string) => readFileSync(join(appDir, p), "utf8");

function memoryStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
}

describe("household plan data", () => {
  test("a fresh plan has Ready.gov's sections, two people, two meeting places and the Poison Help line", () => {
    const p = emptyPlan();
    expect(Object.keys(p)).toEqual(["v", "home", "people", "places", "contacts", "meeting", "medical", "updated"]);
    expect(p.people).toHaveLength(2);
    expect(p.meeting).toHaveLength(2);
    expect(p.medical.poison).toBe(POISON_HELP);
    expect(isEmpty(p)).toBe(true);
  });

  test("broken, missing or other-version data opens a fresh plan instead of failing", () => {
    for (const raw of [null, "", "not json", "[]", '{"v":2}', '{"v":1,"people":"x"}']) {
      const p = parsePlan(raw);
      expect(p.v).toBe(1);
      expect(p.people.length).toBeGreaterThanOrEqual(1);
    }
  });

  test("keeps what was typed, drops anything that is not text, and caps lengths and rows", () => {
    const long = "x".repeat(MAX_FIELD + 50);
    const raw = JSON.stringify({
      v: 1,
      home: { phone: "555-0100", address: 42 },
      people: Array.from({ length: 20 }, (_, i) => ({ name: `P${i}`, mobile: i, notes: long })),
      meeting: [{ location: "The big oak at the corner", instructions: "Wait 15 minutes" }],
      medical: { poison: POISON_HELP, allergies: "Penicillin" },
    });
    const p = parsePlan(raw);
    expect(p.home).toEqual({ phone: "555-0100", address: "" });
    expect(p.people).toHaveLength(MAX_ROWS.people);
    expect(p.people[0]).toEqual({ name: "P0", mobile: "", other: "", email: "", notes: "x".repeat(MAX_FIELD) });
    expect(p.places).toHaveLength(1);
    expect(p.meeting[0].location).toBe("The big oak at the corner");
    expect(p.medical.allergies).toBe("Penicillin");
  });

  test("saves to one key on this device, reads it back, and erases it", () => {
    const s = memoryStore();
    const p = emptyPlan();
    p.people[0] = { name: "Sam", mobile: "555-0101", other: "", email: "", notes: "" };
    // 9:30 PM local on Nov 22: already Nov 23 in UTC for U.S. visitors, but the plan must say Nov 22.
    const saved = savePlan(s, p, new Date(2026, 10, 22, 21, 30));
    expect(saved.updated).toBe("2026-11-22");
    expect([...s.m.keys()]).toEqual([PLAN_KEY]);
    expect(loadPlan(s).people[0].name).toBe("Sam");
    expect(erasePlan(s)).toEqual(emptyPlan());
    expect(s.m.size).toBe(0);
  });

  test("blocked storage never breaks the page", () => {
    const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("full"); }, removeItem: () => { throw new Error("blocked"); } };
    expect(loadPlan(blocked)).toEqual(emptyPlan());
    expect(savePlan(blocked, emptyPlan()).v).toBe(1);
    expect(erasePlan(blocked)).toEqual(emptyPlan());
    expect(loadPlan(null)).toEqual(emptyPlan());
  });

  test("the wallet card carries only what is filled in", () => {
    const p = emptyPlan();
    expect(walletLines(p)).toEqual([`Poison Help: ${POISON_HELP}`]);
    p.people = [
      { name: "Sam", mobile: "555-0101", other: "", email: "", notes: "Inhaler in the blue bag" },
      { name: "", mobile: "", other: "", email: "", notes: "" },
      { name: "Ana", mobile: "", other: "", email: "", notes: "" },
    ];
    p.contacts = [{ name: "Aunt Lee", mobile: "", home: "555-0199", email: "", address: "" }];
    p.meeting = [{ location: "", instructions: "only instructions" }, { location: "Library steps", instructions: "" }];
    p.home.address = "12 Elm St";
    expect(walletLines(p)).toEqual([
      "Sam · 555-0101",
      "Ana",
      "Emergency contact: Aunt Lee · 555-0199",
      "Home: 12 Elm St",
      `Poison Help: ${POISON_HELP}`,
    ]);
    expect(filledRows(p.people)).toHaveLength(2);
    expect(isEmpty(p)).toBe(false);
  });
});

describe("household plan page", () => {
  const page = read("household-plan/page.tsx");
  const form = read("components/plan/HouseholdPlanForm.tsx");
  const lib = read("lib/householdPlan.ts");

  test("nothing typed is sent, measured or put in a link", () => {
    for (const [name, src] of [["page", page], ["form", form], ["lib", lib]] as const) {
      expect(src, name).not.toMatch(/\bfetch\(|<form\b|sendBeacon|gtag\(|measure\(|data-measure|searchParams|URLSearchParams|location\.(href|search|hash)\s*=/);
    }
    expect(form).toContain('autoComplete: "off"');
    expect(lib).not.toMatch(/window\.|document\./);
    expect(form.match(/window\.localStorage/g)?.length).toBe(2);
  });

  test("cites Ready.gov for the steps and the form, and keeps the safety note", () => {
    expect(READY_PLAN_URL).toBe("https://www.ready.gov/plan");
    expect(READY_FORM_URL).toBe("https://www.ready.gov/plan-form");
    expect(page).toContain("READY_PLAN_URL");
    expect(page).toContain("READY_FORM_URL");
    expect(page).toContain("not professional or medical advice");
  });

  test("no shopping, prices or free/paid wording on the plan", () => {
    for (const src of [page, form]) expect(src).not.toMatch(/amazon|Associate|\$\d|\bFree\b|Paid tools/i);
  });

  test("people can find it: menu, home, the checklist's plan area and the sitemap", () => {
    expect(read("layout.tsx")).toContain('{ emoji: "📝", name: "Household plan", href: "/household-plan" }');
    expect(read("page.tsx")).toContain('href="/household-plan"');
    expect(read("checklist/page.tsx")).toContain('a.id === "plan"');
    expect(read("sitemap.ts")).toContain('"/household-plan"');
  });
});
