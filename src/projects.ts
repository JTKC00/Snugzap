export type Project = {
  name: string
  summary: string
  detail?: string
  status: 'In development' | 'Dormant · Future Revival'
  type: 'Desktop utility' | 'Mobile app' | 'Web app' | 'Game'
  technologies?: readonly string[]
  href?: string
  linkLabel?: string
  external?: boolean
}

export const projects: readonly Project[] = [
  {
    name: 'SwiftLocal',
    summary: 'Local-first visual utilities for Windows.',
    detail: 'PDF, OCR, Office, image and media tools without unnecessary complexity.',
    status: 'In development',
    type: 'Desktop utility',
  },
  {
    name: 'KcalCue',
    summary: 'AI-assisted food and calorie estimation, with uncertainty made clear.',
    status: 'In development',
    type: 'Mobile app',
  },
  {
    name: 'Personal Finance Manager',
    summary: 'A personal tool for understanding and managing everyday finances.',
    status: 'In development',
    type: 'Web app',
  },
  {
    name: 'ECHOES',
    summary: 'A narrative RPG project in active development.',
    status: 'In development',
    type: 'Game',
    href: 'https://jtkc00.github.io/ECHOES/',
    linkLabel: 'Play web demo',
    external: true,
  },
  {
    name: 'Bookstore',
    summary: 'A legacy Django e-commerce project with a future beyond its original classroom roots.',
    detail:
      'Originally a free-form team project led by James while learning Django, then continued independently as Bookstore 2.0. It is not in active development; a future revival would modernize its architecture, security, testing and UX.',
    status: 'Dormant · Future Revival',
    type: 'Web app',
    technologies: ['Django', 'Python', 'PostgreSQL', 'FastAPI', 'Stripe'],
    href: 'https://github.com/JTKC00/bookstore_2.0',
    linkLabel: 'View repository',
    external: true,
  },
]
