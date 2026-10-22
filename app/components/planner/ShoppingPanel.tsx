"use client";

// Step 5: shopping. Three scopes (one lane, the full list, or the visitor's
// picks) and one honest action: open a product's Amazon page, one at a time.
//
// What this panel never does: build an Amazon cart, claim items are in a cart,
// show an Amazon price or stock, or take payment. The "shopping run" is a
// staged list: each button opens one product page in a new tab, and the panel
// keeps track of which ones you have opened. Checkout happens on Amazon only.

import { useMemo, useState } from "react";
import { formatMoney, formatQuantity } from "../../lib/planner/calc";
import { buckets } from "../../lib/planner/catalog";
import {
  CART_FORM_ENABLED, cartFormUrl, linesTotal, listText, shoppingLines, unpricedCount, type ShopLine, type ShopScope,
} from "../../lib/planner/shopping";
import { AMAZON_DISCLOSURE } from "../../lib/bookLinks";
import type { BucketId, ResolvedItem } from "../../lib/planner/types";
import type { Planner } from "./usePlanner";
import { buttonBase, card, input, inset, label, Money, Section } from "./ui";

export type ShopMode = "plan" | "bucket" | "picks";
export type ShopState = { mode: ShopMode; bucket: BucketId; onlyNeeded: boolean };
export const defaultShop: ShopState = { mode: "plan", bucket: "water", onlyNeeded: true };

type ProductLine = ShopLine & { product: NonNullable<ShopLine["product"]> };

export default function ShoppingPanel({ p, resolved, heading, shop, setShop }: {
  p: Planner; resolved: ResolvedItem[]; heading: string; shop: ShopState; setShop: (s: ShopState) => void;
}) {
  const { mode, bucket, onlyNeeded } = shop;
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState<"" | "yes" | "no">("");

  const scope: ShopScope = mode === "picks" ? { mode } : mode === "bucket" ? { mode, bucket, onlyNeeded } : { mode, onlyNeeded };
  const lines = useMemo(() => shoppingLines(resolved, p.state, scope),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolved, p.state, mode, bucket, onlyNeeded]);
  const productLines = lines.filter((l): l is ProductLine => !!l.product);
  const otherLines = lines.filter((l) => !l.product);
  const total = linesTotal(lines);
  const openedCount = productLines.filter((l) => opened.has(l.itemId)).length;
  const next = productLines.find((l) => !opened.has(l.itemId));
  const scopeName = mode === "plan" ? "Full list, all lanes" : mode === "picks" ? "My picks" : buckets.find((b) => b.id === bucket)!.title;
  const cartUrl = CART_FORM_ENABLED ? cartFormUrl(lines) : null;
  const title = `${heading} - ${scopeName}${mode !== "picks" && onlyNeeded ? " (still needed)" : ""}`;

  const markOpened = (id: string) => setOpened((s) => new Set(s).add(id));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(listText(lines, title));
      setCopied("yes");
    } catch {
      setCopied("no");
    }
  };

  const modes: { value: ShopMode; text: string; note: string }[] = [
    { value: "plan", text: "Full list", note: "Every lane together." },
    { value: "bucket", text: "One lane", note: "Water, food, light and power, and so on." },
    { value: "picks", text: "My picks", note: `Products you ticked (${p.state.picks.length}).` },
  ];

  return (
    <Section id="shopping" step={5} title="Shopping"
      intro="Pick what to shop for. Nothing leaves this page until you press an Amazon button, and each button opens one product page.">
      <div className={`${card} p-5 sm:p-6`}>
        <fieldset>
          <legend className={label}>What to shop for</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="What to shop for">
            {modes.map((m) => {
              const on = mode === m.value;
              return (
                <label key={m.value}
                  className={`flex min-h-11 cursor-pointer flex-col rounded-xl border px-3 py-2.5 ${on ? "border-[#34D399] bg-[#1c2740]" : "border-[#26324c] bg-[#0c1220]"}`}
                  style={on ? { boxShadow: "inset 0 0 0 1px #34D399" } : undefined}>
                  <input type="radio" name="shop-mode" className="sr-only" checked={on} onChange={() => setShop({ ...shop, mode: m.value })} />
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
              <label htmlFor="shop-bucket" className={label}>Lane</label>
              <select id="shop-bucket" value={bucket} onChange={(e) => setShop({ ...shop, bucket: e.target.value as BucketId })} className={`${input} pr-8`}>
                {buckets.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
          )}
          {mode !== "picks" && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={onlyNeeded} onChange={(e) => setShop({ ...shop, onlyNeeded: e.target.checked })}
                className="h-4 w-4" style={{ accentColor: "#34D399" }} />
              Only what I still need
            </label>
          )}
        </div>
        {mode === "picks" && p.state.picks.length === 0 && (
          <p className="mt-3 text-sm font-semibold leading-6 text-[#94a3b8]">
            No picks yet. Tick “Add to my picks for shopping” under a product in the checklist.
          </p>
        )}

        {/* What will happen, before anything is sent. */}
        <div className={`${inset} mt-5 p-4`} role="region" aria-label="What the shopping buttons do" aria-live="polite">
          <h3 className="text-base font-black">{scopeName}: what happens when you shop</h3>
          <ul className="mt-2 list-disc pl-5 text-sm font-semibold leading-6 pbr-body">
            <li>
              {productLines.length === 0
                ? "There are no example products for this list."
                : `This list has ${productLines.length} example ${productLines.length === 1 ? "product" : "products"} on Amazon${otherLines.length > 0 ? `, and ${otherLines.length} more ${otherLines.length === 1 ? "item" : "items"} you can buy anywhere` : ""}.`}
            </li>
            <li>Each Amazon button opens one product page in a new tab. We cannot add a whole list to your Amazon cart from here, so nothing is added automatically.</li>
            <li>On Amazon you choose the size and see the current price. The price at Amazon&apos;s checkout may differ from any price you entered here.</li>
            <li>You check out on Amazon, never on PleaseBeReady.</li>
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-black">{scopeName}</h3>
          <p className="text-sm font-bold" aria-live="polite">
            {lines.length} {lines.length === 1 ? "item" : "items"} ·{" "}
            {total > 0 ? <>your prices <Money>{formatMoney(total)}</Money>{unpricedCount(lines) > 0 && `, ${unpricedCount(lines)} without a price`}</> : "no prices entered"}
          </p>
        </div>

        {lines.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-[#94a3b8]">Nothing to list here.</p>
        ) : (
          <>
            {productLines.length > 0 && (
              <div className="mt-3 print:hidden">
                <p className="text-sm font-bold" role="status">
                  Shopping run: {openedCount} of {productLines.length} product pages opened
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {next ? (
                    <a href={next.product.url} target="_blank" rel="noopener noreferrer sponsored"
                      data-measure="gear" data-measure-label={next.product.asin}
                      onClick={() => markOpened(next.itemId)}
                      className={`${buttonBase} pbr-accent`}>
                      Open the next product on Amazon ↗
                    </a>
                  ) : (
                    <span className="inline-flex min-h-11 items-center text-sm font-black pbr-accent">All {productLines.length} opened</span>
                  )}
                  {openedCount > 0 && (
                    <button type="button" onClick={() => setOpened(new Set())} className={buttonBase}>Clear opened marks</button>
                  )}
                </div>
                {next && (
                  <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
                    Next: {next.product.name}, for {next.name}.
                  </p>
                )}
              </div>
            )}

            <ul className="mt-3 flex flex-col gap-2">
              {lines.map((l) => (
                <li key={l.itemId} className={`${inset} p-3`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="min-w-0 text-sm font-bold">
                      <span className="tabular-nums">{formatQuantity(l.toBuy, l.unit)}</span> · {l.name}
                    </span>
                    <span className="text-xs font-semibold text-[#94a3b8]">
                      {l.priced ? <>your price <Money>{formatMoney(l.cost)}</Money></> : "no price entered"}
                    </span>
                  </div>
                  {l.product ? (
                    <div className="mt-2 print:hidden">
                      <a href={l.product.url} target="_blank" rel="noopener noreferrer sponsored"
                        data-measure="gear" data-measure-label={l.product.asin}
                        onClick={() => markOpened(l.itemId)}
                        className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#26324c] bg-[#1c2740] px-3 py-2 text-sm font-bold text-[#e8edf5] transition hover:border-[#34D399]">
                        <span>{opened.has(l.itemId) && <span aria-hidden>✓ </span>}{l.product.name}</span>
                        <span className="pbr-accent" aria-hidden>↗ Amazon</span>
                      </a>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
                        {opened.has(l.itemId) ? "Opened. " : ""}
                        Opens this one product in a new tab; nothing is added to a cart.{" "}
                        {l.product.exactCount
                          ? `The product name states its pack size, so about ${l.product.units.toLocaleString("en-US")} of it covers this line. Check the listing.`
                          : "We do not know how much one package holds, so check the listing before counting it toward this line."}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8] print:hidden">
                      No example product for this one. Buy it from any store you like.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button type="button" onClick={copy} disabled={lines.length === 0} className={`${buttonBase} disabled:opacity-50`}>Copy this list</button>
          <button type="button" onClick={() => window.print()} className={buttonBase}>Print or save as PDF</button>
          <span role="status" className="self-center text-xs font-bold text-[#94a3b8]">
            {copied === "yes" ? "Copied." : copied === "no" ? "Could not copy. Select the list and copy it." : ""}
          </span>
        </div>

        <p className="mt-4 text-xs font-semibold leading-5 text-[#94a3b8]">
          These links may earn Open Mirror LLC a commission at no extra cost to you. {AMAZON_DISCLOSURE}
        </p>

        {cartUrl && (
          <div className={`${inset} mt-4 p-4`}>
            <p className="text-sm font-black">Review these on Amazon</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#94a3b8]">
              This opens Amazon in a new tab with these {productLines.length} products listed. You may need to sign in, and you decide there
              what to add to your Amazon cart. Nothing is bought on PleaseBeReady.
            </p>
            <a href={cartUrl} target="_blank" rel="noopener noreferrer sponsored" className={`${buttonBase} mt-3`}>
              Review on Amazon ↗
            </a>
          </div>
        )}

        <details className="mt-4 rounded-lg border border-[#26324c] print:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-black text-[#94a3b8] [&::-webkit-details-marker]:hidden">
            <span>Why is there no “add everything to cart” button?</span><span aria-hidden>▾</span>
          </summary>
          <p className="px-3 pb-3 text-xs font-semibold leading-6 text-[#94a3b8]">
            Amazon has an add-to-cart link format for several products at once, but its documentation for it has been moved, it sends
            signed-out shoppers to a sign-in page first, and we have not been able to confirm that our account may use it. Until we can,
            we use plain product links, a shopping run that opens one page at a time, and a list you can copy or print. Prices, stock and
            sizes on Amazon change, so we never show them here.
          </p>
        </details>
      </div>
    </Section>
  );
}
