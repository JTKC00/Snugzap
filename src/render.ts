import { echoes } from './echoes.ts'
import {
  activeProjects,
  archivedProjects,
  featuredProjects,
  projects,
  type Project,
  type ProjectLink,
  type ProjectStatus,
} from './projects.ts'
import {
  canonicalUrl,
  indexablePages,
  isIndexableContext,
  pages,
  site,
  websiteJsonLd,
  type DeployContext,
  type PageId,
  type SitePage,
} from './site.ts'

export type RenderedPage = PageId | 'not-found'

const externalArrow = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3 9 9 3M3 3h6v6" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>'

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

const navigationProjects = ['echoes', 'swiftlocal', 'kcalcue', 'personal-finance-manager', 'matterdock']
  .flatMap((slug) => projects.filter((project) => project.slug === slug))

const renderNavigation = (page: RenderedPage): string => `
  <a class="nav-echoes" href="/echoes/"${page === 'echoes' ? ' aria-current="page"' : ''}>ECHOES</a>
  <details class="projects-menu">
    <summary>Projects</summary>
    <div class="projects-popup">
      ${navigationProjects.map((project) => {
        const link = project.links?.find((link) => link.primary)
        if (!link) return ''
        const attributes = link.external ? ' target="_blank" rel="noreferrer"' : ''
        return `<a href="${escapeHtml(link.href)}"${attributes}>${escapeHtml(project.name)}${link.external ? ` ${externalArrow}` : ''}</a>`
      }).join('')}
      <a class="nav-all-projects" href="${sectionHref('projects', page)}">Browse all projects</a>
    </div>
  </details>
  <a href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Notes ${externalArrow}</a>
  <a href="${sectionHref('about', page)}">About</a>
`

const renderHeader = (page: RenderedPage): string => `
  <header class="site-header">
    <a class="wordmark" href="${page === 'home' ? '#top' : '/'}">Snugzap<span class="wordmark-dot" aria-hidden="true"></span></a>
    <nav class="desktop-navigation" aria-label="Main navigation">${renderNavigation(page)}</nav>
    <details class="mobile-menu">
      <summary>Menu</summary>
      <nav aria-label="Main navigation">${renderNavigation(page)}</nav>
    </details>
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

const renderPlayLink = (): string =>
  `<a class="echoes-play" href="${escapeHtml(echoes.playUrl)}" target="_blank" rel="noreferrer">Play ECHOES ${externalArrow}</a>`

const renderEchoes = (): string => `
  ${renderHeader('echoes')}
  <main id="main-content" class="echoes-page">
    <section class="echoes-hero" id="top" aria-labelledby="echoes-title">
      <img class="echoes-hero-world" src="/echoes/resonance-world.webp" width="1600" height="900" alt="" aria-hidden="true" fetchpriority="high" />
      <div class="echoes-hero-inner">
      <div class="echoes-hero-copy reveal">
        <p class="eyebrow">Story-driven · Turn-based RPG</p>
        <h1 id="echoes-title">${escapeHtml(echoes.name)}</h1>
        <p class="echoes-subtitle" lang="zh-Hant">${escapeHtml(echoes.subtitle)}</p>
        <p class="echoes-tagline">${echoes.tagline.split('\n').map(escapeHtml).join('<br>')}</p>
        <p class="hero-description">${escapeHtml(echoes.positioning)}</p>
        <div class="echoes-actions">${renderPlayLink()}<a class="text-link" href="#overview">Discover the game <span aria-hidden="true">↓</span></a></div>
        <p class="status status--active echoes-status"><span class="status-mark" aria-hidden="true"></span>${escapeHtml(echoes.status)}</p>
      </div>
      <div class="echoes-key-visual reveal" role="img" aria-label="ECHOES companions: Arlo, Cillian and Luca">
        <div class="echoes-orbit" aria-hidden="true"><span></span></div>
        <img class="echoes-visual-arlo" src="${echoes.characters[0].image}" width="480" height="640" alt="" />
        <img class="echoes-visual-cillian" src="${echoes.characters[2].image}" width="480" height="640" alt="" />
        <img class="echoes-visual-luca" src="${echoes.characters[1].image}" width="480" height="640" alt="" />
        <p class="echoes-visual-caption" aria-hidden="true">Across time. Across worlds.</p>
      </div>
      </div>
    </section>

    <nav class="echoes-nav" aria-label="ECHOES sections">
      <a href="#overview">Overview</a><a href="#combat">Combat</a><a href="#story">Story</a><a href="#characters">Characters</a><a href="#development">Development</a>
    </nav>

    <section class="section-shell" id="overview" aria-labelledby="overview-title">
      <div class="section-heading">
        <p class="section-index">01 / Game overview</p>
        <div><h2 id="overview-title">Connections in a fractured world.</h2><p>${escapeHtml(echoes.overview)}</p></div>
      </div>
      <div class="echoes-world-layout">
      <figure class="echoes-world-art"><img src="/echoes/frost-district.webp" width="1672" height="941" alt="A frost-covered district of Ashenveil, with blue fractures across the ground" loading="lazy" decoding="async" /><figcaption>Ashenveil / Chapter 1 environment artwork</figcaption></figure>
      <div class="echoes-feature-grid">${echoes.features.map((feature, index) => `
        <article class="echoes-feature"><span class="echoes-feature-index" aria-hidden="true">0${index + 1}</span><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.description)}</p></article>
      `).join('')}</div>
      </div>
    </section>

    <section class="section-shell" id="combat" aria-labelledby="combat-title">
      <div class="section-heading">
        <p class="section-index">02 / Combat</p>
        <div><h2 id="combat-title">Every turn is a choice.</h2><p>Turn-based encounters reward attention to your party and the enemy. A clear action timeline helps you plan the next move.</p></div>
      </div>
      <div class="echoes-combat-layout">
      <figure class="echoes-combat-media"><img src="/echoes/frost-boss.webp" width="1672" height="941" alt="The frost-lit reactor chamber used for Chapter 1’s boss battle" loading="lazy" decoding="async" /><figcaption>Inside the frost / Battle environment artwork</figcaption></figure>
      <ol class="echoes-combat-list">${echoes.combat.map((step, index) => `
        <li><span class="echoes-step" aria-hidden="true">0${index + 1}</span><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.description)}</p></div></li>
      `).join('')}</ol>
      </div>
    </section>

    <section class="section-shell" id="story" aria-labelledby="story-title">
      <div class="section-heading"><p class="section-index">03 / Story</p><div><h2 id="story-title">One world. Many lives.</h2><p>A main journey and personal stories, each revealing another part of ECHOES.</p></div></div>
      <div class="echoes-story-grid">${echoes.stories.map((story) => `
        <article class="echoes-story" id="${story.id}"><div class="echoes-story-art"><img src="${story.image}" width="${story.width}" height="${story.height}" alt="${escapeHtml(story.alt)}" loading="lazy" decoding="async" /></div><div class="echoes-story-copy"><p class="eyebrow"${story.id === 'main-story' ? '' : ' lang="zh-Hant"'}>${escapeHtml(story.subtitle)}</p><h3>${escapeHtml(story.title)}</h3><p>${escapeHtml(story.description)}</p></div></article>
      `).join('')}</div>
      <p class="echoes-media-note">Environment artwork from the world of ECHOES.</p>
    </section>

    <section class="section-shell" id="characters" aria-labelledby="characters-title">
      <div class="section-heading"><p class="section-index">04 / Characters</p><div><h2 id="characters-title">Meet a few of the echoes.</h2><p>Companions with their own strengths, responsibilities and stories to discover.</p></div></div>
      <div class="echoes-character-grid">${echoes.characters.map((character) => `
        <article class="echoes-character" id="character-${character.id}">
          <div class="echoes-character-art"><img src="${escapeHtml(character.image)}" alt="${escapeHtml(character.alt)}" width="480" height="640" loading="lazy" decoding="async" /></div>
          <div class="echoes-character-copy"><p class="eyebrow">${escapeHtml(character.role)}</p><h3>${escapeHtml(character.name)}</h3><p class="echoes-native-name" lang="zh-Hant">${escapeHtml(character.nativeName)}</p><p>${escapeHtml(character.description)}</p></div>
        </article>
      `).join('')}</div>
    </section>

    <section class="section-shell" id="development" aria-labelledby="development-title">
      <div class="section-heading"><p class="section-index">05 / Development</p><div><h2 id="development-title">A world still in motion.</h2><p>${escapeHtml(echoes.development)}</p><p class="status status--active"><span class="status-mark" aria-hidden="true"></span>${escapeHtml(echoes.status)}</p><p>The demo is a first step into ECHOES. Content and balance will continue to evolve as development progresses.</p></div></div>
    </section>

    <section class="section-shell echoes-final" aria-labelledby="echoes-final-title">
      <div class="echoes-final-orbit" aria-hidden="true"></div>
      <p class="eyebrow">Your first resonance awaits</p><h2 id="echoes-final-title">Step into ECHOES.</h2><p>Start the Chapter 1 web demo in your browser.</p>${renderPlayLink()}
    </section>
  </main>
  ${renderFooter()}
`

const renderSocialMeta = (page: SitePage): string => {
  const title = escapeHtml(page.title)
  const description = escapeHtml(page.description)
  const image = escapeHtml(canonicalUrl(page.socialImage.path))
  const alt = escapeHtml(page.socialImage.alt)
  const url = escapeHtml(canonicalUrl(page.path))
  const jsonLd = page.id === 'home' ? websiteJsonLd : {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    url: canonicalUrl(page.path),
    description: page.description,
    inLanguage: site.lang,
    isPartOf: { '@type': 'WebSite', name: site.name, url: canonicalUrl('/') },
  }

  return `
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(site.name)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="${escapeHtml(page.socialImage.mimeType)}" />
    <meta property="og:image:width" content="${page.socialImage.width}" />
    <meta property="og:image:height" content="${page.socialImage.height}" />
    <meta property="og:image:alt" content="${alt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${alt}" />
    <script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>`
}

export const renderDocument = (page: RenderedPage, context: DeployContext): string => {
  const metadata = pages.find((entry) => entry.id === page)
  const indexable = metadata?.indexable === true && isIndexableContext(context)
  const title = metadata?.title ?? `Page not found — ${site.name}`
  const description = metadata?.description ?? 'This page is not part of the Snugzap website.'
  const body = page === 'home' ? renderHome() : page === 'echoes' ? renderEchoes() : renderNotFound()

  return `<!doctype html>
<html lang="${site.lang}"${page === 'echoes' ? ' class="echoes-document"' : ''}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${indexable ? '' : '<meta name="robots" content="noindex" />'}
    ${metadata ? `<link rel="canonical" href="${escapeHtml(canonicalUrl(metadata.path))}" />` : ''}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/src/styles.css" />
    ${page === 'echoes' ? '<link rel="stylesheet" href="/src/echoes.css" />' : ''}
    <meta name="theme-color" content="${escapeHtml(metadata?.themeColor ?? site.themeColor)}" />
    ${metadata ? renderSocialMeta(metadata) : ''}
  </head>
  <body${page === 'echoes' ? ' class="theme-echoes"' : ''}>
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
