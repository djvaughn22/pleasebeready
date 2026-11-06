# Amazon listing audit (Nov 5, 2026)

What was checked, what changed, and what still needs a person. Row-by-row evidence is in `audit/amazon-audit-2026-11.tsv`; `npm run picks -- audit` recounts it, and `audit.test.ts` keeps rejected listings out of the store.

## How listings were checked, and the limits

- **Method:** WebSearch limited to amazon.com, one search per ASIN (`<ASIN> <short name> currently unavailable`). It returns the listing's title, pack size and cached page text, including "Currently unavailable" and "No featured offers available" when the cached copy has them.
- **This is snapshot evidence, not live stock.** Cached copies have no reliable date, some are old, and they don't reflect a shopper's delivery location. Grocery listings (water, cans) often show an Amazon Fresh style "Not Added" with no buy box and can depend on the delivery area. So the site never says a product is in stock; it says when the listing was checked and that Amazon shows today's price and stock.
- **Amazon blocks AI agents from product pages.** Opening a product page in the browser pane showed: "Access restricted. Continued access by an unauthorized AI agent violates Amazon's Conditions of Use", with a Continue button. It was not clicked, and no other route (Chrome, curl) was tried. Don't try them. A live check is a person's job, or the Creators API's once it's registered.
- **The search budget ran out.** 200 searches a turn is the tool's limit, and it said not to work around it. That stopped the audit at 136 of 233 entries. A follow-up message gets a new budget.

## Results

| | Count |
|---|---|
| Entries in `picks.ts` now | 233 (231 ASINs, 212 catalog items) |
| Checked in this pass | 136 entries |
| Not re-checked yet | 97 entries, listed below |
| Listings rejected (store listings plus candidates) | 49 |
| Store listings replaced or removed | 23 |
| New exact picks added | 36 |

Of the checked entries, the cached text showed a purchase option or recent purchases on 71, an Amazon Fresh style state on 5, mixed signals on 2, and no stock signal either way on 58. None of the 136 showed "currently unavailable" on the listing we now link. That is what a snapshot showed, not a promise.

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
| Generator (upgrade) | Westinghouse, B099KPDJBD | Not found | Westinghouse 12,500W dual fuel, B099KTHXMK |
| Escape ladder | First Alert EL52-2, B0007OAPT0 | No featured offers | First Alert 14 ft, B09RLLWTG8 |

Replacements for food in the mix got new label calories in `nutrition.ts`. Goya beans have more calories a can than Bush's did, so a week for four now takes 13 cans instead of 17.

## Added: gallons, containers, multipacks, bulk

Pure Life 6 × 1-gallon jugs and a single jug (water had no exact product). Reliance Aqua-Tainer 2-pack, Aqua-Pak 5-gallon, Fold-A-Carrier collapsible. Mahatma rice 5 lb and 20 lb, Barilla 8-pack, Quaker oats 2-pack, Hormel chili 12-pack, Swanson chicken 6-pack, Del Monte green beans 12-pack. New role **Bigger pack** (`bulk`), which a test keeps larger than the item's first pick.

Looked for and not added because the copies seen were unavailable: Mahatma 10 lb, Goya lentils 4 lb, Goya pinto 4 lb 6-pack, Chef Boyardee 12-pack, Swanson regular 6-pack, Amazon Grocery 96-pack water. Crystal Geyser and Alkaline88 gallon cases too (no offers or unavailable).

## Could not verify

**Stock not shown (58 entries):** the title and pack matched but the cached text said nothing about stock. These include new picks made late in the audit: the First Alert 14 ft ladder (B09RLLWTG8), the DeWALT generator (B0892SHSQC) and the Westinghouse generator (B099KTHXMK), found in searches but not checked by ASIN before the budget ran out. `npm run picks -- review` prints them as plain links, and `audit/hand-check-links.md` has the list as of today.

**Listing data that disagrees with itself (kept, flagged):**

- Dixie cutlery B004NG8DJ2: title says 108 pieces, spec table says 168.
- Liquid I.V. B0DY2F3W8F: title says Lemon Lime, flavor field says Rainbow Sherbet.
- Graco play yard B09MWHG3ZT: add to cart on one page, no featured offers on another.
- Mountain House bucket B0843HYLK9: one cached copy showed a 3-day kit under this ASIN.
- Jackery 1000 v2 B0D7PPG25F: in stock in a late-October copy, no status in another.
- First Alert combo B0CLVRPNZX and CO alarms B0GG9WK5RB: model numbers differ on the page.
- Reliance Aqua-Tainer: retailers disagree on "food grade" and "FDA approved" wording; the card says stores list it as food-grade.

**Red Cross manual:** the 2021 edition still shows; a Revision 2025 exists and may be a better pick.

**Not re-checked in this pass (97):** last evidence Oct 30-31. A dead one still has the search link beside it.

| ASIN | Item | Product |
|---|---|---|
| B013BOC6VC | battery-powered-fan | O2COOL Treva 10-inch battery fan |
| B07QJD6J9L | motion-sensor-night-lights | GE motion-sensor night lights, 2-pack |
| B00N3AGKQM | adhesive-bandages | Band-Aid family variety pack, 120 |
| B001THDDFC | pill-organizer | Ezy Dose weekly AM/PM pill organizer |
| B00171WXII | nasal-aspirator | Frida Baby NoseFrida nasal aspirator |
| B077RXSZN3 | hand-warmers | HotHands hand warmers, 10 pair |
| B008BF2MFM | heated-blanket | Sunbeam Royal Ultra Fleece heated throw |
| B01251Q67W | faucet-covers | Frost King FC1 foam faucet covers, 2-pack |
| B01MZEEUDS | pipe-insulation | Frost King SP512XB6 foam pipe insulation, 6 ft |
| B000HHJ2I2 | box-fan | Lasko 3723 20-inch box fan |
| B013WSOKMU | cooling-towels | Mission Enduracool cooling towel |
| B01H1R0K68 | indoor-thermometer-and-humidity-monitor | ThermoPro TP50 indoor thermometer and humidity monitor |
| B015TKUPIC | portable-jump-starter | NOCO Boost GB40 jump starter |
| B0C1GL5T7G | tire-inflator | AstroAI tire inflator, 12V and wall power |
| B08G3R5B7N | car-phone-mount | iOttie Easy One Touch 5 phone mount |
| B00005OU9D | camp-stove | Coleman Classic 2-burner propane stove |
| B01E45EYJY | shade-canopy | CORE 10x10 instant canopy |
| B01DAWKVBM | wagon | Mac Sports collapsible wagon |
| B002CMQJYU | bug-spray | Sawyer 20% picaridin insect repellent |
| B000QFT1R2 | pet-crate-for-home | MidWest iCrate double-door crate (36-inch) |
| B01M6YASY1 | dog-harness | rabbitgoo no-pull harness |
| B0002AR18C | puppy-chew-toys | KONG Puppy chew toy |
| B00MW8G3YU | puppy-pads | Amazon Basics puppy pads, 50-count |
| B071W6CQ7S | enzyme-cleaner-for-pet-accidents | Nature's Miracle dog stain and odor remover, 32 oz |
| B08WHZGYM9 | airtight-food-storage-bin | IRIS USA airtight pet food bin, 30 lb |
| B0064ACNLO | pet-car-harness | Kurgo Tru-Fit car harness |
| B0727Y5ZD7 | pet-seat-cover | URPOWER waterproof back-seat cover |
| B001OC5UNA | pet-gate | Regalo Easy Step extra-tall walk-through gate |
| B001OC5UNA | baby-gate | Regalo Easy Step extra-tall walk-through gate |
| B006V6YAPI | cordless-drill | BLACK+DECKER 20V MAX drill (LD120VA) |
| B00002X2GQ | tape-measure | STANLEY PowerLock 25-foot tape measure |
| B07WXMY143 | wd-40-or-lubricant | WD-40 Multi-Use with Smart Straw |
| B0006HVM7C | tape-gun | Scotch ST-181 tape gun |
| B00FAW4O0A | air-mattress | SoundAsleep Dream Series queen air mattress |
| B00084F76K | grab-bars | Moen 8724 24-inch grab bar |
| B002VWK0WI | shower-chair | Drive Medical shower chair with back |
| B09QMNYPZG | key-safe | Master Lock 5400EC key lock box |
| B07L44NW69 | reacher-grabber | Vive 32-inch folding reacher |
| B00004WLJ4 | zip-ties | Gardner Bender 46-308UVB 8-inch cable ties, 100-pack |
| B00002N5JF | pliers | Channellock 430 10-inch tongue and groove pliers |
| B005KDDM7A | fridge-and-freezer-thermometers | Rubbermaid Commercial fridge and freezer thermometer (FGR80GC) |
| B0040ZC5AO | plastic-sheeting | Frost King P1025/6W clear plastic sheeting, 10 x 25 ft, 6 mil |
| B07H9L1RW9 | ice-melt | Safe Paw ice melt, 8 lb jug |
| B004Q0BGHG | snow-shovel | True Temper 18-inch poly snow shovel (1603072) |
| B01CS31NV6 | blackout-curtains | NICETOWN thermal blackout curtains, 2 panels |
| B0BFPJKZXG | power-outage-alert-plug | Hendun plug-in power failure alarm |
| B0716HX7YJ | antibiotic-ointment | Neosporin Original antibiotic ointment, 1 oz |
| B07C5RGXVY | elastic-bandage-wraps | ACE 3-inch elastic bandages with hook closure, 2-pack |
| B075DKL3Z6 | tweezers-and-tick-remover | TickCheck tick remover kit with tweezers |
| B00Y8AHZYC | rechargeable-lantern | LE 1000-lumen rechargeable LED lantern |
| B084KX2TC1 | medical-scissors | Madison Supply 7.5-inch trauma shears |
| B00GS8W3T4 | disposable-gloves-for-first-aid | MED PRIDE nitrile exam gloves, 100-count |
| B0007A0AQM | pet-treats-for-training | Zuke's Mini Naturals training treats, chicken, 6 oz |
| B07TJ9SSK8 | collapsible-pet-crate | EliteField 3-door folding soft crate, 36-inch |
| B08T4BW9SS | cat-litter-box-disposable | Kitty Sift disposable litter box with sifting liners, large |
| B0931YZ82P | dash-camera | Garmin Dash Cam Mini 2 |
| B0CKZ8VVJ2 | car-charger-for-every-row | SEEDREAM 4-port car charger with rear-seat extension |
| B0D2RQP7ZR | car-trash-can | EPAuto car trash can with lid, 2.5 gallon |
| B001F731N0 | motion-sickness-relief | Sea-Band acupressure wristbands, 1 pair |
| B0CC6386MJ | headphones-for-kids | JLab JBuddies Folding kids headphones, Gen 2 |
| B07X85FM9M | kids-water-bottles | CamelBak Eddy+ Kids 14 oz stainless steel bottle |
| B07P6MZPK3 | card-games | UNO card game |
| B004KSN8XY | pots-and-pans-starter-set | T-fal Ultimate hard anodized nonstick set, 12 pieces |
| B001LF3ICK | cutting-board-and-knife | GSI Outdoors Santoku knife set with cutting board |
| B0154ASID6 | bed-sheets | Amazon Basics microfiber sheet set, queen |
| B014QOE96G | shower-curtain-and-rings | Amazon Basics fabric shower curtain with hooks, 72 x 72 in |
| B01C3RW88Y | sleeping-pads | Klymit Static V sleeping pad |
| B07QH7D5KM | camp-cookware-set | Stanley Adventure Base Camp cook set for 4 |
| B07S1JPBL3 | bubble-wrap | Amazon Basics bubble wrap, 12 in x 175 ft |
| B002764UJW | labels-and-markers | Sharpie fine point permanent markers, black, 12 count |
| B07MWJ6FBL | moving-blankets | Sure-Max Pro Economy moving blankets, 12-pack |
| B07B8CSHRB | furniture-sliders | Super Sliders 3.5-inch carpet sliders, 8-pack |
| B07G3LBK2K | hand-truck-or-dolly | Harper Trucks BKB85 steel hand truck, 600 lb |
| B00002X204 | utility-knife | STANLEY Classic 99 retractable utility knife (10-099) |
| B0917TH83L | stud-finder | Franklin Sensors ProSensor M150 stud finder |
| B01980DA40 | level | Johnson 24-inch aluminum box level (1741-2400) |
| B008XKVLBG | caulk-and-sealant | GE Supreme silicone kitchen and bath sealant, clear |
| B0F4Q6N93Q | work-flashlight-with-magnet | WORKPRO rechargeable magnetic work light |
| B0GFXHX6WB | ladder | Little Giant Xtra-Lite Plus 5-foot stepladder |
| B00PTX8N52 | dish-soap | Dawn Ultra dish soap, original, 2 × 21.6 oz bottles |
| B07CTQ8THP | dishwasher-detergent | Cascade Platinum ActionPacs, 70 count |
| B086KGK9B7 | laundry-detergent | Tide Original liquid laundry detergent, 92 oz |
| B0B9YVG4LR | laundry-pods | Tide PODS, original, 112 count |
| B00FXNAAW2 | hangers | Amazon Basics slim velvet hangers, 50-pack |
| B073XS3CHV | command-hooks-and-strips | Command medium picture hanging strips, 16 pairs |
| B00ZQXT4EY | diaper-cream | Desitin Maximum Strength diaper rash paste, 4.8 oz |
| B00O03RZNS | crib-sheets | Burt's Bees Baby organic cotton fitted crib sheet |
| B09MVMNW5M | baby-wash | Cetaphil Baby wash and shampoo, 13.5 oz, 2-pack |
| B01644OCVS | baby-nail-file | Frida Baby NailFrida clipper and file set |
| B0FR81RSK3 | folding-table | Lifetime 6-foot fold-in-half table |
| B01F5K9YNS | non-slip-bath-mat | Gorilla Grip suction tub mat, 35 x 16 in |
| B014TIHYAM | handheld-shower-head | Moen Engage Magnetix handheld shower head (26112) |
| B01LZ8ICCY | large-button-phone | Panasonic KX-TGM450S amplified cordless phone |
| B01MTO43LV | mattress-topper | Linenspa 2-inch gel memory foam topper, twin XL |
| B089D7XKVK | shower-caddy | Attmu mesh shower caddy, 2-pack |
| B01MRZE720 | under-bed-storage | Sterilite 56-quart wheeled latching boxes, 4-pack |
| B071F82CYJ | car-trunk-organizer | Drive collapsible trunk organizer |

## To continue

1. `npm run picks -- audit` lists what's left. Search each by ASIN, add a row to the TSV, and for a keeper set `checked` in `picks.ts`.
2. A listing seen as unavailable leaves `picks.ts`; its row stays in the TSV so the test keeps it out.
3. If it fills the food mix, update `nutrition.ts` from a retailer's label.
4. If it's a checklist gear line, update `readiness.ts` and `dailyReadiness.ts`.
5. Stock checks by a person: open `audit/hand-check-links.md` on a phone. The links carry no tag, so they don't count as affiliate clicks.
