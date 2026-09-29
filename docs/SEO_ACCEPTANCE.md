# SEO acceptance notes — Phase 2.2

Recorded 2026-09-29 from the local workspace on Node v22.14.0 and npm 10.9.7. These notes describe checks that were actually run. They do not claim indexing, rich results, rankings, traffic, or a production deployment.

Base commit: `cedc6a9a6fdeafaf3765304f0259e843809f8615` (`origin/main` after `git fetch origin main` on 2026-09-29). That commit is the merge of PR #4. ECHOES remains `https://echoes.snugzap.com/`.

## Local tests

| Command | Exit | Result |
| --- | --- | --- |
| `npm ci` | 0 | Lockfile install completed. |
| `npm run lint` | 0 | ESLint completed with no findings. |
| `npm run typecheck` | 0 | `tsc --noEmit` completed. |
| `npm test` | 0 | Vitest: 2 files, 15 tests passed. |
| `npm run build` | 0 | Default build. `CONTEXT` was unset, so the artifact is the safe `noindex` output, including `dist/_headers`. |
| `npm run verify:seo` | 0 | Preview, production, unknown-context, and production-rebuild checks passed. Does not deploy. |

`npm test` covers the existing project catalogue plus the static HTML, metadata, escaping, sitemap, robots, and 404 renderer checks.

## Build artifacts

`npm run verify:seo` builds four times without deploying:

1. `CONTEXT=deploy-preview` — homepage and 404 include `noindex`, canonical stays `https://www.snugzap.com/`, `robots.txt` allows fetching and does not advertise a sitemap, `dist/_headers` contains `X-Robots-Tag: noindex`.
2. `CONTEXT=production` — homepage has one H1, six project names, the ECHOES production URL, a hashed CSS link, and no `noindex`. `dist/_headers` is absent. `robots.txt` advertises `Sitemap: https://www.snugzap.com/sitemap.xml`. `sitemap.xml` has one `<loc>` for `https://www.snugzap.com/` and no `lastmod`.
3. `CONTEXT=not-a-netlify-context` — same noindex treatment as a preview, including `dist/_headers`.
4. `CONTEXT=production` again — the unknown-context `_headers` file is gone and the production assertions pass again.

The later plain `npm run build` reproduced the unset-context result: homepage `noindex` is present and `dist/_headers` is `X-Robots-Tag: noindex`.

## Local HTTP

Evidence level: this workspace, not the hosted site.

Production preview (`CONTEXT=production` artifact, `vite preview` on `127.0.0.1:4173`), checked inside `verify:seo` and with a separate `curl`:

- `GET /` returned HTTP 200, `Content-Type: text/html`, and no `X-Robots-Tag`.
- `GET /this-page-does-not-exist` returned HTTP 404 and the branded page.
- `GET /snugzap-og.jpg` returned HTTP 200, `image/jpeg`, and the bytes decoded to 1200×630.

Deploy-preview artifact on the same local preview server:

- Homepage HTTP 200 with HTML `noindex` and response header `X-Robots-Tag: noindex`.
- Missing path HTTP 404, still fetchable, with `noindex` and no canonical.

Dev server (`npx vite` on `127.0.0.1:5173`, `CONTEXT` unset):

- `GET /` returned HTTP 200 with the full homepage, the ECHOES URL, and `noindex`.
- `GET /missing-dev-path` returned HTTP 404, `X-Robots-Tag: noindex`, and the branded page.

## Social image

The `public/snugzap-og.jpg` bytes inherited from `6a11e7b` did not fully decode. Pillow reported a broken data stream, and the file had no JPEG end marker. It was replaced with a baseline JPEG of the existing card: cream paper, Snugzap wordmark, orange “zap”, the tagline “Useful tools. Small worlds. Built with care.”, and “BUILD → TEST → SHIP”.

After replacement:

- `jpeg-js` fully decoded the source file, the built `dist/snugzap-og.jpg`, and the local preview response. All three are 1200×630, and the source and dist SHA-256 hashes match.
- Headless Chrome `createImageBitmap` on `GET /snugzap-og.jpg` from the production preview reported `image/jpeg`, 1200×630.

No cross-platform share debugger was used.

## Browser

Headless Chrome, with Chrome DevTools `Emulation.setScriptExecutionDisabled` set before navigation. An injected classic script did not run. CSS still loaded from `/assets/styles-1L6VvZ4z.css`.

Checked widths: 375, 430, 768, 1024, and 1440. At each width the document had one H1, six project cards, the production canonical URL, the ECHOES link, Projects / Notes / About, and no horizontal overflow.

Keyboard check at 1440: Tab focused “Skip to content” (`top: 12`). Enter moved the URL hash to `#main-content`. Direct navigation to `/#projects` set the hash to `#projects`. The missing path rendered “This page is not here.” with links to `/` and `/#projects`, `noindex`, no canonical, and no JSON-LD.

While the skip link is focused it sits over the left side of the wordmark. That is the existing fixed skip-link placement.

## Hosted Deploy Preview

Evidence level: live HTTP against the automatic Netlify preview for Draft PR #7, `https://deploy-preview-7--snugzap.netlify.app`, on 2026-09-29. This is not production and not `https://www.snugzap.com/`.

| Request | Status | Observed |
| --- | --- | --- |
| `GET /` | 200 | `text/html`; `X-Robots-Tag: noindex`; HTML `noindex`; canonical `https://www.snugzap.com/`; one H1; six project cards; ECHOES `https://echoes.snugzap.com/`; CSS `/assets/styles-1L6VvZ4z.css` |
| `GET /this-page-does-not-exist` | 404 | Branded “This page is not here.”; `noindex`; no canonical; no JSON-LD; `X-Robots-Tag: noindex` |
| `GET /snugzap-og.jpg` | 200 | `image/jpeg`, 44544 bytes; `jpeg-js` decoded 1200×630 |
| `GET /robots.txt` | 200 | `Allow: /`; no `Disallow`; no `Sitemap:` line |
| `GET /sitemap.xml` | 200 | One loc, `https://www.snugzap.com/`; no preview host and no `lastmod` |

GitHub Actions `Check / verify` on that PR also succeeded (Node 20: `npm ci`, lint, typecheck, test, `verify:seo`). Netlify’s deploy-preview check succeeded. No production deploy was requested.

## Not performed

- Search Console and Bing Webmaster Tools were not opened, and no sitemap was submitted.
- Field Core Web Vitals were not measured.
- Google’s rich-result / site-name tester was not run. Local JSON parsing is not a rich-result claim.
- The earlier observation that the apex returns 301 to `https://www.snugzap.com/` and that `www` returns 200 is historical. This run did not send a new request to the public host.
- DNS, Cloudflare, and Netlify project settings were not changed. `netlify.toml` security headers were not edited. Nothing was merged.
