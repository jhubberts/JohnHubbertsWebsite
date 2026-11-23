export type FillInData = {
  sentence: string
  positions: {
    word: string
    blank: {
      text: string
      top: { token: string; p: number }[]
      original: { token: string; p: number; rank: number }
    }
    continue: {
      prefix: string
      top: { word: string; p: number }[]
      original: {
        word: string
        p: number
        rank_among_choices: number
        rank_among_all_tokens: number
      }
    }
  }[]
}

export type GameRow = { word: string; p: number }

/** How the real word did in one game. */
export type RealWord = { word: string; rank: number; p: number }

export type Game = {
  rows: GameRow[]
  real: RealWord
}

export type Round = {
  word: string
  /** Game 1: the whole sentence with "____" where the word was. */
  bothSides: { text: string; game: Game }
  /** Game 2: what comes before the gap, and the words after it (which the model cannot see). */
  beforeOnly: { before: string; hidden: string[]; game: Game }
}

export const GAP = '____'

/** The hidden words in sentence order. */
export function hiddenWords(data: FillInData): string[] {
  return data.positions.map((p) => p.word)
}

/** Everything the two games show for one hidden word. */
export function roundFor(data: FillInData, word: string): Round {
  const position = data.positions.find((p) => p.word === word)
  if (!position) throw new Error(`No recorded round for "${word}"`)
  const { blank } = position
  const next = position.continue
  const afterPrefix = data.sentence.slice(next.prefix.length)
  const afterWord = afterPrefix.slice(afterPrefix.indexOf(word) + word.length)
  return {
    word,
    bothSides: {
      text: blank.text.replace('[MASK]', GAP),
      game: {
        rows: blank.top.map((t) => ({ word: t.token, p: t.p })),
        real: { word: blank.original.token, rank: blank.original.rank, p: blank.original.p },
      },
    },
    beforeOnly: {
      before: next.prefix,
      hidden: afterWord.split(' ').filter((w) => w !== ''),
      game: {
        rows: next.top.map((t) => ({ word: t.word.trim(), p: t.p })),
        real: {
          word: next.original.word.trim(),
          rank: next.original.rank_among_all_tokens,
          p: next.original.p,
        },
      },
    },
  }
}
