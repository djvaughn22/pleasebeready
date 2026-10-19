import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { AMAZON_TAG, amazonUrl } from "../gear";
import { areas, levels } from "../readiness";
import {
  buildStages, defaultHousehold, formatMoney, formatQuantity, horizonDays, horizonLabel,
  normalizeHorizon, normalizeHousehold, ownedQuantity, planQuantity, remainingQuantity,
  resolvePlan, summarize, type PlanInputs,
} from "./calc";
import { bucketOrder, buckets, catalog, gearFor, scenarios } from "./catalog";
import { cartFormUrl, linesTotal, listText, reportItemUrl, shoppingLines, type ShopScope } from "./shopping";
import { CHECKED, formatDate, sources } from "./sources";
import { defaultState, parseBackup, sanitizeState, toBackup } from "./storage";
import type { Household, PlanState, ResolvedItem } from "./types";

// ── helpers ──────────────────────────────────────────────────────────────

type Over = Partial<Omit<PlanInputs, "household">> & { household?: Partial<Household> };

const inputs = (over: Over = {}): PlanInputs => ({
  household: normalizeHousehold({ ...defaultHousehold, ...over.household }),
  horizon: over.horizon ?? { mode: "3d", amount: 4, unit: "weeks" },
  scenarios: over.scenarios ?? [],
  hotWeather: over.hotWeather ?? false,
});

const plan = (over: Over = {}) => resolvePlan(inputs(over));
const find = (items: ResolvedItem[], id: string) => {
  const r = items.find((i) => i.id === id);
  if (!r) throw new Error(`missing ${id}`);
  return r;
};
const stateOf = (over: Partial<PlanState> = {}): PlanState => ({ ...defaultState(), ...over });

// ── the catalog itself ───────────────────────────────────────────────────

describe("catalog", () => {
  test("item ids are unique and every bucket has an item", () => {
    expect(new Set(catalog.map((c) => c.id)).size).toBe(catalog.length);
    for (const b of buckets) expect(catalog.some((c) => c.bucket === b.id), b.id).toBe(true);
  });

  test("every item gives a plain reason and at least one source we have checked", () => {
    for (const c of catalog) {
      expect(c.reason.length, c.id).toBeGreaterThan(20);
      expect(c.sources.length, c.id).toBeGreaterThan(0);
      for (const s of c.sources) expect(sources[s], `${c.id} → ${s}`).toBeDefined();
    }
  });

  test("sources are official, https, and dated", () => {
    for (const s of Object.values(sources)) {
      expect(s.href, s.id).toMatch(/^https:\/\/(www\.ready\.gov|www\.redcross\.org|www\.cdc\.gov|www\.fema\.gov)\//);
      expect(s.checked, s.id).toBe(CHECKED);
    }
    expect(formatDate("2026-10-17")).toBe("Oct 17, 2026");
  });

  test("only the figures we can cite are marked official", () => {
    const official = catalog.filter((c) => c.basis === "official").map((c) => c.id).sort();
    expect(official).toEqual(["food", "rx-supply", "water"]);
  });

  test("buckets match the order the spec asks for", () => {
    expect(bucketOrder).toEqual(["water", "food", "health", "power", "sanitation", "warmth", "comms", "family"]);
  });

  test("copy stays calm: no fear words, no urgency, no guarantees", () => {
    const text = JSON.stringify(catalog.map((c) => [c.name, c.reason, c.tip])).toLowerCase();
    for (const word of ["collapse", "doomsday", "survive", "survival", "apocalypse", "act now", "before it's too late", "guarantee"]) {
      expect(text, word).not.toContain(word);
    }
  });
});

// ── household scaling ────────────────────────────────────────────────────

describe("household scaling", () => {
  test("water is one gallon per person per day", () => {
    expect(find(plan({ household: { people: 1 } }), "water").suggested).toBe(3);
    expect(find(plan({ household: { people: 4 } }), "water").suggested).toBe(12);
    expect(find(plan({ household: { people: 4 }, horizon: { mode: "2w", amount: 1, unit: "weeks" } }), "water").suggested).toBe(56);
  });

  test("a bigger household never gets a smaller amount", () => {
    for (const c of catalog) {
      if (c.qty.kind === "none") continue;
      let last = -1;
      for (let people = 3; people <= 10; people++) {
        const all = { people, takesMeds: true, electricMedical: true, mobility: true, senseComm: true, pets: 2, children: 1, babies: 1, olderAdults: 1 };
        const q = find(plan({ household: all, scenarios: ["outage", "weather", "water", "evacuation"] }), c.id).suggested ?? 0;
        expect(q, `${c.id} at ${people}`).toBeGreaterThanOrEqual(last);
        last = q;
      }
    }
  });

  test("per-person items follow the head count; per-adult items skip children", () => {
    const items = plan({ household: { people: 5, children: 2 } });
    expect(find(items, "flashlights").suggested).toBe(5);
    expect(find(items, "power-bank").suggested).toBe(3);
  });

  test("children, babies, pets and older adults add only their own items", () => {
    const plain = plan();
    for (const id of ["baby-food", "baby-care", "kids-activities", "pet-food", "pet-water", "insurance-copies"]) {
      expect(plain.some((i) => i.id === id), id).toBe(false);
    }
    const family = plan({ household: { people: 4, children: 2, babies: 1, pets: 2, olderAdults: 1 } });
    expect(find(family, "baby-food").suggested).toBe(3);
    expect(find(family, "pet-food").suggested).toBe(6);
    expect(find(family, "kids-activities").suggested).toBe(2);
    expect(family.some((i) => i.id === "insurance-copies")).toBe(true);
  });

  test("medical and access needs add their items and nothing else changes", () => {
    const base = plan().map((i) => i.id);
    const needs = plan({ household: { takesMeds: true, electricMedical: true, mobility: true, senseComm: true } }).map((i) => i.id);
    for (const id of ["rx-supply", "med-list", "device-plan", "device-power", "mobility-backups", "sense-backups", "comm-aids"]) {
      expect(base, id).not.toContain(id);
      expect(needs, id).toContain(id);
    }
    for (const id of base) expect(needs).toContain(id);
  });

  test("the medicine supply is 7 days whatever the plan length", () => {
    const h = { takesMeds: true };
    expect(find(plan({ household: h }), "rx-supply").suggested).toBe(7);
    expect(find(plan({ household: h, horizon: { mode: "1m", amount: 1, unit: "months" } }), "rx-supply").suggested).toBe(7);
  });

  test("inconsistent counts are repaired, not trusted", () => {
    const h = normalizeHousehold({ people: 3, children: 9, babies: 9, olderAdults: 9, pets: -4 });
    expect(h).toMatchObject({ people: 3, children: 3, babies: 3, olderAdults: 0, pets: 0 });
    expect(normalizeHousehold({ people: Number.NaN }).people).toBe(1);
    expect(normalizeHousehold({ people: 500 }).people).toBe(20);
  });

  test("hot weather doubles water only", () => {
    const a = plan({ household: { people: 2 } });
    const b = plan({ household: { people: 2 }, hotWeather: true });
    expect(find(b, "water").suggested).toBe(2 * (find(a, "water").suggested ?? 0));
    expect(find(b, "food").suggested).toBe(find(a, "food").suggested);
  });
});

// ── duration scaling ─────────────────────────────────────────────────────

describe("duration scaling", () => {
  test("presets are 3 days, 2 weeks and 1 month", () => {
    expect(horizonDays({ mode: "3d", amount: 9, unit: "weeks" })).toBe(3);
    expect(horizonDays({ mode: "2w", amount: 9, unit: "weeks" })).toBe(14);
    expect(horizonDays({ mode: "1m", amount: 9, unit: "weeks" })).toBe(30);
  });

  test("a longer plan extends by weeks or months", () => {
    expect(horizonDays({ mode: "custom", amount: 6, unit: "weeks" })).toBe(42);
    expect(horizonDays({ mode: "custom", amount: 3, unit: "months" })).toBe(90);
    expect(horizonLabel({ mode: "custom", amount: 1, unit: "weeks" })).toBe("1 week");
    expect(horizonLabel({ mode: "custom", amount: 3, unit: "months" })).toBe("3 months");
    expect(normalizeHorizon({ mode: "custom", amount: 999, unit: "months" }).amount).toBe(12);
    expect(horizonDays({ mode: "custom", amount: 52, unit: "weeks" })).toBeLessThanOrEqual(365);
  });

  test("water, food and hygiene grow with days; fixed items do not", () => {
    const short = plan({ household: { people: 3 } });
    const long = plan({ household: { people: 3 }, horizon: { mode: "2w", amount: 1, unit: "weeks" } });
    for (const id of ["water", "food", "hygiene"]) {
      expect(find(long, id).suggested, id).toBe((find(short, id).suggested ?? 0) * (14 / 3) );
    }
    for (const id of ["first-aid-kit", "weather-radio", "flashlights", "can-opener"]) {
      expect(find(long, id).suggested, id).toBe(find(short, id).suggested);
    }
  });

  test("past two weeks the official rate is labelled as scaled by us", () => {
    const at14 = plan({ horizon: { mode: "2w", amount: 1, unit: "weeks" } });
    const at30 = plan({ horizon: { mode: "1m", amount: 1, unit: "months" } });
    expect(find(at14, "water").effectiveBasis).toBe("official");
    expect(find(at30, "water").effectiveBasis).toBe("derived");
    // An amount that was already our suggestion stays a suggestion.
    expect(find(at30, "hygiene").effectiveBasis).toBe("suggestion");
  });

  test("the first-three-days slice never exceeds the full amount", () => {
    for (const days of [{ mode: "3d" }, { mode: "2w" }, { mode: "1m" }] as const) {
      for (const r of plan({ household: { people: 5, pets: 1 }, horizon: { ...days, amount: 1, unit: "weeks" } })) {
        if (r.suggested === null) continue;
        expect(r.suggested3 ?? 0, r.id).toBeLessThanOrEqual(r.suggested);
      }
    }
  });

  test("water containers follow the water total (7-gallon containers)", () => {
    const items = plan({ household: { people: 4 }, horizon: { mode: "2w", amount: 1, unit: "weeks" } });
    expect(find(items, "water").suggested).toBe(56);
    expect(find(items, "water-containers").suggested).toBe(8);
  });
});

// ── situations ───────────────────────────────────────────────────────────

describe("situations", () => {
  test("the default plan is useful with no situation picked", () => {
    const items = plan();
    expect(items.filter((i) => i.effective === "essential").length).toBeGreaterThan(10);
    expect(scenarios.map((s) => s.id)).toEqual(["outage", "weather", "water", "evacuation"]);
  });

  test("a situation only ever raises priority", () => {
    const base = plan();
    const rank = { optional: 1, next: 2, essential: 3 } as const;
    for (const s of scenarios) {
      for (const r of plan({ scenarios: [s.id] })) {
        const was = base.find((b) => b.id === r.id);
        if (was) expect(rank[r.effective], `${s.id}/${r.id}`).toBeGreaterThanOrEqual(rank[was.effective]);
      }
    }
  });

  test("evacuation adds a go-bag per person; water interruption adds how-to-make-water-safe", () => {
    expect(plan().some((i) => i.id === "go-bag")).toBe(false);
    expect(find(plan({ household: { people: 3 }, scenarios: ["evacuation"] }), "go-bag").suggested).toBe(3);
    expect(plan().some((i) => i.id === "water-know-how")).toBe(false);
    expect(find(plan({ scenarios: ["water"] }), "water-know-how").effective).toBe("essential");
    expect(find(plan({ scenarios: ["outage"] }), "co-detector").effective).toBe("essential");
  });
});

// ── prices: only what the visitor types ──────────────────────────────────

/** Item choices that give every item the same visitor-entered price. */
const pricedAt = (items: ResolvedItem[], price: number, extra: PlanState["items"] = {}): PlanState["items"] => {
  const out: PlanState["items"] = {};
  for (const r of items) out[r.id] = { status: "needs", cost: price };
  for (const [id, v] of Object.entries(extra)) out[id] = { cost: price, ...v };
  return out;
};

describe("no default prices", () => {
  test("the catalog carries no dollar amounts at all", () => {
    for (const c of catalog) expect(Object.keys(c), c.id).not.toContain("cost");
    const src = readFileSync(join(__dirname, "catalog.ts"), "utf8");
    expect(src).not.toMatch(/\bcost\s*:/);
  });

  test("with no prices entered every total is zero and nothing is priced", () => {
    const items = plan({ household: { people: 4 }, horizon: { mode: "2w", amount: 1, unit: "weeks" } });
    const s = summarize(items, stateOf());
    expect(s.totals.needed).toBe(0);
    expect(s.totals.owned).toBe(0);
    expect(s.totals.skipped).toBe(0);
    expect(s.totals.unpriced).toBe(items.filter((i) => i.suggested !== null && i.suggested > 0).length);
    for (const st of buildStages(items, stateOf())) expect(st.cost).toBe(0);
    for (const l of shoppingLines(items, stateOf(), { mode: "plan", onlyNeeded: false })) {
      expect(l.priced).toBe(false);
      expect(l.cost).toBe(0);
    }
  });

  test("totals come only from entered prices, and unpriced items are counted", () => {
    const items = plan({ household: { people: 4 }, horizon: { mode: "2w", amount: 1, unit: "weeks" } });
    const st = stateOf({ items: { water: { status: "needs", cost: 1.25 }, food: { status: "needs", cost: 5 } } });
    const s = summarize(items, st);
    expect(s.totals.needed).toBeCloseTo(56 * 1.25 + 56 * 5, 6);
    expect(s.totals.unpriced).toBe(items.filter((i) => i.suggested !== null && i.suggested > 0).length - 2);
  });

  test("a price of zero, a negative price or a non-number counts as no price", () => {
    const items = plan();
    const st = sanitizeState({ items: { water: { status: "needs", cost: 0 }, food: { status: "needs", cost: -3 }, flashlights: { cost: "abc" } } });
    expect(summarize(items, st).totals.needed).toBe(0);
  });

  test("money shows cents only when there are cents", () => {
    expect(formatMoney(1234)).toBe("$1,234");
    expect(formatMoney(0.35 * 3)).toBe("$1.05");
    expect(formatMoney(-4)).toBe("$0");
  });

  test("no Amazon or store price is ever displayed by the planner", () => {
    const dir = join(__dirname, "..", "..", "components", "planner");
    for (const f of readdirSync(dir)) {
      const src = readFileSync(join(dir, f), "utf8");
      expect(src, f).not.toMatch(/\bestimate|rough (planning|cost)|about \$\d|about \$?\{?\s*formatMoney|Our cost figure/i);
    }
  });
});

// ── editing, owned and skipped items ─────────────────────────────────────

describe("choices: edit, have, skip", () => {
  const items = plan({ household: { people: 4 }, horizon: { mode: "2w", amount: 1, unit: "weeks" } });
  const water = find(items, "water"); // 56 gallons

  test("an edited quantity replaces the suggestion", () => {
    expect(planQuantity(water, { status: "needs" })).toBe(56);
    expect(planQuantity(water, { status: "needs", qty: 40 })).toBe(40);
    expect(planQuantity(find(items, "contact-list"), { status: "needs", qty: 5 })).toBeNull();
  });

  test("have removes it from what is still needed and counts it as owned", () => {
    expect(remainingQuantity(water, { status: "have" })).toBe(0);
    expect(ownedQuantity(water, { status: "have" })).toBe(56);
  });

  test("a partial stock reduces what is still needed", () => {
    const st = { status: "needs", have: 20 } as const;
    expect(remainingQuantity(water, st)).toBe(36);
    expect(ownedQuantity(water, st)).toBe(20);
    expect(remainingQuantity(water, { status: "needs", have: 999 })).toBe(0);
  });

  test("skipped items cost and count nothing", () => {
    const priced = pricedAt(items, 1);
    const all = summarize(items, stateOf({ items: priced }));
    const s = summarize(items, stateOf({ items: pricedAt(items, 1, { water: { status: "skip" } }) }));
    expect(all.totals.needed - s.totals.needed).toBe(56);
    expect(s.totals.counts.skip).toBe(1);
    expect(s.totals.skipped).toBe(56);
    expect(s.totals.owned).toBe(all.totals.owned);
  });

  test("changing the entered price changes the totals", () => {
    const at = (cost: number) => summarize(items, stateOf({ items: { water: { status: "needs", cost } } })).totals.needed;
    expect(at(1) - at(0.5)).toBe(28);
  });
});

// ── budget totals ────────────────────────────────────────────────────────

describe("budget totals", () => {
  const items = plan({ household: { people: 2 } });
  const priced = pricedAt(items, 2);

  test("bucket subtotals add up to the total, priorities add up to it too", () => {
    const s = summarize(items, stateOf({ items: priced }));
    expect(s.totals.needed).toBeGreaterThan(0);
    expect(s.buckets.reduce((a, b) => a + b.needed, 0)).toBeCloseTo(s.totals.needed, 6);
    expect(s.totals.essentialNeeded + s.totals.nextNeeded + s.totals.optionalNeeded).toBeCloseTo(s.totals.needed, 6);
    expect(s.totals.counts.total).toBe(items.length);
    expect(s.totals.unpriced).toBe(0);
  });

  test("owned items move from needed to owned without changing the plan's size", () => {
    const before = summarize(items, stateOf({ items: priced }));
    const st = stateOf({ items: pricedAt(items, 2, { water: { status: "have" }, "first-aid-kit": { status: "have" } }) });
    const after = summarize(items, st);
    expect(after.totals.needed + after.totals.owned).toBeCloseTo(before.totals.needed + before.totals.owned, 6);
    expect(after.totals.owned).toBe(6 * 2 + 1 * 2);
    expect(after.totals.counts.have).toBe(2);
  });

  test("a total budget and bucket budgets report how far over", () => {
    const s0 = summarize(items, stateOf({ items: priced }));
    const st = stateOf({ items: priced, budget: { total: 100, buckets: { water: 2, food: 10_000 } } });
    const s = summarize(items, st);
    expect(s.budget).toBe(100);
    expect(s.over).toBeCloseTo(Math.max(0, s0.totals.needed - 100), 6);
    const water = s.buckets.find((b) => b.bucket === "water")!;
    expect(water.over).toBeCloseTo(water.needed - 2, 6);
    expect(s.buckets.find((b) => b.bucket === "food")!.over).toBe(0);
    expect(s.buckets.find((b) => b.bucket === "power")!.budget).toBeNull();
  });

  test("tasks never add cost, even if a price were set on them", () => {
    const tasks = items.filter((i) => i.suggested === null);
    expect(tasks.length).toBeGreaterThan(0);
    expect(summarize(tasks, stateOf({ items: pricedAt(tasks, 9) })).totals.needed).toBe(0);
  });

  test("quantities format with the right unit form", () => {
    expect(formatQuantity(1, { one: "gallon", many: "gallons" })).toBe("1 gallon");
    expect(formatQuantity(12, { one: "gallon", many: "gallons" })).toBe("12 gallons");
    expect(formatQuantity(14560, { one: "gallon", many: "gallons" })).toBe("14,560 gallons");
  });
});

// ── staging ──────────────────────────────────────────────────────────────

describe("staged plan", () => {
  const items = plan({ household: { people: 4 }, horizon: { mode: "1m", amount: 1, unit: "months" }, scenarios: ["evacuation"] });
  const priced = () => stateOf({ items: pricedAt(items, 3) });

  test("stages add up to everything still needed", () => {
    const st = priced();
    const stages = buildStages(items, st);
    expect(stages[stages.length - 1].cumulative).toBeCloseTo(summarize(items, st).totals.needed, 6);
    expect(stages.map((s) => s.id)).toEqual(["first-days", "finish-essentials", "next-steps", "optional"]);
  });

  test("the first stage is the essentials sized for 3 days", () => {
    const stages = buildStages(items, priced());
    expect(stages[0].itemIds).toContain("water");
    expect(stages[1].itemIds).toContain("water"); // the other 27 days
    expect(stages[0].cost).toBeGreaterThan(0);
    expect(stages[1].cost).toBeGreaterThan(0);
  });

  test("stage one holds 3 days of water and stage two holds the rest", () => {
    const st = stateOf({ items: { water: { status: "needs", cost: 1 } } });
    const stages = buildStages(items, st);
    expect(stages[0].cost).toBe(12); // 4 people × 3 days
    expect(stages[1].cost).toBe(108); // 4 people × 27 more days
  });

  test("with a 3-day plan there is nothing left for the second stage", () => {
    const short = plan({ household: { people: 4 } });
    const st = stateOf({ items: pricedAt(short, 3) });
    expect(buildStages(short, st)[1].itemIds).toEqual([]);
  });

  test("unpriced items still appear in their stage and are counted, but add no cost", () => {
    const stages = buildStages(items, stateOf());
    expect(stages[0].itemIds.length).toBeGreaterThan(0);
    for (const s of stages) {
      expect(s.cost).toBe(0);
      expect(s.unpriced).toBe(s.itemIds.length);
    }
  });

  test("stages report which fit the budget", () => {
    const st = { ...priced(), budget: { total: 150, buckets: {} } };
    const stages = buildStages(items, st);
    expect(stages[0].fits).toBe(stages[0].cumulative <= 150);
    for (let i = 1; i < stages.length; i++) expect(stages[i].cumulative).toBeGreaterThanOrEqual(stages[i - 1].cumulative);
    expect(buildStages(items, priced())[0].fits).toBeNull();
  });

  test("owned items drop out of every stage", () => {
    const st = stateOf({ items: pricedAt(items, 3, { water: { status: "have" } }) });
    for (const s of buildStages(items, st)) expect(s.itemIds).not.toContain("water");
  });
});

// ── the largest supported household ──────────────────────────────────────

describe("largest supported household", () => {
  const maxHousehold = {
    people: 20, children: 19, babies: 19, olderAdults: 1, pets: 20,
    takesMeds: true, electricMedical: true, mobility: true, senseComm: true,
  };
  const longest: PlanInputs["horizon"] = { mode: "custom", amount: 52, unit: "weeks" };
  const everything = ["outage", "weather", "water", "evacuation"] as const;

  test("limits are what the form promises", () => {
    expect(normalizeHousehold({ ...maxHousehold, people: 99, pets: 99 })).toMatchObject({ people: 20, pets: 20 });
    expect(horizonDays(longest)).toBe(364);
    expect(horizonDays({ mode: "custom", amount: 12, unit: "months" })).toBe(360);
  });

  test("every quantity is a finite, whole, non-negative number at the largest size", () => {
    for (const hz of [longest, { mode: "custom", amount: 12, unit: "months" }] as const) {
      for (const hot of [false, true]) {
        const items = resolvePlan({ household: normalizeHousehold(maxHousehold), horizon: hz, scenarios: [...everything], hotWeather: hot });
        expect(items.length).toBeGreaterThan(50);
        for (const r of items) {
          if (r.qty.kind === "none") { expect(r.suggested, r.id).toBeNull(); continue; }
          for (const q of [r.suggested, r.suggested3]) {
            expect(Number.isSafeInteger(q), `${r.id} ${q}`).toBe(true);
            expect(q as number, r.id).toBeGreaterThanOrEqual(0);
          }
          expect(r.suggested3 as number, r.id).toBeLessThanOrEqual((r.suggested ?? 0) as number);
        }
      }
    }
  });

  test("water at the extremes is exactly the arithmetic", () => {
    const base = { household: normalizeHousehold(maxHousehold), horizon: longest, scenarios: [] };
    const plain = resolvePlan({ ...base, hotWeather: false });
    const hot = resolvePlan({ ...base, hotWeather: true });
    expect(find(plain, "water").suggested).toBe(20 * 364);
    expect(find(hot, "water").suggested).toBe(20 * 364 * 2);
    expect(find(plain, "water-containers").suggested).toBe(Math.ceil((20 * 364) / 7));
    expect(find(plain, "water").effectiveBasis).toBe("derived");
    expect(find(plain, "pet-food").suggested).toBe(20 * 364);
    expect(find(plain, "baby-food").suggested).toBe(19 * 364);
    expect(find(plain, "power-bank").suggested).toBe(1); // one adult
  });

  test("totals, stages and shopping stay valid and finite with prices entered", () => {
    const items = resolvePlan({ household: normalizeHousehold(maxHousehold), horizon: longest, scenarios: [...everything], hotWeather: true });
    const st = stateOf({ items: pricedAt(items, 999_999), budget: { total: 1_000_000, buckets: { water: 5 } }, picks: items.filter((i) => i.product).map((i) => i.id) });
    const s = summarize(items, st);
    for (const n of [s.totals.needed, s.totals.owned, s.totals.skipped, s.over]) expect(Number.isFinite(n)).toBe(true);
    for (const stage of buildStages(items, st)) {
      expect(Number.isFinite(stage.cost)).toBe(true);
      expect(Number.isFinite(stage.cumulative)).toBe(true);
    }
    for (const mode of [{ mode: "plan", onlyNeeded: false }, { mode: "plan", onlyNeeded: true }, { mode: "picks" }] as const) {
      const lines = shoppingLines(items, st, mode);
      expect(lines.length).toBeGreaterThan(0);
      for (const l of lines) {
        expect(Number.isSafeInteger(l.toBuy), l.itemId).toBe(true);
        expect(Number.isFinite(l.cost), l.itemId).toBe(true);
        if (l.product) expect(Number.isSafeInteger(l.product.units) && l.product.units > 0, l.itemId).toBe(true);
      }
      expect(listText(lines, "x")).not.toMatch(/NaN|Infinity|undefined/);
    }
    expect(formatMoney(s.totals.needed)).not.toMatch(/NaN|Infinity/);
  });

  test("a saved plan at the limits round-trips", () => {
    const st = stateOf({ household: normalizeHousehold(maxHousehold), horizon: longest, scenarios: [...everything], hotWeather: true });
    expect(parseBackup(JSON.stringify(toBackup(st)))).toEqual(st);
  });

  test("the saved-plan cleaner cannot be pushed past the limits", () => {
    const h = sanitizeState({ household: { people: 1e9, children: 1e9, babies: 1e9, olderAdults: 1e9, pets: 1e9 }, horizon: { mode: "custom", amount: 1e9, unit: "months" } });
    expect(h.household).toMatchObject({ people: 20, children: 20, babies: 20, olderAdults: 0, pets: 20 });
    expect(h.horizon.amount).toBe(12);
  });
});

// ── shopping and Amazon links ────────────────────────────────────────────

describe("shopping lists", () => {
  const items = plan({ household: { people: 4 }, horizon: { mode: "2w", amount: 1, unit: "weeks" } });
  const scope = (s: ShopScope) => s;

  test("the whole plan lists everything with a quantity; tasks never appear", () => {
    const lines = shoppingLines(items, stateOf(), scope({ mode: "plan", onlyNeeded: false }));
    expect(lines.length).toBe(items.filter((i) => i.suggested !== null && i.suggested > 0).length);
    expect(lines.some((l) => l.itemId === "contact-list")).toBe(false);
  });

  test("only-needed leaves out items marked have, skip, or fully stocked", () => {
    const st = stateOf({
      items: { water: { status: "have" }, food: { status: "skip" }, "first-aid-kit": { status: "needs", have: 1 } },
    });
    const lines = shoppingLines(items, st, scope({ mode: "plan", onlyNeeded: true }));
    const ids = lines.map((l) => l.itemId);
    expect(ids).not.toContain("water");
    expect(ids).not.toContain("food");
    expect(ids).not.toContain("first-aid-kit");
    const whole = shoppingLines(items, st, scope({ mode: "plan", onlyNeeded: false }));
    expect(whole.map((l) => l.itemId)).toContain("water"); // owned, but part of the whole plan
    expect(whole.map((l) => l.itemId)).not.toContain("food"); // skipped is never listed
  });

  test("a partly stocked item lists only the difference", () => {
    const st = stateOf({ items: { water: { status: "needs", have: 20, cost: 2 } } });
    const line = shoppingLines(items, st, scope({ mode: "plan", onlyNeeded: true })).find((l) => l.itemId === "water")!;
    expect(line.toBuy).toBe(36);
    expect(line.cost).toBe(72);
    expect(line.priced).toBe(true);
  });

  test("one bucket at a time", () => {
    const lines = shoppingLines(items, stateOf(), scope({ mode: "bucket", bucket: "water", onlyNeeded: true }));
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) expect(l.bucket).toBe("water");
  });

  test("picked products only, even if already owned", () => {
    const st = stateOf({ picks: ["flashlights", "water"], items: { water: { status: "have" } } });
    const lines = shoppingLines(items, st, scope({ mode: "picks" }));
    expect(lines.map((l) => l.itemId).sort()).toEqual(["flashlights", "water"]);
    expect(lines.find((l) => l.itemId === "water")!.toBuy).toBe(56);
    expect(shoppingLines(items, stateOf(), scope({ mode: "picks" }))).toEqual([]);
  });

  test("a pick that is skipped stays off the list", () => {
    const st = stateOf({ picks: ["flashlights"], items: { flashlights: { status: "skip" } } });
    expect(shoppingLines(items, st, scope({ mode: "picks" }))).toEqual([]);
  });

  test("product counts use pack sizes only where we know them", () => {
    const lines = shoppingLines(items, stateOf(), scope({ mode: "plan", onlyNeeded: true }));
    const lights = lines.find((l) => l.itemId === "flashlights")!;
    expect(lights.toBuy).toBe(4);
    expect(lights.product).toMatchObject({ units: 2, exactCount: true }); // 2-pack headlamps
    const containers = lines.find((l) => l.itemId === "water-containers")!;
    expect(containers.product).toMatchObject({ units: 8, exactCount: true });
    const food = lines.find((l) => l.itemId === "food")!;
    expect(food.product).toMatchObject({ units: 1, exactCount: false });
  });

  test("the list text is plain and checkable, uses only entered prices, and says Amazon may differ", () => {
    const st = stateOf({ items: { water: { status: "needs", cost: 1.5 } } });
    const lines = shoppingLines(items, st, scope({ mode: "bucket", bucket: "water", onlyNeeded: true }));
    const text = listText(lines, "Water list");
    expect(text.startsWith("Water list")).toBe(true);
    expect(text).toContain("[ ] 56 gallons - Drinking and cleaning water (your price: $84)");
    expect(text).toContain("[ ] 8 containers - Containers for stored water\n"); // no price, no amount shown
    expect(text).toContain("Total of the prices you entered: $84 (");
    expect(text).toContain("Amazon's price at checkout may differ");
    expect(linesTotal(lines)).toBe(84);
    const none = listText(shoppingLines(items, stateOf(), scope({ mode: "plan", onlyNeeded: true })), "x");
    expect(none).not.toContain("Total of the prices");
    expect(none).not.toContain("$");
  });
});

describe("Amazon links", () => {
  const items = plan({ household: { people: 4 }, scenarios: ["evacuation", "water", "outage"] });
  const lines = shoppingLines(items, stateOf(), { mode: "plan", onlyNeeded: false });
  const productLines = lines.filter((l) => l.product);

  test("every planner product is an ASIN gear.ts already holds, with its tag", () => {
    const known = new Set([...areas.flatMap((a) => a.gear), ...levels.flatMap((l) => l.gear)].map((g) => g.asin));
    for (const c of catalog) {
      if (!c.product) continue;
      expect(known.has(c.product.asin), `${c.id} ${c.product.asin}`).toBe(true);
      expect(gearFor(c.product.asin)).toBeDefined();
    }
    expect(productLines.length).toBeGreaterThan(5);
    for (const l of productLines) {
      expect(l.product!.url).toBe(amazonUrl(l.product!.asin));
      expect(l.product!.url).toContain(`tag=${AMAZON_TAG}`);
      expect(l.product!.url).toMatch(/^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?tag=/);
    }
  });

  test("a pack size above one is used only when the product's own name states it", () => {
    for (const c of catalog) {
      const covers = c.product?.covers;
      if (!covers || covers === 1) continue;
      expect(gearFor(c.product!.asin)!.name, c.id).toMatch(new RegExp(`\\b${covers}-pack\\b`, "i"));
    }
    // A pre-packed kit's contents are not verified, so it never carries a coverage claim.
    expect(catalog.find((c) => c.id === "go-bag")!.product).toEqual({ asin: "B000FJQQVI" });
    // Food packages are examples: how much one holds is not known here.
    expect(catalog.find((c) => c.id === "food")!.product!.covers).toBeUndefined();
  });

  test("products are suggested only where they help, never as a quantity of a task", () => {
    for (const c of catalog) if (c.product) expect(c.qty.kind, c.id).not.toBe("none");
  });

  test("the planner shows no prices from Amazon: estimates are ours and labelled", () => {
    for (const l of lines) expect(JSON.stringify(l.product ?? {})).not.toMatch(/\$|price|rating|stock/i);
  });

  test("the cart-form URL merges products, keeps the tag, and is null with nothing to send", () => {
    const url = cartFormUrl(lines, "pleasebeready-20")!;
    expect(url.startsWith("https://www.amazon.com/gp/aws/cart/add.html?")).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get("AssociateTag")).toBe("pleasebeready-20");
    const asins = [...params.keys()].filter((k) => k.startsWith("ASIN."));
    expect(asins.length).toBe(new Set(productLines.map((l) => l.product!.asin)).size);
    for (const k of asins) {
      const n = k.split(".")[1];
      expect(Number(params.get(`Quantity.${n}`))).toBeGreaterThan(0);
    }
    expect(cartFormUrl([])).toBeNull();
    expect(cartFormUrl(lines.filter((l) => !l.product))).toBeNull();
  });

  test("the cart form is off unless the owner turns it on", async () => {
    const mod = await import("./shopping");
    expect(mod.CART_FORM_ENABLED).toBe(process.env.NEXT_PUBLIC_AMAZON_CART_FORM === "1");
    expect(process.env.NEXT_PUBLIC_AMAZON_CART_FORM).toBeUndefined();
  });
});

describe("reporting a problem", () => {
  test("the link names the item and nothing from the plan", () => {
    const url = reportItemUrl({ id: "water", name: "Drinking and cleaning water" });
    expect(url.startsWith("mailto:ask@openmirrorllc.com?")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Item: Drinking and cleaning water (water)");
    expect(decodeURIComponent(reportItemUrl(null))).toContain("missing or confusing");
  });
});

// ── saving ───────────────────────────────────────────────────────────────

describe("saved plans", () => {
  test("a plan survives a round trip through a backup file", () => {
    const st = stateOf({
      household: normalizeHousehold({ people: 5, children: 2, babies: 1, pets: 2, takesMeds: true }),
      horizon: { mode: "custom", amount: 6, unit: "weeks" },
      scenarios: ["outage", "water"],
      hotWeather: true,
      items: { water: { status: "needs", qty: 90, have: 10, cost: 0.8 }, food: { status: "skip" } },
      budget: { total: 500, buckets: { water: 100 } },
      picks: ["flashlights"],
    });
    const back = parseBackup(JSON.stringify(toBackup(st, new Date("2026-10-17T12:00:00Z"))));
    expect(back).toEqual(st);
  });

  test("hostile or stale data is cleaned, not trusted", () => {
    const dirty = sanitizeState({
      household: { people: "9999", children: -3, pets: "x" },
      horizon: { mode: "forever", amount: 1e9, unit: "decades" },
      scenarios: ["outage", "zombies", 7],
      items: {
        water: { status: "weird", qty: -5, have: "lots", cost: -2 },
        "not-an-item": { status: "have" },
        food: "nope",
      },
      budget: { total: -50, buckets: { water: "30", mystery: 5 } },
      picks: ["water", "ghost", 4],
    });
    expect(dirty.household.people).toBe(20);
    expect(dirty.household.children).toBe(0);
    expect(dirty.horizon).toEqual({ mode: "3d", amount: 52, unit: "weeks" });
    expect(dirty.scenarios).toEqual(["outage"]);
    expect(Object.keys(dirty.items)).toEqual(["water"]);
    expect(dirty.items.water).toEqual({ status: "needs" });
    expect(dirty.budget).toEqual({ total: null, buckets: { water: 30 } });
    expect(dirty.picks).toEqual(["water"]);
  });

  test("garbage input gives the default plan", () => {
    expect(sanitizeState(null)).toEqual(defaultState());
    expect(sanitizeState("text")).toEqual(defaultState());
    expect(parseBackup("not json")).toBeNull();
    expect(parseBackup(JSON.stringify({ app: "something-else", plan: {} }))).toBeNull();
  });

  test("a saved plan holds only counts, yes/no needs and numbers", () => {
    const json = JSON.stringify(stateOf());
    expect(Object.keys(JSON.parse(json).household).sort()).toEqual(
      ["babies", "children", "electricMedical", "mobility", "olderAdults", "people", "pets", "senseComm", "takesMeds"].sort(),
    );
  });
});

// ── page-level honesty, privacy and disclosures ──────────────────────────

describe("planner page honesty and privacy", () => {
  const dir = join(__dirname, "..", "..", "components", "planner");
  const files = readdirSync(dir);
  const src = (f: string) => readFileSync(join(dir, f), "utf8");
  const page = readFileSync(join(__dirname, "..", "..", "planner", "page.tsx"), "utf8");

  test("planner components never send what someone typed", () => {
    expect(files.length).toBeGreaterThan(5);
    for (const f of files) expect(src(f), f).not.toMatch(/\bfetch\(|<form|sendBeacon|gtag\(|measure\(|XMLHttpRequest/);
  });

  test("shopping keeps the commission notice and rel=sponsored on every Amazon link", () => {
    const shop = src("ShoppingPanel.tsx");
    expect(shop).toContain("may earn Open Mirror LLC a commission at no extra cost to you");
    expect(shop).toContain("AMAZON_DISCLOSURE");
    expect(shop).toContain('rel="noopener noreferrer sponsored"');
    expect(src("Checklist.tsx")).toContain('rel="noopener noreferrer sponsored"');
    expect(page).toContain("AMAZON_DISCLOSURE");
    expect(page).toContain("not professional or medical advice");
    expect(page).toContain("does not guarantee");
  });

  test("the cart is never simulated or implied", () => {
    const shop = src("ShoppingPanel.tsx");
    expect(shop).toContain("cannot put a whole list into your Amazon cart");
    expect(shop).not.toMatch(/>\s*(Add all to cart|Checkout|Buy now|Place order)/i);
  });

  test("the saved plan is stored only in this browser", () => {
    const store = readFileSync(join(__dirname, "storage.ts"), "utf8");
    expect(store).toContain("localStorage");
    expect(store).not.toMatch(/\bfetch\(|sendBeacon|cookie/);
  });
});
