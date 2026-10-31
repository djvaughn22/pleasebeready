import { describe, expect, it } from "vitest";
import { activeDeals, deals } from "./deals";
import { pickByAsin } from "./picks";

describe("Ready Deals", () => {
  it("lists only verified discounts on our exact products", () => {
    for (const d of deals) {
      expect(pickByAsin(d.asin), d.asin).toBeTruthy();
      expect(d.source.trim().length, d.asin).toBeGreaterThan(2);
      expect(d.off).toMatch(/\d/);
      expect(d.checked < d.ends, d.asin).toBe(true);
    }
  });
  it("hides a deal on and after its end date", () => {
    expect(activeDeals("2026-10-31").every((d) => "2026-10-31" < d.ends)).toBe(true);
  });
});
