# PleaseBeReady social launch kit (Oct 30, 2026)

**Status: materials only.** No account was created, no profile changed, nothing posted. Every step that needs DJ's login or approval is in "Owner steps" below. The rules researched on Oct 28 (Associates, FTC, TikTok, Pinterest, Meta) still apply: see `../PROMOTION-PLAN.md` and `../STOCKUP-RESEARCH.md`.

Files in this folder:

| File | What it is |
|---|---|
| `calendar-2026-11.md` | The first 30 days, Nov 2 – Dec 1, readable |
| `calendar-2026-11.csv` | Same 30 days with every field and a tracked link per platform (180 links), for a scheduler or a spreadsheet |
| `calendar.py` | Edit the posts here, then run it to rebuild both files |
| `brand/*.png` | Profile pictures, covers and three post templates, at exact sizes |
| `brand/make.py`, `brand/src/*.html` | Edit and re-render the images (`python3 docs/social/brand/make.py`) |

## Handles

Checked Oct 30, 2026 by opening each public profile address (nothing was reserved):

| Platform | @pleasebeready | @pleasebereadycom (fallback) |
|---|---|---|
| YouTube | **No account found** (404) | No account found |
| TikTok | **No account found** ("Couldn't find this account") | No account found |
| Pinterest | **No account found** ("User not found") | No account found |
| Instagram | Can't tell without logging in | Can't tell |
| Threads | Can't tell (follows the Instagram handle) | Can't tell |
| Facebook | Can't tell (Facebook blocks the check) | Can't tell |

"No account found" means open as of that check. A handle can still be reserved or taken before signup. Use **@pleasebeready** everywhere if Instagram allows it; otherwise use **@pleasebereadycom** on every platform, so the name matches everywhere. Display name everywhere: **PleaseBeReady**. Don't open an X account (Open Mirror doesn't use X).

## Bios (within each platform's limit)

| Where | Text | Length |
|---|---|---|
| Instagram | Shopping lists for whatever's coming: outages, storms, pets, cars, trips, parties. Amounts for your group. Find it. Buy it. Save it. Be ready. | 142/150 |
| Threads | Shopping lists for whatever's coming, worked out for your group: outages, storms, pets, cars, trips, parties. Find it. Buy it. Save it. Be ready. | 145/150 |
| TikTok | Shopping lists for whatever's coming. Find it. Buy it. Save it. Be ready. | 73/80 |
| Facebook intro | Shopping lists for whatever's coming: outages, storms, pets, cars, trips, parties. Find it. Buy it. | 99/101 |
| Facebook About | Kits and shopping lists for power outages, winter storms, a new puppy, a teen's first car, camping, parties and moving, worked out for your group. Lists save on your phone. As an Amazon Associate, PleaseBeReady earns from qualifying purchases. | 243/255 |
| Pinterest About | Checklists and shopping lists for power outages, winter storms, a new puppy, a teen's first car, camping, parties, moving and more. Every pin links to a kit on PleaseBeReady.com with the amounts worked out for your group, and a list you can save on your phone. Emergency guidance comes from Ready.gov and the Red Cross. As an Amazon Associate, PleaseBeReady earns from qualifying purchases. | 390/500 |
| YouTube | Short videos on getting ready for the things that actually happen: power outages, winter storms, holiday guests, road trips, a new puppy, a teen's first car, moving, and caring for a parent. Each video links to a kit on PleaseBeReady.com with the amounts worked out for your group and a list you can save on your phone. Emergency guidance comes from Ready.gov and the Red Cross. As an Amazon Associate, PleaseBeReady earns from qualifying purchases. | 449/1000 |

"Find it. Buy it. Save it. Be ready." is the brand line from the launch brief. It lives in the bios, not on the website.

**Profile link** (one per platform, so GA shows which profile sent the visit):
`https://pleasebeready.com/?utm_source=<ig|tt|fb|pin|yt|th>&utm_medium=social&utm_campaign=bio`

## Brand images

| File | Size | Use |
|---|---|---|
| `brand/avatar-check.png` | 1080×1080 | Profile picture, option A (recommended): green check, reads at thumbnail size |
| `brand/avatar-wordmark.png` | 1080×1080 | Profile picture, option B: "Please Be Ready" |
| `brand/cover-facebook.png` | 1640×624 | Facebook cover; content kept in the center for phone crops |
| `brand/banner-youtube.png` | 2560×1440 | YouTube banner; content inside the 1546×423 safe area |
| `brand/cover-pinterest.png` | 1920×1080 | Pinterest profile cover |
| `brand/pin-power-outage.png` | 1000×1500 | Pin template, filled in for the power outage kit |
| `brand/slide-winter-storm-1.png`, `-2.png` | 1080×1350 | Carousel template (Instagram, Facebook, Threads), winter storm |
| `brand/reel-cover-new-puppy.png` | 1080×1920 | Reel, TikTok and Shorts cover template; text stays clear of the buttons |

Same colors as the site: dark page, PleaseBeReady green, one lane color per topic. Solid fills only. Instagram, TikTok and Threads have no cover image.

## How posts link to the site

- **Every post goes to a PleaseBeReady page, never straight to Amazon.** The kit and guide pages carry the commission notice beside the shop buttons. That keeps posts promotable later and avoids per-post affiliate rules.
- **Instagram and TikTok** don't allow links in captions, so the caption names a search: *Search “power outage” on PleaseBeReady.com.* The site search turns it into the kit.
- **Facebook, Pinterest, Threads and YouTube** get the tracked link from the CSV.
- **Tracked links:** `https://pleasebeready.com<page>?utm_source=<ig|tt|fb|pin|yt|th>&utm_medium=social&utm_campaign=<campaign>`. GA4 attributes visits to them automatically. Kit pages also accept `people`, `kids`, `pets` and `days` (e.g. `/kits/power-outage?people=6&days=5`) if a post names a group size.
- **Share previews:** every kit and guide has its own preview image (title, intro, lane color), so a pasted link shows what it is.

## Content rules

1. Facts only from the guides' official sources (Ready.gov, Red Cross, CDC); name the source on screen when a post gives an amount or a safety rule.
2. Film only what you really have. No acted emergencies, no "we tested", no reviews, no customer stories.
3. No fear, countdowns, "best", prices, deals or stock claims.
4. If a post names or shows a specific product, end the caption with: *Shopping links on our site may earn us a commission.* (The calendar marks the one post that needs it.)
5. On TikTok, turn on "Disclose commercial content" for any post that names a product the site links to.
6. Don't post anything during a real local emergency that could read as selling into it.

## Reusable post formats

| Format | Shape | Example in the calendar |
|---|---|---|
| The math | Reel: one number on screen, then the rule (people × days × amount) | Day 8, water |
| One list | Carousel: cover slide, then one slide of the list (template: `slide-winter-storm-*`) | Day 12, winter storm |
| Pack it with me | Reel: hands packing a real bag, bin or shelf, text naming each item | Day 5, car kit |
| The one thing people forget | Single line on Threads; Reel with one item | Day 6, pet photo |
| Site demo | Screen recording: search → kit → Save → list | Day 1, launch |
| Tall checklist | Pinterest pin (template: `pin-power-outage`) | Every day with a Pin title |

## Owner steps (need DJ)

In order:

1. **Approve the look:** pick avatar A or B; say yes or no to the covers and templates.
2. **Create the accounts** (DJ's logins, 2-step verification on each): Instagram (professional account), Threads (from Instagram), Facebook Page, TikTok, Pinterest business account, YouTube channel with handle @PleaseBeReady.
3. **Claim the site:** Pinterest (claim pleasebeready.com) and YouTube (link the website).
4. **Amazon Associates:** add each social profile under *Account Settings → Websites and Mobile Apps* before any post carries a product link.
5. **TikTok:** turn on *Disclose commercial content* for product posts.
6. **GA4:** register `label` as an event-scoped custom dimension (see `../MEASUREMENT.md`), so saves, searches and shop clicks show by kit and item.
7. **Approve the first week** of the calendar, then post. Review on day 14 and day 28 with the numbers in `../MEASUREMENT.md`.
