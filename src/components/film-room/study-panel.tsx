import { Shuffle } from 'lucide-react'
import { CallBreakdown } from '@/components/film-room/call-breakdown'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  COVERAGES,
  COVERAGE_IDS,
  PRESSURES,
  PRESSURE_IDS,
  callName,
  type CoverageId,
  type PressureId,
} from '@/lib/film-room/defense'
import { COVERAGE_GUIDE, MUG_NOTE } from '@/lib/film-room/glossary'
import { FORMATIONS, FORMATION_IDS, type FormationId } from '@/lib/film-room/offense'
import { pressuresWith, type Play, type PlayRequest } from '@/lib/film-room/play'
import { CONCEPTS, CONCEPT_IDS, type ConceptId } from '@/lib/film-room/routes'

export type StudyChoices = Omit<PlayRequest, 'level'>

function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T | undefined
  options: [T, string][]
  onChange(value: T | undefined): void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <select
        className="bg-background min-h-11 rounded-lg border px-2 text-sm font-normal"
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
      >
        <option value="">Any</option>
        {options.map(([v, name]) => (
          <option key={v} value={v}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

export function StudyPanel({
  play,
  choices,
  onChoices,
  onShuffle,
}: {
  play: Play
  choices: StudyChoices
  onChoices(choices: StudyChoices): void
  onShuffle(): void
}) {
  const { call } = play.defense
  const guide = COVERAGE_GUIDE[call.coverage]
  const concept = CONCEPTS[play.concept]
  const pressures = choices.coverage ? pressuresWith(choices.coverage, 'pro') : PRESSURE_IDS
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Picker<CoverageId>
          label="Coverage"
          value={choices.coverage}
          options={COVERAGE_IDS.map((c) => [c, COVERAGES[c].name])}
          onChange={(coverage) => onChoices({ ...choices, coverage, pressure: undefined })}
        />
        <Picker<PressureId>
          label="Rush"
          value={choices.pressure}
          options={pressures.map((p) => [p, PRESSURES[p].name])}
          onChange={(pressure) => onChoices({ ...choices, pressure })}
        />
        <Picker<ConceptId>
          label="Pass concept"
          value={choices.concept}
          options={CONCEPT_IDS.map((c) => [c, CONCEPTS[c].name])}
          onChange={(concept) => onChoices({ ...choices, concept })}
        />
        <Picker<FormationId>
          label="Formation"
          value={choices.formation}
          options={FORMATION_IDS.map((f) => [f, FORMATIONS[f].name])}
          onChange={(formation) => onChoices({ ...choices, formation })}
        />
      </div>
      <div className="flex min-h-11 items-center gap-2">
        <Checkbox
          id="study-disguise"
          checked={!!choices.disguise}
          onCheckedChange={(checked) => onChoices({ ...choices, disguise: !!checked })}
        />
        <Label htmlFor="study-disguise" className="font-normal">
          Let the defense disguise it
        </Label>
      </div>
      <Button variant="outline" className="min-h-11" onClick={onShuffle}>
        <Shuffle /> Another example
      </Button>

      <div className="bg-muted/50 flex flex-col gap-2 rounded-xl border p-4 text-sm">
        <p className="font-serif text-lg font-semibold">{callName(call)}</p>
        <p className="text-muted-foreground text-xs">Also called: {guide.aka}</p>
        <p>{guide.what}</p>
        <p>
          <span className="font-semibold">Before the snap: </span>
          {guide.beforeSnap}
        </p>
        <p>
          <span className="font-semibold">After the snap: </span>
          {guide.afterSnap}
        </p>
        <p>
          <span className="font-semibold">Where it is weak: </span>
          {guide.weakSpots}
        </p>
        {call.look.mug && <p>{MUG_NOTE}</p>}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border p-4 text-sm">
        <CallBreakdown play={play} heading="On this example" />
        <p>
          <span className="font-semibold">{concept.name}: </span>
          {concept.idea}
        </p>
      </div>
    </div>
  )
}
