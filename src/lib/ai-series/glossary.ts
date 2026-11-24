/**
 * The words the AI series explains, each with a short summary. In a chapter, `<Term id="...">`
 * marks a use of one of them; tapping it shows the summary.
 */

export interface GlossaryEntry {
  /** Names the entry in `<Term id>` and in the glossary page's address, as `#id`. */
  id: string
  term: string
  /** Other names for the same thing. */
  aka?: string[]
  summary: string
  /** The chapter that explains it. */
  chapter: number
  /** A longer explanation, shown only on the glossary page. */
  more?: string
}

/** The series the glossary belongs to. */
export const GLOSSARY_SERIES = 'how-ai-works'

/** The address of the glossary page. */
export const GLOSSARY_PATH = `/series/${GLOSSARY_SERIES}/glossary`

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: 'program',
    term: 'program',
    aka: ['code'],
    summary:
      'A list of exact instructions that a machine carries out one at a time, in order. Code is the written form of a program.',
    chapter: 1,
  },
  {
    id: 'store-and-mill',
    term: 'store and mill',
    aka: ['memory', 'processor'],
    summary:
      "Babbage's names for the two parts of his engine: the store held numbers and the mill did arithmetic. Today they are called memory and the processor.",
    chapter: 1,
  },
  {
    id: 'bit',
    term: 'bit',
    aka: ['binary'],
    summary:
      'One switch that is either off (0) or on (1). Counting with only 0 and 1 is called binary.',
    chapter: 2,
  },
  {
    id: 'transistor',
    term: 'transistor',
    summary:
      'A tiny switch controlled by electricity. Invented in 1947, it replaced the hot, fragile vacuum tube.',
    chapter: 2,
  },
  {
    id: 'chip',
    term: 'chip',
    aka: ['integrated circuit', 'processor'],
    summary:
      'A small piece of material holding many transistors and their wiring. A chip in an AI computer holds hundreds of billions of them.',
    chapter: 2,
  },
  {
    id: 'run',
    term: 'run',
    summary:
      "To carry out a program. A computer runs a program when its chip follows the program's instructions.",
    chapter: 2,
  },
  {
    id: 'rule',
    term: 'rule',
    summary:
      'An instruction a person writes for a computer in advance, such as "if the petals are short, it is this species".',
    chapter: 3,
  },
  {
    id: 'example',
    term: 'example',
    summary:
      'One case shown to a machine while it learns, such as one measured flower or one handwritten digit, often with its right answer.',
    chapter: 3,
  },
  {
    id: 'label',
    term: 'label',
    aka: ['annotation'],
    summary:
      'The right answer attached to an example, such as "this digit is a 7". People write most labels by hand.',
    chapter: 5,
  },
  {
    id: 'training',
    term: 'training',
    aka: ['practice'],
    summary:
      "Adjusting a model's numbers, a little at a time, so that its answers on examples become less wrong.",
    chapter: 5,
  },
  {
    id: 'model',
    term: 'model',
    summary:
      'A set of numbers, found by training, that turns an input into an answer. It is stored as a file.',
    chapter: 4,
  },
  {
    id: 'neural-network',
    term: 'neural network',
    aka: ['network'],
    summary:
      'A model made of many small adding units joined in layers, loosely inspired by nerve cells.',
    chapter: 4,
  },
  {
    id: 'unit',
    term: 'unit',
    aka: ['neuron'],
    summary:
      'One small part of a neural network. It adds up its inputs, each counted more or less, and passes one number on.',
    chapter: 4,
  },
  {
    id: 'language-model',
    term: 'language model',
    summary: 'A model that, given some text, rates every word that could come next.',
    chapter: 6,
  },
  {
    id: 'word-piece',
    term: 'word piece',
    aka: ['token'],
    summary:
      'The unit a language model reads and writes. Most everyday words are one piece; long or unusual words are split into several.',
    chapter: 6,
  },
  {
    id: 'transformer',
    term: 'transformer',
    summary:
      "The design, published in 2017, that lets every word in a text draw on every other word at once. Today's chat systems are built on it.",
    chapter: 7,
  },
  {
    id: 'attention',
    term: 'attention',
    summary:
      "The transformer's way of letting each word lean on the others. It is not attention in a psychologist's sense of focus.",
    chapter: 7,
  },
  {
    id: 'alphafold',
    term: 'AlphaFold',
    summary:
      "A model that predicts a protein's folded shape from its chain of amino acids. Two of its makers shared the 2024 Nobel Prize in Chemistry.",
    chapter: 8,
  },
  {
    id: 'chat-system',
    term: 'chat system',
    aka: ['chatbot', 'AI system'],
    summary:
      'A program, such as ChatGPT or Claude, that lets you send messages to a language model and read its replies.',
    chapter: 9,
  },
  {
    id: 'file',
    term: 'file',
    summary:
      'A saved piece of information on a computer, like a photo or a document. A model is stored as a file of numbers.',
    chapter: 9,
  },
  {
    id: 'inference',
    term: 'inference',
    summary:
      "Using a trained model to get an answer. Chips do sums with the numbers in the model's file to rate the next word.",
    chapter: 10,
  },
  {
    id: 'copy-of-the-model',
    term: 'copy of the model',
    aka: ['replica'],
    summary:
      'One running copy of the same model file. A service runs many copies; each answers messages on its own and keeps nothing afterward.',
    chapter: 10,
  },
  {
    id: 'harness',
    term: 'harness',
    summary:
      "The ordinary program that reads an AI model's requests and decides, by rules a person sets, which ones to carry out.",
    chapter: 11,
  },
  {
    id: 'agent',
    term: 'agent',
    aka: ['AI agent'],
    summary:
      'An AI model working inside a harness, so that it can do things such as run programs or change files, not only write text.',
    chapter: 11,
  },
  {
    id: 'safeguard',
    term: 'safeguard',
    summary: 'An extra check, added around a model, that blocks or refuses dangerous requests.',
    chapter: 12,
  },
  {
    id: 'data-center',
    term: 'data center',
    summary: 'A building full of computers. AI companies run their models in data centers.',
    chapter: 13,
  },
  {
    id: 'watt-hour',
    term: 'watt-hour',
    summary: 'A small amount of electricity. An LED light bulb uses about 9 of them in an hour.',
    chapter: 13,
  },
]

export function glossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY.find((entry) => entry.id === id)
}

/** The entries in alphabetical order of their terms, ignoring case. */
export function alphabetical(entries: GlossaryEntry[]): GlossaryEntry[] {
  return [...entries].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))
}

/** The address of an entry on the glossary page. */
export function glossaryAddress(id: string): string {
  return `${GLOSSARY_PATH}#${id}`
}

/** The ids named by `<Term id="...">` in a post's MDX source, each once, in order of first use. */
export function termIdsIn(source: string): string[] {
  const ids = [...source.matchAll(/<Term\s[^>]*?\bid=(["'])(.*?)\1/g)].map((match) => match[2])
  return [...new Set(ids)]
}

/**
 * For each entry id, the chapters whose source uses it, ascending. `chapters` gives each chapter's
 * number and MDX source.
 */
export function chaptersUsing(chapters: { part: number; source: string }[]): Map<string, number[]> {
  const uses = new Map<string, number[]>()
  for (const { part, source } of [...chapters].sort((a, b) => a.part - b.part)) {
    for (const id of termIdsIn(source)) {
      const parts = uses.get(id) ?? []
      if (!parts.includes(part)) parts.push(part)
      uses.set(id, parts)
    }
  }
  return uses
}
