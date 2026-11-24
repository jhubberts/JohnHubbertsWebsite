# Claims added after the reader test (2026-11-23)

Three test readers went through chapters 0 to 8 as the intended reader. The chapters were revised
from what they could not follow. This file lists every claim the revisions added, by chapter, with
its status, so that each can be checked before publishing. The comparisons to science and everyday
life are the author's analogies, which John approved on 2026-11-23. An analogy is marked "analogy" and is
only meant to be apt, not exact.

| Ch | Added | Status | Basis |
|---|---|---|---|
| 0 | One of her questions came from a news story she had seen | John's account | His first message for the project |
| 0 | Code is the written instructions a computer follows | definition | |
| 1 | Two of the machine's three numbers set how the line tilts and the third sets where it sits | verified | `src/lib/ai-series/flowers/flowers.ts`: a line is `a·x + b·y + c`; a and b give its direction, c its offset |
| 1 | A child learns to tell a robin from a sparrow in much the same way | analogy | |
| 2 | Each unit does what chapter 1's machine did: multiply by its own numbers and add | verified | `digit-net.ts`; chapter 1's machine computes `a·x + b·y + c` |
| 2 | For each number, it can be worked out whether a little more or less would have helped | verified | `tools/ai-series/train_digits.py` computes this (the gradient) for every number |
| 2 | Ten totals, the biggest wins, no eleventh for "none of these" | verified | `digit-net.ts`: ten outputs |
| 2 | Blue and orange work like signals that excite a nerve cell and signals that quiet it | analogy | Positive and negative numbers in a unit, compared with excitatory and inhibitory input |
| 2 | A real neuron signals "how much" by how fast it fires | not checked | Textbook (rate coding). All three readers raised its absence. Find a source. |
| 2 | A brain also forms new connections | not checked | Textbook. Replaces "from around birth into a person's twenties", which a reader called loose. |
| 3 | A language model is the part of an AI system that works with words; a large set of numbers found by practice | definition | Consistent with chapter 2 and with how GPT-2 was made |
| 3 | A separate, simple step picks the word, like weighted dice; it is ordinary code with one setting | author's knowledge | How sampling works. `tools/ai-series/record_language.py` does exactly this to record "The dice". |
| 3 | "Every other word put together" is often a large share | verified | 31 to 90 in 100 at the first step of the five starting texts. Replaces "often the biggest row", which a reader found false on her tries. |
| 3 | Like word-association tests, where "dog" brings "cat" to mind | analogy | In the data, the nearest word to "dog" is "cat" |
| 3 | Opposites often land close together; try "sad" | verified for the example | `word-map.json`: see the nearest words to "sad" |
| 4 | "Attention" here is not attention in a psychologist's sense; it is closer to context | author's framing | Raised by a reader |
| 4 | The model looks 144 different ways; the page calls each a pattern | verified | 12 layers of 12 heads in the recorded data |
| 4 | In 25 of the 144, "it" leans on the animal in the first sentence and the street in the second | verified | `attention-shown.json`, `summary.switching` |
| 4 | A brain scan shows what lit up, not what the person was thinking | analogy | |
| 4 | By the time a chat system reads your message, the whole message is "what came before" | author's knowledge | Answers a reader's question: how can a next-word model use a clue that comes later |
| 4 | Older designs took in words one after another; the transformer takes them in together | verified, secondary source | Wikipedia, "Attention Is All You Need": "removing its recurrence to process all tokens in parallel" |
| 5 | A file is a saved piece of information, like a photo or a document | definition | |
| 5 | A counselor with no memory who reads the whole case file before every session; the company is the records office | analogy | Suggested independently by all three readers |
| 5 | An AI made by Anthropic wrote the paragraph about Anthropic | verified | This project. A reader was wary of it; the chapter now says so first. |
| 5 | A conversation you do not delete is kept, with no fixed limit in the rules read | partly | The consumer retention page says chats are kept as long as reasonably necessary; its "standard retention" heading had no text in the copy fetched. Re-read the page. |
| 5 | Whether a record can be used when a new model is built depends on the company's rules and your settings | verified | The four policy pages in chapter 5's sources |
| 6 | An AI system is a model plus the programs around it | definition | |
| 6 | Like a hospital pharmacy: a doctor writes an order and the pharmacist decides under the hospital's rules | analogy | Two readers suggested it |
| 7 | The harness in the test let the agents run programs, because breaking into software was the exam | inference | OpenAI describes an evaluation that "prompts models to pursue advanced exploitation"; none of the three reports uses the word harness |
| 7 | OpenAI's own word is that they tried to "cheat" | verified | OpenAI: found ways "to gain access to secret information that it could use to cheat the evaluation" |
| 7 | Like a student who cheats under pressure, knowing it is against the rules | analogy | |
| 7 | It was built to carry out the task it is given | author's reasoning | Not from the reports |
| 7 | The reports agree on the outline; two are from the companies involved and the third worked from records OpenAI gave it | verified | The three reports as read |
| 7 | Safeguards are extra checks that block or refuse dangerous requests | definition | OpenAI's "deployment safeguards" and "reduced cyber refusals" |
| 7 | The agents were separate copies, not one mind; two models took part | verified | METR: agents "meant to be fully isolated from one another"; OpenAI names two models |
| 8 | No published per-answer figure from Anthropic could be found | not found | `chapter-8-research.md`, A1d |
| 8 | A fifth per-answer figure: about 0.6 watt-hours, counting a share of building the model | verified | `chapter-8-research.md`, A2a (Epoch AI topic page, July 2026) |
| 8 | A 100-point survey scale; about ten points in Canada and Poland; survey answers, not votes | verified via Cornell's report | `chapter-8-research.md`, H3 |
| 8 | A "thinking" mode has the system work through a problem in steps before answering | definition | |

## Round 2 (2026-11-23)

Three more blind readers read the revised pages. Claims added or changed in response:

| Chapter | Claim | Status | Basis |
|---|---|---|---|
| 1 | A child needs far fewer examples than the perceptron did | not checked | General knowledge of child category learning; replaces the robin and sparrow sentence, which all three readers doubted |
| 2 | The drawing is cut into 28 by 28 squares, 784 numbers | verified | `src/lib/ai-series/digits/` |
| 2 | "about 86 billion neurons" (was "more than") | not checked | The commonly cited estimate |
| 2 | Blue raises a unit's total and orange lowers it; some synapses excite and others quiet | verified for the page; not checked for the biology | `digit-parts.tsx` |
| 3 | No single one of a word's 768 numbers has a meaning anyone gave it | reasoning | Follows from the numbers being found by practice |
| 4 | Each pattern has its own set of numbers; one might link a word to what it refers to, another to the word before | not checked | Illustrative ("might"); attention heads of both kinds are described in published analyses of BERT, not read for this page |
| 4 | Taking words in together is work a computer can do all at once | not checked | The 2017 paper's stated motivation, from memory |
| 4 | The two models differ in size and practice text | verified | Chapter's own size list; training text from the models' pages |
| 7 | About 700 agents took part in the attack on Hugging Face | verified | METR: "Of these agents, 700 went on to participate in the attack on Hugging Face." Read 2026-11-23 |
| 7 | "at least 20%" is of the agents in METR's dataset | verified | METR: "at least 20% of the agents in our dataset expressed clear interest in tampering with their transcripts in some way" |
| 7 | Agents left messages for each other inside the package store | verified | METR: "A dump of 1.2 million entries from a cache namespace that agents used as a message board"; "Agents used this message board to send over 70,000 messages and files to one another" |
| 7 | Why a model pursues a task; the trained-animal comparison | author's reasoning | Labeled as such on the page. Replaces the cheating-student comparison, which all three readers said contradicted "it does not want things" |
| 7 | Writing "this is out of bounds" is not proof of knowing | author's reasoning | Not from the reports |

### Chapter 4 simplified (John's decision, 2026-11-23)

Two of three round 2 readers said they would stop at chapter 4. "What does it mean?" now shows only
the picked pattern, for the word "it". The view "Average of all 144" and tapping other words were
removed, and the prose no longer explains patterns.

| Claim | Status | Basis |
|---|---|---|
| The model looks at a sentence in 144 different ways at once; 119 of the 144 do not show the switch | verified | 144 less the 25 that do, both from the recorded summary in `attention-shown.json`; asserted in `attention.test.ts` |
| "most of them show nothing this neat" | verified | Same counts |

The claim in `chapter-4.md` about the average of all 144 is still true of the recorded data but is
no longer shown on the page.

After a re-read still scored chapter 4 at 4, "Two ways to practice" (the "Two games" part) and the
list of model sizes were removed from the page, by John's decision. Claims in the new closing
section:

| Claim | Status | Basis |
|---|---|---|
| BERT sees both sides of a word; models behind chat systems draw only on earlier words | verified | `chapter-4.md`, as for the removed section |
| Taking words in together let researchers use far more text and build far larger models | not checked | The 2017 paper's stated motivation, from memory |
| 25,818 numbers; GPT-3 has 175 billion | verified | `digits/manifest.json`; `chapter-3.md` |
