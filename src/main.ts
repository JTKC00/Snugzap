import './styles.css'
import {
  activeProjects,
  archivedProjects,
  featuredProjects,
  type Project,
  type ProjectLink,
  type ProjectStatus,
} from './projects.ts'

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

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
  const arrow = link.external === true ? ' <span aria-hidden="true">↗</span>' : ''

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

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found')
}

app.innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="#top">Snugzap<span class="wordmark-dot" aria-hidden="true"></span></a>
    <nav aria-label="Main navigation">
      <a href="#projects">Projects</a>
      <a href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Notes <span aria-hidden="true">↗</span></a>
      <a href="#about">About</a>
    </nav>
  </header>

  <main id="main-content">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero-copy reveal">
        <p class="eyebrow">Independent software &amp; games by James</p>
        <h1 id="hero-title">Snug<span>zap</span></h1>
        <p class="hero-tagline">Useful tools. Small worlds. Built with care.</p>
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
          <a class="text-link" href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Visit Notes <span aria-hidden="true">↗</span></a>
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

  <footer class="site-footer">
    <p>© 2026 Snugzap</p>
    <p class="footer-note">Comfort, simplicity and speed.</p>
    <nav class="footer-links" aria-label="Footer">
      <a href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Notes <span aria-hidden="true">↗</span></a>
      <a href="https://github.com/JTKC00" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
    </nav>
  </footer>
`
