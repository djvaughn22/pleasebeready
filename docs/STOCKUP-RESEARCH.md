# Stock-up planner: demand research and catalog record

Accessed **Oct 28, 2026**. A record of what we looked at, what each signal can and cannot tell us, and how it shaped the catalog in `app/lib/stockup/`. Update it whenever the catalog's priorities change.

## What we could and could not see

| Signal | Source (accessed Oct 28, 2026) | What it says | Limits |
|---|---|---|---|
| Amazon search terms near "emergency preparedness" | [amazonseo.ai: emergency-preparedness](https://www.amazonseo.ai/en/amazon-best-sellers/emergency-preparedness) | Related searches with high frequency ranks: 13-gallon, 30-gallon and 4-gallon trash bags, CR2032 batteries, 10x10 pop-up canopy, 5-gallon water jug. Top items: a hand-crank NOAA radio/power bank, a survival kit, AA/AAA battery packs. Top categories: Outdoors, Health & Personal Care, Grocery. | A third-party SEO tool that says it draws on Amazon Brand Analytics. **No data date on the page.** Not verified against Amazon. |
| Amazon Best Sellers (Emergency & Survival Kits) | amazon.com/zgbs/… | **Not read.** The page returned HTTP 503 to our fetch. | Read it by hand when planning the next update. |
| Demand spikes in a real blackout | [The Portugal News, May 3, 2025](https://www.theportugalnews.com/news/2025-05-03/demand-for-radios-soars-by-4594/97333) | During the April 2025 Iberian blackout, demand rose for radios (+4,594%), power banks (+1,728%) and portable stoves (+348%). | Portugal and Spain, not the US; one event; percentages come from a retailer report. |
| Outage supply groups | [NBC Select: power outage tools and supplies](https://www.nbcnews.com/select/shopping/best-power-outage-tools-supplies-rcna256532) | Groups outage needs as light, power, water and food, and communication, citing NWS, FEMA and the Red Cross. | An editorial shopping guide; we used its grouping, not its product picks. |
| Retail stocking priorities | [National Hardware Show 2026: emergency preparedness](https://www.nationalhardwareshow.com/en-us/featured-areas/emergency-preparedness.html) | Flashlights, generators, medical kits, safety products, solar products, water pumps. | What retailers stock, not what shoppers search. |
| Travel packing interest | [Google: 2025 summer travel trends](https://blog.google/products/search/2025-summer-travel-trends/) | Google reported record searches for packing cubes in 2025. | Google's summary; no raw numbers. |
| Camping seasonality | [accio.com: trending 2025 camping gear](https://www.accio.com/business/trending-2025-camping-gear) | Camping-tent search interest peaks in August and is lowest in winter. | Third-party summary, apparently machine-written; directional only. |
| Official preparedness guidance | Ready.gov, Red Cross, CDC (see `sources.ts`) | What to have and do; the only amounts we cite as official. | Guidance, not demand. |

**Not done:** we had no Google Trends or Amazon Brand Analytics access, so there are no first-party search volumes here. If Associates or Brand Analytics data is available on the account, it is the next thing to read.

## How the findings shaped the catalog

- **Weather and emergencies got their own situations**: power outage, winter storm, hurricane, heat wave, wildfire and smoke, and flooding. Every demand signal clusters there, and each one is easy to explain. Radios, power banks, batteries, lanterns, water jugs and camp stoves are marked essential or useful wherever they apply.
- **Repeat household buys sit high**: trash bags in three sizes, batteries by size (including CR2032), paper goods, laundry, pantry staples. These show up in the related searches and are bought again and again, which makes them useful year-round.
- **Events and trips stay broad**: camping, sleepovers, parties, tailgates, sports days, beach days, road trips and travel. The pop-up canopy and packing-cube signals backed giving these depth.
- **Life changes were added**: new baby, college move-in, moving house and caregiving. The need there is high and lists are long, but nothing above measures their demand; that is our judgment.
- **Accessibility and older adults**: grab bars, shower chairs, medical-device backup power and a power-dependent device plan. These follow Ready.gov's disability and older-adult pages. They only appear when the plan says someone needs them.
- **Seasonality is recorded per entry**: `season` is `year-round` (977), `seasonal` (55) or `event` (12), so seasonal items can be promoted in season.
- **Tasks sit alongside products**: 91 "things to do" (family plan, alerts, shut-offs, document copies, early refills). They never get a shop link.

## Catalog at a glance (from the code, Oct 28, 2026)

- **1,044 distinct entries**: 953 products and 91 tasks, across 28 situations and 25 categories. Tests block duplicate IDs, names and normalized names. In review we also removed 56 near-duplicates, such as a second "earplugs" or a "stadium blanket" next to "extra blankets".
- **Priorities**: 73 essential, 365 useful, 606 extra. Essentials are kept few on purpose, so a plan isn't overwhelming.
- **Needs**: kids 86, babies 67, pets 48, older adults 24, mobility 17, medical 12.
- **45 entries say "Ask a professional"**: medicines, medical devices, baby sleep and medicine, gas shut-off, chainsaws, permethrin, and similar.

## Shopping links

- **Exact product pages** for the 22 entries whose ASINs are title-verified in `app/lib/readiness.ts`, via `amazonUrl()`.
- **Every other product** opens an Amazon search for its `q` words, via `amazonSearchUrl()` in `app/lib/gear.ts`. Both carry the `pleasebeready-20` tag. The button reads **Search**, not Shop, and says it opens results rather than one chosen product.
- **No prices, ratings, stock or deals** are shown or stored. There is no multi-item cart.

## Evidence grades

- **Measured, third-party:** the amazonseo.ai search-term ranks (no data date), The Portugal News blackout figures, Google's packing-cube note. These are directional and none is PleaseBeReady data.
- **Estimates:** the accio.com camping seasonality summary.
- **Judgment:** life-change situations (new baby, moving, caregiving, college), every priority level, and the order of tests in `PROMOTION-PLAN.md`.
- **Our own data:** none yet. GA events `plan_start`, `plan_add` and `shop_click` were added Oct 28, 2026. Purchases appear only in Amazon Associates reports, never on our site.

Nothing in the catalog or plan is described as a best seller or a proven earner.

## Platform, Amazon and FTC rules (all accessed Oct 28, 2026)

| Rule | Source | What it says (short) | Status |
|---|---|---|---|
| No paid traffic to Amazon; no bidding on "amazon" | [Amazon Associates Participation Requirements](https://affiliate-program.amazon.com/help/operating/participation) (updated Apr 14, 2026), §6(f); Commission Income Statement §2(c), §2(e) | Search results must send users to your site. No commission on purchases referred through ads you bought, or through redirect sites. | Read |
| No cloaking; shorteners only if clearly Amazon | [Amazon Associates Program Policies](https://affiliate-program.amazon.com/help/operating/policies) §2(v)–(w) | Don't hide that a link goes to Amazon. | Read |
| Offline and DMs | Participation Requirements §4 | No links in print or ebooks. Email, SMS and social DMs only to people who opted in. | Read |
| Prices | Program Policies §2(b); IP License §2(i) | Prices only from Amazon's API or links, with timestamps. We show none. | Read |
| Disclosure on site | Participation Requirements §3(b), §3(e) | Disclose accurately and follow FTC guides. | Read; the site shows "As an Amazon Associate, PleaseBeReady earns from qualifying purchases" |
| FTC: material connections | [FTC Endorsement Guides: What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking) | Disclosure close to the link, in plain words. "#ad" at the start beats one buried among hashtags. "Affiliate link" alone may not be understood. | Read. The eCFR text of 16 CFR 255 redirected to a bot check and was not read. |
| TikTok: commissions are branded content | [TikTok Branded Content Policy](https://www.tiktok.com/legal/page/global/bc-policy/en) (published Aug 4, 2026; effective Aug 31, 2026) | Includes "a product or service for which you will receive a commission"; "you must enable the commercial content disclosure toggle." | Read |
| TikTok: how to disclose | [TikTok: Commercial Content Disclosure setting](https://ads.tiktok.com/resources/help/article/about-the-content-disclosure-setting-for-creators) | Toggle under "Content disclosure and ads"; undisclosed content may be limited. | Seen via search summary, not fetched in full |
| Pinterest: affiliate Pins can't be promoted | [Pinterest Help: Idea ads with paid partnerships](https://help.pinterest.com/en/business/article/idea-ads-with-paid-partnerships) | "Pins that contain mentions and/or affiliate links are currently not eligible for promotion." | Read. The page shows no date; confirm in Ads Manager. |
| Pinterest: affiliate transparency | [Pinterest Commercial and Branded Content Guidelines](https://policy.pinterest.com/en/commercial-and-branded-content-guidelines) (updated Apr 2025) | Be transparent about links; use affiliate links in moderation; affiliates also follow the paid-partnership rules. | Read |
| Pinterest: spam and redirects | [Pinterest Community Guidelines](https://policy.pinterest.com/en/community-guidelines) (updated May 2026; changes effective Nov 12, 2026) | No misleading monetization; no deceptive redirects. | Read |
| Pinterest: ad landing pages | [Pinterest Advertising Guidelines](https://policy.pinterest.com/en/advertising-guidelines) (no date; update effective Nov 12, 2026) | No forced sign-ups, pop-ups or made-for-ads pages. Says nothing on affiliate links. | Read. Re-check after Nov 12. |
| Meta: branded content and Paid partnership label | [Meta Branded Content Policies](https://www.facebook.com/business/help/221149188908254); [enforcement](https://www.facebook.com/business/help/1396602470441939); [labels](https://www.facebook.com/business/help/213764212711862) | Search summaries: the label is required for content made for a business partner in exchange for value; legal disclosure remains the creator's job. | **Not read.** The pages returned no policy text to our fetch. Whether Associates-only posts need the label is **unconfirmed**; owner to check. |

Re-read all of these before any paid campaign, and after Pinterest's Nov 12, 2026 guideline update.
