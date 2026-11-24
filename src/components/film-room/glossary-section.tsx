import { memo } from 'react'
import { Button } from '@/components/ui/button'
import {
  COVERAGES,
  COVERAGE_IDS,
  PRESSURES,
  PRESSURE_IDS,
  type CoverageId,
} from '@/lib/film-room/defense'
import { COVERAGE_GUIDE, MUG_NOTE, PRESSURE_GUIDE, ROLE_LEGEND } from '@/lib/film-room/glossary'
import { FORMATIONS, FORMATION_IDS } from '@/lib/film-room/offense'
import { CONCEPTS, CONCEPT_IDS } from '@/lib/film-room/routes'

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-xl border p-4">
      <summary className="cursor-pointer font-semibold">{title}</summary>
      <div className="mt-3 flex flex-col gap-4 text-sm">{children}</div>
    </details>
  )
}

/** Reference for every name the Film Room uses. `onStudy` opens study mode on one coverage. */
export const GlossarySection = memo(function GlossarySection({
  onStudy,
}: {
  onStudy(coverage: CoverageId): void
}) {
  return (
    <section aria-labelledby="glossary" className="mt-12">
      <h2 id="glossary" className="font-serif text-2xl font-semibold">
        Glossary
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        <Group title="Coverages">
          {COVERAGE_IDS.map((c) => {
            const g = COVERAGE_GUIDE[c]
            return (
              <div key={c}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">
                    {COVERAGES[c].name}{' '}
                    <span className="text-muted-foreground font-normal">
                      ({COVERAGES[c].family}, {COVERAGES[c].shell}-high)
                    </span>
                  </h3>
                  <Button variant="link" className="min-h-11 px-0" onClick={() => onStudy(c)}>
                    Show me examples
                  </Button>
                </div>
                <p>{g.what}</p>
                <p className="mt-1">
                  <span className="font-medium">Before the snap: </span>
                  {g.beforeSnap}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Where it is weak: </span>
                  {g.weakSpots}
                </p>
              </div>
            )
          })}
        </Group>
        <Group title="Pressures and looks">
          {PRESSURE_IDS.map((p) => (
            <div key={p}>
              <h3 className="font-semibold">{PRESSURES[p].name}</h3>
              <p>{PRESSURE_GUIDE[p].long}</p>
            </div>
          ))}
          <div>
            <h3 className="font-semibold">Mug look</h3>
            <p>{MUG_NOTE}</p>
          </div>
        </Group>
        <Group title="Pass concepts">
          {CONCEPT_IDS.map((c) => (
            <div key={c}>
              <h3 className="font-semibold">{CONCEPTS[c].name}</h3>
              <p>{CONCEPTS[c].idea}</p>
              <p className="text-muted-foreground mt-1">
                Built to beat: {CONCEPTS[c].beats.map((b) => COVERAGES[b].name).join(', ')}
              </p>
            </div>
          ))}
        </Group>
        <Group title="Formations">
          {FORMATION_IDS.map((f) => (
            <div key={f}>
              <h3 className="font-semibold">
                {FORMATIONS[f].name}{' '}
                <span className="text-muted-foreground font-normal">
                  ({FORMATIONS[f].personnel} personnel)
                </span>
              </h3>
              <p>{FORMATIONS[f].note}</p>
            </div>
          ))}
          <p className="text-muted-foreground">
            Personnel is two digits: running backs, then tight ends. 11 personnel is one back, one
            tight end and three wide receivers.
          </p>
        </Group>
        <Group title="Who is who on the field">
          <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1">
            {ROLE_LEGEND.map(([abbr, meaning]) => (
              <div key={abbr} className="contents">
                <dt className="font-semibold">{abbr}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground">
            Offense in navy with orange trim, moving up the screen. Defense in white. On the
            coverage layer, blue boxes are deep zones, yellow boxes short zones, pink dashed lines
            man-to-man matchups, and red arrows rushers. On the routes layer, the small yellow
            numbers are the quarterback's reads in order, and C is the checkdown.
          </p>
        </Group>
      </div>
    </section>
  )
})
