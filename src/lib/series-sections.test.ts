import { describe, expect, it } from 'vitest'
import { getSeries, type Series } from '@/lib/series'
import { sectionOf, sectionStartingAt, seriesOutline } from '@/lib/series-sections'

// Chapter 0 is in no section, as an introduction is. Section C holds two chapters, so one of
// them starts it and one does not.
const series: Series = {
  slug: 'example',
  title: 'Example',
  description: '',
  chapters: [0, 1, 2, 3, 4].map((part) => ({ part, title: `Chapter ${part}` })),
  halves: [
    { title: 'First', description: '', sections: [{ title: 'A', description: '', chapters: [1] }] },
    {
      title: 'Second',
      description: '',
      sections: [
        { title: 'B', description: '', chapters: [2] },
        { title: 'C', description: '', chapters: [3, 4] },
      ],
    },
  ],
}

describe('seriesOutline', () => {
  it('numbers sections from 1 across halves', () => {
    // Act
    const numbers = seriesOutline(series).halves.map((half) =>
      half.sections.map((section) => [section.number, section.title]),
    )

    // Assert
    expect(numbers).toEqual([
      [[1, 'A']],
      [
        [2, 'B'],
        [3, 'C'],
      ],
    ])
  })

  it('lists the chapters in no section', () => {
    expect(seriesOutline(series).outside).toEqual([0])
  })

  it('puts every chapter outside sections when a series has no halves', () => {
    // Act
    const outline = seriesOutline({ ...series, halves: undefined })

    // Assert
    expect(outline.halves).toEqual([])
    expect(outline.outside).toEqual([0, 1, 2, 3, 4])
  })
})

describe('sectionOf', () => {
  it('gives the section that holds a chapter', () => {
    expect(sectionOf(series, 4)?.number).toBe(3)
  })

  it('gives no section for a chapter in no section', () => {
    expect(sectionOf(series, 0)).toBeUndefined()
  })
})

describe('sectionStartingAt', () => {
  it('gives the section whose first chapter it is', () => {
    expect(sectionStartingAt(series, 3)?.number).toBe(3)
  })

  it('gives no section for a chapter after the first in its section', () => {
    expect(sectionStartingAt(series, 4)).toBeUndefined()
  })
})

describe('the AI series', () => {
  it('puts every chapter after the introduction in exactly one section, in order', () => {
    // Arrange
    const aiSeries = getSeries('how-ai-works')!

    // Act
    const outline = seriesOutline(aiSeries)
    const inSections = outline.halves.flatMap((half) =>
      half.sections.flatMap((section) => section.chapters),
    )

    // Assert
    expect(outline.outside).toEqual([0])
    expect([0, ...inSections]).toEqual(aiSeries.chapters.map((chapter) => chapter.part))
  })
})
