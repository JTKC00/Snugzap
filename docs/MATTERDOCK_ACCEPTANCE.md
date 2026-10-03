# MatterDock introduction acceptance

Recorded 2026-10-03. These checks validate the Snugzap introduction, not Windows
installer readiness, application persistence or a production deployment.

| Check | Result |
| --- | --- |
| Lint and typecheck | Passed. |
| Vitest | 7 files, 32 tests passed, including local-data/export boundaries, repository CTAs and page-specific metadata. |
| `npm run verify:seo` | Passed preview, production, unknown, unset and rebuild cleanup; includes real dev/preview HTTP requests. |
| Chromium, JavaScript disabled | Six pages at 320, 375, 430, 768, 1024 and 1440 px; no horizontal overflow or clipped copy, including open menus. |
| Keyboard | Native Menu/Projects disclosures, Tab navigation and Skip to content passed. All five project-menu entries resolve internally. |
| Images | Approved self-contained SVG rendered in Chromium. The new share JPEG decoded at 1200 × 630; all six social JPEGs decoded from source, build and HTTP. Built product asset bytes match source. |
| Representative contrast | Main text 15.50:1, muted text 6.35:1, CTA 7.46:1, local-data panel text 6.04:1, accent text 8.76:1. Palette checks, not a complete accessibility audit. |

The page has one H1, unique IDs and valid local section anchors. It has its own
registry title, description, canonical, social image, theme color and `WebPage`
JSON-LD. Its stylesheet loads only on MatterDock. The conceptual hero figure is
labelled as product structure and does not imply a captured application screen.

`/matterdock/`, its `?from=home` variant and `/matterdock/index.html` return 200
from local dev/preview servers. The path without a trailing slash redirects with
308 and preserves the query. Unknown subpaths return branded noindex 404s with
no canonical. Both primary CTAs use the approved GitHub repository.

Production sitemap contains exactly the homepage and five product introductions.
Other contexts remain noindex; production rebuilds clear preview headers. The
external products and unknown future pages stay out of the sitemap.

Content references, brand provenance and hashes are in `MATTERDOCK_CONTENT.md`
and `MATTERDOCK_ASSETS.json`. No private matter records, internal seed cases or
unconfirmed public installer claims are published.
