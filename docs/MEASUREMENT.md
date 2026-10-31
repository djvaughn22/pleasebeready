# Measuring PleaseBeReady (Oct 30, 2026)

Two sources, never mixed up:

- **Google Analytics 4** (tag `G-6GR2LFSSW1`, already on every page): visits, where they came from, and what people did on the site. It cannot see Amazon purchases.
- **Amazon Associates reports** (tag `pleasebeready-20`): orders and earnings. The only place a sale shows up.

A click on an Amazon button is a click, not a sale. A "Bought" tick on a list is the visitor's own mark, never sent anywhere.

## What the site records

Only short labels travel (a kit slug, a catalog id, a situation). Never what someone typed, list names, notes, amounts or people counts. Browsers with Do Not Track or Global Privacy Control send nothing (`app/lib/measure.ts`).

| Question | GA4 event or report | Label |
|---|---|---|
| Visitors, returning visitors, sources | Built-in: *Reports → Acquisition* and *Retention*; campaigns from `utm_` tags | — |
| Popular lanes, kits and guides | Built-in page views for `/shop/…`, `/kits/…`, `/guides/…` | — |
| Searches | `search` | `kit-<slug>` for the top kit, `items-only`, or `none` |
| Saved items | `save_item` | catalog id |
| Saved kits | `save_kit` | kit slug |
| Lists created | `plan_start` | `kit-…`, `save-home`, `picker-…`, `link-…`, `shared-…` |
| Items added in bulk | `plan_add` | `many-…`, `category-…`, `all-…` |
| Lists shared | `list_share` | the list's situation |
| Amazon clicks | `shop_click` (kits, lanes, search, lists), `gear_click` (checklist) | `<category>-<p or s>-<item>` (p = checked product, s = search) |
| Guide link clicks | `guide_click` | guide or kit slug |
| Confirmed revenue | **Associates only:** *Reports → Orders* and *Earnings* | — |

Product impressions are not recorded (it would mean an event per card). Page views per kit and lane stand in for them.

## One-time setup (DJ, in GA4)

1. *Admin → Custom definitions → Create custom dimension*: name **Label**, scope **Event**, event parameter **label**.
2. *Admin → Events*: mark `save_kit`, `list_share` and `shop_click` as key events.
3. Check *Reports → Realtime* while clicking around the site in a normal browser.

## The weekly dashboard (Looker Studio, no code)

1. Open lookerstudio.google.com → *Create → Report* → add the **Google Analytics** connector → pick the PleaseBeReady property.
2. Add four tables:
   - **Traffic:** Session source / medium / campaign × Sessions, New users, Returning users.
   - **Kits and lanes:** Page path containing `/kits/` or `/shop/` × Views.
   - **Actions:** Event name × Label × Event count, filtered to `search`, `save_item`, `save_kit`, `plan_start`, `list_share`, `shop_click`.
   - **Campaigns:** Session campaign × Sessions × Key events.
3. Set the date range to the last 7 days, and share the report with yourself only.

This reads the same GA4 data with DJ's own Google login, so no keys or passwords go into the site. A page inside the site would need a GA Data API service account; that is a credentials decision for DJ, so it is not built.

## Reading it

- **Per campaign:** sessions → kit saves per session → Amazon clicks per session.
- **Per kit:** views → `save_kit` → `shop_click` with that kit's items.
- **Sales:** Associates *Orders* for the same week. Search-link orders can include items we never suggested (Amazon credits the whole visit), so report them as "orders after a PleaseBeReady click", not as sales of a recommended product.
- All orders show under one tag, `pleasebeready-20`. Per-channel tags would need extra tracking IDs in Associates and a site change; not built.
