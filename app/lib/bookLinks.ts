// Retailer/library links for the Preparedness Bookshelf. Reuses this site's
// existing amazonUrl()/AMAZON_TAG convention from lib/gear.ts rather than
// inventing a second Amazon config — same tag, same disclosure.
import { AMAZON_TAG, amazonUrl } from "./gear";
import type { PrepBook } from "./books";

export const AMAZON_DISCLOSURE = "As an Amazon Associate, PleaseBeReady earns from qualifying purchases.";

export const OVERDRIVE_FIND_LIBRARY_URL = "https://www.overdrive.com/libraries";
export const LIBBY_APP_URL = "https://www.overdrive.com/apps/libby";

/** ISBN-13 (978-prefixed) → ISBN-10 — the identifier Amazon's /dp/ path
 * expects for print books. Real ISO 2108 check-digit math, verified against
 * live Open Library ISBN redirects for the titles that use it (see books.ts). */
function isbn13To10(isbn13: string): string | null {
  const digits = isbn13.replace(/[^0-9]/g, "");
  if (digits.length !== 13 || !digits.startsWith("978")) return null;
  const core = digits.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? "X" : String(check));
}

function toAsin(isbn: string): string | null {
  const cleaned = isbn.replace(/[^0-9Xx]/g, "");
  if (cleaned.length === 10) return cleaned.toUpperCase();
  if (cleaned.length === 13) return isbn13To10(cleaned);
  return null;
}

/** Retailer search terms, not display text: a credit like "(editor)" is
 * accurate on the card but only adds noise to a catalog query. The card keeps
 * the full byline; the search gets the name. */
function searchTerms(book: PrepBook): string {
  return `${book.title} ${book.author.replace(/\s*\([^)]*\)/g, "").trim()}`;
}

export function amazonBookUrl(book: PrepBook): string {
  const asin = book.isbn ? toAsin(book.isbn) : null;
  if (asin) return amazonUrl(asin);
  const q = encodeURIComponent(searchTerms(book));
  return `https://www.amazon.com/s?k=${q}&i=stripbooks${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ""}`;
}

/** Always a search — no Audible API is wired up here to verify a specific
 * edition, so this never claims a product exists. Only rendered for books
 * flagged hasKnownAudiobook in books.ts (a curation judgment, not a live check). */
export function audibleSearchUrl(book: PrepBook): string {
  return `https://www.audible.com/search?keywords=${encodeURIComponent(searchTerms(book))}`;
}

export function openLibraryUrl(book: PrepBook): string {
  return `https://openlibrary.org/works/${book.openLibraryWorkKey}`;
}

/** The ReadNotRead detail page for this same Open Library work — lets a
 * reader who wants to actually track/rate the book jump straight there.
 * `mode=book` is what keeps the destination in ReadNotRead; without it a
 * first-time visitor lands on a book page wearing WatchedNotWatched chrome. */
export function readNotReadUrl(book: PrepBook): string {
  return `https://watchednotwatched.com/title/openlibrary/${book.openLibraryWorkKey}?mediaType=book&mode=book`;
}

export function coverUrl(book: PrepBook): string | null {
  if (book.coverId) return `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg?default=false`;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-L.jpg?default=false`;
  return null;
}
