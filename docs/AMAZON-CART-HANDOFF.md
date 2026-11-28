# Amazon cart handoff: what we checked (Nov 27, 2026)

**Status: the one-link cart is OFF.** The trip planner ships "Review my Amazon list" instead: one line
per product with the exact package count and one link to that product, plus the local list,
Download list and Copy list. The one-link cart exists only behind a preview test flag
(`lib/shop/amazonCart.ts`), because no current Amazon page documents it and we could not see Amazon's
screen to check titles and quantities.

## What Amazon's own pages say (checked 2026-11-27 US Central / 2026-11-28 UTC)

| Page | What we found |
| --- | --- |
| PA-API 5 "Add to Cart form" — `webservices.amazon.com/paapi5/documentation/add-to-cart-form.html` | HTTP 302 to the Creators API page `paapiv5-deprecation`. The form's documentation is gone. The PA-API docs index redirects the same way. |
| Creators API "PA-API 5 Deprecation Notice" — `affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation` | PA-API 5 "has been deprecated and is being replaced by the Creators API"; PA-API calls now get HTTP 403. No word about carts. |
| Creators API introduction — `.../creatorsapi/docs/en-us/introduction` | Operations: SearchItems, GetItems, GetVariations, GetBrowseNodes. No cart operation. Guessed cart pages (`add-to-cart-form`, `add-to-cart`, `link-format`) are 404. |
| Associates Central "PA API5 Launch FAQ" — `affiliate-program.amazon.com/help/node/topic/GUVFJTV7MGMMNY94` | "Cart API support is removed with PA API 5. You can use Add to Cart form." A launch-era page; its link goes to the page that now redirects. |
| Associates Program Operating Agreement (updated Oct 15, 2025) | The word "cart" does not appear. Special Links must use "the special 'tagged' link formats we provide". |
| Associates Program Policies (updated Apr 14, 2026) | Special Links "may be created by you or made available to you by us" and must carry the Associates tag. A purchase counts when the customer adds the product to their cart and completes the order no later than 89 days after the click. No mention of the multi-item cart form. Special Links may not be used for offline promotion (printed material, ebooks, mailings), so the downloaded list carries no links. |

So: there is no current, documented, supported multi-item cart route for Associates in the US, and no
current page says the Associates tag is credited through it. No current page states an item or
quantity limit either; `MAX_CART_LINES = 20` and `MAX_CART_QTY = 99` are our own caps.

## What other people reported (Oct–Nov 2026, anecdotal, and they disagree)

- A GitHub PR dated Oct 6 says the form redirected to sign-in and came back to `/associates/addtocart`
  with the items and the tag intact; it says crediting can only be checked in an Associates account.
- A PR dated Nov 25 saw an HTTP 302 into Amazon's `/associates/addtocart` flow on amazon.de with both
  ASINs and quantities (an HTTP check, not a browser).
- An issue with browser tests on Nov 6 and Nov 14 found an empty cart from untagged two-item links.
- A PR dated Nov 5 says a signed-in add without a tag redirects to the cart view and adds nothing.
- None of them confirms that Associates commissions are credited.

## Our own attempt

On 2026-11-28 at about 02:05 UTC, the trip's cart link (3 products: 12 one-gallon water jugs, a can
opener, a jar of peanut butter; tag `pleasebeready-20`) was opened once in the coding assistant's browser.
Amazon answered with **"Access restricted. Continued access by an unauthorized AI agent violates
Amazon's Conditions of Use"** and a Continue button. The test stopped there: Continue was not clicked
and no other browser, script or `curl` was tried. Nothing was added to any cart and nothing was ordered.

## What the code does

- `amazonList(plan)`: every row this trip with an exact product (`picks.ts`) and not marked "buy
  nearby" becomes an Amazon line. Rows that share an ASIN merge, counted by the units they need
  together (20 + 10 AAA batteries = one 36-pack, not two). Rows with no exact product, or marked
  nearby, stay on the local list.
- `cartUrl(lines)`: `https://www.amazon.com/gp/aws/cart/add.html?AssociateTag=pleasebeready-20&ASIN.1=…&Quantity.1=…`
  in the trip's priority order. Lines past 20, or with a quantity over 99, stay off the link and are
  listed to open one by one.
- `cartAllowed()`: `MARKETS.US.verified = false`, so the button shows only with `?amazon-cart=test`
  on a build that isn't production (`PBR_DEPLOY` from `VERCEL_ENV`) and a host that isn't
  pleasebeready.com. Tests lock all of this (`trip.test.ts`).
- Nothing opens by itself, nothing is added in the background, and opening a link never marks
  anything bought.

## The check only a person can do

On a phone, signed in to your own Amazon account:

1. Open the preview with `?amazon-cart=test` added to the address.
2. Plan a trip with at least two products and one quantity above 1 (the example plan with 4 people
   and Food added works), then tap **Review my Amazon list** and **Add this trip to Amazon cart**.
3. On Amazon's screen, check every product title and quantity against the list. Note whether Amazon
   asks you to confirm, and what happens to items already in your cart.
4. Do not place an order.
5. A day later, check Associates reporting for the click.

If every title and quantity matches and the tag shows up in reporting, turning it on is a one-line,
reviewed change (`verified: true`). If not, delete the test button and keep the review list.
