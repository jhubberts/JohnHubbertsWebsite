import { memo, useEffect, useState } from 'react'
import { chartedCall, loadDescription, snapDate, type RealSnap } from '@/lib/film-room/real-snaps'
import { teamName } from '@/lib/film-room/teams'

/** The real play a quiz question was rebuilt from: who, when, what FTN charted, what happened. */
export const RealSnapCard = memo(function RealSnapCard({ snap }: { snap: RealSnap }) {
  // The play description, fetched after the card renders. It is stored with its snap's id so that
  // a new snap shows "loading…" instead of the last one's text. '' hides the line: the file did
  // not load or has no text for this snap.
  const [description, setDescription] = useState<{ id: number; text: string } | null>(null)
  useEffect(() => {
    let current = true
    loadDescription(snap)
      .catch(() => '')
      .then((text) => current && setDescription({ id: snap.id, text }))
    return () => {
      current = false
    }
  }, [snap])
  const text = description?.id === snap.id ? description.text : null
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
      {text !== '' && (
        <p>
          <span className="font-semibold">What happened: </span>
          {text ?? <span className="text-muted-foreground">loading…</span>}
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        The call, the situation, the personnel and the motion are real. Where each player stands and
        the routes are drawn by the Film Room, because the charting does not record them.
      </p>
    </div>
  )
})
