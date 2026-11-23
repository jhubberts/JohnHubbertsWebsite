import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { TryIt } from '@/components/ai-series/try-it'
import {
  DEFAULT_RULES,
  JOB,
  KINDS,
  KIND_LABELS,
  PHOTO_COUNT,
  REQUESTS,
  SETTINGS,
  SETTING_LABELS,
  changedParts,
  decideUnderRule,
  resultText,
  ruleFor,
  runDecisions,
  type Computer,
  type Decision,
  type Kind,
  type Part,
  type Request,
  type Rules,
  type Setting,
} from '@/lib/ai-series/harness/harness'
import { cn } from '@/lib/utils'

const BUTTON = 'h-12 min-w-0 flex-1 px-5 text-base'
const DECISION_WORDS: Record<Decision, string> = {
  allow: 'You allowed it.',
  refuse: 'You refused it.',
}

type Phase = 'one' | 'summary' | 'rules' | 'run'

/** Chapter 6's interactive: allow or refuse the AI's requests, then set rules that do it for you. */
export function YouAreTheHarness() {
  const [phase, setPhase] = useState<Phase>('one')
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [shown, setShown] = useState(0)
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES)
  // Rules run: how many requests are showing, and the answers she gave to "ask me each time".
  const [revealed, setRevealed] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Decision>>({})

  const rulesRun = phase === 'run'
  // While she sets the rules, the computer is shown as it started, not as part one left it.
  const outcomes: Decision[] = rulesRun
    ? ruleOutcomes(rules, revealed, answers)
    : phase === 'rules'
      ? []
      : decisions
  const run = runDecisions(outcomes)
  const before = runDecisions(outcomes.slice(0, -1)).computer
  // The "changed" mark stays only until she moves on to the next request.
  const latestIsShown = rulesRun ? outcomes.length === revealed : decisions.length > shown
  const changed =
    latestIsShown && (phase === 'one' || rulesRun) ? changedParts(before, run.computer) : []

  const pending = rulesRun ? pendingAsk(rules, revealed, answers) : false
  const status = statusLine(phase, outcomes, rules)

  function startAgain() {
    setPhase('one')
    setDecisions([])
    setShown(0)
    setRevealed(0)
    setAnswers({})
  }

  function runRules() {
    setRevealed(1)
    setAnswers({})
    setPhase('run')
  }

  function changeRules() {
    setRevealed(0)
    setAnswers({})
    setPhase('rules')
  }

  return (
    <TryIt title="You are the harness">
      <div className="space-y-5 text-base">
        <p>The AI can only write requests. You decide which ones are carried out.</p>

        <div className="border-border rounded-xl border p-4">
          <h4 className="text-lg font-bold">The job you gave the AI</h4>
          <p className="mt-1">{JOB}</p>
        </div>

        <ComputerPanel computer={run.computer} changed={changed} />

        <div role="status" className="sr-only">
          {status}
        </div>

        {phase === 'one' && (
          <OneAtATime
            decisions={decisions}
            shown={shown}
            onNext={() => setShown((n) => n + 1)}
            onDecide={(decision) => setDecisions((d) => [...d, decision])}
            onFinish={() => setPhase('summary')}
          />
        )}

        {phase === 'summary' && (
          <Summary allowed={run.allowed} refused={run.refused} onRules={changeRules} />
        )}

        {(phase === 'rules' || phase === 'run') && (
          <RulesPart
            rules={rules}
            onRules={setRules}
            running={rulesRun}
            revealed={revealed}
            answers={answers}
            pending={pending}
            allowed={run.allowed}
            refused={run.refused}
            onRun={runRules}
            onNext={() => setRevealed((r) => r + 1)}
            onAnswer={(index, decision) => setAnswers((a) => ({ ...a, [index]: decision }))}
            onChangeRules={changeRules}
            onStartAgain={startAgain}
          />
        )}

        <p className="text-muted-foreground text-sm">
          These requests are an example written for this page. Real ones look much the same.
        </p>
      </div>
    </TryIt>
  )
}

/** The decision for each request shown so far that has one; an unanswered "ask" ends the list. */
function ruleOutcomes(rules: Rules, revealed: number, answers: Record<number, Decision>) {
  const outcomes: Decision[] = []
  for (let i = 0; i < revealed; i += 1) {
    const decision = decideUnderRule(ruleFor(rules, REQUESTS[i]), answers[i])
    if (!decision) break
    outcomes.push(decision)
  }
  return outcomes
}

function pendingAsk(rules: Rules, revealed: number, answers: Record<number, Decision>) {
  if (revealed === 0) return false
  const last = revealed - 1
  return ruleFor(rules, REQUESTS[last]) === 'ask' && !answers[last]
}

function statusLine(phase: Phase, outcomes: readonly Decision[], rules: Rules): string {
  if (outcomes.length === 0 || phase === 'summary' || phase === 'rules') return ''
  const index = outcomes.length - 1
  const request = REQUESTS[index]
  const decision = outcomes[index]
  if (phase === 'one') return `${DECISION_WORDS[decision]} ${resultText(request, decision)}`
  const setting = ruleFor(rules, request)
  if (setting === 'ask') return `${DECISION_WORDS[decision]} ${resultText(request, decision)}`
  return `${ruleSentence(setting)} ${resultText(request, decision)}`
}

function ruleSentence(setting: Setting): string {
  if (setting === 'always') return 'Rule: always allow. The harness did it.'
  if (setting === 'never') return 'Rule: never allow. The harness refused.'
  return 'Rule: ask me each time.'
}

function ComputerPanel({ computer, changed }: { computer: Computer; changed: Part[] }) {
  const lines: { part: Part | null; text: string }[] = [
    { part: 'recipes', text: `Recipes folder: ${computer.recipeFiles.join(', ')}` },
    {
      part: 'photos',
      text: computer.photosDeleted ? 'Photos: deleted' : `Photos: ${PHOTO_COUNT} photos`,
    },
    { part: null, text: `Contacts: ${computer.contacts} people` },
    { part: 'emails', text: `Emails sent: ${computer.emailsSent}` },
  ]
  return (
    <div className="border-border bg-muted/40 rounded-xl border p-4">
      <h4 className="text-lg font-bold">Your computer</h4>
      <ul className="mt-2 space-y-2">
        {lines.map((line) => {
          const isChanged = line.part !== null && changed.includes(line.part)
          return (
            <li key={line.text} className={cn('break-words', isChanged && 'font-semibold')}>
              {line.text}
              {isChanged && (
                <span className="border-primary text-primary ml-2 inline-block rounded border px-1.5 text-sm font-semibold">
                  changed
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function RequestWords({ request }: { request: Request }) {
  return (
    <>
      <p className="text-muted-foreground mt-3 text-sm font-medium">The AI wrote:</p>
      <p className="mt-1">{request.says}</p>
      <p className="bg-muted mt-2 rounded-lg border px-3 py-2 font-mono text-sm break-words whitespace-pre-wrap">
        {request.literal}
      </p>
    </>
  )
}

function OneAtATime({
  decisions,
  shown,
  onNext,
  onDecide,
  onFinish,
}: {
  decisions: Decision[]
  shown: number
  onNext: () => void
  onDecide: (decision: Decision) => void
  onFinish: () => void
}) {
  const current = REQUESTS[shown]
  const decision = decisions[shown]
  const last = shown === REQUESTS.length - 1

  return (
    <div className="border-border rounded-xl border p-4">
      <h4 className="text-lg font-bold">
        Request {current.id} of {REQUESTS.length}
      </h4>
      <RequestWords request={current} />
      {decision === undefined ? (
        <div className="mt-4 flex gap-3">
          <Button className={BUTTON} onClick={() => onDecide('allow')}>
            Allow
          </Button>
          <Button variant="outline" className={BUTTON} onClick={() => onDecide('refuse')}>
            Refuse
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="font-semibold">{DECISION_WORDS[decision]}</p>
          <p>{resultText(current, decision)}</p>
          {current.note && <p className="font-medium">{current.note}</p>}
          <Button
            className="mt-2 h-12 px-5 text-base"
            onClick={() => (last ? onFinish() : onNext())}
          >
            {last ? 'See what happened' : 'Next request'}
          </Button>
        </div>
      )}
    </div>
  )
}

function Summary({
  allowed,
  refused,
  onRules,
}: {
  allowed: number
  refused: number
  onRules: () => void
}) {
  return (
    <div className="border-border space-y-3 rounded-xl border p-4">
      <p className="text-lg font-bold">
        The AI wrote 5 requests. You allowed {allowed} and refused {refused}.
      </p>
      <p>
        The AI never touched your computer. It can only write requests. A separate, ordinary program
        carried out the ones you allowed. That program is called the harness. On this page it was
        you.
      </p>
      <Button className="h-12 px-5 text-base" onClick={onRules}>
        Now set rules instead
      </Button>
    </div>
  )
}

function RulesPart({
  rules,
  onRules,
  running,
  revealed,
  answers,
  pending,
  allowed,
  refused,
  onRun,
  onNext,
  onAnswer,
  onChangeRules,
  onStartAgain,
}: {
  rules: Rules
  onRules: (rules: Rules) => void
  running: boolean
  revealed: number
  answers: Record<number, Decision>
  pending: boolean
  allowed: number
  refused: number
  onRun: () => void
  onNext: () => void
  onAnswer: (index: number, decision: Decision) => void
  onChangeRules: () => void
  onStartAgain: () => void
}) {
  const finished = running && revealed === REQUESTS.length && !pending

  return (
    <div className="border-border space-y-4 rounded-xl border p-4">
      <h4 className="text-2xl font-bold">Set the rules once</h4>
      <p>
        A real harness does not ask a person about everything. Someone sets rules, and the program
        applies them to every request.
      </p>

      {!running && (
        <>
          {KINDS.map((kind) => (
            <RuleRow
              key={kind}
              kind={kind}
              setting={rules[kind]}
              onPick={(setting) => onRules({ ...rules, [kind]: setting })}
            />
          ))}
          <Button className="h-12 px-5 text-base" onClick={onRun}>
            Run the same job with these rules
          </Button>
        </>
      )}

      {running && (
        <>
          <ol className="space-y-3">
            {REQUESTS.slice(0, revealed).map((request, index) => (
              <RunRow
                key={request.id}
                request={request}
                setting={ruleFor(rules, request)}
                answer={answers[index]}
                onAnswer={(decision) => onAnswer(index, decision)}
              />
            ))}
          </ol>
          {!finished && !pending && (
            <Button className="h-12 px-5 text-base" onClick={onNext}>
              Next request
            </Button>
          )}
          {finished && (
            <div className="space-y-3">
              <p className="text-lg font-bold">
                Done. Allowed: {allowed}. Refused: {refused}.
              </p>
              <p>
                The AI wrote the same five requests as before. What happened on your computer
                depended on the rules, not on the AI.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 px-5 text-base" onClick={onChangeRules}>
                  Change the rules and run again
                </Button>
                <Button variant="outline" className="h-12 px-5 text-base" onClick={onStartAgain}>
                  Start again from the beginning
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RunRow({
  request,
  setting,
  answer,
  onAnswer,
}: {
  request: Request
  setting: Setting
  answer: Decision | undefined
  onAnswer: (decision: Decision) => void
}) {
  const decision = decideUnderRule(setting, answer)
  return (
    <li className="border-border rounded-lg border p-3">
      <p className="font-semibold">{request.says}</p>
      <p className="mt-1">{ruleSentence(setting)}</p>
      {setting === 'ask' && !answer && (
        <div className="mt-3 flex gap-3">
          <Button
            className={BUTTON}
            aria-label={`Allow request ${request.id}`}
            onClick={() => onAnswer('allow')}
          >
            Allow
          </Button>
          <Button
            variant="outline"
            className={BUTTON}
            aria-label={`Refuse request ${request.id}`}
            onClick={() => onAnswer('refuse')}
          >
            Refuse
          </Button>
        </div>
      )}
      {setting === 'ask' && answer && (
        <p className="mt-1 font-semibold">{DECISION_WORDS[answer]}</p>
      )}
      {decision && request.note && <p className="mt-2 font-medium">{request.note}</p>}
    </li>
  )
}

function RuleRow({
  kind,
  setting,
  onPick,
}: {
  kind: Kind
  setting: Setting
  onPick: (setting: Setting) => void
}) {
  const headingId = `harness-rule-${kind}`

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? -1
          : 0
    if (step === 0) return
    event.preventDefault()
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    )
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (index === -1) return
    const next = buttons[(index + step + buttons.length) % buttons.length]
    next.focus()
    next.click()
  }

  return (
    <div>
      <h5 id={headingId} className="mb-2 text-lg font-bold">
        {KIND_LABELS[kind]}
      </h5>
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        onKeyDown={onKeyDown}
        className="flex flex-col gap-2"
      >
        {SETTINGS.map((option) => {
          const checked = option === setting
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onPick(option)}
              className={cn(
                'bg-background text-foreground hover:bg-muted focus-visible:ring-ring/50 focus-visible:border-ring min-h-12 w-full rounded-lg border px-4 py-2 text-left text-base break-words outline-none focus-visible:ring-3',
                checked ? 'border-primary border-4 px-3.5 py-1.5 font-semibold' : 'border-input',
              )}
            >
              {checked && <span aria-hidden="true">{'✓ '}</span>}
              {SETTING_LABELS[option]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
