// The Preparedness Bookshelf — a small, curated reading list, not a
// storefront. Filtering is a plain ?category= query param re-render (no
// client JS needed), matching the rest of this site's server-first pages.

import type { Metadata } from "next";
import Link from "next/link";
import { AMAZON_DISCLOSURE, amazonBookUrl, audibleSearchUrl, coverUrl, LIBBY_APP_URL, openLibraryUrl, OVERDRIVE_FIND_LIBRARY_URL, readNotReadUrl } from "../lib/bookLinks";
import { BOOKS, booksByCategory, CATEGORY_LABELS, type PrepBook, type ReadinessCategory } from "../lib/books";

export const metadata: Metadata = {
  title: "Preparedness Bookshelf",
  description: "A hand-picked reading list for emergency readiness, first aid, food storage, home resilience, finances, family prep, and traditional skills.",
};

const A = "#34D399";
const CATEGORIES: (ReadinessCategory | "all")[] = ["all", "emergency-readiness", "first-aid", "food-water", "home-resilience", "financial", "faith-emotional", "family", "traditional-skills"];

function CategoryChip({ category, active }: { category: ReadinessCategory | "all"; active: boolean }) {
  const label = category === "all" ? "All books" : CATEGORY_LABELS[category];
  const href = category === "all" ? "/books" : `/books?category=${category}`;
  return (
    <Link
      href={href}
      className="rounded-full border px-3 py-1.5 text-xs font-bold transition"
      style={active ? { background: A, borderColor: A, color: "#0b1220" } : { borderColor: "#26324c", color: "#cbd5e1" }}
    >
      {label}
    </Link>
  );
}

function BookCard({ book }: { book: PrepBook }) {
  const cover = coverUrl(book);
  return (
    <li className="pop rounded-2xl border border-[#26324c] bg-[#141d2e] p-5">
      <div className="flex gap-4">
        <Link href={readNotReadUrl(book)} target="_blank" rel="noopener noreferrer" className="block h-32 w-20 shrink-0 overflow-hidden rounded-lg border border-[#26324c] bg-[#0b1220]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={`${book.title} cover`} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
              <span className="text-xl" aria-hidden>📖</span>
              <span className="text-[9px] font-semibold leading-tight text-[#64748b]">{book.title}</span>
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: A }}>{CATEGORY_LABELS[book.category]}</p>
          <h3 className="mt-0.5 text-lg font-black leading-tight text-[#e8edf5]">{book.title}</h3>
          <p className="text-sm font-semibold text-[#94a3b8]">{book.author} · {book.year}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#cbd5e1]">{book.whyUseful}</p>

      <p className="mt-3 text-xs font-black uppercase tracking-wide text-[#64748b]">What you&apos;ll learn</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-[#94a3b8]">
        {book.whatYouLearn.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {/* Get this book — library-first, same order as ReadNotRead. */}
      <div className="mt-4 space-y-2 border-t border-[#26324c] pt-4">
        {(book.freeToRead || book.freeToBorrow) && (
          <a
            href={openLibraryUrl(book)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-black"
            style={{ background: A, color: "#0b1220" }}
          >
            <span>{book.freeToRead ? "📖 Read free on Open Library" : "📚 Borrow on Open Library"}</span>
            <span>→</span>
          </a>
        )}
        <a
          href={OVERDRIVE_FIND_LIBRARY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[#26324c] px-4 py-2.5 text-sm font-bold text-[#e8edf5]"
        >
          <span>🏛️ Find at my library (Libby)</span>
          <span>→</span>
        </a>
        <a
          href={amazonBookUrl(book)}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[#26324c] px-4 py-2.5 text-sm font-bold text-[#e8edf5]"
        >
          <span>🛒 Buy on Amazon</span>
          <span>→</span>
        </a>
        {book.hasKnownAudiobook && (
          <a
            href={audibleSearchUrl(book)}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[#26324c] px-4 py-2.5 text-sm font-bold text-[#e8edf5]"
          >
            <span>🎧 Search Audible</span>
            <span>→</span>
          </a>
        )}
      </div>

      <Link href={readNotReadUrl(book)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold hover:underline" style={{ color: A }}>
        Track this book on ReadNotRead →
      </Link>
    </li>
  );
}

export default async function BooksPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active: ReadinessCategory | "all" = CATEGORIES.includes(category as ReadinessCategory) ? (category as ReadinessCategory) : "all";
  const books = booksByCategory(active);

  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <header className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: A }}>Preparedness Bookshelf</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">Books worth actually reading</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-[#94a3b8]">
            {BOOKS.length} hand-picked books on readiness, first aid, food storage, home resilience, money, family prep, and traditional skills — with a short honest note on why each one is worth your time.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap justify-center gap-1.5">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c} category={c} active={c === active} />
          ))}
        </div>

        <ul className="mt-8 space-y-4">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="max-w-md text-xs font-semibold leading-5 text-[#94a3b8]">
            Get the free Libby app to borrow ebooks and audiobooks from your public library:{" "}
            <a href={LIBBY_APP_URL} target="_blank" rel="noopener noreferrer" style={{ color: A }}>overdrive.com/apps/libby</a>.
          </p>
          <Link href="/" className="font-black" style={{ color: A }}>
            ← Back to Get Ready
          </Link>
          <p className="max-w-md text-xs font-semibold leading-5 text-[#94a3b8]">{AMAZON_DISCLOSURE}</p>
        </div>
      </div>
    </main>
  );
}
