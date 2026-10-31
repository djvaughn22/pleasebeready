import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { SITE, breadcrumbs } from "../../components/JsonLd";
import KitView from "../../components/shop/KitView";
import { KitCard } from "../../components/shop/Tiles";
import { guideForKit } from "../../lib/shop/guides";
import { kitBySlug, kits, kitsInLane } from "../../lib/shop/kits";
import { laneById } from "../../lib/shop/lanes";
import { itemById } from "../../lib/stockup/catalog";

export const dynamicParams = false;
export const generateStaticParams = () => kits.map((k) => ({ slug: k.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const kit = kitBySlug((await params).slug);
  if (!kit) return {};
  return {
    title: `${kit.title}: what to buy`,
    description: kit.intro,
    alternates: { canonical: `/kits/${kit.slug}` },
    openGraph: { title: `${kit.title} | PleaseBeReady`, description: kit.intro, url: `/kits/${kit.slug}`, type: "article" },
  };
}

export default async function KitPage({ params }: { params: Promise<{ slug: string }> }) {
  const kit = kitBySlug((await params).slug);
  if (!kit) notFound();
  const lane = laneById(kit.lane)!;
  const related = kitsInLane(kit.lane).filter((k) => k.slug !== kit.slug).slice(0, 4);
  const guide = guideForKit(kit.slug);

  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs font-bold text-[#94a3b8]">
          <Link href="/kits" className="hover:underline">Kits</Link> <span aria-hidden>›</span>{" "}
          <Link href={`/shop/${lane.id}`} className="hover:underline">{lane.title}</Link>
        </nav>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl"><span aria-hidden>{kit.emoji} </span>{kit.title}</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">{kit.intro}</p>
        {guide && (
          <p className="mt-2 text-sm font-bold">
            <Link href={`/guides/${guide.slug}`} className="underline pbr-accent">📖 Read the guide: {guide.title.toLowerCase()}</Link>
          </p>
        )}

        <div className="mt-6"><KitView slug={kit.slug} /></div>

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-12 print:hidden">
            <h2 id="related-title" className="mb-3 text-lg font-black">More in {lane.title.toLowerCase()}</h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">{related.map((k) => <li key={k.slug}><KitCard kit={k} /></li>)}</ul>
          </section>
        )}

        <div className="pt-10 text-center">
          <p className="mx-auto max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            General planning information, not professional or medical advice. A list does not guarantee anyone’s safety. In any
            emergency, call your local emergency number and follow official guidance from local authorities.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">As an Amazon Associate, PleaseBeReady earns from qualifying purchases.</p>
        </div>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbs([{ name: "Kits", path: "/kits" }, { name: lane.title, path: `/shop/${lane.id}` }, { name: kit.title }]),
          { "@type": "ItemList", name: `${kit.title}: must-haves`, url: `${SITE}/kits/${kit.slug}`, numberOfItems: kit.essentials.length,
            itemListElement: kit.essentials.map((id, i) => ({ "@type": "ListItem", position: i + 1, name: itemById(id)?.name })) },
        ],
      }} />
    </main>
  );
}
