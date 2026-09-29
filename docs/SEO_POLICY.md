# Snugzap SEO policy

This document owns how Snugzap decides what can be published, crawled and indexed. It does not claim that any page is indexed, eligible for a rich result, or responsible for traffic or rankings.

## What this site is

Snugzap is one English homepage for James' independent software, games and experiments. The canonical origin is `https://www.snugzap.com`. The only indexable URL is `https://www.snugzap.com/`.

Project detail pages, translations, a blog, keyword landing pages, accounts and a CMS are not part of this site. Do not invent those URLs.

Sibling sites stay separate. `james.sharing.snugzap.com` is Notes. Product destinations such as `https://echoes.snugzap.com/` are the products themselves, not pages of this homepage. Do not put them in this site's sitemap.

## Content readiness before a new URL

Add a URL to the public site only when all of these are true:

- The page exists as real HTML in the production build and returns HTTP 200.
- Its copy is accurate, English, and does not invent customers, metrics, store availability, versions or private environments.
- Title, description, canonical URL and social metadata come from `src/site.ts`.
- The page is listed in the indexable page registry in that same file.
- It is not a 404, redirect, preview, admin tool or unfinished draft.
- Any new image has been fully decoded and matches the declared format, dimensions and alt text.

Until then, do not add the URL to the sitemap or to internal navigation.

## Source of truth

| Concern | Source |
| --- | --- |
| Visible homepage copy and project links | `src/render.ts` and `src/projects.ts` |
| Canonical origin, titles, descriptions, social image, WebSite identity | `src/site.ts` |
| Sitemap membership | indexable pages in `src/site.ts` |
| robots.txt and preview `X-Robots-Tag` | generated from the deploy context at build time |
| Security headers | `netlify.toml` |

Do not keep a second hand-written copy of the homepage in `index.html`. The Vite plugin renders the same document for development and for the production build.

Canonical and social URLs always use `https://www.snugzap.com`, including on Deploy Previews. A preview host is not a canonical identifier.

## English first

The page language is English (`en`). Do not add `hreflang` until a complete translation exists as its own real page. A translated title or a language toggle with no translated body is not enough.

## Crawl, index and access

These are different controls:

- **Crawl** means a robot may fetch the URL. Production `robots.txt` allows fetching and points at the canonical sitemap. Previews also allow fetching so a robot can see `noindex`. `robots.txt` `Disallow` is not how this site keeps previews out of search results.
- **Index** means a search engine may keep the URL as a result. Only the production homepage is eligible to be indexed. Previews, branch deploys, local dev, unknown build contexts and the 404 page send `noindex`.
- **Access** means a person or client can open the URL. `noindex` is not authentication and does not make a preview private.

Netlify may also add its own preview `noindex`. That is an extra check, not the one this repository relies on.

## Production, previews and 404

Netlify sets `CONTEXT` to `production`, `deploy-preview`, `branch-deploy` or `dev`. The build reads that value.

- `production` renders an indexable homepage, a sitemap of that one URL, and a `robots.txt` sitemap line. It does not add `noindex` to the homepage and does not emit a preview `_headers` file.
- Every other context, including a missing or unrecognised `CONTEXT`, renders `noindex` in HTML and writes `X-Robots-Tag: noindex` to `dist/_headers`. Its `robots.txt` allows fetching and does not advertise a sitemap.
- The safe default is `noindex`. A local `npm run build` without `CONTEXT` is therefore not the production artifact.
- `404.html` is always `noindex`. It has no canonical URL and no WebSite or product schema. It is not in the sitemap.
- There is no `/* -> /index.html` rewrite. An unknown path must return 404, not the homepage with status 200.

A preview build followed by a production build must leave a production `dist/` with no leftover preview `_headers` or homepage `noindex`. Vite empties the output directory at the start of each build.

## Structured data

The homepage JSON-LD is a `WebSite` with the public name, canonical URL, description, English language, and James as the person already named on the page, including the public GitHub profile linked in the footer.

Do not add a registered company, postal address, job title, review, rating, price, download count, app-store listing or search box. Do not add `SoftwareApplication` or breadcrumb schema until a real page exists and its visible content supports that type.

Valid JSON is not a rich result. Google's site-name treatment is not guaranteed by this markup.

## Social image

`public/snugzap-og.jpg` must be a real JPEG that a decoder can expand to pixels. The declared type is `image/jpeg` and the declared size is 1200 by 630. Metadata in `src/site.ts` must match those bytes. A file-size check or a JPEG header read is not enough. If decoding fails, replace the file from a verified image and keep the approved paper, wordmark and tagline design. Do not describe a broken file as passing because the build copied it.

The image URL in metadata is the production URL, including on previews.

## Dates and claims

Do not stamp the sitemap with the build time. Omit `lastmod` until a real content-modified date exists. Do not publish patch versions, customer counts, testimonials or private QA URLs on the homepage. ECHOES links to `https://echoes.snugzap.com/` and not to a private repository.

## Boundaries

This repository does not change DNS, Cloudflare, the apex-to-www redirect, or Netlify project settings. Security headers stay in `netlify.toml`. Notes and the individual products are not hosted from this build.

## Checks

Before a SEO change is reviewed, run:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run verify:seo
```

`verify:seo` builds the preview, unknown and production contexts, checks the files on disk, fully decodes the social image, and requests the local preview server. It does not deploy.

Search Console, Bing Webmaster Tools and field Core Web Vitals are outside this check. A green local build is not indexing, a ranking, or permission to merge.
