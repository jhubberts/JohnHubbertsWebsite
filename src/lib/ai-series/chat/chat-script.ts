/** One message from the person and the AI's reply to it. */
export interface Exchange {
  person: string
  ai: string
}

export type PartKind = 'instructions' | 'person' | 'ai'

/** One piece of the document the model receives for a turn. */
export interface DocumentPart {
  kind: PartKind
  text: string
  /** True only for the person's message that starts this turn. */
  isNew: boolean
}

export const INSTRUCTIONS = 'You are a helpful assistant. Answer plainly and briefly.'

export const FIRST_CHAT: readonly Exchange[] = [
  {
    person:
      'I have a recipe for 12 muffins that needs 2 cups of flour. How much flour for 6 muffins?',
    ai: 'Half as many muffins needs half the flour: 1 cup.',
  },
  {
    person: 'And the sugar? The recipe says three quarters of a cup.',
    ai: 'Half of three quarters of a cup is three eighths of a cup. That is 6 tablespoons.',
  },
  {
    person: 'What about for 18 muffins?',
    ai: 'For 18 muffins, use one and a half times the recipe: 3 cups of flour and 1 and 1/8 cups of sugar.',
  },
]

export const NEW_CHAT: readonly Exchange[] = [
  {
    person: 'What about for 18 muffins?',
    ai: "18 muffins of what recipe? I don't have one here. Tell me the amounts for the batch you know and I will work it out.",
  },
]

/**
 * The document the model receives for one turn: the instructions, every earlier exchange in
 * order, then the person's new message.
 */
export function buildDocument(
  instructions: string,
  exchangesSoFar: readonly Exchange[],
  pendingMessage: string,
): DocumentPart[] {
  return [
    { kind: 'instructions', text: instructions, isNew: false },
    ...exchangesSoFar.flatMap((exchange): DocumentPart[] => [
      { kind: 'person', text: exchange.person, isNew: false },
      { kind: 'ai', text: exchange.ai, isNew: false },
    ]),
    { kind: 'person', text: pendingMessage, isNew: true },
  ]
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word !== '').length
}

export function wordsSent(parts: readonly DocumentPart[]): number {
  return parts.reduce((total, part) => total + countWords(part.text), 0)
}

/** The document sent for turn `turn` (1-based) of a chat. */
export function documentForTurn(chat: readonly Exchange[], turn: number): DocumentPart[] {
  return buildDocument(INSTRUCTIONS, chat.slice(0, turn - 1), chat[turn - 1].person)
}
