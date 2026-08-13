import './styles.css'
import { projects, type Project } from './projects.ts'

const externalArrow = '<span aria-hidden="true">↗</span>'

const renderProject = (project: Project, index: number): string => {
  const isDormant = project.status.startsWith('Dormant')
  const projectLink = project.href
    ? `<a class="project-link" href="${project.href}"${project.external ? ' target="_blank" rel="noreferrer"' : ''}>${project.linkLabel ?? 'View project'} ${project.external ? externalArrow : '<span aria-hidden="true">→</span>'}</a>`
    : '<span class="project-progress">More soon</span>'

  return `
    <article class="project-card${isDormant ? ' project-card--dormant' : ''} reveal" style="--delay: ${index * 70}ms">
      <div class="project-meta">
        <span>${project.type}</span>
        <span class="project-number" aria-hidden="true">0${index + 1}</span>
      </div>
      <div class="project-copy">
        <h3>${project.name}</h3>
        <p class="project-summary">${project.summary}</p>
        ${project.detail ? `<p class="project-detail">${project.detail}</p>` : ''}
        ${project.technologies ? `<ul class="project-tags" aria-label="Technologies">${project.technologies.map((technology) => `<li>${technology}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="project-footer">
        <span class="status${isDormant ? ' status--dormant' : ''}"><span class="status-dot" aria-hidden="true"></span>${project.status}</span>
        ${projectLink}
      </div>
    </article>
  `
}

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found')
}

app.innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="#top">Snugzap<span class="wordmark-dot" aria-hidden="true"></span></a>
    <nav aria-label="Main navigation">
      <a href="#projects">Projects</a>
      <a href="#about">About</a>
      <a href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Notes <span aria-hidden="true">↗</span></a>
    </nav>
  </header>

  <main id="main-content">
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="hero-copy reveal">
        <p class="eyebrow">Independent work by James</p>
        <h1 id="hero-title">Snug<span>zap</span></h1>
        <p class="hero-tagline">Comfort, simplicity and speed.</p>
        <p class="hero-description">Independent software, games and experiments made with care.</p>
      </div>
      <a class="hero-scroll" href="#projects">
        <span>Explore the work</span>
        <span class="scroll-line" aria-hidden="true"></span>
      </a>
    </section>

    <section class="projects section-shell" id="projects" aria-labelledby="projects-title">
      <div class="section-heading">
        <p class="section-index">01 / Selected work</p>
        <div>
          <h2 id="projects-title">Projects, present and future.</h2>
          <p>Useful tools and small worlds in active development, followed by work preserved for a future return.</p>
        </div>
      </div>
      <div class="project-grid">
        ${projects.map(renderProject).join('')}
      </div>
    </section>

    <section class="notes section-shell" aria-labelledby="notes-title">
      <div class="notes-inner reveal">
        <div>
          <p class="section-index">02 / A separate space</p>
          <h2 id="notes-title">James · Notes</h2>
        </div>
        <div class="notes-copy">
          <p>Thoughts, learning, observations and things worth remembering.</p>
          <a class="text-link" href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">Visit Notes ${externalArrow}</a>
        </div>
      </div>
    </section>

    <section class="about section-shell" id="about" aria-labelledby="about-title">
      <p class="section-index">03 / About</p>
      <div class="about-copy reveal">
        <h2 id="about-title">A quiet home for things I make.</h2>
        <div>
          <p>Snugzap brings together “snug” and “zap” — comfort, simplicity and speed.</p>
          <p>It is a home for software, games and experiments I build and learn from.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p>© 2026 Snugzap</p>
    <p class="footer-note">What I make.</p>
    <a href="https://james.sharing.snugzap.com/" target="_blank" rel="noreferrer">James · Notes ${externalArrow}</a>
  </footer>
`
