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
    description:
      'Seventeen short chapters, from the first computers to today’s AI. Most have something to try with your finger.',
    chapters: [
      { part: 0, title: 'Questions my mom asked' },
      { part: 1, title: 'A machine that follows instructions' },
      { part: 2, title: 'Switches that count' },
      { part: 3, title: 'Rules versus examples' },
      { part: 4, title: 'A network that reads handwriting' },
      { part: 5, title: 'Where the examples come from' },
      { part: 6, title: 'Guess the next word' },
      { part: 7, title: 'Paying attention' },
      { part: 8, title: 'Beyond words' },
      { part: 9, title: 'Inside a chat window' },
      { part: 10, title: 'Where it runs' },
      { part: 11, title: 'Giving it hands' },
      { part: 12, title: 'Can it get out?' },
      { part: 13, title: 'What it costs' },
      { part: 14, title: 'How I used AI to build this' },
      { part: 15, title: 'So is it worth it?' },
      // Not written yet. John will write this one himself; until its page exists the series
      // pages list it as "coming".
      {
        part: 16,
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
