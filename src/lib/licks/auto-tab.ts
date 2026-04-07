import { Note as TonalNote } from 'tonal'
import type { LickNote, TabPosition } from './types'

/** Tuning weights for the cost function */
export interface TabPreferences {
  /** Cost per fret of hand position change (default: 1.0) */
  positionChangeCost: number
  /** Cost per string crossed (default: 1.5) */
  stringCrossCost: number
  /** Bonus for staying near a target fret position (default fret: 5) */
  targetFret: number
  /** Cost multiplier for distance from target fret (default: 0.3) */
  targetFretCost: number
  /** Cost for stretching beyond 4 frets from the lowest fret in a passage (default: 3.0) */
  stretchPenalty: number
  /** Bonus (negative cost) for using open strings (default: -0.5, negative = prefer) */
  openStringBonus: number
  /** Maximum fret to consider (default: 15) */
  maxFret: number
}

export const DEFAULT_PREFERENCES: TabPreferences = {
  positionChangeCost: 1.0,
  stringCrossCost: 1.5,
  targetFret: 5,
  targetFretCost: 0.3,
  stretchPenalty: 3.0,
  openStringBonus: -0.5,
  maxFret: 15,
}

/** Standard tuning open string MIDI values (string 6 to 1) */
const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64] // E2, A2, D3, G3, B3, E4

/** Get all possible (string, fret) positions for a given pitch */
function getCandidates(pitch: string, maxFret: number): TabPosition[] {
  const midi = TonalNote.midi(pitch)
  if (midi === null) return [{ string: 1, fret: 0 }]

  const candidates: TabPosition[] = []
  for (let s = 0; s < 6; s++) {
    const fret = midi - OPEN_STRING_MIDI[s]
    if (fret >= 0 && fret <= maxFret) {
      candidates.push({ string: 6 - s, fret }) // guitar string numbering: 6=low E, 1=high E
    }
  }

  return candidates.length > 0 ? candidates : [{ string: 1, fret: 0 }]
}

/** Cost of transitioning from one fret position to the next */
function transitionCost(
  from: TabPosition,
  to: TabPosition,
  prefs: TabPreferences,
): number {
  let cost = 0

  // Fret distance (hand position change)
  const fretDist = Math.abs(to.fret - from.fret)
  cost += fretDist * prefs.positionChangeCost

  // String crossing
  const stringDist = Math.abs(to.string - from.string)
  cost += stringDist * prefs.stringCrossCost

  // Stretch penalty: if the fret distance exceeds 4 and neither is open
  if (fretDist > 4 && from.fret > 0 && to.fret > 0) {
    cost += (fretDist - 4) * prefs.stretchPenalty
  }

  return cost
}

/** Cost of a single position (independent of transitions) */
function positionCost(pos: TabPosition, prefs: TabPreferences): number {
  let cost = 0

  // Distance from target fret
  cost += Math.abs(pos.fret - prefs.targetFret) * prefs.targetFretCost

  // Open string bonus
  if (pos.fret === 0) {
    cost += prefs.openStringBonus
  }

  return cost
}

interface DPNode {
  position: TabPosition
  totalCost: number
  prevIndex: number // index into previous column's candidates
}

/**
 * Find optimal tab positions for a sequence of notes using dynamic programming.
 *
 * Models the problem as a shortest-path through a layered graph:
 * - Each note maps to a column of candidate (string, fret) positions
 * - Edges between columns have costs based on hand movement
 * - DP finds the minimum-cost path through all columns
 */
export function generateAutoTab(
  notes: LickNote[],
  preferences?: Partial<TabPreferences>,
): TabPosition[] {
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences }

  // Build candidate columns (skip rests, but preserve indexing)
  const columns: { noteIndex: number; candidates: TabPosition[] }[] = []
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].rest) continue
    const candidates = getCandidates(notes[i].pitch, prefs.maxFret)
    columns.push({ noteIndex: i, candidates })
  }

  if (columns.length === 0) {
    return notes.map(() => ({ string: 1, fret: 0 }))
  }

  // DP tables: dpTable[col][candidateIdx] = { totalCost, prevIndex }
  const dpTable: DPNode[][] = []

  // Initialize first column
  dpTable[0] = columns[0].candidates.map((pos) => ({
    position: pos,
    totalCost: positionCost(pos, prefs),
    prevIndex: -1,
  }))

  // Fill DP table
  for (let col = 1; col < columns.length; col++) {
    dpTable[col] = columns[col].candidates.map((toPos) => {
      let bestCost = Infinity
      let bestPrev = 0

      for (let prevIdx = 0; prevIdx < dpTable[col - 1].length; prevIdx++) {
        const prevNode = dpTable[col - 1][prevIdx]
        const tCost = transitionCost(prevNode.position, toPos, prefs)
        const pCost = positionCost(toPos, prefs)
        const total = prevNode.totalCost + tCost + pCost

        if (total < bestCost) {
          bestCost = total
          bestPrev = prevIdx
        }
      }

      return {
        position: toPos,
        totalCost: bestCost,
        prevIndex: bestPrev,
      }
    })
  }

  // Backtrack to find optimal path
  const lastCol = dpTable[dpTable.length - 1]
  let bestEndIdx = 0
  let bestEndCost = Infinity
  for (let i = 0; i < lastCol.length; i++) {
    if (lastCol[i].totalCost < bestEndCost) {
      bestEndCost = lastCol[i].totalCost
      bestEndIdx = i
    }
  }

  // Reconstruct path
  const optimalPath: TabPosition[] = new Array(columns.length)
  let currentIdx = bestEndIdx
  for (let col = columns.length - 1; col >= 0; col--) {
    optimalPath[col] = dpTable[col][currentIdx].position
    currentIdx = dpTable[col][currentIdx].prevIndex
  }

  // Map back to full note array (including rests)
  const result: TabPosition[] = notes.map(() => ({ string: 1, fret: 0 }))
  for (let i = 0; i < columns.length; i++) {
    result[columns[i].noteIndex] = optimalPath[i]
  }

  return result
}
