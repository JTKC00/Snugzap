import { describe, expect, it } from 'vitest'
import { projects } from '../src/projects.ts'
import {
  escapeHtml,
  renderDocument,
  renderRobots,
  renderRobotsHeader,
  renderSitemap,
  serializeJsonLd,
} from '../src/render.ts'
import { canonicalUrl, indexablePages, resolveDeployContext, site, socialImageUrl, websiteJsonLd } from '../src/site.ts'

const home = renderDocument('home', 'production')
const missing = renderDocument('not-found', 'production')

const idsIn = (html: string): string[] => [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1] ?? '')

const hrefsIn = (html: string): string[] => [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1] ?? '')

describe('static homepage', () => {
  it('contains the full catalogue before any client script runs', () => {
    expect(home).not.toContain('src/main.ts')
    expect(home).toContain('href="/src/styles.css"')
    expect(home).not.toContain('href="/src/echoes.css"')
    expect(home).not.toContain('href="/src/swiftlocal.css"')
    expect(home).not.toContain('href="/src/kcalcue.css"')
    expect(home).not.toContain('href="/src/personal-finance-manager.css"')
    expect(home).not.toContain('class="theme-echoes"')
    expect(home).toContain('<h1 id="hero-title">')
    expect(home.match(/<h1\b/g)).toHaveLength(1)
    expect(home).toContain('Skip to content')
    expect(home).toContain('href="#main-content"')
    expect(home).toContain('Useful tools. Small worlds.')
    expect(home).toContain('Things in motion.')
    expect(home).toContain('More things I make.')
    expect(home).toContain('03 / Archive &amp; future')
    expect(home).toContain('James · Notes')
    expect(home).toContain('A quiet home for things I make.')

    for (const project of projects) {
      expect(home).toContain(`<h3>${project.name}</h3>`)
      expect(home).toContain(project.status)
      for (const link of project.links ?? []) {
        expect(home).toContain(`href="${link.href}"`)
      }
    }

    expect(home).toContain('href="/echoes/"')
    expect(home).not.toContain('href="https://echoes.snugzap.com/"')
    expect(home).not.toContain('https://jtkc00.github.io/ECHOES/')
    expect(home).not.toContain('github.com/JTKC00/ECHOES')
    expect(home.toLowerCase()).not.toContain('localhost')
    expect(home).not.toContain('.run.app')
    expect(home).toContain('href="/kcalcue/"')
    expect(home).not.toContain('https://kcalcue.snugzap.com/')
  })

  it('keeps one production metadata source for canonical, social and structured data', () => {
    const title = escapeHtml(site.title)
    const description = escapeHtml(site.description)

    expect(home.match(/<title>/g)).toHaveLength(1)
    expect(home.match(/name="description"/g)).toHaveLength(1)
    expect(home.match(/rel="canonical"/g)).toHaveLength(1)
    expect(home.match(/property="og:title"/g)).toHaveLength(1)
    expect(home.match(/property="og:description"/g)).toHaveLength(1)
    expect(home.match(/property="og:url"/g)).toHaveLength(1)
    expect(home.match(/name="twitter:title"/g)).toHaveLength(1)
    expect(home.match(/name="twitter:description"/g)).toHaveLength(1)
    expect(home).toContain(`<title>${title}</title>`)
    expect(home).toContain(`property="og:title" content="${title}"`)
    expect(home).toContain(`name="twitter:title" content="${title}"`)
    expect(home).toContain(`name="description" content="${description}"`)
    expect(home).toContain(`property="og:description" content="${description}"`)
    expect(home).toContain(`name="twitter:description" content="${description}"`)
    expect(home).toContain(`rel="canonical" href="${canonicalUrl('/')}"`)
    expect(home).toContain(`property="og:url" content="${canonicalUrl('/')}"`)
    expect(home).toContain(`property="og:image" content="${socialImageUrl}"`)
    expect(home).toContain(`name="twitter:image" content="${socialImageUrl}"`)
    expect(home).toContain(`property="og:image:type" content="${site.socialImage.mimeType}"`)
    expect(home).toContain(`property="og:image:width" content="${site.socialImage.width}"`)
    expect(home).toContain(`property="og:image:height" content="${site.socialImage.height}"`)
    expect(home).toContain(`property="og:image:alt" content="${escapeHtml(site.socialImage.alt)}"`)
    expect(home).not.toContain('noindex')
    expect(home).not.toContain('google-site-verification')

    const jsonLd = home.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)?.[1]
    expect(jsonLd).toBeTruthy()
    expect(JSON.parse(jsonLd ?? '')).toEqual(websiteJsonLd)
    expect(home.match(/application\/ld\+json/g)).toHaveLength(1)
  })

  it('uses unique ids and in-page anchors', () => {
    const ids = idsIn(home)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ['main-content', 'top', 'hero-title', 'projects', 'about', 'notes', 'archive']) {
      expect(ids).toContain(id)
    }
    expect(hrefsIn(home)).toEqual(expect.arrayContaining(['#main-content', '#top', '#projects', '#about']))
  })

  it('escapes text and keeps JSON-LD inside its script', () => {
    expect(escapeHtml('PDF & OCR <script>')).toBe('PDF &amp; OCR &lt;script&gt;')
    expect(home).toContain('PDF &amp; OCR')
    const hostile = serializeJsonLd({ name: '</script><img src=x onerror=alert(1)&q=1>' })
    expect(hostile).not.toContain('<')
    expect(hostile).not.toContain('>')
    expect(JSON.parse(hostile)).toEqual({
      name: '</script><img src=x onerror=alert(1)&q=1>',
    })
  })
})

describe('indexability contexts', () => {
  it('treats only Netlify production as indexable and everything else as noindex', () => {
    expect(resolveDeployContext('production')).toBe('production')
    expect(resolveDeployContext('deploy-preview')).toBe('deploy-preview')
    expect(resolveDeployContext('branch-deploy')).toBe('branch-deploy')
    expect(resolveDeployContext('dev')).toBe('dev')
    expect(resolveDeployContext(undefined)).toBe('unknown')
    expect(resolveDeployContext('')).toBe('unknown')
    expect(resolveDeployContext('qa')).toBe('unknown')

    for (const context of ['deploy-preview', 'branch-deploy', 'dev', 'unknown'] as const) {
      for (const page of indexablePages) {
        const html = renderDocument(page.id, context)
        expect(html).toContain('<meta name="robots" content="noindex" />')
        expect(html).toContain(`rel="canonical" href="${canonicalUrl(page.path)}"`)
        expect(html).not.toContain('netlify.app')
      }
      expect(renderRobots(context)).not.toContain('Disallow')
      expect(renderRobots(context)).not.toContain('Sitemap:')
      expect(renderRobotsHeader(context)).toContain('X-Robots-Tag: noindex')
    }

    expect(renderRobots('production')).toContain('Allow: /')
    expect(renderRobots('production')).toContain(`Sitemap: ${canonicalUrl('/sitemap.xml')}`)
    expect(renderRobots('production')).not.toContain('Disallow')
    expect(renderRobotsHeader('production')).toBeNull()
  })

  it('publishes the homepage and four product pages in the sitemap and keeps the 404 out', () => {
    expect(indexablePages.map((page) => canonicalUrl(page.path))).toEqual(['https://www.snugzap.com/', 'https://www.snugzap.com/echoes/', 'https://www.snugzap.com/swiftlocal/', 'https://www.snugzap.com/kcalcue/', 'https://www.snugzap.com/personal-finance-manager/'])
    expect(renderSitemap()).toContain('<loc>https://www.snugzap.com/</loc>')
    expect(renderSitemap()).toContain('<loc>https://www.snugzap.com/echoes/</loc>')
    expect(renderSitemap()).toContain('<loc>https://www.snugzap.com/swiftlocal/</loc>')
    expect(renderSitemap()).toContain('<loc>https://www.snugzap.com/kcalcue/</loc>')
    expect(renderSitemap()).toContain('<loc>https://www.snugzap.com/personal-finance-manager/</loc>')
    expect(renderSitemap()).not.toContain('lastmod')
    expect(renderSitemap()).not.toContain('echoes.snugzap.com')
    expect(renderSitemap()).not.toContain('404')
    expect(renderSitemap().match(/<loc>/g)).toHaveLength(5)

    expect(missing).toContain('<meta name="robots" content="noindex" />')
    expect(missing).toContain('This page is not here.')
    expect(missing).toContain('href="/"')
    expect(missing).toContain('href="/#projects"')
    expect(missing).not.toContain('rel="canonical"')
    expect(missing).not.toContain('application/ld+json')
    expect(missing).not.toContain('https://www.snugzap.com/')
    expect(missing.match(/<h1\b/g)).toHaveLength(1)
    expect(new Set(idsIn(missing)).size).toBe(idsIn(missing).length)
  })
})
