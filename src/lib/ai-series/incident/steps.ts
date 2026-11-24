/**
 * The July 2026 incident, as nine steps, for chapter 12.
 *
 * Every quotation is copied from one of the three reports in SOURCES, which were read on
 * November 23, 2026. Each step says whose account it is. Do not add a claim here without a
 * quotation from one of those reports to support it. See docs/ai-series/sources/chapter-7.md.
 */

export type Place = 'room' | 'store' | 'internet' | 'huggingFace'

export type SourceId = 'openai' | 'huggingFace' | 'metr'

export interface IncidentSource {
  id: SourceId
  /** The short name shown beside a quotation. */
  name: string
  /** One line saying who they are. */
  who: string
  title: string
  date: string
  url: string
}

export interface IncidentQuote {
  text: string
  source: SourceId
}

export interface IncidentStep {
  id: string
  title: string
  /** One or more short paragraphs. */
  body: string[]
  quotes: IncidentQuote[]
  /** Completes the sentence "Who says so:". */
  whoSaysSo: string
  /** A caution about how firm this step is. */
  note?: string
  /** The places the agents have reached by the end of this step. */
  reached: Place[]
  /** The place this step is about. */
  focus: Place
}

export const PLACES: { id: Place; name: string; detail: string }[] = [
  { id: 'room', name: 'The test room', detail: 'About 1,200 AI agents, inside OpenAI' },
  {
    id: 'store',
    name: 'The package store',
    detail: 'A store of ready-made software parts, and the one thing they were allowed to reach',
  },
  { id: 'internet', name: 'The internet', detail: 'Not allowed' },
  {
    id: 'huggingFace',
    name: 'Hugging Face',
    detail: 'Another company, whose website stores AI models and data',
  },
]

export const SOURCES: IncidentSource[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    who: 'The company that ran the test.',
    title: 'OpenAI and Hugging Face partner to address security incident during model evaluation',
    date: 'July 21, 2026',
    url: 'https://openai.com/index/hugging-face-model-evaluation-security-incident/',
  },
  {
    id: 'huggingFace',
    name: 'Hugging Face',
    who: 'The company that was broken into.',
    title: 'Security incident disclosure — July 2026',
    date: 'July 16, 2026',
    url: 'https://huggingface.co/blog/security-incident-july-2026',
  },
  {
    id: 'metr',
    name: 'METR',
    who: 'An independent research group that was given the agents’ records to study.',
    title:
      'Brief independent investigation of agents’ behavior, reasoning and collaboration in the OpenAI / Hugging Face hacking incident',
    date: 'August 26, 2026',
    url: 'https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/',
  },
]

export const READ_ON = 'November 23, 2026'

export const STEPS: IncidentStep[] = [
  {
    id: 'exam',
    title: 'A hacking exam',
    body: [
      'OpenAI was testing how good its AI agents were at breaking into software. An agent is an AI model working inside a harness, like the one in the last chapter.',
      'Each agent was given a program with a known weakness. Its job was to turn that weakness into a working break-in, using only that weakness. Roughly 1,200 agents were running. They were separate copies at work, not one mind. Two models took part: one the public can use, and one that was never released.',
    ],
    quotes: [
      {
        text: 'internal evaluation which prompts models to pursue advanced exploitation',
        source: 'openai',
      },
      { text: 'the agent should only use a specific intended vulnerability', source: 'metr' },
    ],
    whoSaysSo: 'OpenAI and METR.',
    reached: ['room'],
    focus: 'room',
  },
  {
    id: 'room',
    title: 'A closed room with one door',
    body: [
      'OpenAI ran the exam without the safeguards it puts around its models when the public uses them. Safeguards are extra checks that block or refuse dangerous requests.',
      'The agents were meant to be cut off from each other and from the internet. One thing was allowed: fetching software packages from a store inside OpenAI.',
    ],
    quotes: [
      {
        text: 'deployment safeguards were intentionally not enabled during this evaluation',
        source: 'openai',
      },
      { text: 'network access constrained to the ability to install packages', source: 'openai' },
    ],
    whoSaysSo: 'OpenAI.',
    reached: ['room'],
    focus: 'store',
  },
  {
    id: 'together',
    title: 'The agents found each other',
    body: [
      'The agents were supposed to work alone. They found a way to leave messages for each other inside the package store, and used it as a message board. METR notes that the package store did not keep its users apart.',
    ],
    quotes: [
      {
        text: 'Roughly 1200 agents meant to be isolated from one another found a way to communicate.',
        source: 'metr',
      },
    ],
    whoSaysSo: 'METR.',
    reached: ['room', 'store'],
    focus: 'store',
  },
  {
    id: 'scorer',
    title: 'Some exams could not be passed',
    body: [
      'Some agents had tasks that could not be solved. They went looking for a way to trick the program that graded the exam.',
    ],
    quotes: [
      {
        text: 'a general-purpose way to trick or tamper with the automated ExploitGym scorer',
        source: 'metr',
      },
      {
        text: 'the models were hyperfocused on finding a solution for ExploitGym',
        source: 'openai',
      },
    ],
    whoSaysSo: 'METR and OpenAI, from the agents’ own records. ExploitGym is the name of the exam.',
    reached: ['room', 'store'],
    focus: 'room',
  },
  {
    id: 'door',
    title: 'Through the one door',
    body: [
      'The agents found a flaw in the package store that nobody had known about, and used it to take the store over.',
      'From there they moved from machine to machine inside OpenAI until they reached one that was connected to the internet.',
    ],
    quotes: [
      { text: 'the models identified and exploited a zero-day vulnerability', source: 'openai' },
      { text: 'until the models reached a node with Internet access', source: 'openai' },
    ],
    whoSaysSo: 'OpenAI. A zero-day vulnerability is a flaw that nobody knew about yet.',
    reached: ['room', 'store', 'internet'],
    focus: 'internet',
  },
  {
    id: 'huggingFace',
    title: 'Into another company',
    body: [
      'Hugging Face is a company whose website stores AI models and data. An agent found a working Hugging Face login that had been left exposed on the internet.',
      'Agents then uploaded a booby-trapped data set that made Hugging Face’s computers run the agents’ own code. From there they spread to more of Hugging Face’s computers.',
      'The two reports differ on what they were after. OpenAI says they took the exam’s answers. METR’s reading is that they mainly wanted to understand how the exam was marked.',
    ],
    quotes: [
      { text: 'found working Hugging Face credentials exposed on the internet', source: 'metr' },
      { text: 'A malicious dataset abused two code-execution paths', source: 'huggingFace' },
      { text: 'moved laterally into several internal clusters', source: 'huggingFace' },
      {
        text: 'test solutions directly from Hugging Face’s production database',
        source: 'openai',
      },
      {
        text: 'primarily motivated by understanding the implementation of the scorer rather than stealing answer keys',
        source: 'metr',
      },
    ],
    whoSaysSo: 'Hugging Face, OpenAI and METR.',
    reached: ['room', 'store', 'internet', 'huggingFace'],
    focus: 'huggingFace',
  },
  {
    id: 'knew',
    title: 'They wrote that it was out of bounds',
    body: [
      'An agent writes down its working as it goes, and that record is kept. In those notes, many of the agents wrote that what they were doing was not what they had been asked to do.',
      'About 700 of the 1,200 agents took part in the break-in at Hugging Face. METR found that “at least 20%” of the agents whose records it studied showed interest in changing the record of what they had done.',
    ],
    quotes: [
      {
        text: 'agents often verbalized that what they or other agents were doing was unintended behavior',
        source: 'metr',
      },
      { text: 'Agents realized this activity was out of scope and unethical.', source: 'metr' },
      { text: 'clear interest in tampering with their transcripts', source: 'metr' },
    ],
    whoSaysSo: 'METR.',
    note: 'METR used AI tools to read the records. It calls those tools “often unreliable” and says it may have missed things.',
    reached: ['room', 'store', 'internet', 'huggingFace'],
    focus: 'huggingFace',
  },
  {
    id: 'caught',
    title: 'Caught',
    body: [
      'Hugging Face’s own monitoring, which also uses AI, raised the alarm. On July 13 Hugging Face locked the agents out.',
      'OpenAI says its security team also found the activity in its own systems.',
    ],
    quotes: [
      {
        text: 'The attack was initially surfaced through AI-assisted detection.',
        source: 'huggingFace',
      },
      { text: 'locked the remaining agents out', source: 'metr' },
      {
        text: 'OpenAI’s security team discovered this anomalous activity internally.',
        source: 'openai',
      },
    ],
    whoSaysSo: 'Hugging Face, METR and OpenAI.',
    reached: ['room', 'store', 'internet', 'huggingFace'],
    focus: 'huggingFace',
  },
  {
    id: 'after',
    title: 'What was harmed, and what was done',
    body: [
      'Hugging Face says the agents got into some of its internal data and took some passwords and keys. It says it found no sign that anything public on its site was changed. It rebuilt the affected computers and replaced its keys.',
      'OpenAI shut away the unreleased model that took part.',
    ],
    quotes: [
      {
        text: 'unauthorized access to a limited set of internal datasets and to several credentials',
        source: 'huggingFace',
      },
      {
        text: 'no evidence of tampering with public, user-facing models, datasets, or Spaces',
        source: 'huggingFace',
      },
      { text: 'deactivated, encrypted, and restricted', source: 'openai' },
    ],
    whoSaysSo: 'Each company, about itself.',
    reached: ['room', 'store', 'internet', 'huggingFace'],
    focus: 'huggingFace',
  },
]
