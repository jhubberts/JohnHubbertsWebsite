# Sources for chapter 4, "Paying attention"

Checked on 2026-11-23 unless noted.

| Claim in the chapter | Status | Source |
|---|---|---|
| Every number shown in "What does it mean?" | verified | Recorded from BERT (`bert-base-uncased`, Apache-2.0) by `tools/ai-series/record_language.py`. `attention.json` holds all 144 patterns; `attention-shown.json` holds the two views on the page. |
| The pattern shown was chosen because it shows the switch most clearly | verified | Layer 7, head 11, the largest value of [A(it→animal) − A(it→street)] + [B(it→street) − B(it→animal)] among all 144. The page says "We went looking for it." |
| In that pattern "it" draws most on "animal" in the first sentence and "street" in the second | verified | 0.3349 against 0.0602; 0.5812 against 0.0127. Asserted in `attention.test.ts`. |
| The model has 144 patterns | verified | 12 layers of 12 heads, counted from the recorded data |
| In 25 of the 144, "it" draws more on "animal" in the first and more on "street" in the second | verified | `attention-shown.json`, `summary.switching` |
| Averaged over all 144, "it" draws more on "animal" than "street" in both sentences | verified | 0.0968 against 0.0229; 0.0600 against 0.0442 |
| The picture shows where the model looked, not what it understood | author's caution | A widely made point about attention; no citation gathered |
| The two sentences | adapted | From the well-known example "The animal didn't cross the street because it was too tired/wide", with "did not" for "didn't" so that no word splits into pieces. Its original source has not been checked. |
| Researchers at Google published the design in 2017 and called it the transformer | verified, secondary source | Wikipedia, "Attention Is All You Need": "a 2017 research paper"; authors "working at Google"; "introduced a new deep learning architecture known as the transformer" |
| It handles all the words at once and not one after another | verified, secondary source | Same article: "by removing its recurrence to process all tokens in parallel" |
| Every fill-in and next word in "Two games" | verified | Recorded from BERT and GPT-2 into `fill-in.json` |
| BERT practises by filling in hidden words | verified, secondary source | Wikipedia, "BERT": "one word may be randomly changed ('masked'), and BERT tries to predict the original words" |
| Google introduced BERT in October 2018 | verified, secondary source | Wikipedia, "BERT": "introduced in October 2018 by researchers at Google" |
| The GPT models guess the next word; chat systems are built on that kind | author's knowledge | No citation gathered |
| Chapter 2's network has 25,818 numbers | verified | See chapter 2's sources |
| BERT has about 110 million | verified | Wikipedia: "BERTBASE (110 million parameters)". Counted from the loaded model: 109,514,298 including the part that fills in words. |
| The GPT-2 used has about 124 million | verified | Counted from the loaded model: 124,439,808 |
| GPT-3, from 2020, has 175 billion | verified, secondary source | Wikipedia, "GPT-3" |
| Companies do not usually publish the number for today's models | author's knowledge | No citation gathered. Check or soften. |

Not built: the "How big" extra. The list of sizes in the chapter stands in for it.
