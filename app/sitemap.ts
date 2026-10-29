import type { MetadataRoute } from "next";

const BASE = "https://pleasebeready.com";

// The public pages only. /planner?start=<situation> links are shares of the
// same page, so they are not listed separately.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/planner", "/today", "/books", "/about"].map((path) => ({ url: `${BASE}${path}` }));
}
