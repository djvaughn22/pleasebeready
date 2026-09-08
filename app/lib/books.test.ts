import { describe, expect, it } from "vitest";
import { BOOKS, booksByCategory, CATEGORY_LABELS, type ReadinessCategory } from "./books";

describe("curated book list shape", () => {
  it("every book has a unique slug", () => {
    const slugs = BOOKS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every book has the required editorial fields filled in", () => {
    for (const b of BOOKS) {
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.author.length).toBeGreaterThan(0);
      expect(b.whyUseful.length).toBeGreaterThan(20);
      expect(b.whatYouLearn.length).toBeGreaterThan(0);
      expect(b.year).toBeGreaterThan(1800);
      expect(b.year).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });

  it("every book has a valid Open Library work key format", () => {
    for (const b of BOOKS) {
      expect(b.openLibraryWorkKey).toMatch(/^OL\d+W$/);
    }
  });

  it("every category is one of the 8 readiness categories", () => {
    const valid = new Set(Object.keys(CATEGORY_LABELS));
    for (const b of BOOKS) expect(valid.has(b.category)).toBe(true);
  });

  it("covers all 8 requested readiness categories with at least one book", () => {
    const covered = new Set(BOOKS.map((b) => b.category));
    for (const category of Object.keys(CATEGORY_LABELS) as ReadinessCategory[]) {
      expect(covered.has(category)).toBe(true);
    }
  });
});

describe("free/borrow claims are only made for verified records", () => {
  it("only Nuclear War Survival Skills is flagged freeToRead (verified is_readable=true at curation time)", () => {
    const readable = BOOKS.filter((b) => b.freeToRead).map((b) => b.slug);
    expect(readable).toEqual(["nuclear-war-survival-skills"]);
  });

  it("only The Foxfire Book is flagged freeToBorrow (verified is_lendable=true at curation time)", () => {
    const borrowable = BOOKS.filter((b) => b.freeToBorrow).map((b) => b.slug);
    expect(borrowable).toEqual(["foxfire-book"]);
  });

  it("no book claims both freeToRead and freeToBorrow", () => {
    for (const b of BOOKS) expect(b.freeToRead && b.freeToBorrow).toBe(false);
  });
});

describe("booksByCategory", () => {
  it("'all' returns the full list", () => {
    expect(booksByCategory("all")).toHaveLength(BOOKS.length);
  });

  it("a specific category returns only matching books", () => {
    const result = booksByCategory("financial");
    expect(result.length).toBeGreaterThan(0);
    for (const b of result) expect(b.category).toBe("financial");
  });
});
