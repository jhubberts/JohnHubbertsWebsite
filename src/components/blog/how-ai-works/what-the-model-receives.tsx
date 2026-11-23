import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { TryIt } from '@/components/ai-series/try-it'
import {
  FIRST_CHAT,
  NEW_CHAT,
  documentForTurn,
  wordsSent,
  type DocumentPart,
  type Exchange,
} from '@/lib/ai-series/chat/chat-script'
import { cn } from '@/lib/utils'

type View = 'see' | 'receives'

const VIEWS: { view: View; label: string }[] = [
  { view: 'see', label: 'What you see' },
  { view: 'receives', label: 'What the model receives' },
]

interface ChatState {
  chat: 'first' | 'new'
  /** How many exchanges of the current chat have happened. */
  done: number
}

const START: ChatState = { chat: 'first', done: 1 }

const BUTTON_CLASS =
  'bg-primary text-primary-foreground focus-visible:ring-ring/50 min-h-12 w-full rounded-lg px-4 py-3 text-left text-base font-semibold break-words outline-none focus-visible:ring-3'

/** A chat that looks like a conversation, beside the one long document the model gets each turn. */
export function WhatTheModelReceives() {
  const [view, setView] = useState<View>('see')
  const [state, setState] = useState<ChatState>(START)
  const [announcement, setAnnouncement] = useState('')

  const script = state.chat === 'first' ? FIRST_CHAT : NEW_CHAT
  const shown = script.slice(0, state.done)
  const finished = state.done === script.length

  function press() {
    if (!finished) {
      setState({ ...state, done: state.done + 1 })
      setAnnouncement(script[state.done].ai)
    } else if (state.chat === 'first') {
      setState({ chat: 'new', done: 0 })
      setAnnouncement('')
    } else {
      setState(START)
      setAnnouncement('')
    }
  }

  const buttonLabel = !finished
    ? `Send: ${script[state.done].person}`
    : state.chat === 'first'
      ? 'Start a new chat'
      : 'Start over'

  return (
    <TryIt title="What the model actually receives">
      <div className="space-y-4 text-base">
        <p>
          This looks like a conversation. Switch views to see what the AI model is given each time.
        </p>
        {state.chat === 'new' && (
          <p className="font-semibold">
            New chat. The first chat is gone from the model&apos;s view.
          </p>
        )}
        <ViewTabs view={view} onChange={setView} />
        <div
          role="tabpanel"
          id="what-the-model-receives-panel"
          aria-labelledby={`what-the-model-receives-tab-${view}`}
        >
          {view === 'see' ? (
            <Bubbles shown={shown} />
          ) : (
            <ModelView script={script} done={state.done} />
          )}
        </div>
        <button type="button" onClick={press} className={BUTTON_CLASS}>
          {buttonLabel}
        </button>
        <div role="status" className="sr-only">
          {announcement}
        </div>
        <p className="text-muted-foreground text-sm">
          This conversation is an example written for this page.
        </p>
      </div>
    </TryIt>
  )
}

function ViewTabs({ view, onChange }: { view: View; onChange(view: View): void }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next = (index + (event.key === 'ArrowRight' ? 1 : VIEWS.length - 1)) % VIEWS.length
    onChange(VIEWS[next].view)
    tabRefs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="Views" className="flex flex-wrap gap-2 border-b">
      {VIEWS.map((tab, index) => {
        const selected = tab.view === view
        return (
          <button
            key={tab.view}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`what-the-model-receives-tab-${tab.view}`}
            aria-selected={selected}
            aria-controls="what-the-model-receives-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.view)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'focus-visible:ring-ring/50 -mb-px min-h-11 rounded-t-lg border-b-2 px-3 text-base outline-none focus-visible:ring-3',
              selected
                ? 'border-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {selected && (
              <span aria-hidden className="mr-1.5">
                ●
              </span>
            )}
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function Bubbles({ shown }: { shown: readonly Exchange[] }) {
  if (shown.length === 0) return <p className="text-muted-foreground">No messages yet.</p>
  return (
    <ul className="space-y-3">
      {shown.flatMap((exchange, index) => [
        <Bubble key={`p${index}`} who="You" text={exchange.person} />,
        <Bubble key={`a${index}`} who="AI" text={exchange.ai} />,
      ])}
    </ul>
  )
}

function Bubble({ who, text }: { who: 'You' | 'AI'; text: string }) {
  const mine = who === 'You'
  return (
    <li className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <span className="text-muted-foreground mb-1 text-sm">{who}</span>
      <p
        className={cn(
          'max-w-[85%] rounded-xl px-3 py-2 break-words',
          mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground border',
        )}
      >
        {text}
      </p>
    </li>
  )
}

function ModelView({ script, done }: { script: readonly Exchange[]; done: number }) {
  const turns = Array.from({ length: done }, (_, index) => index + 1)
  const counts = turns.map((turn) => wordsSent(documentForTurn(script, turn)))
  const parts = done === 0 ? null : documentForTurn(script, done)
  const reply = done === 0 ? null : script[done - 1].ai
  const instructions = documentForTurn(script, 1)[0]
  const isNewChatAfterExchange = script === NEW_CHAT && done > 0

  return (
    <div className="space-y-3">
      <div className="border-border bg-background rounded-lg border p-3 font-mono text-sm break-words whitespace-pre-wrap">
        <Section heading="[Instructions written by the company. You never see these.]">
          {instructions.text}
        </Section>
        {parts === null ? (
          <p className="mt-3">Nothing else. No earlier conversation is included.</p>
        ) : (
          <>
            {parts.slice(1).map((part, index) => (
              <Message key={index} part={part} />
            ))}
            <div className="mt-3 border-l-4 border-transparent pl-2">
              <p className="font-bold">
                [AI] <span className="font-normal">the model wrote this</span>
              </p>
              <p>{reply}</p>
            </div>
          </>
        )}
      </div>
      {parts === null ? (
        <p>Nothing has been sent in this chat yet.</p>
      ) : (
        <p>
          Sent to the model this turn: {counts[done - 1]} words. All of it, not only your new
          message.
        </p>
      )}
      {done > 0 && (
        <div>
          <p className="font-semibold">Words sent each turn</p>
          <ul>
            {turns.map((turn, index) => (
              <li key={turn}>
                Turn {turn}: {counts[index]} words
              </li>
            ))}
          </ul>
        </div>
      )}
      {isNewChatAfterExchange && (
        <p className="font-semibold">
          Nothing from the first chat was in this document, so the model had nothing to go on.
        </p>
      )}
      <p className="text-muted-foreground text-sm">
        Real systems mark the parts with special symbols instead of these labels. The idea is the
        same: one document, sent again in full every time.
      </p>
    </div>
  )
}

function Section({ heading, children }: { heading: string; children: string }) {
  return (
    <div className="border-l-4 border-transparent pl-2">
      <p className="font-bold">{heading}</p>
      <p>{children}</p>
    </div>
  )
}

function Message({ part }: { part: DocumentPart }) {
  const heading = part.kind === 'ai' ? '[AI]' : '[You]'
  return (
    <div
      className={cn('mt-3 border-l-4 pl-2', part.isNew ? 'border-primary' : 'border-transparent')}
    >
      <p className="font-bold">
        {heading}
        {part.isNew && <span className="font-normal"> new this turn</span>}
      </p>
      <p>{part.text}</p>
    </div>
  )
}
