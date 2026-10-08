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
- **Three kinds of help, never blurred (owner direction 2026-10-07):** free help (checklists, guides, tools), gear picks (Amazon affiliate, folded under each section, disclosure beside the links), and paid tools (none yet; the homepage says so). Never add a price, checkout, or "coming soon" product without a real, working offer. Checklist content lives in `app/lib/readiness.ts`; every advice line must match its linked official guide. Free tools stay on-device (test-locked in `app/lib/readiness.test.ts`). Re-check ASINs by title, not status code.
