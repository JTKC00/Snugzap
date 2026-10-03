# Issue #9 — ECHOES product page acceptance

Recorded 2026-10-03 from the local workspace (Node 24.19.0, npm 11.9.0).
Base: `200eb42`, the current `origin/main`. These are local checks, not a claim
of production deployment or search indexing.

## Checks performed

| Check | Result |
| --- | --- |
| `npm ci --offline --cache /workspace/.npm-cache` | Passed; lockfile installation from the supplied environment cache. |
| `npm run lint` | Passed. |
| `npm run typecheck` | Passed. |
| `npm test` | 3 files, 20 tests passed. |
| `npm run verify:seo` | Passed preview, production, unknown, unset-context and production-rebuild checks; includes real HTTP requests to preview and dev servers. |
| Chromium with page JavaScript disabled | Homepage and product page checked at 320, 375, 430, 768, 1024 and 1440 px. No horizontal overflow or clipped copy. Styles loaded, one H1 per page. |
| Artwork | All three source WebPs fully decoded as 480 × 640 RGBA. SHA-256 matches the ECHOES approval ledger. Built bytes match source; all six product-page image instances decoded in Chromium. |
| Keyboard | First Tab reveals Skip to content at top 12 px. Enter navigates to `#main-content`. Existing visible-focus CSS applies to links and CTAs. |

The local server checks required network permission to bind a loopback port.
No authentication, game launch, account creation or gameplay change is part of
these checks.

## Routes and SEO

- `/echoes/`, `/echoes/?from=home` and `/echoes/index.html` return 200 in both
  preview and development servers, with real product HTML.
- `/echoes?from=home` redirects to `/echoes/?from=home` with 308 in those servers.
  Production hosting retains its existing static directory handling.
- Future `/echoes/characters/`, `/echoes/world/`, `/echoes/news/` and a missing
  product path return branded 404 with `noindex` and no canonical.
- Production product HTML has its own title, description, canonical and social
  URL at `https://www.snugzap.com/echoes/`, plus `WebPage` structured data.
- Production sitemap contains exactly the homepage and product introduction.
  The separate game origin stays out of this sitemap.
- Non-production builds put `noindex` in both pages and `_headers`.
  Preview and dev HTTP responses carry `X-Robots-Tag: noindex`; robots.txt allows
  fetching without advertising a sitemap. A production rebuild removes `_headers`.
- The homepage ECHOES link is internal. Both Play ECHOES CTAs on the product page
  use `https://echoes.snugzap.com/`.

Content and artwork provenance are recorded in `ECHOES_CONTENT.md`.

## Shared navigation follow-up

The shared header now has a direct ECHOES entry and a native Projects disclosure
listing ECHOES, SwiftLocal, KcalCue, Personal Finance Manager and MatterDock in
that order. Destinations reuse the catalogue’s approved primary links; external
destinations retain their external indicator and new-tab attributes. Browse all
projects keeps the homepage overview reachable from every page.

At 760 px and below the header uses a native Menu disclosure, with ECHOES first.
Both disclosures work without JavaScript. Browser checks repeated on the homepage
and product page at all six widths with the project menu open: Enter toggled the
appropriate disclosure, Tab reached its first ECHOES link, all five project
destinations matched the catalogue and there was no horizontal overflow.
Lint, typecheck, all 20 tests and the full SEO verification passed again.
