/**
 * Chapter 5's "No one big brain": four steps showing where a chat model runs when people use it.
 *
 * Every factual sentence here is checked in docs/ai-series/sources/chapter-5.md (section "Is it a
 * bunch of computers?"). The three messages are made up for the page and say so.
 */

export type BrainPicture = 'messages' | 'copies' | 'chips' | 'forget'

export interface BrainStep {
  id: BrainPicture
  title: string
  /** One or more short paragraphs. */
  body: string[]
}

/** Three made-up messages from three different people. */
export const BRAIN_MESSAGES: string[] = [
  'What can I cook with leeks?',
  'Help me write a birthday card for my sister.',
  'Why does the sea have tides?',
]

/** How many chips the one-copy picture shows, from the public example in step 3. */
export const CHIPS_IN_ONE_COPY = 16

export const BRAIN_STEPS: BrainStep[] = [
  {
    id: 'messages',
    title: 'Three people send a message',
    body: [
      'Three people, in three different places, send a message at the same moment. The messages are made up for this page.',
    ],
  },
  {
    id: 'copies',
    title: 'Each goes to a copy',
    body: [
      'Services like this run many copies of the same model file, on many computers, sometimes in different places. Each message goes to a copy that has room for it.',
      'The copies do not share their work. Each one does the same job on its own.',
    ],
  },
  {
    id: 'chips',
    title: 'One copy, many chips',
    body: [
      'A large model is too big for one computer chip. So a single copy is spread across several chips, sometimes in more than one machine. Those chips do work together, on the messages that this one copy is handling.',
      'One large model, published for anyone to use, needed 16 chips, in two machines, to run at full size.',
    ],
  },
  {
    id: 'forget',
    title: 'Then it keeps nothing',
    body: [
      'A copy can work on several people’s messages at the same time, and it keeps each one separate. When an answer is finished, the copy holds nothing of it.',
      'Your next message may go to a different copy. That does not matter, because the whole conversation is sent again each time.',
    ],
  },
]
