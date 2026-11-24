# Sources for chapter 8, "What it costs"

This file was renamed when the series was renumbered on 2026-11-23; chapter numbers inside it are
the old ones (old 1 is now 3, 2 is 4, 3 is 6, 4 is 7, 5 is 9, 6 is 11, 7 is 12, 8 is 13, 9 is 14,
10 is 15).

The research behind this chapter is in `chapter-8-research.md` in this folder: every figure with its
quotation, source, date, what was counted, and a mark (VERIFIED, PARTLY, NOT FOUND). Read on
2026-11-23. That research was gathered through a fetch tool that summarises long pages, so each
quotation there must be checked against the live page before publishing. The two Berkeley Lab
reports were read as PDFs directly.

Every number in the interactive is in `src/lib/ai-series/costs/figures.ts`, with its source.

## Claims in the prose

| Claim | Status | Research entry |
|---|---|---|
| One text answer uses about as much electricity as an LED bulb uses in two minutes | calculation | 0.24 to 0.34 watt-hours (A1a, A1b) divided by a 9-watt bulb (C3, typical, PARTLY) is 1.6 to 2.3 minutes |
| The companies' figures are small, disagree, and are unchecked | verified | A1a: Google says its figures "have not been verified by an independent third-party". A1b: no method published. |
| Data centres used about 1.5% of the world's electricity in 2024 | verified | D1b |
| The IEA expects about 3% by 2030 | verified | D1a, D1b |
| The IEA says AI accounts for almost half of the growth | verified, slightly simplified | D1c: accelerated servers, "mainly driven by AI", are almost half of the net increase to 2030 |
| United States: 4.7% in 2024, nearly 12% expected by 2030 | verified | D2: 192 TWh, 4.7%; reference case 649 TWh, 11.8% |
| What the companies say models learn from; no list published | verified for OpenAI and Anthropic | F1. Not found for Google, Meta, Mistral. |
| June 2025 ruling: training on bought books allowed, downloading pirated books not | news reports | F2. The order itself was not read. |
| The company was Anthropic, which makes the AI that wrote this series | verified | This project |
| $1.5 billion, about $3,000 a book, approved July 2026 | news report | F2: The Next Web, 21 July 2026 |
| September 2026 appeals court ruling against a company that copied a rival's work to build a competing product | news report | F3: Thomson Reuters v. Ross; Nieman Lab, 30 September 2026. Not a chatbot; the chapter does not say it was. |
| New York Times v. OpenAI not decided, as far as could be found | partly | F4: no ruling found as of late October 2026; status after that not found |
| Stanford: ages 22 to 25 in the most exposed jobs about 19% behind; mostly fewer hired; no economy-wide job loss; a pattern, not proof of cause | verified | G1 |
| Denmark: no effect on pay or hours in the first two years | verified | G2. One country. |
| Before 2024 many expected AI fakes to change results; a Columbia review found that did not happen | verified, as relayed | H1 |
| Experiments: a chatbot can shift views by a few points | verified via Cornell's report | H3: 3.9 points in the United States, about 10 in Canada and Poland, among survey participants who knew it was an AI |
| 2026: at least 164 AI-made political ads, at least $80 million, most unlabelled | news report | H4. A later count of 220 ads and $137 million is only partly sourced. |
| No study yet of their effect | not found | H4 |

## Left out on purpose

- A current figure for the electricity one web search uses. The only sourced one is Google's from
  2009.
- The split of data-centre electricity between AI and everything else today; it is only partly
  sourced.
- The Yale Budget Lab and CETaS findings; only summaries were seen.
- Getty Images v. Stability AI; it concerns an image model and is under appeal.

## Before publishing

- Check every quotation in `chapter-8-research.md` against its live page.
- Read the court orders, or cite a legal source that quotes them.
- Look for an assessment of AI in the November 2026 election results, and for a ruling in New York
  Times v. OpenAI.
- These figures go out of date quickly. Print the date read, and recheck before publishing.
