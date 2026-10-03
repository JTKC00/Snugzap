import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { echoes } from '../src/echoes.ts'
import { pageFromFilename } from '../src/plugin.ts'
import { escapeHtml, renderDocument } from '../src/render.ts'
import { canonicalUrl, pageEntry, pages } from '../src/site.ts'

const html = renderDocument('echoes', 'production')
const page = pages.find((entry) => entry.id === 'echoes')
if (!page) throw new Error('ECHOES must be registered')

describe('ECHOES product page', () => {
  it('renders all product sections without needing client JavaScript', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('<h1 id="echoes-title">ECHOES</h1>')
    expect(html).not.toContain('src/main.ts')
    expect(html).toContain(echoes.status)
    for (const id of ['overview', 'combat', 'story', 'characters', 'development']) {
      expect(html).toContain(`id="${id}"`)
      expect(html).toContain(`href="#${id}"`)
    }
    expect(html).toContain('Main Story')
    expect(html).toContain('追憶短章')
    expect(html).toContain('迴響篇章')
    expect(html).toContain('lang="zh-Hant"')
    expect(echoes.features).toHaveLength(4)
    for (const character of echoes.characters) {
      expect(html).toContain(`id="character-${character.id}"`)
      expect(html).toContain(`src="${character.image}"`)
      expect(html).toContain(`alt="${escapeHtml(character.alt)}"`)
      expect(html).toContain(character.name)
    }
  })

  it('links both Play ECHOES CTAs to the approved game origin', () => {
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>Play ECHOES /g)]
    expect(links.map((link) => link[1])).toEqual([echoes.playUrl, echoes.playUrl])
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/#projects"')
    expect(html).toContain('href="/#about"')
    for (const fragment of ['localhost', '.run.app', 'netlify.app', 'github.com/JTKC00/ECHOES', 'Steam available', '/echoes/world/', '/echoes/news/', '/echoes/characters/']) {
      expect(html).not.toContain(fragment)
    }
  })

  it('has unique ids and every local section link resolves', () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
    for (const link of html.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(link[1])
  })

  it('uses page-specific canonical, title, description, social metadata and WebPage data', () => {
    expect(html).not.toContain('noindex')
    expect(html.match(/rel="canonical"/g)).toHaveLength(1)
    expect(html).toContain(`rel="canonical" href="${canonicalUrl(page.path)}"`)
    for (const key of ['og:title', 'twitter:title']) {
      expect(html).toContain(`${key}" content="${escapeHtml(page.title)}"`)
    }
    expect(html).toContain(`<title>${escapeHtml(page.title)}</title>`)
    for (const key of ['description', 'og:description', 'twitter:description']) {
      expect(html).toContain(`${key}" content="${escapeHtml(page.description)}"`)
    }
    expect(html).toContain(`og:url" content="${canonicalUrl(page.path)}"`)
    expect(html).toContain('class="theme-echoes"')
    expect(html).toContain('href="/src/echoes.css"')
    expect(html).toContain(`theme-color" content="${page.themeColor}"`)
    expect(html).toContain(`og:image" content="${canonicalUrl(page.socialImage.path)}"`)
    expect(html).toContain(`twitter:image" content="${canonicalUrl(page.socialImage.path)}"`)
    const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)?.[1] ?? '{}')
    expect(jsonLd).toMatchObject({ '@type': 'WebPage', name: page.title, url: canonicalUrl(page.path), isPartOf: { url: canonicalUrl('/') } })
    expect(html.match(/application\/ld\+json/g)).toHaveLength(1)
  })
})

describe('registered static page entries', () => {
  it('maps nested files to their own renderer and does not treat unknown files as the homepage', () => {
    const root = path.resolve('work/fixture')
    for (const entry of pages) {
      expect(pageFromFilename(path.join(root, pageEntry(entry)), root)).toBe(entry.id)
    }
    expect(pageFromFilename(path.join(root, '404.html'), root)).toBe('not-found')
    expect(pageFromFilename(path.join(root, 'echoes/world/index.html'), root)).toBe('not-found')
  })
})
