// The buy link for one item: the verified Amazon product when there is one
// ("Buy on Amazon"), otherwise a tagged Amazon search ("Find on Amazon").
// Counted through the site's GA listener as shop_click.

import { shopLink } from "../../lib/stockup/shop";
import type { CatalogItem } from "../../lib/stockup/types";
import { btnSmall } from "./ui";

export default function ShopButton({ item, big }: { item: CatalogItem; big?: boolean }) {
  if (item.kind === "task") return null;
  const link = shopLink(item);
  const text = link.kind === "product" ? "Buy on Amazon" : "Find on Amazon";
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer sponsored"
      data-measure="shop" data-measure-label={`${item.cat}-${link.kind === "product" ? "p" : "s"}-${item.id}`}
      title={link.kind === "product" ? link.label : `${link.label}: search results, not one chosen product`}
      aria-label={`${text}: ${item.name} (${link.kind === "product" ? "product page" : "search results"}, opens in a new tab)`}
      className={big
        ? "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#34D399] bg-[#34D399] px-4 py-2 text-sm font-black text-[#0b1220] transition hover:brightness-110"
        : `${btnSmall} pbr-accent`}>
      {text}<span aria-hidden>↗</span>
    </a>
  );
}
