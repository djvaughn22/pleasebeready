// Structured data for search engines. Only facts the page itself shows: no
// prices, ratings or reviews.
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const SITE = "https://pleasebeready.com";

export const breadcrumbs = (trail: { name: string; path?: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, ...(t.path !== undefined ? { item: `${SITE}${t.path}` } : {}) })),
});
