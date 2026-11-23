import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  decodeCheckpoint,
  readDigit,
  unitContributions,
  type DigitManifest,
} from '@/lib/ai-series/digits/digit-net'
import fixture from '@/lib/ai-series/digits/fixture.json'
import manifestJson from '@/lib/ai-series/digits/manifest.json'
import { prepareDrawing } from '@/lib/ai-series/digits/prepare-drawing'
import {
  answersFor,
  cellAt,
  countRight,
  exampleOrder,
  formatNumber,
  inkSpan,
  largestIndex,
  outOf100,
  practiceCount,
  practiceLabel,
  raiseAndLower,
  relativeStrengths,
  shownSum,
  timesOver,
  topContributors,
  withCommas,
} from './draw-a-digit-logic'

describe('outOf100', () => {
  it('rounds a probability to a whole number out of 100', () => {
    expect(outOf100(0.974)).toBe(97)
    expect(outOf100(0.005)).toBe(1)
    expect(outOf100(0.004)).toBe(0)
  })
})

describe('formatNumber', () => {
  it('uses a minus sign for negative numbers', () => {
    expect(formatNumber(-1.234, 1)).toBe('−1.2')
    expect(formatNumber(3.25, 2)).toBe('3.25')
  })

  it('never shows a negative zero', () => {
    expect(formatNumber(-0.04, 1)).toBe('0.0')
    expect(formatNumber(-0, 2)).toBe('0.00')
  })
})

describe('largestIndex', () => {
  it('returns the first of the largest values', () => {
    expect(largestIndex([0.1, 0.7, 0.7, 0.2])).toBe(1)
  })
})

describe('relativeStrengths', () => {
  it('divides by the largest absolute value', () => {
    expect(Array.from(relativeStrengths([2, -4, 0]))).toEqual([0.5, -1, 0])
  })

  it('returns zeros when every value is zero', () => {
    expect(Array.from(relativeStrengths([0, 0]))).toEqual([0, 0])
  })
})

describe('raiseAndLower', () => {
  it('totals the positive contributions and the size of the negative ones', () => {
    expect(raiseAndLower([1.5, -0.5, 0, 2, -1])).toEqual({ raise: 3.5, lower: 1.5 })
  })
})

describe('topContributors', () => {
  it('orders by size of effect, either sign, and drops zeros', () => {
    expect(topContributors([0.1, -3, 0, 2, 0.5], 3)).toEqual([
      { index: 1, amount: -3 },
      { index: 3, amount: 2 },
      { index: 4, amount: 0.5 },
    ])
  })

  it('returns fewer rows when fewer contributions are non-zero', () => {
    expect(topContributors([0, 1, 0])).toEqual([{ index: 1, amount: 1 }])
  })
})

describe('exampleOrder', () => {
  const labels = fixture.images.map((image) => image.label)
  const order = exampleOrder(labels)

  it('uses every example once', () => {
    expect([...order].sort((a, b) => a - b)).toEqual(labels.map((_, i) => i))
  })

  it('starts with a 7 or a 3', () => {
    expect([7, 3]).toContain(labels[order[0]])
  })

  it('never shows the same digit twice in a row', () => {
    for (let i = 1; i < order.length; i++) {
      expect(labels[order[i]]).not.toBe(labels[order[i - 1]])
    }
  })
})

describe('cellAt', () => {
  it('finds the square under a point and keeps edge points inside the grid', () => {
    expect(cellAt(0, 0, 280)).toEqual({ row: 0, column: 0 })
    expect(cellAt(15, 279, 280)).toEqual({ row: 27, column: 1 })
    expect(cellAt(280, 300, 280)).toEqual({ row: 27, column: 27 })
  })
})

describe('an example shown on the pad', () => {
  // The pad paints a 28x28 example enlarged to 280x280 with each square a 10x10 block, then reads
  // it like a drawing. This checks that route still reads the examples the network gets right.
  const manifest: DigitManifest = manifestJson
  const checkpoint = manifest.checkpoints[manifest.checkpoints.length - 1]
  const file = readFileSync(new URL(`../../../../public${checkpoint.file}`, import.meta.url))
  const net = decodeCheckpoint(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer,
    checkpoint,
  )

  function enlarge(pixels: number[]): Float32Array {
    const ink = new Float32Array(280 * 280)
    for (let y = 0; y < 280; y++) {
      for (let x = 0; x < 280; x++) {
        ink[y * 280 + x] = pixels[Math.floor(y / 10) * 28 + Math.floor(x / 10)] / 255
      }
    }
    return ink
  }

  it('is read the same as the 28x28 example itself', () => {
    for (const image of fixture.images) {
      const direct = readDigit(
        net,
        Float32Array.from(image.pixels, (p) => p / 255),
      ).answer
      const prepared = prepareDrawing(enlarge(image.pixels), 280, 280)
      expect(prepared).not.toBeNull()
      expect(readDigit(net, prepared!).answer).toBe(direct)
    }
  })
})

describe('shownSum', () => {
  it('makes the shown parts add up to the shown total', () => {
    // Rounded one by one, 10.46, 1.54 and 0.5 would show 10.5, 1.5, 0.5 and a total of 9.4.
    const shown = shownSum(10.46, 0.5, 9.44)
    expect(shown).toEqual({ adds: 10.5, takesAway: 1.6, start: 0.5, total: 9.4 })
  })

  it('never shows a negative takes-away, and moves the adds instead', () => {
    const shown = shownSum(1.04, 0.5, 1.56)
    expect(shown.takesAway).toBe(0)
    expect(shown.adds - shown.takesAway + shown.start).toBeCloseTo(shown.total, 9)
    expect(shown.adds).toBeCloseTo(1.1, 9)
  })
})

describe('shownSum on the real network', () => {
  const manifest: DigitManifest = manifestJson
  const checkpoint = manifest.checkpoints[manifest.checkpoints.length - 1]
  const file = readFileSync(new URL(`../../../../public${checkpoint.file}`, import.meta.url))
  const net = decodeCheckpoint(
    file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer,
    checkpoint,
  )

  function eachFirstLayerUnit(
    check: (
      shown: ReturnType<typeof shownSum>,
      truth: Record<keyof ReturnType<typeof shownSum>, number>,
      where: string,
    ) => void,
  ): void {
    fixture.images.forEach((image, imageIndex) => {
      const reading = readDigit(
        net,
        Float32Array.from(image.pixels, (p) => p / 255),
      )
      for (let unit = 0; unit < 32; unit++) {
        const { contributions, bias, sum } = unitContributions(net, reading, 1, unit)
        const { raise, lower } = raiseAndLower(contributions)
        const truth = { adds: raise, takesAway: lower, start: bias, total: sum }
        check(shownSum(raise, bias, sum), truth, `image ${imageIndex}, unit ${unit + 1}`)
      }
    })
  }

  it('adds up exactly and never takes away a negative amount', () => {
    eachFirstLayerUnit((shown) => {
      expect(Math.abs(shown.adds - shown.takesAway + shown.start - shown.total)).toBeLessThan(1e-9)
      expect(shown.takesAway).toBeGreaterThanOrEqual(0)
    })
  })

  it('shows every number within 0.15 of its true value', () => {
    let worst = { distance: 0, where: '', name: '' }
    eachFirstLayerUnit((shown, truth, where) => {
      for (const name of ['adds', 'takesAway', 'start', 'total'] as const) {
        const distance = Math.abs(shown[name] - truth[name])
        if (distance > worst.distance) worst = { distance, where, name }
      }
    })
    expect(worst, 'worst case').toSatisfy((w: typeof worst) => w.distance <= 0.15 + 1e-6)
  })
})

describe('inkSpan', () => {
  it('is 0 with no ink', () => {
    expect(inkSpan(new Float32Array(280 * 280), 280, 280)).toBe(0)
  })

  it('is the longer side of the box around the ink, as a fraction of the pad', () => {
    const ink = new Float32Array(280 * 280)
    for (let y = 10; y < 150; y++) for (let x = 20; x < 48; x++) ink[y * 280 + x] = 1
    expect(inkSpan(ink, 280, 280)).toBe(0.5)
  })

  it('is one pixel out of the side for a single inked pixel', () => {
    const ink = new Float32Array(280 * 280)
    ink[100 * 280 + 100] = 1
    expect(inkSpan(ink, 280, 280)).toBe(1 / 280)
  })

  it('ignores faint ink below 0.05', () => {
    const ink = new Float32Array(280 * 280)
    ink[5] = 0.04
    expect(inkSpan(ink, 280, 280)).toBe(0)
  })
})

describe('withCommas', () => {
  it('puts a comma between thousands', () => {
    expect(withCommas(0)).toBe('0')
    expect(withCommas(1280)).toBe('1,280')
    expect(withCommas(2560000)).toBe('2,560,000')
  })
})

describe('practiceCount and timesOver', () => {
  it('multiplies the step by the batch size', () => {
    expect(practiceCount(10, 128)).toBe(1280)
    expect(practiceCount(0, 128)).toBe(0)
  })

  it('rounds how many times over the 60,000 digits to a whole number', () => {
    expect(timesOver(2560000)).toBe(43)
    expect(timesOver(60000)).toBe(1)
    expect(timesOver(89999)).toBe(1)
    expect(timesOver(90000)).toBe(2)
  })
})

describe('practiceLabel', () => {
  it('says the numbers are random at the first stop', () => {
    expect(practiceLabel(0, 6, 0, 128)).toBe('Before any practice. Its numbers are random.')
  })

  it('gives the count of example digits at a middle stop', () => {
    expect(practiceLabel(1, 6, 10, 128)).toBe('After practicing on 1,280 example digits.')
    expect(practiceLabel(4, 6, 500, 128)).toBe(
      'After practicing on 64,000 example digits. That is each of the 60,000 digits about once.',
    )
  })

  it('adds how many times over the 60,000 digits at the last stop', () => {
    expect(practiceLabel(5, 6, 20000, 128)).toBe(
      'After practicing on 2,560,000 example digits. That is the same 60,000 digits, about 43 times over.',
    )
  })
})

describe('countRight', () => {
  it('counts the answers that equal their label', () => {
    expect(countRight([1, 2, 3, 4], [1, 0, 3, 9])).toBe(2)
    expect(countRight([], [])).toBe(0)
  })
})

describe('the 20 fixture digits at each saved point', () => {
  const manifest: DigitManifest = manifestJson
  const labels = fixture.images.map((image) => image.label)
  const counts = manifest.checkpoints.map((checkpoint) => {
    const file = readFileSync(new URL(`../../../../public${checkpoint.file}`, import.meta.url))
    const bytes = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    const net = decodeCheckpoint(bytes as ArrayBuffer, checkpoint)
    return countRight(answersFor(net, fixture.images), labels)
  })

  it('has 20 fixture digits', () => {
    expect(labels).toHaveLength(20)
  })

  it('reads 19 right at the last stop and fewer at the first', () => {
    console.log(`fixture digits read right at the six stops: ${counts.join(', ')} (of 20)`)
    expect(counts[counts.length - 1]).toBe(19)
    expect(counts[0]).toBeLessThan(counts[counts.length - 1])
  })
})
