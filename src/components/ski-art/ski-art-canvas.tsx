import { memo, useMemo, forwardRef } from 'react'
import type { ProjectedPoint } from '@/lib/ski-art'
import { interpolateColor } from '@/lib/ski-art'

interface SkiArtCanvasProps {
  points: ProjectedPoint[]
  width: number
  height: number
  startColor: string
  endColor: string
  strokeWidth: number
}

export const SkiArtCanvas = memo(
  forwardRef<SVGSVGElement, SkiArtCanvasProps>(function SkiArtCanvas(
    { points, width, height, startColor, endColor, strokeWidth },
    ref,
  ) {
    const lines = useMemo(() => {
      if (points.length < 2) return null

      const segments: React.ReactElement[] = []
      const total = points.length - 1

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const t = i / total
        const color = interpolateColor(startColor, endColor, t)

        segments.push(
          <line
            key={i}
            x1={prev.x}
            y1={prev.y}
            x2={curr.x}
            y2={curr.y}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />,
        )
      }

      return segments
    }, [points, startColor, endColor, strokeWidth])

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full"
        style={{ backgroundColor: 'white' }}
      >
        {lines}
      </svg>
    )
  }),
)
