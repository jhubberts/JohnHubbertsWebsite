import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import {
  Renderer,
  Stave,
  StaveNote,
  TabStave,
  TabNote,
  Voice,
  Formatter,
  Beam,
  StaveConnector,
  ChordSymbol,
  SymbolModifiers,
  Dot,
  Accidental,
} from 'vexflow'
import type { Lick, TabPosition, NoteAnalysis, TabPreferences } from '@/lib/licks'
import { generateAutoTab } from '@/lib/licks'
import { Note as TonalNote } from 'tonal'

interface LickNotationProps {
  lick: Lick
  noteAnalyses?: NoteAnalysis[]
  tabPreferences?: Partial<TabPreferences>
  width?: number
}

/** Imperative API exposed via ref */
export interface LickNotationHandle {
  /** Highlight the note at the given index (-1 to clear) */
  highlightNote: (index: number) => void
}

const DURATION_BEATS: Record<string, number> = {
  w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25,
}

function pitchToVexKey(pitch: string): string {
  const parsed = TonalNote.get(pitch)
  if (!parsed.empty) {
    return `${parsed.letter.toLowerCase()}${parsed.acc}/${parsed.oct ?? 4}`
  }
  const match = pitch.match(/^([A-Ga-g][#b]?)(\d)$/)
  if (match) return `${match[1].toLowerCase()}/${match[2]}`
  return 'c/4'
}

function buildChordSymbol(symbol: string): ChordSymbol {
  const cs = new ChordSymbol()
  cs.setFontSize(14)
  const match = symbol.match(/^([A-G][#b]?)(.*)$/)
  if (!match) { cs.addGlyphOrText(symbol); return cs }
  const [, root, quality] = match
  if (root.length === 2 && root[1] === 'b') {
    cs.addText(root[0]); cs.addGlyph('b')
  } else if (root.length === 2 && root[1] === '#') {
    cs.addText(root[0]); cs.addGlyph('#')
  } else {
    cs.addText(root)
  }
  if (quality) cs.addGlyphOrText(quality, { symbolModifier: SymbolModifiers.SUPERSCRIPT })
  return cs
}

function noteDurationBeats(note: { duration: string; dotted?: boolean }): number {
  const base = DURATION_BEATS[note.duration] ?? 1
  return note.dotted ? base * 1.5 : base
}

/** Split a flat list of notes into measures based on time signature and optional pickup */
interface MeasureData {
  noteIndices: number[]   // indices into the original lick.notes array
  beats: number           // how many beats this measure should contain
  isPickup: boolean
}

function splitIntoMeasures(
  notes: { duration: string; dotted?: boolean }[],
  beatsPerMeasure: number,
  pickupBeats?: number,
): MeasureData[] {
  const measures: MeasureData[] = []
  let currentMeasure: number[] = []
  let beatsInCurrent = 0
  let currentMeasureTarget = pickupBeats && pickupBeats > 0 ? pickupBeats : beatsPerMeasure
  let isFirst = true

  for (let i = 0; i < notes.length; i++) {
    const beats = noteDurationBeats(notes[i])
    currentMeasure.push(i)
    beatsInCurrent += beats

    if (beatsInCurrent >= currentMeasureTarget - 0.001) {
      measures.push({
        noteIndices: currentMeasure,
        beats: currentMeasureTarget,
        isPickup: isFirst && pickupBeats !== undefined && pickupBeats > 0,
      })
      currentMeasure = []
      beatsInCurrent = 0
      currentMeasureTarget = beatsPerMeasure
      isFirst = false
    }
  }

  // Remaining notes go into a final measure
  if (currentMeasure.length > 0) {
    measures.push({
      noteIndices: currentMeasure,
      beats: beatsPerMeasure,
      isPickup: false,
    })
  }

  return measures
}

const ROLE_COLORS: Record<string, string> = {
  'chord-tone': '#22c55e',
  'color-tone': '#3b82f6',
  'approach-tone': '#f59e0b',
  'passing-tone': '#ef4444',
  'scale-tone': '#8b5cf6',
}

const HIGHLIGHT_COLOR = '#f59e0b' // amber

const LickNotation = forwardRef<LickNotationHandle, LickNotationProps>(
  ({ lick, noteAnalyses, tabPreferences, width = 700 }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [notePositions, setNotePositions] = useState<{ x: number; width: number }[]>([])
  // Store SVG group elements for each note (notation + tab pairs)
  const noteElementsRef = useRef<{ notation: SVGElement | null; tab: SVGElement | null }[]>([])
  const activeHighlightRef = useRef<number>(-1)
  const foregroundRef = useRef<string>('')

  const highlightNote = useCallback((index: number) => {
    const prevIdx = activeHighlightRef.current
    const elements = noteElementsRef.current
    const fg = foregroundRef.current

    // Clear previous highlight
    if (prevIdx >= 0 && prevIdx < elements.length) {
      const prev = elements[prevIdx]
      if (prev.notation) prev.notation.setAttribute('fill', fg)
      if (prev.tab) prev.tab.setAttribute('fill', fg)
    }

    // Apply new highlight
    if (index >= 0 && index < elements.length) {
      const curr = elements[index]
      if (curr.notation) curr.notation.setAttribute('fill', HIGHLIGHT_COLOR)
      if (curr.tab) curr.tab.setAttribute('fill', HIGHLIGHT_COLOR)
    }

    activeHighlightRef.current = index
  }, [])

  useImperativeHandle(ref, () => ({ highlightNote }), [highlightNote])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = ''

    const styles = getComputedStyle(document.documentElement)
    const foreground = styles.getPropertyValue('--foreground').trim()
    const background = styles.getPropertyValue('--background').trim()

    const [beatsNum, beatsVal] = lick.timeSignature

    // -- Split notes into measures --
    const measures = splitIntoMeasures(lick.notes, beatsNum, lick.pickupBeats)

    // -- Compute tab positions --
    const tabPositions = lick.tabPositions ?? generateAutoTab(lick.notes, tabPreferences)

    // -- Build chord symbol lookup --
    const chordsByBeat: Record<number, string> = {}
    for (const chord of lick.backingChords) {
      chordsByBeat[chord.beat] = chord.symbol
    }

    // -- Layout: how many measures per line --
    const measuresPerLine = Math.min(measures.length, Math.max(1, Math.floor((width - 40) / 200)))
    const lines: MeasureData[][] = []
    for (let i = 0; i < measures.length; i += measuresPerLine) {
      lines.push(measures.slice(i, i + measuresPerLine))
    }

    const notationLineHeight = 120
    const tabLineHeight = 100
    const lineSpacing = 30
    const lineHeight = notationLineHeight + tabLineHeight + lineSpacing
    const totalHeight = lines.length * lineHeight + 20

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(width, totalHeight)
    const context = renderer.getContext()
    context.setFillStyle(foreground)
    context.setStrokeStyle(foreground)

    const totalStaveWidth = width - 40
    const allPositions: { x: number; width: number }[] = new Array(lick.notes.length)
    const allNoteElements: { notation: SVGElement | null; tab: SVGElement | null }[] =
      new Array(lick.notes.length).fill(null).map(() => ({ notation: null, tab: null }))
    const allBeams: Beam[] = []

    // Track cumulative beat position for chord symbol placement
    let globalBeat = 0

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx]
      const baseY = lineIdx * lineHeight
      const notationY = baseY + 10
      const tabY = baseY + notationLineHeight + 10

      // Calculate measure widths proportionally by beat count
      const totalBeatsInLine = line.reduce((s, m) => s + m.beats, 0)
      const isFirstLine = lineIdx === 0
      const clefWidth = isFirstLine ? 80 : 0 // room for clef + time sig on first line only

      let xOffset = 20
      let firstNotationStave: Stave | null = null
      let lastTabStave: TabStave | null = null

      for (let mIdx = 0; mIdx < line.length; mIdx++) {
        const measure = line[mIdx]
        const measureWidth =
          clefWidth * (mIdx === 0 ? 1 : 0) +
          (totalStaveWidth - clefWidth) * (measure.beats / totalBeatsInLine)

        // -- Notation stave --
        const notationStave = new Stave(xOffset, notationY, measureWidth)
        if (isFirstLine && mIdx === 0) {
          notationStave.addClef('treble')
          notationStave.addTimeSignature(`${beatsNum}/${beatsVal}`)
        }
        notationStave.setContext(context).draw()

        // -- Tab stave --
        const tabStave = new TabStave(xOffset, tabY, measureWidth)
        if (isFirstLine && mIdx === 0) {
          tabStave.addClef('tab')
        }
        tabStave.setContext(context).draw()

        if (mIdx === 0) firstNotationStave = notationStave
        lastTabStave = tabStave

        // -- Build notes for this measure --
        const measureStaveNotes: StaveNote[] = []
        const measureTabNotes: TabNote[] = []
        let measureBeat = measure.isPickup ? 0 : 0

        // Track beat within the measure to get start beat for chord lookup
        const measureStartBeat = globalBeat

        for (const noteIdx of measure.noteIndices) {
          const note = lick.notes[noteIdx]
          const tabPos = tabPositions[noteIdx]
          const beatInLick = measureStartBeat + measureBeat

          const vexKey = note.rest ? 'b/4' : pitchToVexKey(note.pitch)
          const duration = note.rest ? note.duration + 'r' : note.duration
          const staveNote = new StaveNote({ keys: [vexKey], duration })

          if (!note.rest) {
            const parsed = TonalNote.get(note.pitch)
            if (!parsed.empty && parsed.acc) {
              staveNote.addModifier(new Accidental(parsed.acc), 0)
            }
          }

          if (note.dotted) Dot.buildAndAttach([staveNote])

          // Chord symbol
          // Use a small epsilon for float comparison
          const matchingBeat = Object.keys(chordsByBeat).find(
            (b) => Math.abs(parseFloat(b) - beatInLick) < 0.01,
          )
          if (matchingBeat !== undefined) {
            staveNote.addModifier(buildChordSymbol(chordsByBeat[parseFloat(matchingBeat)]))
          }

          measureStaveNotes.push(staveNote)

          if (note.rest) {
            measureTabNotes.push(
              new TabNote({ positions: [{ str: 1, fret: 0 }], duration: note.duration + 'r' }),
            )
          } else {
            measureTabNotes.push(
              new TabNote({
                positions: [{ str: tabPos.string, fret: tabPos.fret }],
                duration: note.duration,
              }),
            )
          }

          measureBeat += noteDurationBeats(note)
        }

        globalBeat += measure.beats

        // -- Beams for this measure --
        const beams = Beam.generateBeams(measureStaveNotes)
        allBeams.push(...beams)

        // -- Voices --
        const notationVoice = new Voice({ numBeats: measure.beats, beatValue: beatsVal })
        notationVoice.setStrict(false)
        notationVoice.addTickables(measureStaveNotes)

        const tabVoice = new Voice({ numBeats: measure.beats, beatValue: beatsVal })
        tabVoice.setStrict(false)
        tabVoice.addTickables(measureTabNotes)

        // -- Format --
        const noteStartX = Math.max(notationStave.getNoteStartX(), tabStave.getNoteStartX())
        notationStave.setNoteStartX(noteStartX)
        tabStave.setNoteStartX(noteStartX)

        const availableWidth = measureWidth - (noteStartX - xOffset) - 10
        new Formatter()
          .joinVoices([notationVoice])
          .joinVoices([tabVoice])
          .format([notationVoice, tabVoice], Math.max(availableWidth, 50))

        // -- Draw --
        notationVoice.draw(context, notationStave)
        tabVoice.draw(context, tabStave)

        // -- Capture positions and SVG elements --
        for (let j = 0; j < measureStaveNotes.length; j++) {
          const origIdx = measure.noteIndices[j]
          const bb = measureStaveNotes[j].getBoundingBox()
          allPositions[origIdx] = { x: bb.getX(), width: bb.getW() }
          allNoteElements[origIdx] = {
            notation: (measureStaveNotes[j] as any).getSVGElement?.() ?? null,
            tab: (measureTabNotes[j] as any).getSVGElement?.() ?? null,
          }
        }

        xOffset += measureWidth
      }

      // -- Connectors for the line --
      if (firstNotationStave && lastTabStave) {
        const leftConn = new StaveConnector(firstNotationStave, lastTabStave)
        leftConn.setType('singleLeft')
        leftConn.setContext(context).draw()
      }
    }

    // Draw all beams
    for (const beam of allBeams) {
      beam.setContext(context).draw()
    }

    setNotePositions(allPositions)
    noteElementsRef.current = allNoteElements
    foregroundRef.current = foreground
    activeHighlightRef.current = -1

    // -- Theme remap --
    const svgEl = container.querySelector('svg')
    if (svgEl) {
      svgEl.style.backgroundColor = 'transparent'
      const bgProbe = document.createElement('div')
      bgProbe.style.color = background
      document.body.appendChild(bgProbe)
      const bgColor = getComputedStyle(bgProbe).color
      document.body.removeChild(bgProbe)

      svgEl.querySelectorAll('*').forEach((el) => {
        const fill = el.getAttribute('fill')
        const stroke = el.getAttribute('stroke')
        if (fill === 'black' || fill === '#000' || fill === '#000000') {
          el.setAttribute('fill', foreground)
        } else if (fill === 'white' || fill === '#fff' || fill === '#ffffff') {
          el.setAttribute('fill', bgColor)
        }
        if (stroke === 'black' || stroke === '#000' || stroke === '#000000') {
          el.setAttribute('stroke', foreground)
        } else if (stroke === 'white' || stroke === '#fff' || stroke === '#ffffff') {
          el.setAttribute('stroke', bgColor)
        }
      })
    }
  }, [lick, width, isDark, tabPreferences])

  return (
    <div>
      <div ref={containerRef} />
      {noteAnalyses && noteAnalyses.length > 0 && notePositions.length > 0 && (
        <div className="relative -mt-2" style={{ height: 24 }}>
          {noteAnalyses.map((analysis, i) => {
            if (!analysis.pitch || !notePositions[i]) return null
            const pos = notePositions[i]
            return (
              <span
                key={i}
                className="absolute text-center font-mono text-[10px] font-bold leading-none"
                style={{
                  left: pos.x + pos.width / 2,
                  transform: 'translateX(-50%)',
                  color: ROLE_COLORS[analysis.role] ?? '#888',
                }}
                title={`${analysis.chordToneLabel} of ${analysis.activeChord} (${analysis.role})`}
              >
                {analysis.chordToneLabel}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
})

LickNotation.displayName = 'LickNotation'

export default LickNotation
