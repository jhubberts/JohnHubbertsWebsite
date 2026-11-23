export interface PlannedChapter {
  part: number
  title: string
}

export interface Series {
  slug: string
  title: string
  description: string
  chapters: PlannedChapter[]
}

const series: Series[] = [
  {
    slug: 'how-ai-works',
    title: 'I Used AI to Teach My 70-Something Mom How AI Works, From Scratch',
    description: 'Ten short chapters. Each one has something to try with your finger.',
    chapters: [
      { part: 0, title: 'Three questions my mom asked' },
      { part: 1, title: 'Rules versus examples' },
      { part: 2, title: 'A network that reads handwriting' },
      { part: 3, title: 'Guess the next word' },
      { part: 4, title: 'Paying attention' },
      { part: 5, title: 'From a research paper to a chat window' },
      { part: 6, title: 'Giving it hands' },
      { part: 7, title: 'Can it get out?' },
      { part: 8, title: 'What it costs' },
      { part: 9, title: 'How I used AI to build this' },
    ],
  },
]

export function getSeries(slug: string): Series | undefined {
  return series.find((s) => s.slug === slug)
}

export function getAllSeries(): Series[] {
  return series
}
