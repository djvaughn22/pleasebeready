import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { SITE, breadcrumbs } from "../../components/JsonLd";
import LaneShop from "../../components/shop/LaneShop";
import { KitCard } from "../../components/shop/Tiles";
import { kitsInLane } from "../../lib/shop/kits";
import { laneById, laneItems, lanes } from "../../lib/shop/lanes";

export const dynamicParams = false;
export const generateStaticParams = () => lanes.map((l) => ({ lane: l.id }));

export async function generateMetadata({ params }: { params: Promise<{ lane: string }> }): Promise<Metadata> {
  const lane = laneById((await params).lane);
  if (!lane) return {};
  const kitNames = kitsInLane(lane.id).map((k) => k.title.toLowerCase()).slice(0, 4).join(", ");
  return {
    title: `${lane.title}: kits and shopping lists`,
    description: `${lane.blurb} Kits: ${kitNames}. Amounts for your group, Amazon links, and lists saved on your device.`,
    alternates: { canonical: `/shop/${lane.id}` },
  };
}

export default async function LanePage({ params }: { params: Promise<{ lane: string }> }) {
  const lane = laneById((await params).lane);
  if (!lane) notFound();
  const laneKits = kitsInLane(lane.id);
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs font-bold text-[#94a3b8]">
          <Link href="/shop" className="hover:underline">Shop by need</Link>
        </nav>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl"><span aria-hidden>{lane.emoji} </span>{lane.title}</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">{lane.blurb}</p>

        <section aria-labelledby="lane-kits" className="mt-6">
          <h2 id="lane-kits" className="mb-3 text-lg font-black">Kits</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{laneKits.map((k) => <li key={k.slug}><KitCard kit={k} /></li>)}</ul>
        </section>

        <section aria-labelledby="lane-all" className="mt-10">
          <h2 id="lane-all" className="mb-3 text-lg font-black">Everything in {lane.title.toLowerCase()} <span className="text-sm text-[#94a3b8]">({laneItems(lane).length})</span></h2>
          <LaneShop laneId={lane.id} />
        </section>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs font-semibold leading-6 text-[#94a3b8]">
          As an Amazon Associate, PleaseBeReady earns from qualifying purchases. “Find on Amazon” opens search results, not one chosen product.
        </p>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbs([{ name: "Shop by need", path: "/shop" }, { name: lane.title }]),
          { "@type": "ItemList", name: `${lane.title} kits`, itemListElement: laneKits.map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.title, url: `${SITE}/kits/${k.slug}` })) },
        ],
      }} />
    </main>
  );
}
