# Personal Finance Manager introduction acceptance

Recorded 2026-10-03. These checks validate the Snugzap introduction, not the
finance application, live OCR, private accounts or a production deployment.

| Check | Result |
| --- | --- |
| Lint and typecheck | Passed. |
| Vitest | 6 files, 29 tests passed, including repository CTAs, currency/OCR boundaries and page-specific metadata. |
| `npm run verify:seo` | Passed preview, production, unknown, unset and rebuild-cleanup checks, plus real dev/preview HTTP requests. |
| Chromium, JavaScript disabled | Five pages at 320, 375, 430, 768, 1024 and 1440 px; no horizontal overflow or clipped copy, including open navigation menus. |
| Keyboard | Native Menu/Projects disclosures, Tab navigation and Skip to content passed. First four project entries now resolve internally. |
| Images | Original brand PNG decoded at 512 × 512; share JPEG at 1200 × 630. All five social JPEGs fully decoded from source, build and HTTP. Asset build bytes match source. |
| Representative contrast | Main text 15.46:1, muted text 5.74:1, CTA 5.57:1, OCR-panel text 5.58:1, accent text 6.64:1. Palette checks, not a complete accessibility audit. |

The page has one H1, unique IDs and valid local section anchors. Its own title,
description, canonical, social image and theme color come from the registry;
JSON-LD is `WebPage`. The finance stylesheet loads only on this page.
The renderer map is exhaustive for all registered page IDs and the branded 404.

`/personal-finance-manager/`, its `?from=home` variant and `index.html` return 200
on local preview/dev servers. The path without a trailing slash redirects with
308 and preserves the query. Unknown subpaths return branded noindex 404s with
no canonical. Both main CTAs use the approved GitHub repository.

Production sitemap contains exactly the homepage and the ECHOES, SwiftLocal,
KcalCue and Personal Finance Manager introductions. Other contexts remain
noindex; production rebuilds clear preview headers. Private finance deployment
URLs and the external product application origins stay out of the sitemap.

Content references and brand provenance are recorded in `FINANCE_CONTENT.md`
and `FINANCE_ASSETS.json`. No private financial record or invented app screenshot
is published.
