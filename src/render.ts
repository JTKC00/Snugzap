import {
  activeProjects,
  archivedProjects,
  featuredProjects,
  type Project,
  type ProjectLink,
  type ProjectStatus,
} from './projects.ts'
import {
  canonicalUrl,
  indexablePages,
  isIndexableContext,
  site,
  socialImageUrl,
  websiteJsonLd,
  type DeployContext,
} from './site.ts'

export type RenderedPage = 'home' | 'not-found'

const externalArrow = '<span aria-hidden="true">↗</span>'

export const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const serializeJsonLd = (value: unknown): string =>
  JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026')

const statusClassName = (status: ProjectStatus): string => {
  switch (status) {
    case 'Playable · Active development':
    case 'Windows release · Active development':
    case 'Desktop app · Active development':
    case 'Web app · Active development':
      return 'status--active'
    case 'PWA · Active validation':
      return 'status--validation'
    case 'Dormant · Future revival':
      return 'status--dormant'
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

const renderLink = (link: ProjectLink): string => {
  const className = link.primary === true ? 'project-link project-link--primary' : 'project-link'
  const attributes = link.external === true ? ' target="_blank" rel="noreferrer"' : ''
  const arrow = link.external === true ? ` ${externalArrow}` : ''

  return `<a class="${className}" href="${escapeHtml(link.href)}"${attributes}>${escapeHtml(link.label)}${arrow}</a>`
}

const renderProject = (project: Project, variant: 'featured' | 'compact' | 'archived', index: number): string => {
  const tags = project.tags ?? []
  const links = project.links ?? []
  const tagList =
    tags.length > 0
      ? `<ul class="project-tags" aria-label="Tags">${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('')}</ul>`
      : ''
  const linkList = links.length > 0 ? `<div class="project-links">${links.map((link) => renderLink(link)).join('')}</div>` : ''
  const detail = project.detail ? `<p class="project-detail">${escapeHtml(project.detail)}</p>` : ''

  return `
    <article class="project-card project-card--${variant} reveal" id="${escapeHtml(project.slug)}" style="--delay: ${index * 70}ms">
      <div class="project-body">
        <p class="project-type">${escapeHtml(project.type)}</p>
        <h3>${escapeHtml(project.name)}</h3>
        <p class="project-summary">${escapeHtml(project.summary)}</p>
        ${detail}
        ${tagList}
      </div>
      <div class="project-aside">
        <p class="status ${statusClassName(project.status)}"><span class="status-mark" aria-hidden="true"></span>${escapeHtml(project.status)}</p>
        ${linkList}
      </div>
    </article>
  `
}

const renderProjects = (items: readonly Project[], variant: 'featured' | 'compact' | 'archived'): string =>
  items.map((project, index) => renderProject(project, variant, index)).join('')

const sectionHref = (id: string, page: RenderedPage): string => (page === 'home' ? `#${id}` : `/#${id}`)

const renderHeader = (page: RenderedPage): string => `
  <header class="site-header">
    <a class="wordmark" href="${page === 'home' ? '#top' : '/'}">Snugzap<span class="wordmark-dot" aria-hidden="true"></span></a>
    <nav aria-label="Main navigation">
      <a href="${sectionHref('projects', page)}">Projects</a>
      <a href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Notes ${externalArrow}</a>
      <a href="${sectionHref('about', page)}">About</a>
    </nav>
  </header>
`

const renderFooter = (): string => `
  <footer class="site-footer">
    <p>© 2026 Snugzap</p>
    <p class="footer-note">Comfort, simplicity and speed.</p>
    <nav class="footer-links" aria-label="Footer">
      <a href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Notes ${externalArrow}</a>
      <a href="${escapeHtml(site.author.url)}" target="_blank" rel="noreferrer">GitHub ${externalArrow}</a>
    </nav>
  </footer>
`

const renderHome = (): string => `
  ${renderHeader('home')}

  <main id="main-content">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero-copy reveal">
        <p class="eyebrow">Independent software &amp; games by James</p>
        <h1 id="hero-title">Snug<span>zap</span></h1>
        <p class="hero-tagline">Useful tools. Small worlds.<br>Built with care.</p>
        <p class="hero-description">A small independent home for practical software, thoughtful experiments and playable worlds.</p>
      </div>
      <div class="hero-foot">
        <a class="hero-scroll" href="#projects">
          <span>Explore projects</span>
          <span class="scroll-line" aria-hidden="true"></span>
        </a>
        <p class="process-motif">
          <span class="sr-only">Build, test, ship.</span>
          <span aria-hidden="true">Build → Test → Ship</span>
        </p>
      </div>
    </section>

    <section class="featured section-shell" id="projects" aria-labelledby="featured-title">
      <div class="section-heading">
        <p class="section-index">01 / Featured work</p>
        <div>
          <h2 id="featured-title">Things in motion.</h2>
          <p>Software, tools and worlds currently being built, tested and released.</p>
        </div>
      </div>
      <div class="project-list project-list--featured">
        ${renderProjects(featuredProjects, 'featured')}
      </div>
    </section>

    <section class="more-projects section-shell" id="more-projects" aria-labelledby="more-title">
      <div class="section-heading">
        <p class="section-index">02 / More projects</p>
        <div>
          <h2 id="more-title">More things I make.</h2>
        </div>
      </div>
      <div class="project-list project-list--compact">
        ${renderProjects(activeProjects, 'compact')}
      </div>
    </section>

    <section class="archive section-shell" id="archive" aria-labelledby="archive-title">
      <h2 id="archive-title" class="section-index">03 / Archive &amp; future</h2>
      <div class="project-list project-list--archive">
        ${renderProjects(archivedProjects, 'archived')}
      </div>
    </section>

    <section class="notes section-shell" id="notes" aria-labelledby="notes-title">
      <div class="notes-inner reveal">
        <div>
          <p class="section-index">04 / Notes</p>
          <h2 id="notes-title">James · Notes</h2>
        </div>
        <div class="notes-copy">
          <p>Thoughts, learning, observations and things worth remembering.</p>
          <a class="text-link" href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Visit Notes ${externalArrow}</a>
        </div>
      </div>
    </section>

    <section class="about section-shell" id="about" aria-labelledby="about-title">
      <p class="section-index">05 / About</p>
      <div class="about-copy reveal">
        <h2 id="about-title">A quiet home for things I make.</h2>
        <div>
          <p>Snugzap brings together “snug” and “zap” — comfort, simplicity and speed.</p>
          <p>It is where I build practical software, explore ideas and make small worlds. Some projects become releases, some remain experiments, and some wait for the right time to return.</p>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter()}
`

const renderNotFound = (): string => `
  ${renderHeader('not-found')}

  <main id="main-content">
    <section class="not-found section-shell" aria-labelledby="not-found-title">
      <p class="section-index">404</p>
      <h1 id="not-found-title">This page is not here.</h1>
      <p>The link may be out of date. You can return to the Snugzap homepage.</p>
      <div class="not-found-links">
        <a class="text-link" href="/">Back to Snugzap</a>
        <a class="text-link" href="/#projects">Browse projects</a>
      </div>
    </section>
  </main>

  ${renderFooter()}
`

const renderSocialMeta = (): string => {
  const title = escapeHtml(site.title)
  const description = escapeHtml(site.description)
  const image = escapeHtml(socialImageUrl)
  const alt = escapeHtml(site.socialImage.alt)
  const url = escapeHtml(canonicalUrl('/'))

  return `
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(site.name)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="${escapeHtml(site.socialImage.mimeType)}" />
    <meta property="og:image:width" content="${site.socialImage.width}" />
    <meta property="og:image:height" content="${site.socialImage.height}" />
    <meta property="og:image:alt" content="${alt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${alt}" />
    <script type="application/ld+json">${serializeJsonLd(websiteJsonLd)}</script>`
}

export const renderDocument = (page: RenderedPage, context: DeployContext): string => {
  const indexable = page === 'home' && isIndexableContext(context)
  const title = page === 'home' ? site.title : `Page not found — ${site.name}`
  const description =
    page === 'home' ? site.description : 'This page is not part of the Snugzap homepage.'
  const body = page === 'home' ? renderHome() : renderNotFound()

  return `<!doctype html>
<html lang="${site.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${indexable ? '' : '<meta name="robots" content="noindex" />'}
    ${page === 'home' ? `<link rel="canonical" href="${escapeHtml(canonicalUrl('/'))}" />` : ''}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/src/styles.css" />
    <meta name="theme-color" content="${escapeHtml(site.themeColor)}" />
    ${page === 'home' ? renderSocialMeta() : ''}
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div id="app">
      ${body}
    </div>
  </body>
</html>
`
}

export const renderSitemap = (): string => {
  const urls = indexablePages
    .map((page) => `  <url>\n    <loc>${escapeHtml(canonicalUrl(page.path))}</loc>\n  </url>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

export const renderRobots = (context: DeployContext): string => {
  const lines = ['User-agent: *', 'Allow: /', '']

  if (isIndexableContext(context)) {
    lines.push(`Sitemap: ${canonicalUrl('/sitemap.xml')}`, '')
  }

  return `${lines.join('\n')}`
}

export const renderRobotsHeader = (context: DeployContext): string | null => {
  if (isIndexableContext(context)) return null

  return ['/*', '  X-Robots-Tag: noindex', ''].join('\n')
}
