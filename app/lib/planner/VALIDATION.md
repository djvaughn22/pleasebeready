# Household planner: validation still needed before release

State at the last local commit. Nothing here has been pushed or deployed.

## Not yet tested
- **Real print dialog.** Print was checked only by re-applying the page's print CSS in the browser pane. Open File > Print (or "Print or save as PDF") in Chrome, Firefox and Safari and check page breaks, that the site chrome is hidden, and that the plan is legible black-on-white.
- **Screen readers.** Only semantics were checked (labels, fieldsets, focus, keyboard). Test with NVDA (Windows) and VoiceOver (macOS and iOS): the status radios, the steppers, the shopping preview region and the live totals.
- **Physical devices and more browsers.** Layouts were checked at 320px, 768px and desktop in the built-in browser only. Check a real phone, Safari/iOS, Firefox and Samsung Internet.

## Needs approval or credentials
- **Amazon listings.** Product names, ASINs and pack sizes come from `app/lib/gear.ts`. They were not re-checked against live listings (that would mean scraping). A pack count above one is used only when the product's own name states it.
- **Amazon cart form.** `NEXT_PUBLIC_AMAZON_CART_FORM` must stay unset until Associates confirms this account may use the cart-form flow. As of 2026-10-17 the endpoint still answers, sends signed-out shoppers to a sign-in page, and Amazon's US documentation page for it redirects to the PA-API deprecation notice.
- **Prices.** The planner shows no prices; totals come only from numbers the visitor types. A price lookup would need Creators API credentials, which require an accepted Associates account with qualifying sales and the primary account owner to register an application. No Creators API route, key or config exists in this repo. If one is added: keep it off by default, call it only from the server with credentials in environment variables, never send planner data (household counts, needs, choices) to it, send only ASINs from `gear.ts`, label every price with its date, and say Amazon's checkout price may differ.

## Content
- Source pages were last read on 2026-10-17 (see `sources.ts`). Re-read them before release. Official amounts are only: 1 gallon of water per person per day, 3-day and 2-week timeframes, and a 7-day medicine supply. Every other amount is labeled a suggestion.

## Keeping the design open
The catalog, sources, calculations and shopping lists are not tied to emergencies by name beyond the catalog data itself. Other planning paths (camping, travel, events) could reuse `calc.ts`, `shopping.ts`, `storage.ts` and the components with a different catalog and buckets. None are in this release, and the site's message stays emergency preparedness.
