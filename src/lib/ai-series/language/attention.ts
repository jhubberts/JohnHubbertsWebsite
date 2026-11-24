/** Which of the two sentences, and which of the two views of the model's attention. */
export type SentenceId = 'A' | 'B'
export type ViewId = 'best' | 'average'

export type AttentionData = {
  model: string
  sentences: { id: SentenceId; text: string; tokens: { token: string; special?: boolean }[] }[]
  views: {
    best: { layer: number; head: number; A: number[][]; B: number[][] }
    average: { A: number[][]; B: number[][] }
  }
  summary: { heads: number; switching: number }
}

/** One row of the list under the sentence: how strongly the selected word draws on one other word. */
export type AttentionRow = {
  /** The position of the word among the sentence's pieces (the start marker is 0). */
  index: number
  word: string
  /** What the row is called on screen: the word, or "the period". */
  label: string
  value: number
  /** True for the row with the largest value among real words (not the period). */
  isMost: boolean
}

export type AttentionList = {
  rows: AttentionRow[]
  /** The start and end markers' values added together. */
  markers: number
  /** The largest value in the list, markers included; bars are drawn relative to it. */
  largest: number
}

const FULL_STOP = '.'

/** The sentence's words and its period, without the start and end markers. */
export function sentenceWords(data: AttentionData, id: SentenceId): string[] {
  const tokens = sentenceOf(data, id).tokens
  return tokens.filter((t) => !t.special).map((t) => t.token)
}

function sentenceOf(data: AttentionData, id: SentenceId) {
  const sentence = data.sentences.find((s) => s.id === id)
  if (!sentence) throw new Error(`No sentence ${id}`)
  return sentence
}

/** How strongly the selected piece draws on every other word, in the order of the sentence. */
export function attentionList(
  data: AttentionData,
  id: SentenceId,
  view: ViewId,
  selectedIndex: number,
): AttentionList {
  const tokens = sentenceOf(data, id).tokens
  const row = data.views[view][id][selectedIndex]
  let markers = 0
  const rows: AttentionRow[] = []
  tokens.forEach((token, index) => {
    if (token.special) markers += row[index]
    else if (index !== selectedIndex) {
      rows.push({
        index,
        word: token.token,
        label: token.token === FULL_STOP ? 'the period' : token.token,
        value: row[index],
        isMost: false,
      })
    }
  })
  const real = rows.filter((r) => r.word !== FULL_STOP)
  const top = real.reduce<AttentionRow | null>(
    (best, r) => (!best || r.value > best.value ? r : best),
    null,
  )
  if (top) top.isMost = true
  const largest = Math.max(markers, ...rows.map((r) => r.value))
  return { rows, markers, largest }
}

/** The real word (not the period or a marker) the selected piece draws on most. */
export function mostDrawnWord(list: AttentionList): string | null {
  return list.rows.find((r) => r.isMost)?.word ?? null
}

/** The recorded number as "{n}": times 100, rounded; "less than 1" when it rounds to 0 above 0. */
export function inHundredNumber(value: number): string {
  const n = Math.round(value * 100)
  return n === 0 && value > 0 ? 'less than 1' : String(n)
}

/** The note under the sentence saying the pattern shown was picked, and how many do not agree. */
export function pickedNote(data: AttentionData): string {
  const { heads, switching } = data.summary
  return `The model looks at a sentence in ${heads} different ways at once. This is one of them. We picked it because it shows the switch most clearly. ${heads - switching} of the ${heads} do not show it.`
}

/** The start and end markers are the first and last pieces. */
export function markersAreFirstAndLast(data: AttentionData, id: SentenceId): boolean {
  const tokens = sentenceOf(data, id).tokens
  return tokens[0].special === true && tokens[tokens.length - 1].special === true
}

/** The position of "it" among a sentence's pieces. */
export function positionOfIt(data: AttentionData, id: SentenceId): number {
  return sentenceOf(data, id).tokens.findIndex((t) => t.token === 'it')
}
