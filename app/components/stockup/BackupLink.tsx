// The way out beside an exact product: the other products we checked for the
// same item, each with its own package count for the same amount, and a
// labelled Amazon search for similar ones. The site can't see Amazon's live
// stock, so this is always there. Nov 14 2026: "Sold out? Search" read as a
// stock warning on a phone, so it became "More options"; Nov 19 2026: "More
// options" didn't say it was a search, so it reads "Search similar". Counted
// through the site's GA listener as shop_click, with -b- in the label.

import { amazonUrl } from "../../lib/gear";
import { holdsText, offersFor, packText } from "../../lib/shop/offers";
import { picksFor, roleText } from "../../lib/shop/picks";
import { localNote } from "../../lib/shop/local";
import { backupLink } from "../../lib/stockup/shop";
import type { CatalogItem } from "../../lib/stockup/types";

const quiet = "inline-flex min-h-6 items-center text-xs font-bold text-[#94a3b8] underline decoration-[#26324c] underline-offset-2 hover:text-[#e8edf5] print:hidden";

/** "Search similar: “aa batteries 48 pack” ↗". `short` drops the words, for tiles. Nothing when the main button is already a search. */
export default function BackupLink({ item, short }: { item: CatalogItem; short?: boolean }) {
  const b = backupLink(item);
  if (!b) return null;
  return (
    <a href={b.url} target="_blank" rel="noopener noreferrer sponsored"
      data-measure="shop" data-measure-label={`${item.cat}-b-${item.id}`}
      aria-label={`Search similar: Amazon search results for ${b.q} (opens in a new tab)`}
      className={quiet}>
      {short ? "Search similar ↗" : `Search similar: “${b.q}” ↗`}
    </a>
  );
}

/** The nearby-store line for an item and amount, when one helps (water, groceries, ice). */
export function LocalNote({ item, need }: { item: CatalogItem; need: number }) {
  const text = localNote(item.id, need);
  return text ? <p className="text-xs font-semibold leading-5 text-[#94a3b8]">{text}</p> : null;
}

/**
 * Every other choice for an item, named, with how many to buy for `need` (the same amount the line asks for),
 * then the search and the nearby-store line. `chosen`: the product the line opens now. `onChoose`: lets a
 * list swap to another product (undefined goes back to our pick); without it the choices are links only.
 */
export function MoreChoices({ item, need = 0, chosen, onChoose }: { item: CatalogItem; need?: number; chosen?: string; onChoose?: (asin: string | undefined) => void }) {
  const offers = offersFor(item.id, need, chosen).slice(1);
  const ours = picksFor(item.id)[0];
  return (
    <div className="flex flex-col gap-1.5 print:hidden">
      {offers.length > 0 && (
        <ul aria-label={`Other choices for ${item.name}`} className="flex flex-col gap-1.5">
          {offers.map((o) => {
            const label = o.pick === ours ? roleText.pick : roleText[o.pick.role];
            const holds = need > 0 ? holdsText(o, item) : "";
            return (
              <li key={o.pick.asin} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5">
                <a href={amazonUrl(o.pick.asin)} target="_blank" rel="noopener noreferrer sponsored"
                  data-measure="shop" data-measure-label={`${item.cat}-${o.pick.role}-${item.id}`}
                  aria-label={`${label}: ${o.pick.name}${need > 0 ? `, buy ${packText(o, item)}` : ""} on Amazon (opens in a new tab)`}
                  className="min-w-0 font-black text-[#e8edf5] underline decoration-[#26324c] underline-offset-2 hover:decoration-[#F97316]">
                  <span className="pbr-blue">{label}:</span> {o.pick.name}
                  {need > 0 && <span className="text-[#94a3b8]"> · buy {packText(o, item)}{holds ? ` (${holds})` : ""}</span>} ↗
                </a>
                {onChoose && (
                  <button type="button" onClick={() => onChoose(o.pick === ours ? undefined : o.pick.asin)}
                    className="inline-flex min-h-8 items-center rounded-lg border border-[#26324c] px-2 text-[0.7rem] font-black text-[#e8edf5] hover:border-[#F97316]">
                    {o.pick === ours ? "Back to our pick" : "Use this one"}<span className="sr-only">: {o.pick.name}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-x-3"><BackupLink item={item} /></div>
      <LocalNote item={item} need={need} />
    </div>
  );
}
