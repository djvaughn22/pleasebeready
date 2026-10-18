"use client";

// Step 5: shopping lists. Every Amazon link here is an individual, tagged
// product link from gear.ts. This page never builds a cart and never takes
// payment: checkout happens on Amazon, and the visitor chooses what to buy.

import { useMemo, useState } from "react";
import { formatEstimate, formatQuantity } from "../../lib/planner/calc";
import { buckets } from "../../lib/planner/catalog";
import {
  CART_FORM_ENABLED, cartFormUrl, linesTotal, listText, shoppingLines, type ShopLine, type ShopScope,
} from "../../lib/planner/shopping";
import { AMAZON_DISCLOSURE } from "../../lib/bookLinks";
import type { BucketId, ResolvedItem } from "../../lib/planner/types";
import type { Planner } from "./usePlanner";
import { A, buttonBase, card, input, inset, label, Money, Section } from "./ui";

type Mode = "plan" | "bucket" | "picks";

export default function ShoppingPanel({ p, resolved, heading }: {
  p: Planner; resolved: ResolvedItem[]; heading: string;
}) {
  const [mode, setMode] = useState<Mode>("plan");
  const [bucket, setBucket] = useState<BucketId>("water");
  const [onlyNeeded, setOnlyNeeded] = useState(true);
  const [copied, setCopied] = useState<"" | "yes" | "no">("");

  const scope: ShopScope = mode === "picks" ? { mode } : mode === "bucket" ? { mode, bucket, onlyNeeded } : { mode, onlyNeeded };
  const lines = useMemo(() => shoppingLines(resolved, p.state, scope),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolved, p.state, mode, bucket, onlyNeeded]);
  const withProduct = lines.filter((l): l is ShopLine & { product: NonNullable<ShopLine["product"]> } => !!l.product);
  const total = linesTotal(lines);
  const scopeName = mode === "plan" ? "Whole plan" : mode === "picks" ? "My picks" : buckets.find((b) => b.id === bucket)!.title;
  const cartUrl = CART_FORM_ENABLED ? cartFormUrl(lines) : null;
  const title = `${heading} - ${scopeName}${mode !== "picks" && onlyNeeded ? " (still needed)" : ""}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(listText(lines, title));
      setCopied("yes");
    } catch {
      setCopied("no");
    }
  };

  const modes: { value: Mode; text: string; note: string }[] = [
    { value: "plan", text: "Whole plan", note: "Every item in your plan." },
    { value: "bucket", text: "One bucket", note: "Shop one group at a time." },
    { value: "picks", text: "My picks", note: `Products you added (${p.state.picks.length}).` },
  ];

  return (
    <Section id="shopping" step={5} title="Shopping"
      intro="Build a list for the whole plan, one bucket, or only the products you pick. Copy or print it and shop anywhere. Amazon links are optional.">
      <div className={`${card} p-5 sm:p-6`}>
        <fieldset>
          <legend className={label}>What to list</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="What to list">
            {modes.map((m) => {
              const on = mode === m.value;
              return (
                <label key={m.value}
                  className={`flex min-h-11 cursor-pointer flex-col rounded-xl border px-3 py-2.5 ${on ? "border-[#34D399] bg-[#1c2740]" : "border-[#26324c] bg-[#0c1220]"}`}
                  style={on ? { boxShadow: `inset 0 0 0 1px ${A}` } : undefined}>
                  <input type="radio" name="shop-mode" className="sr-only" checked={on} onChange={() => setMode(m.value)} />
                  <span className="text-sm font-black text-[#e8edf5]">{on && <span aria-hidden>✓ </span>}{m.text}</span>
                  <span className="text-xs font-semibold leading-5 text-[#94a3b8]">{m.note}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          {mode === "bucket" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="shop-bucket" className={label}>Bucket</label>
              <select id="shop-bucket" value={bucket} onChange={(e) => setBucket(e.target.value as BucketId)} className={`${input} pr-8`}>
                {buckets.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
          )}
          {mode !== "picks" && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={onlyNeeded} onChange={(e) => setOnlyNeeded(e.target.checked)}
                className="h-4 w-4" style={{ accentColor: A }} />
              Only what I still need
            </label>
          )}
        </div>
        {mode === "picks" && p.state.picks.length === 0 && (
          <p className="mt-3 text-sm font-semibold leading-6 text-[#94a3b8]">
            No picks yet. Tick “Add to my picks for shopping” under a product in the checklist.
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-black">{scopeName}</h3>
          <p className="text-sm font-bold" aria-live="polite">
            {lines.length} {lines.length === 1 ? "item" : "items"} · about <Money>{formatEstimate(total)}</Money>
          </p>
        </div>

        {lines.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-[#94a3b8]">Nothing to list here.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {lines.map((l) => (
              <li key={l.itemId} className={`${inset} flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 py-2.5`}>
                <span className="min-w-0 text-sm font-bold">
                  <span className="tabular-nums">{formatQuantity(l.toBuy, l.unit)}</span> · {l.name}
                </span>
                {l.estCost > 0 && <span className="text-xs font-semibold text-[#94a3b8]">about <Money>{formatEstimate(l.estCost)}</Money></span>}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={copy} disabled={lines.length === 0} className={`${buttonBase} disabled:opacity-50`}>Copy this list</button>
          <button type="button" onClick={() => window.print()} className={buttonBase}>Print or save as PDF</button>
          <span role="status" className="self-center text-xs font-bold text-[#94a3b8]">
            {copied === "yes" ? "Copied." : copied === "no" ? "Could not copy. Select the list and copy it." : ""}
          </span>
        </div>

        <div className="mt-6 print:hidden">
          <h3 className="text-base font-black">Amazon links for this list</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#94a3b8]">
            These are optional example products. Each link opens one product on Amazon, where you choose the size and see the current price.
            This site cannot put a whole list into your Amazon cart, and you check out only on Amazon.
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
            These links may earn Open Mirror LLC a commission at no extra cost to you. {AMAZON_DISCLOSURE}
          </p>

          {withProduct.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-[#94a3b8]">No example products for this list. You can shop for these anywhere.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {withProduct.map((l) => (
                <li key={l.itemId} className={`${inset} p-3`}>
                  <p className="text-xs font-semibold leading-5 text-[#94a3b8]">
                    For: {l.name} · you need {formatQuantity(l.toBuy, l.unit)}
                  </p>
                  <a href={l.product.url} target="_blank" rel="noopener noreferrer sponsored"
                    data-measure="gear" data-measure-label={l.product.asin}
                    className="mt-1 inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#26324c] bg-[#1c2740] px-3 py-2 text-sm font-bold text-[#e8edf5] transition hover:border-[#34D399]">
                    <span>{l.product.name}</span><span className="pbr-accent" aria-hidden>↗ Amazon</span>
                  </a>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
                    {l.product.exactCount
                      ? `Based on the pack size, about ${l.product.units} of this product. Check the listing.`
                      : "We do not know how much one package holds. Check what is in it before you count it toward the list."}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {cartUrl && (
            <div className={`${inset} mt-4 p-4`}>
              <p className="text-sm font-black">Review these on Amazon</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
                This opens Amazon in a new tab with these {withProduct.length} products listed. You may need to sign in, and you decide there
                what to add to your Amazon cart. Nothing is bought on PleaseBeReady.
              </p>
              <a href={cartUrl} target="_blank" rel="noopener noreferrer sponsored" className={`${buttonBase} mt-3`}>
                Review on Amazon ↗
              </a>
            </div>
          )}

          <details className="mt-4 rounded-lg border border-[#26324c]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-black text-[#94a3b8] [&::-webkit-details-marker]:hidden">
              <span>Why is there no “add everything to cart” button?</span><span aria-hidden>▾</span>
            </summary>
            <p className="px-3 pb-3 text-xs font-semibold leading-6 text-[#94a3b8]">
              Amazon has an add-to-cart link format for several products at once, but its documentation for it has been moved, it sends
              signed-out shoppers to a sign-in page first, and we have not been able to confirm that our account may use it. Until we can,
              we use plain product links and a list you can copy or print. Prices, stock and sizes on Amazon change, so we never show them here.
            </p>
          </details>
        </div>
      </div>
    </Section>
  );
}
