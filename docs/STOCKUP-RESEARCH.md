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

## Amazon Associates and disclosure rules checked

- [Amazon Associates Participation Requirements](https://affiliate-program.amazon.com/help/operating/participation) (page updated Apr 14, 2026):
  - **§6(f):** no bidding on keywords, including "amazon". Paid or unpaid search results must send users to our site, not directly to Amazon.
  - **Commission Income Statement §2(c) and §2(e):** no commission on purchases referred through an ad we bought, or through links that redirect to Amazon via an intermediate site.
  - **§4:** no offline promotion, and no Special Links in printed material or ebooks. Links in email, SMS or social DMs are allowed only when the recipient opted in.
  - **§2(b):** prices and availability may only be shown from the API or Amazon's own link data. We show none.
  - **§3(e):** disclose accurately on the site.
- [FTC Endorsement Guides: What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking): put the disclosure close to the recommendation and in plain words ("I get commissions for purchases made through links in this post"). "#ad" at the start of a post beats one buried among other hashtags.
- **Needs manual confirmation on the account** (we cannot see it):
  1. Every social profile that will carry links is listed as a Site in the Associates account.
  2. The account is in good standing and search-style links are attributed in reports.
  3. Current Meta, Pinterest and TikTok rules on affiliate links. We did not read their official pages; the search results found were third-party blogs.
