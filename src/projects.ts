export type ProjectStatus =
  | 'Playable · Active development'
  | 'Windows release · Active development'
  | 'PWA · Active validation'
  | 'Desktop app · Active development'
  | 'Web app · Active development'
  | 'Dormant · Future revival'

export type ProjectLink = {
  label: string
  href: string
  external?: boolean
  primary?: boolean
}

export type Project = {
  slug: string
  name: string
  type: string
  status: ProjectStatus
  summary: string
  detail?: string
  tags?: readonly string[]
  featured?: boolean
  archived?: boolean
  links?: readonly ProjectLink[]
}

export const projects: readonly Project[] = [
  {
    slug: 'echoes',
    name: 'ECHOES',
    type: 'Game',
    status: 'Playable · Active development',
    summary: 'A narrative web RPG built around story, progression and persistent cloud saves.',
    detail:
      'Explore an evolving browser RPG with characters, battles, progression systems and an expanding world.',
    tags: ['Web RPG', 'Playable', 'Cloud Save'],
    featured: true,
    links: [
      {
        label: 'Play web demo',
        href: 'https://echoes.snugzap.com/',
        external: true,
        primary: true,
      },
    ],
  },
  {
    slug: 'swiftlocal',
    name: 'SwiftLocal',
    type: 'Windows utility',
    status: 'Windows release · Active development',
    summary: 'A local-first Windows workspace for PDF, OCR, Office, image and media tasks.',
    detail:
      'Common document and media jobs brought together in one desktop application, with most processing kept on the device.',
    tags: ['Windows', 'Local-first', 'PDF & OCR'],
    featured: true,
    links: [
      {
        label: 'Latest release',
        href: 'https://github.com/JTKC00/SwiftLocal/releases/latest',
        external: true,
        primary: true,
      },
      {
        label: 'View repository',
        href: 'https://github.com/JTKC00/SwiftLocal',
        external: true,
      },
    ],
  },
  {
    slug: 'kcalcue',
    name: 'KcalCue',
    type: 'Web app / PWA',
    status: 'PWA · Active validation',
    summary: 'Photo-based calorie and macro estimation that makes uncertainty visible.',
    detail:
      'KcalCue identifies visible food, estimates reasonable portion ranges and presents nutrition as ranges instead of pretending to know an exact number.',
    tags: ['PWA', 'AI-assisted', 'Nutrition ranges'],
    featured: true,
    links: [
      {
        label: 'Open KcalCue',
        href: 'https://kcalcue.snugzap.com/',
        external: true,
        primary: true,
      },
      {
        label: 'View repository',
        href: 'https://github.com/JTKC00/KcalCue',
        external: true,
      },
    ],
  },
  {
    slug: 'matterdock',
    name: 'MatterDock',
    type: 'Windows desktop app',
    status: 'Desktop app · Active development',
    summary: 'A local-first workspace for matters, follow-ups, documents and next actions.',
    detail:
      'Keep the history, people, documents, waiting items and next step for an ongoing matter in one place.',
    tags: ['Windows', 'Local-first', 'Matter tracking'],
    links: [
      {
        label: 'View repository',
        href: 'https://github.com/JTKC00/MatterDock',
        external: true,
        primary: true,
      },
    ],
  },
  {
    slug: 'personal-finance-manager',
    name: 'Personal Finance Manager',
    type: 'Web app',
    status: 'Web app · Active development',
    summary:
      'A personal finance workspace for transactions, budgets, savings, subscriptions and everyday money.',
    detail: 'Built around Firebase with receipt OCR, account tracking and practical spending analysis.',
    tags: ['Personal finance', 'Firebase', 'Receipt OCR'],
    links: [
      {
        label: 'View repository',
        href: 'https://github.com/JTKC00/Personal-Finance-Manager',
        external: true,
        primary: true,
      },
    ],
  },
  {
    slug: 'bookstore',
    name: 'Bookstore',
    type: 'Web app',
    status: 'Dormant · Future revival',
    summary: 'A legacy Django e-commerce project preserved for a possible future rebuild.',
    detail:
      'Originally created as a learning project and later continued independently as Bookstore 2.0. A future revival would revisit its architecture, security, testing and UX.',
    tags: ['Django', 'Python', 'E-commerce'],
    archived: true,
    links: [
      {
        label: 'View repository',
        href: 'https://github.com/JTKC00/bookstore_2.0',
        external: true,
        primary: true,
      },
    ],
  },
]

export const featuredProjects = projects.filter((project) => project.featured)

export const activeProjects = projects.filter((project) => !project.featured && !project.archived)

export const archivedProjects = projects.filter((project) => project.archived)
