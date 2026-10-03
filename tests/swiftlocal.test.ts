import { describe, expect, it } from 'vitest'
import { renderDocument } from '../src/render.ts'
import { swiftlocal } from '../src/swiftlocal.ts'

const html = renderDocument('swiftlocal', 'production')

describe('SwiftLocal product introduction', () => {
  it('publishes the real supported platform and approved download entry', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('Windows x64 is the officially supported platform')
    expect(html).toContain('macOS is experimental and Linux is not officially supported')
    expect(html).toContain('layout preservation is best-effort')
    expect(html).toContain('Online media URL features need an internet connection')
    expect(html).toContain('current installer is unsigned')
    const downloads = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>Download for Windows /g)]
    expect(downloads.map((link) => link[1])).toEqual([swiftlocal.downloadUrl, swiftlocal.downloadUrl])
    expect(html).toContain(`href="${swiftlocal.repositoryUrl}"`)
    expect(html).not.toContain('Microsoft Store')
  })

  it('has its own metadata, social image and stylesheet while sharing navigation', () => {
    expect(html).toContain('<title>SwiftLocal —')
    expect(html).toContain('rel="canonical" href="https://www.snugzap.com/swiftlocal/"')
    expect(html).toContain('og:url" content="https://www.snugzap.com/swiftlocal/"')
    expect(html).toContain('og:image" content="https://www.snugzap.com/swiftlocal/swiftlocal-og.jpg"')
    expect(html).toContain('href="/src/swiftlocal.css"')
    expect(html).not.toContain('href="/src/echoes.css"')
    expect(html).toContain('href="/swiftlocal/" aria-current="page"')
    expect(html).toContain('"@type":"WebPage"')
    expect(html).not.toContain('noindex')
  })

  it('provides full static content with valid section anchors', () => {
    for (const workspace of swiftlocal.workspaces) expect(html).toContain(workspace.headline)
    expect(html).toContain('width="1265" height="791"')
    expect(html).toContain('Before you install</summary>')
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
    for (const link of html.matchAll(/href="#([^"]+)"/g)) expect(ids).toContain(link[1])
    expect(html).not.toContain('src/main.ts')
  })
})
