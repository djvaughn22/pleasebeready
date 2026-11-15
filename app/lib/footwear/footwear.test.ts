import { describe, expect, it } from "vitest";
import { MAX_COMPARE, MILE_RANGES, SHOES, costPerMile, shoesFor, surfaceGaps, weeksLasting, type Fact } from "./catalog";

const facts = (s: (typeof SHOES)[number]): Fact[] =>
  [s.tread.outsole, s.tread.lugs, s.tread.resole, s.traction.madeFor, s.traction.limits, ...s.extras].filter((f): f is Fact => Boolean(f));

describe("footwear catalog", () => {
  it("starts small: a handful of pairs, every activity covered", () => {
    expect(SHOES.length).toBeLessThanOrEqual(12);
    for (const a of ["walk", "run", "hike", "snow", "work"] as const) expect(shoesFor(a).length).toBeGreaterThan(0);
  });

  it("names a real https source for every fact, and never a score or a rating number", () => {
    for (const s of SHOES) {
      for (const f of facts(s)) {
        expect(f.source.url, `${s.id}: ${f.text}`).toMatch(/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\//);
        expect(f.source.label.length).toBeGreaterThan(2);
      }
      expect(JSON.stringify(s)).not.toMatch(/score|rating\s*[:=]|\/10\b|out of 10|stars?\b/i);
    }
  });

  it("keeps ids unique and searches plain", () => {
    expect(new Set(SHOES.map((s) => s.id)).size).toBe(SHOES.length);
    for (const s of SHOES) expect(s.search).not.toMatch(/tag=|http/);
  });

  it("labels every mile range with its basis; only the cited one carries a source", () => {
    for (const r of Object.values(MILE_RANGES)) {
      expect(r.low).toBeLessThan(r.high);
      expect(r.basis.length).toBeGreaterThan(10);
    }
    expect(MILE_RANGES.run.source?.url).toContain("rei.com");
    expect(MILE_RANGES.hike.basis).toMatch(/example/i);
  });
});

describe("the shopper's own math", () => {
  it("divides the typed price by the typed miles, best case first", () => {
    expect(costPerMile(120, 300, 500)).toEqual({ best: "$0.24", worst: "$0.40" });
    expect(costPerMile(120, 500, 300)).toEqual({ best: "$0.24", worst: "$0.40" });
  });

  it("prints nothing rather than a made-up figure when a number is missing", () => {
    expect(costPerMile(0, 300, 500)).toBeUndefined();
    expect(costPerMile(120, 0, 500)).toBeUndefined();
    expect(costPerMile(Number.NaN, 300, 500)).toBeUndefined();
  });

  it("turns miles into weeks at the shopper's pace", () => {
    expect(weeksLasting(10, 300, 500)).toEqual({ from: 30, to: 50 });
    expect(weeksLasting(0, 300, 500)).toBeUndefined();
  });

  it("flags surfaces a pair is not sold for", () => {
    const caribou = SHOES.find((s) => s.id === "sorel-caribou")!;
    expect(surfaceGaps(caribou, ["snow", "trail"])).toEqual(["trail"]);
  });

  it("compares at most three", () => {
    expect(MAX_COMPARE).toBe(3);
  });
});
