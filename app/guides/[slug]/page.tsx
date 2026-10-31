import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { SITE, breadcrumbs } from "../../components/JsonLd";
import { KitCard } from "../../components/shop/Tiles";
import { guideBySlug, guides } from "../../lib/shop/guides";
import { kitBySlug } from "../../lib/shop/kits";

export const dynamicParams = false;
export const generateStaticParams = () => guides.map((g) => ({ slug: g.slug }));

const day = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.short,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: `${g.title} | PleaseBeReady`, description: g.short, url: `/guides/${g.slug}`, type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const kit = kitBySlug(g.kit)!;
  const label = new Map(g.sources.map((s) => [s.id, s.label]));
  const read = g.sources.map((s) => s.read).sort().at(-1)!;

  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs font-bold text-[#94a3b8]"><Link href="/guides" className="hover:underline">Guides</Link></nav>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl"><span aria-hidden>{g.emoji} </span>{g.title}</h1>
        <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-[#94a3b8]">{g.intro}</p>
        <p className="mt-2 text-xs font-semibold text-[#94a3b8]">Sources read {day(read)}.</p>

        <Link href={`/kits/${kit.slug}`} className="pbr-edge mt-6 flex items-center justify-between gap-3 rounded-2xl border-2 bg-[#141d2e] p-4 transition hover:brightness-110">
          <span className="min-w-0">
            <span className="block text-base font-black text-[#e8edf5]">{kit.emoji} Shop the {kit.title.toLowerCase()}</span>
            <span className="mt-0.5 block text-xs font-semibold text-[#94a3b8]">Amounts for your group, Amazon links, and a list you can save.</span>
          </span>
          <span aria-hidden className="text-lg font-black pbr-accent">→</span>
        </Link>

        <div className="mt-8 flex flex-col gap-8">
          {g.sections.map((s) => (
            <section key={s.heading} aria-label={s.heading}>
              <h2 className="mb-2 text-xl font-black">{s.heading}</h2>
              <ul className="flex flex-col gap-2">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2 text-[0.95rem] font-semibold leading-7 text-[#e8edf5]"><span aria-hidden className="pbr-accent">•</span><span>{p}</span></li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs font-semibold text-[#94a3b8]">{s.from ? `From ${s.from.map((id) => label.get(id)).join(" and ")}.` : "Our tips."}</p>
            </section>
          ))}
        </div>

        <section aria-labelledby="sources-title" className="mt-10 rounded-2xl border border-[#26324c] bg-[#141d2e] p-5">
          <h2 id="sources-title" className="mb-2 text-lg font-black">Sources</h2>
          <ul className="flex flex-col gap-1.5">
            {g.sources.map((s) => (
              <li key={s.id} className="text-sm font-semibold text-[#94a3b8]">
                <a href={s.href} target="_blank" rel="noopener noreferrer" data-measure="guide" data-measure-label={g.slug} className="font-black underline pbr-accent">{s.label}</a>
                {s.updated ? ` · page updated ${day(s.updated)}` : ""} · read {day(s.read)}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="next-title" className="mt-10">
          <h2 id="next-title" className="mb-3 text-lg font-black">Shop it</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3"><li><KitCard kit={kit} /></li></ul>
        </section>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs font-semibold leading-6 text-[#94a3b8]">
          General preparedness information, not professional or medical advice. In any emergency, call your local emergency number and follow official guidance from local authorities.
        </p>
      </article>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          breadcrumbs([{ name: "Guides", path: "/guides" }, { name: g.title }]),
          { "@type": "Article", headline: g.title, description: g.short, url: `${SITE}/guides/${g.slug}`, dateModified: read,
            author: { "@type": "Organization", name: "PleaseBeReady" }, publisher: { "@type": "Organization", name: "Open Mirror LLC" },
            citation: g.sources.map((s) => s.href) },
        ],
      }} />
    </main>
  );
}
