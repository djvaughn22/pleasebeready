import type { MetadataRoute } from "next";
import { guides } from "./lib/shop/guides";
import { kits } from "./lib/shop/kits";
import { lanes } from "./lib/shop/lanes";

const BASE = "https://pleasebeready.com";

// The public pages only. Search results and ?start=/#plan= links are views of
// other pages, so they are not listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/kits", "/shop", "/guides", "/lists", "/checklist", "/today", "/books", "/about"];
  return [
    ...pages.map((path) => ({ url: `${BASE}${path}` })),
    ...kits.map((k) => ({ url: `${BASE}/kits/${k.slug}` })),
    ...lanes.map((l) => ({ url: `${BASE}/shop/${l.id}` })),
    ...guides.map((g) => ({ url: `${BASE}/guides/${g.slug}` })),
  ];
}
