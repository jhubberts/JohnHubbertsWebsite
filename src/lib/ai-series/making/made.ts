/**
 * Everything in the series that the reader can operate, for chapter 15's "What one day made".
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
    path: page('0-questions-my-mom-asked'),
    title: 'Your guess, before',
    did: 'You guessed the answers to five questions.',
  },
  {
    chapter: 1,
    path: page('1-a-machine-that-follows-instructions'),
    title: 'Be the computer',
    did: 'You carried out a six-card program, one card at a time.',
  },
  {
    chapter: 2,
    path: page('2-switches-that-count'),
    title: 'Eight switches',
    did: 'You flipped switches to make a number and a letter.',
  },
  {
    chapter: 3,
    path: page('3-rules-versus-examples'),
    title: 'Sort the flowers',
    did: 'You dragged a line between two kinds of iris, then watched a machine find its own.',
  },
  {
    chapter: 4,
    path: page('4-a-network-that-reads-handwriting'),
    title: 'Draw a digit',
    did: 'You drew a number and a network read it.',
  },
  {
    chapter: 4,
    path: page('4-a-network-that-reads-handwriting'),
    title: 'Watch it learn',
    did: 'You moved a slider to see the network before and after its practice.',
  },
  {
    chapter: 4,
    path: page('4-a-network-that-reads-handwriting'),
    title: 'Fool it',
    did: 'You drew something that was not a number, and it named a number anyway.',
  },
  {
    chapter: 5,
    path: page('5-where-the-examples-come-from'),
    title: 'Wrong labels',
    did: 'You gave the machine wrong labels and watched it learn them.',
  },
  {
    chapter: 6,
    path: page('6-guess-the-next-word'),
    title: 'You be the autocomplete',
    did: 'You guessed the next word against a real language model.',
  },
  {
    chapter: 6,
    path: page('6-guess-the-next-word'),
    title: 'The dice',
    did: 'You set how often the less likely words get picked.',
  },
  {
    chapter: 6,
    path: page('6-guess-the-next-word'),
    title: 'Word map',
    did: 'You saw which words a model keeps close together.',
  },
  {
    chapter: 7,
    path: page('7-paying-attention'),
    title: 'What does “it” mean?',
    did: 'You watched one word change what “it” leaned on.',
  },
  {
    chapter: 8,
    path: page('8-beyond-words'),
    title: 'Watch a chain fold',
    did: 'You folded a chain of beads the way a protein folds.',
  },
  {
    chapter: 9,
    path: page('9-inside-a-chat-window'),
    title: 'What the model actually receives',
    did: 'You saw the whole conversation sent again with every message.',
  },
  {
    chapter: 10,
    path: page('10-where-it-runs'),
    title: 'No one big brain',
    did: 'You followed three messages to three copies of the same model.',
  },
  {
    chapter: 11,
    path: page('11-giving-it-hands'),
    title: 'You are the harness',
    did: 'You decided which of an AI’s requests were carried out.',
  },
  {
    chapter: 12,
    path: page('12-can-it-get-out'),
    title: 'The July 2026 incident, step by step',
    did: 'You followed the agents out of their test, one step at a time.',
  },
  {
    chapter: 13,
    path: page('13-what-it-costs'),
    title: 'One question’s footprint',
    did: 'You chose whose figure to believe and saw what one answer uses.',
  },
  {
    chapter: 14,
    path: page('14-how-i-used-ai-to-build-this'),
    title: 'How it was built',
    did: 'You went through eight moments from the day it was made.',
  },
]

/** Other counts from the same day, shown under the list. Each `count` is a whole number. */
export const DAY_COUNTS: { count: number; what: string }[] = [
  { count: 2, what: 'real language models copied onto my computer and run there' },
  { count: 1, what: 'small network taught to read handwriting, in about 15 seconds' },
  {
    count: 17,
    what: 'pretend readers, other copies of Claude told to read as you would, who read the chapters before you did',
  },
]
