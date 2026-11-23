import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  CHECKPOINT_BYTES,
  decodeCheckpoint,
  readDigit,
  unitContributions,
  type DigitManifest,
  type DigitNet,
  type ManifestCheckpoint,
} from './digit-net'
import fixture from './fixture.json'
import manifestJson from './manifest.json'
import { prepareDrawing } from './prepare-drawing'

const manifest: DigitManifest = manifestJson

function checkpointById(id: string): ManifestCheckpoint {
  const checkpoint = manifest.checkpoints.find((c) => c.id === id)
  if (!checkpoint) throw new Error(`No checkpoint ${id} in manifest.json`)
  return checkpoint
}

/** Reads a checkpoint's .bin from public/, the folder the page serves it from. */
function loadCheckpointFromDisk(id: string): DigitNet {
  const checkpoint = checkpointById(id)
  const file = readFileSync(new URL(`../../../../public${checkpoint.file}`, import.meta.url))
  const bytes = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
  return decodeCheckpoint(bytes as ArrayBuffer, checkpoint)
}

function inputOf(pixels: number[]): Float32Array {
  return Float32Array.from(pixels, (p) => p / 255)
}

function expectClose(actual: Float32Array, expected: number[], tolerance: number): void {
  expect(actual.length).toBe(expected.length)
  const worst = Math.max(...expected.map((e, i) => Math.abs(actual[i] - e)))
  expect(worst).toBeLessThanOrEqual(tolerance)
}

function indexOfMax(values: ArrayLike<number>): number {
  let best = 0
  for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i
  return best
}

const finalNet = loadCheckpointFromDisk(fixture.checkpoint)

describe('readDigit with the final checkpoint', () => {
  it.each(fixture.images.map((image, i) => [i, image] as const))(
    'matches the Python numbers for fixture image %i',
    (_i, image) => {
      const reading = readDigit(finalNet, inputOf(image.pixels))
      expectClose(reading.hidden1, image.hidden1, 1e-4)
      expectClose(reading.hidden2, image.hidden2, 1e-4)
      expectClose(reading.probabilities, image.probabilities, 1e-4)
      expect(reading.answer).toBe(indexOfMax(image.probabilities))
    },
  )

  it('gets as many fixture images right as the fixture implies', () => {
    const expected = fixture.images.filter((m) => indexOfMax(m.probabilities) === m.label).length
    const actual = fixture.images.filter(
      (m) => readDigit(finalNet, inputOf(m.pixels)).answer === m.label,
    ).length
    expect(actual).toBe(expected)
  })
})

describe('readDigit with the untrained checkpoint', () => {
  it('matches the Python probabilities for the first fixture image', () => {
    const net = loadCheckpointFromDisk(fixture.step0.checkpoint)
    const image = fixture.images[fixture.step0.image]
    const reading = readDigit(net, inputOf(image.pixels))
    expectClose(reading.probabilities, fixture.step0.probabilities, 1e-4)
  })
})

describe('unitContributions', () => {
  const reading = readDigit(finalNet, inputOf(fixture.images[0].pixels))

  it.each([
    [1, [0, 7, 31]],
    [2, [0, 5, 15]],
  ] as const)('sums to each unit value after ReLU in layer %i', (layer, units) => {
    const values = layer === 1 ? reading.hidden1 : reading.hidden2
    for (const unit of units) {
      const parts = unitContributions(finalNet, reading, layer, unit)
      expect(Math.max(parts.sum, 0)).toBeCloseTo(values[unit], 6)
      const added = parts.contributions.reduce((a, b) => a + b, parts.bias)
      expect(added).toBeCloseTo(parts.sum, 4)
    }
  })

  it('gives output sums whose softmax is the probabilities', () => {
    const sums = Array.from(
      { length: 10 },
      (_, d) => unitContributions(finalNet, reading, 3, d).sum,
    )
    const max = Math.max(...sums)
    const exps = sums.map((s) => Math.exp(s - max))
    const total = exps.reduce((a, b) => a + b, 0)
    expectClose(
      reading.probabilities,
      exps.map((e) => e / total),
      1e-6,
    )
  })
})

describe('decodeCheckpoint', () => {
  it('rejects a buffer of the wrong length', () => {
    const checkpoint = checkpointById(fixture.checkpoint)
    expect(() => decodeCheckpoint(new ArrayBuffer(CHECKPOINT_BYTES - 1), checkpoint)).toThrow(
      /bytes/,
    )
    expect(() => decodeCheckpoint(new ArrayBuffer(CHECKPOINT_BYTES + 1), checkpoint)).toThrow(
      /bytes/,
    )
  })

  it('reads every checkpoint in the manifest', () => {
    for (const checkpoint of manifest.checkpoints) {
      expect(loadCheckpointFromDisk(checkpoint.id).checkpointId).toBe(checkpoint.id)
    }
  })
})

describe('a fixture digit drawn large and off-centre, then prepared', () => {
  const SCALE = 10
  const CANVAS = 280
  // The enlarged 280x280 image is moved this far on the 280x280 canvas. MNIST ink sits inside the
  // middle 20x20 of each image, so a move of up to 40 canvas pixels keeps the ink on the canvas.
  const SHIFT_X = -30
  const SHIFT_Y = 20

  function enlargedOffCentre(pixels: number[]): Float32Array {
    const ink = new Float32Array(CANVAS * CANVAS)
    for (let y = 0; y < CANVAS; y++) {
      for (let x = 0; x < CANVAS; x++) {
        const sx = Math.floor((x - SHIFT_X) / SCALE)
        const sy = Math.floor((y - SHIFT_Y) / SCALE)
        if (sx < 0 || sx >= 28 || sy < 0 || sy >= 28) continue
        ink[y * CANVAS + x] = pixels[sy * 28 + sx] / 255
      }
    }
    return ink
  }

  it('is read correctly for at least 18 of the 20 fixture images', () => {
    const misread: string[] = []
    for (const image of fixture.images) {
      const input = prepareDrawing(enlargedOffCentre(image.pixels), CANVAS, CANVAS)
      if (!input) throw new Error(`test image ${image.testIndex} lost all its ink`)
      const answer = readDigit(finalNet, input).answer
      if (answer !== image.label) {
        misread.push(`test image ${image.testIndex}: ${image.label} read as ${answer}`)
      }
    }
    console.log(`chain: ${20 - misread.length}/20 read correctly`, misread)
    expect(20 - misread.length).toBeGreaterThanOrEqual(18)
  })
})
