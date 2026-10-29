# PleaseBeReady promotion plan (revised Oct 28, 2026)

Materials only. **Nothing here has been posted, sent or paid for, and the plan spends $0.** Any paid step is a *proposal for DJ to approve*. Rules, sources and evidence grades are in `STOCKUP-RESEARCH.md`.

## What we know, and how well

- **Measured, by others:** a third-party tool's Amazon search-term ranks (no data date), a retailer report on the 2025 Iberian blackout, and Google's note on packing-cube searches. None of it is PleaseBeReady data. None of it shows what sells *through us*.
- **Not available:** Amazon Best Sellers pages (HTTP 503 to our fetch), Google Trends, Amazon Brand Analytics, and our own Associates history.
- **Our judgment:** which situations to lead with, which formats to try.

So nothing here is called a "best seller" or a proven earner. The first month exists to produce our own evidence.

## Track 1: organic posts (may carry affiliate links)

- **Default:** link to a PleaseBeReady page, such as `/planner?start=camping`, not straight to Amazon. The planner shows the disclosure next to every Shop or Search button.
- **If a post carries an Amazon link** (link sticker, Pin link, TikTok bio link):
  - **Caption, first line:** "Paid link: I earn a commission if you buy through links in this post." FTC: close to the link, plain words, not only in hashtags.
  - **TikTok:** turn on *Disclose commercial content*. TikTok's Branded Content Policy counts "a product or service for which you will receive a commission" as branded content. Name the product in the video or caption.
  - **Pinterest:** say it's an affiliate link in the description. Pinterest's commercial content guidelines ask for transparency about links and affiliate links "in moderation". Confirm in-app whether the paid-partnership tool applies to Amazon affiliate Pins (manual check).
  - **Instagram and Facebook:** the "Paid partnership" label is for content made with a business partner. Whether Meta expects it on plain Amazon Associates posts is **unconfirmed**, because Meta's policy pages would not load for us. Use the caption disclosure always; confirm in the account (checklist below).
  - **Never** shorten or cloak the Amazon link so it hides that it goes to Amazon (Associates policies §2(v)–(w)). Never put links in printed or offline material (§4). Never DM links to people who did not opt in (§4).
- **Copy:** no fear, no countdowns, no "best seller", no prices, no promises about safety.

## Track 2: paid campaigns (proposal only; site pages, never Amazon)

- **Rules:**
  - Ads send people to PleaseBeReady pages only. Amazon: no commission for purchases "after a customer is referred through any advertisement that you purchased" to Amazon, and no bidding on keywords that include "amazon" (§6(f)).
  - **Pinterest:** "Pins that contain mentions and/or affiliate links are currently not eligible for promotion" (Pinterest Help, Idea ads). Make separate **landing-page Pins**: no affiliate link, link to `pleasebeready.com/planner?start=…`, labeled by Pinterest as a promoted Pin.
  - **Meta and TikTok ads:** the creative shows the planner, not products, and links to the site. The landing page shows the commission notice beside the shop buttons.
- **Proposed budget for DJ:** **$0 until Track 3 has two weeks of organic data.** If approved later: one landing-page Pin campaign and one Meta campaign, each capped at a small daily amount DJ chooses, run for 7 days, on whichever situation page won Test 1 or 2 below.

## Track 3: discovery and measurement

What each tool can and cannot see:

| Question | Where it's answered | Can it see Amazon purchases? |
|---|---|---|
| Which posts sent visits? | GA4 sessions by source, plus `?start=` page in the URL | No |
| Which situation pages start plans? | GA event `plan_start`, label `picker-`, `link-` or `shared-` plus situation | No |
| Do people build lists? | GA event `plan_add`, label `one`, `ticked`, `category` or `all` plus situation | No |
| Which categories and items get Shop or Search clicks? | GA event `shop_click`, label `<category>-<p or s>-<item>` (p = exact product page, s = search) | No; a click is not a sale |
| What was bought? | **Amazon Associates reports only** (ordered items, by tracking ID) | Yes. PleaseBeReady itself never sees purchases |

- **Reading results:**
  - Compare *plan starts per landing visit*, *adds per plan start* and *shop clicks per plan start*.
  - Purchases come only from Associates "Orders" and "Earnings" reports.
  - Search-link orders may include items we never suggested (Amazon credits other items in the visit). Report them as "orders after a PleaseBeReady click", not as sales of a recommended product.
- **Per-channel attribution:** if the account allows extra tracking IDs, create one per channel, for example a separate ID for Pinterest. That needs a site change to use per-campaign tags, which is **not built**. Until then, all orders show under `pleasebeready-20`, and channel is inferred only from GA timing. That is weak evidence.

## First-month tests, in priority order

Ordered by the strongest signals available: emergency-adjacent household items in the search-term data and the blackout demand report, then packing and travel (Google), then events (judgment only).

| # | Audience | Problem or situation | Post or ad concept | Landing page | Disclosure or label | Success measure | What changes the next test |
|---|---|---|---|---|---|---|---|
| 1 | Instagram followers and local neighborhood groups that allow sharing | Power outage or winter storm at home | Carousel: "Your outage list, sized to your household". Slides: light per person, charging, water at 1 gal/person/day (Ready.gov), food | `/planner?start=outage` and `?start=winter` | Track 1. Site link only; no affiliate link in post | `plan_start` with `link-outage` or `link-winter` per landing session; `shop_click` in power and water | If plan starts are 2× the other tests, lead the month with weather situations, timed to forecasts. If clicks are high but adds are low, the suggestions page needs a clearer first step. |
| 2 | Same, plus Pinterest searchers | Household stock-up (trash bags, batteries, paper goods) | Pin and post: "A month of the basics for your household, worked out per person" | `/planner?start=home` | Track 1. Pin with site link, no affiliate link | `plan_add` per start; `shop_click` share in `paper` and `power` categories | If search-link clicks rarely become Associates orders after 2 weeks, title-verify exact ASINs for the 10 most-clicked items before featuring them. |
| 3 | Parents (Instagram, parent groups where allowed) | Sleepover or birthday party | "8 kids, 1 night: what to buy" screen recording | `/planner?start=sleepover` | Track 1. Site link only | Plan starts and the share of `plan_add` labeled `all` | Events beat weather on starts: make events the main weekly slot and test a party Pin. |
| 4 | Pinterest | Camping or road trip (packing interest) | Tall checklist Pin vs a planner-screenshot Pin | `/planner?start=camping` | Track 1. No affiliate link, so it stays promotable later | Outbound clicks per 1,000 impressions (Pinterest analytics) | Use the winning format for later Pins; it becomes the Track 2 creative if DJ approves spend. |
| 5 | Adult children of older parents | Caring for someone at home | "Checking on a parent this winter": grab bars, night lights, medicine list, daily check-in task | `/planner?start=caregiving` | Track 1. Site link only. Copy says to follow the doctor's advice | Plan starts; share-link use (`plan_start` with `shared-`) | High sharing: build a "send to family" post. Low starts: drop it from the weekly slots. |
| 6 (proposal) | Pinterest ads, US, the winning situation | Whichever of 1–4 wins | Landing-page Pin, no affiliate link | Winning `?start=` page | Track 2. Promoted Pin; landing page carries the disclosure | Cost per plan start (not per sale); Associates orders in the run week vs the prior week | Only with DJ's approved budget. A cost per start no better than organic means stopping paid tests. |

## 30-day organic calendar (Track 1, site links only)

Winter ordering. Each row links to a PleaseBeReady page; none carries an Amazon link, so none needs a paid-partnership label. Product names appear only as plain examples, never as "best".

| Day | Theme | Post idea | Caption | Call to action | Link | Track |
|---|---|---|---|---|---|---|
| 1 | Intro | Carousel: "Tell it how many people. It does the math." | Plan for 4 or 40. Pick what you need, change any amount, shop the list. Saved on your phone; no account. | Start a plan | /planner | 1 |
| 2 | Winter | Car kit checklist pin | What lives in your car all winter: scraper, blanket, jumper cables, water, snacks. | Build your car kit | ?start=vehicle | 1 |
| 3 | Household | "Trash bags, batteries, TP: the stuff you always run out of" | A month of the basics for your household, sized to how many live there. | Size your stock-up | ?start=home | 1 |
| 4 | Tip | Task card: label your breaker panel | Takes 10 minutes and helps everyone in the house during an outage. | See more 10-minute tasks | ?start=outage | 1 |
| 5 | Hosting | "Guests for 4 nights: what to buy" | Towels, an air mattress, coffee for the crowd. Amounts worked out for your headcount. | Plan for your guests | ?start=hosting | 1 |
| 6 | Kids | Sleepover math for 8 kids | 8 kids, 1 night: pizzas, juice boxes, popcorn, breakfast. The planner shows its math. | Plan a sleepover | ?start=sleepover | 1 |
| 7 | Weekly recap | "3 lists people made this week" (examples only, no real user data) | Camping, a birthday, a winter car kit. Which one's next for you? | Pick a plan | /planner | 1 |
| 8 | Winter storm | Carousel: water, light, warmth, food for 3 days | 4 people × 3 days × 1 gallon = 12 gallons of water. That's the Ready.gov amount; the rest is a starting point. | Plan for a storm | ?start=winter | 1 |
| 9 | Outage | "Charge everything" task card | Before a storm: charge phones and power banks, freeze water bottles, fill the car. | Get the full list | ?start=outage | 1 |
| 10 | Older adults | Checking on a parent this winter | Grab bars, night lights, a medicine list and a daily check-in plan. | Plan for someone you care for | ?start=caregiving | 1 |
| 11 | Pets | Pet go-kit in one photo | Food, water, leash, carrier, records and a photo of you together (Ready.gov tip). | Plan for your pets | ?start=petprep | 1 |
| 12 | Party | Holiday party for 25 | Plates, cups, napkins and ice, worked out per person. | Plan your party | ?start=party | 1 |
| 13 | Travel | Holiday road trip | Snacks per kid per day, car chargers, a blanket and a first aid kit. | Plan the drive | ?start=roadtrip | 1 |
| 14 | Recap | "What's on your list?" question post | Comment the situation you're planning for; we'll show the list. | Comment | /planner | 1 |
| 15 | Sick days | Cold and flu shelf | Tissues, fluids, a thermometer and the medicines your doctor is fine with. | Stock a sick-day shelf | ?start=sick | 1 |
| 16 | New baby | First weeks home | Diapers per day, burp cloths, a car seat check, and a freezer full of dinners. | Plan for the baby | ?start=newbaby | 1 |
| 17 | Task | "Sign up for local alerts" | Search your county name + "emergency alerts". Two minutes. | More tasks like this | ?start=emergency | 1 |
| 18 | Household | Pantry stock-up for 2 weeks | Canned goods, rice, peanut butter and a manual can opener. | Size your pantry | ?start=home | 1 |
| 19 | Winter | Pipes, faucets and drafts | Pipe insulation and faucet covers before the first hard freeze. | Winter home list | ?start=winter | 1 |
| 20 | Hosting | Leftovers kit | Foil pans with lids and containers so guests take food home. | Plan the meal | ?start=hosting | 1 |
| 21 | Recap | Before/after: messy note vs planner list | Same list, with the amounts worked out. | Try it | /planner | 1 |
| 22 | Accessibility | Power-dependent devices | If someone relies on powered medical equipment, tell your utility and ask the maker about backup. Talk to their doctor. | See the checklist | ?start=caregiving | 1 |
| 23 | Kids | New Year's sleepover | Glow sticks, snacks, sleeping bags. Count kids; it counts the rest. | Plan it | ?start=sleepover | 1 |
| 24 | Car | Jump starter vs jumper cables, plainly | What each does and when one is enough. No brand claims. | Car kit list | ?start=vehicle | 1 |
| 25 | Household | Laundry and cleaning month | Pods, dryer sheets, wipes: how much a month for your house. | Plan the month | ?start=home | 1 |
| 26 | Moving | First-night box | Sheets, toiletries, chargers, medicine, snacks, a change of clothes. | Plan the move | ?start=moving | 1 |
| 27 | Outage | Lighting without candles | Ready.gov recommends flashlights over candles. One light per person plus lanterns. | Outage list | ?start=outage | 1 |
| 28 | Recap | Share-a-plan feature | Make a list, send the link; they get their own copy. | Share a plan | /planner | 1 |
| 29 | Tasks | Documents in one bag | Copies of IDs, insurance and medicine lists, in a waterproof bag. | Emergency list | ?start=emergency | 1 |
| 30 | Month wrap | "Pick one plan this weekend" | Pick one situation and make the list. It's saved on your phone. | Start a plan | /planner | 1 |

Weeks 1–2 put Tests 1–3 in front (days 1–9); weeks 3–4 add Tests 4–5. Review GA and Associates reports on days 14 and 28.

## Owner checklist (needs DJ's own accounts)

**Amazon Associates**
- [ ] pleasebeready.com and every social profile that will carry links are listed under *Account Settings → Websites and Mobile Apps*. Add Instagram, Pinterest, TikTok and Facebook if used.
- [ ] Account in good standing, with qualifying sales inside the required window. Check the dashboard; we cannot see it.
- [ ] Open a planner Search link and a Shop link in a private window, add an item, and check the cart URL kept `tag=pleasebeready-20`. Within about 24–48 hours, confirm clicks appear in *Reports → Link-type / Tracking ID*.
- [ ] Decide whether to create extra tracking IDs per channel (needs a small site change to use them).
- [ ] Re-read the Participation Requirements before any paid campaign.

**Meta (Instagram and Facebook)**
- [ ] Professional (business or creator) account. Check whether the *Paid partnership* tool is offered or expected for Associates-only posts. Our fetch could not load Meta's Branded Content Policies, so this is unconfirmed.
- [ ] The existing Graph API publisher posts as the right account and caption disclosures survive publishing.

**Pinterest**
- [ ] Business account with the site claimed.
- [ ] Confirm in Ads Manager that affiliate-link Pins are refused for promotion, and that landing-page Pins pass.
- [ ] Check whether the paid-partnership tool applies to Amazon affiliate Pins.

**TikTok (if used)**
- [ ] *Disclose commercial content* is on for any post with an affiliate link or commission product.

**GA4**
- [ ] In *Admin → Custom definitions*, register `label` as an event-scoped dimension so `plan_start`, `plan_add` and `shop_click` labels show in reports. Mark `plan_start` as a key event if wanted.
- [ ] Confirm events arrive in *Realtime* from a normal browser. Browsers with Do Not Track or GPC send nothing by design.
