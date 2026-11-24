import type { GuessChoiceId } from '@/lib/ai-series/guesses'

/**
 * How the reader's answer in chapter 9 relates to her guess in chapter 0, which decides the
 * comparison line under the question: none when she has not answered here yet, otherwise
 * whether she had no earlier guess, gave the same answer, or changed it.
 */
export type GuessComparison = 'notAnswered' | 'noEarlierGuess' | 'same' | 'changed'

export function compareGuesses(
  before: GuessChoiceId | undefined,
  after: GuessChoiceId | undefined,
): GuessComparison {
  if (after === undefined) return 'notAnswered'
  if (before === undefined) return 'noEarlierGuess'
  return before === after ? 'same' : 'changed'
}

/** The page of each chapter that SERIES_ANSWERS points to. */
export const CHAPTER_PATHS: Record<number, string> = {
  5: '/blog/how-ai-works-5-inside-a-chat-window',
  6: '/blog/how-ai-works-6-giving-it-hands',
  7: '/blog/how-ai-works-7-can-it-get-out',
}
