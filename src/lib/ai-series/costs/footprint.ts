import type { Basis, WaterFigure } from './figures'

/**
 * Rounds a positive number to two significant figures and writes it with thousands separators,
 * keeping only the decimals the rounding leaves: 37.5 → "38", 1616.6 → "1,600", 0.3103 → "0.31".
 */
export function twoSignificant(n: number): string {
  if (n === 0) return '0'
  const rounded = Number(n.toPrecision(2))
  const exponent = Math.floor(Math.log10(Math.abs(rounded)))
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.max(0, 1 - exponent),
  })
}

/**
 * How many chat answers use the same electricity as an everyday thing, and the words for it:
 * "= about 38 answers", or "= about 1 answer" when the count is below 1.5.
 */
export function answersFor(
  comparisonWattHours: number,
  answerWattHours: number,
): { count: number; shown: string; wording: string } {
  const count = comparisonWattHours / answerWattHours
  if (count < 1.5) return { count, shown: '1', wording: '= about 1 answer' }
  const shown = twoSignificant(count)
  return { count, shown, wording: `= about ${shown} answers` }
}

const WATT_HOURS_PER_TERAWATT_HOUR = 1e12
const DAYS_PER_YEAR = 365

/** Terawatt-hours used by a year of answers at `questionsPerDay`, each using `answerWattHours`. */
export function yearlyTerawattHours(questionsPerDay: number, answerWattHours: number): number {
  return (questionsPerDay * answerWattHours * DAYS_PER_YEAR) / WATT_HOURS_PER_TERAWATT_HOUR
}

/** The k in "1 part in k": how many times `yearlyTWh` goes into `worldTWh`, unrounded. */
export function partOfWorld(yearlyTWh: number, worldTWh: number): number {
  return worldTWh / yearlyTWh
}

/** The small tag shown for how firm a figure is, or null for a basis this page does not tag. */
export function basisTag(basis: Basis): string | null {
  if (basis === 'company') return 'The company’s own figure'
  if (basis === 'independent') return 'An outside estimate'
  return null
}

/** The smallest and largest amounts across the water figures, counting both ends of a range. */
export function waterSpread(figures: readonly WaterFigure[]): {
  smallest: number
  largest: number
} {
  const amounts = figures.flatMap((figure) =>
    Array.isArray(figure.millilitres) ? figure.millilitres : [figure.millilitres],
  )
  return { smallest: Math.min(...amounts), largest: Math.max(...amounts) }
}

/** `text` with its first letter capitalized: "about 3%" → "About 3%". */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * The one-line summary of "Now add it all up" for a chosen figure: how a year of
 * `questionsPerDay` answers at `answerWattHours` compares with `worldTWh`.
 */
export function addItUpSummary(
  questionsPerDay: number,
  answerWattHours: number,
  worldTWh: number,
): string {
  const part = partOfWorld(yearlyTerawattHours(questionsPerDay, answerWattHours), worldTWh)
  return (
    `A year of ChatGPT’s questions at this figure is about 1 part in ${twoSignificant(part)} ` +
    'of what all data centers used.'
  )
}

/** The one-line summary of "How much all data centers use", from the 2024 and 2030 shares. */
export function totalsSummary(share2024: string, share2030: string): string {
  return `${capitalizeFirst(share2024)} in 2024. Expected by 2030: ${share2030}.`
}

/**
 * The one-line summary of "Water for one answer": from the figure with the smallest amount (the
 * low end of a range counts) to the figure with id `upperId`, in kitchen terms.
 */
export function waterSummary(figures: readonly WaterFigure[], upperId: string): string {
  const low = (figure: WaterFigure) =>
    Array.isArray(figure.millilitres) ? figure.millilitres[0] : figure.millilitres
  const smallest = figures.reduce((least, figure) => (low(figure) < low(least) ? figure : least))
  const upper = figures.find((figure) => figure.id === upperId)
  if (!upper) throw new Error(`no water figure ${upperId}`)
  return `From ${smallest.inKitchenTerms} to ${upper.inKitchenTerms}, depending on what is counted.`
}
