import type { Metadata } from "next";
import GetReady from "../components/ready/GetReady";
import ListsProvider from "../components/shop/ListsProvider";
import { formatDate, sources } from "../lib/stockup/sources";

export const metadata: Metadata = {
  title: "Get Ready",
  description:
    "A readiness plan for your household: what to stock first, amounts for your people and days. Saved on your device; no account.",
  alternates: { canonical: "/ready" },
};

const CITED = ["rg-kit", "rg-water", "rg-food", "rc-kit", "cdc-water", "rg-disability", "rg-pets"] as const;

// The guided readiness plan (lib/ready/engine.ts). The plan itself is a Ready List.
export default function ReadyPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
        <h1 className="pbr-display mb-5 text-3xl font-black leading-tight sm:text-4xl print:hidden">Get <span className="pbr-accent">Ready</span></h1>
        <ListsProvider importLinks><GetReady /></ListsProvider>

        <section aria-labelledby="how-title" className="mt-12 print:hidden">
          <h2 id="how-title" className="mb-1 text-lg font-black">Where the order and amounts come from</h2>
          <p className="mb-3 text-sm font-semibold leading-6 text-[#94a3b8]">
            Emergency plans follow the household kit in Ready.gov’s Build a Kit list, in a default order: water, food, light and power,
            first aid and medicine, alerts, sanitation, then shelter and leaving. That’s a shopping order, not a rule for every emergency:
            heat, cold, evacuation and medical needs move things to the front. Water uses the 1 gallon per person per day baseline;
            hot weather, illness, nursing and kids can need more. Other amounts are our planning rules and every one can be changed.
            We last read these pages on {formatDate(sources["rg-kit"].checked)}.
          </p>
          <ul className="flex flex-col gap-1.5">
            {CITED.map((id) => (
              <li key={id} className="text-xs font-semibold"><a href={sources[id].href} target="_blank" rel="noopener noreferrer" className="font-black underline pbr-accent">{sources[id].agency} · {sources[id].title}</a></li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-semibold leading-6 text-[#94a3b8]">
            General planning information, not professional or medical advice. A plan does not guarantee anyone’s safety. In any emergency,
            call your local emergency number and follow official guidance from local authorities.
          </p>
        </section>
      </div>
    </main>
  );
}
