# Restructure plan, 2026-11-23

For the implementing agent. John's view of this plan is a page made from it; this file has every
detail. Nothing here is built yet.

## How to add your own thoughts

To put your own opinion between two paragraphs of any chapter, write it inside a `JohnsThoughts`
box. No import is needed, and Markdown inside it (paragraphs, links, emphasis) works as in the
chapter. The box is labelled "John the Human's Thoughts".

```mdx
<JohnsThoughts>
  I think the scariest part of chapter 12 is how ordinary the mistake was.
</JohnsThoughts>
```

## Why

John, 2026-11-23: "As I've had more and more suggestions for ideas to include, the narrative is gotten
less and less cohesive, and individual chapters are more scattered. We can always re-arrange things
into more chapters." He asked for four things:

1. Training as a subject of its own: "what is training an AI", labeling, how it has evolved.
2. A glossary and cross-linking like the Field Guide at operator.roboto.ai, and author rules taken
   from it, re-run against every chapter.
3. A primer on classic, non-ML programming after chapter 0: Babbage and Ada, Turing, transistors,
   the start of the computer revolution, "someone could come into this article with literally no
   understanding about computing at all". Multiple chapters are fine.
4. Citations in the text that point to the sources; sources collapsed until opened or a citation is
   tapped.

## Proposed outline (17 chapters and a glossary)

Revised 2026-11-23 after John's first review: a chapter of its own for the transformer outside
language, with more detail and AlphaFold at its center ("something animated works too", not every
chapter needs an interactive); and chapter 0 widened from three questions to five, renamed.

Each chapter answers one question, opens with it in bold, and closes with "So ...?". Status: KEEP,
MOVE (renumbered), SPLIT, NEW.

| New | Title                                          | Question it answers                                                   | Source                              | Main thing to try or watch                                                                                              |
| --- | ---------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 0   | Questions my mom asked                         | What are we trying to answer?                                         | KEEP 0, widened to five questions   | Your guesses, before (five)                                                                                             |
|     | **Part 1. Before AI: how a computer works**    |                                                                       |                                     |                                                                                                                         |
| 1   | A machine that follows instructions            | What is a program?                                                    | NEW                                 | Be the computer: carry out a short program step by step                                                                 |
| 2   | Switches that count                            | How does a machine hold a number?                                     | NEW                                 | Flip eight switches to make a number; relays to tubes to transistors to chips                                           |
|     | **Part 2. Learning from examples**             |                                                                       |                                     |                                                                                                                         |
| 3   | Rules versus examples                          | When is a rule not enough?                                            | MOVE 1                              | Sort the flowers                                                                                                        |
| 4   | A network that reads handwriting               | What is a neural network?                                             | MOVE 2                              | Draw a digit, Watch it learn, Fool it                                                                                   |
| 5   | Where the examples come from                   | What does "training the AI to do your job" mean? Is it like teaching? | NEW                                 | Label the flowers yourself, mislabel some, watch the wrong line                                                         |
| 6   | Guess the next word                            | What does a language model do?                                        | MOVE 3                              | Autocomplete, The dice, Word map                                                                                        |
| 7   | Paying attention                               | What changed in 2017?                                                 | MOVE 4, minus "Not only words"      | What does "it" mean?                                                                                                    |
| 8   | Beyond words                                   | What else can the same design do?                                     | NEW, grown from "Not only words"    | Watch it: an animation of a protein chain folding, labelled as an illustration; then DNA, weather, robots, each briefly |
|     | **Part 3. From a model to your screen**        |                                                                       |                                     |                                                                                                                         |
| 9   | Inside a chat window                           | Is it in the AI?                                                      | MOVE 5, minus the inference section | What the model receives                                                                                                 |
| 10  | Where it runs                                  | Is it spread across a bunch of computers?                             | SPLIT from 5                        | No one big brain                                                                                                        |
| 11  | Giving it hands                                | Will it take over your computer?                                      | MOVE 6                              | You are the harness                                                                                                     |
| 12  | Can it get out?                                | Is it trying to get out?                                              | MOVE 7                              | The incident, step by step                                                                                              |
|     | **Part 4. What it costs, and what it's worth** |                                                                       |                                     |                                                                                                                         |
| 13  | What it costs                                  | What does it cost?                                                    | MOVE 8                              | One question's footprint                                                                                                |
| 14  | How I used AI to build this                    | Who made this, then?                                                  | MOVE 9                              | How it was built                                                                                                        |
| 15  | So is it worth it?                             | Is it worth it?                                                       | MOVE 10                             | What one day made; your questions, again (five)                                                                         |
| 16  | Epilogue                                       | (John writes it)                                                      | coming                              |                                                                                                                         |
| —   | Glossary                                       |                                                                       | NEW                                 |                                                                                                                         |

Update, 2026-11-24: three new chapters were inserted, 14 "Models anyone can download", 15 "Who
pays for it?" and 16 "Use more, then less". Rows 14 to 16 above are now chapters 17 ("How I used AI
to build this"), 18 ("So is it worth it?") and 19 (the epilogue).

Chapter 0's five questions, each answered by one chapter:

| Question                                                                                                                                     | Answered in |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Is it in the AI?                                                                                                                             | 9           |
| Is it spread across a bunch of computers?                                                                                                    | 10          |
| What does "training the AI to do your job" mean? Is it like teaching? (asked when John's cousin saw a temporary job posting for AI training) | 5           |
| Will it take over your computer?                                                                                                             | 11          |
| Is it trying to get out?                                                                                                                     | 12          |

John: "There may be many more questions, but we can start with those 5." The guess storage
(`src/lib/ai-series/guesses.ts`, key `how-ai-works.guesses.v1`) gains two questions; answers already
stored for the first three must survive. Chapter 0's title becomes "Questions my mom asked" and its
address changes with the rest (decision 1). Chapter 5 must research what AI-training job postings
ask people to do (writing and grading answers, labeling, recording themselves), with sources, and
answer "is it like teaching?" directly: where it is like teaching (examples, correction) and where
not (no understanding checked, the learner is changed by arithmetic, the teacher may be training a
replacement).

Chapter 8 should research and verify: how AlphaFold 2 was trained (the Protein Data Bank's solved
structures), what "predicted" means and how accurate it is (CASP14), the database and who uses it,
the Nobel; then shorter sections on AlphaGenome, ESM3, weather (ECMWF AIFS), robots (RT-1 and RT-2,
with the unseen-task figures). The facts already verified are in `sources/chapter-4.md`. The
animation must be labelled as a drawing, not a real folding path.

What moves between chapters:

- Chapter 5 (new, training) takes over the training material now spread across old chapters 1, 2,
  3 and 5: guess-check-adjust, practice on examples, "train its models (to adjust their numbers)".
  Those chapters keep one sentence and link to it. To research for it: who labeled MNIST and
  ImageNet and how; crowd work and its pay; learning without labels (next-word practice needs none);
  people ranking chatbot answers (reinforcement learning from human feedback); AI labeling AI; data
  licensing (link to chapter 12, not repeat).
- Chapter 9 loses "Is it a bunch of computers?" and "No one big brain" to chapter 10. Chapter 10
  gains a little on why a model is too big for a phone, and on local models.
- Chapter 7 loses "Not only words" to chapter 8.
- Chapter 0's "eleven short chapters" and the "So is it worth it?" counts follow the new outline.

## Glossary and cross-links

Modeled on the Field Guide (`/Users/roboto/projects/hosted-app/packages/operator_hub/web/guide/`,
`src/guide/EntryLink.tsx`): a term links to its entry and shows its summary on hover.

- Data: `src/lib/ai-series/glossary.ts`, one entry per term: `id`, `term`, `aka`, `summary` (one
  sentence, at most 200 characters, stands alone), `chapter` (where it is explained), `more` (one to
  three short paragraphs for the glossary page).
- In MDX: `<Term id="model">model</Term>`. On a phone, a tap opens a small card with the summary and
  "Explained in chapter N"; a second tap or tapping outside closes it. On desktop, hover also opens
  it. Link a term the first time it appears in a chapter, not every time.
- A glossary page at `/series/how-ai-works/glossary`, alphabetical, each entry with its chapter link
  and the chapters that use it (computed from the MDX at build time).
- A test fails if a `<Term id>` names no entry, or an entry's `chapter` has no `<Term>` for it.
- First list of terms (to refine while writing): program, code, computer, chip, transistor, binary,
  file, data, model, rule, example, label, training, practice, neural network, unit, network,
  language model, word piece, next word, transformer, attention, pattern, parameter (shown as
  "number"), chat system, inference, copy, harness, agent, request, safeguard, data center,
  watt-hour, open model, local model, company record, AI system.

## Citations

- Write sources as GFM footnotes (`[^name]` after the sentence, `[^name]: ...` at the end), as the
  Field Guide does. `remark-gfm` is already in `vite.config.ts`, so the markup works today.
- Render: superscript numbers in the text; the footnotes section titled "Sources" starts collapsed
  (`<details>`); tapping a number opens it and scrolls to that source, and the source's back-arrow
  returns to the sentence. Override the footnote section and links through the MDX components map.
- Cite every specific number, date, named fact, quotation and claim about a company's rules. A
  general explanation needs one source for the section. Use the `docs/ai-series/sources/chapter-N.md`
  rows, which already hold the URLs and quotations.
- Convert the existing "Sources" bullet lists in chapters 1 to 10.

## Author guide

A new `docs/ai-series/AUTHOR-GUIDE.md`, from the Field Guide README plus what the blind readers asked
for in every round. Then `/copy-edit` every chapter with it as the directive, one editor per chapter,
and blind readers again.

From the Field Guide: say what the thing is in the first two sentences, in words the reader already
knows; explain by mechanism and example; plain literal words, no metaphor, no drama, no praise of the
technology; real numbers with units; define a term the first time it appears, or link it; short
paragraphs, bullets for parallel things, a table when items share fields; check every fact against a
primary source; if sources disagree, say so.

From the readers: the first sentence of every paragraph carries its point (a tired reader reads only
those); never point at something on the page the reader may not have opened ("the last row", "if you
pressed"); one comparison per idea and keep it (pharmacist or lock, not both); say who a company or
name is the first time it appears; label the author's opinion as his; a figure that cuts against the
author's claim is answered, not left standing; under about 700 words of prose and about 7 phone
screens; the first thing to try within the first screen.

## Decisions that are John's

1. Chapter addresses. The chapter number is in each address (`/blog/how-ai-works-3-...`), and the
   series is public. Options: (a) new numbered addresses, with the old ones redirected; (b) addresses
   without numbers from now on, with the old ones redirected. Claude recommends (b): a later insert
   then never changes an address again.
2. (Settled direction 2026-11-23: five questions; a chapter beyond words.) History: two chapters (as above) or one. Claude recommends two: one on programs, one on hardware.
3. Order of work. Claude recommends: author guide and citations/glossary mechanics first (they touch
   every chapter), then the three new chapters, then the split, then copy-edit and readers over all.

## What this rests on

Checked: the Field Guide README, a concept page, a glossary page and `EntryLink.tsx`; `remark-gfm`
in `vite.config.ts`; the series registry in `src/lib/series.ts` takes any part numbers; chapters 1 to
10 each have a Sources list (0, 6 and 7 have no outside links).

Not checked: whether Amplify's rewrite rules can redirect the old addresses (the app already uses a
`404-200` rewrite, so rules exist); how many phone screens the new chapters will be; any fact for the
new chapters (none researched yet).
