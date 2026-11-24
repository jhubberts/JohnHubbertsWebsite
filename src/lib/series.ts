export interface PlannedChapter {
  part: number
  title: string
}

export interface Series {
  slug: string
  title: string
  /** A few words naming the series where its full title does not fit, such as a top bar. */
  shortTitle?: string
  description: string
  chapters: PlannedChapter[]
}

const series: Series[] = [
  {
    slug: 'how-ai-works',
    title: 'I Used AI to Teach My 70-Something Mom How AI Works, From Scratch',
    shortTitle: 'How AI Works',
    description: 'Eleven short chapters. Each one has something to try with your finger.',
    chapters: [
      { part: 0, title: 'Three questions my mom asked' },
      { part: 1, title: 'Rules versus examples' },
      { part: 2, title: 'A network that reads handwriting' },
      { part: 3, title: 'Guess the next word' },
      { part: 4, title: 'Paying attention' },
      { part: 5, title: 'Inside a chat window' },
      { part: 6, title: 'Giving it hands' },
      { part: 7, title: 'Can it get out?' },
      { part: 8, title: 'What it costs' },
      { part: 9, title: 'How I used AI to build this' },
      { part: 10, title: 'So is it worth it?' },
      // Not written yet. John will write this one himself; until its page exists the series
      // pages list it as "coming".
      {
        part: 11,
        title: 'Epilogue: John Hubberts’ Very Human Thoughts About This Whole Thing',
      },
    ],
  },
]

export function getSeries(slug: string): Series | undefined {
  return series.find((s) => s.slug === slug)
}

export function getAllSeries(): Series[] {
  return series
}

/** The series' short title where it has one, otherwise its full title. */
export function seriesShortName(entry: Series): string {
  return entry.shortTitle ?? entry.title
}
