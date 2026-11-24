import type { Series, SeriesHalf, SeriesSection } from '@/lib/series'

/** A section with the number readers see, as in "Part 3". */
export interface NumberedSection extends SeriesSection {
  number: number
}

/** A half whose sections carry their numbers. */
export interface NumberedHalf extends Omit<SeriesHalf, 'sections'> {
  sections: NumberedSection[]
}

/** A series' halves and sections, numbered, with the section that holds each chapter. */
export interface SeriesOutline {
  halves: NumberedHalf[]
  /** Chapters in no section, such as an introduction, in series order. */
  outside: number[]
  sectionByChapter: ReadonlyMap<number, NumberedSection>
}

const outlines = new WeakMap<Series, SeriesOutline>()

/**
 * The series' outline, with sections numbered from 1 across halves; a series without halves has
 * every chapter outside sections. Each series object's outline is built once and shared by every
 * caller, so callers must not change it.
 */
export function seriesOutline(series: Series): SeriesOutline {
  const cached = outlines.get(series)
  if (cached) return cached
  let number = 0
  const halves = (series.halves ?? []).map((half) => ({
    ...half,
    sections: half.sections.map((section) => ({ ...section, number: ++number })),
  }))
  const sections = halves.flatMap((half) => half.sections)
  const sectionByChapter = new Map(
    sections.flatMap((section) => section.chapters.map((part) => [part, section] as const)),
  )
  const outside = series.chapters
    .map((chapter) => chapter.part)
    .filter((part) => !sectionByChapter.has(part))
  const outline = { halves, outside, sectionByChapter }
  outlines.set(series, outline)
  return outline
}

/** The section that holds chapter `part`, if any. */
export function sectionOf(series: Series, part: number): NumberedSection | undefined {
  return seriesOutline(series).sectionByChapter.get(part)
}

/** The section whose first chapter is `part`, if `part` starts one. */
export function sectionStartingAt(series: Series, part: number): NumberedSection | undefined {
  const section = sectionOf(series, part)
  return section?.chapters[0] === part ? section : undefined
}
