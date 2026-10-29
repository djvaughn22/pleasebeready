import type { MetadataRoute } from "next";

// Crawlers may read every public page; the owner-only social desk and the
// API routes stay out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: "https://pleasebeready.com/sitemap.xml",
  };
}
