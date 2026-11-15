import { describe, expect, it } from "vitest";
import { seasonalKits } from "./kits";

describe("the home page's seasonal shelf", () => {
  it("leads with the winter storm and power outage kits from November to February", () => {
    for (const m of [11, 12, 1, 2]) {
      const slugs = seasonalKits(m).map((k) => k.slug);
      expect(slugs.slice(0, 2), `month ${m}`).toEqual(["winter-storm", "power-outage"]);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(slugs.length).toBeLessThanOrEqual(4);
    }
  });

  it("leaves the rest of the year to the season's own kits", () => {
    expect(seasonalKits(7).map((k) => k.slug)).not.toContain("winter-storm");
  });
});
