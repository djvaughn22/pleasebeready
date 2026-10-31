import type { Metadata } from "next";
import Link from "next/link";
import JsonLd, { SITE } from "./components/JsonLd";
import ItemCard from "./components/shop/ItemCard";
import ListsProvider from "./components/shop/ListsProvider";
import ListsTeaser from "./components/shop/ListsTeaser";
import SaveBar from "./components/shop/SaveBar";
import Saver from "./components/shop/Saver";
import { KitCard, LaneTile } from "./components/shop/Tiles";
import { GoodToKnow } from "./components/stockup/ui";
import { POPULAR, kitBySlug, kits, kitsForMonth } from "./lib/shop/kits";
import { lanes } from "./lib/shop/lanes";
import { EXAMPLES } from "./lib/shop/search";
import { itemById } from "./lib/stockup/catalog";

// Home: one question, a search box, then ways in (kits for this month,
// popular kits, sixteen lanes), the visitor's lists, and the products we checked.
// Rebuilt daily so the seasonal kits follow the month.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: "PleaseBeReady: shopping lists for whatever is coming" },
  description:
    "Search what you need to be ready for, from a power outage or winter storm to a new puppy or a party for 20. Ready-made kits with amounts for your group, Amazon links, and lists saved on your device.",
  alternates: { canonical: "/" },
};

const ESSENTIALS = ["weather-radio", "headlamps", "power-bank", "first-aid-kit"];
const chip = "inline-flex min-h-10 items-center rounded-full border border-[#26324c] bg-[#141d2e] px-3 text-sm font-bold text-[#e8edf5] transition hover:border-[#34D399]";

export default function Home() {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const monthName = now.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const seasonal = kitsForMonth(month).sort((a, b) => (a.months?.length ?? 12) - (b.months?.length ?? 12)).slice(0, 6);
  const popular = POPULAR.filter((s) => !seasonal.some((k) => k.slug === s)).map((s) => kitBySlug(s)!).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-12">
        <ListsProvider>
          <Saver>
            <section className="mb-10">
              <h1 className="text-3xl font-black leading-tight sm:text-5xl">What do you want to be ready for?</h1>
              <form action="/search" method="get" role="search" className="mt-5 flex gap-2">
                <label htmlFor="home-q" className="sr-only">What do you want to be ready for?</label>
                <input id="home-q" name="q" type="search" enterKeyHint="search" autoComplete="off" placeholder="Winter storm, new puppy, party for 20…"
                  className="h-14 min-w-0 flex-1 rounded-xl border border-[#26324c] bg-[#0c1220] px-4 text-base font-bold text-[#e8edf5]" />
                <button type="submit" className="h-14 shrink-0 rounded-xl border border-[#34D399] bg-[#34D399] px-5 text-base font-black text-[#0b1220]">Search</button>
              </form>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Example searches">
                {EXAMPLES.slice(0, 6).map((e) => (
                  <li key={e}><Link href={`/search?q=${encodeURIComponent(e)}`} className={chip}>{e}</Link></li>
                ))}
              </ul>
            </section>

            {seasonal.length > 0 && (
              <section aria-labelledby="season-title" className="mb-10">
                <h2 id="season-title" className="mb-3 text-xl font-black">Ready for {monthName}</h2>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{seasonal.map((k) => <li key={k.slug}><KitCard kit={k} /></li>)}</ul>
              </section>
            )}

            <section aria-labelledby="popular-title" className="mb-10">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 id="popular-title" className="text-xl font-black">Popular kits</h2>
                <Link href="/kits" className="text-sm font-black pbr-accent">All {kits.length} kits →</Link>
              </div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">{popular.map((k) => <li key={k.slug}><KitCard kit={k} /></li>)}</ul>
            </section>

            <section aria-labelledby="lanes-title" className="mb-10">
              <h2 id="lanes-title" className="mb-3 text-xl font-black">Shop by need</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{lanes.map((l) => <li key={l.id}><LaneTile lane={l} /></li>)}</ul>
            </section>

            <div className="mb-10"><ListsTeaser /></div>

            <section aria-labelledby="checked-title" className="mb-10">
              <h2 id="checked-title" className="mb-1 text-xl font-black">Products we checked</h2>
              <p className="mb-4 text-xs font-semibold leading-5 text-[#94a3b8]">
                Exact products for a few basics. Everything else opens an Amazon search, so you pick the size and brand.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">{ESSENTIALS.map((id) => <ItemCard key={id} item={itemById(id)!} />)}</ul>
              <div className="mt-4"><GoodToKnow /></div>
            </section>

            <nav aria-label="More from PleaseBeReady" className="mb-10 flex flex-col gap-2">
              {[
                { href: "/guides", text: "📖 Guides: how much to buy, how to store it" },
                { href: "/checklist", text: "✅ Emergency checklist: eleven areas with official guide links" },
                { href: "/today", text: "📅 Daily Readiness Check: one small task a day" },
                { href: "/books", text: "📚 Preparedness Bookshelf" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#26324c] bg-[#141d2e] px-4 py-3 text-sm font-black text-[#e8edf5] transition hover:border-[#34D399]">
                  <span>{l.text}</span><span aria-hidden className="pbr-accent">→</span>
                </Link>
              ))}
            </nav>

            <SaveBar />
          </Saver>
        </ListsProvider>

        <div className="pt-6 text-center">
          <p className="mx-auto max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            General preparedness information, not professional or medical advice. In any emergency, call your local
            emergency number and follow official guidance from local authorities.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            As an Amazon Associate, PleaseBeReady earns from qualifying purchases.
          </p>
        </div>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", name: "PleaseBeReady", url: SITE, potentialAction: { "@type": "SearchAction", target: `${SITE}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } },
          { "@type": "Organization", name: "PleaseBeReady", url: SITE, parentOrganization: { "@type": "Organization", name: "Open Mirror LLC", url: "https://openmirrorllc.com" } },
        ],
      }} />
    </main>
  );
}
