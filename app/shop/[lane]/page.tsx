import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { SITE, breadcrumbs } from "../../components/JsonLd";
import LaneShop from "../../components/shop/LaneShop";
import { KitCard } from "../../components/shop/Tiles";
import { guides } from "../../lib/shop/guides";
import { kitsInLane } from "../../lib/shop/kits";
import { laneById, lanes } from "../../lib/shop/lanes";

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
  const laneGuides = guides.filter((g) => laneKits.some((k) => k.slug === g.kit));
  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-2 text-xs font-bold text-[#94a3b8]">
          <Link href="/" className="hover:underline">Home</Link> › <Link href="/shop" className="hover:underline">Departments</Link>
        </nav>
        <h1 className="pbr-display text-2xl font-black leading-tight sm:text-4xl"><span aria-hidden>{lane.emoji} </span>{lane.title}</h1>
        <p className="mt-1 text-sm font-semibold text-[#94a3b8]">{lane.blurb}</p>

        <LaneShop laneId={lane.id}>
          {laneKits.length > 0 && (
            <section aria-labelledby="lane-kits" className="mb-10">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 id="lane-kits" className="pbr-display text-xl font-black sm:text-2xl">{lane.id === "emergency" ? "Shop by emergency" : "Kits"}</h2>
                <Link href="/kits" className="shrink-0 text-sm font-black pbr-accent">All kits →</Link>
              </div>
              <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
                {laneKits.map((k) => <li key={k.slug} className="w-[11.5rem] shrink-0 snap-start sm:w-auto"><KitCard kit={k} /></li>)}
              </ul>
              {laneGuides.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Buying guides">
                  {laneGuides.map((g) => (
                    <li key={g.slug}>
                      <Link href={`/guides/${g.slug}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#26324c] bg-[#141d2e] px-3 text-sm font-bold text-[#e8edf5]">
                        <span aria-hidden>📖</span>{g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </LaneShop>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs font-semibold leading-6 text-[#94a3b8]">
          As an Amazon Associate, PleaseBeReady earns from qualifying purchases. “Search Amazon” opens search results, not one chosen product.
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
