import { memo } from 'react'
import { chartedCall, snapDate, type RealSnap } from '@/lib/film-room/real-snaps'
import { teamName } from '@/lib/film-room/teams'

/**
 * The real play a quiz question was rebuilt from: who, when, what FTN charted, what happened.
 * `description` is undefined while it loads and '' when there is none to show.
 */
export const RealSnapCard = memo(function RealSnapCard({
  snap,
  description,
}: {
  snap: RealSnap
  description?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border p-4 text-sm">
      <h2 className="font-semibold">The real snap</h2>
      <p>
        {snapDate(snap)}: the {teamName(snap.defense)} defense against the {teamName(snap.offense)}.
      </p>
      <p>
        <span className="font-semibold">Charted: </span>
        {chartedCall(snap)}
        {snap.motion ? ', with motion before the snap' : ''}.
      </p>
      {description !== '' && (
        <p>
          <span className="font-semibold">What happened: </span>
          {description ?? <span className="text-muted-foreground">loading…</span>}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        The call, the situation, the players on the field and the motion are real. Where each player
        stands and the routes are drawn by the Film Room, because the charting does not record them.
        Point at a player to see who he is.
      </p>
    </div>
  )
})
