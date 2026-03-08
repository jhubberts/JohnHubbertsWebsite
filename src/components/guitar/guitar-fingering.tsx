import { useEffect, useRef } from 'react'
import { FingeringChart } from '@/lib/guitar/fingering-chart'
import type { Single, Barre } from '@/lib/guitar/chord'

interface GuitarFingeringProps {
  width: number
  chord: { singles: Single[]; barres: Barre[] }
  annotations?: string[]
  title?: string | null
  onClick?: () => void
  onMouseOverNote?: (note: Single) => void
}

const GuitarFingering = ({
  width,
  chord,
  annotations = ['', '', '', '', '', ''],
  title = null,
  onClick = () => {},
  onMouseOverNote = () => {},
}: GuitarFingeringProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const stringSpacing = width / 7
  const fretSpacing = (stringSpacing * 5) / 4

  const allFrets = [...(chord.singles || []), ...(chord.barres || [])].map((x) => x.fret)
  const startFret = Math.min(...allFrets) - 1
  const endFret = Math.max(...allFrets) + 1
  const height = fretSpacing * (endFret - startFret + 3)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const chart = new FingeringChart(
      canvas, stringSpacing, fretSpacing, startFret, endFret,
      chord.singles, chord.barres, annotations, title
    )
    chart.draw()

    let lastMatch = false

    const mouseDownListener = onClick
    const mouseMoveListener = (event: MouseEvent) => {
      const hits = chart.getOverlappingHitboxes(event.offsetX, event.offsetY)
      const match = hits.length > 0

      if (match && !lastMatch) {
        onMouseOverNote(hits[0])
        chart.highlight(hits[0].string, hits[0].fret)
        chart.draw()
      }

      if (!match && lastMatch) {
        chart.unhighlight()
        chart.draw()
      }

      lastMatch = match
    }

    canvas.addEventListener('mousedown', mouseDownListener)
    canvas.addEventListener('mousemove', mouseMoveListener)

    return () => {
      canvas.removeEventListener('mousedown', mouseDownListener)
      canvas.removeEventListener('mousemove', mouseMoveListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chord])

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  )
}

export default GuitarFingering
