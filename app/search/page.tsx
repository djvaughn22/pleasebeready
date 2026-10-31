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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <h1 className="mb-5 text-3xl font-black leading-tight sm:text-4xl">What do you want to be ready for?</h1>
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
