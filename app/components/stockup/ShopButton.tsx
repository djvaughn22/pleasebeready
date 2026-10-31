// The Amazon button for one item: our exact product when there is one
// ("Shop on Amazon", solid), otherwise a tagged Amazon search ("Search Amazon",
// outlined, so the two never look alike). Counted through the site's GA
// listener as shop_click.

import { shopLink } from "../../lib/stockup/shop";
import type { CatalogItem } from "../../lib/stockup/types";
import { btnSmall } from "./ui";

export default function ShopButton({ item, big }: { item: CatalogItem; big?: boolean }) {
  if (item.kind === "task") return null;
  const link = shopLink(item);
  const exact = link.kind === "product";
  const text = exact ? "Shop on Amazon" : "Search Amazon";
  const look = exact
    ? "border-[#34D399] bg-[#34D399] text-[#0b1220]"
    : "border-[#34D399] bg-transparent pbr-accent";
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer sponsored"
      data-measure="shop" data-measure-label={`${item.cat}-${exact ? "p" : "s"}-${item.id}`}
      title={exact ? link.label : `${link.label}: search results, not one chosen product`}
      aria-label={`${text}: ${exact ? link.label : item.name} (${exact ? "product page" : "search results"}, opens in a new tab)`}
      style={{ borderColor: "#34D399" }}
      className={big
        ? `inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-black transition hover:brightness-110 ${look}`
        : `${btnSmall} pbr-accent`}>
      {text}<span aria-hidden>↗</span>
    </a>
  );
}
