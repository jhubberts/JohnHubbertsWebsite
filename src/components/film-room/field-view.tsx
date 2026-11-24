import { memo, useId, type ReactNode } from 'react'
import { DEFENDERS, type DefenseId } from '@/lib/film-room/defense'
import {
  FIELD_WIDTH,
  LEFT_HASH,
  RIGHT_HASH,
  VIEW_AHEAD,
  VIEW_BEHIND,
  type Point,
} from '@/lib/film-room/field'
import type { OffenseId } from '@/lib/film-room/offense'
import type { Play } from '@/lib/film-room/play'
import { ROUTES, routePath, type RouteAssignment } from '@/lib/film-room/routes'
import type { Timeline } from '@/lib/film-room/simulate'
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
const VIEW_BOX = `${-MARGIN} ${-MARGIN} ${FIELD_WIDTH + 2 * MARGIN} ${VIEW_AHEAD + VIEW_BEHIND + 2 * MARGIN}`

const COLORS = {
  grass: '#2e7a36',
  stripe: '#2a7032',
  endZone: '#255f2c',
  line: 'rgba(255,255,255,0.8)',
  scrimmage: '#3b82f6',
  firstDown: '#facc15',
  offense: '#0b162a',
  offenseTrim: '#e8662c',
  defense: '#f8fafc',
  defenseTrim: '#1e293b',
  route: '#fb923c',
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
        <rect x={0} y={0} width={FIELD_WIDTH} height={sy(goal)} fill={COLORS.endZone} />
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
const Routes = memo(function Routes({
  play,
  snap,
  arrow,
  names,
}: {
  play: Play
  snap: Record<OffenseId, Point>
  arrow: string
  names: boolean
}) {
  return (
    <g>
      {(Object.entries(play.routes) as [OffenseId, RouteAssignment][]).map(
        ([id, { route, side }]) => {
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
          const path = routePath(route, start, side)
          const end = path[path.length - 1]
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
            </g>
          )
        },
      )}
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
  qb,
  rushArrow,
}: {
  play: Play
  snap: Record<DefenseId, Point>
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
        const top = Math.min(z.y[1], VIEW_AHEAD)
        return (
          <g key={d.id}>
            <rect
              x={z.x[0] + 0.25}
              y={sy(top) + 0.25}
              width={z.x[1] - z.x[0] - 0.5}
              height={top - z.y[0] - 0.5}
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
              x2={z.landmark.x}
              y2={sy(z.landmark.y)}
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

function Token({
  at,
  label,
  fill,
  trim,
  ink,
}: {
  at: Point
  label: string
  fill: string
  trim: string
  ink: string
}) {
  return (
    <g transform={`translate(${at.x.toFixed(2)} ${sy(at.y).toFixed(2)})`}>
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
    </g>
  )
}

function Players({
  play,
  offense,
  defense,
}: {
  play: Play
  offense: Record<OffenseId, Point>
  defense: Record<DefenseId, Point>
}) {
  return (
    <g>
      {play.formation.players.map((p) => {
        const at = offense[p.id]
        if (p.role === 'line') {
          return (
            <rect
              key={p.id}
              x={at.x - 0.6}
              y={sy(at.y) - 0.6}
              width={1.2}
              height={1.2}
              rx={0.25}
              fill={COLORS.offense}
              stroke={COLORS.offenseTrim}
              strokeWidth={0.15}
            />
          )
        }
        return (
          <Token
            key={p.id}
            at={at}
            label={p.id}
            fill={COLORS.offense}
            trim={COLORS.offenseTrim}
            ink="white"
          />
        )
      })}
      {play.defense.players.map((d) => (
        <Token
          key={d.id}
          at={defense[d.id]}
          label={DEFENDERS[d.id].label}
          fill={COLORS.defense}
          trim={COLORS.defenseTrim}
          ink={COLORS.defenseTrim}
        />
      ))}
    </g>
  )
}

/** The field from behind the offense, like the end-zone camera on the All-22 film. */
export function FieldView({
  play,
  timeline,
  index,
  overlays,
  title,
}: {
  play: Play
  timeline: Timeline
  index: number
  overlays: Overlays
  title: string
}) {
  const id = useId()
  const frame = timeline.frames[index]
  const snap = timeline.frames[timeline.snap]
  const routeArrow = `${id}-route`
  const rushArrow = `${id}-rush`
  return (
    <svg
      viewBox={VIEW_BOX}
      className="block h-auto w-full rounded-lg select-none"
      style={{ backgroundColor: COLORS.grass }}
      role="img"
      aria-label={title}
    >
      <defs>
        <Arrowhead id={routeArrow} size={4} fill={COLORS.route} />
        <Arrowhead id={rushArrow} size={3.5} fill={COLORS.rush} />
      </defs>
      <FieldMarkings yardLine={play.situation.yardLine} distance={play.situation.distance} />
      {overlays.coverage && (
        <>
          <Zones play={play} snap={snap.defense} qb={snap.offense.QB} rushArrow={rushArrow} />
          <ManLines play={play} defense={frame.defense} offense={frame.offense} />
        </>
      )}
      {overlays.routes && (
        <Routes play={play} snap={snap.offense} arrow={routeArrow} names={overlays.offenseNames} />
      )}
      <Players play={play} offense={frame.offense} defense={frame.defense} />
    </svg>
  )
}
