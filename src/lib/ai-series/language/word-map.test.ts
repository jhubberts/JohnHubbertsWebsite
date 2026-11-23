import { describe, expect, it } from 'vitest'
import data from './word-map.json'
import {
  alphabetical,
  dotPosition,
  groupMarks,
  groupNames,
  labelPosition,
  mapLabel,
  nearestWord,
  sameGroupCount,
  startingWord,
  type MapWord,
  type WordMapData,
  spreadToFill,
} from './word-map'

const { words } = data as WordMapData

function word(name: string, group: string, x: number, y: number, nearest: string[] = []): MapWord {
  return { word: name, group, x, y, nearest: nearest.map((w) => ({ word: w, similarity: 0.5 })) }
}

describe('nearestWord', () => {
  const size = 516 // inner width 484 with 16px padding
  const small = [word('a', 'g', 0, 0), word('b', 'g', 1, 1), word('c', 'g', 0.5, 0.5)]

  it('finds the dot nearest the tap', () => {
    const at = dotPosition(small[1], size)
    expect(nearestWord(small, { x: at.x - 5, y: at.y + 5 }, size)?.word).toBe('b')
  })

  it('finds nothing when every dot is farther than the radius', () => {
    const at = dotPosition(small[2], size)
    expect(nearestWord(small, { x: at.x + 29, y: at.y }, size)).toBeNull()
    expect(nearestWord(small, { x: at.x + 27, y: at.y }, size)?.word).toBe('c')
  })

  it('prefers the closer of two dots inside the radius', () => {
    const close = [word('p', 'g', 0.5, 0.5), word('q', 'g', 0.52, 0.5)]
    const p = dotPosition(close[0], size)
    expect(nearestWord(close, { x: p.x + 20, y: p.y }, size)?.word).toBe('q')
  })
})

describe('sameGroupCount', () => {
  it('counts nearest words that share the word’s group', () => {
    const all = [
      word('dog', 'animals', 0, 0, ['cat', 'horse', 'red', 'blue', 'sun']),
      word('cat', 'animals', 0, 0),
      word('horse', 'animals', 0, 0),
      word('red', 'colours', 0, 0),
      word('blue', 'colours', 0, 0),
      word('sun', 'sky', 0, 0),
    ]
    expect(sameGroupCount(all, all[0])).toBe(2)
  })
})

describe('alphabetical', () => {
  it('sorts by word without changing the input', () => {
    const input = [word('pear', 'g', 0, 0), word('apple', 'g', 0, 0), word('fig', 'g', 0, 0)]
    expect(alphabetical(input).map((w) => w.word)).toEqual(['apple', 'fig', 'pear'])
    expect(input[0].word).toBe('pear')
  })
})

describe('startingWord', () => {
  it('is dog when present, otherwise the first word', () => {
    const dog = word('dog', 'g', 0, 0)
    expect(startingWord([word('a', 'g', 0, 0), dog])).toBe(dog)
    const first = word('a', 'g', 0, 0)
    expect(startingWord([first, word('b', 'g', 0, 0)])).toBe(first)
  })
})

describe('labelPosition', () => {
  it('sits right of the dot, switches left at the right edge, and stays inside the map', () => {
    expect(labelPosition({ x: 100, y: 100 }, 40, 16, 500).x).toBe(108)
    expect(labelPosition({ x: 480, y: 100 }, 40, 16, 500).x).toBe(432)
    const corner = labelPosition({ x: 3, y: 2 }, 40, 16, 500)
    expect(corner.x).toBeGreaterThanOrEqual(2)
    expect(corner.y).toBeGreaterThanOrEqual(2)
    expect(labelPosition({ x: 250, y: 499 }, 40, 16, 500).y).toBe(500 - 16 - 2)
  })
})

describe('groupMarks', () => {
  it('gives twelve groups twelve different shape and colour pairs', () => {
    const marks = groupMarks(groupNames(words))
    const pairs = new Set([...marks.values()].map((m) => `${m.shape}/${m.colour}`))
    expect(pairs.size).toBe(12)
  })
})

describe('mapLabel', () => {
  it('names the selected word and its nearest', () => {
    const dog = word('dog', 'g', 0, 0, ['cat', 'horse', 'puppy', 'pet', 'animal'])
    expect(mapLabel([dog], dog)).toBe(
      'Map of 1 words. Selected: dog. Nearest: cat, horse, puppy, pet, animal.',
    )
  })
})

describe('the recorded word map', () => {
  const names = new Set(words.map((w) => w.word))

  it('has 248 words in 12 groups', () => {
    expect(words).toHaveLength(248)
    expect(groupNames(words)).toHaveLength(12)
    expect(names.size).toBe(248)
    expect(data.dimensions).toBe(768)
  })

  it('gives every word exactly five nearest words that exist and are not itself', () => {
    for (const w of words) {
      expect(w.nearest, w.word).toHaveLength(5)
      for (const n of w.nearest) {
        expect(names.has(n.word), `${w.word} -> ${n.word}`).toBe(true)
        expect(n.word).not.toBe(w.word)
      }
    }
  })

  it('places every word inside 0..1', () => {
    for (const w of words) {
      expect(w.x).toBeGreaterThanOrEqual(0)
      expect(w.x).toBeLessThanOrEqual(1)
      expect(w.y).toBeGreaterThanOrEqual(0)
      expect(w.y).toBeLessThanOrEqual(1)
    }
  })

  it('has dog selectable and a same-group count between 0 and 5 for every word', () => {
    expect(startingWord(words).word).toBe('dog')
    for (const w of words) {
      const k = sameGroupCount(words, w)
      expect(k).toBeGreaterThanOrEqual(0)
      expect(k).toBeLessThanOrEqual(5)
    }
  })
})

describe('spreadToFill', () => {
  it('stretches each axis to run from 0 to 1 and keeps the order of words along it', () => {
    const spread = spreadToFill([
      { x: 0.4, y: 0.1 },
      { x: 0.5, y: 0.9 },
      { x: 0.6, y: 0.5 },
    ])
    expect(spread.map((w) => w.x)).toEqual([0, 0.5, 1])
    expect(spread[0].y).toBe(0)
    expect(spread[1].y).toBe(1)
    expect(spread[2].y).toBeCloseTo(0.5)
  })

  it('puts words that share a value in the middle of that axis', () => {
    expect(
      spreadToFill([
        { x: 0.3, y: 0.2 },
        { x: 0.3, y: 0.8 },
      ]).map((w) => w.x),
    ).toEqual([0.5, 0.5])
  })

  it('returns nothing for no words and does not change its input', () => {
    const input = [
      { x: 0.4, y: 0.1 },
      { x: 0.6, y: 0.5 },
    ]
    expect(spreadToFill([])).toEqual([])
    spreadToFill(input)
    expect(input).toEqual([
      { x: 0.4, y: 0.1 },
      { x: 0.6, y: 0.5 },
    ])
  })
})
