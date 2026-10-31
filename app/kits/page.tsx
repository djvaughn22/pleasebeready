import type { Metadata } from "next";
import JsonLd, { SITE, breadcrumbs } from "../components/JsonLd";
import { KitCard } from "../components/shop/Tiles";
import { kits } from "../lib/shop/kits";
import { lanes } from "../lib/shop/lanes";

export const metadata: Metadata = {
  title: "Ready-made shopping kits",
  description: `${kits.length} shopping kits with amounts for your group: power outages, winter storms, a new puppy, a teen's first car, camping, parties, a first apartment and more.`,
  alternates: { canonical: "/kits" },
};

// Every kit, grouped by its main lane.
export default function KitsPage() {
  const groups = lanes.map((l) => ({ l, list: kits.filter((k) => k.lane === l.id) })).filter((g) => g.list.length);
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">Ready-made kits</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">
          Pick a kit, set how many people and how long, then save it as a list or shop it item by item.
        </p>
        <div className="mt-8 flex flex-col gap-8">
          {groups.map(({ l, list }) => (
            <section key={l.id} aria-labelledby={`kits-${l.id}`}>
              <h2 id={`kits-${l.id}`} className="mb-3 text-lg font-black"><span aria-hidden>{l.emoji} </span>{l.title}</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{list.map((k) => <li key={k.slug}><KitCard kit={k} /></li>)}</ul>
            </section>
          ))}
        </div>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbs([{ name: "Home", path: "/" }, { name: "Kits" }]),
          { "@type": "ItemList", name: "Ready-made shopping kits", numberOfItems: kits.length,
            itemListElement: kits.map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.title, url: `${SITE}/kits/${k.slug}` })) },
        ],
      }} />
    </main>
  );
}
