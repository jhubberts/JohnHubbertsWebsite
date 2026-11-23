// Turns a drawing into the 784 values the digit network reads, the way MNIST digits were prepared:
// the ink's bounding box is scaled so its longer side is 20 pixels, then placed in a 28x28 grid so
// that its centre of mass sits at the grid's centre.

const GRID = 28
const BOX = 20
/** Ink at or below this amount does not count towards the bounding box. */
const INK_THRESHOLD = 0.05

/**
 * Resamples one row or column of `from` values to `to` values by area averaging: each output value
 * is the mean of the input over the stretch of the line it covers.
 */
function resampleLine(
  source: Float32Array,
  start: number,
  stride: number,
  from: number,
  target: Float32Array,
  targetStart: number,
  targetStride: number,
  to: number,
): void {
  const ratio = from / to
  for (let k = 0; k < to; k++) {
    const lo = k * ratio
    const hi = (k + 1) * ratio
    let total = 0
    for (let i = Math.floor(lo); i < Math.min(from, Math.ceil(hi)); i++) {
      const overlap = Math.min(hi, i + 1) - Math.max(lo, i)
      if (overlap > 0) total += source[start + i * stride] * overlap
    }
    target[targetStart + k * targetStride] = total / ratio
  }
}

/**
 * ink: grayscale ink amounts 0..1, row-major, width*height. 0 is empty.
 * Returns 784 values 0..1, or null when the drawing has no ink.
 */
export function prepareDrawing(
  ink: Float32Array,
  width: number,
  height: number,
): Float32Array | null {
  if (ink.length !== width * height) {
    throw new Error(`Drawing has ${ink.length} values; expected ${width} x ${height}`)
  }

  let left = width
  let right = -1
  let top = height
  let bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (ink[y * width + x] > INK_THRESHOLD) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }
  if (right < 0) return null

  const boxWidth = right - left + 1
  const boxHeight = bottom - top + 1
  const scale = BOX / Math.max(boxWidth, boxHeight)
  const outWidth = Math.max(1, Math.min(BOX, Math.round(boxWidth * scale)))
  const outHeight = Math.max(1, Math.min(BOX, Math.round(boxHeight * scale)))

  // Scale rows first, then columns.
  const rows = new Float32Array(boxHeight * outWidth)
  for (let y = 0; y < boxHeight; y++) {
    const start = (top + y) * width + left
    resampleLine(ink, start, 1, boxWidth, rows, y * outWidth, 1, outWidth)
  }
  const scaled = new Float32Array(outHeight * outWidth)
  for (let x = 0; x < outWidth; x++) {
    resampleLine(rows, x, outWidth, boxHeight, scaled, x, outWidth, outHeight)
  }

  // Centre of mass, in pixel-centre coordinates (pixel i's centre is at i).
  let mass = 0
  let sumX = 0
  let sumY = 0
  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const v = scaled[y * outWidth + x]
      mass += v
      sumX += v * x
      sumY += v * y
    }
  }
  if (mass <= 0) return null
  const centre = (GRID - 1) / 2
  const offsetX = Math.round(centre - sumX / mass)
  const offsetY = Math.round(centre - sumY / mass)

  const grid = new Float32Array(GRID * GRID)
  let max = 0
  for (let y = 0; y < outHeight; y++) {
    const gy = y + offsetY
    if (gy < 0 || gy >= GRID) continue
    for (let x = 0; x < outWidth; x++) {
      const gx = x + offsetX
      if (gx < 0 || gx >= GRID) continue
      const v = scaled[y * outWidth + x]
      grid[gy * GRID + gx] = v
      if (v > max) max = v
    }
  }
  if (max <= 0) return null
  for (let i = 0; i < grid.length; i++) grid[i] /= max
  return grid
}
