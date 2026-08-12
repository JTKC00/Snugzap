import { describe, expect, it } from 'vitest'
import { projects } from '../src/projects.ts'

describe('project catalogue', () => {
  it('contains the four Phase 1 projects in order', () => {
    expect(projects.map(({ name }) => name)).toEqual([
      'SwiftLocal',
      'KcalCue',
      'Personal Finance Manager',
      'ECHOES',
    ])
  })

  it('only exposes verified links and uses honest development statuses', () => {
    expect(projects.every(({ status }) => status === 'In development')).toBe(true)
    expect(projects.filter(({ href }) => href)).toEqual([
      expect.objectContaining({
        name: 'ECHOES',
        href: 'https://jtkc00.github.io/ECHOES/',
        external: true,
      }),
    ])
  })
})
