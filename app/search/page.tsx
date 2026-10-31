import type { Metadata } from "next";
import { Suspense } from "react";
import SearchView from "../components/shop/SearchView";

// Results depend on the words typed, so the page is kept out of search indexes.
export const metadata: Metadata = {
  title: "Search",
  description: "Search kits and products by what you need to be ready for.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="pbr-display mb-4 text-2xl font-black sm:text-3xl">Search</h1>
        <Suspense fallback={<p className="text-sm font-semibold text-[#94a3b8]">Loading search…</p>}>
          <SearchView />
        </Suspense>
        <p className="mx-auto mt-10 max-w-xl text-center text-xs font-semibold leading-6 text-[#94a3b8]">
          As an Amazon Associate, PleaseBeReady earns from qualifying purchases.
        </p>
      </div>
    </main>
  );
}
