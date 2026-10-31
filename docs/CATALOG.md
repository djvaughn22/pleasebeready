# Catalog, kits, lanes and checked products (Oct 30, 2026)

How the shop's data fits together, how to add to it, and what is verified.

## Counts (from the code)

| Thing | Count | Where |
|---|---|---|
| Catalog entries | 1,052 (957 products, 95 things to do) | `app/lib/stockup/catalog.ts` + `data/*.ts` |
| Products with a checked Amazon product page | 22 | `app/lib/shop/picks.ts` (ASINs live in `app/lib/readiness.ts`) |
| Products that open a tagged Amazon search | the other 935, labelled "Find on Amazon" with the search words shown | `amazonSearchUrl()` in `app/lib/gear.ts` |
| Shopping lanes | 16 | `app/lib/shop/lanes.ts` |
| Kits | 31 | `app/lib/shop/kits.ts` |
| Guides | 7 | `app/lib/shop/guides.ts` |

Every link carries the `pleasebeready-20` tag. `npm test` checks the ids, the tag, the lanes (every product sits in at least one), the kits, the picks and the 12 example searches.

## How the pieces relate

- **Catalog item:** a type of thing (e.g. "Weather radio") with a planning rule for amounts, situations, priority and search words. One record, no copies.
- **Lane:** a rule over catalog fields (category, situation, who it's for, plus a few hand-picked ids). An item shows in every lane its fields match, so cross-listing never duplicates a record.
- **Kit:** a hand-picked list of catalog ids (must-haves, upgrades, cheaper swaps, easy to forget, things to do) with a starting group size and length. Amounts come from the catalog rules.
- **Pick:** one exact Amazon product for a catalog item, by ASIN, with our reason, a tier and the date of the last title check.
- **Guide:** sections that restate an official page in our words, each ending at a kit.

## Adding a checked product (the review workflow)

There is no authorized product feed yet (see below), so exact products are added by hand. A candidate becomes a pick only after a person checks it:

1. Pick the catalog item it fills (e.g. `lantern`).
2. Open the product on amazon.com while logged in to Associates and use **SiteStripe → Get link → Text**. Check that the page title is the exact product (brand, model, size), not just that the page loads; old listings get reused for other products.
3. Add the ASIN to that area's `gear` in `app/lib/readiness.ts` (or a level), then add a line to `app/lib/shop/picks.ts` with our own name, the catalog item id, a tier (`budget`, `standard`, `upgrade`), one plain reason, and `checked: "<today>"`.
4. Set `asin` on the catalog item. Run `npm test`.
5. Never copy prices, ratings, reviews or images from Amazon.

Re-check every pick by title on a schedule (quarterly, and before featuring one in a post). Update `checked` each time. If a title no longer matches, remove the ASIN; the item falls back to a search link.

**Not done on Oct 30:** a scripted title check of ~80 candidate products was blocked by the session's permission system, so no new picks were added and only 2 of the 22 were re-checked that day (Aqua-Tainer, Midland ER310). The other 20 were title-checked when added (the readiness.ts rule) but have no recorded date, so their `checked` is left blank rather than guessed.

## Amazon APIs and programs

- **Product Advertising API / Creators API:** returns titles, images and (time-stamped) prices for ASINs, which would allow automated title checks and real product images. Access depends on the Associates account's recent qualifying sales and needs DJ's keys in Vercel. Check eligibility in Associates Central before building anything on it.
- **Add-to-cart form:** Amazon documents a form that adds several ASINs to a visitor's cart in one step. It only works with exact products (22 today) and wasn't verified this session, so the site makes no combined-cart claim.
- **Influencer Program / Creator Connections:** both need an approved social account with an audience. Revisit once the profiles in `docs/social/` exist and have posting history.

## Adding a kit

Add an entry to `app/lib/shop/kits.ts` with catalog ids only. If an item is missing, add it to the catalog first (`data/*.ts`, line format in `data/parse.ts`) with the right situation codes. Write the intro in plain words; any safety point must already be in a catalog note or a guide with its source. Add search words people actually type, and months if it's seasonal. `npm test` checks the ids.

## Growing the catalog

Priorities for the next pass, most useful first:

1. Exact products for the most-clicked search items (from `shop_click` labels ending in `-s-…`), checked by the workflow above.
2. More kits where searches land on "items only" or "none" (the `search` event label).
3. More guides for kits that get visits but few saves.
