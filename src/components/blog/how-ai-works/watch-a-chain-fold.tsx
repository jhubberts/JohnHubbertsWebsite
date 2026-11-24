import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { SEQUENCE, VIEW, positionsAt } from '@/lib/ai-series/folding/chain'
import { useMediaQuery } from '@/lib/use-media-query'

/** How long folding or unfolding takes, in milliseconds. */
const DURATION = 3000
const BEAD_RADIUS = 6.5

const LABELS = {
  unfolded: 'A chain of 24 beads laid out in a wave.',
  folded: 'The same chain folded into a ball, with the filled beads inside.',
}

/** Chapter 8's drawing: a chain of beads that folds with its water-avoiding beads inside. */
export function WatchAChainFold() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  /** How far folded the chain is, from 0 (the wave) to 1 (the folded shape). */
  const [progress, setProgress] = useState(0)
  /** Where the chain is heading: 1 to fold, 0 to unfold. */
  const [target, setTarget] = useState(0)
  const progressRef = useRef(0)

  useEffect(() => {
    const from = progressRef.current
    const show = (value: number) => {
      progressRef.current = value
      setProgress(value)
    }
    if (from === target) return
    if (reducedMotion) {
      show(target)
      return
    }
    // Turning back part of the way through takes that share of the time.
    const duration = DURATION * Math.abs(target - from)
    const startedAt = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const share = Math.min(1, (now - startedAt) / duration)
      show(from + (target - from) * share)
      if (share < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, reducedMotion])

  const points = positionsAt(progress)

  return (
    <TryIt title="Watch a chain fold">
      <div className="space-y-4 text-base">
        <p>
          A protein is a chain of amino acids that folds into a shape. This is a drawing of the
          idea, not a real protein.
        </p>

        <svg
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          role="img"
          aria-label={progress === 1 ? LABELS.folded : LABELS.unfolded}
          className="border-border bg-background block h-auto w-full rounded-lg border"
        >
          <polyline
            points={points.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={BEAD_RADIUS}
              fill={SEQUENCE[i] === 'avoiding' ? 'var(--foreground)' : 'var(--background)'}
              stroke="var(--foreground)"
              strokeWidth={2}
            />
          ))}
        </svg>

        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          <li>● water-avoiding</li>
          <li>○ water-loving</li>
        </ul>

        <Button
          variant="outline"
          className="h-11 px-5 text-base"
          onClick={() => setTarget(target === 1 ? 0 : 1)}
        >
          {target === 1 ? 'Unfold' : 'Fold'}
        </Button>

        <p className="text-muted-foreground">
          In water, a chain like this folds so that its water-avoiding parts end up inside. A real
          protein has hundreds of links. AlphaFold does not show how a chain folds; it predicts the
          shape it ends up in.
        </p>
      </div>
    </TryIt>
  )
}
