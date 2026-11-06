// The Nov 2026 audit of Amazon listings: dead listings stay out, every exact
// product has a way out, and package math matches what the products hold.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { areas, levels } from "../readiness";
import { READINESS_TASKS as dailyTasks } from "../dailyReadiness";
import { tripStages } from "../ready/bundle";
import { AMAZON_TAG } from "../gear";
import { itemById } from "../stockup/catalog";
import { backupLink, packsText, shopLink } from "../stockup/shop";
import { BACKUP_Q } from "./backups";
import { pickByAsin, picks, picksFor, primaryPick, roleText } from "./picks";

const rows = readFileSync("docs/audit/amazon-audit-2026-11.tsv", "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const DEAD = /^(replace|remove|do not use)/;

describe("the listing audit", () => {
  it("every row names a real ASIN and says what was done", () => {
    expect(rows.length).toBeGreaterThan(100);
    for (const [asin, item, , title, stock, , action] of rows) {
      expect(asin, item).toMatch(/^[0-9A-Z]{10}$/);
      expect(["yes", "no", "partial", "not-found"], asin).toContain(title);
      expect(["buy", "none", "fresh", "out", "no-offers", "mixed"], asin).toContain(stock);
      expect(action, asin).toBeTruthy();
    }
  });

  it("the log keeps no prices or ratings", () => {
    for (const r of rows) expect(r.join(" "), r[0]).not.toMatch(/\$\d|out of 5|\bstars?\b|bought in past/i);
  });

  it("a listing the audit found unavailable, gone or wrong is not in the store", () => {
    const dead = rows.filter((r) => DEAD.test(r[6])).map((r) => r[0]);
    expect(dead.length).toBeGreaterThan(20);
    for (const asin of dead) expect(pickByAsin(asin), asin).toBeUndefined();
    const linked = [...areas.flatMap((a) => a.gear), ...levels.flatMap((l) => l.gear), ...dailyTasks.flatMap((t) => (t.gear ? [t.gear] : []))];
    for (const g of linked) expect(dead, g.name).not.toContain(g.asin);
  });

  it("a listing the audit saw as out of stock is never still called keep", () => {
    for (const r of rows.filter((x) => x[4] === "out")) expect(r[6], r[0]).toMatch(DEAD);
  });
});

describe("no dead ends", () => {
  it("every exact product has a tagged search beside it, labelled by its words", () => {
    for (const p of picks) {
      const item = itemById(p.item)!;
      const b = backupLink(item)!;
      expect(b, p.item).toBeTruthy();
      expect(b.url, p.item).toContain(`tag=${AMAZON_TAG}`);
      expect(b.url, p.item).toContain("/s?k=");
      expect(b.q.length, p.item).toBeGreaterThan(2);
    }
  });

  it("an item already on a search has no second search", () => {
    const shelf = itemById("shelf-food")!;
    expect(shopLink(shelf).kind).toBe("search");
    expect(backupLink(shelf)).toBeNull();
  });

  it("backup words name real items and stay within the copy rules", () => {
    for (const [id, q] of Object.entries(BACKUP_Q)) {
      expect(itemById(id), id).toBeDefined();
      expect(q, id).not.toMatch(/\bbest\b|#1|\bcheap\b|\bfree\b|on sale|deal/i);
    }
  });

  it("the essentials each have another exact choice or a search, and water has gallons and containers", () => {
    expect(primaryPick("water")?.count).toBe(6);
    expect(picksFor("water").some((p) => p.count === 1)).toBe(true);
    expect(primaryPick("water-storage-container")?.name).toMatch(/7-gallon/);
    expect(picksFor("water-storage-container").some((p) => p.role === "bulk")).toBe(true);
  });
});

describe("clear choices and quantities", () => {
  it("every role has a plain label and none says best", () => {
    for (const t of Object.values(roleText)) expect(t).not.toMatch(/best/i);
    expect(roleText.bulk).toBe("Bigger pack");
  });

  it("a bigger pack holds more than the item's first pick", () => {
    for (const p of picks.filter((x) => x.role === "bulk")) {
      const first = primaryPick(p.item)!;
      expect(p.count ?? 0, p.asin).toBeGreaterThan(first.count ?? 1);
    }
  });

  it("amounts become packages of the product we link", () => {
    expect(packsText(itemById("bottled-water")!, 216)).toBe("9 cases of 24");
    expect(packsText(itemById("water")!, 28)).toBe("5 cases of 6");
    expect(packsText(itemById("water")!, 6)).toBe("1 case of 6");
    expect(packsText(itemById("batteries")!, 16)).toBe("1 pack of 48");
    expect(packsText(itemById("manual-can-opener")!, 1)).toBeNull();
    expect(packsText(itemById("shelf-food")!, 28)).toBeNull();
  });

  it("long goals break into trips that end at the goal", () => {
    expect(tripStages(3)).toEqual([3]);
    expect(tripStages(7)).toEqual([3, 7]);
    expect(tripStages(14)).toEqual([3, 7, 14]);
    expect(tripStages(30)).toEqual([3, 7, 14, 30]);
    expect(tripStages(10)).toEqual([3, 7, 10]);
    expect(tripStages(90)).toEqual([3, 7, 14, 30, 90]);
  });
});
