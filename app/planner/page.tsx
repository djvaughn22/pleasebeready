import type { Metadata } from "next";
import Link from "next/link";
import ClickMeasure from "../components/ClickMeasure";
import Planner from "../components/planner/Planner";
import { AMAZON_DISCLOSURE } from "../lib/bookLinks";
import { formatDate, sourceList } from "../lib/planner/sources";

export const metadata: Metadata = {
  title: "Household Planner",
  description:
    "Plan water, food, medicine, light, sanitation and documents for your household and plan length. Edit the checklist, set a budget and build a shopping list. Your plan stays on your device.",
};

const A = "#34D399";

export default function PlannerPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-12">
        <div className="print:hidden">
          <Link href="/" className="text-sm font-black" style={{ color: A }}>← Get Ready</Link>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Household planner</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">
            Tell us who is at home and how long you want to be covered. You get a checklist sized to your household that you can edit,
            a rough budget, and a shopping list. It is useful for ordinary disruptions like a storm, an outage or a water-main break.
          </p>
        </div>

        <ClickMeasure />
        <div className="mt-8"><Planner /></div>

        <section aria-labelledby="sources-title" className="mb-10 mt-4 print:hidden">
          <h2 id="sources-title" className="mb-1 text-xl font-black">Where the advice comes from</h2>
          <p className="mb-3 max-w-2xl text-sm font-semibold leading-6 text-[#94a3b8]">
            Only a few amounts come straight from the sources: 1 gallon of water per person per day, a 3-day supply to take with you and a
            2-week supply for home (Red Cross), and a 7-day supply of medicines (Red Cross). For everything else the sources list the
            item without a number, so the amount is our suggestion, and we say so on the item. Ready.gov mostly says “several days”.
          </p>
          <ul className="flex flex-col gap-2">
            {sourceList.map((s) => (
              <li key={s.id} className="text-xs font-semibold leading-5 text-[#94a3b8]">
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="font-black underline" style={{ color: A }}>
                  {s.agency} · {s.title}
                </a>
                {" "}· we checked it {formatDate(s.checked)}{s.pageUpdated ? `; the page says updated ${formatDate(s.pageUpdated)}` : ""}
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-4 text-center print:hidden">
          <p className="mx-auto max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            General preparedness information, not professional or medical advice. A plan does not guarantee anyone’s safety. In any emergency,
            call your local emergency number and follow official guidance from local authorities.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">{AMAZON_DISCLOSURE}</p>
        </div>
      </div>
    </main>
  );
}
