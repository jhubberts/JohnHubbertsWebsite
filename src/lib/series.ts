export interface PlannedChapter {
  part: number
  title: string
}

/** Consecutive chapters under one heading, shown to readers as "Part 1", "Part 2" and so on. */
export interface SeriesSection {
  title: string
  /** One sentence on what the chapters cover. */
  description: string
  /** The chapter numbers in the section, in order. */
  chapters: number[]
}

/** Consecutive sections under one larger heading, such as "How it works". */
export interface SeriesHalf {
  title: string
  description: string
  sections: SeriesSection[]
}

export interface Series {
  slug: string
  title: string
  /** A few words naming the series where its full title does not fit, such as a top bar. */
  shortTitle?: string
  description: string
  chapters: PlannedChapter[]
  /** Groups of sections. Chapters in no section, such as the introduction, are listed first. */
  halves?: SeriesHalf[]
}

const series: Series[] = [
  {
    slug: 'how-ai-works',
    title: 'I Used AI to Teach My 70-Something Mom How AI Works, From Scratch',
    shortTitle: 'How AI Works',
    description:
      'Twenty short chapters, from the first computers to today’s AI. Most have something to try with your finger.',
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
      { part: 14, title: 'Models anyone can download' },
      { part: 15, title: 'Who pays for it?' },
      { part: 16, title: 'Use more, then less' },
      { part: 17, title: 'How I used AI to build this' },
      { part: 18, title: 'So is it worth it?' },
      // Not written yet. John will write this one himself; until its page exists the series
      // pages list it as "coming".
      {
        part: 19,
        title: 'Epilogue: John Hubberts’ Very Human Thoughts About This Whole Thing',
      },
    ],
    halves: [
      {
        title: 'How it works',
        description:
          'From the first machines that followed instructions to the AI in a chat window.',
        sections: [
          {
            title: 'Before AI: how a computer works',
            description: 'What a program is, and how a machine holds a number.',
            chapters: [1, 2],
          },
          {
            title: 'Learning from examples',
            description:
              'How a machine learns from examples instead of rules, and what that does with words, proteins and weather.',
            chapters: [3, 4, 5, 6, 7, 8],
          },
          {
            title: 'From a model to your screen',
            description:
              'What happens when you type into a chat, where the AI runs, and what it can reach.',
            chapters: [9, 10, 11, 12],
          },
        ],
      },
      {
        title: 'What it means',
        description: 'What AI costs, who pays for it, and whether it is worth it.',
        sections: [
          {
            title: 'What it costs the rest of us',
            description:
              'Electricity, copyright, jobs and elections, and the money behind the companies.',
            chapters: [13, 14, 15, 16],
          },
          {
            title: 'This series, and whether it was worth it',
            description: 'How I made this series with AI, and whether I think it was worth it.',
            chapters: [17, 18, 19],
          },
        ],
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
