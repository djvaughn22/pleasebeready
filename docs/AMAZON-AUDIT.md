# Amazon listing audit (Nov 5, 2026)

What was checked, what changed, and what still needs a person. Row-by-row evidence is in `audit/amazon-audit-2026-11.tsv`; `npm run picks -- audit` recounts it, and `audit.test.ts` keeps rejected listings out of the store.

## How listings were checked, and the limits

- **Method:** WebSearch limited to amazon.com, one search per ASIN (`<ASIN> <short name> currently unavailable`). It returns the listing's title, pack size and cached page text, including "Currently unavailable" and "No featured offers available" when the cached copy has them.
- **This is snapshot evidence, not live stock.** Cached copies have no reliable date, some are old, and they don't reflect a shopper's delivery location. Grocery listings (water, cans) often show an Amazon Fresh style "Not Added" with no buy box and can depend on the delivery area. So the site never says a product is in stock; it says when the listing was checked and that Amazon shows today's price and stock.
- **Amazon blocks AI agents from product pages.** Opening a product page in the browser pane showed: "Access restricted. Continued access by an unauthorized AI agent violates Amazon's Conditions of Use", with a Continue button. It was not clicked, and no other route (Chrome, curl) was tried. Don't try them. A live check is a person's job, or the Creators API's once it's registered.
- **The audit took two rounds.** 200 searches a turn is the tool's limit, and it said not to work around it. The first round stopped at 136 of 233 entries; a follow-up message gave the second round its budget, and that one finished the rest.
- **"Not found" can be a false negative.** The Westinghouse B099KPDJBD looked missing in one search and turned up with no offers in a later one. Either way it was out, but don't read "not found" as proof the listing is gone.

## Results

| | Count |
|---|---|
| Entries in `picks.ts` now | 235 (233 ASINs, 213 catalog items) |
| Checked by ASIN | All of them, over two rounds |
| Not re-checked yet | 0 |
| Listings rejected (store listings plus candidates) | 93 |
| Store listings replaced or removed | 46 |
| New exact picks added | 61 |

On the listings we now link, the cached text showed a purchase option or recent purchases on 104, an Amazon Fresh style state on 7, mixed signals on 3, and no stock signal either way on 121. None is logged as unavailable or without offers. That is what a snapshot showed, not a promise.

The 97 entries left over from the first round were not better than the first 136: 22 of them were unavailable, had no offers, or showed only used units, about one in four.

## Replaced or removed

| Item | Old listing | Why | Now |
|---|---|---|---|
| Peanut butter | Jif 40 oz, B000R2Z2S6 | Currently unavailable | SKIPPY 2 × 40 oz, B07DTYVDJ6; single jar B0005ZH4QI |
| Weather radio | Midland ER310, B015QIC1PW | Currently unavailable | Midland ER210, B015QICDD2 |
| Water bricks | WaterBrick, B00VJQLR2O | Listing now sells a 12-pack | Single brick, B0053GVRWQ |
| Toilet paper | Charmin 18 Family Mega, B09YKYG6W8 | No featured offers | Charmin 18 Mega, B0BCL2LLP5 |
| Smoke and CO alarm (alt) | First Alert SCO5CN, B000MXJ498 | Not found; also dead on Oct 7 | Kidde 30CUDR, B0CX6L54KV |
| Canned beans | Bush's 12-pack, B01N1O1TF8; organic alt B01MYVHST9 | Unavailable in one copy | Goya 8-pack, B01ALQKTKS; Bush's reduced sodium, B01MQRSTKC |
| Canned fruit | Del Monte fruit cocktail, B0025UCJ8O | Currently unavailable | Del Monte peaches 12-pack, B0025UCL64 |
| 55-gallon barrel | Augason Farms, B07YSZ68GV | Currently unavailable | Augason Farms kit with pump, B006OW4FVI |
| Headlamps | Energizer PRO, B092RHC2FY | Currently unavailable | Energizer PRO other listing, B0DDQL8T6Z |
| Whistle | Fox 40, B004QIY6MK | Not found | Fox 40, B004FG7G52 |
| Duct tape | Gorilla, B00N150YS4 | Size and pack count didn't match | Gorilla 35 yd roll, B000CSS8UE |
| Fire extinguisher (alt) | Kidde FA110, B00002ND64 | No featured offers | First Alert 2-pack, B09P9K8K2J |
| Sleeping bag | Coleman Brazos, B0BXMW1TJ9 | Currently unavailable | TETON Celsius 20°F, B0CHN4N4KK |
| Tent | Coleman Sundome, B07QK8KN8S | Currently unavailable, no offers | Coleman Skydome 4-person, B07XGDP7D7 |
| Power strip | Anker 332, B0B8SHPS5B | Currently unavailable | Anker 6 outlet + 4 USB, B0CKR7B9T9 |
| Travel pet bowls | CrossMor, B094DWQN62 | Marked unavailable | PetBonus, B0C1RH2K82 |
| Personal water filter | LifeStraw blue, B006QF3TW4 | Currently unavailable | Sawyer Mini now first, B071Y4F3JD; LifeStraw green, B085HNCC3T |
| Gravity filter | LifeStraw Family, B0BX5F7L2X | Currently unavailable | Membrane Solutions 6 L, B08ZYMXLMH |
| Power station (budget) | Jackery 300 Plus, B0CFV93GZM | Unavailable, no offers | Anker SOLIX C300 with bag, B0GWQ1J7LC |
| Generator (budget) | Westinghouse iGen2200c, B099KNR6W7 | No featured offers | DeWALT 2,200W, B0892SHSQC |
| Generator (upgrade) | Westinghouse, B099KPDJBD | No featured offers | Champion 9,375W dual fuel, B0D9R2B634 |
| Escape ladder | First Alert EL52-2, B0007OAPT0 | No featured offers | First Alert 14 ft, B09RLLWTG8 |
| Generator (upgrade, late pick) | Westinghouse 12,500W, B099KTHXMK | No offers; delivery section said no service | Champion 9,375W dual fuel, B0D9R2B634 |
| Hand warmers | HotHands 10 pair, B077RXSZN3 | Not found | HotHands 10 pair, B0HHQRWNKN |
| Fridge thermometer | Rubbermaid FGR80GC, B005KDDM7A | Currently unavailable | Taylor large dial 2-pack, B0G4S2H9RZ |
| Jump starter | NOCO GB40, B015TKUPIC | No featured offers | NOCO GBX45, B0924V8SPC |
| Battery fan | O2COOL Treva, B013BOC6VC | Not found | O2COOL Treva rechargeable, B014CLAL8S |
| Box fan | Lasko 3723, B000HHJ2I2 | Currently unavailable | Lasko 3720, B000BOCD1Y |
| Pipe insulation | Frost King SP512XB6, B01MZEEUDS | Currently unavailable | Frost King tubular foam, B07XVBQN34 |
| Pill organizer | Ezy Dose small, B001THDDFC | No featured offers | Ezy Dose large, B0CLBCPDSS |
| Shade canopy | CORE 10x10, B01E45EYJY | Currently unavailable | Amazon Basics 10 x 10, B07YLZTGZ9 |
| Car phone mount | iOttie One Touch 5, B08G3R5B7N | No featured offers, used only | iOttie Easy One Touch, B0875RKTQF |
| Tape measure | STANLEY 33-425, B00002X2GQ | Currently unavailable | PowerLock 33-425, B00QXDKQP2 (flagged below) |
| WD-40 | Smart Straw, B07WXMY143 | Currently unavailable | WD-40 Smart Straw 11 oz, B0CQQ9RK74 |
| Key safe | Master Lock 5400EC, B09QMNYPZG | No featured offers | Master Lock 5400EC, B0002YP1VC |
| Pliers | Channellock CHL430, B00002N5JF | Currently unavailable | Channellock 430X, B07P42JFMG |
| Pots and pans | T-fal Ultimate, B004KSN8XY | No featured offers | T-fal Signature 12 piece, B001167VIQ |
| Sleeping pad | Klymit Static V, B01C3RW88Y | Currently unavailable | Klymit Static V Luxe, B07YP9199P |
| Camp cookware | Stanley Base Camp, B07QH7D5KM | Currently unavailable | GSI Bugaboo Base Camper medium, B0CXC4JG7D |
| Utility knife | STANLEY Classic 99, B00002X204 | No featured offers | STANLEY Classic 99 3-pack, B010GCSVKM |
| Caulk | GE M90006, B008XKVLBG | Currently unavailable | GE Supreme 10 oz, B0BVGRTSCK |
| Handheld shower | Moen 26112, B014TIHYAM | Currently unavailable | AquaDance 6-setting, B01H2DG1SW |
| Large-button phone | Panasonic KX-TGM450S, B01LZ8ICCY | Only a used unit seen | VTech SN5127, B07C4SN9C1 |
| Dash camera | Garmin Mini 2, B0931YZ82P | Currently unavailable in one copy | Garmin Mini 3, B0DDM7PFLW |
| Trunk organizer | DRIVE, B071F82CYJ | No featured offers | Amazon Basics 13.5 gallon, B0DNQ5V1YH |

Replacements for food in the mix got new label calories in `nutrition.ts`. Goya beans have more calories a can than Bush's did, so a week for four now takes 13 cans instead of 17.

## Added: gallons, containers, multipacks, bulk

Pure Life 6 × 1-gallon jugs and a single jug (water had no exact product). Reliance Aqua-Tainer 2-pack, Aqua-Pak 5-gallon, Fold-A-Carrier collapsible. Mahatma rice 5 lb and 20 lb, Barilla 8-pack, Quaker oats 2-pack, Hormel chili 12-pack, Swanson chicken 6-pack, Del Monte green beans 12-pack. New role **Bigger pack** (`bulk`), which a test keeps larger than the item's first pick. Iberia pinto beans 4 lb gave the dry beans item its first exact product.

Looked for and not added because the copies seen were unavailable: Mahatma 10 lb, Goya lentils 4 lb, Goya pinto 4 lb 6-pack, Chef Boyardee 12-pack, Swanson regular 6-pack, Amazon Grocery 96-pack water. Crystal Geyser and Alkaline88 gallon cases too (no offers or unavailable). Chef Boyardee Overstuffed 12-pack (B003XUJ3RK) looks fine, but the catalog has no canned pasta item.

## Could not verify

**Stock not shown (121 entries):** the title and pack matched but the cached text said nothing about stock. That includes many of the replacements, because a page with no notice is the most a snapshot can show. `npm run picks -- review` prints them as plain links, and `audit/hand-check-links.md` has the list as of today.

**Listing data that disagrees with itself (kept, flagged):**

- Dixie cutlery B004NG8DJ2: title says 108 pieces, spec table says 168.
- Liquid I.V. B0DY2F3W8F: title says Lemon Lime, flavor field says Rainbow Sherbet.
- Graco play yard B09MWHG3ZT: add to cart on one page, no featured offers on another.
- Mountain House bucket B0843HYLK9: one cached copy showed a 3-day kit under this ASIN.
- Jackery 1000 v2 B0D7PPG25F: in stock in a late-October copy, no status in another.
- First Alert combo B0CLVRPNZX and CO alarms B0GG9WK5RB: model numbers differ on the page.
- Reliance Aqua-Tainer: retailers disagree on "food grade" and "FDA approved" wording; the card says stores list it as food-grade.
- Madison Supply shears B084KX2TC1: the page lists ASIN B00YFG1U86.
- Sea-Band B001F731N0: in stock in a copy with 2026 reviews, "discontinued by manufacturer" in another.
- Safe Paw B07H9L1RW9: the page lists another ASIN and mixes in a 2-pack.
- EPAuto trash can B0D2RQP7ZR: the page lists ASIN B07HYJ2YHN.
- PowerLock tape B00QXDKQP2: one copy is titled Stanley, another Proto, same model number, so the site's name leaves the brand out.
- Master Lock key box B0002YP1VC: part number 5400EC, model field 5400D.
- Amazon Basics canopy B07YLZTGZ9: carries a "newer version available" notice, with no stock warning.
- Coleman stove B00005OU9D: only an old mention confirms this ASIN, so the WindBlock stove B0H8ZFD32X is now beside it.
- Garmin Mini 3 B0DDM7PFLW: bundles with memory cards exist, so the card says to check the listing for one.

**Red Cross manual:** the 2021 edition still shows; a Revision 2025 exists and may be a better pick.

## To re-check later

1. `npm run picks -- due` lists entries past their re-check date. Search each by ASIN, add a row to the TSV, and for a keeper set `checked` in `picks.ts`.
2. A listing seen as unavailable leaves `picks.ts`; its row stays in the TSV so the test keeps it out.
3. If it fills the food mix, update `nutrition.ts` from a retailer's label.
4. If it's a checklist gear line, update `readiness.ts` and `dailyReadiness.ts`.
5. Stock checks by a person: open `audit/hand-check-links.md` on a phone. The links carry no tag, so they don't count as affiliate clicks.
