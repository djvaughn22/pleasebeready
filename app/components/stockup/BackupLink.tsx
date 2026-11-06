// The way out beside an exact product: other products we checked for the same
// item, and a labelled Amazon search for when it's sold out or not right. The
// site can't see Amazon's live stock, so this is always there. Counted through
// the site's GA listener as shop_click, with -b- in the label.

import { amazonUrl } from "../../lib/gear";
import { picksFor, roleText } from "../../lib/shop/picks";
import { backupLink } from "../../lib/stockup/shop";
import type { CatalogItem } from "../../lib/stockup/types";

const quiet = "inline-flex min-h-6 items-center text-xs font-bold text-[#94a3b8] underline decoration-[#26324c] underline-offset-2 hover:text-[#e8edf5] print:hidden";

/** "Sold out? Search “aa batteries 48 pack” ↗". `short` drops the words, for tiles. Nothing when the main button is already a search. */
export default function BackupLink({ item, short }: { item: CatalogItem; short?: boolean }) {
  const b = backupLink(item);
  if (!b) return null;
  return (
    <a href={b.url} target="_blank" rel="noopener noreferrer sponsored"
      data-measure="shop" data-measure-label={`${item.cat}-b-${item.id}`}
      aria-label={`Sold out or not right? Search Amazon for ${b.q} (search results, opens in a new tab)`}
      className={quiet}>
      {short ? "Sold out? Search ↗" : `Sold out? Search “${b.q}” ↗`}
    </a>
  );
}

/** Every other choice for an item, short enough for a list row: role links, then the search. */
export function MoreChoices({ item }: { item: CatalogItem }) {
  const others = picksFor(item.id).slice(1);
  return (
    <div className="flex flex-wrap items-center gap-x-3 print:hidden">
      {others.map((o) => (
        <a key={o.asin} href={amazonUrl(o.asin)} target="_blank" rel="noopener noreferrer sponsored"
          data-measure="shop" data-measure-label={`${item.cat}-${o.role}-${item.id}`} title={o.name}
          aria-label={`${roleText[o.role]}: ${o.name} on Amazon (opens in a new tab)`}
          className="inline-flex min-h-6 items-center text-xs font-black pbr-blue hover:underline">
          {roleText[o.role]} ↗
        </a>
      ))}
      <BackupLink item={item} />
    </div>
  );
}
