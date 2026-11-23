import { describe, expect, it } from 'vitest'
import { GUESSES_STORAGE_KEY, readGuesses, writeGuess } from './guesses'

function memoryStorage(initial?: string) {
  const data = new Map<string, string>()
  if (initial !== undefined) data.set(GUESSES_STORAGE_KEY, initial)
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

describe('guesses storage', () => {
  it('reads back what was written', () => {
    const storage = memoryStorage()
    expect(writeGuess(storage, 'before', 'inAI', 'kept')).toBe(true)
    expect(writeGuess(storage, 'before', 'takeOver', 'ifLet')).toBe(true)
    expect(readGuesses(storage, 'before')).toEqual({ inAI: 'kept', takeOver: 'ifLet' })
  })

  it('replaces an earlier pick for the same question', () => {
    const storage = memoryStorage()
    writeGuess(storage, 'before', 'getOut', 'yes')
    writeGuess(storage, 'before', 'getOut', 'no')
    expect(readGuesses(storage, 'before')).toEqual({ getOut: 'no' })
  })

  it('keeps before and after separate', () => {
    const storage = memoryStorage()
    writeGuess(storage, 'before', 'inAI', 'kept')
    writeGuess(storage, 'after', 'inAI', 'notKept')
    writeGuess(storage, 'after', 'getOut', 'between')
    expect(readGuesses(storage, 'before')).toEqual({ inAI: 'kept' })
    expect(readGuesses(storage, 'after')).toEqual({ inAI: 'notKept', getOut: 'between' })
  })

  it('treats malformed JSON as empty and can overwrite it', () => {
    const storage = memoryStorage('{not json')
    expect(readGuesses(storage, 'before')).toEqual({})
    expect(writeGuess(storage, 'before', 'inAI', 'kept')).toBe(true)
    expect(readGuesses(storage, 'before')).toEqual({ inAI: 'kept' })
  })

  it('treats JSON of the wrong shape as empty', () => {
    expect(readGuesses(memoryStorage('[1,2]'), 'before')).toEqual({})
    expect(readGuesses(memoryStorage('"text"'), 'before')).toEqual({})
    expect(readGuesses(memoryStorage('{"before":7}'), 'before')).toEqual({})
  })

  it('does not throw when getItem throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {},
    }
    expect(readGuesses(storage, 'before')).toEqual({})
    expect(writeGuess(storage, 'before', 'inAI', 'kept')).toBe(false)
  })

  it('returns false when setItem throws', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
    }
    expect(writeGuess(storage, 'before', 'inAI', 'kept')).toBe(false)
  })

  it('ignores unknown question and choice ids in stored data', () => {
    const storage = memoryStorage(
      JSON.stringify({
        before: { inAI: 'kept', getOut: 'maybe', nonsense: 'yes', takeOver: 'kept' },
        after: { toString: 'yes' },
      }),
    )
    expect(readGuesses(storage, 'before')).toEqual({ inAI: 'kept' })
    expect(readGuesses(storage, 'after')).toEqual({})
  })

  it('drops invalid stored entries without disturbing valid ones when writing', () => {
    const storage = memoryStorage(
      JSON.stringify({ before: { inAI: 'bogus' }, after: { getOut: 'no' } }),
    )
    writeGuess(storage, 'before', 'takeOver', 'no')
    expect(readGuesses(storage, 'before')).toEqual({ takeOver: 'no' })
    expect(readGuesses(storage, 'after')).toEqual({ getOut: 'no' })
  })

  it('does not save an unknown choice', () => {
    const storage = memoryStorage()
    // 'yes' is a choice of other questions, but not of inAI
    expect(writeGuess(storage, 'before', 'inAI', 'yes')).toBe(false)
    expect(readGuesses(storage, 'before')).toEqual({})
  })

  it('works without storage', () => {
    expect(readGuesses(null, 'before')).toEqual({})
    expect(writeGuess(null, 'before', 'inAI', 'kept')).toBe(false)
  })
})
