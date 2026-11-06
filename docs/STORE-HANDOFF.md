# Store handoff (Amazon picks audit, Nov 5, 2026)

Read this first after a context reset, then continue from "Next steps". Full results: `docs/AMAZON-AUDIT.md`.

## The brief, short
Make the Amazon store dependable, easy to shop, useful for stocking up over time. Audit every Amazon pick against current listings, replace weak ones, prefer gallons, food-grade containers, multipacks and bulk food. No dead ends when a pick is unavailable. Never claim availability we did not verify. No "best" claims, invented prices, certifications or details. Keep essentials first, sensible quantities, one-trip-at-a-time build-up. Standing rule: verified work gets committed and pushed to main (push = production), rollback tag first.

## Rules learned
- Amazon blocks AI agents at the page level ("Access restricted ... Continue"). Do NOT click Continue or try Chrome or curl. Evidence = WebSearch with allowed_domains amazon.com, query `<ASIN> <short name> currently unavailable`. Snapshot, not live stock.
- WebSearch stops at 200 calls per turn and says not to work around it. A new user message resets it. Plan about 8 per message.
- Snapshots contain prices and "bought in past week". Never copy those into the site or the audit log (a test checks the log).
- Grocery listings often show a Fresh style "Not Added" and depend on delivery area.
- "Not found" can be a false negative. Search again by name before calling a listing gone.

## What changed
- `picks.ts`: 46 listings out, 61 picks in, `bulk` role, `count` on 81 entries. All 235 entries searched by ASIN; 232 are dated Nov 5. Older dates are deliberate: the two bottled water rows and the Mountain House bucket are logged "review" and stay on the hand-check list.
- `nutrition.ts`: labels for SKIPPY, Goya beans, Del Monte peaches. `readiness.ts`, `dailyReadiness.ts`: gear lines follow (HotHands B0HHQRWNKN, Champion generator B0D9R2B634); overclaims softened (filter copy, "90% of body heat").
- UI: `BackupLink`/`MoreChoices` on ItemCard, tiles, compare, Food & Water, Get Ready, Lists, Suggestions, teaser, checklist gear, Today. `packsText` on cards and rows. Gallon jugs are an exact row. `tripStages` + `?goal=` on Food & Water. "New to this? Start with 3 days" on the home picker. Associates notice added to `/ready`. CORE now leads with gallons.
- Tests: `app/lib/shop/audit.test.ts`.

## Checked after deploy
First deploy, Nov 5 (commit 9e7ca1c): Vercel success, sweep of 69 pages found 0 problems (tags, notices, wording; our pages only). Search before/after: only "water", "gallon water" and "beans" moved, all for the better. Known wart, not from this work: "beans" also lists winter hats, last ("beanie" prefix match in search.ts).

Second deploy, the rest of the audit: see the last commit on main and `git log`.

Not verified: live stock of anything (see Rules), a tap through to Amazon on a real phone, print preview of the new links.

## Next steps
1. Owner steps: tap through `docs/audit/hand-check-links.md`; register the Creators API (the only automated way to see live stock).
2. Optional: more bulk picks. Canned pasta has no catalog item (Chef Boyardee Overstuffed 12-pack B003XUJ3RK looked fine). Red Cross manual Revision 2025 may beat the 2021 edition.
3. Optional: fix the "beans" search wart in `search.ts`.
