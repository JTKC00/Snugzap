/** Public editorial data, independent of preview hosts and deployment time. */
export const site = {
  name: 'Snugzap',
  origin: 'https://www.snugzap.com',
  language: 'en',
  author: { name: 'James', url: 'https://github.com/JTKC00' },
  notesUrl: 'https://james.sharing.snugzap.com/',
  title: 'Snugzap — Independent Software, Tools & Games',
  description: 'Snugzap is James’ independent home for practical software, thoughtful tools, games and experiments built with care.',
  image: {
    path: '/snugzap-og.jpg',
    type: 'image/jpeg',
    width: 1200,
    height: 630,
    alt: 'Snugzap — Useful tools. Small worlds. Built with care.',
  },
} as const

// Only published, substantive pages belong here. Fragments and external apps do not.
export const indexablePaths: readonly string[] = ['/']

export const canonicalUrl = (path: string): string => {
  if (!path.startsWith('/') || path.startsWith('//') || /[?#\\]/.test(path)) {
    throw new Error(`Expected a site-relative canonical path: ${path}`)
  }
  const url = new URL(path, site.origin)
  if (url.origin !== site.origin || url.pathname !== path) {
    throw new Error(`Non-canonical path: ${path}`)
  }
  return url.href
}
