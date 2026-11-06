import type { Metadata } from "next";
import Link from "next/link";
import FoodWaterBundle from "../components/ready/FoodWaterBundle";
import ListsProvider from "../components/shop/ListsProvider";
import { parseDays, parseOnly, parsePeople, parseWay } from "../lib/ready/bundle";

export const metadata: Metadata = {
  title: "Food & Water",
  description: "Drinking water and shelf-stable groceries for your household: pick people and days, get products and package counts.",
  alternates: { canonical: "/food-water" },
};

export default async function FoodWaterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const one = (k: string) => (Array.isArray(q[k]) ? q[k]![0] : q[k]);
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs font-bold text-[#94a3b8]">
          <Link href="/" className="hover:underline">Home</Link> › <Link href="/shop/emergency" className="hover:underline">Emergency</Link>
        </nav>
        <ListsProvider>
          <FoodWaterBundle people={parsePeople(one("people"))} days={parseDays(one("days"))} goal={one("goal") ? parseDays(one("goal")) : undefined} only={parseOnly(one("only"))} way={parseWay(one("water"))} />
        </ListsProvider>
        <p className="mx-auto mt-10 max-w-xl text-center text-xs font-semibold leading-6 text-[#94a3b8]">
          As an Amazon Associate, PleaseBeReady earns from qualifying purchases. “Search Amazon” and “Sold out? Search” open search results, not one chosen product.
        </p>
      </div>
    </main>
  );
}
