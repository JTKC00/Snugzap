import { describe, expect, it } from 'vitest'
import { finance } from '../src/personal-finance-manager.ts'
import { renderDocument } from '../src/render.ts'

const html = renderDocument('personal-finance-manager', 'production')

describe('Personal Finance Manager introduction', () => {
  it('publishes supported workflows and currency/OCR boundaries in static HTML', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    for (const feature of finance.features) expect(html).toContain(feature.title)
    for (const step of finance.receiptSteps) expect(html).toContain(step.title)
    expect(html).toContain('Category budgets use HKD')
    expect(html).toContain('without exchange-rate conversion')
    expect(html).toContain('OCR requires sign-in')
    expect(html).toContain('make corrections before saving')
    expect(html).not.toContain('src/main.ts')
  })

  it('offers the approved repository destination without inventing a public app URL', () => {
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>View project on GitHub /g)]
    expect(links.map((link) => link[1])).toEqual([finance.repositoryUrl, finance.repositoryUrl])
    expect(html).toContain('href="/personal-finance-manager/" aria-current="page"')
    for (const needle of ['localhost', '.run.app', 'firebaseapp.com', 'web.app', 'Open Personal Finance Manager', 'automatic bank sync']) expect(html).not.toContain(needle)
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
    for (const link of html.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(link[1])
  })

  it('uses its own registry metadata and stylesheet', () => {
    expect(html).toContain('rel="canonical" href="https://www.snugzap.com/personal-finance-manager/"')
    expect(html).toContain('og:url" content="https://www.snugzap.com/personal-finance-manager/"')
    expect(html).toContain('og:image" content="https://www.snugzap.com/personal-finance-manager/finance-og.jpg"')
    expect(html).toContain('<title>Personal Finance Manager —')
    expect(html).toContain('href="/src/personal-finance-manager.css"')
    for (const other of ['echoes', 'swiftlocal', 'kcalcue']) expect(html).not.toContain(`href="/src/${other}.css"`)
    expect(html).toContain('class="theme-personal-finance-manager"')
    expect(html).toContain('"@type":"WebPage"')
    expect(html).not.toContain('noindex')
  })
})
