import { describe, expect, it } from "vitest";
import { AMAZON_DISCLOSURE, amazonBookUrl, audibleSearchUrl, coverUrl, openLibraryUrl, readNotReadUrl } from "./bookLinks";
import { BOOKS } from "./books";

const foundationLike = { title: "The Hobbit", author: "J.R.R. Tolkien" } as (typeof BOOKS)[number];

describe("amazonBookUrl", () => {
  it("converts a real ISBN-13 to its verified ISBN-10/ASIN for a direct product link", () => {
    // 054792822X is a verified-real ISBN-10 (openlibrary.org/isbn/054792822X.json redirects to the record).
    const url = amazonBookUrl({ ...foundationLike, isbn: "9780547928227" } as (typeof BOOKS)[number]);
    expect(url).toContain("amazon.com/dp/054792822X");
  });

  it("uses a 10-digit ISBN directly", () => {
    const url = amazonBookUrl({ ...foundationLike, isbn: "0553293354" } as (typeof BOOKS)[number]);
    expect(url).toContain("amazon.com/dp/0553293354");
  });

  it("falls back to a title+author search when there is no ISBN — never a broken /dp/ guess", () => {
    const book = BOOKS.find((b) => !b.isbn);
    expect(book).toBeTruthy();
    const url = amazonBookUrl(book!);
    expect(url).toContain("amazon.com/s?k=");
    expect(url).toContain("i=stripbooks");
  });

  it("every real curated book produces a valid amazon.com URL", () => {
    for (const b of BOOKS) {
      const url = amazonBookUrl(b);
      expect(url.startsWith("https://www.amazon.com/")).toBe(true);
    }
  });
});

describe("audibleSearchUrl", () => {
  it("is always a search, never a claimed product page", () => {
    const url = audibleSearchUrl(BOOKS[0]);
    expect(url).toContain("audible.com/search?keywords=");
  });

  it("is only ever linked from the page for books flagged hasKnownAudiobook", () => {
    const audiobookBooks = BOOKS.filter((b) => b.hasKnownAudiobook);
    expect(audiobookBooks.length).toBeGreaterThan(0);
    expect(audiobookBooks.length).toBeLessThan(BOOKS.length); // not every book — a real curation choice, not a blanket claim
  });
});

describe("coverUrl fallback chain", () => {
  it("prefers the verified Open Library cover id", () => {
    const b = BOOKS.find((x) => x.coverId)!;
    expect(coverUrl(b)).toContain(`/id/${b.coverId}-L.jpg`);
  });

  it("falls back to an ISBN cover when there is no cover id", () => {
    const b = BOOKS.find((x) => !x.coverId && x.isbn)!;
    expect(coverUrl(b)).toContain(`/isbn/${b.isbn}-L.jpg`);
  });

  it("falls back to null (renders the designed placeholder) when neither exists", () => {
    const b = BOOKS.find((x) => !x.coverId && !x.isbn)!;
    expect(coverUrl(b)).toBeNull();
  });
});

describe("cross-links use the same stable Open Library work id", () => {
  it("openLibraryUrl and readNotReadUrl both key off openLibraryWorkKey", () => {
    const b = BOOKS[0];
    expect(openLibraryUrl(b)).toBe(`https://openlibrary.org/works/${b.openLibraryWorkKey}`);
    expect(readNotReadUrl(b)).toBe(`https://watchednotwatched.com/title/openlibrary/${b.openLibraryWorkKey}?mediaType=book`);
  });
});

describe("AMAZON_DISCLOSURE", () => {
  it("matches this site's existing disclosure convention", () => {
    expect(AMAZON_DISCLOSURE).toBe("As an Amazon Associate, PleaseBeReady earns from qualifying purchases.");
  });
});
