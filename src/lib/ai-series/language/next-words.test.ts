import { describe, expect, it } from 'vitest'
import data from './next-words.json'
import {
  buildSentence,
  displayChoice,
  lastChoice,
  matchGuess,
  nodeAt,
  sentenceParts,
  type NextNode,
  type NextWordsData,
} from './next-words'

const tree: NextNode = {
  choices: [
    {
      word: ' that',
      p: 0.5,
      next: {
        choices: [
          { word: ' it', p: 0.4 },
          { word: ',', p: 0.2, next: { choices: [{ word: ' and', p: 0.3 }], other: 0.7 } },
        ],
        other: 0.4,
      },
    },
    { word: '.', p: 0.1, ends: true },
  ],
  other: 0.4,
}

describe('nodeAt', () => {
  it('returns the root for an empty path', () => {
    expect(nodeAt(tree, [])).toBe(tree)
  })

  it('follows the chosen indices', () => {
    expect(nodeAt(tree, [0, 1])?.choices[0].word).toBe(' and')
  })

  it('returns undefined where a choice has no next node', () => {
    expect(nodeAt(tree, [1])).toBeUndefined()
    expect(nodeAt(tree, [0, 0])).toBeUndefined()
    expect(nodeAt(tree, [5])).toBeUndefined()
  })
})

describe('lastChoice', () => {
  it('returns the choice most recently taken', () => {
    expect(lastChoice(tree, [0, 1])?.word).toBe(',')
    expect(lastChoice(tree, [1])?.ends).toBe(true)
  })

  it('returns undefined for an empty path', () => {
    expect(lastChoice(tree, [])).toBeUndefined()
  })
})

describe('displayChoice', () => {
  it('strips the leading space from a word', () => {
    expect(displayChoice({ word: " don't" })).toEqual({ text: "don't" })
  })

  it('names each mark', () => {
    expect(displayChoice({ word: '.' })).toEqual({ text: '.', name: 'period' })
    expect(displayChoice({ word: ',' })).toEqual({ text: ',', name: 'comma' })
    expect(displayChoice({ word: '!' })).toEqual({ text: '!', name: 'exclamation mark' })
    expect(displayChoice({ word: '?' })).toEqual({ text: '?', name: 'question mark' })
  })
})

describe('matchGuess', () => {
  const choices = [{ word: ' that' }, { word: ' the' }, { word: ',' }]

  it('matches ignoring capitals and surrounding spaces', () => {
    expect(matchGuess('  The ', choices)).toBe(1)
    expect(matchGuess('THAT', choices)).toBe(0)
  })

  it('matches a mark typed as itself', () => {
    expect(matchGuess(',', choices)).toBe(2)
  })

  it('does not match a word that is not there, an empty guess, or a guess with inner spaces', () => {
    expect(matchGuess('them', choices)).toBe(-1)
    expect(matchGuess('   ', choices)).toBe(-1)
    expect(matchGuess('that the', [{ word: ' that the' }])).toBe(-1)
  })
})

describe('buildSentence', () => {
  it('adds each word after a space', () => {
    expect(buildSentence('Once upon a time', [' there', ' was'])).toBe('Once upon a time there was')
  })

  it('attaches a mark to the word before it', () => {
    expect(buildSentence('It was', [' late', ',', ' so', '.'])).toBe('It was late, so.')
  })

  it('returns the start alone when nothing was added', () => {
    expect(buildSentence('Once', [])).toBe('Once')
  })
})

describe('sentenceParts', () => {
  it('marks only the chosen words as added, keeping spaces outside them', () => {
    expect(sentenceParts('It was', [' late', ','])).toEqual([
      { text: 'It was', added: false },
      { text: ' ', added: false },
      { text: 'late', added: true },
      { text: ',', added: true },
    ])
  })
})

describe('the recorded next-words file', () => {
  const file = data as NextWordsData

  function* nodes(node: NextNode): Generator<NextNode> {
    yield node
    for (const choice of node.choices) if (choice.next) yield* nodes(choice.next)
  }

  it('has five starts, each with exactly four first choices', () => {
    expect(file.starts).toHaveLength(5)
    for (const start of file.starts) expect(start.node.choices).toHaveLength(4)
  })

  it('has four choices in every node, every number in 0..1, and each node adding up to 1', () => {
    for (const start of file.starts) {
      for (const node of nodes(start.node)) {
        expect(node.choices).toHaveLength(4)
        expect(node.other).toBeGreaterThanOrEqual(0)
        expect(node.other).toBeLessThanOrEqual(1)
        let total = node.other
        for (const choice of node.choices) {
          expect(choice.p).toBeGreaterThanOrEqual(0)
          expect(choice.p).toBeLessThanOrEqual(1)
          total += choice.p
        }
        expect(Math.abs(total - 1)).toBeLessThanOrEqual(0.001)
      }
    }
  })
})
