export const site = {
  name: 'Snugzap',
  lang: 'en',
  origin: 'https://www.snugzap.com',
  title: 'Snugzap — Independent Software, Tools & Games',
  description:
    'Snugzap is James’ independent home for practical software, thoughtful tools, games and experiments built with care.',
  themeColor: '#f4f0e7',
  author: {
    name: 'James',
    url: 'https://github.com/JTKC00',
  },
  socialImage: {
    path: '/snugzap-og.jpg',
    mimeType: 'image/jpeg',
    width: 1200,
    height: 630,
    alt: 'Snugzap — Useful tools. Small worlds. Built with care.',
  },
} as const

export type PageId = 'home'

export type SitePage = {
  id: PageId
  path: '/'
  indexable: true
  title: string
  description: string
}

export const pages = [
  {
    id: 'home',
    path: '/',
    indexable: true,
    title: site.title,
    description: site.description,
  },
] as const satisfies readonly SitePage[]

export const indexablePages = pages.filter((page) => page.indexable)

export const canonicalUrl = (path: string): string => new URL(path, `${site.origin}/`).href

export const socialImageUrl = canonicalUrl(site.socialImage.path)

export type DeployContext = 'production' | 'deploy-preview' | 'branch-deploy' | 'dev' | 'unknown'

export const resolveDeployContext = (value: string | undefined): DeployContext => {
  switch (value) {
    case 'production':
    case 'deploy-preview':
    case 'branch-deploy':
    case 'dev':
      return value
    default:
      return 'unknown'
  }
}

export const isIndexableContext = (context: DeployContext): boolean => context === 'production'

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: canonicalUrl('/'),
  description: site.description,
  inLanguage: site.lang,
  author: {
    '@type': 'Person',
    name: site.author.name,
    url: site.author.url,
  },
} as const
