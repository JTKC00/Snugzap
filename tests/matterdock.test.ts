import { describe, expect, it } from 'vitest'
import { matterdock } from '../src/matterdock.ts'
import { renderDocument } from '../src/render.ts'

const html = renderDocument('matterdock', 'production')

describe('MatterDock introduction', () => {
  it('explains the matter workflow and local-data/export boundaries in static HTML', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    for (const item of matterdock.workflow) expect(html).toContain(item.title)
    for (const tool of matterdock.tools) expect(html).toContain(tool.name.replaceAll('&', '&amp;'))
    expect(html).toContain('No account is required')
    expect(html).toContain('Preparing context does not call an AI service')
    expect(html).toContain('Referenced original files need their own backup')
    expect(html).toContain('Product structure')
    expect(html).not.toContain('src/main.ts')
  })

  it('uses the approved repository without claiming a ready public installer', () => {
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>View project on GitHub /g)]
    expect(links.map((link) => link[1])).toEqual([matterdock.repositoryUrl, matterdock.repositoryUrl])
    expect(html).toContain('href="/matterdock/" aria-current="page"')
    expect(html).toContain('Windows desktop app · Active development')
    for (const needle of ['Download for Windows', 'Portable installer', 'macOS available', 'localhost', '.run.app']) expect(html).not.toContain(needle)
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
    for (const link of html.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(link[1])
  })

  it('uses page-specific metadata and its own stylesheet', () => {
    expect(html).toContain('rel="canonical" href="https://www.snugzap.com/matterdock/"')
    expect(html).toContain('og:url" content="https://www.snugzap.com/matterdock/"')
    expect(html).toContain('og:image" content="https://www.snugzap.com/matterdock/matterdock-og.jpg"')
    expect(html).toContain('<title>MatterDock —')
    expect(html).toContain('href="/src/matterdock.css"')
    for (const other of ['echoes', 'swiftlocal', 'kcalcue', 'personal-finance-manager']) expect(html).not.toContain(`href="/src/${other}.css"`)
    expect(html).toContain('class="theme-matterdock"')
    expect(html).toContain('"@type":"WebPage"')
    expect(html).not.toContain('noindex')
  })
})
