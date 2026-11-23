import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { DrawPad, type DrawPadHandle } from '@/components/ai-series/draw-pad'
import {
  loadCheckpoint,
  readDigit,
  type DigitManifest,
  type DigitNet,
  type DigitReading,
  type ManifestCheckpoint,
} from '@/lib/ai-series/digits/digit-net'
import manifestJson from '@/lib/ai-series/digits/manifest.json'
import { prepareDrawing } from '@/lib/ai-series/digits/prepare-drawing'
import { cn } from '@/lib/utils'
import { exampleOrder, inkSpan, outOf100 } from './draw-a-digit-logic'

// Pieces shared by the chapter's digit interactives: the drawing pad, the answer, and loading the
// saved networks and example digits.

export const manifest: DigitManifest = manifestJson

export const EMPTY_TEXT = 'Draw something and the network will read it.'

/** Below this share of the pad's side, a drawing is small enough that the network reads it badly. */
const SMALL_DRAWING = 0.35

export interface Example {
  label: number
  pixels: number[]
}

export type DigitLoad =
  | { status: 'loading' }
  | { status: 'failed' }
  | {
      status: 'ready'
      /** One network per requested saved point, in the same order. */
      nets: DigitNet[]
      /** The fixture's digits in fixture order. */
      images: Example[]
      /** The same digits mixed, starting with a 7, in the order "Show an example" cycles them. */
      examples: Example[]
    }

/** Loads the networks of the given saved points and the example digits when the page mounts. */
export function useDigitData(checkpoints: readonly ManifestCheckpoint[]): DigitLoad {
  const [load, setLoad] = useState<DigitLoad>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      Promise.all(checkpoints.map(loadCheckpoint)),
      import('@/lib/ai-series/digits/fixture.json'),
    ])
      .then(([nets, fixture]) => {
        const images = fixture.default.images.map(({ label, pixels }) => ({ label, pixels }))
        const order = exampleOrder(images.map((image) => image.label))
        if (!cancelled) {
          setLoad({ status: 'ready', nets, images, examples: order.map((i) => images[i]) })
        }
      })
      .catch(() => {
        if (!cancelled) setLoad({ status: 'failed' })
      })
    return () => {
      cancelled = true
    }
  }, [checkpoints])

  return load
}

/** What `net` reads in the prepared drawing; null while the pad is empty. */
export function useReading(net: DigitNet, input: Float32Array | null): DigitReading | null {
  return useMemo(() => (input ? readDigit(net, input) : null), [net, input])
}

/**
 * The drawing pad with its Clear and Show an example buttons, the notes under them, and the logic
 * that cycles the examples. `onInput` gets the drawing prepared for the network (28 by 28, moved
 * to the middle), or null when the pad is empty.
 */
export function DigitPad({
  heading,
  examples,
  onInput,
  startWithExample = true,
  showExampleButton = true,
  showSmallHint = true,
  note,
}: {
  heading: string
  examples: Example[]
  onInput(input: Float32Array | null): void
  startWithExample?: boolean
  showExampleButton?: boolean
  showSmallHint?: boolean
  /** Small text between the heading and the pad. */
  note?: ReactNode
}) {
  const padRef = useRef<DrawPadHandle>(null)
  const [showingExample, setShowingExample] = useState(startWithExample)
  const [drawingSpan, setDrawingSpan] = useState(0)
  const nextExampleRef = useRef(0)

  const showNextExample = useCallback(() => {
    const example = examples[nextExampleRef.current % examples.length]
    nextExampleRef.current += 1
    padRef.current?.showPixels(example.pixels)
    setShowingExample(true)
  }, [examples])

  // Start with the first example drawn and read, so the page is never empty. Setting the counter
  // rather than adding to it keeps this the same when React runs the effect twice in development.
  useEffect(() => {
    if (!startWithExample) return
    padRef.current?.showPixels(examples[0].pixels)
    nextExampleRef.current = 1
  }, [examples, startWithExample])

  const handleInk = useCallback(
    (ink: Float32Array, width: number, height: number) => {
      setDrawingSpan(inkSpan(ink, width, height))
      onInput(prepareDrawing(ink, width, height))
    },
    [onInput],
  )

  function clear() {
    padRef.current?.clear()
    setShowingExample(false)
  }

  return (
    <section>
      <h4 className={cn('text-xl font-semibold', note ? 'mb-1' : 'mb-3')}>{heading}</h4>
      {note && <p className="text-muted-foreground mb-3 text-sm">{note}</p>}
      <DrawPad
        ref={padRef}
        ariaLabel={heading}
        onInk={handleInk}
        onDrawStart={() => setShowingExample(false)}
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <Button variant="outline" className="h-11 px-5 text-base" onClick={clear}>
          Clear
        </Button>
        {showExampleButton && (
          <Button variant="outline" className="h-11 px-5 text-base" onClick={showNextExample}>
            Show an example
          </Button>
        )}
      </div>
      {showingExample && (
        <p className="text-muted-foreground mt-2 text-sm">
          This is an example. Tap Clear and draw your own with your finger.
        </p>
      )}
      {showSmallHint && !showingExample && drawingSpan > 0 && drawingSpan < SMALL_DRAWING && (
        <p role="status" className="text-muted-foreground mt-2 text-sm">
          That is quite small. Try filling the dashed box.
        </p>
      )}
    </section>
  )
}

export function Empty() {
  return <p className="text-muted-foreground">{EMPTY_TEXT}</p>
}

/** The digit the network chose, how much of 100 it gives it, and a bar for each of the ten digits. */
export function Answer({ reading }: { reading: DigitReading }) {
  const { answer, probabilities } = reading
  return (
    <div>
      <p className="text-8xl leading-none font-bold tabular-nums">{answer}</p>
      <p className="mt-3">
        It gives {outOf100(probabilities[answer])} out of 100 to {answer}.
      </p>
      <ul className="mt-4 space-y-1.5">
        {Array.from(probabilities, (p, digit) => {
          const most = digit === answer
          return (
            <li key={digit} className="flex items-center gap-2">
              <span className="w-4 font-semibold tabular-nums">{digit}</span>
              <span className="bg-muted h-4 flex-1 overflow-hidden rounded-sm">
                <span
                  className={cn('block h-full', most ? 'bg-primary' : 'bg-muted-foreground/45')}
                  style={{ width: `${p * 100}%` }}
                />
              </span>
              <span className="w-8 text-right tabular-nums">{outOf100(p)}</span>
              <span className="w-10 text-sm font-semibold">{most ? 'most' : ''}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
