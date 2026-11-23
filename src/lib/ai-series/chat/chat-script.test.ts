import { describe, expect, it } from 'vitest'
import {
  FIRST_CHAT,
  INSTRUCTIONS,
  NEW_CHAT,
  buildDocument,
  countWords,
  documentForTurn,
  wordsSent,
} from './chat-script'

describe('buildDocument', () => {
  it('holds every earlier message in order for turn 3 of the first chat', () => {
    const parts = documentForTurn(FIRST_CHAT, 3)
    expect(parts.map((part) => part.text)).toEqual([
      INSTRUCTIONS,
      FIRST_CHAT[0].person,
      FIRST_CHAT[0].ai,
      FIRST_CHAT[1].person,
      FIRST_CHAT[1].ai,
      FIRST_CHAT[2].person,
    ])
    expect(parts.map((part) => part.kind)).toEqual([
      'instructions',
      'person',
      'ai',
      'person',
      'ai',
      'person',
    ])
  })

  it('holds only the instructions and the one message in the new chat', () => {
    const parts = documentForTurn(NEW_CHAT, 1)
    expect(parts.map((part) => part.text)).toEqual([INSTRUCTIONS, NEW_CHAT[0].person])
    const text = parts.map((part) => part.text).join('\n')
    for (const exchange of FIRST_CHAT.slice(0, 2)) {
      expect(text).not.toContain(exchange.person)
      expect(text).not.toContain(exchange.ai)
    }
  })

  it('marks exactly one part as new, and it is the last', () => {
    for (let turn = 1; turn <= 3; turn++) {
      const parts = documentForTurn(FIRST_CHAT, turn)
      expect(parts.filter((part) => part.isNew)).toHaveLength(1)
      expect(parts[parts.length - 1].isNew).toBe(true)
    }
    expect(buildDocument('x', [], 'y').filter((part) => part.isNew)).toHaveLength(1)
  })
})

describe('word counts', () => {
  it('counts the words of each of the four turns', () => {
    // Instructions 9. Messages: 19 and 10, 11 and 17, 5 and 22; new chat: 5 and 25.
    expect(wordsSent(documentForTurn(FIRST_CHAT, 1))).toBe(9 + 19)
    expect(wordsSent(documentForTurn(FIRST_CHAT, 2))).toBe(9 + 19 + 10 + 11)
    expect(wordsSent(documentForTurn(FIRST_CHAT, 3))).toBe(9 + 19 + 10 + 11 + 17 + 5)
    expect(wordsSent(documentForTurn(NEW_CHAT, 1))).toBe(9 + 5)
    expect([1, 2, 3].map((turn) => wordsSent(documentForTurn(FIRST_CHAT, turn)))).toEqual([
      28, 49, 71,
    ])
    expect(wordsSent(documentForTurn(NEW_CHAT, 1))).toBe(14)
  })

  it('grows on each turn of the first chat', () => {
    const counts = [1, 2, 3].map((turn) => wordsSent(documentForTurn(FIRST_CHAT, turn)))
    expect(counts[1]).toBeGreaterThan(counts[0])
    expect(counts[2]).toBeGreaterThan(counts[1])
  })

  it('handles edge cases in countWords', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   \n\t ')).toBe(0)
    expect(countWords('one')).toBe(1)
    expect(countWords('  two   words\nand\tmore  ')).toBe(4)
    expect(countWords('1/8 cup')).toBe(2)
  })
})
