# KcalCue introduction acceptance

Recorded 2026-10-03. These checks validate the static introduction, not live AI
accuracy, production account access or native-device PWA installation.

| Check | Result |
| --- | --- |
| Lint and typecheck | Passed. |
| Vitest | 5 files, 26 tests passed; includes approved CTAs, access/uncertainty copy, metadata and internal navigation. |
| `npm run verify:seo` | Passed preview, production, unknown, unset and rebuild-cleanup checks, plus real dev/preview HTTP requests. |
| Chromium, JavaScript disabled | Four pages at 320, 375, 430, 768, 1024 and 1440 px; no horizontal overflow or clipped copy, including open navigation menus. |
| Keyboard | Native Menu/Projects disclosures, Tab navigation and Skip to content passed. First three project entries now resolve internally. |
| Images | Interface WebP decoded at 406 × 500; share JPEG at 1200 × 630. All four social images fully decoded from source, build and HTTP. Product asset build bytes match source. |
| Representative contrast | Main text 12.06:1, muted text 6.44:1, CTA 9.66:1, range-panel text 5.78:1, accent text 5.51:1, image caption 6.79:1. Palette checks, not a complete accessibility audit. |

The introduction has one H1, unique IDs and valid local anchors. Its stylesheet
loads only on KcalCue. Its own title, description, canonical, social image and
theme color come from the existing registry; JSON-LD is `WebPage`.

`/kcalcue/`, `/kcalcue/?from=home` and `/kcalcue/index.html` return 200 from local
preview/dev servers. `/kcalcue?from=home` redirects with 308 and preserves the
query. Unknown subpaths return branded noindex 404s with no canonical.

Production sitemap contains exactly the homepage, ECHOES, SwiftLocal and KcalCue
introductions. Other contexts remain noindex, and a production rebuild clears
preview headers. Both app CTAs point to `https://kcalcue.snugzap.com/#today`.

Interface provenance and limits are in `KCALCUE_CONTENT.md` and
`KCALCUE_ASSETS.json`. This page does not modify the KcalCue application.
