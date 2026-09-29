# Phase 2.2 acceptance record

Base: `cedc6a9a6fdeafaf3765304f0259e843809f8615` (includes ECHOES URL fix #4).
Scope: static rendering, indexing foundation, truthful site schema, assets and regression checks. Design/content expansion, account/DNS changes and production publication are excluded.

## Evidence rules

Use PASS only for an actually executed check. Use BLOCKED for an execution/access obstacle, and UNVERIFIED for a check not performed. GitHub/Netlify build status does not prove external HTTP behavior or search-engine indexing.

## Automated evidence

The `SEO foundation` workflow runs `npm ci`, lint, typecheck, Vitest, built-output checks and browser checks. Its `seo-evidence` artifact contains viewport PNGs and per-context browser results. The workflow never deploys or merges code. Consult the run for this PR's final HEAD, not a prior commit. Merely adding this workflow is not a PASS result.

Netlify's existing integration may create a preview. Verify its `commit_ref`, context and ready state before hosted checks. `dist/_headers` and meta robots must both restrict the preview; production output must not have a global noindex header.

## Social asset source

Complete original source: Phase 2.1 `snugzap-og-q75.jpg`, preserved in the conversation's mounted files. The repository asset is retained pending the actual browser-decoding gate. An attempted binary transfer did not match the original fingerprint and was deliberately not attached to this branch. No unverified replacement is accepted.

- Original JPEG, 1200×630, 35,863 bytes
- Original SHA-256: `bbe506fc832dfb0cd7760d7a3871af8eab0f509ab45914724d67077d5037fb74`
- Original Git blob SHA: `ced24576f825355e2cf1321bfa46c0a7898acd43`
- Original source decoded successfully with Pillow and was visually inspected locally.
- The existing repository asset has different bytes (blob `700725d020981cc6b5e20902f0e95ea08269ae07`). Do not infer complete image integrity from its earlier successful Netlify build.

## Hosting / indexing checklist

| Check | Acceptance requirement |
| --- | --- |
| Preview HTML GET | Complete page; correct project URL; exact www canonical; noindex |
| Preview headers | X-Robots-Tag noindex; existing security headers retained |
| Preview resources | Correct MIME; CSS/image/robots fetch; image fully decodes; sitemap not advertised |
| Unknown route | Actual 404 with not-found page, not homepage 200 |
| Production after merge | Explicitly approved merge; current deploy SHA; complete initial HTML; no accidental noindex |
| Canonical host | Apex permanently redirects to www; www 200; canonical/OG/schema agree |
| Search Console / Bing | Property access, URL Inspection, selected canonical and indexing checked directly |
| Field Core Web Vitals | Real-user data, not a claimed Lighthouse proxy |

At Draft PR creation, production publication of Phase 2.2 is NOT AUTHORIZED. Search Console/Bing indexing and field Core Web Vitals remain UNVERIFIED unless separate direct evidence is attached. A green local or CI check does not close those gates.
