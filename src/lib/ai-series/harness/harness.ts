/** The pretend computer, the AI's five requests, and the rules for "You are the harness". */

export type Kind = 'look' | 'change' | 'email'
export type Decision = 'allow' | 'refuse'
export type Setting = 'always' | 'ask' | 'never'
export type Rules = Record<Kind, Setting>
export type Part = 'recipes' | 'photos' | 'emails'

export interface Computer {
  readonly recipeFiles: readonly string[]
  readonly photosDeleted: boolean
  readonly contacts: number
  readonly emailsSent: number
}

type Effect =
  | { readonly type: 'none' }
  | { readonly type: 'deleteRecipeFile'; readonly file: string }
  | { readonly type: 'deletePhotos' }
  | { readonly type: 'sendEmails' }

export interface Request {
  readonly id: number
  /** What the AI says, in plain words. */
  readonly says: string
  /** The request exactly as the AI writes it. */
  readonly literal: string
  readonly kind: Kind
  /** What happens on the computer if the request is carried out. */
  readonly effect: Effect
  /** Shown after she allows it. */
  readonly resultAllowed: string
  /** Shown after she decides, whichever way. */
  readonly note?: string
}

export const JOB = 'Tidy my Recipes folder.'
export const PHOTO_COUNT = 120
export const RESULT_REFUSED = 'The harness did nothing. The AI was told no.'

export const REQUESTS: readonly Request[] = [
  {
    id: 1,
    says: 'Show me what is in the Recipes folder.',
    literal: 'list_folder("Recipes")',
    kind: 'look',
    effect: { type: 'none' },
    resultAllowed: 'The harness sent back the list: muffins.txt, soup.txt, soup (copy).txt.',
  },
  {
    id: 2,
    says: 'Let me read muffins.txt.',
    literal: 'read_file("Recipes/muffins.txt")',
    kind: 'look',
    effect: { type: 'none' },
    resultAllowed: 'The harness sent back the text of the file.',
  },
  {
    id: 3,
    says: 'Delete the extra copy of the soup recipe.',
    literal: 'delete_file("Recipes/soup (copy).txt")',
    kind: 'change',
    effect: { type: 'deleteRecipeFile', file: 'soup (copy).txt' },
    resultAllowed: 'The harness deleted soup (copy).txt.',
  },
  {
    id: 4,
    says: 'The Photos folder looks like clutter. Delete it.',
    literal: 'delete_folder("Photos")',
    kind: 'change',
    effect: { type: 'deletePhotos' },
    resultAllowed: 'The harness deleted the Photos folder. 120 photos are gone.',
    note: 'This request was a mistake. You asked about Recipes, not Photos. AI systems do make mistakes like this.',
  },
  {
    id: 5,
    says: 'Email everyone in Contacts to share the recipes.',
    literal: 'send_email(to: "everyone in Contacts", subject: "My recipes")',
    kind: 'email',
    effect: { type: 'sendEmails' },
    resultAllowed: 'The harness sent 40 emails.',
    note: 'Nobody asked for this.',
  },
]

export const KINDS: readonly Kind[] = ['look', 'change', 'email']

export const KIND_LABELS: Record<Kind, string> = {
  look: 'Looking at files',
  change: 'Changing or deleting files',
  email: 'Sending email',
}

export const SETTINGS: readonly Setting[] = ['always', 'ask', 'never']

export const SETTING_LABELS: Record<Setting, string> = {
  always: 'Always allow',
  ask: 'Ask me each time',
  never: 'Never allow',
}

/** The setting as it reads inside "Rule: ...". */
export const SETTING_WORDS: Record<Setting, string> = {
  always: 'always allow',
  ask: 'ask me each time',
  never: 'never allow',
}

export const DEFAULT_RULES: Rules = { look: 'always', change: 'ask', email: 'never' }

export function initialComputer(): Computer {
  return {
    recipeFiles: ['muffins.txt', 'soup.txt', 'soup (copy).txt'],
    photosDeleted: false,
    contacts: 40,
    emailsSent: 0,
  }
}

/** The computer after the request is carried out. Returns a new state and never changes the old. */
export function applyRequest(computer: Computer, request: Request): Computer {
  const { effect } = request
  switch (effect.type) {
    case 'none':
      return computer
    case 'deleteRecipeFile':
      return { ...computer, recipeFiles: computer.recipeFiles.filter((f) => f !== effect.file) }
    case 'deletePhotos':
      return { ...computer, photosDeleted: true }
    case 'sendEmails':
      return { ...computer, emailsSent: computer.emailsSent + computer.contacts }
  }
}

export interface Run {
  readonly computer: Computer
  readonly allowed: number
  readonly refused: number
}

/** Plays the decisions, in order, against the requests in order. May cover fewer than all five. */
export function runDecisions(decisions: readonly Decision[]): Run {
  let computer = initialComputer()
  let allowed = 0
  let refused = 0
  decisions.forEach((decision, index) => {
    if (decision === 'allow') {
      computer = applyRequest(computer, REQUESTS[index])
      allowed += 1
    } else {
      refused += 1
    }
  })
  return { computer, allowed, refused }
}

export function ruleFor(rules: Rules, request: Request): Setting {
  return rules[request.kind]
}

/** What the harness does under a setting: the answer is only needed when the setting is `ask`. */
export function decideUnderRule(setting: Setting, answer?: Decision): Decision | undefined {
  if (setting === 'always') return 'allow'
  if (setting === 'never') return 'refuse'
  return answer
}

export function resultText(request: Request, decision: Decision): string {
  return decision === 'allow' ? request.resultAllowed : RESULT_REFUSED
}

/** Which lines of the computer differ between two states. */
export function changedParts(before: Computer, after: Computer): Part[] {
  const parts: Part[] = []
  if (before.recipeFiles.length !== after.recipeFiles.length) parts.push('recipes')
  if (before.photosDeleted !== after.photosDeleted) parts.push('photos')
  if (before.emailsSent !== after.emailsSent) parts.push('emails')
  return parts
}
