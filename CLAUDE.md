# PleaseBeReady (pleasebeready.com)
Friendly, calm emergency preparedness — no doomsday. Secular. Accent: **#34D399**.
- Keep the "not professional or medical advice" disclaimer above the footer.

## Open Mirror family rules
- One of 11 Open Mirror LLC sites (hub: openmirrorllc.com, repo djvaughn22/open-mirror). Baseline tag: `mvp-1`.
- **Design:** flat + cool. bg `#0b1220`, surface `#141d2e`, border `#26324c`, text `#e8edf5`, muted `#94a3b8`. No glass, no gradients, **no red**.
- **Shared chrome is SYNCED, not owned here:** `OpenMirrorNav.tsx`, `OpenMirrorFooter.tsx`, `OpenMirrorTheme.tsx` in the app folder are copies from the hub repo `packages/openmirror-ui/`. NEVER edit them here — edit in the hub, run its `scripts/sync-ui.sh`, then rebuild/commit each satellite.
- Nav + footer mount in `layout.tsx`. Footer = OPEN MIRROR LLC · ABOUT · ✝️ ❤️ 🙏 (the icons ARE the CrossHeartPray link — no word).
- ☀️/🌙 family toggle (`om-theme`) lives in the bar; pages that compute JS colors follow the `om-theme` window event.
- **Copy style:** DJ's words. Short, plain, human. Never wordy or AI-sounding.
- **Deploys:** push to `main` = production deploy (Vercel). Batch related edits into one commit.
- **Two kinds of help, never blurred (owner direction 2026-10-07, updated 2026-10-17):** checklists and tools (checklists, guides, supply calculator) and gear picks (Amazon affiliate, folded under each section, disclosure beside the links). No "free", "paid tools" or price wording in public copy (2026-10-17) — describe what visitors can do; keep every Amazon link, tag and commission notice. Never add a price, checkout, or "coming soon" product without a real, working offer. Checklist content lives in `app/lib/readiness.ts`; every advice line must match its linked official guide. Free tools stay on-device (test-locked in `app/lib/readiness.test.ts`). Re-check ASINs by title, not status code.
- **Household planner (`/planner`):** recommendations live in `app/lib/planner/catalog.ts`, sources (with the date each page was checked) in `sources.ts`, math in `calc.ts`. Every item cites a source; only water (1 gal/person/day), 3-day/2-week and the 7-day medicine supply are "official" amounts. Costs are rough planning figures, never Amazon prices. Products must already exist in `gear.ts`. No single-click Amazon cart: the cart form is off unless `NEXT_PUBLIC_AMAZON_CART_FORM=1` after Associates confirms it. Plans are saved on-device only.
