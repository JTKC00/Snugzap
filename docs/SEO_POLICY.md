# Snugzap SEO policy

## Scope and release boundary

This policy covers the public Snugzap mother site. DNS, primary-domain settings, Notes content, product application code, trial accounts, private environments and other subdomains are separate changes. Work lands in a Draft PR, is reviewed, and is merged/published only with James' explicit approval.

SEO means useful, accessible, reliably delivered content; it is not a ranking or traffic guarantee. No hidden keyword text, fabricated testimonials/ratings/prices, doorway pages, forced IP-language redirects, bulk filler articles or made-up update dates.

## Rendering and design

- Build complete HTML, including real `<a href>` links, visible text, headings and project descriptions. Same output for humans and bots; no user-agent-specific rendering.
- Essential content, CSS and navigation work without JavaScript. Progressive enhancement may be added later for genuine interaction.
- Preserve the warm editorial design, semantic landmarks, heading order, keyboard focus, skip link, reduced motion and mobile content parity.
- Read source HTML as well as browser DOM during review. A Lighthouse SEO score is not full SEO acceptance.

## URL identity and indexability

- Canonical origin: `https://www.snugzap.com`; use `src/site.ts` as the source. Preview hostnames never become canonical, OG or JSON-LD identities.
- Each substantive indexable page must have one self-canonical, unique accurate title/description and consistent internal links. Error pages do not canonicalize to the homepage.
- Preserve the user-verified apex 301 to www and www 200. Do not add duplicate redirect rules without a demonstrated defect and approval.
- Unknown routes must return actual 404, not homepage 200. `404.html` is noindex and absent from the sitemap.
- Netlify `CONTEXT=production` enables indexing. Preview, branch, local and unknown contexts are noindex. A Netlify build missing its context fails rather than guessing.
- Generate `_headers` for the specific build context, alongside rather than replacing `netlify.toml`'s existing security/cache headers. Headers declared in TOML are global, not per-context arrays.
- Keep crawlers able to read noindex; blocking everything in robots would prevent that. Neither directive protects private data.
- Sitemap contains only real, public, canonical pages on this origin; currently only `/`. Fragments, preview hosts, product subdomains and planned empty routes do not belong in it.
- Omit `lastmod` until there is a trustworthy content-change source. Do not use build time as a fake content date. Omit unsupported priority/change-frequency decoration.

## Metadata, schema and images

- Generate canonical, title, description, OG, Twitter and schema from shared data. Each relevant tag occurs once in the built head.
- Use WebSite, a truthful Person identity (James, linking to the public GitHub profile already shown on the page), and WebPage relationships. Do not assert a legal corporation, unsupported awards, reviews, prices or SearchAction without an actual matching feature.
- Add SoftwareApplication/BreadcrumbList only to suitable future content. Valid schema alone does not guarantee a rich result.
- Essential product screenshots are normal HTML images with descriptive alternatives, declared dimensions and responsive sizes; decorative imagery has empty alt. Product claims must match actual supported releases.
- A social image passes only when its deployed bytes, content type, dimensions and full decoding pass, not just when a path exists. Preserve the approved visual; checksum changes require reviewing the replacement and decoder evidence.
- Initial guardrails: built homepage below 50 KB, CSS below 25 KB, social image below 200 KB and no client JS for the present non-interactive homepage. These are project budgets, not Google ranking thresholds.

## Content growth and languages

- Keep English for this phase. Introduce a second language only with substantive translations, stable distinct URLs and reciprocal correct hreflang.
- Publish product pages only when they answer real visitor needs: purpose, supported platform, usage, authentic screenshots, limitations, data handling, maintained download/demo destinations.
- KcalCue remains a PWA under validation; no unapproved trial URL. No medical efficacy promise. PFM remains a software description, not investment advice. Store/download/support claims require evidence.
- Notes stays editorially separate and is linked when relevant. Do not manufacture external links or bulk AI articles. No llms.txt or special AI-search scheme is a prerequisite for this foundation.

## Required verification layers

1. Unit tests: grouping, approved URLs, escaping, canonical validation, environment isolation and truthful schema.
2. Build-output checks: actual HTML content/links, singleton metadata, safe JSON-LD, real assets, no runtime renderer, robots/sitemap/header policy and size budgets. Run production → preview → branch → production to catch stale artifacts.
3. Browser: five viewport widths, JS disabled/enabled, no overflow, keyboard skip, reduced motion and social-image decode. Browser screenshots are evidence of the measured build, not of a different deployment.
4. Hosting: exact preview commit, original GET/HEAD HTML, MIME headers, stylesheet/image/robots/sitemap requests, unknown-route 404, non-production X-Robots-Tag. Production verification occurs after authorized merge, with current Netlify deploy SHA and external HTTP evidence.
5. Search engines: property verification, URL Inspection, selected canonical, rendered content, indexing and sitemap processing in Google Search Console; analogous Bing checks. Never infer indexing from the repo or deploy state.
6. Field performance: LCP/INP/CLS from actual user data when available. Targets at the 75th percentile: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. Lack of data is UNVERIFIED, not PASS. A synthetic page load does not establish INP.

## Official references

- Google JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Noindex and crawl access: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Site names / WebSite: https://developers.google.com/search/docs/appearance/site-names
- Structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Web Vitals: https://web.dev/articles/vitals
- Vite HTML transform hook: https://vite.dev/guide/api-plugin#transformindexhtml
- Netlify custom/context headers: https://docs.netlify.com/manage/routing/headers/
- Netlify build context variables: https://docs.netlify.com/build/configure-builds/environment-variables/
