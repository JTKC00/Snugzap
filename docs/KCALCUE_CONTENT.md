# KcalCue product introduction

The public introduction is `/kcalcue/`. The homepage and Projects menu open this
page; both **Open KcalCue** CTAs open `https://kcalcue.snugzap.com/#today`.
The application and its onboarding remain separate from this static site.

## Content baseline

Copy was checked against `JTKC00/KcalCue` commit
`fae873a6658dbda74e1965a7b8fc5bb1be3eea10` on 2026-10-03:

- `README.md`, `src/content/zh-HK.ts` and `src/components/kcalcue-app.tsx`:
  photo selection, reviewable food and portion suggestions, calorie and macro
  ranges, confidence/uncertainty and editable food names, quantities and units.
- `src/components/meal-journal.tsx`: confirmation before saving, Today/History,
  dated meal records, downloaded/offline records and pending sync while the
  app is open. Live analysis requires a connection and signed-in trial access.
- Demo Mode uses sample results rather than real image analysis and does not
  add them to formal daily records. The page distinguishes this from Live.
- The page explains that Live photos go to an AI service. It does not claim
  every feature is local, that all analysis is available to any visitor, or
  that every food can be reliably identified. Nutrition estimates are for
  general reference, not medical advice, matching the product’s own copy.

Internal deployment details, model configuration, API credentials, trial
identities and QA routes are not published. No exact calorie example, real-model
accuracy metric, medical benefit, download count or store listing is invented.

## Brand and interface capture

The icon is copied unchanged from `public/icon.svg`. Colors come from
`src/app/globals.css`: cream `#f7f4ed`, deep green `#174c3d`, mint and coral.
The dedicated introduction stylesheet uses that palette, rounded surfaces and
large readable copy and loads only on KcalCue.

There were no repository screenshots. The pinned app was run locally in its
existing Demo Mode, without AI or cloud credentials, and its actual photo-input
component was captured in Chromium at a 430 px viewport. The screenshot shows
the unchanged plate illustration, camera/image buttons and the app’s own Demo
Mode note. It is cropped to the component, excluding local deployment status,
date/time metadata and developer chrome. The page explicitly captions it as a
local Demo Mode interface capture. No AI analysis, login or meal save was
performed; no personal photograph or record is included.

The PNG capture fully decoded at 406 × 500, then was encoded to WebP at quality
92 without compositional edits. Source/capture and installed hashes are in
`KCALCUE_ASSETS.json`. The 1200 × 630 JPEG share image is a browser capture of
the actual introduction hero, using the same brand and interface asset. Source,
build and HTTP social images were fully decoded; built asset bytes match source.

Canonical, social metadata, theme color and sitemap membership come from the
existing registry in `src/site.ts`. The app’s origin stays out of this sitemap.
