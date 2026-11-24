/**
 * How the series was built, as eight moments, for chapter 17.
 *
 * Each moment is something that happened while the series was made on November 23, 2026. What
 * John said is copied from his messages. Counts come from the record of the session and from the
 * repository's history. See docs/ai-series/sources/chapter-15.md before changing anything here.
 */

export type CaughtBy = 'john' | 'looking' | 'otherAi' | 'asked'

export interface BuildMoment {
  id: string
  title: string
  /** John's own words from a message, copied exactly. */
  johnSaid?: string
  /** One or more short paragraphs. */
  body: string[]
  /** Who or what caught the problem, or what kept things in order. */
  caughtBy: CaughtBy
  /** Completes the line that starts with the caughtBy label. */
  caughtDetail: string
}

export const CAUGHT_BY_LABEL: Record<CaughtBy, string> = {
  john: 'Caught by me',
  looking: 'Caught by looking at the page',
  otherAi: 'Caught by another AI',
  asked: 'It asked first',
}

export const BUILD_MOMENTS: BuildMoment[] = [
  {
    id: 'request',
    title: 'I asked',
    johnSaid:
      'Like me, she does not do well with reading long form content, and is much more engaged visually, by doing, or by interactivity.',
    body: [
      'I told Claude my mom’s three questions and how she likes to learn. It wrote a plan and asked me a question about it.',
      'My answer was two words: “Ten chapters”.',
    ],
    caughtBy: 'asked',
    caughtDetail: 'Claude put the choice to me before writing anything.',
  },
  {
    id: 'news',
    title: 'The AI was wrong about the news',
    body: [
      'Claude’s first plan said that an AI getting out only happens in films. It did not know about the incident in chapter 12.',
      'A model is a fixed file, as chapter 9 showed. It knows nothing that was written after its practice ended. The incident happened in July 2026, after that.',
      'I sent it a link. It read the three reports and wrote the chapter again.',
    ],
    caughtBy: 'john',
    caughtDetail: 'My mom’s question was closer to right than the AI’s first answer.',
  },
  {
    id: 'readers',
    title: 'Readers who pretended to know nothing',
    johnSaid:
      'I want to make sure that my mom could understand this 100%, that it’s clear, that it reads well in order, that it is not overwhelming',
    body: [
      'Claude gave other AI models a description of the reader and the pages, and nothing else. Claude told them to use none of what they knew about computers.',
      'They found a sentence in chapter 7 that contradicted its own example. They corrected the biology in chapter 4. The counselor with no memory in chapter 9 was their idea.',
      'They said they would stop reading at chapter 7. Chapter 7 was then cut by about a third.',
    ],
    caughtBy: 'otherAi',
    caughtDetail: 'Fifteen pretend readers in all. None of them was a person.',
  },
  {
    id: 'publish',
    title: 'Nothing went public until I said so',
    johnSaid: 'Commit and deploy',
    body: [
      'To commit is to save a set of changes. To deploy is to put them on the public website.',
      'Claude saved its work on my computer as it went. It did not put anything on the public website until I told it to, each time.',
    ],
    caughtBy: 'asked',
    caughtDetail: 'Each time, it waited for me.',
  },
  {
    id: 'finger',
    title: 'What only a finger found',
    johnSaid:
      'When I try to move the chapter 3 line on a touchscreen, the phone pans at the same time that the line moves',
    body: [
      'I tried chapter 3 on my phone. When I dragged the line, the whole page slid along with it.',
      'Every test before that had used a mouse, or a program standing in for a finger.',
    ],
    caughtBy: 'john',
    caughtDetail: 'It took a real finger on a real phone.',
  },
  {
    id: 'realModel',
    title: 'A real model, as it really writes',
    johnSaid: 'Yes, download',
    body: [
      'For chapter 6, Claude wanted to copy a real language model onto my computer and record what it wrote. It was a small, old one, and not Claude. It asked me first, and told me where the copy would come from.',
      'The model was asked to continue 65 story openings. Nine of the results were sexual, violent or crude, because the model had practiced on text from the internet. They were left out, and chapter 6 says so.',
    ],
    caughtBy: 'asked',
    caughtDetail: 'Nothing was copied until I answered.',
  },
  {
    id: 'handing',
    title: 'One AI handed work to others',
    body: [
      'Claude wrote the words. Other Claude models built each thing you tap, and later checked the work. Claude gave each one written instructions.',
      'Each one was told: if the words you were given do not fit the facts, say so, and do not change them. Several did say so.',
    ],
    caughtBy: 'otherAi',
    caughtDetail:
      'One reported that a caption would have said the opposite of the picture above it.',
  },
  {
    id: 'invalidDate',
    title: 'The tests passed and the page was broken',
    body: [
      'The site has small tests that a computer runs by itself. After one change, an AI reported that every test had passed.',
      'On the site, every chapter had lost its title and its date.',
    ],
    caughtBy: 'looking',
    caughtDetail: 'Claude found it only when it opened the page and looked.',
  },
]

/** What the series found for each of the five questions, keyed by the question's id. */
export const SERIES_ANSWERS = {
  inAI: {
    answer:
      'Not in the model. The model is a fixed file, and nothing you send is written into it. The company that runs it does keep a record of the conversation.',
    closest: 'between',
    chapter: 9,
  },
  computers: {
    answer:
      'Many computers, but not one mind. Many copies of the same model file each answer messages on their own, and keep nothing afterward.',
    closest: 'copies',
    chapter: 10,
  },
  training: {
    answer:
      'Training is adjusting a model’s numbers, a little at a time, until its answers match examples that people wrote, checked or ranked. It is like teaching in the examples and the corrections. It is unlike teaching in that nobody checks what the model understands, and the person may be helping it do their own job.',
    closest: 'between',
    chapter: 5,
  },
  takeOver: {
    answer:
      'An AI model can only ask. A harness decides what gets done, and a person sets its rules. It goes wrong when the rules are too loose or the harness has a flaw.',
    closest: 'ifLet',
    chapter: 11,
  },
  getOut: {
    answer:
      'It has happened at least once, in a test with the safeguards switched off. The agents were trying to pass an exam. They were not trying to be free.',
    closest: 'between',
    chapter: 12,
  },
} as const
