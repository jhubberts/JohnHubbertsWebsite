import { describe, expect, it } from 'vitest'
import { prepareDrawing } from './prepare-drawing'

const CANVAS = 280

function canvasWithRect(left: number, top: number, width: number, height: number): Float32Array {
  const ink = new Float32Array(CANVAS * CANVAS)
  for (let y = top; y < top + height; y++) {
    for (let x = left; x < left + width; x++) ink[y * CANVAS + x] = 1
  }
  return ink
}

function inkBox(grid: Float32Array): { width: number; height: number } {
  let left = 28
  let right = -1
  let top = 28
  let bottom = -1
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      if (grid[y * 28 + x] > 0) {
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
  }
  return { width: right - left + 1, height: bottom - top + 1 }
}

function centreOfMass(grid: Float32Array): { x: number; y: number } {
  let mass = 0
  let x = 0
  let y = 0
  for (let i = 0; i < grid.length; i++) {
    mass += grid[i]
    x += grid[i] * (i % 28)
    y += grid[i] * Math.floor(i / 28)
  }
  return { x: x / mass, y: y / mass }
}

function prepared(ink: Float32Array): Float32Array {
  const grid = prepareDrawing(ink, CANVAS, CANVAS)
  if (!grid) throw new Error('expected ink')
  return grid
}

describe('prepareDrawing', () => {
  it('returns null for an empty drawing', () => {
    expect(prepareDrawing(new Float32Array(CANVAS * CANVAS), CANVAS, CANVAS)).toBeNull()
  })

  it('scales an off-center rectangle to a longer side of 20 and centers its mass', () => {
    const grid = prepared(canvasWithRect(30, 140, 60, 100))
    expect(grid.length).toBe(784)
    expect(inkBox(grid)).toEqual({ width: 12, height: 20 })
    const com = centreOfMass(grid)
    expect(Math.abs(com.x - 13.5)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(com.y - 13.5)).toBeLessThanOrEqual(0.5)
  })

  it('keeps the proportions of a tall thin stroke', () => {
    const grid = prepared(canvasWithRect(200, 20, 20, 200))
    expect(inkBox(grid)).toEqual({ width: 2, height: 20 })
  })

  it('gives the same result for the same shape drawn in another corner', () => {
    const topLeft = prepared(canvasWithRect(5, 10, 70, 90))
    const bottomRight = prepared(canvasWithRect(200, 185, 70, 90))
    expect(Array.from(bottomRight)).toEqual(Array.from(topLeft))
  })

  it('scales the largest value to 1', () => {
    const faint = canvasWithRect(50, 50, 80, 120).map((v) => v * 0.4)
    const grid = prepared(faint)
    expect(Math.max(...grid)).toBe(1)
  })
})
