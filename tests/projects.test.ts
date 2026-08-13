import { describe, expect, it } from 'vitest'
import { projects } from '../src/projects.ts'

describe('project catalogue', () => {
  it('lists current projects before dormant projects', () => {
    expect(projects.map(({ name }) => name)).toEqual([
      'SwiftLocal',
      'KcalCue',
      'Personal Finance Manager',
      'ECHOES',
      'Bookstore',
    ])
  })

  it('uses honest development statuses and verified public links', () => {
    expect(projects.slice(0, 4).every(({ status }) => status === 'In development')).toBe(true)
    expect(projects.at(-1)?.status).toBe('Dormant · Future Revival')
    expect(projects.filter(({ href }) => href)).toEqual([
      expect.objectContaining({
        name: 'ECHOES',
        href: 'https://jtkc00.github.io/ECHOES/',
        external: true,
      }),
      expect.objectContaining({
        name: 'Bookstore',
        href: 'https://github.com/JTKC00/bookstore_2.0',
        external: true,
      }),
    ])
  })

  it('records Bookstore technology context without presenting it as active', () => {
    expect(projects.at(-1)).toMatchObject({
      name: 'Bookstore',
      type: 'Web app',
      technologies: ['Django', 'Python', 'PostgreSQL', 'FastAPI', 'Stripe'],
    })
  })
})
