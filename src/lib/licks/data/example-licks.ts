import type { Lick } from '../types'

/** A classic bebop ii-V-I lick in C major.
 *  Dm7 → G7 → Cmaj7
 *  Ascending through Dm7 then descending through G7 */
export const bebopIIVI: Lick = {
  id: 'bebop-ii-v-i-01',
  name: 'Bebop ii-V-I #1',
  description:
    'A classic bebop line descending through a ii-V-I in C. ' +
    'Notice how it outlines chord tones on strong beats.',

  key: 'C',
  timeSignature: [4, 4],
  tempo: 140,

  notes: [
    // Measure 1: over Dm7 → G7
    { pitch: 'D4', duration: '8' },
    { pitch: 'E4', duration: '8' },
    { pitch: 'F4', duration: '8' },
    { pitch: 'A4', duration: '8' },
    { pitch: 'G4', duration: '8' },
    { pitch: 'F4', duration: '8' },
    { pitch: 'E4', duration: '8' },
    { pitch: 'D4', duration: '8' },
  ],

  backingChords: [
    { symbol: 'Dm7', beat: 0 },
    { symbol: 'G7', beat: 2 },
  ],

  tabPositions: [
    { string: 4, fret: 0 },
    { string: 4, fret: 2 },
    { string: 4, fret: 3 },
    { string: 3, fret: 2 },
    { string: 3, fret: 0 },
    { string: 4, fret: 3 },
    { string: 4, fret: 2 },
    { string: 4, fret: 0 },
  ],

  source: {
    artist: 'Charlie Parker (style)',
    song: 'Common bebop vocabulary',
  },

  tags: ['bebop', 'ii-V-I', 'eighth-notes', 'descending'],
}

/** A minor pentatonic blues lick in A */
export const bluesLickAm: Lick = {
  id: 'blues-am-01',
  name: 'Minor Pentatonic Blues Lick',
  description: 'A bread-and-butter blues lick using the A minor pentatonic scale.',

  key: 'A',
  timeSignature: [4, 4],
  tempo: 100,

  notes: [
    { pitch: 'C5', duration: '8' },
    { pitch: 'A4', duration: '8' },
    { pitch: 'G4', duration: '8' },
    { pitch: 'E4', duration: '8' },
    { pitch: 'G4', duration: 'q' },
    { pitch: 'A4', duration: 'q' },
  ],

  backingChords: [{ symbol: 'Am7', beat: 0 }],

  tabPositions: [
    { string: 2, fret: 1 },
    { string: 3, fret: 2 },
    { string: 3, fret: 0 },
    { string: 4, fret: 2 },
    { string: 3, fret: 0 },
    { string: 3, fret: 2 },
  ],

  source: {
    artist: 'B.B. King (style)',
    song: 'Common blues vocabulary',
  },

  tags: ['blues', 'minor-pentatonic'],
}

/** Major 7 arpeggio lick */
export const maj7Arpeggio: Lick = {
  id: 'maj7-arpeggio-01',
  name: 'Cmaj7 Arpeggio Run',
  description:
    'Ascending Cmaj7 arpeggio followed by a scalar descent. ' +
    'Great for outlining major 7th chords clearly.',

  key: 'C',
  timeSignature: [4, 4],
  tempo: 120,

  notes: [
    { pitch: 'C4', duration: '8' },
    { pitch: 'E4', duration: '8' },
    { pitch: 'G4', duration: '8' },
    { pitch: 'B4', duration: '8' },
    { pitch: 'A4', duration: '8' },
    { pitch: 'G4', duration: '8' },
    { pitch: 'F4', duration: '8' },
    { pitch: 'E4', duration: '8' },
  ],

  backingChords: [{ symbol: 'Cmaj7', beat: 0 }],

  tabPositions: [
    { string: 5, fret: 3 },
    { string: 4, fret: 2 },
    { string: 3, fret: 0 },
    { string: 2, fret: 0 },
    { string: 3, fret: 2 },
    { string: 3, fret: 0 },
    { string: 4, fret: 3 },
    { string: 4, fret: 2 },
  ],

  tags: ['arpeggio', 'major-7', 'eighth-notes', 'ascending'],
}

/** Dorian mode lick over a minor chord */
export const dorianLick: Lick = {
  id: 'dorian-dm-01',
  name: 'Dorian Flavor over Dm',
  description:
    'Emphasizes the natural 6th (B natural) that distinguishes Dorian from Aeolian. ' +
    'The B on beat 3 is the signature color tone.',

  key: 'D',
  timeSignature: [4, 4],
  tempo: 110,

  notes: [
    { pitch: 'D4', duration: '8' },
    { pitch: 'F4', duration: '8' },
    { pitch: 'A4', duration: '8' },
    { pitch: 'B4', duration: '8' },
    { pitch: 'A4', duration: '8' },
    { pitch: 'G4', duration: '8' },
    { pitch: 'F4', duration: 'q' },
  ],

  backingChords: [{ symbol: 'Dm7', beat: 0 }],

  tabPositions: [
    { string: 4, fret: 0 },
    { string: 4, fret: 3 },
    { string: 3, fret: 2 },
    { string: 3, fret: 4 },
    { string: 3, fret: 2 },
    { string: 3, fret: 0 },
    { string: 4, fret: 3 },
  ],

  source: {
    artist: 'Miles Davis (style)',
    song: 'So What / modal jazz vocabulary',
  },

  tags: ['dorian', 'modal', 'minor', 'color-tone'],
}

/** Dominant bebop scale fragment */
export const dominantBebopScale: Lick = {
  id: 'dom-bebop-scale-01',
  name: 'Dominant Bebop Scale Run',
  description:
    'Descending G dominant bebop scale (with passing natural 7th). ' +
    'The added F# creates smooth voice leading and keeps chord tones on downbeats.',

  key: 'G',
  timeSignature: [4, 4],
  tempo: 160,

  notes: [
    { pitch: 'G5', duration: '8' },
    { pitch: 'F#5', duration: '8' },
    { pitch: 'F5', duration: '8' },
    { pitch: 'E5', duration: '8' },
    { pitch: 'D5', duration: '8' },
    { pitch: 'C5', duration: '8' },
    { pitch: 'B4', duration: '8' },
    { pitch: 'A4', duration: '8' },
  ],

  backingChords: [{ symbol: 'G7', beat: 0 }],

  tabPositions: [
    { string: 1, fret: 3 },
    { string: 1, fret: 2 },
    { string: 1, fret: 1 },
    { string: 1, fret: 0 },
    { string: 2, fret: 3 },
    { string: 2, fret: 1 },
    { string: 2, fret: 0 },
    { string: 3, fret: 2 },
  ],

  tags: ['bebop', 'dominant', 'bebop-scale', 'descending', 'eighth-notes'],
}

/** Dexter Gordon's embellished head on Blue Bossa (Biting the Apple, ~1:40).
 *  Two eighth-note pickups into 4 bars over Cm7 → Fm7.
 *  Cascading descending 3rds through Cm7, resolving to the root of Fm7. */
export const blueBossaDexterHead: Lick = {
  id: 'blue-bossa-dexter-01',
  name: 'Dexter Gordon — Blue Bossa Head',
  description:
    'Dexter\'s embellished head opening from Biting the Apple. Two eighth-note pickups launch ' +
    'into cascading descending 3rds through Cm7, then the line resolves to F (the root of Fm7) ' +
    'with a long held note before a final descending figure.',

  key: 'C',
  timeSignature: [4, 4],
  tempo: 140,
  pickupBeats: 1, // Two eighth notes = 1 beat of pickup

  notes: [
    // Pickup (2 eighths approaching Cm7)
    { pitch: 'G4', duration: '8' },
    { pitch: 'C5', duration: '8' },

    // Bar 1 — Cm7: descending 3rds (A-F-D, G-Eb-C, D-Bb)
    { pitch: 'A4', duration: '8' },
    { pitch: 'F4', duration: '8' },
    { pitch: 'D4', duration: '8' },
    { pitch: 'G4', duration: '8' },
    { pitch: 'Eb4', duration: '8' },
    { pitch: 'C4', duration: '8' },
    { pitch: 'D4', duration: '8' },
    { pitch: 'Bb3', duration: '8' },

    // Bar 2 — Cm7: pattern continues down (D-Bb-G, C-A-F, G-Eb)
    { pitch: 'D4', duration: '8' },
    { pitch: 'Bb3', duration: '8' },
    { pitch: 'G3', duration: '8' },
    { pitch: 'C4', duration: '8' },
    { pitch: 'A3', duration: '8' },
    { pitch: 'F3', duration: '8' },
    { pitch: 'G3', duration: '8' },
    { pitch: 'Eb3', duration: '8' },

    // Bar 3 — Fm7: resolves to F with a long held note
    { pitch: 'C4', duration: 'q' },
    { pitch: 'F4', duration: 'h' },
    { pitch: 'C4', duration: '8' },
    { pitch: 'Eb4', duration: '8' },

    // Bar 4 — Fm7: final descending figure
    { pitch: 'C4', duration: '8' },
    { pitch: 'D4', duration: '8' },
    { pitch: 'Bb3', duration: 'q' },
    { pitch: 'G3', duration: 'h' },
  ],

  backingChords: [
    { symbol: 'Cm7', beat: 1 },    // Bar 1 (after 1 beat of pickup)
    { symbol: 'Fm7', beat: 9 },    // Bar 3
  ],

  source: {
    artist: 'Dexter Gordon',
    song: 'Blue Bossa (Biting the Apple)',
    timestamp: 100, // ~1:40
  },

  tags: ['blue-bossa', 'bossa-nova', 'descending', 'head', 'dexter-gordon'],
}

export const exampleLicks: Lick[] = [
  bebopIIVI,
  bluesLickAm,
  maj7Arpeggio,
  dorianLick,
  dominantBebopScale,
  blueBossaDexterHead,
]
