# SwiftLocal product page acceptance

Recorded 2026-10-03. These checks validate the static marketing site, not the
Windows application or a production deployment.

| Check | Result |
| --- | --- |
| Lint and typecheck | Passed. |
| Vitest | 4 files, 23 tests passed, including official download/platform guidance and shared navigation. |
| `npm run verify:seo` | Passed all build contexts, artifact cleanup, real preview/dev HTTP requests, redirects, noindex and 404s. |
| Chromium, JavaScript disabled | Homepage, ECHOES and SwiftLocal at 320, 375, 430, 768, 1024 and 1440 px: no horizontal overflow or clipped copy. All images decoded. |
| Keyboard | Native Menu and Projects opened with Enter; Tab reached the first menu link. SwiftLocal now resolves internally. Install disclosure opened with Enter; Skip to content reached the main anchor. |
| Raster assets | Screenshot WebP fully decoded at 1265 × 791; share JPEG at 1200 × 630. Built bytes match source; social JPEG also decoded from HTTP. |
| Representative contrast | Main text 13.67:1, muted text 5.69:1, CTA 7.14:1, local-processing panel text 5.28:1. Palette checks, not a full accessibility audit. |

The page has one H1, unique IDs, working local section links, its own title,
description, canonical, social image and theme color, and `WebPage` JSON-LD.
Its CSS loads only on SwiftLocal; existing ECHOES branding remains intact.
Production sitemap includes exactly the homepage, ECHOES and SwiftLocal.
Preview, unknown and unset build contexts remain noindex.

`/swiftlocal/`, `/swiftlocal/?from=home` and `/swiftlocal/index.html` return 200
from local preview/dev servers. `/swiftlocal?from=home` redirects with 308 and
preserves the query. An unknown SwiftLocal subpath returns branded 404 with
noindex and no canonical. Both download CTAs use official GitHub Releases.

Source references and media provenance are in `SWIFTLOCAL_CONTENT.md` and
`SWIFTLOCAL_ASSETS.json`.
