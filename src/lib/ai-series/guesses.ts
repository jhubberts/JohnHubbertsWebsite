export type GuessWhen = 'before' | 'after'

export const GUESS_QUESTIONS = [
  {
    id: 'inAI',
    question: 'Is it in the AI?',
    detail: 'I used an AI system to help build a course for my team. Where is the course now?',
    choices: [
      { id: 'kept', label: 'The AI has it now and remembers it.' },
      { id: 'notKept', label: 'The AI helped, but it did not keep anything.' },
      { id: 'between', label: 'Something in between.' },
    ],
  },
  {
    id: 'computers',
    question: 'Is it spread across a bunch of computers?',
    detail: 'When you use an AI system, where is it? One machine, or many?',
    choices: [
      { id: 'one', label: 'One giant computer somewhere.' },
      { id: 'together', label: 'Many computers, joined into one big mind.' },
      { id: 'copies', label: 'Many computers, each doing the job on its own.' },
    ],
  },
  {
    id: 'training',
    question: 'What does “training the AI” mean?',
    detail:
      'Somebody I know saw a temporary job posting for “AI training”. Is training an AI like teaching a person?',
    choices: [
      { id: 'teaching', label: 'Yes. It is like teaching a student.' },
      { id: 'typing', label: 'No. It is just typing facts in for it to store.' },
      { id: 'between', label: 'Something in between.' },
    ],
  },
  {
    id: 'takeOver',
    question: 'Will it take over your computer?',
    detail: 'Could an AI system that is working on a computer take that computer over?',
    choices: [
      { id: 'yes', label: 'Yes, whenever it likes.' },
      { id: 'no', label: 'No, it cannot.' },
      { id: 'ifLet', label: 'Only if someone lets it.' },
    ],
  },
  {
    id: 'getOut',
    question: 'Is it trying to get out?',
    detail: 'Could an AI system get out of the place where it is kept?',
    choices: [
      { id: 'yes', label: 'Yes. It wants out and is looking for a way.' },
      { id: 'no', label: 'No. That only happens in films.' },
      { id: 'between', label: 'Something in between.' },
    ],
  },
] as const

export type GuessQuestion = (typeof GUESS_QUESTIONS)[number]
export type GuessQuestionId = GuessQuestion['id']
export type GuessChoiceId = GuessQuestion['choices'][number]['id']
export type Guesses = Partial<Record<GuessQuestionId, GuessChoiceId>>

export const GUESSES_STORAGE_KEY = 'how-ai-works.guesses.v1'

type StoredGuesses = Record<GuessWhen, Guesses>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidChoice(questionId: string, choiceId: unknown): choiceId is GuessChoiceId {
  const question = GUESS_QUESTIONS.find((q) => q.id === questionId)
  return question !== undefined && question.choices.some((c) => c.id === choiceId)
}

/** Keep only entries naming a known question and one of its known choices. */
function sanitize(value: unknown): Guesses {
  const guesses: Guesses = {}
  if (!isRecord(value)) return guesses
  for (const question of GUESS_QUESTIONS) {
    const choiceId = Object.prototype.hasOwnProperty.call(value, question.id)
      ? value[question.id]
      : undefined
    if (isValidChoice(question.id, choiceId)) guesses[question.id] = choiceId
  }
  return guesses
}

function parseStored(raw: string | null): StoredGuesses {
  let parsed: unknown = null
  if (raw !== null) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = null
    }
  }
  const record = isRecord(parsed) ? parsed : {}
  return { before: sanitize(record.before), after: sanitize(record.after) }
}

export function readGuesses(storage: Pick<Storage, 'getItem'> | null, when: GuessWhen): Guesses {
  if (!storage) return {}
  try {
    return parseStored(storage.getItem(GUESSES_STORAGE_KEY))[when]
  } catch {
    return {}
  }
}

/** Returns true when the guess was saved. Never throws. */
export function writeGuess(
  storage: Pick<Storage, 'getItem' | 'setItem'> | null,
  when: GuessWhen,
  questionId: GuessQuestionId,
  choiceId: GuessChoiceId,
): boolean {
  if (!storage || !isValidChoice(questionId, choiceId)) return false
  try {
    const stored = parseStored(storage.getItem(GUESSES_STORAGE_KEY))
    stored[when] = { ...stored[when], [questionId]: choiceId }
    storage.setItem(GUESSES_STORAGE_KEY, JSON.stringify(stored))
    return true
  } catch {
    return false
  }
}

export function getBrowserStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage
  } catch {
    return null
  }
}
