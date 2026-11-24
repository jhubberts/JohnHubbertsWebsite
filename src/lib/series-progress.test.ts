import { describe, expect, it } from 'vitest'
import {
  SERIES_PROGRESS_KEY,
  describeProgress,
  firstUnread,
  markChapterRead,
  readChapters,
} from './series-progress'

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const throwing = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

const stored = (value: string) => fakeStorage({ [SERIES_PROGRESS_KEY]: value })

describe('markChapterRead and readChapters', () => {
  it('reads back what was recorded', () => {
    const storage = fakeStorage()
    markChapterRead('ai', 2, storage)
    expect(readChapters('ai', storage)).toEqual([2])
  })

  it('keeps chapters ascending and without duplicates', () => {
    const storage = fakeStorage()
    markChapterRead('ai', 3, storage)
    markChapterRead('ai', 0, storage)
    markChapterRead('ai', 3, storage)
    expect(readChapters('ai', storage)).toEqual([0, 3])
  })

  it('leaves storage untouched when the chapter is already recorded', () => {
    const storage = stored('{"ai":[1]}')
    markChapterRead('ai', 1, storage)
    expect(storage.data.get(SERIES_PROGRESS_KEY)).toBe('{"ai":[1]}')
  })

  it('keeps the entries of other series', () => {
    const storage = stored('{"other":[4,5]}')
    markChapterRead('ai', 1, storage)
    expect(readChapters('other', storage)).toEqual([4, 5])
    expect(readChapters('ai', storage)).toEqual([1])
  })

  it('treats nothing stored as nothing read', () => {
    expect(readChapters('ai', fakeStorage())).toEqual([])
    expect(readChapters('ai', null)).toEqual([])
  })

  it.each([
    ['text that is not JSON', 'not json'],
    ['an array at the top level', '[1,2]'],
    ['a null value', 'null'],
    ['a list holding a string', '{"ai":[1,"2"]}'],
    ['a list holding a negative number', '{"ai":[1,-2]}'],
    ['a list holding a fraction', '{"ai":[1.5]}'],
    ['something other than a list', '{"ai":3}'],
  ])('treats %s as nothing read, and a later write replaces it', (_name, raw) => {
    const storage = stored(raw)
    expect(readChapters('ai', storage)).toEqual([])
    markChapterRead('ai', 2, storage)
    expect(readChapters('ai', storage)).toEqual([2])
  })

  it('never throws when storage throws', () => {
    expect(readChapters('ai', throwing)).toEqual([])
    expect(() => markChapterRead('ai', 1, throwing)).not.toThrow()
  })
})

describe('firstUnread', () => {
  const parts = [0, 1, 2, 3]

  it('returns the lowest chapter not yet read', () => {
    expect(firstUnread(parts, [])).toBe(0)
    expect(firstUnread(parts, [0, 1, 3])).toBe(2)
  })

  it('returns undefined when all are read', () => {
    expect(firstUnread(parts, new Set(parts))).toBeUndefined()
  })
})

describe('describeProgress', () => {
  const parts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  it('lists the read chapters and the open one', () => {
    expect(describeProgress(parts, new Set([0, 1]), 2)).toBe(
      'Chapters read: 0, 1. Open now: chapter 2. 10 chapters in all.',
    )
  })

  it('says so when nothing is read and none is open', () => {
    expect(describeProgress(parts, new Set())).toBe('No chapters read yet. 10 chapters in all.')
  })

  it('omits the open chapter when there is none', () => {
    expect(describeProgress(parts, new Set([0, 1, 2]))).toBe(
      'Chapters read: 0, 1, 2. 10 chapters in all.',
    )
  })

  it('names chapter 0 as open', () => {
    expect(describeProgress(parts, new Set(), 0)).toBe(
      'No chapters read yet. Open now: chapter 0. 10 chapters in all.',
    )
  })

  it('lists the open chapter among the read ones when it is read', () => {
    expect(describeProgress(parts, new Set([0, 1]), 1)).toBe(
      'Chapters read: 0, 1. Open now: chapter 1. 10 chapters in all.',
    )
  })
})
