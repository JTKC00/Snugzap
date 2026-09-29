import { describe, expect, it } from 'vitest'
import { canonicalUrl, site } from '../src/site.ts'
import { escapeHtml, serializeJsonLd } from '../src/html.ts'
import { fillTemplate, isIndexableBuild, renderHead, renderHeaders, renderRobots, renderSitemap, websiteGraph } from '../src/seo.ts'
import { renderHomepage, renderLink, renderNotFound } from '../src/render.ts'
import { projects } from '../src/projects.ts'

describe('indexability by deployment context', () => {
  it('indexes the production context only', () => {
    expect(isIndexableBuild({ CONTEXT: 'production', NETLIFY: 'true' })).toBe(true)
  })
  it.each(['deploy-preview', 'branch-deploy', 'dev', 'unknown', ''])('keeps %s noindex', (CONTEXT) => {
    expect(isIndexableBuild({ CONTEXT })).toBe(false)
    expect(renderHead('home', isIndexableBuild({ CONTEXT }))).toContain('noindex, nofollow')
  })
  it('keeps local builds noindex and rejects missing Netlify context', () => {
    expect(isIndexableBuild({})).toBe(false)
    expect(() => isIndexableBuild({ NETLIFY: 'true' })).toThrow()
  })
  it('allows robots crawling in both contexts so noindex can be read', () => {
    for (const indexable of [true, false]) expect(renderRobots(indexable)).not.toContain('Disallow: /')
    expect(renderRobots(true)).toContain('Sitemap: https://www.snugzap.com/sitemap.xml')
    expect(renderRobots(false)).not.toContain('Sitemap:')
  })
  it('never emits a production-wide noindex header', () => {
    expect(renderHeaders(true)).toBe('/404.html\n  X-Robots-Tag: noindex, nofollow\n')
    expect(renderHeaders(false)).toBe('/*\n  X-Robots-Tag: noindex, nofollow\n')
  })
})

describe('metadata and content source', () => {
  it('uses one canonical origin, including previews', () => {
    for (const indexable of [true, false]) {
      const html = renderHead('home', indexable)
      expect(html.match(/rel="canonical"/g)).toHaveLength(1)
      expect(html).toContain('href="https://www.snugzap.com/"')
      expect(html).toContain('property="og:url" content="https://www.snugzap.com/"')
      expect(html).not.toContain('netlify.app')
    }
  })
  it.each(['//evil.example/', '/\\evil', '/?q=1', '/#x', 'https://evil.example/', '/a/../'])('rejects non-canonical path %s', (path) => {
    expect(() => canonicalUrl(path)).toThrow()
  })
  it('keeps title, description and social metadata in a shared source', () => {
    const html = renderHead('home', true).split('<script')[0] ?? ''
    expect(html.split(escapeHtml(site.title))).toHaveLength(4)
    expect(html.split(escapeHtml(site.description))).toHaveLength(4)
    expect(html).toContain('summary_large_image')
    expect(html).toContain('og:image:width" content="1200"')
    expect(html).toContain('og:image:height" content="630"')
  })
  it('emits only existing canonical pages and no fabricated update dates', () => {
    const xml = renderSitemap()
    expect(xml.match(/<loc>/g)).toHaveLength(1)
    expect(xml).toContain('<loc>https://www.snugzap.com/</loc>')
    expect(xml).not.toMatch(/lastmod|changefreq|priority|netlify\.app|#/)
  })
  it('expresses truthful WebSite, Person and WebPage relationships', () => {
    const graph = websiteGraph()['@graph']
    expect(graph.map((entry) => entry['@type'])).toEqual(['WebSite', 'Person', 'WebPage'])
    expect(graph[0]).toMatchObject({ name: 'Snugzap', url: canonicalUrl('/') })
    expect(graph[1]).toMatchObject({ name: 'James', url: site.author.url })
    expect(JSON.stringify(graph)).not.toMatch(/aggregateRating|offers|SearchAction|Organization/)
  })
  it('renders the full catalogue and navigation without a DOM', () => {
    const html = renderHomepage()
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html.match(/<article\b/g)).toHaveLength(6)
    for (const project of projects) {
      expect(html).toContain(escapeHtml(project.name))
      expect(html).toContain(escapeHtml(project.summary))
      for (const link of project.links ?? []) expect(html).toContain(escapeHtml(link.href))
    }
    expect(html).toContain('https://echoes.snugzap.com/')
    expect(html).not.toContain('jtkc00.github.io/ECHOES')
    expect(html).not.toMatch(/<script|innerHTML|document\./)
  })
  it('keeps 404 distinct, noindex and without a homepage canonical', () => {
    const html = renderHead('not-found', true) + renderNotFound()
    expect(html).toContain('Page not found')
    expect(html).toContain('noindex, nofollow')
    expect(html).not.toMatch(/rel="canonical"|application\/ld\+json|og:url/)
    expect(html).toContain('href="/"')
  })
})

describe('safe deterministic rendering', () => {
  it('escapes text and attributes', () => {
    expect(escapeHtml(`<>&"'`)).toBe('&lt;&gt;&amp;&quot;&#39;')
  })
  it('prevents script termination in JSON-LD', () => {
    const value = { text: '</script><script>alert(1)</script>&\u2028\u2029' }
    const result = serializeJsonLd(value)
    expect(result).not.toContain('<')
    expect(JSON.parse(result)).toEqual(value)
  })
  it('rejects dangerous links rather than merely escaping them', () => {
    expect(() => renderLink({ label: 'Bad', href: 'javascript:alert(1)' })).toThrow()
    expect(() => renderLink({ label: 'Bad', href: 'https://user:pass@example.com/' })).toThrow()
  })
  it('requires exactly one head and body slot and preserves dollar strings', () => {
    expect(fillTemplate('<!-- snugzap:head --><!-- snugzap:body -->', '$&', '$`')).toBe('$&$`')
    expect(() => fillTemplate('no slots', 'head', 'body')).toThrow()
    expect(() => fillTemplate('<!-- snugzap:head --><!-- snugzap:head --><!-- snugzap:body -->', '', '')).toThrow()
  })
})
