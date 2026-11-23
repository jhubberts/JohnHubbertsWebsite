/**
 * Every figure shown in chapter 8's interactive, with where it comes from and what it counts.
 *
 * Do not add or change a number here without a source in docs/ai-series/sources/chapter-8.md.
 * `basis` says how firm a figure is:
 *   'company'     the company's own published figure, not checked by anyone outside it
 *   'independent' an outside group's estimate
 *   'official'    a public agency or national laboratory
 *   'calculation' worked out here from physics or from other figures in this file
 *   'typical'     a round, typical value, not a measurement
 */

export type Basis = 'company' | 'independent' | 'official' | 'calculation' | 'typical'

export interface Source {
  /** Who published it, as shown to the reader. */
  publisher: string
  /** When, as shown to the reader. */
  date: string
  url?: string
}

/** One published figure for the electricity one chat answer uses, in watt-hours. */
export interface AnswerFigure {
  id: string
  /** The radio button's label. */
  label: string
  wattHours: number
  /** How the number is shown: "0.24" or "about 0.34". */
  shown: string
  /** One or two plain sentences on what it is and how far to trust it. */
  detail: string
  basis: Basis
  source: Source
}

export const ANSWER_FIGURES: AnswerFigure[] = [
  {
    id: 'google',
    label: 'Google, for its Gemini chatbot',
    wattHours: 0.24,
    shown: '0.24',
    detail:
      'Google’s own figure for a typical text question in May 2025. Nobody outside Google has checked it.',
    basis: 'company',
    source: {
      publisher: 'Google',
      date: 'August 2025',
      url: 'https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference',
    },
  },
  {
    id: 'openai',
    label: 'OpenAI, for ChatGPT',
    wattHours: 0.34,
    shown: 'about 0.34',
    detail:
      'From a blog post by OpenAI’s chief executive in 2025, for an average question. He did not say how it was worked out.',
    basis: 'company',
    source: {
      publisher: 'Sam Altman, OpenAI',
      date: '2025',
      url: 'https://blog.samaltman.com/the-gentle-singularity',
    },
  },
  {
    id: 'epoch',
    label: 'Epoch AI, an independent research group',
    wattHours: 0.3,
    shown: 'about 0.3',
    detail:
      'An outside estimate from February 2025 for one ChatGPT model. Its author says reasonable assumptions give anything from 0.1 to 4.',
    basis: 'independent',
    source: {
      publisher: 'Epoch AI',
      date: 'February 2025',
      url: 'https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use',
    },
  },
  {
    id: 'older',
    label: 'An older estimate, from 2023',
    wattHours: 3,
    shown: 'about 3',
    detail:
      'Widely repeated for years. It assumed much longer questions and answers, and older machines.',
    basis: 'independent',
    source: {
      publisher: 'Alex de Vries, as described by Epoch AI',
      date: '2023',
      url: 'https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use',
    },
  },
]

/** An everyday thing to compare one chat answer with. */
export interface Comparison {
  id: string
  label: string
  wattHours: number
  /** What the number is and how firm it is. */
  detail: string
  basis: Basis
  source?: Source
}

export const COMPARISONS: Comparison[] = [
  {
    id: 'led',
    label: 'An LED light bulb on for one hour',
    wattHours: 9,
    detail: 'A typical bulb that replaces an old 60-watt one uses about 9 watts.',
    basis: 'typical',
  },
  {
    id: 'streaming',
    label: 'One hour of streaming video',
    wattHours: 77,
    detail:
      'The International Energy Agency’s figure for Netflix in 2019. It counts the screen, the network and the data center, and varies a lot with the screen.',
    basis: 'official',
    source: {
      publisher: 'International Energy Agency',
      date: 'December 2020',
      url: 'https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines',
    },
  },
  {
    id: 'kettle',
    label: 'Boiling one liter of water',
    wattHours: 93,
    detail:
      'Worked out from physics: heating a liter of water from 20°C to 100°C (68°F to 212°F). A real kettle uses a little more.',
    basis: 'calculation',
  },
]

/** Requests that are not a plain text question. Shown as facts, not applied to the figures above. */
export interface HeavierRequest {
  id: string
  label: string
  /** The finding, in one or two plain sentences. */
  finding: string
  source: Source
}

export const HEAVIER_REQUESTS: HeavierRequest[] = [
  {
    id: 'thinking',
    label: 'With a “thinking” mode switched on',
    finding:
      'In one test of 40 freely available models, switching it on used about 30 times more electricity on average. For some models the difference was far larger, for others small.',
    source: {
      publisher: 'AI Energy Score project, reported by Fortune',
      date: 'December 2025',
      url: 'https://fortune.com/2025/12/05/ai-reasoning-energy-problem-data-centers-30-times-more-power/',
    },
  },
  {
    id: 'image',
    label: 'Making one picture',
    finding: 'About 0.6 watt-hours for one freely available picture-making model.',
    source: {
      publisher: 'MIT Technology Review',
      date: 'May 2025',
      url: 'https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/',
    },
  },
  {
    id: 'video',
    label: 'Making a five-second video',
    finding:
      'About 940 watt-hours for one freely available video-making model. That is about ten liters of water boiled.',
    source: {
      publisher: 'MIT Technology Review',
      date: 'May 2025',
      url: 'https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/',
    },
  },
]

export const HEAVIER_NOTE =
  'These come from tests of freely available models. The companies behind the big chat systems have not published figures like these.'

/** How many questions a day one large chat system answered. */
export const QUESTIONS_PER_DAY = {
  count: 2_500_000_000,
  shown: '2.5 billion',
  detail: 'Questions sent to ChatGPT each day, according to OpenAI in July 2025.',
  source: {
    publisher: 'OpenAI, reported by TechCrunch',
    date: 'July 2025',
    url: 'https://techcrunch.com/2025/07/21/chatgpt-users-send-2-5-billion-prompts-a-day/',
  } satisfies Source,
}

/** Electricity used by data centers, in terawatt-hours. A terawatt-hour is a trillion watt-hours. */
export interface Total {
  id: string
  label: string
  terawattHours: number
  /** Share of all electricity in that place and year, as shown; omitted where not sourced. */
  share?: string
  detail: string
  basis: Basis
  source: Source
}

export const WORLD_TOTALS: Total[] = [
  {
    id: 'world-2024',
    label: 'All the world’s data centers, 2024',
    terawattHours: 415,
    share: 'about 1.5% of the world’s electricity',
    detail: 'Data centers run the whole internet, not only AI.',
    basis: 'official',
    source: {
      publisher: 'International Energy Agency',
      date: '2025',
      url: 'https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai',
    },
  },
  {
    id: 'world-2025',
    label: 'All the world’s data centers, 2025',
    terawattHours: 485,
    detail: 'Up 17% in one year. Electricity for AI-focused data centers rose by half.',
    basis: 'official',
    source: {
      publisher: 'International Energy Agency',
      date: 'April 2026',
      url: 'https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary',
    },
  },
  {
    id: 'world-2030',
    label: 'Expected for 2030',
    terawattHours: 950,
    share: 'about 3% of the world’s electricity',
    detail: 'A projection. The agency says there is substantial uncertainty.',
    basis: 'official',
    source: {
      publisher: 'International Energy Agency',
      date: 'April 2026',
      url: 'https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary',
    },
  },
]

export const US_TOTALS: Total[] = [
  {
    id: 'us-2024',
    label: 'United States data centers, 2024',
    terawattHours: 192,
    share: '4.7% of the country’s electricity',
    detail: 'Worked out from the equipment sold and installed, not read from meters.',
    basis: 'official',
    source: {
      publisher: 'Lawrence Berkeley National Laboratory',
      date: 'June 2026',
      url: 'https://escholarship.org/uc/item/33m6w3x0',
    },
  },
  {
    id: 'us-2030',
    label: 'Expected for 2030',
    terawattHours: 649,
    share: '11.8% of the country’s electricity',
    detail: 'The laboratory’s middle case. Its range runs from 9.5% to 15.3%.',
    basis: 'official',
    source: {
      publisher: 'Lawrence Berkeley National Laboratory',
      date: 'June 2026',
      url: 'https://escholarship.org/uc/item/33m6w3x0',
    },
  },
]

/** Water for one chat answer, in milliliters. The figures count different things. */
export interface WaterFigure {
  id: string
  label: string
  /** What is counted. */
  counts: string
  /** A single value, or a range. */
  millilitres: number | [number, number]
  shown: string
  /** A kitchen measure, in words. */
  inKitchenTerms: string
  detail: string
  basis: Basis
  source: Source
}

export const WATER_FIGURES: WaterFigure[] = [
  {
    id: 'google',
    label: 'Google, for its Gemini chatbot',
    counts: 'Only water used for cooling at the data center',
    millilitres: 0.26,
    shown: '0.26 milliliters',
    inKitchenTerms: 'about five drops',
    detail: 'Google’s own figure, May 2025. Not checked by anyone outside Google.',
    basis: 'company',
    source: {
      publisher: 'Google',
      date: 'August 2025',
      url: 'https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference',
    },
  },
  {
    id: 'openai',
    label: 'OpenAI, for ChatGPT',
    counts: 'Not stated',
    millilitres: 0.32,
    shown: 'about 0.32 milliliters',
    inKitchenTerms: 'about one fifteenth of a teaspoon',
    detail: 'From the same blog post as its electricity figure. No method was given.',
    basis: 'company',
    source: {
      publisher: 'Sam Altman, OpenAI',
      date: '2025',
      url: 'https://blog.samaltman.com/the-gentle-singularity',
    },
  },
  {
    id: 'mistral',
    label: 'Mistral, a French AI company',
    counts: 'Water over the whole life of the equipment, including making it',
    millilitres: 45,
    shown: '45 milliliters',
    inKitchenTerms: 'about three tablespoons',
    detail:
      'For one answer of medium length. The company calls its study a first approximation and says outside firms reviewed it.',
    basis: 'company',
    source: {
      publisher: 'Mistral',
      date: 'July 2025',
      url: 'https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai',
    },
  },
  {
    id: 'ren',
    label: 'University researchers, about an earlier model',
    counts: 'Cooling water, plus water used at power plants to make the electricity',
    millilitres: [10, 50],
    shown: '10 to 50 milliliters',
    inKitchenTerms: 'a half-liter bottle for every 10 to 50 answers',
    detail:
      'First published in 2023 about GPT-3, a model from 2020. The most quoted water figure, and the oldest.',
    basis: 'independent',
    source: {
      publisher: 'Li, Yang, Islam and Ren',
      date: '2023, revised March 2025',
      url: 'https://arxiv.org/abs/2304.03271',
    },
  },
]

export const US_WATER = {
  directLitres: 66_000_000_000,
  shownDirect: 'about 66 billion liters',
  shownIndirect: 'nearly 800 billion liters',
  detail:
    'United States data centers used about 66 billion liters of water directly in 2023, and nearly 800 billion liters more through the electricity they bought.',
  source: {
    publisher: 'Lawrence Berkeley National Laboratory',
    date: 'December 2024',
    url: 'https://eta-publications.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report',
  } satisfies Source,
}

export const READ_ON = 'November 23, 2026'
