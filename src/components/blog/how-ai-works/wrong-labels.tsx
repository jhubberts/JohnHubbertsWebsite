import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { useElementWidth } from '@/components/ai-series/draw-pad'
import {
  FLOWERS,
  PLOT,
  X_TICKS,
  X_WORDS,
  Y_TICKS,
  Y_WORDS,
  clipToRect,
  sideOfRect,
  type Line,
  type Point,
  type Species,
} from '@/lib/ai-series/flowers/flowers'
import {
  WRONG_LABEL_COUNTS,
  labeledFlowers,
  learnFromLabels,
  swappedFlowers,
  type Learned,
  type WrongLabelCount,
} from '@/lib/ai-series/flowers/labels'
import { cn } from '@/lib/utils'

/** Chapter 3's setosa and versicolor colors, with their light-theme and dark-theme values. */
const COLOUR_VARIABLES =
  '[--setosa:oklch(0.52_0.16_255)] [--versicolor:oklch(0.64_0.17_50)] dark:[--setosa:oklch(0.74_0.13_245)] dark:[--versicolor:oklch(0.78_0.15_60)]'

const SPECIES_COLOUR: Record<Species, string> = {
  setosa: 'var(--setosa)',
  versicolor: 'var(--versicolor)',
}

/** Largest side of the plot, in CSS pixels. */
const MAX_SIDE = 520
/** Room around the plotted area for tick labels and axis words. */
const MARGIN = { left: 56, right: 22, top: 22, bottom: 52 }

const CHOICE_WORDS: Record<WrongLabelCount, string> = { 0: 'None', 5: '5', 20: '20', 50: '50' }

/** Chapter 5's interactive: the machine of chapter 3 learns from labels, some of them wrong. */
export function WrongLabels() {
  const [count, setCount] = useState<WrongLabelCount>(0)
  const [learned, setLearned] = useState<Learned | null>(null)
  const swapped = useMemo(() => swappedFlowers(count), [count])
  const labeled = useMemo(() => labeledFlowers(swapped), [swapped])

  function choose(next: WrongLabelCount) {
    setCount(next)
    setLearned(null)
  }

  return (
    <TryIt title="Wrong labels">
      <div className={cn('space-y-4 text-base', COLOUR_VARIABLES)}>
        <p>
          The same 100 irises as chapter 3. This time someone has labeled them, and some labels are
          wrong. Choose how many, then let the machine learn from the labels.
        </p>

        <CountChoice count={count} onChoose={choose} />

        <Plot labeled={labeled.map((f) => f.species)} swapped={swapped} line={learned?.line} />

        <Button
          variant="outline"
          className="h-11 px-5 text-base"
          onClick={() => setLearned(learnFromLabels(labeled))}
        >
          Let the machine learn
        </Button>

        <div role="status" className="font-medium">
          {learned && (
            <>
              <p>
                Judged by the labels it was given: {learned.rightByLabels} of 100 on the right side.
              </p>
              <p>Judged by the real species: {learned.rightBySpecies} of 100 on the right side.</p>
            </>
          )}
        </div>
        {learned && (
          <p className="text-muted-foreground">
            The machine cannot tell a wrong label from a right one. It learns what it is shown.
          </p>
        )}
      </div>
    </TryIt>
  )
}

function CountChoice({
  count,
  onChoose,
}: {
  count: WrongLabelCount
  onChoose(count: WrongLabelCount): void
}) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (step === 0) return
    event.preventDefault()
    const index = WRONG_LABEL_COUNTS.indexOf(count)
    const next = (index + step + WRONG_LABEL_COUNTS.length) % WRONG_LABEL_COUNTS.length
    onChoose(WRONG_LABEL_COUNTS[next])
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <div>
      <p id="wrong-labels-choice" className="mb-2 font-semibold">
        Wrong labels:
      </p>
      <div
        role="radiogroup"
        aria-labelledby="wrong-labels-choice"
        onKeyDown={onKeyDown}
        className="grid grid-cols-4 gap-2"
      >
        {WRONG_LABEL_COUNTS.map((option) => {
          const checked = option === count
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChoose(option)}
              className={cn(
                'bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring min-h-12 rounded-lg border px-2 py-2 text-base outline-none focus-visible:ring-3',
                checked ? 'border-primary border-4 px-1.5 py-1.5 font-semibold' : 'border-input',
              )}
            >
              {checked && <span aria-hidden="true">{'✓ '}</span>}
              {CHOICE_WORDS[option]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface PlotProps {
  /** Each flower's species as its label gives it, in FLOWERS order. */
  labeled: Species[]
  /** Indexes of the flowers whose label is wrong. */
  swapped: number[]
  /** The machine's line in centimeters, versicolor on its positive side, or none yet. */
  line: Line | undefined
}

/** Chapter 3's plot, each flower drawn by its label, with a ring around each wrong label. */
function Plot({ labeled, swapped, line }: PlotProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const available = useElementWidth(wrapperRef)
  const side = Math.min(MAX_SIDE, available || 320)
  const width = side - MARGIN.left - MARGIN.right
  const height = side - MARGIN.top - MARGIN.bottom

  const px = (x: number) => MARGIN.left + ((x - PLOT.xMin) / (PLOT.xMax - PLOT.xMin)) * width
  const py = (y: number) => MARGIN.top + ((PLOT.yMax - y) / (PLOT.yMax - PLOT.yMin)) * height
  const toPath = (points: Point[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.x)},${py(p.y)}`).join(' ') + ' Z'
  const segment = line ? clipToRect(line, PLOT) : null

  return (
    <div ref={wrapperRef} className="w-full">
      <svg
        width={side}
        height={side}
        viewBox={`0 0 ${side} ${side}`}
        role="img"
        aria-label={`Scatter plot of 100 iris flowers, ${swapped.length} of them with a wrong label.`}
        className="block select-none"
      >
        {line && segment && (
          <g aria-hidden>
            <path
              d={toPath(sideOfRect(line, PLOT, true))}
              fill={SPECIES_COLOUR.versicolor}
              opacity={0.08}
            />
            <path
              d={toPath(sideOfRect(line, PLOT, false))}
              fill={SPECIES_COLOUR.setosa}
              opacity={0.08}
            />
          </g>
        )}

        <g aria-hidden className="text-muted-foreground" fontSize={13}>
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={width}
            height={height}
            fill="none"
            stroke="var(--border)"
          />
          {X_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={px(tick)}
                x2={px(tick)}
                y1={MARGIN.top + height}
                y2={MARGIN.top + height + 5}
                stroke="currentColor"
              />
              <text
                x={px(tick)}
                y={MARGIN.top + height + 20}
                textAnchor="middle"
                fill="currentColor"
              >
                {tick}
              </text>
            </g>
          ))}
          {Y_TICKS.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left - 5}
                x2={MARGIN.left}
                y1={py(tick)}
                y2={py(tick)}
                stroke="currentColor"
              />
              <text
                x={MARGIN.left - 9}
                y={py(tick)}
                dy="0.35em"
                textAnchor="end"
                fill="currentColor"
              >
                {tick}
              </text>
            </g>
          ))}
          <text
            x={MARGIN.left + width / 2}
            y={side - 10}
            textAnchor="middle"
            fill="currentColor"
            fontSize={14}
          >
            {X_WORDS} in centimeters
          </text>
          <text
            transform={`translate(16 ${MARGIN.top + height / 2}) rotate(-90)`}
            textAnchor="middle"
            dy="0.35em"
            fill="currentColor"
            fontSize={14}
          >
            {Y_WORDS} in centimeters
          </text>
        </g>

        <g aria-hidden>
          {FLOWERS.map((flower, i) => (
            <Mark key={i} species={labeled[i]} cx={px(flower.x)} cy={py(flower.y)} />
          ))}
          {swapped.map((i) => (
            <Ring key={i} cx={px(FLOWERS[i].x)} cy={py(FLOWERS[i].y)} />
          ))}
        </g>

        {segment && (
          <line
            aria-hidden
            x1={px(segment[0].x)}
            y1={py(segment[0].y)}
            x2={px(segment[1].x)}
            y2={py(segment[1].y)}
            stroke="var(--foreground)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
        <li className="flex items-center gap-2">
          <LegendMark>
            <Mark species="setosa" cx={8} cy={8} />
          </LegendMark>
          Iris setosa
        </li>
        <li className="flex items-center gap-2">
          <LegendMark>
            <Mark species="versicolor" cx={8} cy={9} />
          </LegendMark>
          Iris versicolor
        </li>
        <li className="flex items-center gap-2">
          <LegendMark>
            <Ring cx={8} cy={8} />
          </LegendMark>
          wrong label
        </li>
      </ul>
    </div>
  )
}

/** A circle for setosa or a triangle for versicolor, centered on (cx, cy), as in chapter 3. */
function Mark({ species, cx, cy }: { species: Species; cx: number; cy: number }) {
  const colour = SPECIES_COLOUR[species]
  if (species === 'setosa') {
    return <circle cx={cx} cy={cy} r={5} fill={colour} fillOpacity={0.75} />
  }
  const points = `${cx},${cy - 6.5} ${cx + 5.6},${cy + 3.25} ${cx - 5.6},${cy + 3.25}`
  return <polygon points={points} fill={colour} fillOpacity={0.75} />
}

function Ring({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={7.5} fill="none" stroke="var(--foreground)" strokeWidth={1.5} />
}

function LegendMark({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden width={16} height={16} viewBox="0 0 16 16" className="shrink-0">
      {children}
    </svg>
  )
}
