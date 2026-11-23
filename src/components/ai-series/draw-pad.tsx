import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  type RefObject,
} from 'react'

/** Side of the ink grid passed to `onInk`, whatever size the pad is shown at. */
export const INK_SIZE = 280
/** Line width as a share of the pad's side. */
const LINE_WIDTH = 0.085
/** Largest side the pad is shown at, in CSS pixels. */
const MAX_SIDE = 320
/** Width left free beside the pad so a finger can still scroll the page. */
const SCROLL_STRIP = 48
/** The dashed guide square's inset as a share of the side. */
const GUIDE_INSET = 0.15

export interface DrawPadHandle {
  /** Removes all ink. */
  clear(): void
  /** Replaces the ink with a 28x28 image (784 values, 0 to 255) enlarged to fill the pad. */
  showPixels(pixels: ArrayLike<number>): void
}

interface DrawPadProps {
  /** Called at most once per animation frame after the ink changes, with ink amounts 0 to 1. */
  onInk(ink: Float32Array, width: number, height: number): void
  /** Called when a finger, pen or mouse starts a new line. */
  onDrawStart?(): void
  ariaLabel: string
  ref?: Ref<DrawPadHandle>
}

interface Point {
  /** 0 to 1 across the pad. */
  x: number
  /** 0 to 1 down the pad. */
  y: number
}

/** Increments whenever the site switches between its light and dark themes. */
export function useThemeVersion(): number {
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const observer = new MutationObserver(() => setVersion((v) => v + 1))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return version
}

/** The content width of an element, kept current as it resizes; 0 until first measured. */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width))
    observer.observe(element)
    setWidth(element.clientWidth)
    return () => observer.disconnect()
  }, [ref])
  return width
}

/** Turns any CSS colour the browser understands (oklch included) into 0-255 RGB. */
export function cssColorToRgb(color: string): [number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return [0, 0, 0]
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/** Reads a CSS custom property, such as `--foreground`, as it applies to `element`. */
export function cssVar(element: Element, name: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim()
}

/** Paints a 28x28 image of 0-255 amounts in one colour, enlarged without smoothing. */
function paintPixels(
  ctx: CanvasRenderingContext2D,
  pixels: Uint8ClampedArray,
  side: number,
  rgb: [number, number, number],
) {
  const small = document.createElement('canvas')
  small.width = 28
  small.height = 28
  const smallCtx = small.getContext('2d')
  if (!smallCtx) return
  const image = smallCtx.createImageData(28, 28)
  for (let i = 0; i < 784; i++) {
    image.data[i * 4] = rgb[0]
    image.data[i * 4 + 1] = rgb[1]
    image.data[i * 4 + 2] = rgb[2]
    image.data[i * 4 + 3] = pixels[i]
  }
  smallCtx.putImageData(image, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(small, 0, 0, side, side)
  ctx.imageSmoothingEnabled = true
}

function paintStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Point[][],
  side: number,
  color: string,
) {
  const width = LINE_WIDTH * side
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const stroke of strokes) {
    if (stroke.length === 1) {
      ctx.beginPath()
      ctx.arc(stroke[0].x * side, stroke[0].y * side, width / 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }
    ctx.beginPath()
    ctx.moveTo(stroke[0].x * side, stroke[0].y * side)
    for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x * side, stroke[i].y * side)
    ctx.stroke()
  }
}

/**
 * A square pad to draw on with a finger, pen or mouse. Drawing on it does not scroll the page;
 * touching beside it does. It reports its ink at a fixed 280x280 through `onInk`.
 */
export function DrawPad({ onInk, onDrawStart, ariaLabel, ref }: DrawPadProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const strokesRef = useRef<Point[][]>([])
  const baseRef = useRef<Uint8ClampedArray | null>(null)
  const activePointerRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)
  const inkChangedRef = useRef(false)
  const onInkRef = useRef(onInk)
  useEffect(() => {
    onInkRef.current = onInk
  }, [onInk])

  const available = useElementWidth(wrapperRef)
  const side = Math.max(
    120,
    Math.min(MAX_SIDE, (available || MAX_SIDE + SCROLL_STRIP) - SCROLL_STRIP),
  )
  const themeVersion = useThemeVersion()

  const paintDisplay = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cssSide = canvas.clientWidth
    const dpr = window.devicePixelRatio || 1
    const backing = Math.round(cssSide * dpr)
    if (canvas.width !== backing || canvas.height !== backing) {
      canvas.width = backing
      canvas.height = backing
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = cssVar(canvas, '--card')
    ctx.fillRect(0, 0, cssSide, cssSide)

    const inset = GUIDE_INSET * cssSide
    ctx.save()
    ctx.strokeStyle = cssVar(canvas, '--muted-foreground')
    ctx.globalAlpha = 0.45
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 6])
    ctx.strokeRect(inset, inset, cssSide - 2 * inset, cssSide - 2 * inset)
    ctx.restore()

    const foreground = cssVar(canvas, '--foreground')
    if (baseRef.current) paintPixels(ctx, baseRef.current, cssSide, cssColorToRgb(foreground))
    paintStrokes(ctx, strokesRef.current, cssSide, foreground)
  }, [])

  const readInk = useCallback((): Float32Array => {
    let canvas = inkCanvasRef.current
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = INK_SIZE
      canvas.height = INK_SIZE
      inkCanvasRef.current = canvas
    }
    const ink = new Float32Array(INK_SIZE * INK_SIZE)
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return ink
    ctx.clearRect(0, 0, INK_SIZE, INK_SIZE)
    if (baseRef.current) paintPixels(ctx, baseRef.current, INK_SIZE, [0, 0, 0])
    paintStrokes(ctx, strokesRef.current, INK_SIZE, '#000')
    const data = ctx.getImageData(0, 0, INK_SIZE, INK_SIZE).data
    for (let i = 0; i < ink.length; i++) ink[i] = data[i * 4 + 3] / 255
    return ink
  }, [])

  const schedule = useCallback(
    (inkChanged: boolean) => {
      if (inkChanged) inkChangedRef.current = true
      if (frameRef.current !== null) return
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null
        paintDisplay()
        if (inkChangedRef.current) {
          inkChangedRef.current = false
          onInkRef.current(readInk(), INK_SIZE, INK_SIZE)
        }
      })
    },
    [paintDisplay, readInk],
  )

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    },
    [],
  )

  useEffect(() => schedule(false), [schedule, side, themeVersion])

  useImperativeHandle(
    ref,
    () => ({
      clear() {
        strokesRef.current = []
        baseRef.current = null
        schedule(true)
      },
      showPixels(pixels) {
        strokesRef.current = []
        baseRef.current = Uint8ClampedArray.from(pixels)
        schedule(true)
      },
    }),
    [schedule],
  )

  function pointAt(event: ReactPointerEvent<HTMLCanvasElement> | PointerEvent): Point {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (activePointerRef.current !== null) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    activePointerRef.current = event.pointerId
    strokesRef.current.push([pointAt(event)])
    onDrawStart?.()
    schedule(true)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.pointerId !== activePointerRef.current) return
    const stroke = strokesRef.current[strokesRef.current.length - 1]
    const events = event.nativeEvent.getCoalescedEvents?.() ?? []
    for (const e of events.length > 0 ? events : [event.nativeEvent]) stroke.push(pointAt(e))
    schedule(true)
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.pointerId === activePointerRef.current) activePointerRef.current = null
  }

  return (
    <div ref={wrapperRef} className="w-full">
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel}
        role="img"
        className="ring-border block rounded-lg ring-1 select-none"
        style={{
          width: side,
          height: side,
          touchAction: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onContextMenu={(event) => event.preventDefault()}
      />
    </div>
  )
}
