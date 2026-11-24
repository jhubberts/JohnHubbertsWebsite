# Sources for chapter 4, "Paying attention"

This file was renamed when the series was renumbered on 2026-11-23; chapter numbers inside it are
the old ones (old 1 is now 3, 2 is 4, 3 is 6, 4 is 7, 5 is 9, 6 is 11, 7 is 12, 8 is 13, 9 is 14,
10 is 15).

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

## Not only words (added 2026-11-23 at John's request)

Researched by an agent on 2026-11-23 from primary sources; it checked, for each example, a primary
statement that the system uses a transformer or attention. Popular examples that are not
transformers (GraphCast and NOAA's AI models, GNoME) or could not be established (Insilico's drug,
AlphaFold 3, any AI-designed protein in human trials) were left out on purpose.

| Claim | Status | Basis |
|---|---|---|
| AlphaFold 2 is built on the transformer | verified | Nobel committee, scientific background, Oct 2024: "a transformer architecture was used, with the essential attention mechanism"; Jumper et al. 2021: "The Evoformer blocks contain a number of attention-based ... components" |
| It has predicted almost all of the 200 million proteins known | verified | Nobel press release: "virtually all the 200 million proteins that researchers have identified" |
| Two of its makers shared the 2024 Nobel Prize in Chemistry for it | verified | Hassabis and Jumper, one half, "for protein structure prediction". The other half went to David Baker for protein design, which the page does not attribute to the transformer |
| AlphaGenome reads a million DNA letters at once, predicts the effect of changing one letter, and uses transformers | verified | DeepMind, June 2025: "transformers to communicate information across all positions in the sequence"; Nature, Jan 2026: "takes as input 1 Mb of DNA sequence" and variant-effect prediction |
| ESM3 is a transformer trained on proteins; its new glowing protein shares 58% of its chain with the closest known one; it glows | verified | EvolutionaryScale: "ESM3 is a multi-track transformer"; Science, Jan 2025: "a bright fluorescent protein at a far distance (58% sequence identity) from known fluorescent proteins" |
| ECMWF has run a model with a transformer inside since Feb 2025, beside its usual one, using about 1,000 times less energy per forecast | verified | AIFS paper: "a sliding window transformer processor" (graph network at both ends); ECMWF, 25 Feb 2025: "into operations today ... side by side with" IFS; "a reduction of approximately 1,000 times in energy use for making a forecast" |
| RT-1, "Robotics Transformer", carried out 97 in 100 of more than 700 instructions it had practiced | verified | Project page: "RT-1, a Transformer-based model"; "On seen tasks, RT-1 is able to perform 97% of the more than 700 instructions successfully" |

Note (2026-11-23): rows above for "Two games", the BERT and GPT-2 sizes, and "companies do not usually
publish" describe text cut from the page; the page now says "We picked this example because it is
the clearest", not "We went looking for it". AlphaGenome's wording "what changing one letter does to
how genes are used" follows DeepMind's description of predicting gene regulation and variant
effects. "Every part depends on others far away" is the writer's framing, consistent with
AlphaGenome's "transformers to communicate information across all positions in the sequence".

After the reader test (2026-11-23): the robots bullet now gives RT-1's result on things it had not
seen (32 in 100) and its successor's (62 in 100), from Google DeepMind's RT-2 post, July 2023:
"improved performance on previously unseen scenarios by the robot, from RT-1's 32% to 62%". Readers
said 97 in 100 on practiced instructions alone overstated it. "Two amino acids far apart on a chain
can end up touching once the protein folds" is general biology, added at a reader's suggestion.
