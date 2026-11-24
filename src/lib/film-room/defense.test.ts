import { describe, expect, it } from 'vitest'
import {
  COVERAGES,
  buildDefense,
  extraRushers,
  linemanDrops,
  rushCount,
  type CoverageId,
  type Look,
  type PackageId,
  type PressureId,
} from './defense'
import { MIDDLE } from './field'
import {
  FORMATIONS,
  FORMATION_IDS,
  buildFormation,
  type FormationId,
  type OffenseId,
} from './offense'
import { createRandom } from './random'
import { ZONES } from './zones'

/** buildDefense decides assignments from the call alone, so every case shows the same look. */
const look: Look = { shell: 1, cornersDisguised: false, manHidden: false, mug: false, press: true }

/** The package the defense plays against a formation on every down but third and long. */
function packageFor(formation: FormationId): PackageId {
  return FORMATIONS[formation].personnel === '11' ? 'nickel' : 'base'
}

function defenseFor(coverage: CoverageId, pressure: PressureId, formationId: FormationId) {
  const formation = buildFormation(formationId, MIDDLE, 1)
  const call = { package: packageFor(formationId), coverage, pressure, look }
  return { formation, defense: buildDefense(call, formation, createRandom(7)) }
}

/** Every pressure each coverage can be played with, against every formation. */
const cases = (Object.keys(COVERAGES) as CoverageId[]).flatMap((coverage) =>
  (Object.keys(COVERAGES[coverage].pressures) as PressureId[]).flatMap((pressure) =>
    FORMATION_IDS.map((formation) => ({ coverage, pressure, formation })),
  ),
)

/** How many rush the passer, as each pressure's name says. */
const RUSHERS: Record<PressureId, number> = { four: 4, sim: 4, blitz: 5, zero: 6 }

describe('buildDefense', () => {
  it.each(cases)(
    '$coverage with $pressure against $formation gives all eleven defenders a job',
    ({ coverage, pressure, formation }) => {
      const { defense } = defenseFor(coverage, pressure, formation)
      expect(defense.players).toHaveLength(11)
    },
  )

  it.each(cases)(
    '$coverage with $pressure against $formation rushes as many as the pressure names',
    ({ coverage, pressure, formation }) => {
      const { defense } = defenseFor(coverage, pressure, formation)
      expect(rushCount(defense)).toBe(RUSHERS[pressure])
    },
  )

  it.each(cases.filter((c) => COVERAGES[c.coverage].family === 'man'))(
    '$coverage with $pressure covers every pass-catcher in $formation exactly once',
    ({ coverage, pressure, formation: formationId }) => {
      const { formation, defense } = defenseFor(coverage, pressure, formationId)
      const covered = defense.players.flatMap((p) =>
        p.assignment.kind === 'man' ? [p.assignment.target] : [],
      )
      expect(covered.sort()).toEqual((Object.keys(formation.counts) as OffenseId[]).sort())
    },
  )

  it('puts the man corners on the widest receiver on each side of trips', () => {
    // Arrange: trips to the right puts Z widest on the right and X alone on the left.
    const { defense } = defenseFor('cover1', 'four', 'trips')

    // Act
    const targets = Object.fromEntries(
      defense.players.flatMap((p) =>
        p.assignment.kind === 'man' ? [[p.id, p.assignment.target]] : [],
      ),
    )

    // Assert
    expect(targets).toMatchObject({ CB_S: 'Z', CB_W: 'X' })
  })

  it.each(cases.filter((c) => c.pressure === 'sim'))(
    '$coverage with sim against $formation drops a lineman and sends one other defender',
    ({ coverage, pressure, formation }) => {
      const { defense } = defenseFor(coverage, pressure, formation)
      expect(linemanDrops(defense)).toHaveLength(1)
      expect(extraRushers(defense)).toHaveLength(1)
    },
  )

  it.each(FORMATION_IDS)(
    'plays three deep and three under in a fire zone against %s',
    (formation) => {
      const { defense } = defenseFor('cover3', 'blitz', formation)
      const zones = defense.players.flatMap((p) =>
        p.assignment.kind === 'zone' ? [ZONES[p.assignment.zone]] : [],
      )
      expect(zones.filter((z) => z.deep)).toHaveLength(3)
      expect(zones.filter((z) => !z.deep)).toHaveLength(3)
    },
  )

  it.each([
    ['cover2', 2],
    ['cover3', 3],
    ['cover4', 4],
    ['cover6', 3],
    ['tampa2', 3],
  ] as [CoverageId, number][])('%s puts %i defenders in deep zones', (coverage, deep) => {
    const { defense } = defenseFor(coverage, 'four', 'doubles')
    const count = defense.players.filter(
      (p) => p.assignment.kind === 'zone' && ZONES[p.assignment.zone].deep,
    ).length
    expect(count).toBe(deep)
  })
})
