import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import { useElementWidth } from '@/components/ai-series/draw-pad'
import {
  FLOWERS,
  PLOT,
  READER_START,
  X_TICKS,
  X_WORDS,
  Y_TICKS,
  Y_WORDS,
  bestAssignment,
  clampToRect,
  clipToRect,
  countRight,
  lineThrough,
  machineStart,
  nextCorrection,
  otherSpecies,
  sideOfRect,
  toPlotLine,
  valueAt,
  wrongOnes,
  type Line,
  type MachineState,
  type Point,
  type Species,
} from '@/lib/ai-series/flowers/flowers'
import { cn } from '@/lib/utils'

/**
 * The setosa and versicolor colors: the blue and orange of "Draw a digit", which stay apart for
 * color-blind readers, each with a light-theme and a dark-theme value.
 */
const COLOUR_VARIABLES =
  '[--setosa:oklch(0.52_0.16_255)] [--versicolor:oklch(0.64_0.17_50)] dark:[--setosa:oklch(0.74_0.13_245)] dark:[--versicolor:oklch(0.78_0.15_60)]'

const SPECIES_COLOUR: Record<Species, string> = {
  setosa: 'var(--setosa)',
  versicolor: 'var(--versicolor)',
}

/** Largest side of the plot, in CSS pixels. */
const MAX_SIDE = 520
/** Room around the plotted area for tick labels, axis words and handles at the edge. */
const MARGIN = { left: 56, right: 22, top: 22, bottom: 52 }
/** Corrections per second while the machine keeps going. */
const CORRECTIONS_PER_SECOND = 4
/** How far one arrow-key press moves a handle, in centimeters; with Shift, the larger one. */
const KEY_STEP = 0.05
const SHIFT_KEY_STEP = 0.5

type Mode = 'you' | 'machine'

/** Chapter 3's interactive: separate two iris species with a line, then watch a machine do it. */
export function SortTheFlowers() {
  const [mode, setMode] = useState<Mode>('you')
  const [ends, setEnds] = useState<[Point, Point]>(READER_START)
  const [machine, setMachine] = useState<{ state: MachineState; marked: number | null }>(() => ({
    state: machineStart(),
    marked: null,
  }))
  const [running, setRunning] = useState(false)
  const done = machine.state.done
  const going = running && !done

  useEffect(() => {
    if (!going) return
    const timer = setInterval(() => {
      setMachine((previous) => {
        const correction = nextCorrection(previous.state)
        return { state: correction.state, marked: correction.flower }
      })
    }, 1000 / CORRECTIONS_PER_SECOND)
    return () => clearInterval(timer)
  }, [going])

  const readerLine = lineThrough(ends[0], ends[1])
  const line = mode === 'you' ? readerLine : toPlotLine(machine.state.line)
  const positive = mode === 'you' ? bestAssignment(readerLine, FLOWERS) : 'versicolor'
  const right = countRight(line, FLOWERS, positive)
  const wrong = wrongOnes(line, FLOWERS, positive)

  function oneCorrection() {
    setRunning(false)
    const correction = nextCorrection(machine.state)
    setMachine({ state: correction.state, marked: correction.flower })
  }

  function keepGoingOrPause() {
    setMachine((previous) => ({ ...previous, marked: null }))
    setRunning(!going)
  }

  function startAgain() {
    setRunning(false)
    setMachine({ state: machineStart(), marked: null })
  }

  return (
    <TryIt title="Sort the flowers">
      <div className={cn('space-y-4 text-base', COLOUR_VARIABLES)}>
        <p>
          Each mark is one real iris flower, placed by two measurements of it. Circles are one
          species, triangles are another.
        </p>

        <ModeTabs mode={mode} onChange={setMode} />

        <div
          role="tabpanel"
          id="sort-the-flowers-panel"
          aria-labelledby={`sort-the-flowers-tab-${mode}`}
          className="space-y-4"
        >
          {mode === 'you' ? (
            <p>
              Drag the two round handles so that all the circles are on one side of the line and all
              the triangles are on the other.
            </p>
          ) : (
            <p>
              The machine has not seen your line. It starts with a line in a bad place. It checks
              one flower at a time. When a flower is on the wrong side, it moves the line a little
              so that flower is closer to the right side.
            </p>
          )}

          <Plot
            line={line}
            positive={positive}
            wrong={wrong}
            right={right}
            marked={mode === 'machine' && !done ? machine.marked : null}
            ends={mode === 'you' ? ends : null}
            onEndsChange={setEnds}
          />

          {mode === 'you' ? (
            <div role="status" className="font-medium">
              <p>
                {right === 100
                  ? 'Your line sorts all 100 flowers.'
                  : `Your line has ${right} of 100 flowers on the right side.`}
              </p>
              {wrong.length > 0 && (
                <p>
                  {wrong.length === 1
                    ? '1 on the wrong side. It is ringed.'
                    : `${wrong.length} on the wrong side. They are ringed.`}
                </p>
              )}
            </div>
          ) : (
            <>
              <p role="status" className="font-medium">
                {done
                  ? `Done. Every flower is on the right side after ${machine.state.corrections} corrections.`
                  : `Corrections so far: ${machine.state.corrections}. Flowers on the right side: ${right} of 100.`}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="h-11 px-5 text-base"
                  disabled={done}
                  onClick={oneCorrection}
                >
                  One correction
                </Button>
                <Button
                  variant="outline"
                  className="h-11 px-5 text-base"
                  disabled={done}
                  onClick={keepGoingOrPause}
                >
                  {going ? 'Pause' : 'Keep going'}
                </Button>
                <Button variant="outline" className="h-11 px-5 text-base" onClick={startAgain}>
                  Start again
                </Button>
              </div>
              <p>
                The machine&rsquo;s line is three numbers: {twoDecimals(machine.state.line.a)},{' '}
                {twoDecimals(machine.state.line.b)}, {twoDecimals(machine.state.line.c)}. Each
                correction changes them a little. Two of them set how the line tilts. The third sets
                where it sits.
              </p>
            </>
          )}
        </div>
      </div>
    </TryIt>
  )
}

/** A number to two decimals with a true minus sign, and no "−0.00". */
function twoDecimals(value: number): string {
  const text = value.toFixed(2)
  return text === '-0.00' ? '0.00' : text.replace('-', '−')
}

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'you', label: 'You try' },
  { mode: 'machine', label: 'The machine tries' },
]

function ModeTabs({ mode, onChange }: { mode: Mode; onChange(mode: Mode): void }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = (index + (event.key === 'ArrowRight' ? 1 : MODES.length - 1)) % MODES.length
    onChange(MODES[next].mode)
    tabRefs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="Who moves the line" className="flex flex-wrap gap-2 border-b">
      {MODES.map((tab, index) => {
        const selected = tab.mode === mode
        return (
          <button
            key={tab.mode}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`sort-the-flowers-tab-${tab.mode}`}
            aria-selected={selected}
            aria-controls="sort-the-flowers-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.mode)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'focus-visible:ring-ring/50 -mb-px min-h-11 rounded-t-lg border-b-2 px-3 text-base outline-none focus-visible:ring-3',
              selected
                ? 'border-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {selected && (
              <span aria-hidden className="mr-1.5">
                ●
              </span>
            )}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

interface PlotProps {
  /** The line in centimeters. */
  line: Line
  /** The species whose side is the line's positive side. */
  positive: Species
  /** Indexes of flowers on the wrong side. */
  wrong: number[]
  right: number
  /** A flower to mark with a larger ring, or null. */
  marked: number | null
  /** The reader's two handles, or null when the line has none. */
  ends: [Point, Point] | null
  onEndsChange(ends: [Point, Point]): void
}

function Plot({ line, positive, wrong, right, marked, ends, onEndsChange }: PlotProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef<{ pointer: number; end: 0 | 1 } | null>(null)
  const available = useElementWidth(wrapperRef)
  const side = Math.min(MAX_SIDE, available || 320)
  const width = side - MARGIN.left - MARGIN.right
  const height = side - MARGIN.top - MARGIN.bottom

  const px = (x: number) => MARGIN.left + ((x - PLOT.xMin) / (PLOT.xMax - PLOT.xMin)) * width
  const py = (y: number) => MARGIN.top + ((PLOT.yMax - y) / (PLOT.yMax - PLOT.yMin)) * height
  const toPath = (points: Point[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.x)},${py(p.y)}`).join(' ') + ' Z'

  // `touch-action: none` on an element inside an SVG is not honored by every phone browser. Where
  // it is ignored, a touch that starts on a handle also pans the page, and the browser then
  // cancels the drag. Claiming such a touch here keeps the page still. A touch that starts
  // anywhere else on the plot still scrolls the page.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const claimTouch = (event: TouchEvent) => {
      const onHandle =
        event.target instanceof Element && event.target.closest('[data-line-handle]') !== null
      if ((onHandle || draggingRef.current) && event.cancelable) event.preventDefault()
    }
    svg.addEventListener('touchstart', claimTouch, { passive: false })
    svg.addEventListener('touchmove', claimTouch, { passive: false })
    return () => {
      svg.removeEventListener('touchstart', claimTouch)
      svg.removeEventListener('touchmove', claimTouch)
    }
  }, [])

  const segment = clipToRect(line, PLOT)
  const negative = otherSpecies(positive)

  function pointAt(event: ReactPointerEvent): Point {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return clampToRect(
      {
        x: PLOT.xMin + ((x - MARGIN.left) / width) * (PLOT.xMax - PLOT.xMin),
        y: PLOT.yMax - ((y - MARGIN.top) / height) * (PLOT.yMax - PLOT.yMin),
      },
      PLOT,
    )
  }

  function moveEnd(end: 0 | 1, point: Point) {
    if (!ends) return
    const next: [Point, Point] = [ends[0], ends[1]]
    next[end] = clampToRect(point, PLOT)
    onEndsChange(next)
  }

  function handlePointerDown(event: ReactPointerEvent<SVGGElement>, end: 0 | 1) {
    if (draggingRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    draggingRef.current = { pointer: event.pointerId, end }
  }

  function handlePointerMove(event: ReactPointerEvent<SVGGElement>) {
    const dragging = draggingRef.current
    if (!dragging || dragging.pointer !== event.pointerId) return
    moveEnd(dragging.end, pointAt(event))
  }

  function handlePointerEnd(event: ReactPointerEvent<SVGGElement>) {
    if (draggingRef.current?.pointer === event.pointerId) draggingRef.current = null
  }

  function handleKeyDown(event: ReactKeyboardEvent<SVGGElement>, end: 0 | 1) {
    if (!ends) return
    const step = event.shiftKey ? SHIFT_KEY_STEP : KEY_STEP
    const moves: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const round = (value: number) => Math.round(value * 1000) / 1000
    moveEnd(end, { x: round(ends[end].x + move.x), y: round(ends[end].y + move.y) })
  }

  const sideLabels = segment ? placeSideLabels(line, positive, px, py, width, height) : []

  return (
    <div ref={wrapperRef} className="w-full scroll-mt-20">
      <svg
        ref={svgRef}
        width={side}
        height={side}
        viewBox={`0 0 ${side} ${side}`}
        role="group"
        aria-label={`Scatter plot of 100 iris flowers. The line has ${right} of 100 on the right side.`}
        className="block select-none"
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      >
        {segment && (
          <g aria-hidden>
            <path
              d={toPath(sideOfRect(line, PLOT, true))}
              fill={SPECIES_COLOUR[positive]}
              opacity={0.08}
            />
            <path
              d={toPath(sideOfRect(line, PLOT, false))}
              fill={SPECIES_COLOUR[negative]}
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
            <Mark key={i} species={flower.species} cx={px(flower.x)} cy={py(flower.y)} />
          ))}
          {wrong.map((i) => (
            <circle
              key={i}
              cx={px(FLOWERS[i].x)}
              cy={py(FLOWERS[i].y)}
              r={9}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={1.5}
            />
          ))}
          {marked !== null && (
            <circle
              cx={px(FLOWERS[marked].x)}
              cy={py(FLOWERS[marked].y)}
              r={15}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={2.5}
            />
          )}
        </g>

        {segment && (
          <g aria-hidden>
            <line
              x1={px(segment[0].x)}
              y1={py(segment[0].y)}
              x2={px(segment[1].x)}
              y2={py(segment[1].y)}
              stroke="var(--foreground)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            {sideLabels.map((label) => (
              <text
                key={label.species}
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontSize={13}
                fontWeight={600}
                fill="var(--foreground)"
                stroke="var(--card)"
                strokeWidth={4}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {label.species} side
              </text>
            ))}
          </g>
        )}

        {ends &&
          ends.map((point, end) => (
            <g
              key={end}
              role="button"
              tabIndex={0}
              aria-label={end === 0 ? 'First end of the line' : 'Second end of the line'}
              data-line-handle
              className="group cursor-grab outline-none active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onPointerDown={(event) => handlePointerDown(event, end as 0 | 1)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onLostPointerCapture={handlePointerEnd}
              onKeyDown={(event) => handleKeyDown(event, end as 0 | 1)}
            >
              <circle cx={px(point.x)} cy={py(point.y)} r={22} fill="transparent" />
              <circle
                cx={px(point.x)}
                cy={py(point.y)}
                r={12}
                fill="none"
                stroke="var(--ring)"
                strokeWidth={3}
                className="opacity-0 group-focus-visible:opacity-100"
              />
              <circle
                cx={px(point.x)}
                cy={py(point.y)}
                r={7}
                fill="var(--foreground)"
                stroke="var(--card)"
                strokeWidth={2}
              />
            </g>
          ))}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
        <li className="flex items-center gap-2">
          <LegendMark species="setosa" />
          Iris setosa
        </li>
        <li className="flex items-center gap-2">
          <LegendMark species="versicolor" />
          Iris versicolor
        </li>
      </ul>
    </div>
  )
}

/** A circle for setosa or a triangle for versicolor, centered on (cx, cy). */
function Mark({ species, cx, cy }: { species: Species; cx: number; cy: number }) {
  const colour = SPECIES_COLOUR[species]
  if (species === 'setosa') {
    return <circle cx={cx} cy={cy} r={5} fill={colour} fillOpacity={0.75} />
  }
  // An upward triangle about as large as the circle.
  const points = `${cx},${cy - 6.5} ${cx + 5.6},${cy + 3.25} ${cx - 5.6},${cy + 3.25}`
  return <polygon points={points} fill={colour} fillOpacity={0.75} />
}

function LegendMark({ species }: { species: Species }) {
  return (
    <svg aria-hidden width={16} height={16} viewBox="0 0 16 16" className="shrink-0">
      <Mark species={species} cx={8} cy={species === 'setosa' ? 8 : 9} />
    </svg>
  )
}

interface SideLabel {
  species: Species
  x: number
  y: number
  anchor: 'start' | 'middle' | 'end'
}

/**
 * Places "setosa side" and "versicolor side" near the plot's edge, each on its own side of the line:
 * of eight spots just inside the corners and edge middles, each label takes the one on its side
 * farthest from the line.
 */
function placeSideLabels(
  line: Line,
  positive: Species,
  px: (x: number) => number,
  py: (y: number) => number,
  width: number,
  height: number,
): SideLabel[] {
  const inset = 8
  const left = MARGIN.left + inset
  const right = MARGIN.left + width - inset
  const centre = MARGIN.left + width / 2
  const top = MARGIN.top + inset + 11
  const bottom = MARGIN.top + height - inset
  const middle = MARGIN.top + height / 2
  const spots: SideLabel[] = []
  for (const [x, anchor] of [
    [left, 'start'],
    [centre, 'middle'],
    [right, 'end'],
  ] as const) {
    for (const y of [top, middle, bottom]) {
      if (x === centre && y === middle) continue
      spots.push({ species: positive, x, y, anchor })
    }
  }

  // The line in pixels, to measure each spot's distance from it on screen.
  const toCm = (spot: SideLabel): Point => ({
    x: PLOT.xMin + ((spot.x - MARGIN.left) / width) * (PLOT.xMax - PLOT.xMin),
    y: PLOT.yMax - ((spot.y - MARGIN.top) / height) * (PLOT.yMax - PLOT.yMin),
  })
  const segment = clipToRect(line, PLOT)
  if (!segment) return []
  const [p, q] = segment.map((point) => ({ x: px(point.x), y: py(point.y) }))
  const length = Math.hypot(q.x - p.x, q.y - p.y) || 1
  const distance = (spot: SideLabel) =>
    Math.abs((q.x - p.x) * (p.y - spot.y) - (p.x - spot.x) * (q.y - p.y)) / length

  const labels: SideLabel[] = []
  for (const [species, sign] of [
    [positive, 1],
    [otherSpecies(positive), -1],
  ] as const) {
    const onSide = spots.filter((spot) => sign * valueAt(line, toCm(spot)) > 0)
    if (onSide.length === 0) continue
    const best = onSide.reduce((a, b) => (distance(b) > distance(a) ? b : a))
    labels.push({ ...best, species })
  }
  return labels
}
