import { useMemo } from 'react'
import { PRESSURE_GUIDE } from '@/lib/film-room/glossary'
import { conceptVerdict, tells } from '@/lib/film-room/grading'
import type { Play } from '@/lib/film-room/play'

/** What gave the defense's call away, its pressure if any, and how the offense's play suited it. */
export function CallBreakdown({ play, heading }: { play: Play; heading: string }) {
  const lines = useMemo(() => tells(play), [play])
  const { pressure } = play.defense.call
  return (
    <>
      <div>
        <h3 className="text-sm font-semibold">{heading}</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          {lines.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      {pressure !== 'four' && <p className="text-sm">{PRESSURE_GUIDE[pressure]}</p>}
      <p className="text-sm">{conceptVerdict(play)}</p>
    </>
  )
}
