"use client";

// "Review my Amazon list": this trip's products for Amazon with the exact package count of each and
// one link per product, then what stays on the local list, then download or copy. Every link is one
// tap by the shopper: nothing opens by itself, nothing is added in the background, and opening a
// link never marks anything bought. The one-link cart button exists only for a preview test flag
// (lib/shop/amazonCart.ts says why it's off).

import { useState } from "react";
import { amazonList, cartUrl } from "../../lib/shop/amazonCart";
import { measure } from "../../lib/measure";
import { packWords, type TripPlan } from "../../lib/shop/trip";
import { tripText } from "../../lib/shop/tripText";
import { backupLink } from "../../lib/stockup/shop";
import { btn, btnPrimary, inset, muted } from "../stockup/ui";

export const NOTICE = "As an Amazon Associate, PleaseBeReady earns from qualifying purchases.";

/** Save the plain list as a text file. */
export function downloadText(text: string, name = "pleasebeready-shopping-list.txt") {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function ListButtons({ plan }: { plan: TripPlan }) {
  const [said, setSaid] = useState("");
  const copy = async () => {
    try { await navigator.clipboard.writeText(tripText(plan)); setSaid("Copied. Paste it into notes or a text."); }
    catch { setSaid("Copy didn’t work in this browser. Try Download list."); }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => { downloadText(tripText(plan)); measure("trip_download", plan.ask.for); setSaid("Saved as a text file."); }}>Download list</button>
        <button type="button" className={btn} onClick={copy}>Copy list</button>
      </div>
      {said && <p role="status" className={muted}>{said}</p>}
    </div>
  );
}

export default function TripAmazon({ plan, cart }: { plan: TripPlan; cart: boolean }) {
  const list = amazonList(plan);
  const url = cart ? cartUrl(list.cart) : null;
  const byKey = new Map(plan.rows.map((r) => [r.key, r]));
  return (
    <section id="amazon-list" aria-labelledby="amazon-list-title" className={`${inset} mt-3 px-4 py-4`}>
      <h3 id="amazon-list-title" className="text-base font-black">Your Amazon list</h3>
      {list.lines.length ? (
        <p className={`${muted} mt-1`}>
          {list.lines.length} {list.lines.length === 1 ? "product" : "products"} · {list.packs.toLocaleString("en-US")} {list.packs === 1 ? "package" : "packages"}.
          Each link opens one product. Set the quantity shown on Amazon, then add it to your cart there.
        </p>
      ) : <p className={`${muted} mt-1`}>Nothing for Amazon this trip.</p>}

      {list.lines.length > 0 && (
        <ol className="mt-3 divide-y divide-[var(--om-border)]">
          {list.lines.map((l) => {
            const first = byKey.get(l.rows[0])!;
            const backup = backupLink(first.item);
            return (
              <li key={l.asin} className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black leading-snug"><span className="pbr-accent">Qty {l.qty.toLocaleString("en-US")}</span> · {l.words}</p>
                  <p className="text-sm font-bold leading-snug text-[#e8edf5]">{l.name}</p>
                  {l.rows.length > 1 && <p className={muted}>One product for {l.rows.map((k) => byKey.get(k)?.label ?? k).join(" and ").toLowerCase()}</p>}
                  {backup && (
                    <a href={backup.url} target="_blank" rel="noopener noreferrer sponsored" data-measure="shop" data-measure-label={`trip-s-${first.item.id}`}
                      className="inline-flex min-h-10 items-center text-xs font-bold text-[#94a3b8] underline">Sold out? Search similar: “{backup.q}”</a>
                  )}
                </div>
                <a href={l.url} target="_blank" rel="noopener noreferrer sponsored" data-measure="shop" data-measure-label={`trip-p-${first.item.id}`}
                  aria-label={`Open on Amazon: ${l.name}, quantity ${l.qty} (opens in a new tab)`}
                  className="pbr-edge inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 bg-[#F97316] px-4 text-sm font-black text-[#0b1220] sm:w-44">
                  Open on Amazon <span aria-hidden>↗</span>
                </a>
              </li>
            );
          })}
        </ol>
      )}

      {list.local.length > 0 && (
        <div className="mt-3 border-t border-[#26324c] pt-3">
          <h4 className="text-sm font-black">On your local list</h4>
          <ul className="mt-1 flex flex-col gap-1">
            {list.local.map((r) => (
              <li key={r.key} className="text-sm font-bold leading-snug">
                {r.label}: {packWords(r, r.now)}
                <span className="block text-xs font-semibold text-[#94a3b8]">{r.localOnly ? "No exact product from us yet. " : ""}{r.nearby ?? "Any store."}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4"><ListButtons plan={plan} /></div>

      {url && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-[#26324c] px-3 py-3">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-[#94a3b8]">Preview test only</p>
          <a href={url} target="_blank" rel="noopener noreferrer sponsored" onClick={() => measure("trip_cart_test", plan.ask.for)} className={`${btnPrimary} mt-2 min-h-12 w-full text-base sm:w-auto`}>
            Add this trip to Amazon cart <span aria-hidden>↗</span>
          </a>
          <p className={`${muted} mt-1`}>{NOTICE}</p>
          <p className={`${muted} mt-1`}>
            One link with {list.cart.length} {list.cart.length === 1 ? "product" : "products"} and their quantities. Amazon may ask you to sign in or confirm first. Nothing is ordered.
            Amazon no longer documents this link, so check every title and quantity on Amazon’s screen.
          </p>
          {list.overflow.length > 0 && <p className={`${muted} mt-1`}>{list.overflow.length} more {list.overflow.length === 1 ? "product is" : "products are"} past what one link carries. Open {list.overflow.length === 1 ? "it" : "them"} from the list above.</p>}
        </div>
      )}

      <p className={`${muted} mt-4`}>
        {NOTICE} We can’t see Amazon’s prices or stock, and grocery listings can depend on your delivery area. If one is out, use the search link under it or buy it nearby.
      </p>
    </section>
  );
}
