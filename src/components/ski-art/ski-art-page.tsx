import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'
import {
  parseGpx,
  projectTrackpoints,
  ASPECT_RATIOS,
  DEFAULT_SETTINGS,
  type TrackPoint,
  type ArtSettings,
} from '@/lib/ski-art'
import { SkiArtCanvas } from './ski-art-canvas'
import { SkiArtControls } from './ski-art-controls'
import { GoldFrame } from './gold-frame'
import defaultGpx from '@/lib/ski-art/data/big-sky.gpx?raw'

function loadDefault(): TrackPoint[] {
  try {
    return parseGpx(defaultGpx)
  } catch {
    return []
  }
}

const defaultTrackpoints = loadDefault()

export default function SkiArtPage() {
  const [trackpoints, setTrackpoints] = useState<TrackPoint[]>(defaultTrackpoints)
  const [settings, setSettings] = useState<ArtSettings>(DEFAULT_SETTINGS)
  const [error, setError] = useState<string | null>(null)
  const [controlsOpen, setControlsOpen] = useState(true)
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(30) // degrees per second

  const { w: width, h: height } = ASPECT_RATIOS[settings.aspectRatio] ?? ASPECT_RATIOS['16:9']

  // Margin slider (0-1) maps to SVG projection padding (0 to 1/3 of min dimension).
  // The white space is inside the SVG viewBox so it scales with the frame.
  const padding = (settings.margin * Math.min(width, height)) / (3 * Math.min(width, height))

  const projected = useMemo(
    () => projectTrackpoints(trackpoints, settings.angleDegrees, width, height, padding),
    [trackpoints, settings.angleDegrees, width, height, padding],
  )

  // Auto-rotate animation
  useEffect(() => {
    if (!autoRotate) return
    let prev = performance.now()
    let raf: number
    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 1 / 15)
      prev = now
      setSettings((s) => ({
        ...s,
        angleDegrees: (s.angleDegrees + rotationSpeed * dt) % 360,
      }))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [autoRotate, rotationSpeed])

  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 })

  // Frame border: p-3 (12px) + p-1 (4px) on each side = 32px total
  const frameBorder = 32
  const frameAspect = (width + frameBorder) / (height + frameBorder)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => {
      const cw = entry.contentRect.width
      const ch = entry.contentRect.height - 32 // reserve for export button

      let fw: number, fh: number
      if (cw / ch > frameAspect) {
        fh = ch
        fw = ch * frameAspect
      } else {
        fw = cw
        fh = cw / frameAspect
      }
      setFrameSize({ w: fw, h: fh })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [frameAspect])

  const handleExport = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return

    // The margin is already baked into the SVG projection, so we just
    // export the SVG as-is. The white background + padding = the margin.
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    const scale = 2
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(pngBlob)
        a.download = 'ski-art.png'
        a.click()
        URL.revokeObjectURL(a.href)
      }, 'image/png')
    }
    img.src = url
  }, [width, height])

  const handleFileUpload = (file: File) => {
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const points = parseGpx(reader.result as string)
        setTrackpoints(points)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to parse GPX file')
      }
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsText(file)
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden md:flex-row">
      {/* Collapsible sidebar — desktop only */}
      <div
        className={`hidden border-r transition-all duration-300 md:block ${
          controlsOpen ? 'w-72 min-w-72' : 'w-0 min-w-0'
        } overflow-hidden`}
      >
        <div className="w-72 overflow-y-auto p-4" style={{ height: '100%' }}>
          <SkiArtControls
            settings={settings}
            onSettingsChange={setSettings}
            onFileUpload={handleFileUpload}
            error={error}
            autoRotate={autoRotate}
            onAutoRotateChange={setAutoRotate}
            rotationSpeed={rotationSpeed}
            onRotationSpeedChange={setRotationSpeed}
          />
        </div>
      </div>

      {/* Toggle button — desktop only */}
      <button
        onClick={() => setControlsOpen(!controlsOpen)}
        className="hover:bg-muted hidden w-6 flex-shrink-0 items-center justify-center border-r transition-colors md:flex"
        title={controlsOpen ? 'Hide controls' : 'Show controls'}
      >
        {controlsOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Main area: masterpiece centered, as large as possible */}
      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-4"
      >
        {frameSize.w > 0 && (
          <div style={{ width: frameSize.w, height: frameSize.h, flexShrink: 0 }}>
            <GoldFrame className="h-full w-full">
              <SkiArtCanvas
                ref={svgRef}
                points={projected}
                width={width}
                height={height}
                startColor={settings.startColor}
                endColor={settings.endColor}
                strokeWidth={settings.strokeWidth}
                padding={padding}
                mattingPercent={settings.mattingPercent}
                mattingColor={settings.mattingColor}
              />
            </GoldFrame>
          </div>
        )}
        <button
          onClick={handleExport}
          className="text-muted-foreground hover:text-foreground mt-2 flex-shrink-0 text-sm transition-colors"
        >
          Export My Masterpiece (As PNG)
        </button>
      </div>

      {/* Mobile controls — below the image */}
      <div className="flex-shrink-0 border-t md:hidden">
        <button
          onClick={() => setControlsOpen(!controlsOpen)}
          className="hover:bg-muted flex w-full items-center justify-center gap-2 py-2 text-sm transition-colors"
        >
          {controlsOpen ? (
            <>
              <ChevronDown className="h-4 w-4" />
              Hide Controls
            </>
          ) : (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Controls
            </>
          )}
        </button>
        {controlsOpen && (
          <div className="overflow-y-auto p-4" style={{ maxHeight: '40vh' }}>
            <SkiArtControls
              settings={settings}
              onSettingsChange={setSettings}
              onFileUpload={handleFileUpload}
              error={error}
              autoRotate={autoRotate}
              onAutoRotateChange={setAutoRotate}
              rotationSpeed={rotationSpeed}
              onRotationSpeedChange={setRotationSpeed}
            />
          </div>
        )}
      </div>
    </div>
  )
}
