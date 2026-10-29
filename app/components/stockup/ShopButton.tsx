// One "Shop" link per item: the verified Amazon product when there is one,
// otherwise a tagged Amazon search. Counted through the site's GA listener.

import { shopLink } from "../../lib/stockup/shop";
import type { CatalogItem } from "../../lib/stockup/types";
import { btnSmall } from "./ui";

export default function ShopButton({ item }: { item: CatalogItem }) {
  if (item.kind === "task") return null;
  const link = shopLink(item);
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer sponsored"
      data-measure="shop" data-measure-label={`${item.cat}-${link.kind === "product" ? "p" : "s"}-${item.id}`}
      title={link.kind === "product" ? link.label : `${link.label}: results, not one chosen product`}
      aria-label={`Shop ${item.name} on Amazon (${link.kind === "product" ? "product page" : "search results"}, opens in a new tab)`}
      className={`${btnSmall} pbr-accent`}>
      {link.kind === "product" ? "Shop" : "Search"}<span aria-hidden>↗</span>
    </a>
  );
}
