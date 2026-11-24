import { memo, useMemo } from 'react'
import { COVERAGES } from '@/lib/film-room/defense'
import {
  CHARTED_COVERAGES,
  TENDENCY_SEASONS,
  chartedDropbacks,
  coverageMix,
} from '@/lib/film-room/tendencies'
import { teamName } from '@/lib/film-room/teams'

const LEAGUE_MIX = coverageMix(undefined)

const percent = (share: number) => `${Math.round(share * 100)}%`

/** How often a defense played each coverage, next to the league, as bars with their numbers. */
export const CoverageMix = memo(function CoverageMix({ team }: { team: string | undefined }) {
  const own = useMemo(() => coverageMix(team), [team])
  const isLeague = !team
  // Every team name ends in s, so its possessive is a bare apostrophe: "The Bears' coverage mix".
  const owner = team ? `The ${teamName(team)}'` : "The NFL's"
  const seasons = `${TENDENCY_SEASONS[0]}–${TENDENCY_SEASONS[TENDENCY_SEASONS.length - 1]}`
  return (
    <details className="rounded-xl border p-4">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">
        {owner} coverage mix, {seasons}
      </summary>
      <p className="text-muted-foreground mt-2 text-xs">
        Share of {chartedDropbacks(team).toLocaleString()} charted dropbacks.
        {!isLeague && ' The thin grey bar is the league.'} Tampa 2 is charted as Cover 2.
      </p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {CHARTED_COVERAGES.map((c) => (
          <li key={c}>
            <div className="flex justify-between">
              <span>{COVERAGES[c].name}</span>
              <span className="tabular-nums">
                {percent(own[c])}
                {!isLeague && (
                  <span className="text-muted-foreground"> (NFL {percent(LEAGUE_MIX[c])})</span>
                )}
              </span>
            </div>
            <div className="bg-muted mt-1 h-2 rounded-full" aria-hidden="true">
              <div className="bg-primary h-2 rounded-full" style={{ width: percent(own[c]) }} />
            </div>
            {!isLeague && (
              <div className="mt-0.5 h-0.5 rounded-full" aria-hidden="true">
                <div
                  className="bg-muted-foreground/60 h-0.5 rounded-full"
                  style={{ width: percent(LEAGUE_MIX[c]) }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </details>
  )
})
