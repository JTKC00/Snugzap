import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, sep } from 'node:path'

const root = resolve(process.argv[2] ?? 'dist')
const indexable = process.env.CONTEXT === 'production'
const text = (file) => readFileSync(resolve(root, file), 'utf8')
const home = text('index.html')
const missing = text('404.html')
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map((m) => [m[1], m[2]]))
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map((m) => attributes(m[0]))
const meta = (html, name) => {
  const matches = tags(html, 'meta').filter((m) => (m.name ?? m.property) === name)
  assert.equal(matches.length, 1, `Expected one ${name}`)
  return matches[0].content
}
const canonical = 'https://www.snugzap.com/'

for (const html of [home, missing]) {
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, 'One h1 per page')
  assert.equal((html.match(/<main\b/g) ?? []).length, 1, 'One main per page')
  assert.equal((html.match(/<title>/g) ?? []).length, 1, 'One title per page')
  assert.ok(html.includes('<html lang="en">'))
  assert.ok(html.includes('class="skip-link"'))
  assert.ok(!html.includes('<!-- snugzap:'), 'Unfilled template marker')
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
  assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML ids')
  for (const a of tags(html, 'a')) {
    assert.ok(a.href, 'Every anchor must be a real link')
    if (a.href.startsWith('#')) assert.ok(ids.includes(a.href.slice(1)), `Broken fragment ${a.href}`)
    if (a.target === '_blank') assert.ok((a.rel ?? '').split(' ').includes('noreferrer'))
  }
  assert.ok(tags(html, 'script').every((s) => s.type === 'application/ld+json' && !s.src), 'Runtime JS is not required')
  const sheets = tags(html, 'link').filter((l) => l.rel === 'stylesheet')
  assert.ok(sheets.length > 0, 'CSS must load without JavaScript')
  for (const sheet of sheets) {
    assert.ok(sheet.href.startsWith('/assets/') && sheet.href.endsWith('.css'))
    const path = resolve(root, `.${sheet.href}`)
    assert.ok(path.startsWith(root + sep) && existsSync(path), 'Missing built CSS')
  }
}
assert.equal(tags(home, 'article').length, 6)
for (const id of ['echoes', 'swiftlocal', 'kcalcue', 'matterdock', 'personal-finance-manager', 'bookstore']) {
  assert.ok(home.includes(`id="${id}"`), `Missing ${id} in initial HTML`)
}
assert.ok(home.includes('https://echoes.snugzap.com/'))
assert.ok(!home.includes('jtkc00.github.io/ECHOES'))
assert.ok(home.includes('Web app / PWA'))
assert.equal(tags(home, 'link').filter((l) => l.rel === 'canonical').length, 1)
assert.equal(tags(home, 'link').find((l) => l.rel === 'canonical').href, canonical)
assert.equal(meta(home, 'og:url'), canonical)
assert.equal(meta(home, 'description'), meta(home, 'og:description'))
assert.equal(meta(home, 'description'), meta(home, 'twitter:description'))
assert.equal(home.match(/<title>(.*?)<\/title>/s)[1], meta(home, 'og:title'))
assert.equal(meta(home, 'og:title'), meta(home, 'twitter:title'))
assert.equal(meta(home, 'robots'), indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow')
assert.equal(meta(home, 'twitter:card'), 'summary_large_image')
assert.equal(meta(home, 'og:image'), canonical + 'snugzap-og.jpg')
assert.equal(meta(home, 'twitter:image'), meta(home, 'og:image'))
assert.equal(meta(home, 'og:image:type'), 'image/jpeg')
assert.equal(meta(home, 'og:image:width'), '1200')
assert.equal(meta(home, 'og:image:height'), '630')
assert.equal(meta(home, 'og:image:alt'), meta(home, 'twitter:image:alt'))
const scripts = [...home.matchAll(/<script\b[^>]*>(.*?)<\/script>/gs)]
assert.equal(scripts.length, 1)
const graph = JSON.parse(scripts[0][1])
assert.equal(graph['@context'], 'https://schema.org')
assert.deepEqual(graph['@graph'].map((n) => n['@type']), ['WebSite', 'Person', 'WebPage'])
assert.equal(graph['@graph'][0].url, canonical)
assert.equal(graph['@graph'][2].url, canonical)
assert.ok(!JSON.stringify(graph).match(/aggregateRating|reviewCount|offers|SearchAction/))
assert.equal(meta(missing, 'robots'), 'noindex, nofollow')
assert.equal(tags(missing, 'link').filter((l) => l.rel === 'canonical').length, 0)
assert.equal(tags(missing, 'script').length, 0)
assert.ok(missing.includes('Page not found.'))
assert.ok(!text('robots.txt').includes('Disallow: /'), 'Crawlers must see noindex')
assert.equal(text('robots.txt').includes(`Sitemap: ${canonical}sitemap.xml`), indexable)
assert.equal(existsSync(resolve(root, 'sitemap.xml')), indexable, 'Stale/non-production sitemap')
if (indexable) {
  const sitemap = text('sitemap.xml')
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]), [canonical])
  assert.ok(!sitemap.match(/<lastmod>|<priority>|<changefreq>|#|netlify\.app/))
  assert.equal(text('_headers'), '/404.html\n  X-Robots-Tag: noindex, nofollow\n')
} else assert.equal(text('_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n')

const image = readFileSync(resolve(root, 'snugzap-og.jpg'))
assert.equal(image.readUInt16BE(0), 0xffd8, 'JPEG signature')
assert.equal(image.readUInt16BE(image.length - 2), 0xffd9, 'Complete JPEG terminator')
assert.ok(image.length < 200_000, 'Social image budget')
// Byte signatures are not a decoder test. npm run test:browser must also pass Image.decode().
assert.ok(Buffer.byteLength(home) < 50_000, 'HTML budget')
const assets = readdirSync(resolve(root, 'assets'))
assert.ok(!assets.some((name) => name.endsWith('.js')), 'Unexpected client JavaScript')
assert.ok(assets.filter((name) => name.endsWith('.css')).reduce((sum, file) => sum + statSync(resolve(root, 'assets', file)).size, 0) < 25_000, 'CSS budget')
console.log(`SEO output PASS: context=${process.env.CONTEXT ?? 'local'}, complete HTML, metadata, graph, robots, sitemap, headers, image signatures and budgets; full image decode is a separate browser gate.`)
