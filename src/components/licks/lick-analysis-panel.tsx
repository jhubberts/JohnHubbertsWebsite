import type { LickAnalysis, NoteRole } from '@/lib/licks'

interface LickAnalysisPanelProps {
  analysis: LickAnalysis
}

const ROLE_COLORS: Record<NoteRole, string> = {
  'chord-tone': '#22c55e',
  'color-tone': '#3b82f6',
  'approach-tone': '#f59e0b',
  'passing-tone': '#ef4444',
  'scale-tone': '#8b5cf6',
}

const ROLE_LABELS: Record<NoteRole, string> = {
  'chord-tone': 'Chord Tone',
  'color-tone': 'Color Tone',
  'approach-tone': 'Approach Tone',
  'passing-tone': 'Passing Tone',
  'scale-tone': 'Scale Tone',
}

const LickAnalysisPanel = ({ analysis }: LickAnalysisPanelProps) => {
  const nonRestNotes = analysis.noteAnalyses.filter((a) => a.pitch)

  // Count roles
  const roleCounts: Partial<Record<NoteRole, number>> = {}
  for (const a of nonRestNotes) {
    roleCounts[a.role] = (roleCounts[a.role] ?? 0) + 1
  }

  return (
    <div className="space-y-4">
      {/* Theory insights */}
      {analysis.theorySummary.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            Why It Works
          </h3>
          <ul className="space-y-1">
            {analysis.theorySummary.map((line, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Note-by-note breakdown */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          Note Analysis
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {nonRestNotes.map((a, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded px-1.5 py-1"
              style={{
                backgroundColor: ROLE_COLORS[a.role] + '18',
                borderLeft: `2px solid ${ROLE_COLORS[a.role]}`,
              }}
            >
              <span className="font-mono text-xs font-semibold">{a.pitch.replace(/\d/, '')}</span>
              <span
                className="font-mono text-[10px] font-bold"
                style={{ color: ROLE_COLORS[a.role] }}
              >
                {a.chordToneLabel}
              </span>
              <span className="text-[9px] text-muted-foreground">{a.scaleDegree}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Legend</h3>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(roleCounts) as NoteRole[]).map((role) => (
            <div key={role} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ROLE_COLORS[role] }}
              />
              <span className="text-xs">
                {ROLE_LABELS[role]} ({roleCounts[role]})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chord substitutions */}
      {analysis.substitutionChords.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            Also Works Over
          </h3>
          <p className="mb-1 text-xs text-muted-foreground">
            Based on the notes in this lick, it could also be played over:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.substitutionChords.map((chord, i) => (
              <span
                key={i}
                className="rounded bg-accent/30 px-2 py-0.5 font-mono text-sm"
              >
                {chord}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LickAnalysisPanel
