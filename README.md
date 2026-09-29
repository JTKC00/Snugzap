# Snugzap

The public home for James' independent software, games and experiments: https://www.snugzap.com/.

## Architecture

Vite + TypeScript, semantic HTML, plain CSS, Vitest and Netlify static hosting.
There is no application server, client-side router, framework migration, analytics, or runtime content API.

Phase 2.2 renders the complete homepage at build time. `index.html` and `404.html` are templates; `vite.config.ts` fills their head/body slots. `src/render.ts` renders the same content for visitors and crawlers. Production HTML includes all six project cards, links and navigation without JavaScript. CSS loads through a regular stylesheet link. `src/main.ts`'s browser `innerHTML` renderer is removed.

## Sources of truth

- `src/projects.ts`: curated catalogue, featured / active / archived grouping, verified public project destinations. Preserve ECHOES' `https://echoes.snugzap.com/` URL from PR #4.
- `src/site.ts`: canonical origin, title, description, site/creator identity, social-image metadata and published page paths.
- `src/seo.ts`: metadata, truthful JSON-LD, context-aware indexing policy, robots, sitemap and headers.
- `src/render.ts`: homepage / not-found markup. Existing design and product copy are retained.

Patch versions remain on the relevant product/release destination, not on this homepage. Product detail pages will be added only when substantive public content exists.

## Development and checks

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run check:seo
```

`npm run build` includes built-output SEO checks. A local build without `CONTEXT` is deliberately **noindex**. Simulate production on macOS/Linux with `CONTEXT=production npm run build`; in PowerShell use `$env:CONTEXT='production'; npm run build`. Reset the variable afterward.

`npm run test:browser` requires Node 22+ and Chrome/Chromium (set `CHROME_PATH` when needed). It checks five widths with site JavaScript off/on, keyboard skip navigation, reduced motion, image decoding and local static 404 behavior. Screenshots and a JSON report go to `artifacts/`.

The read-only GitHub Actions workflow tests production, deploy-preview and branch-deploy builds, including consecutive builds that must not leak a stale sitemap or noindex header. It publishes evidence artifacts, never the website.

## Deployment and indexing

Netlify still runs `npm run build` and publishes `dist`. Existing `netlify.toml` security/cache headers, primary domain, DNS and redirects are unchanged.

| Build | HTML robots | Generated `_headers` | Sitemap |
| --- | --- | --- | --- |
| `CONTEXT=production` | Homepage index/follow | Only `/404.html` noindex | Existing canonical pages only |
| `deploy-preview`, `branch-deploy`, local or unknown | noindex/nofollow | Site-wide noindex/nofollow | Not emitted |

Robots allows crawling in both cases so crawlers can see noindex. Robots/noindex is not access control. Private environments need authentication. Existing Notes, product and QA subdomains are not modified by these rules.

`dist/404.html` provides Netlify's native not-found page; no SPA catch-all rewrite is added. Local tests do not substitute for the actual Netlify 404/header checks after publishing a preview/production build.

The existing social image remains unchanged in this PR. Byte signatures and declared dimensions are not accepted as full validation: the browser must decode the actual built image. An image-decoding failure remains a merge blocker; see the acceptance record for the retained original source fingerprint.

See [SEO policy](docs/SEO_POLICY.md) and [acceptance record](docs/SEO_ACCEPTANCE.md). Search Console, Bing, field Core Web Vitals and real crawler indexing are separate verification layers and must not be inferred from a passing build.
