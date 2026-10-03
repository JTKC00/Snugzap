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

export type PageId = 'home' | 'echoes' | 'swiftlocal' | 'kcalcue'

export type SocialImage = {
  path: string
  mimeType: string
  width: number
  height: number
  alt: string
}

export type SitePage = {
  id: PageId
  path: '/' | `/${string}/`
  indexable: true
  title: string
  description: string
  themeColor: string
  socialImage: SocialImage
}

export const pages = [
  {
    id: 'home',
    path: '/',
    indexable: true,
    title: site.title,
    description: site.description,
    themeColor: site.themeColor,
    socialImage: site.socialImage,
  },
  {
    id: 'echoes',
    path: '/echoes/',
    indexable: true,
    title: 'ECHOES — Story-driven Turn-based RPG | Snugzap',
    description:
      'Enter Ashenveil as a Resonator in ECHOES, a story-driven turn-based RPG. Meet its characters, explore tactical battles and play the Chapter 1 web demo.',
    themeColor: '#080e18',
    socialImage: {
      path: '/echoes/echoes-og.jpg',
      mimeType: 'image/jpeg',
      width: 1200,
      height: 630,
      alt: 'ECHOES — A fractured world. Stories that resonate. Arlo, Cillian and Luca against a frost-lit world.',
    },
  },
  {
    id: 'swiftlocal',
    path: '/swiftlocal/',
    indexable: true,
    title: 'SwiftLocal — Local-first Windows File Workspace | Snugzap',
    description:
      'Meet SwiftLocal, a local-first Windows workspace for PDF, OCR, Office, image and media tasks. Explore the tools and download the full Windows x64 installer.',
    themeColor: '#f5f7f4',
    socialImage: {
      path: '/swiftlocal/swiftlocal-og.jpg',
      mimeType: 'image/jpeg',
      width: 1200,
      height: 630,
      alt: 'SwiftLocal — Everyday files. One calmer workspace. A local-first Windows app for documents, images and media.',
    },
  },
  {
    id: 'kcalcue',
    path: '/kcalcue/',
    indexable: true,
    title: 'KcalCue — Meal Photos, Nutrition Ranges & Daily Records | Snugzap',
    description:
      'Meet KcalCue, a mobile-first meal journal with AI-assisted food suggestions, calorie and macro ranges, editable portions, and Today and History records.',
    themeColor: '#f7f4ed',
    socialImage: {
      path: '/kcalcue/kcalcue-og.jpg',
      mimeType: 'image/jpeg',
      width: 1200,
      height: 630,
      alt: 'KcalCue — A little clarity, one meal at a time. Meal photos, reviewable nutrition ranges and daily records.',
    },
  },
] as const satisfies readonly SitePage[]

export const pageEntry = (page: SitePage): string => `${page.path.slice(1)}index.html`

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
