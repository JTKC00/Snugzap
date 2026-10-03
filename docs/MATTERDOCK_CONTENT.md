# MatterDock introduction

The public introduction is `/matterdock/`. The homepage and Projects menu open
this page. Both primary CTAs use the approved public repository at
`https://github.com/JTKC00/MatterDock`.

## Content baseline

Copy was checked against `JTKC00/MatterDock` commit
`747833bdae3d377b723792a382e7a84b5200a568` on 2026-10-03:

- `README.md`: an ongoing matter with its timeline, actions, waiting items,
  next action, people, organisations and documents; Today/Waiting views and
  local metadata search.
- Documents may reference an original file or use a managed workspace copy.
  Backups include records and managed copies; referenced originals need their
  own backup. The page does not promise original-file contents are indexed.
- Prepare Context supports preview/redaction and Markdown, plain-text and JSON
  export. It does not call an AI service. Data export includes JSON, CSV and
  managed document files; backup/restore is a whole-workspace feature.
- Core records stay on the computer and work offline without an account.
  The Windows app has English and Traditional Chinese (Hong Kong) UI languages.
- `docs/RELEASE_CHECKLIST.md`: installer distribution still has signing and
  acceptance conditions. The introduction keeps the active-development label
  and GitHub CTA rather than claiming a ready public download. No Portable,
  macOS, Linux, cloud-sync or automatic-update availability is advertised.

The source’s official tagline, “Keep every matter on track,” is retained. The
page does not publish private matter/organisation identities, demo-seed cases,
local file paths, internal release gates or phase/patch numbers in product copy.
No MatterDock application source, user data or distribution setting is changed.

## Brand and visual provenance

The approved M/dock icon is copied unchanged from `build/icon.svg`, a
self-contained 1024 × 1024 vector master. `scripts/verify-branding.mjs` and the
release checklist identify it as the production Windows branding source.
The introduction uses its actual mark with the warm paper and green workspace
palette from `src/renderer/src/styles/tokens.css`.

The hero’s labelled “Product structure” figure explains the relationship between
history, people, documents, actions/waiting and one next action. It is semantic
HTML, not an application screenshot or an interactive app preview. Existing
repository audit screenshots were not promoted as current product captures.

The 1200 × 630 JPEG share image is a browser capture of the actual rendered
introduction hero with the same verified icon and conceptual overview. It fully
decoded before review; source/build bytes match, and HTTP bytes also decode.
Hashes and dimensions are in `MATTERDOCK_ASSETS.json`.

Title, description, canonical, theme color, social image and sitemap membership
use the existing page registry. `src/matterdock.css` loads only on this page.
