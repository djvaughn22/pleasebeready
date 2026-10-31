import type { Metadata } from "next";
import ListsProvider from "../components/shop/ListsProvider";
import StockUp from "../components/stockup/StockUp";
import { formatDate, sourceList } from "../lib/stockup/sources";

// Pages the item notes and the two source amounts refer to.
const cited = new Set(["rc-kit", "rg-kit", "rg-water", "rg-food", "rg-pets", "rg-power", "cdc-water"]);

export const metadata: Metadata = {
  title: "My Ready Lists",
  description:
    "Your saved shopping lists for any situation: amounts for your group, Amazon links, bought and ready marks, notes, sharing and printing. Lists stay on your device; no account needed.",
  alternates: { canonical: "/lists" },
};

// The saved lists (the stock-up planner, renamed Oct 30, 2026; /planner redirects here).
export default function ListsPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <div className="print:hidden">
          <h1 className="text-2xl font-black leading-tight sm:text-4xl">My Ready Lists</h1>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#94a3b8] sm:text-base">
            Saved on this device. Open a list to shop it, tick off what you bought and mark what’s ready. No account needed.
          </p>
        </div>

        <div className="mt-8"><ListsProvider importLinks><StockUp /></ListsProvider></div>

        <section aria-labelledby="how-title" className="mb-10 mt-14 print:hidden">
          <h2 id="how-title" className="mb-1 text-xl font-black">How the amounts work</h2>
          <p className="mb-3 max-w-2xl text-sm font-semibold leading-6 text-[#94a3b8]">
            Each amount is a planning rule multiplied by your numbers: per person, per day, per meal, per night, or one for the group.
            Every item shows its math, rounds up, and can be changed. Most rules are ours, as starting points. Only emergency water
            (1 gallon per person per day) and a 7-day medicine supply come from the sources below. We last read them on{" "}
            {formatDate(sourceList[0].checked)}; check them for the latest.
          </p>
          <ul className="flex flex-col gap-2">
            {sourceList.filter((s) => cited.has(s.id)).map((s) => (
              <li key={s.id} className="text-xs font-semibold leading-5 text-[#94a3b8]">
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-black underline pbr-accent">{s.agency} · {s.title}</a>
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-4 text-center print:hidden">
          <p className="mx-auto max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            General planning information, not professional or medical advice. A list does not guarantee anyone’s safety. In any emergency,
            call your local emergency number and follow official guidance from local authorities.
          </p>
        </div>
      </div>
    </main>
  );
}
