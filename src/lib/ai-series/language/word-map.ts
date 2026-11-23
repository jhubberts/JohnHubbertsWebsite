/** One word on the map: its place (0..1, y from the top) and its five nearest words. */
export type MapWord = {
  word: string
  group: string
  x: number
  y: number
  nearest: { word: string; similarity: number }[]
}

export type WordMapData = {
  model: string
  dimensions: number
  words: MapWord[]
}

/** Space left around the dots so the ring and edge dots are not cut off by the map's edge. */
export const MAP_PADDING = 16
/** How far (in screen pixels) from a dot a tap still selects it. */
export const TAP_RADIUS = 28

export const SHAPES = ['circle', 'square', 'triangle', 'diamond'] as const
export type Shape = (typeof SHAPES)[number]
export const COLOUR_COUNT = 3

/**
 * The same words with each axis stretched to run from 0 to 1, so the dots fill the square map.
 * The recorded positions keep the projection's own proportions, which leaves the dots crowded
 * into a band on a phone. Stretching an axis changes no word's neighbours on the map by much, and
 * the page already says distances on the map are only roughly right.
 */
export function spreadToFill<T extends Pick<MapWord, 'x' | 'y'>>(words: readonly T[]): T[] {
  if (words.length === 0) return []
  const xs = words.map((w) => w.x)
  const ys = words.map((w) => w.y)
  const [xMin, xMax, yMin, yMax] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ]
  const stretch = (value: number, min: number, max: number) =>
    max === min ? 0.5 : (value - min) / (max - min)
  return words.map((w) => ({ ...w, x: stretch(w.x, xMin, xMax), y: stretch(w.y, yMin, yMax) }))
}

/** Where a word's dot sits, in pixels, on a square map `size` pixels wide. */
export function dotPosition(word: Pick<MapWord, 'x' | 'y'>, size: number) {
  const inner = size - 2 * MAP_PADDING
  return { x: MAP_PADDING + word.x * inner, y: MAP_PADDING + word.y * inner }
}

/**
 * The word whose dot is nearest the point (in pixels on a map `size` wide), or null when no dot is
 * within `radius`. Ties go to the earlier word.
 */
export function nearestWord(
  words: readonly MapWord[],
  point: { x: number; y: number },
  size: number,
  radius: number = TAP_RADIUS,
): MapWord | null {
  let best: MapWord | null = null
  let bestDistance = Infinity
  for (const word of words) {
    const at = dotPosition(word, size)
    const distance = Math.hypot(at.x - point.x, at.y - point.y)
    if (distance <= radius && distance < bestDistance) {
      best = word
      bestDistance = distance
    }
  }
  return best
}

/** How many of the word's nearest words are in its own group. */
export function sameGroupCount(words: readonly MapWord[], word: MapWord): number {
  const groupOf = new Map(words.map((w) => [w.word, w.group]))
  return word.nearest.filter((n) => groupOf.get(n.word) === word.group).length
}

/** Every word, alphabetically. */
export function alphabetical(words: readonly MapWord[]): MapWord[] {
  return [...words].sort((a, b) => (a.word < b.word ? -1 : a.word > b.word ? 1 : 0))
}

/** The group names, in the order each first appears in the data. */
export function groupNames(words: readonly MapWord[]): string[] {
  return [...new Set(words.map((w) => w.group))]
}

/** The shape and colour slot of each group: four shapes times three colours make twelve. */
export function groupMarks(
  names: readonly string[],
): Map<string, { shape: Shape; colour: number }> {
  return new Map(
    names.map((name, i) => [
      name,
      { shape: SHAPES[i % SHAPES.length], colour: Math.floor(i / SHAPES.length) % COLOUR_COUNT },
    ]),
  )
}

/** The word to select when the map first shows. */
export function startingWord(words: readonly MapWord[]): MapWord {
  return words.find((w) => w.word === 'dog') ?? words[0]
}

/**
 * Top-left corner for a label of `width` by `height` pixels next to a dot: to the right of it when
 * that fits, otherwise to the left, then nudged to stay inside a square map `size` wide.
 */
export function labelPosition(
  dot: { x: number; y: number },
  width: number,
  height: number,
  size: number,
  gap = 8,
) {
  const right = dot.x + gap
  const left = dot.x - gap - width
  const x = right + width <= size - 2 ? right : left
  return {
    x: Math.min(Math.max(x, 2), size - width - 2),
    y: Math.min(Math.max(dot.y - height / 2, 2), size - height - 2),
  }
}

/** The text a screen reader gets for the map. */
export function mapLabel(words: readonly MapWord[], selected: MapWord): string {
  return `Map of ${words.length} words. Selected: ${selected.word}. Nearest: ${selected.nearest
    .map((n) => n.word)
    .join(', ')}.`
}
