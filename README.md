# pleasebeready

Friendly emergency preparedness for everyone. Calm, practical, one small step at a time.

**Live:** https://pleasebeready.com
**Part of:** [Open Mirror LLC](https://openmirrorllc.com)

## Local dev
```bash
npm install
npm run dev
```

## Deploy
Push to `main` — Vercel auto-deploys production.

## Repo map

- **Production:** https://pleasebeready.com — branch `main`, auto-deploys on push (Vercel).
- **Framework:** Next.js 16.2.6 (App Router). Build: `npm run build`. No test suite.
- **Routes:** `/` (checklist + gear), `/today` (Daily Readiness), `/admin/social`
- **Family chrome:** `OpenMirrorNav.tsx` / `OpenMirrorFooter.tsx` / `OpenMirrorTheme.tsx` are synced copies — canonical source is the hub repo `packages/openmirror-ui/` + `scripts/sync-ui.sh`. Never edit the local copies.
- **Theme:** family ☀️/🌙 toggle; `om-theme` localStorage key; light mode remaps family hexes (see hub `docs/OPEN_MIRROR_PATTERNS.md`).
- **Env vars (names only):** `NEXT_PUBLIC_AMAZON_TAG`, `SITE_BASE_URL`, `SOCIAL_ADMIN_KEY`, `SOCIAL_HASHTAGS`, `CRON_SECRET`
- **External services:** Amazon Associates links (tag `pleasebeready-20`) — verify item titles, never just HTTP 200
- **Protected:** simple, purposeful scope. No ecommerce/accounts/database expansion without explicit approval.
- **Make changes in:** `app/page.tsx`. Future reusable checklist: copy `checklistProgress.ts` pattern from CHP with a `pleasebeready:*:v1` key (see hub `docs/OPEN_MIRROR_PATTERNS.md`).
