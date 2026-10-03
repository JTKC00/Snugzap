# Snugzap

Snugzap is the public home for James' independent software, games and experiments. The canonical site is [https://www.snugzap.com/](https://www.snugzap.com/).

It gathers practical software, thoughtful tools, playable worlds and preserved experiments in one calm place. The homepage is a focused studio page, not a generic developer portfolio or a product-marketing site.

## Stack

- Vite and TypeScript
- Plain semantic HTML and CSS, rendered at dev and build time
- Vitest for catalogue and SEO checks
- Netlify static hosting

There is no client-side router, CMS or UI framework. The homepage, ECHOES and SwiftLocal product pages are separate HTML documents. Unknown paths return the static 404 page.

## Where content lives

- `src/projects.ts` — the six public projects, their lifecycle and approved links
- `src/render.ts` — the homepage, product pages and 404 markup
- `src/echoes.ts` — ECHOES product copy, story summaries and the expandable character set
- `src/swiftlocal.ts` and `src/swiftlocal.css` — SwiftLocal content and its green desktop-tool identity
- `public/swiftlocal/` — product brand, verified interface screenshot and share image; provenance in `docs/SWIFTLOCAL_CONTENT.md`
- `src/echoes.css` — ECHOES-only visual identity; the studio homepage keeps its own style
- `public/echoes/` — verified artwork copied from ECHOES; provenance is in `docs/ECHOES_CONTENT.md`
- `src/site.ts` — canonical origin, titles, descriptions, social image and the indexable page registry
- `src/plugin.ts` — writes that markup into the dev server and the production build, plus `robots.txt`, `sitemap.xml` and preview `noindex` headers
- `docs/SEO_POLICY.md` — when a URL may be published and how previews stay out of search results

The groups on the homepage come from the project flags, not from list position:

- **Featured work** — `featured`
- **More projects** — neither featured nor archived
- **Archive & future** — `archived`

Lifecycle labels describe where a project is, such as `Windows release · Active development` or `Dormant · Future revival`. They intentionally avoid fast-changing patch versions.

The SwiftLocal card and Projects dropdown open `/swiftlocal/`; its download CTAs point to the official GitHub Releases page.

Only approved public destinations belong in the catalogue. The homepage ECHOES card links to `/echoes/`. The product page’s **Play ECHOES** links open `https://echoes.snugzap.com/`. Do not add localhost addresses, QA revisions, deploy previews, admin consoles or private service URLs.

## Local development

```bash
npm install
npm run dev
```

`npm run dev` serves the same rendered pages as the build. With `CONTEXT` unset, that local page is `noindex`.

## Build contexts

Netlify sets `CONTEXT` when it runs `npm run build`:

| `CONTEXT` | Result |
| --- | --- |
| `production` | Indexable homepage and both product pages, canonical sitemap, no preview `_headers` |
| `deploy-preview`, `branch-deploy`, `dev` | Fetchable pages with `noindex` |
| missing or anything else | Same as a preview: `noindex` |

A plain `npm run build` therefore produces the safe `noindex` artifact. To build the production artifact locally:

```bash
CONTEXT=production npm run build
```

Preview hosts keep the production canonical URLs for each page under `https://www.snugzap.com`. They are not separate canonical sites.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run verify:seo
```

`verify:seo` builds preview, unknown, unset and production contexts, checks `dist`, fully decodes the social image, and requests local preview and development servers. It does not deploy. The policy and the latest local acceptance notes are in `docs/`.

## Deployment

Netlify runs `npm run build` and publishes `dist`. Security headers stay in `netlify.toml`. This repo does not define DNS, Cloudflare or redirect rules, so it stays separate from Notes at `james.sharing.snugzap.com`.

## Adding product sections

`/echoes/` is the official product introduction; the game stays on its own origin.
Only the introduction exists today. Future `/echoes/characters/`, `/echoes/world/`
or `/echoes/news/` pages need real content, a thin HTML entry and an entry in
`src/site.ts` before they can be linked or indexed. Vite build inputs, development
routing, page metadata and sitemap membership use that registry. Unknown paths
continue to return 404.
