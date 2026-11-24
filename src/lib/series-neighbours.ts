import type { PlannedChapter } from '@/lib/series'

/**
 * The chapters just before and just after `part` in a series, by chapter number. A part that is not
 * in the list still gets the nearest chapter on each side.
 */
export function seriesNeighbours(
  chapters: readonly PlannedChapter[],
  part: number,
): { previous: PlannedChapter | undefined; next: PlannedChapter | undefined } {
  let previous: PlannedChapter | undefined
  let next: PlannedChapter | undefined
  for (const chapter of chapters) {
    if (chapter.part < part && (!previous || chapter.part > previous.part)) previous = chapter
    if (chapter.part > part && (!next || chapter.part < next.part)) next = chapter
  }
  return { previous, next }
}
