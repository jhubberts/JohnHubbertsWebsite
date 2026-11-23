import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { cssColorToRgb, cssVar, useThemeVersion } from '@/components/ai-series/draw-pad'
import type { DigitNet } from '@/lib/ai-series/digits/digit-net'
import { cn } from '@/lib/utils'
import { answersFor, countRight, practiceLabel, withCommas } from './draw-a-digit-logic'
import {
  Answer,
  DigitPad,
  Empty,
  manifest,
  useDigitData,
  useReading,
  type Example,
} from './digit-parts'

const CHECKPOINTS = manifest.checkpoints
const LAST_STOP = CHECKPOINTS.length - 1

/** The six saved points of the network's practice, read on the same drawing and the same 20 digits. */
export function WatchItLearn() {
  const load = useDigitData(CHECKPOINTS)

  return (
    <TryIt title="Watch it learn">
      {load.status === 'loading' && (
        <p className="text-muted-foreground text-base">
          Loading the network at six points in its practice&hellip;
        </p>
      )}
      {load.status === 'failed' && (
        <p className="text-base">
          The network&rsquo;s numbers did not load. Check your connection and reload the page.
        </p>
      )}
      {load.status === 'ready' && (
        <Learner nets={load.nets} images={load.images} examples={load.examples} />
      )}
    </TryIt>
  )
}

function Learner({
  nets,
  images,
  examples,
}: {
  nets: DigitNet[]
  images: Example[]
  examples: Example[]
}) {
  const [input, setInput] = useState<Float32Array | null>(null)
  const [stop, setStop] = useState(0)
  const checkpoint = CHECKPOINTS[stop]
  const reading = useReading(nets[stop], input)
  const label = practiceLabel(stop, CHECKPOINTS.length, checkpoint.step, manifest.batchSize)

  return (
    <div className="space-y-8 text-base">
      <DigitPad
        heading="Draw a number, then move the slider"
        examples={examples}
        onInput={setInput}
      />

      <section className="space-y-3">
        <label htmlFor="watch-it-learn-slider" className="block text-lg font-semibold">
          How much practice
        </label>
        <input
          id="watch-it-learn-slider"
          type="range"
          min={0}
          max={LAST_STOP}
          step={1}
          value={stop}
          aria-valuetext={label}
          onChange={(event) => setStop(Number(event.target.value))}
          className="accent-primary block h-11 w-full cursor-pointer"
        />
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-11 flex-1 px-5 text-base"
            disabled={stop === 0}
            onClick={() => setStop(stop - 1)}
          >
            Less practice
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 px-5 text-base"
            disabled={stop === LAST_STOP}
            onClick={() => setStop(stop + 1)}
          >
            More practice
          </Button>
        </div>
        <p className="font-medium">{label}</p>
        <TestScore correct={checkpoint.testCorrect} total={checkpoint.testTotal} />
      </section>

      <section>
        <h4 className="mb-3 text-xl font-semibold">The network reads</h4>
        {reading ? <Answer reading={reading} /> : <Empty />}
      </section>

      <FixtureGrid net={nets[stop]} images={images} />
    </div>
  )
}

function TestScore({ correct, total }: { correct: number; total: number }) {
  return (
    <div>
      <p>
        Right on {withCommas(correct)} of {withCommas(total)} test digits it had never seen.
      </p>
      <div aria-hidden className="bg-muted mt-2 h-4 overflow-hidden rounded-sm">
        <div className="bg-primary h-full" style={{ width: `${(correct / total) * 100}%` }} />
      </div>
    </div>
  )
}

function FixtureGrid({ net, images }: { net: DigitNet; images: Example[] }) {
  const answers = answersFor(net, images)
  const right = countRight(
    answers,
    images.map((image) => image.label),
  )
  return (
    <section>
      <h4 className="mb-3 text-xl font-semibold">The same 20 digits, read at this point</h4>
      <ul className="grid grid-cols-5 gap-x-2 gap-y-4 sm:grid-cols-10">
        {images.map((image, i) => {
          const isRight = answers[i] === image.label
          return (
            <li key={i} className="flex flex-col items-center gap-1">
              <DigitPicture
                pixels={image.pixels}
                label={`A handwritten ${image.label}, read as ${answers[i]}, ${isRight ? 'right' : 'wrong'}`}
              />
              <span aria-hidden className="font-semibold tabular-nums">
                {answers[i]} {isRight ? '✓' : '✗'}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 font-medium">{right} of 20 right.</p>
    </section>
  )
}

/** A 28x28 picture of one example digit, drawn at 56px in the text colour on the card colour. */
function DigitPicture({ pixels, label }: { pixels: number[]; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeVersion = useThemeVersion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const background = cssColorToRgb(cssVar(canvas, '--card'))
    const ink = cssColorToRgb(cssVar(canvas, '--foreground'))
    const image = ctx.createImageData(28, 28)
    for (let i = 0; i < 784; i++) {
      const amount = pixels[i] / 255
      for (let c = 0; c < 3; c++) {
        image.data[i * 4 + c] = background[c] * (1 - amount) + ink[c] * amount
      }
      image.data[i * 4 + 3] = 255
    }
    ctx.putImageData(image, 0, 0)
  }, [pixels, themeVersion])

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={28}
      role="img"
      aria-label={label}
      className={cn('ring-border block size-14 rounded-sm ring-1')}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
