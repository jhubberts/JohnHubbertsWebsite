/**
 * The names of a play's calls, each with what it means, for the Offense and Defense lines above
 * the field: "Singleback Ace Left · 12 personnel · Slant-Flat" and "Base 4-3 · Cover 3".
 */

import { COVERAGES, PACKAGES, callName, type DefensiveCall } from './defense'
import { COVERAGE_GUIDE, MUG_NOTE, PRESSURE_GUIDE } from './glossary'
import { FORMATIONS, MOTION_NAMES, formationName, type Personnel } from './offense'
import type { Play } from './play'
import { CONCEPTS } from './routes'

export interface CallTerm {
  text: string
  explanation: string
}

/** "12 personnel: 1 running back, 2 tight ends and 2 wide receivers." */
export function personnelMeaning(personnel: Personnel): string {
  const backs = Number(personnel[0])
  const ends = Number(personnel[1])
  const receivers = 5 - backs - ends
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  return `Personnel is two digits: running backs, then tight ends. ${personnel} personnel is ${count(backs, 'back', 'backs')}, ${count(ends, 'tight end', 'tight ends')} and ${count(receivers, 'wide receiver', 'wide receivers')}.`
}

function strengthNote(play: Play): string {
  const side = play.formation.strength > 0 ? 'right' : 'left'
  return `${FORMATIONS[play.formation.id].note} "${side[0].toUpperCase()}${side.slice(1)}" is the strong side: the one with more receivers or the tight end.`
}

export function offenseTerms(play: Play): CallTerm[] {
  const { formation, motion, concept } = play
  const terms: CallTerm[] = [
    { text: formationName(formation), explanation: strengthNote(play) },
    {
      text: `${FORMATIONS[formation.id].personnel} personnel`,
      explanation: personnelMeaning(FORMATIONS[formation.id].personnel),
    },
  ]
  if (motion) {
    terms.push({
      text: MOTION_NAMES[motion.id],
      explanation:
        'A receiver moves before the snap. Watch the defense: one defender running across with him points to man coverage; several sliding over a few yards points to zone.',
    })
  }
  terms.push({ text: CONCEPTS[concept].name, explanation: CONCEPTS[concept].idea })
  return terms
}

function callExplanation(call: DefensiveCall): string {
  const parts = [COVERAGE_GUIDE[call.coverage].short]
  if (call.pressure !== 'four') parts.push(PRESSURE_GUIDE[call.pressure].short)
  if (call.look.mug) parts.push(MUG_NOTE)
  return parts.join(' ')
}

export function defenseTerms(play: Play): CallTerm[] {
  const { call } = play.defense
  return [
    { text: PACKAGES[call.package].name, explanation: PACKAGES[call.package].about },
    {
      text: callName(call),
      explanation: `${COVERAGES[call.coverage].name}: ${callExplanation(call)}`,
    },
  ]
}
