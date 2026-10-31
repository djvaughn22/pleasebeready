import type { Metadata } from "next";
import Link from "next/link";
import JsonLd, { SITE, breadcrumbs } from "../components/JsonLd";
import { guides } from "../lib/shop/guides";

export const metadata: Metadata = {
  title: "Guides: how much to buy and how to store it",
  description: "Plain guides to emergency water, power outages, winter storms, a basic emergency kit, a car kit, a pet kit and emergency food, each based on Ready.gov and ending in a shopping list.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">Guides</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">
          What you need, how much, how to choose and how to store it. Each one is based on official guidance and ends in a kit you can shop.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="flex h-full items-start gap-3 rounded-2xl border border-[#26324c] bg-[#141d2e] p-4 transition hover:border-[#34D399]">
                <span aria-hidden className="text-2xl leading-none">{g.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-base font-black leading-snug text-[#e8edf5]">{g.title}</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[#94a3b8]">{g.short}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbs([{ name: "Home", path: "/" }, { name: "Guides" }]),
          { "@type": "ItemList", name: "PleaseBeReady guides", itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, name: g.title, url: `${SITE}/guides/${g.slug}` })) },
        ],
      }} />
    </main>
  );
}
