# Sources for chapter 10, "So is it worth it?"

This file was renamed when the series was renumbered on 2026-11-23; chapter numbers inside it are
the old ones (old 1 is now 3, 2 is 4, 3 is 6, 4 is 7, 5 is 9, 6 is 11, 7 is 12, 8 is 13, 9 is 14,
10 is 15).

Added on 2026-11-23 at John's request, after he said the series ended on a dire note. Most of this
chapter is John's own experience and judgment, taken from a message he wrote and reworded plainly.
Nothing in it may identify the series' reader, and his employer is not named.

| Claim | Status | Basis |
|---|---|---|
| The series was made in one day | verified | Commits and session record, 2026-11-23 |
| He was doing his regular job the whole time, looking over now and then | John's statement | "in the background, while also doing my full time job" |
| He could have built every piece by hand; it would have taken many hours of tedious work; he would not have started | John's statement | "many hours of tedious labor"; "in the past I wouldn't have because the opportunity cost of the idea was so much larger than the payoff" |
| Trying an idea now costs almost nothing | John's statement | "Now the opportunity cost is practically nothing" |
| His company has fewer than fifty people and does what a few hundred would have a few years ago | John's judgment; the page says so | He gave the ranges 1 to 50 and 251 to 500. Not measured |
| He spends less time face to face with co-workers and misses it | John's statement | "that's a bummer" |
| He gives these systems more trust than he can fully defend | John's statement | From his answer about the harness setting, in chapter 9 |
| Learning to code took years of school and was hard | John's statement | "took a lot of schooling and was hard as hell" |
| Someone who cannot code could get most of the way, and would get stuck where he knew what to look for | Claude's wording, put to John | John wrote "could just as easily have". Claude proposed the narrower claim, citing the touch-drag fault and the missed news story, and John chose this direction after seeing it |
| The list of things to try and their chapters | verified | `src/lib/ai-series/making/made.ts`, checked against each chapter's page |
| 2 language models copied and run; 1 network trained in about 15 seconds | verified | GPT-2 and BERT; `tools/ai-series/train_digits.py` |
| 15 pretend readers | verified at the time of writing | 13 before this chapter, 2 for it. Update if more are run |
| "What follows is mine. I wrote it to Claude in my own words, and Claude made it plainer." | verified | John's message of 2026-11-23, in the session record. Added because a reader doubted whose words "I miss that" were |
| Trying an idea costs him almost no time; "It still costs what chapter 8 counted" | John's statement, narrowed after the reader test | Readers said "costs almost nothing" contradicted chapter 8 |
| "Chapter 8 has the other side of it: the people who are not hired." | pointer to chapter 8 | The Stanford hiring finding in `chapter-8.md`. Added by Claude after both readers connected the two; it states no view of John's |
| He cannot say what the day used in electricity; no published figure from the company that makes Claude | verified | Chapter 8: "I could not find any published figure from Anthropic" |
| A plain chat is the place to start; it can only write text to you | from chapter 7 | Chapter 7, "What this means for you" |

## Reader test (2026-11-23)

Two blind readers read chapters 9 and 10 after a copy-edit of each. Chapter 10 scored 2 and 3 of 5
on "too much". Both said the ending was earned and both objected to "costs almost nothing", to the
company-size sentence standing alone after chapter 8's jobs findings, and to the length of the list
(now one compact line per item). Not acted on: one reader would cut the company-size sentence
altogether; it stays because it is John's point, with the pointer to chapter 8 added.

## It is not only me (added 2026-11-23 at John's request)

Researched by an agent on 2026-11-23. Several quotations came through a summarizing fetch tool;
paste-check before quoting directly (the page paraphrases).

| Claim | Status | Basis |
|---|---|---|
| Mid-2026: 90 in 100 professional programmers used AI agents at work at least weekly, 68 daily | verified | JetBrains Research, Aug 2026: "As of May–July 2026, 90% of professional developers were using AI coding agents at work at least weekly ... with 68% using them daily." |
| Google: 75 in 100 lines of new code are written by AI and approved by engineers; company figure | verified as Google's claim | Pichai, Cloud Next, Apr 22, 2026: "75% of all new code at Google is now AI-generated and approved by engineers" |
| 2025 trial: experienced programmers took 19% longer while believing 20% faster | verified | METR, July 2025: "they take 19% longer"; "they still believed AI had sped them up by 20%". 16 developers, 246 tasks |
| Early 2026 repeat: they think programmers are now faster but could not measure by how much | verified | METR, Feb 24, 2026: data is "an unreliable signal"; developers "are more sped up from AI tools now"; "only very weak evidence for the size" |
| 2025: more distrust accuracy (46 in 100) than trust it (33 in 100) | verified | Stack Overflow 2025: "More developers actively distrust the accuracy of AI tools (46%) than trust it (33%)" |
| US job postings for programmers about a fifth below early 2020; most of the recent rise for experienced people | verified | FRED IHLIDXUSTPSOFTDEVE = 81.7 on 2026-11-13 (Feb 2020 = 100). Indeed Hiring Lab, July 2026: "71% of the increase ... between May 2025 and May 2026 is from senior roles" |

Left out on purpose: the 2023 Copilot "55.8% faster" lab result and the 26% field result (older
completion tools); code-quality reports from vendors (GitClear, Veracode); METR time-horizon and
SWE-bench figures (judged too technical for the reader).

After the reader test (2026-11-23): the Google bullet was cut ("parts of its new code" was vague and
is the company's own claim). The 2026 METR sentence now says they "could not get a reliable answer,
though they now think programmers are faster", matching METR's "unreliable signal". Added in John's
voice: "That trial is a warning about claims like mine. Those programmers felt faster and were
slower, and I have not measured myself." This follows from his own "my own judgment, and not a
measurement"; John has not yet seen it. "17 pretend readers": two more read chapters 4, 5 and 10.
