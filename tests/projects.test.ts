import { describe, expect, it } from 'vitest'
import { activeProjects, archivedProjects, featuredProjects, projects, type Project } from '../src/projects.ts'
import { canonicalUrl, pages } from '../src/site.ts'

const names = (items: readonly Pick<Project, 'name'>[]): string[] => items.map((project) => project.name)

const linksOf = (project: Project | undefined) => project?.links?.map((link) => link.href) ?? []

describe('project catalogue', () => {
  it('lists exactly the six public projects', () => {
    expect(names(projects)).toEqual([
      'ECHOES',
      'SwiftLocal',
      'KcalCue',
      'MatterDock',
      'Personal Finance Manager',
      'Bookstore',
    ])
  })

  it('features ECHOES, SwiftLocal and KcalCue', () => {
    expect(names(featuredProjects)).toEqual(['ECHOES', 'SwiftLocal', 'KcalCue'])
    expect(featuredProjects.every((project) => project.featured === true && project.archived !== true)).toBe(true)
  })

  it('keeps MatterDock and Personal Finance Manager in more projects', () => {
    expect(names(activeProjects)).toEqual(['MatterDock', 'Personal Finance Manager'])
    expect(activeProjects.every((project) => project.featured !== true && project.archived !== true)).toBe(true)
  })

  it('archives only Bookstore', () => {
    expect(names(archivedProjects)).toEqual(['Bookstore'])
    expect(projects.filter((project) => project.archived).map((project) => project.name)).toEqual(['Bookstore'])
    expect(archivedProjects.every((project) => project.archived === true)).toBe(true)
  })

  it('partitions featured, active and archived work without overlap', () => {
    const grouped = [...featuredProjects, ...activeProjects, ...archivedProjects]
    expect(names(grouped).sort()).toEqual(names(projects).sort())
    expect(new Set(names(grouped)).size).toBe(projects.length)
  })

  it('keeps names and slugs unique', () => {
    const projectNames = names(projects)
    const slugs = projects.map((project) => project.slug)

    expect(new Set(projectNames).size).toBe(projectNames.length)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs.every((slug) => slug.length > 0)).toBe(true)
  })

  it('publishes only registered internal pages or safe https destinations', () => {
    const hrefs = projects.flatMap((project) => linksOf(project))

    expect(hrefs.length).toBeGreaterThan(0)

    for (const href of hrefs) {
      if (href.startsWith('/')) {
        expect(pages.some((page) => page.path === href)).toBe(true)
      }
      const url = new URL(href, canonicalUrl('/'))

      expect(url.protocol).toBe('https:')
      expect(href.startsWith('/') || href.startsWith('https://')).toBe(true)
      expect(href.toLowerCase()).not.toContain('localhost')
      expect(href.toLowerCase()).not.toContain('.run.app')
      expect(href.toLowerCase()).not.toMatch(/netlify\.app|vercel\.app|pages\.dev|deploy-preview|amplifyapp\.com/)
      expect(url.hostname).not.toMatch(/console\.(cloud\.google|firebase\.google|aws\.amazon)\.com|portal\.azure\.com/)
    }
  })

  it('includes the approved public destinations', () => {
    const echoes = projects.find((project) => project.slug === 'echoes')
    const swiftLocal = projects.find((project) => project.slug === 'swiftlocal')
    const kcalCue = projects.find((project) => project.slug === 'kcalcue')
    const matterDock = projects.find((project) => project.slug === 'matterdock')
    const finance = projects.find((project) => project.slug === 'personal-finance-manager')
    const bookstore = projects.find((project) => project.slug === 'bookstore')

    expect(linksOf(echoes)).toEqual(['/echoes/'])
    expect(echoes?.links?.[0]).toMatchObject({ label: 'Explore ECHOES', primary: true })
    expect(echoes?.links?.[0]?.external).not.toBe(true)
    expect(linksOf(swiftLocal)).toEqual([
      '/swiftlocal/',
      'https://github.com/JTKC00/SwiftLocal/releases/latest',
      'https://github.com/JTKC00/SwiftLocal',
    ])
    expect(swiftLocal?.links?.[0]).toMatchObject({ label: 'Explore SwiftLocal', primary: true })
    expect(swiftLocal?.links?.[0]?.external).not.toBe(true)
    expect(linksOf(kcalCue)).toEqual([
      '/kcalcue/',
      'https://github.com/JTKC00/KcalCue',
    ])
    expect(kcalCue?.links?.[0]).toMatchObject({
      label: 'Explore KcalCue',
      href: '/kcalcue/',
      primary: true,
    })
    expect(kcalCue?.links?.[0]?.external).not.toBe(true)
    expect(kcalCue?.links?.[1]).toMatchObject({
      label: 'View repository',
      href: 'https://github.com/JTKC00/KcalCue',
    })
    expect(kcalCue?.links?.[1]?.primary).not.toBe(true)
    expect(linksOf(matterDock)).toEqual(['https://github.com/JTKC00/MatterDock'])
    expect(linksOf(finance)).toEqual(['https://github.com/JTKC00/Personal-Finance-Manager'])
    expect(linksOf(bookstore)).toEqual(['https://github.com/JTKC00/bookstore_2.0'])
    expect(linksOf(echoes).some((href) => href.includes('github.com/JTKC00/ECHOES'))).toBe(false)
  })

  it('describes lifecycle without patch versions or store claims', () => {
    const patchVersion = /\bv\d+\.\d+(?:\.\d+)?\b/i

    for (const project of projects) {
      expect(patchVersion.test(project.status)).toBe(false)
      expect(patchVersion.test(project.summary)).toBe(false)
      expect(project.links?.every((link) => link.external === true || link.href.startsWith('/'))).toBe(true)
    }

    expect(projects.find((project) => project.slug === 'kcalcue')).toMatchObject({
      type: 'Web app / PWA',
      status: 'PWA · Active validation',
    })
    expect(projects.find((project) => project.slug === 'swiftlocal')?.status).toBe('Windows release · Active development')
    expect(JSON.stringify(projects).toLowerCase()).not.toContain('microsoft store')
  })
})
