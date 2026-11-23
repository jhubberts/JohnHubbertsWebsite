# Sources for chapter 2, "A network that reads handwriting"

Every date, name, number and factual claim in the chapter, with where it comes from and whether it
was checked. Checked on 2026-11-23 unless noted.

| Claim in the chapter | Status | Source |
|---|---|---|
| The network has 25,818 numbers | verified | 784×32 + 32 + 32×16 + 16 + 16×10 + 10. `src/lib/ai-series/digits/digit-net.ts` |
| 784 inputs, 32 units, 16 units, 10 outputs; 58 units in all | verified | `src/lib/ai-series/digits/manifest.json`, `layers` |
| It runs on the reader's device and the drawing is not sent anywhere | verified | The page fetches the saved numbers and reads the drawing in the browser; no request carries the drawing. Checked in the browser's network log. |
| With random numbers it gets about one digit in ten right | verified | Manifest, first saved point: 1,166 of 10,000 |
| 60,000 example digits for practice, 10,000 for testing | verified | Counted by `tools/ai-series/train_digits.py` from the MNIST files it downloads |
| The examples were seen many times over | verified | 20,000 rounds of 128 examples is 2,560,000, about 43 times 60,000. `train_digits.py` |
| After every small group of examples each number is nudged to make the answers less wrong | verified | `train_digits.py`: minibatch gradient descent (AdamW) |
| It got 9,725 of the 10,000 test digits right | verified | Manifest, last saved point. Measured with the stored 8-bit numbers, which is what the page runs. |
| The collection is called MNIST | verified | File names and source in `train_digits.py` |
| Who assembled MNIST and when | not stated in the chapter | If added: needs a primary source (LeCun, Cortes and Burges) |
| A real neuron fires all-or-nothing pulses | verified, secondary source | Wikipedia, "Neuron": "an all-or-nothing electrochemical pulse called an action potential" |
| Real neurons signal across a gap using chemicals | verified, secondary source | Wikipedia, "Neuron": synapses "commonly use minute amounts of chemical neurotransmitters" |
| Learning changes how strong the connections between real neurons are | verified, secondary source | Wikipedia, "Synaptic plasticity": "the ability of synapses to strengthen or weaken over time" and "one of the important neurochemical foundations of learning and memory" |
| A brain removes connections as it develops, from around birth into a person's twenties | verified, secondary source | Wikipedia, "Synaptic pruning": "Pruning starts near the time of birth and continues into one's late 20s." |
| A human brain has more than 86 billion neurons | verified, secondary source | Wikipedia, "Human brain": "There are more than 86 billion neurons in the brain". The "Neuron" article cites Herculano-Houzel (2009), "The human brain in numbers". |
| A real neuron takes in many signals, counts some more than others, and passes one signal on | not checked | Textbook description. Not confirmed in the text fetched. |

Before publishing:

- Replace the Wikipedia citations with the primary sources they cite, at least for the neuron count.
- Check the one unchecked row, or cut the sentence.
- The reader this is written for knows neurons well. Have her read the "Is this like a brain?" box
  with that in mind.
