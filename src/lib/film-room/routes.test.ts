import { describe, expect, it } from 'vitest'
import { MIDDLE } from './field'
import { FORMATION_IDS, buildFormation } from './offense'
import { CONCEPT_IDS, assignRoutes, readLabels } from './routes'

const cases = CONCEPT_IDS.flatMap((concept) =>
  FORMATION_IDS.map((formation) => ({ concept, formation })),
)

describe('readLabels', () => {
  it.each(cases)(
    'numbers $concept from $formation 1, 2, 3 with no gaps',
    ({ concept, formation }) => {
      const f = buildFormation(formation, MIDDLE, 1)
      const labels = Object.values(readLabels(concept, f, assignRoutes(concept, f)))
      const numbers = labels
        .filter((l) => l !== 'C')
        .map(Number)
        .sort((a, b) => a - b)
      expect(numbers.length).toBeGreaterThan(0)
      expect(numbers).toEqual(numbers.map((_, i) => i + 1))
    },
  )

  it.each(cases)(
    'gives the checkdown only to a back, in $concept from $formation',
    ({ concept, formation }) => {
      const f = buildFormation(formation, MIDDLE, 1)
      const labels = readLabels(concept, f, assignRoutes(concept, f))
      for (const [id, label] of Object.entries(labels)) {
        if (label === 'C') expect(f.counts[id as keyof typeof f.counts]?.number).toBe(0)
      }
    },
  )

  it('reads Smash corner first, then the hitch', () => {
    const f = buildFormation('doubles', MIDDLE, 1)
    const routes = assignRoutes('smash', f)
    const labels = readLabels('smash', f, routes)
    const byRoute = (route: string) =>
      Object.entries(routes)
        .filter(([, r]) => r?.route === route)
        .map(([id]) => labels[id as keyof typeof labels])
        .sort()
    expect(byRoute('corner')).toEqual(['1', '2'])
    expect(byRoute('hitch')).toEqual(['3', '4'])
  })
})
