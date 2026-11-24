/**
 * Everything in the series that the reader can operate, for chapter 10's "What one day made".
 *
 * `title` must match the heading the reader saw on that part. `did` says, in her terms, what she
 * did there. The counts below are checked in docs/ai-series/sources/chapter-10.md.
 */

export interface MadeThing {
  chapter: number
  /** The path of the chapter's page. */
  path: string
  title: string
  did: string
}

const page = (slug: string) => `/blog/how-ai-works-${slug}`

export const MADE_THINGS: MadeThing[] = [
  {
    chapter: 0,
    path: page('0-three-questions-my-mom-asked'),
    title: 'Your guess, before',
    did: 'You guessed the answers to three questions.',
  },
  {
    chapter: 1,
    path: page('1-rules-versus-examples'),
    title: 'Sort the flowers',
    did: 'You dragged a line between two kinds of iris, then watched a machine find its own.',
  },
  {
    chapter: 2,
    path: page('2-a-network-that-reads-handwriting'),
    title: 'Draw a digit',
    did: 'You drew a number and a network read it.',
  },
  {
    chapter: 2,
    path: page('2-a-network-that-reads-handwriting'),
    title: 'Watch it learn',
    did: 'You moved a slider to see the network before and after its practice.',
  },
  {
    chapter: 2,
    path: page('2-a-network-that-reads-handwriting'),
    title: 'Fool it',
    did: 'You drew something that was not a number, and it named a number anyway.',
  },
  {
    chapter: 3,
    path: page('3-guess-the-next-word'),
    title: 'You be the autocomplete',
    did: 'You guessed the next word against a real language model.',
  },
  {
    chapter: 3,
    path: page('3-guess-the-next-word'),
    title: 'The dice',
    did: 'You set how often the less likely words get picked.',
  },
  {
    chapter: 3,
    path: page('3-guess-the-next-word'),
    title: 'Word map',
    did: 'You saw which words a model keeps close together.',
  },
  {
    chapter: 4,
    path: page('4-paying-attention'),
    title: 'What does “it” mean?',
    did: 'You watched one word change what “it” leaned on.',
  },
  {
    chapter: 5,
    path: page('5-inside-a-chat-window'),
    title: 'What the model actually receives',
    did: 'You saw the whole conversation sent again with every message.',
  },
  {
    chapter: 6,
    path: page('6-giving-it-hands'),
    title: 'You are the harness',
    did: 'You decided which of an AI’s requests were carried out.',
  },
  {
    chapter: 7,
    path: page('7-can-it-get-out'),
    title: 'The July 2026 incident, step by step',
    did: 'You followed the agents out of their test, one step at a time.',
  },
  {
    chapter: 8,
    path: page('8-what-it-costs'),
    title: 'One question’s footprint',
    did: 'You chose whose figure to believe and saw what one answer uses.',
  },
  {
    chapter: 9,
    path: page('9-how-i-used-ai-to-build-this'),
    title: 'How it was built',
    did: 'You went through eight moments from the day it was made.',
  },
]

/** Other counts from the same day, shown under the list. Each `count` is a whole number. */
export const DAY_COUNTS: { count: number; what: string }[] = [
  { count: 2, what: 'real language models copied onto my computer and run there' },
  { count: 1, what: 'small network taught to read handwriting, in about 15 seconds' },
  { count: 15, what: 'pretend readers who read the chapters before you did' },
]
