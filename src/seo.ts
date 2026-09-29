import { escapeHtml, serializeJsonLd } from './html.ts'
import { canonicalUrl, indexablePaths, site } from './site.ts'

export type BuildEnvironment = { CONTEXT?: string; NETLIFY?: string }
export type PageKind = 'home' | 'not-found'

/** Netlify CONTEXT is authoritative; a local/unknown context stays noindex. */
export const isIndexableBuild = (environment: BuildEnvironment): boolean => {
  if (environment.NETLIFY === 'true' && !environment.CONTEXT) {
    throw new Error('Netlify build context is missing; refusing ambiguous indexing output')
  }
  return environment.CONTEXT === 'production'
}

export const websiteGraph = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite', '@id': `${canonicalUrl('/')}#website`,
      name: site.name, url: canonicalUrl('/'), description: site.description,
      inLanguage: site.language, creator: { '@id': `${canonicalUrl('/')}#creator` },
    },
    {
      '@type': 'Person', '@id': `${canonicalUrl('/')}#creator`,
      name: site.author.name, url: site.author.url,
    },
    {
      '@type': 'WebPage', '@id': `${canonicalUrl('/')}#webpage`,
      name: site.title, url: canonicalUrl('/'), description: site.description,
      inLanguage: site.language, isPartOf: { '@id': `${canonicalUrl('/')}#website` },
    },
  ],
})

export const renderHead = (page: PageKind, indexable: boolean): string => {
  const home = page === 'home'
  const title = home ? site.title : 'Page not found | Snugzap'
  const description = home ? site.description : 'This page could not be found. Return to Snugzap to explore software, tools and games.'
  const robots = home && indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'
  const meta = (key: string, value: string, property = false): string =>
    `<meta ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}" />`
  const base = [
    `<title>${escapeHtml(title)}</title>`,
    meta('description', description), meta('robots', robots),
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
    meta('theme-color', '#f4f0e7'),
  ]
  // A 404 is not a duplicate homepage: no homepage canonical, graph or social card.
  if (!home) return base.join('\n    ')
  const image = canonicalUrl(site.image.path)
  return [...base,
    `<link rel="canonical" href="${canonicalUrl('/')}" />`,
    meta('og:type', 'website', true), meta('og:site_name', site.name, true),
    meta('og:title', title, true), meta('og:description', description, true),
    meta('og:url', canonicalUrl('/'), true), meta('og:image', image, true),
    meta('og:image:type', site.image.type, true),
    meta('og:image:width', String(site.image.width), true),
    meta('og:image:height', String(site.image.height), true),
    meta('og:image:alt', site.image.alt, true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', title),
    meta('twitter:description', description), meta('twitter:image', image),
    meta('twitter:image:alt', site.image.alt),
    `<script type="application/ld+json">${serializeJsonLd(websiteGraph())}</script>`,
  ].join('\n    ')
}

export const renderRobots = (indexable: boolean): string => [
  '# Allow crawling so crawlers can read page-level and HTTP noindex directives.',
  'User-agent: *', 'Allow: /',
  ...(indexable ? [`Sitemap: ${canonicalUrl('/sitemap.xml')}`] : []), '',
].join('\n')

export const renderSitemap = (): string => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexablePaths.map((path) => `  <url><loc>${escapeHtml(canonicalUrl(path))}</loc></url>`).join('\n')}
</urlset>
`

// Generated per build, NOT a global noindex rule in netlify.toml.
export const renderHeaders = (indexable: boolean): string => indexable
  ? '/404.html\n  X-Robots-Tag: noindex, nofollow\n'
  : '/*\n  X-Robots-Tag: noindex, nofollow\n'

export const fillTemplate = (html: string, head: string, body: string): string => {
  for (const marker of ['<!-- snugzap:head -->', '<!-- snugzap:body -->']) {
    if (html.split(marker).length !== 2) throw new Error(`Expected exactly one ${marker}`)
  }
  return html.replace('<!-- snugzap:head -->', () => head)
    .replace('<!-- snugzap:body -->', () => body)
}
