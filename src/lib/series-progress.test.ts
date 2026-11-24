import { describe, expect, it } from 'vitest'
import {
  SERIES_PROGRESS_KEY,
  SERIES_PROGRESS_V1_KEY,
  SERIES_PROGRESS_V2_KEY,
  describeProgress,
  firstUnread,
  markChapterRead,
  readChapters,
} from './series-progress'

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
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

describe('progress saved before the AI series was renumbered', () => {
  const old = (value: string) => fakeStorage({ [SERIES_PROGRESS_V1_KEY]: value })

  it('gives the chapters of the AI series their new numbers', () => {
    // Old chapters 0, 2 and 10 are now chapters 0, 4 and 18. Chapter 10 became 15 on 2026-11-23
    // and 18 on 2026-11-24, so this also checks that both renumberings are applied.
    expect(readChapters('how-ai-works', old('{"how-ai-works":[0,2,10]}'))).toEqual([0, 4, 18])
  })

  it('renumbers once: later reads and writes use the saved result', () => {
    const storage = old('{"how-ai-works":[1,2]}')
    expect(readChapters('how-ai-works', storage)).toEqual([3, 4])
    expect(storage.getItem(SERIES_PROGRESS_KEY)).toBe('{"how-ai-works":[3,4]}')
    markChapterRead('how-ai-works', 6, storage)
    expect(readChapters('how-ai-works', storage)).toEqual([3, 4, 6])
    // Old chapter 3 is new chapter 6; renumbering again would turn 3 into 6 and 4 into 7.
    expect(readChapters('how-ai-works', storage)).toEqual([3, 4, 6])
    expect(storage.getItem(SERIES_PROGRESS_V1_KEY)).toBe('{"how-ai-works":[1,2]}')
  })

  it('ignores the old key once the current key holds progress', () => {
    const storage = fakeStorage({
      [SERIES_PROGRESS_V1_KEY]: '{"how-ai-works":[1]}',
      [SERIES_PROGRESS_KEY]: '{"how-ai-works":[4]}',
    })
    expect(readChapters('how-ai-works', storage)).toEqual([4])
  })

  it('leaves other series alone', () => {
    const storage = old('{"how-ai-works":[1],"other":[1,2]}')
    expect(readChapters('other', storage)).toEqual([1, 2])
    expect(readChapters('how-ai-works', storage)).toEqual([3])
  })

  it('drops chapter numbers the old series did not have', () => {
    expect(readChapters('how-ai-works', old('{"how-ai-works":[1,11]}'))).toEqual([3])
  })

  it('renumbers from the old text on every read when storage cannot be written', () => {
    const storage = {
      getItem: (key: string) => (key === SERIES_PROGRESS_V1_KEY ? '{"how-ai-works":[1]}' : null),
      setItem: () => {
        throw new Error('quota')
      },
    }
    expect(readChapters('how-ai-works', storage)).toEqual([3])
    expect(readChapters('how-ai-works', storage)).toEqual([3])
  })

  it('treats broken old text as nothing read', () => {
    const storage = old('not json')
    expect(readChapters('how-ai-works', storage)).toEqual([])
    markChapterRead('how-ai-works', 2, storage)
    expect(readChapters('how-ai-works', storage)).toEqual([2])
  })

  it('never throws when storage throws', () => {
    expect(readChapters('how-ai-works', throwing)).toEqual([])
  })
})

describe('progress saved between the renumberings of 2026-11-23 and 2026-11-24', () => {
  const v2 = (value: string) => fakeStorage({ [SERIES_PROGRESS_V2_KEY]: value })

  it('moves chapters 14 and 15 to 17 and 18, keeps 0 to 13, and leaves the new 14 to 16 unread', () => {
    expect(readChapters('how-ai-works', v2('{"how-ai-works":[0,13,14,15]}'))).toEqual([
      0, 13, 17, 18,
    ])
  })

  it('renumbers once, so the new chapter 14 can be marked read after the old one became 17', () => {
    const storage = v2('{"how-ai-works":[14,15]}')
    expect(readChapters('how-ai-works', storage)).toEqual([17, 18])
    markChapterRead('how-ai-works', 14, storage)
    // Renumbering again would turn the new chapter 14 into 17.
    expect(readChapters('how-ai-works', storage)).toEqual([14, 17, 18])
  })

  it('reads the v2 key rather than v1 when both are present', () => {
    const storage = fakeStorage({
      [SERIES_PROGRESS_V1_KEY]: '{"how-ai-works":[1]}',
      [SERIES_PROGRESS_V2_KEY]: '{"how-ai-works":[14]}',
    })
    expect(readChapters('how-ai-works', storage)).toEqual([17])
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
