import { memo, useId, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { TOOLTIP_CLASS } from '@/components/ui/tooltip'
import { DEFENDERS, type DefenseId } from '@/lib/film-room/defense'
import {
  FIELD_WIDTH,
  endLine,
  LEFT_HASH,
  RIGHT_HASH,
  VIEW_AHEAD,
  VIEW_BEHIND,
  type Point,
} from '@/lib/film-room/field'
import { personLine, seatDetails, seatName, type Seat } from '@/lib/film-room/lineups'
import type { OffenseId } from '@/lib/film-room/offense'
import type { Play } from '@/lib/film-room/play'
import type { Person } from '@/lib/film-room/real-snaps'
import { ROUTES, readLabels, type RouteAssignment } from '@/lib/film-room/routes'
import type { Timeline } from '@/lib/film-room/simulate'
import { uniform } from '@/lib/film-room/teams'
import { cn } from '@/lib/utils'
import { ZONES } from '@/lib/film-room/zones'

export interface Overlays {
  routes: boolean
  coverage: boolean
  offenseNames: boolean
  defenseNames: boolean
}

/** Screen units are yards; the offense moves up the screen. */
const sy = (y: number) => VIEW_AHEAD - y
const MARGIN = 1.5
const VIEW_WIDTH = FIELD_WIDTH + 2 * MARGIN
const VIEW_HEIGHT = VIEW_AHEAD + VIEW_BEHIND + 2 * MARGIN
const VIEW_BOX = `${-MARGIN} ${-MARGIN} ${VIEW_WIDTH} ${VIEW_HEIGHT}`

const COLORS = {
  grass: '#2e7a36',
  stripe: '#2a7032',
  endZone: '#255f2c',
  outOfBounds: '#3d4a40',
  line: 'rgba(255,255,255,0.8)',
  scrimmage: '#3b82f6',
  firstDown: '#facc15',
  readInk: '#0b162a',
  route: '#fb923c',
  read: '#fde68a',
  man: '#f472b6',
  rush: '#f87171',
  deep: '#60a5fa',
  short: '#fde047',
}

function polyline(points: Point[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${sy(p.y).toFixed(2)}`).join(' ')
}

/** Yards from the line of scrimmage where each darker five-yard stripe of grass starts. */
function stripeStarts(yardLine: number): number[] {
  const starts: number[] = []
  for (let y = -VIEW_BEHIND - 5; y < VIEW_AHEAD; y++) if ((yardLine + y) % 10 === 0) starts.push(y)
  return starts
}

/**
 * Grass, yard lines, hash marks, numbers, and the blue and yellow lines. They depend only on the
 * yard line and the distance to go, so they do not redraw while the play runs.
 */
const FieldMarkings = memo(function FieldMarkings({
  yardLine,
  distance,
}: {
  yardLine: number
  distance: number
}) {
  const lines: number[] = []
  for (let y = -VIEW_BEHIND; y <= VIEW_AHEAD; y++) lines.push(y)
  const goal = 100 - yardLine
  const back = endLine(yardLine)
  const endZoneTop = Math.min(back, VIEW_AHEAD)
  const firstDown = yardLine + distance < 100 ? distance : null
  return (
    <g>
      <rect x={0} y={0} width={FIELD_WIDTH} height={VIEW_AHEAD + VIEW_BEHIND} fill={COLORS.grass} />
      {stripeStarts(yardLine).map((y) => {
        const low = Math.max(y, -VIEW_BEHIND)
        const high = Math.min(y + 5, VIEW_AHEAD)
        return (
          <rect
            key={`stripe${y}`}
            x={0}
            y={sy(high)}
            width={FIELD_WIDTH}
            height={high - low}
            fill={COLORS.stripe}
          />
        )
      })}
      {goal < VIEW_AHEAD && (
        <rect
          x={0}
          y={sy(endZoneTop)}
          width={FIELD_WIDTH}
          height={endZoneTop - goal}
          fill={COLORS.endZone}
        />
      )}
      {back < VIEW_AHEAD && (
        <>
          <rect x={0} y={0} width={FIELD_WIDTH} height={sy(back)} fill={COLORS.outOfBounds} />
          <line
            x1={0}
            x2={FIELD_WIDTH}
            y1={sy(back)}
            y2={sy(back)}
            stroke={COLORS.line}
            strokeWidth={0.4}
          />
        </>
      )}
      {lines.map((y) => {
        const abs = yardLine + y
        if (abs > 100) return null
        if (abs % 5 === 0) {
          return (
            <line
              key={`line${y}`}
              x1={0}
              x2={FIELD_WIDTH}
              y1={sy(y)}
              y2={sy(y)}
              stroke={COLORS.line}
              strokeWidth={abs === 100 ? 0.4 : 0.15}
            />
          )
        }
        return (
          <g key={`hash${y}`} stroke={COLORS.line} strokeWidth={0.12}>
            {[0.3, LEFT_HASH - 0.35, RIGHT_HASH - 0.35, FIELD_WIDTH - 1].map((x) => (
              <line key={x} x1={x} x2={x + 0.7} y1={sy(y)} y2={sy(y)} />
            ))}
          </g>
        )
      })}
      {lines
        .filter((y) => {
          const abs = yardLine + y
          return abs % 10 === 0 && abs > 0 && abs < 100
        })
        .map((y) => {
          const abs = yardLine + y
          const n = abs <= 50 ? abs : 100 - abs
          return (
            <g
              key={`num${y}`}
              fill="rgba(255,255,255,0.75)"
              fontSize={2}
              fontWeight={700}
              textAnchor="middle"
            >
              <text transform={`translate(8 ${sy(y)}) rotate(90)`} dy={0.7}>
                {n}
              </text>
              <text transform={`translate(${FIELD_WIDTH - 8} ${sy(y)}) rotate(-90)`} dy={0.7}>
                {n}
              </text>
            </g>
          )
        })}
      <line
        x1={0}
        x2={FIELD_WIDTH}
        y1={sy(0)}
        y2={sy(0)}
        stroke={COLORS.scrimmage}
        strokeWidth={0.3}
      />
      {firstDown !== null && firstDown < VIEW_AHEAD && (
        <line
          x1={0}
          x2={FIELD_WIDTH}
          y1={sy(firstDown)}
          y2={sy(firstDown)}
          stroke={COLORS.firstDown}
          strokeWidth={0.3}
        />
      )}
      <rect
        x={0}
        y={0}
        width={FIELD_WIDTH}
        height={VIEW_AHEAD + VIEW_BEHIND}
        fill="none"
        stroke="white"
        strokeWidth={0.35}
      />
    </g>
  )
})

/** White text with a dark outline, readable on grass and on the coverage boxes. */
function Label({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text
      x={x}
      y={y}
      fontSize={1.05}
      textAnchor="middle"
      fill="white"
      stroke="rgba(0,0,0,0.6)"
      strokeWidth={0.25}
      paintOrder="stroke"
    >
      {children}
    </text>
  )
}

function Arrowhead({ id, size, fill }: { id: string; size: number; fill: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="6"
      refY="5"
      markerWidth={size}
      markerHeight={size}
      orient="auto"
    >
      <path d="M0,0 L10,5 L0,10 z" fill={fill} />
    </marker>
  )
}

/** Every route as drawn from the snap, with its name at the end when `names` is on. */
/**
 * The quarterback's read number on a route ("1", "2", ...) or "C" for the checkdown, drawn beside
 * the route's first turning point.
 */
function ReadBadge({ at, label }: { at: Point; label: string }) {
  return (
    <g transform={`translate(${(at.x + 1.2).toFixed(2)} ${(sy(at.y) - 1.2).toFixed(2)})`}>
      <circle r={0.75} fill={COLORS.read} stroke={COLORS.readInk} strokeWidth={0.12} />
      <text fontSize={0.9} textAnchor="middle" dy={0.32} fill={COLORS.readInk} fontWeight={700}>
        {label}
      </text>
    </g>
  )
}

const Routes = memo(function Routes({
  play,
  snap,
  paths,
  arrow,
  names,
}: {
  play: Play
  snap: Record<OffenseId, Point>
  /** Each route's path, as the simulation runs it. */
  paths: Timeline['routes']
  arrow: string
  names: boolean
}) {
  const reads = readLabels(play.concept, play.formation, play.routes)
  return (
    <g>
      {(Object.entries(play.routes) as [OffenseId, RouteAssignment][]).map(([id, { route }]) => {
        const start = snap[id]
        if (route === 'block') {
          return (
            <line
              key={id}
              x1={start.x - 0.8}
              x2={start.x + 0.8}
              y1={sy(start.y + 1.3)}
              y2={sy(start.y + 1.3)}
              stroke={COLORS.route}
              strokeWidth={0.3}
            />
          )
        }
        const path = paths[id]
        if (!path) return null
        const end = path[path.length - 1]
        const read = reads[id]
        return (
          <g key={id}>
            <polyline
              points={polyline(path)}
              fill="none"
              stroke={COLORS.route}
              strokeWidth={0.3}
              strokeLinejoin="round"
              markerEnd={`url(#${arrow})`}
            />
            {names && (
              <Label x={end.x} y={sy(end.y) - 0.8}>
                {ROUTES[route].name}
              </Label>
            )}
            {read && <ReadBadge at={path[1] ?? end} label={read} />}
          </g>
        )
      })}
    </g>
  )
})

/**
 * Zones with each defender's drop to his landmark, and an arrow for each rusher. All of it is
 * drawn from the snap, so it does not change while the play runs.
 */
const Zones = memo(function Zones({
  play,
  snap,
  landmarks,
  qb,
  rushArrow,
}: {
  play: Play
  snap: Record<DefenseId, Point>
  /** Where each zone defender drops, as the simulation runs it. */
  landmarks: Timeline['landmarks']
  qb: Point
  rushArrow: string
}) {
  return (
    <g>
      {play.defense.players.map((d) => {
        const a = d.assignment
        const from = snap[d.id]
        if (a.kind === 'rush') {
          const dx = qb.x - from.x
          const dy = qb.y - from.y
          const len = Math.hypot(dx, dy) || 1
          const reach = Math.min(3, len - 1)
          return (
            <line
              key={d.id}
              x1={from.x}
              y1={sy(from.y)}
              x2={from.x + (dx / len) * reach}
              y2={sy(from.y + (dy / len) * reach)}
              stroke={COLORS.rush}
              strokeWidth={0.3}
              markerEnd={`url(#${rushArrow})`}
            />
          )
        }
        if (a.kind !== 'zone') return null
        const z = ZONES[a.zone]
        const color = z.deep ? COLORS.deep : COLORS.short
        const mark = landmarks[d.id] ?? z.landmark
        // Near the goal line a deep zone is squeezed between its drop point and the end line.
        const top = Math.min(z.y[1], VIEW_AHEAD, endLine(play.situation.yardLine))
        const bottom = Math.min(z.y[0], mark.y - 1, top - 2)
        return (
          <g key={d.id}>
            <rect
              x={z.x[0] + 0.25}
              y={sy(top) + 0.25}
              width={z.x[1] - z.x[0] - 0.5}
              height={top - bottom - 0.5}
              rx={1.2}
              fill={color}
              fillOpacity={0.16}
              stroke={color}
              strokeOpacity={0.85}
              strokeWidth={0.15}
              strokeDasharray="0.6 0.4"
            />
            <line
              x1={from.x}
              y1={sy(from.y)}
              x2={mark.x}
              y2={sy(mark.y)}
              stroke={color}
              strokeWidth={0.15}
              strokeDasharray="0.5 0.4"
            />
            <Label x={(z.x[0] + z.x[1]) / 2} y={sy(top) + 1.6}>
              {`${z.label} · ${DEFENDERS[d.id].label}`}
            </Label>
          </g>
        )
      })}
    </g>
  )
})

/** A dashed line from each man defender to his receiver, where both are now. */
function ManLines({
  play,
  defense,
  offense,
}: {
  play: Play
  defense: Record<DefenseId, Point>
  offense: Record<OffenseId, Point>
}) {
  return (
    <g>
      {play.defense.players.map((d) => {
        if (d.assignment.kind !== 'man') return null
        const target = offense[d.assignment.target]
        return (
          <line
            key={d.id}
            x1={defense[d.id].x}
            y1={sy(defense[d.id].y)}
            x2={target.x}
            y2={sy(target.y)}
            stroke={COLORS.man}
            strokeWidth={0.22}
            strokeDasharray="0.5 0.35"
          />
        )
      })}
    </g>
  )
}

/** Shows and hides a player's details as he is pointed at, tapped or focused. */
interface SeatEvents {
  onShow(seat: Seat): void
  onHide(seat: Seat): void
}

/** A player's marker at his spot on the field, which shows his details when pointed at. */
function SeatMark({
  seat,
  at,
  name,
  events,
  children,
}: {
  seat: Seat
  at: Point
  /** What screen readers and keyboard focus call him. */
  name: string
  events: SeatEvents
  children: ReactNode
}) {
  return (
    <g
      transform={`translate(${at.x.toFixed(2)} ${sy(at.y).toFixed(2)})`}
      tabIndex={0}
      role="button"
      aria-label={name}
      className="cursor-pointer outline-none focus-visible:[&>*:first-child]:stroke-[0.35]"
      onPointerEnter={() => events.onShow(seat)}
      onPointerLeave={() => events.onHide(seat)}
      onClick={() => events.onShow(seat)}
      onFocus={() => events.onShow(seat)}
      onBlur={() => events.onHide(seat)}
    >
      {children}
    </g>
  )
}

function Disc({
  label,
  fill,
  trim,
  ink,
}: {
  label: string
  fill: string
  trim: string
  ink: string
}) {
  return (
    <>
      <circle r={1.05} fill={fill} stroke={trim} strokeWidth={0.18} />
      <text
        fontSize={label.length > 1 ? 0.75 : 0.95}
        textAnchor="middle"
        dy={0.33}
        fill={ink}
        fontWeight={700}
      >
        {label}
      </text>
    </>
  )
}

function Players({
  play,
  offense,
  defense,
  names,
  events,
}: {
  play: Play
  offense: Record<OffenseId, Point>
  defense: Record<DefenseId, Point>
  names: (seat: Seat) => string
  events: SeatEvents
}) {
  const { offense: offenseTeam, defense: defenseTeam, offenseHome } = play.situation
  const kits = {
    offense: uniform(offenseTeam, offenseHome),
    defense: uniform(defenseTeam, !offenseHome),
  }
  return (
    <g>
      {play.formation.players.map((p) => (
        <SeatMark key={p.id} seat={p.id} at={offense[p.id]} name={names(p.id)} events={events}>
          {p.role === 'line' ? (
            <rect
              x={-0.6}
              y={-0.6}
              width={1.2}
              height={1.2}
              rx={0.25}
              fill={kits.offense.fill}
              stroke={kits.offense.trim}
              strokeWidth={0.15}
            />
          ) : (
            <Disc
              label={p.id}
              fill={kits.offense.fill}
              trim={kits.offense.trim}
              ink={kits.offense.ink}
            />
          )}
        </SeatMark>
      ))}
      {play.defense.players.map((d) => (
        <SeatMark key={d.id} seat={d.id} at={defense[d.id]} name={names(d.id)} events={events}>
          <Disc
            label={DEFENDERS[d.id].label}
            fill={kits.defense.fill}
            trim={kits.defense.trim}
            ink={kits.defense.ink}
          />
        </SeatMark>
      ))}
    </g>
  )
}

/**
 * Where to put a player's details box, as a share of the picture: above him, or below him near
 * the top, and pinned to a side near the sidelines so it stays on screen.
 */
function boxPlacement(at: Point): { style: CSSProperties; className: string } {
  const left = (at.x + MARGIN) / VIEW_WIDTH
  const top = (sy(at.y) + MARGIN) / VIEW_HEIGHT
  const below = top < 0.2
  const horizontal =
    left < 0.2 ? 'translate-x-0' : left > 0.8 ? '-translate-x-full' : '-translate-x-1/2'
  return {
    style: {
      left: `${left * 100}%`,
      top: below ? `calc(${top * 100}% + 14px)` : `calc(${top * 100}% - 14px)`,
    },
    className: cn(horizontal, !below && '-translate-y-full'),
  }
}

/** The field from behind the offense, like the end-zone camera on the All-22 film. */
export function FieldView({
  play,
  timeline,
  index,
  overlays,
  title,
  people,
}: {
  play: Play
  timeline: Timeline
  index: number
  overlays: Overlays
  title: string
  /** The real players in each spot, for a real snap whose lineup has loaded. */
  people?: Partial<Record<Seat, Person>>
}) {
  const id = useId()
  const [shown, setShown] = useState<Seat | null>(null)
  const frame = timeline.frames[index]
  const snap = timeline.frames[timeline.snap]
  const routeArrow = `${id}-route`
  const rushArrow = `${id}-rush`
  const events = useMemo<SeatEvents>(
    () => ({
      onShow: setShown,
      onHide: (seat) => setShown((current) => (current === seat ? null : current)),
    }),
    [],
  )
  const names = (seat: Seat) => {
    const person = people?.[seat]
    return person ? personLine(person) : seatName(play, seat)
  }
  const shownAt = shown && (frame.offense[shown as OffenseId] ?? frame.defense[shown as DefenseId])
  const box = shown && shownAt ? boxPlacement(shownAt) : null

  return (
    <div className="relative" onPointerLeave={() => setShown(null)}>
      <svg
        viewBox={VIEW_BOX}
        className="block h-auto w-full rounded-lg select-none"
        style={{ backgroundColor: COLORS.grass }}
        role="group"
        aria-label={title}
      >
        <defs>
          <Arrowhead id={routeArrow} size={4} fill={COLORS.route} />
          <Arrowhead id={rushArrow} size={3.5} fill={COLORS.rush} />
        </defs>
        <FieldMarkings yardLine={play.situation.yardLine} distance={play.situation.distance} />
        {overlays.coverage && (
          <>
            <Zones
              play={play}
              snap={snap.defense}
              landmarks={timeline.landmarks}
              qb={snap.offense.QB}
              rushArrow={rushArrow}
            />
            <ManLines play={play} defense={frame.defense} offense={frame.offense} />
          </>
        )}
        {overlays.routes && (
          <Routes
            play={play}
            snap={snap.offense}
            paths={timeline.routes}
            arrow={routeArrow}
            names={overlays.offenseNames}
          />
        )}
        <Players
          play={play}
          offense={frame.offense}
          defense={frame.defense}
          names={names}
          events={events}
        />
      </svg>
      {shown && box && (
        <div
          role="tooltip"
          className={cn(TOOLTIP_CLASS, 'pointer-events-none absolute z-10 w-max', box.className)}
          style={box.style}
        >
          {seatDetails(play, shown, people?.[shown], overlays).map((line, i) => (
            <p key={line} className={i === 0 ? 'font-semibold' : 'text-muted-foreground'}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
