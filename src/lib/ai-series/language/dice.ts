export type DiceSample = { sample: number; seed?: number; text: string }

export type DiceSetting = {
  temperature: number
  greedy?: true
  continuations: DiceSample[]
}

export type DiceStart = { text: string; settings: DiceSetting[] }

export type DiceLeftOut = { start: string; temperature: number; sample: number; reason: string }

export type DiceData = {
  model: string
  tokens: number
  recorded: number
  shown: number
  leftOut: DiceLeftOut[]
  starts: DiceStart[]
}

/** What the reader sees for each recorded setting, from the lowest to the highest. */
export const STOP_NAMES = [
  'Always the top word',
  'Mostly likely words',
  'As the model rates them',
  'More long shots',
  'Mostly long shots',
]

/** The continuations shown for a start at a setting, in sample order. */
export function samplesFor(start: DiceStart, settingIndex: number): DiceSample[] {
  return start.settings[settingIndex]?.continuations ?? []
}

/** How many recorded continuations of a start at a setting were left out of the file. */
export function leftOutCount(data: DiceData, start: DiceStart, settingIndex: number): number {
  const setting = start.settings[settingIndex]
  if (!setting) return 0
  return data.leftOut.filter(
    (entry) => entry.start === start.text && entry.temperature === setting.temperature,
  ).length
}
