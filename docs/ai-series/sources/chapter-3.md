# Sources for chapter 3, "Guess the next word"

Checked on 2026-11-23 unless noted.

| Claim in the chapter | Status | Source |
|---|---|---|
| Every word, likelihood and continuation shown | verified | Recorded from GPT-2 (`gpt2`, 124,439,808 numbers, MIT licence) by `tools/ai-series/record_language.py` into `src/lib/ai-series/language/`. Two runs gave identical files. |
| A choice shown as one word may be several of the model's word pieces joined | verified | The script joins a piece to the next when the model rates the continuation above 0.5, and multiplies their likelihoods. Such choices are marked "built from n pieces". |
| "Every other word put together" is often the biggest row | verified | At the first step it is 81, 90 and 86 in 100 for three of the five starting texts |
| Always taking the top word makes the writing flat and repetitive | verified | The recorded continuations at the lowest setting repeat themselves, for example "It's a lot of fun ... It's a lot of fun" |
| 65 continuations recorded, 56 shown, 9 left out, with reasons | verified | `dice.json`: `recorded`, `shown`, `leftOut`. The coordinator read all 65. The left-out text is in no file under `src/`. |
| The same question can get two different answers because the choice is made fresh each time | author's knowledge | How sampling works. No citation gathered. |
| The phone keyboard's next-word suggestions are a small language model | author's knowledge | No citation gathered. Add one or soften. |
| A page of text is this step repeated hundreds of times | author's estimate | A page is several hundred words |
| 768 numbers for each word | verified | `word-map.json`, `dimensions`; GPT-2's embedding size |
| 248 words; nearest words; groups | verified | `word-map.json`. 239 of 248 words have a nearest word from the same group. |
| Words used in similar ways end up with similar numbers | verified for this data | As above |
| GPT-2 learned from eight million web pages | verified, secondary source | Wikipedia, "GPT-2": "a dataset of 8 million web pages" |
| OpenAI released GPT-2 in 2019 | verified, secondary source | Wikipedia, "GPT-2": "first announced on 14 February 2019"; full release 5 November 2019 |
| GPT-3 came a year later and had about 1,400 times as many numbers | verified, secondary source, plus arithmetic | Wikipedia, "GPT-3": released 2020, "GPT-3 has 175 billion parameters". 175,000,000,000 divided by 124,439,808 is about 1,406. |

Notes:

- The map's dots are spread to fill the square for display (`spreadToFill` in
  `src/lib/ai-series/language/word-map.ts`). The list of nearest words is unaffected.
- GPT-2's writing includes crude and offensive text. Only the continuations in `dice.json` and the
  choices in `next-words.json` are shown; the coordinator read every one of them.
