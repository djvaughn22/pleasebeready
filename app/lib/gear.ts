// PleaseBeReady gear — single source for Amazon affiliate linking.
// Every ASIN here must be TITLE-VERIFIED against the live amazon.com/dp page
// before shipping (curl the page, check <title> matches the product — an
// HTTP 200 alone is NOT verification; stale listings get hijacked).

// Amazon Associates tag (Open Mirror LLC account). NEXT_PUBLIC_AMAZON_TAG overrides.
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "pleasebeready-20";

export const amazonUrl = (asin: string) =>
  `https://www.amazon.com/dp/${asin}${AMAZON_TAG ? `?tag=${AMAZON_TAG}` : ""}`;

export type GearItem = { name: string; asin: string };

/** A tagged Amazon search, for items with no title-verified product yet. */
export const amazonSearchUrl = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query).replace(/%20/g, "+")}${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ""}`;
