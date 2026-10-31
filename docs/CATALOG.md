# Catalog, kits, lanes and checked products (updated Oct 31, 2026)

How the shop's data fits together, how to add to it, and what is verified.

## Counts (from the code)

| Thing | Count | Where |
|---|---|---|
| Catalog entries | 1,052 (957 products, 95 things to do) | `app/lib/stockup/catalog.ts` + `data/*.ts` |
| Exact Amazon products | 204 ASINs (205 entries) for 194 catalog items: 192 "Our pick", 3 "Budget pick", 7 "Upgrade", 3 "Also good". Button: **Shop on Amazon** | `app/lib/shop/picks.ts`, the only place ASINs live |
| Products that open a tagged Amazon search | the other 763, button **Search Amazon** (outlined), with the search words shown | `amazonSearchUrl()` in `app/lib/gear.ts` |
| Shopping lanes | 16 | `app/lib/shop/lanes.ts` |
| Kits | 31 | `app/lib/shop/kits.ts` |
| Guides | 7 | `app/lib/shop/guides.ts` |

Every link carries the `pleasebeready-20` tag. `npm test` checks the ids, the tag, the lanes (every product sits in at least one), the kits, the picks and the 12 example searches.

## How the pieces relate

- **Catalog item:** a type of thing (e.g. "Weather radio") with a planning rule for amounts, situations, priority and search words. One record, no copies.
- **Lane:** a rule over catalog fields (category, situation, who it's for, plus a few hand-picked ids). An item shows in every lane its fields match, so cross-listing never duplicates a record.
- **Kit:** a hand-picked list of catalog ids (must-haves, upgrades, cheaper swaps, easy to forget, things to do) with a starting group size and length. Amounts come from the catalog rules.
- **Pick:** one exact Amazon product for a catalog item, by ASIN: a role (`pick`, `value`, `upgrade`, `alt`), our name for it, one plain reason, what it suits, how it was checked (`via`), the words that matched (`seen`, never shown) and the date (`checked`). Catalog items carry no ASIN; `shopLink()` uses an item's first pick, else a search. The checklist's gear lines (`readiness.ts`, `dailyReadiness.ts`) may only use ASINs that are in `picks.ts` (tested).
- **Guide:** sections that restate an official page in our words, each ending at a kit.

## Adding exact products (the review and import workflow)

There is no authorized product feed yet (see below), so exact products are reviewed by a person, in batches, and imported with `npm run picks`:

1. **Choose items.** Start with the searches people click most (`shop_click` labels with `-s-`), then kit must-haves that still open a search. A kit page's "At a glance" box shows 🛒 (exact) or 🔎 (search) for each must-have.
2. **Find and check the product.** Either way counts as evidence:
   - `via: "page"`: open the product on amazon.com logged in to Associates, use **SiteStripe → Get link → Text**, and compare the page title with brand, model and size.
   - `via: "search"`: a web search limited to amazon.com returns that ASIN's product page under the product's name.
   Copy the matching words into `seen`. A page that loads is not evidence: old listings get reused for other products. Never script loads of many Amazon pages (Amazon's terms forbid scraping, and this machine's permission system blocks it).
3. **Write the row** in a TSV (header: `item role asin name why use via seen checked`). `name` is ours (brand, model, size). `why` is one plain line under 90 characters with no "best", "#1", prices, "free", "sale", "deal" or "guarantee". If a maker's claim matters (a rating, "removes viruses"), say it is the maker's. `checked` is the day you checked (defaults to today).
4. **Import:** `npm run picks -- add rows.tsv --dry` to preview, then without `--dry`. It refuses an item that already has that role or ASIN. Then `npm test`, which checks the catalog ids, ASIN format, wording rules, duplicates and the tag.
5. Never copy prices, ratings, reviews or images from Amazon.

**Re-checks:** `npm run picks -- due` lists entries checked more than 90 days ago, with their product links. Re-check each by ASIN, update `checked`, and replace or delete any whose listing is gone or now sells something else; a deleted entry falls back to a labelled search. Re-check a product before featuring it in a post.

**Oct 30, 2026 batch:** 88 new entries, plus the 22 earlier ASINs re-checked, by `via: "search"` (2 by `via: "page"`). Three listings found unavailable were replaced (Mountain House 3-day kit, Augason Farms 30-day bucket, a 55-gallon barrel), and a gravity filter whose listing didn't say it removes germs was replaced by the LifeStraw Family purifier. Iodine tablets were left out: Ready.gov warns against relying on camping water treatments that aren't chlorine-based. 

**Oct 31, 2026 batch:** 95 new entries, each the first exact product for its item, all by `via: "search"` and dated 2026-10-31. Chosen from kit must-haves still on searches, so the popular kits are now mostly exact: Five-day emergency 16 of 18 must-haves and Power outage 11 of 13 (the other two are water and shelf food), Teen driver and Roadside all 11, New puppy 10 of 11, First apartment 14 of 15, Birthday party 5 of 15 (the rest is food and party supplies). Left on searches on purpose, with the reason:

- Groceries and perishables (water by the gallon, shelf food, juice boxes, chips, granola bars, pizza, buns, ice): the grocery listings checked (juice boxes, chips, granola bars) were resellers' bundles, unavailable, or mixed packs, and fresh food is a store trip anyway.
- Medicines you take (pain relievers, cold medicine, prescriptions) and sized items (diapers, bodysuits, clothes, shoes, work gloves): the right one depends on the person.
- Infant car seat, propane cylinders, grill tools: the listings found were marked unavailable. Calming aids for pets: a vet item, and the listings found were unavailable or discontinued.
- Unscented bleach: listings mix Performance, Germicidal and HE bleaches, and CDC's water amounts depend on the label's strength.
- Packing paper, mattress bags, dishes for one, safety glasses: the results showed no branded title to match, or the only match was a 20-pack sold for workplaces.
- Water purification tablets: Ready.gov warns against relying on camping water treatments that aren't chlorine-based.

At about 95 a session, 600 exact products is roughly four more batches.

**Oct 31, 2026 re-check of the home page's products:** the 34 exact products the home page can show (Emergency essentials, the New and this week's Everyday finds, every Budget pick and Upgrade) were searched again by ASIN on amazon.com. 32 matched their names. Two were fixed:

- `3-day-emergency-food-supply`: the Mountain House 3-day kit (B014ER40MS) and the other Mountain House 3-day listing (B0898QSCNG) both showed as currently unavailable, as did ReadyWise's 72-hour kit. Replaced by the Datrex 3600 3-day ration (B001CSAHW0), the same product as the car food-bar pick; the checklist gear lines follow.
- `personal-water-filter` upgrade (B00B1OSU4W): the listing now sells the Sawyer Squeeze SP302 with a 1-liter bottle, not the SP129 pouch kit. Renamed to what the listing sells.

The other 84 products featured at the top of departments were last checked Oct 30-31 by the same method and were not searched again this time.

## Department order

Each department (`lanes.ts`) ranks its categories by importance (`order`, then its own `cats`); plates, cups, party goods and games (`SECONDARY`) go last anywhere they aren't the point. Emergency and Travel lead with a hand-ranked `featured` list; Emergency's follows Ready.gov's basic kit (water, food and a can opener, light, batteries and charging, radio, first aid, whistle and masks, sanitation, plastic sheeting and tape, tools, maps). `lanes.test.ts` fails if a convenience item leads a department, if Emergency doesn't open with water and food, if a disaster search ("hurricane", "earthquake", "flood") misses the basics, or if the home page shows a product twice.

## Amazon APIs and programs

- **Creators API (replacing Product Advertising API 5):** returns titles, images and time-stamped prices for ASINs. Under the Associates policies it is the only allowed source for showing Amazon product images or prices on the site, and it would allow automated title checks. Registering is DJ's step in Associates Central (keys then go in Vercel); access depends on the account's recent qualifying sales. Until then the site shows no product images and no prices.
- **Add-to-cart form:** Amazon documents a form that adds several ASINs to a visitor's cart in one step. It only works with exact products and wasn't verified, so the site makes no combined-cart claim.
- **Influencer Program / Creator Connections:** both need an approved social account with an audience. Revisit once the profiles in `docs/social/` exist and have posting history.

## Adding a kit

Add an entry to `app/lib/shop/kits.ts` with catalog ids only. If an item is missing, add it to the catalog first (`data/*.ts`, line format in `data/parse.ts`) with the right situation codes. Write the intro in plain words; any safety point must already be in a catalog note or a guide with its source. Add search words people actually type, and months if it's seasonal. `npm test` checks the ids.

## Growing the catalog

Priorities for the next pass, most useful first:

1. Exact products for the most-clicked search items (from `shop_click` labels ending in `-s-…`), checked by the workflow above.
2. More kits where searches land on "items only" or "none" (the `search` event label).
3. More guides for kits that get visits but few saves.
