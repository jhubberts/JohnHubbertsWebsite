/** One choice the model offered for the next word; `word` keeps its leading space. */
export type NextChoice = {
  word: string
  p: number
  pieces?: number
  ends?: true
  next?: NextNode
}

/** The model's four most likely next words, and the likelihood left for every other word. */
export type NextNode = { choices: NextChoice[]; other: number }

export type NextWordsData = {
  model: string
  depth: number
  starts: { text: string; node: NextNode }[]
}

const PUNCTUATION_NAMES: Record<string, string> = {
  '.': 'period',
  ',': 'comma',
  '!': 'exclamation mark',
  '?': 'question mark',
}

/** The node reached from `root` by taking the choice at each index of `path` in turn. */
export function nodeAt(root: NextNode, path: number[]): NextNode | undefined {
  let node: NextNode | undefined = root
  for (const index of path) {
    node = node?.choices[index]?.next
    if (!node) return undefined
  }
  return node
}

/** The choice made last on `path`, or undefined for an empty path or one that leaves the tree. */
export function lastChoice(root: NextNode, path: number[]): NextChoice | undefined {
  if (path.length === 0) return undefined
  return nodeAt(root, path.slice(0, -1))?.choices[path[path.length - 1]]
}

/** A choice as the reader sees it: the word without its leading space, and a name for a mark. */
export function displayChoice(choice: Pick<NextChoice, 'word'>): { text: string; name?: string } {
  const text = choice.word.trimStart()
  const name = PUNCTUATION_NAMES[text]
  return name ? { text, name } : { text }
}

/** The index of the choice the guess names, or -1. Ignores capitals and surrounding spaces. */
export function matchGuess(guess: string, choices: Pick<NextChoice, 'word'>[]): number {
  const wanted = guess.trim().toLowerCase()
  if (wanted === '' || /\s/.test(wanted)) return -1
  return choices.findIndex((choice) => choice.word.trimStart().toLowerCase() === wanted)
}

/** The starting text and each added word, with `added` set on the words the reader chose. */
export function sentenceParts(start: string, words: string[]): { text: string; added: boolean }[] {
  const parts = [{ text: start, added: false }]
  for (const word of words) {
    const text = word.trimStart()
    if (word.startsWith(' ')) parts.push({ text: ' ', added: false })
    parts.push({ text, added: true })
  }
  return parts
}

/** The starting text followed by the chosen words; a mark attaches to the word before it. */
export function buildSentence(start: string, words: string[]): string {
  return sentenceParts(start, words)
    .map((part) => part.text)
    .join('')
}
