import type { Metadata } from "next";
import Link from "next/link";
import { Mark, Wordmark } from "./components/Brand";
import JsonLd, { SITE } from "./components/JsonLd";
import ListsProvider from "./components/shop/ListsProvider";
import ReadyCard from "./components/ready/ReadyCard";
import ListsTeaser from "./components/shop/ListsTeaser";
import TripPlanner from "./components/shop/TripPlanner";
import Saver from "./components/shop/Saver";
import SaveToast, { ListPicker } from "./components/shop/SaveBar";
import { FindsTabs } from "./components/shop/Store";
import { KitCard } from "./components/shop/Tiles";
import { activeDeals } from "./lib/shop/deals";
import { findsTabs } from "./lib/shop/finds";
import { guides } from "./lib/shop/guides";
import { POPULAR, WINTER_MONTHS, kitBySlug, kits, seasonalKits } from "./lib/shop/kits";
import { lanes } from "./lib/shop/lanes";
import { pickByAsin } from "./lib/shop/picks";

// Home: wordmark and search, then the trip planner (owner direction 2026-11-27, "the everyday shop"):
// what you're getting ready for (outage, water shutoff, boil-water notice, pantry, household supplies),
// a budget, what matters first, people and days, then what to check at home, what to buy this trip and
// what can wait, with a "Review my Amazon list" handoff. The full emergency checklists stay one tap away
// (the planner's links, the kits rail, /checklist). Then Get Ready (or Continue my plan). Then
// departments and products; the "Saving to" line sits above the products it saves. Ready Finds opens on
// Essentials (what a household should stock first, in the shared order from
// lib/shop/priority.ts), then New, Everyday, Budget picks, Upgrades, and
// Verified deals only when deals.ts has one. Then kits, the visitor's lists,
// this month. No product shows twice. Rebuilt daily so new and weekly finds,
// seasonal kits and deals follow the date.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: "PleaseBeReady" },
  description:
    "Plan what to buy for a power outage, water shutoff, boil-water notice, pantry restock or household supplies on your budget: real pack sizes, what to check at home first, and what can wait.",
  alternates: { canonical: "/" },
};

// Short names for the department tiles; lanes.ts keeps the full titles.
const SHORT: Record<string, string> = {
  emergency: "Emergency", "food-and-water": "Food & water", home: "Home", family: "Kids & family",
  "school-and-sports": "School & sports", pets: "Pets", car: "Car", travel: "Travel", outdoors: "Camping",
  parties: "Parties", health: "Health", caregiving: "Caregiving", seasonal: "Seasonal", moving: "Moving",
  tools: "Tools", everyday: "Everyday",
};

const rail = "-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0";

function Head({ id, title, href, more }: { id: string; title: string; href?: string; more?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 id={id} className="pbr-display text-xl font-black sm:text-2xl">{title}</h2>
      {href && <Link href={href} className="shrink-0 text-sm font-black pbr-accent">{more ?? "See all"} →</Link>}
    </div>
  );
}

export default function Home() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthName = now.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const month = now.getUTCMonth() + 1;
  const seasonal = seasonalKits(month);
  // November to February the storm and outage shelf comes first on the page.
  const winterFirst = WINTER_MONTHS.includes(month);
  const deals = activeDeals(today);
  const finds = findsTabs(now);
  const shown = new Set([...finds.essentials, ...finds.new, ...finds.everyday].map((p) => p.asin));

  const seasonShelf = (
            <section aria-labelledby="season-title" className="mb-10">
              <Head id="season-title" title={`Ready for ${monthName}`} href="/guides" more="Guides" />
              {seasonal.length > 0 && (
                <ul className={`${rail} mb-3`}>{seasonal.map((k) => <li key={k.slug} className="w-[11.5rem] shrink-0 snap-start"><KitCard kit={k} /></li>)}</ul>
              )}
              <ul className="flex flex-wrap gap-2">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#26324c] bg-[#141d2e] px-3 text-sm font-bold text-[#e8edf5]">
                      <span aria-hidden>{g.emoji}</span>{g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
  );

  return (
    <main className="min-h-screen bg-[#0b1220] text-[#e8edf5]">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6">
        <ListsProvider>
          <Saver>
            <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex shrink-0 items-center gap-2.5">
                <Mark size={40} />
                <Wordmark className="text-[1.75rem] leading-none sm:text-3xl" />
              </div>
              <form action="/search" method="get" role="search" className="flex flex-1 gap-2">
                <label htmlFor="home-q" className="sr-only">Search products and kits</label>
                <input id="home-q" name="q" type="search" enterKeyHint="search" autoComplete="off" placeholder="Search products and kits"
                  className="h-12 min-w-0 flex-1 rounded-xl border-2 border-[#26324c] bg-[#141d2e] px-4 text-base font-bold text-[#e8edf5]" />
                <button type="submit" aria-label="Search" className="pbr-edge h-12 shrink-0 rounded-xl border-2 bg-[#F97316] px-4 text-base font-black text-[#0b1220]">
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
                </button>
              </form>
            </header>
            <div className="mb-3"><TripPlanner /></div>
            <ReadyCard className="mb-3" />
            <Link href="/household-plan" className="mb-6 flex min-h-[3.75rem] items-center gap-3 rounded-2xl border-2 border-[#26324c] bg-[#141d2e] px-4 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-[#e8edf5]">📝 Household plan</span>
                <span className="block truncate text-xs font-bold text-[#94a3b8]">Who to call and where to meet.</span>
              </span>
              <span aria-hidden className="pbr-accent shrink-0 text-lg font-black">→</span>
            </Link>

            <nav aria-label="Departments" className="mb-8">
              <ul className={`${rail} sm:grid sm:grid-cols-8 sm:overflow-visible sm:pb-0`}>
                {lanes.map((l) => (
                  <li key={l.id} className="shrink-0 snap-start">
                    <Link href={`/shop/${l.id}`} style={{ background: `color-mix(in srgb, ${l.color} 20%, var(--om-surface))` }}
                      className="flex h-[5.5rem] w-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 text-center sm:h-24 sm:w-full">
                      <span aria-hidden className="text-3xl leading-none">{l.emoji}</span>
                      <span className="text-[0.72rem] font-black leading-tight text-[#e8edf5]">{SHORT[l.id] ?? l.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {winterFirst && seasonShelf}

            <section aria-labelledby="finds-title" className="mb-10">
              <Head id="finds-title" title="Ready Finds" href="/shop/emergency" more="Emergency store" />
              <ListPicker className="-mt-2 mb-2" />
              <FindsTabs tabs={[
                { key: "essentials", label: "Essentials", picks: finds.essentials },
                { key: "new", label: "New", picks: finds.new, tag: "New" },
                { key: "everyday", label: "Everyday", picks: finds.everyday },
                { key: "budget", label: "Budget picks", picks: finds.budget.filter((p) => !shown.has(p.asin)) },
                { key: "upgrade", label: "Upgrades", picks: finds.upgrade.filter((p) => !shown.has(p.asin)) },
                // Only discounts verified from an allowed source, with a date they end (deals.ts).
                { key: "deals", label: "Verified deals", picks: deals.map((d) => pickByAsin(d.asin)!) },
              ]} />
            </section>

            <section aria-labelledby="kits-title" className="mb-10">
              <Head id="kits-title" title="Shop by situation" href="/kits" more={`All ${kits.length}`} />
              <ul className={rail}>
                {POPULAR.map((s) => kitBySlug(s)!).map((k) => <li key={k.slug} className="w-[11.5rem] shrink-0 snap-start"><KitCard kit={k} /></li>)}
              </ul>
            </section>

            <div className="mb-10"><ListsTeaser /></div>

            {!winterFirst && seasonShelf}


            <SaveToast />
          </Saver>
        </ListsProvider>

        <div className="border-t border-[#26324c] pt-6 text-center">
          <p className="mx-auto max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            As an Amazon Associate, PleaseBeReady earns from qualifying purchases.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs font-semibold leading-6 text-[#94a3b8]">
            General preparedness information, not professional or medical advice. In any emergency, call your local
            emergency number and follow official guidance from local authorities.
          </p>
        </div>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", name: "PleaseBeReady", url: SITE, potentialAction: { "@type": "SearchAction", target: `${SITE}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } },
          { "@type": "Organization", name: "PleaseBeReady", url: SITE, logo: `${SITE}/icons/pbr-512.png`, parentOrganization: { "@type": "Organization", name: "Open Mirror LLC", url: "https://openmirrorllc.com" } },
        ],
      }} />
    </main>
  );
}
