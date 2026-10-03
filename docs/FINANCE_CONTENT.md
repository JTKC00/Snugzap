# Personal Finance Manager introduction

The public introduction is `/personal-finance-manager/`. The homepage and
Projects menu open this page. Both primary CTAs use the existing approved public
repository at `https://github.com/JTKC00/Personal-Finance-Manager`.
No public application URL has been confirmed; private deployment URLs from
repository documentation are not promoted or added to the sitemap.

## Content baseline

Copy was checked against `JTKC00/Personal-Finance-Manager` commit
`97ef865267ef06a1a652923ce0a87e2da54e9619` on 2026-10-03:

- `README.md`: transactions and filters, monthly HKD category budgets,
  monthly/yearly/custom-period analysis, savings goals, subscriptions and
  account/transfer management.
- `src/screens/TransactionScreen.tsx`: receipt OCR suggestions, per-field
  confidence, correction and confirmation before saving. Unreadable fields
  are not presented as known facts.
- `src/screens/GoalsScreen.tsx` and `SubscriptionsScreen.tsx`: goal progress
  backed by deposits or linked account balance; recurring payment/trial dates
  and reminders in the app.
- Currency boundaries are explicit: category budgets use HKD, other currencies
  stay separate without exchange-rate conversion, and transactions must match
  the account’s base currency.
- Account-based cloud storage, PWA support and offline caching are described at
  the level supported by the README. OCR needs sign-in and sends the receipt
  image to an AI service. Manual entry remains available.

The page does not invent public signup/download availability, automatic bank
feeds, automatic FX conversion, offline OCR or investment outcomes. No receipt,
transaction amount, merchant, account identity or private financial information
is published. This work does not modify or execute the finance application.

## Brand provenance

The blue-and-white P/wallet icon is copied unchanged from
`public/brand/pfm-icon-512.png`. It fully decoded as 512 × 512 before installation.
`DOC/brand/README.md` records the shared production mark and its master/export
pipeline. `src/theme.ts` supplies the neutral `#f5f5f7` surface and cobalt
`#0066cc` primary color used by the dedicated introduction stylesheet.

The hero presents this actual brand mark, not a fabricated dashboard or a
capture of private account data. The 1200 × 630 JPEG share image is a browser
capture of the rendered introduction hero with the same verified asset.
Source/installed hashes and dimensions are in `FINANCE_ASSETS.json`.

Canonical, title, description, theme color, social image and sitemap membership
use the existing registry in `src/site.ts`. Product styles load only on this page.
