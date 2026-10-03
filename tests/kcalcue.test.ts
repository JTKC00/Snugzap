import { describe, expect, it } from 'vitest'
import { kcalcue } from '../src/kcalcue.ts'
import { renderDocument } from '../src/render.ts'

const html = renderDocument('kcalcue', 'production')

describe('KcalCue introduction', () => {
  it('explains the reviewable flow, uncertainty and current access requirements', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    for (const step of kcalcue.steps) expect(html).toContain(step.title.replaceAll('&', '&amp;'))
    expect(html).toContain('calorie and nutrient ranges')
    expect(html).toContain('Live photo analysis requires sign-in and trial access')
    expect(html).toContain('AI analysis needs a connection')
    expect(html).toContain('Local Demo Mode capture')
    expect(html).toContain('does not add them to your daily records')
    expect(html).toContain('not medical advice')
    expect(html).not.toContain('src/main.ts')
  })

  it('opens the approved application from both CTAs and shares internal navigation', () => {
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>Open KcalCue /g)]
    expect(links.map((link) => link[1])).toEqual([kcalcue.appUrl, kcalcue.appUrl])
    expect(html).toContain('href="/kcalcue/" aria-current="page"')
    expect(html).toContain(`href="${kcalcue.repositoryUrl}"`)
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
    for (const link of html.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(link[1])
    for (const needle of ['localhost', '.run.app', 'netlify.app']) expect(html).not.toContain(needle)
  })

  it('uses KcalCue metadata and branding without inheriting another product’s stylesheet', () => {
    expect(html).toContain('rel="canonical" href="https://www.snugzap.com/kcalcue/"')
    expect(html).toContain('og:url" content="https://www.snugzap.com/kcalcue/"')
    expect(html).toContain('og:image" content="https://www.snugzap.com/kcalcue/kcalcue-og.jpg"')
    expect(html).toContain('<title>KcalCue —')
    expect(html).toContain('href="/src/kcalcue.css"')
    expect(html).not.toContain('href="/src/echoes.css"')
    expect(html).not.toContain('href="/src/swiftlocal.css"')
    expect(html).toContain('class="theme-kcalcue"')
    expect(html).toContain('width="406" height="500"')
    expect(html).toContain('"@type":"WebPage"')
    expect(html).not.toContain('noindex')
  })
})
