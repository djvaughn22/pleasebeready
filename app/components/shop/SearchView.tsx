"use client";

// The search page: the best kit for the words typed (with any numbers carried
// into its link), then matching lanes and products. Results update as you type;
// the address keeps the search so it can be shared or reloaded.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { measure } from "../../lib/measure";
import { POPULAR, kitBySlug } from "../../lib/shop/kits";
import { EXAMPLES, kitHref, parseIntent, searchItems, searchKits, searchLanes } from "../../lib/shop/search";
import { durationLabel } from "../../lib/stockup/calc";
import { inset, muted } from "../stockup/ui";
import ItemCard from "./ItemCard";
import ListsProvider from "./ListsProvider";
import SaveBar from "./SaveBar";
import Saver from "./Saver";
import { KitCard } from "./Tiles";

export default function SearchView() {
  return (
    <ListsProvider>
      <Saver>
        <SearchBody />
        <SaveBar />
      </Saver>
    </ListsProvider>
  );
}

function SearchBody() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const counted = useRef<string | null>(null);

  const intent = useMemo(() => parseIntent(q), [q]);
  const kitsFound = useMemo(() => searchKits(q), [q]);
  const lanesFound = useMemo(() => searchLanes(q).slice(0, 4), [q]);
  const items = useMemo(() => searchItems(q, 30), [q]);
  const top = kitsFound[0];

  // Count a search once per submitted phrase: the top kit's slug, or whether only items matched. Never the words.
  const count = (text: string) => {
    if (!text.trim() || counted.current === text) return;
    counted.current = text;
    const k = searchKits(text)[0];
    measure("search", k ? `kit-${k.slug}` : searchItems(text, 1).length ? "items-only" : "none");
  };
  useEffect(() => { if (initial) count(initial); }, [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search", { scroll: false });
    count(q.trim());
  };

  const numbers = [
    intent.people ? `${intent.people} ${intent.people === 1 ? "person" : "people"}` : "",
    intent.kids ? `${intent.kids} kids` : "",
    intent.pets ? `${intent.pets} ${intent.pets === 1 ? "pet" : "pets"}` : "",
    intent.days ? durationLabel(intent.days) : "",
  ].filter(Boolean);

  return (
    <div className="pbr-planner flex flex-col gap-8">
      <form role="search" onSubmit={submit} className="flex gap-2">
        <label htmlFor="search-q" className="sr-only">What do you want to be ready for?</label>
        <input id="search-q" type="search" name="q" enterKeyHint="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Try: winter storm, new puppy, party for 20"
          className="h-14 min-w-0 flex-1 rounded-xl border border-[#26324c] bg-[#0c1220] px-4 text-base font-bold text-[#e8edf5]" />
        <button type="submit" className="h-14 shrink-0 rounded-xl border border-[#34D399] bg-[#34D399] px-5 text-base font-black text-[#0b1220]">Search</button>
      </form>

      {!q.trim() && (
        <section aria-labelledby="try-title">
          <h2 id="try-title" className="mb-3 text-lg font-black">Try one of these</h2>
          <ul className="flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <li key={e}><button type="button" onClick={() => { setQ(e); router.replace(`/search?q=${encodeURIComponent(e)}`, { scroll: false }); count(e); }}
                className="min-h-10 rounded-full border border-[#26324c] bg-[#141d2e] px-3 text-sm font-bold text-[#e8edf5] hover:border-[#34D399]">{e}</button></li>
            ))}
          </ul>
        </section>
      )}

      {top && (
        <section aria-labelledby="best-title" className="flex flex-col gap-3">
          <h2 id="best-title" className="text-lg font-black">Best match</h2>
          <Link href={kitHref(top, intent)} className="flex items-start gap-3 rounded-2xl border-2 border-[#34D399] bg-[#141d2e] p-5 transition hover:brightness-110">
            <span aria-hidden className="text-3xl leading-none">{top.emoji}</span>
            <span className="min-w-0">
              <span className="block text-xl font-black leading-snug text-[#e8edf5]">{top.title}</span>
              <span className="mt-1 block text-sm font-semibold leading-6 text-[#94a3b8]">{top.intro}</span>
              <span className="mt-2 block text-sm font-black pbr-accent">
                Open the kit{numbers.length ? ` for ${numbers.join(", ")}` : ""} →
              </span>
            </span>
          </Link>
          {kitsFound.length > 1 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {kitsFound.slice(1, 5).map((k) => <li key={k.slug}><KitCard kit={k} /></li>)}
            </ul>
          )}
        </section>
      )}

      {lanesFound.length > 0 && q.trim() && (
        <nav aria-label="Matching lanes" className="flex flex-wrap gap-2">
          {lanesFound.map((l) => (
            <Link key={l.id} href={`/shop/${l.id}`} className="min-h-10 rounded-full border border-[#26324c] px-3 py-2 text-sm font-black text-[#e8edf5] hover:border-[#34D399]">
              {l.emoji} {l.title} →
            </Link>
          ))}
        </nav>
      )}

      {q.trim() && items.length > 0 && (
        <section aria-labelledby="items-title">
          <h2 id="items-title" className="mb-3 text-lg font-black">Products <span className="text-sm text-[#94a3b8]">({items.length})</span></h2>
          <ul className="grid gap-3 sm:grid-cols-2">{items.map((i) => <ItemCard key={i.id} item={i} />)}</ul>
        </section>
      )}

      {q.trim() && !top && items.length === 0 && (
        <section className={`${inset} flex flex-col gap-3 p-5`}>
          <p className="text-base font-black">Nothing matched “{q.trim()}”.</p>
          <p className={muted}>Try a shorter word, or start from one of these kits.</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {POPULAR.map((s) => kitBySlug(s)!).map((k) => <li key={k.slug}><KitCard kit={k} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
