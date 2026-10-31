import type { Metadata } from "next";
import Link from "next/link";
import JsonLd, { SITE, breadcrumbs } from "../components/JsonLd";
import { kitsInLane } from "../lib/shop/kits";
import { laneItems, lanes } from "../lib/shop/lanes";

export const metadata: Metadata = {
  title: "Shop by need",
  description: "Sixteen ways in: emergencies, food and water, home, family, school and sports, pets, cars, travel, camping, parties, health, caregiving, seasons, moving, tools and everyday things.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">Shop by need</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">Each lane has its kits and everything else that fits it.</p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {lanes.map((l) => (
            <li key={l.id}>
              <Link href={`/shop/${l.id}`} style={{ borderColor: "var(--om-border)", borderTopColor: l.color }}
                className="flex h-full items-start gap-3 rounded-2xl border border-t-4 bg-[#141d2e] p-4 transition hover:brightness-110">
                <span aria-hidden className="text-2xl leading-none">{l.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-base font-black leading-snug text-[#e8edf5]">{l.title}</span>
                  <span className="mt-0.5 block text-xs font-semibold leading-5 text-[#94a3b8]">{l.blurb}</span>
                  <span className="mt-1 block text-xs font-bold text-[#94a3b8]">{kitsInLane(l.id).length} kits · {laneItems(l).length} items</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbs([{ name: "Home", path: "/" }, { name: "Shop by need" }]),
          { "@type": "ItemList", name: "Shopping lanes", itemListElement: lanes.map((l, i) => ({ "@type": "ListItem", position: i + 1, name: l.title, url: `${SITE}/shop/${l.id}` })) },
        ],
      }} />
    </main>
  );
}
