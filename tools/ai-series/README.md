# AI series tools

## `train_digits.py`

Trains the 784-32-16-10 digit network the AI series draws digits with, and writes the numbers the
page loads. Python 3.10 with NumPy; run from the repository root:

```sh
python3 tools/ai-series/train_digits.py
```

It downloads the four MNIST files (about 11.6 MB) into `tools/ai-series/data/` unless they are
already there, stops if any file's MD5 differs from the expected one, then trains 20,000 steps of
128 images with a fixed seed (about 20 seconds on a laptop). A run writes the same files every
time.

It writes:

- `public/ai-series/digits/ckpt-<step>.bin`: one per saved point (steps 0, 10, 30, 100, 500 and
  20,000), 25,760 bytes of int8 weights: W1 (32 rows of 784), W2 (16 rows of 32), W3 (10 rows of
  16). A weight's value is its int8 number times its matrix's scale from the manifest.
- `src/lib/ai-series/digits/manifest.json`: each saved point's scales, biases and test images read
  correctly (with the int8 weights, out of 10,000), plus the final point's float accuracy.
- `src/lib/ai-series/digits/fixture.json`: 20 test images (the first two of each digit) with the
  final point's hidden values and probabilities, and the step-0 probabilities of the first image.
  `npm test` checks the TypeScript network against these numbers.

Progress lines, each starting with a timestamp, go to the terminal and to
`tools/ai-series/data/train.log`.

## `fetch_iris.py`

Fetches Fisher's iris data for the "Sort the flowers" interactive and writes the rows the page
plots. Python 3.10, standard library only; run from the repository root:

```sh
python3 tools/ai-series/fetch_iris.py
```

It downloads the UCI repository's corrected copy, `bezdekIris.data` (about 4.5 KB), into
`tools/ai-series/data/` unless it is already there. If that file cannot be fetched it uses
`iris.data` from the same folder and corrects rows 35 and 38 to the published values. It stops if
the file does not have 150 rows, 50 of each species, and the expected rows 1, 35 and 38.

It writes `src/lib/ai-series/flowers/iris.json`: the URL used, the four column names, the unit
(cm), and the 50 setosa and 50 versicolor rows in file order. A run writes the same file every
time.

## `record_language.py`

Runs two open language models, GPT-2 and BERT, once on this machine and records what they output,
so chapters 3 and 4 replay real model output instead of anything written by hand. It needs a
project-local virtual environment, made once from the repository root:

```sh
uv venv --system-site-packages --python "$(python3 -c 'import sys; print(sys.executable)')" tools/ai-series/.venv
VIRTUAL_ENV=tools/ai-series/.venv uv pip install transformers
VIRTUAL_ENV=tools/ai-series/.venv uv pip uninstall numpy
```

`--python` points uv at the system `python3`, whose torch 2.7.1 and NumPy the environment reuses;
without it uv may pick its own Python, which has no torch. uv installs its own NumPy as a
dependency of transformers even though the system one satisfies it, so the last line removes that
copy. Then run, all sections or one:

```sh
tools/ai-series/.venv/bin/python tools/ai-series/record_language.py
tools/ai-series/.venv/bin/python tools/ai-series/record_language.py --only next-words
```

The first run downloads `gpt2` and `bert-base-uncased` from huggingface.co (about 1 GB of
weights plus tokenizer and config files) into `tools/ai-series/data/hf/`, at the commit the hub
reports for each model. It runs on the CPU with fixed seeds, takes a few minutes, and writes the
same files every time:

- `src/lib/ai-series/language/models.json`: each model's name, commit, parameter count, licence
  and page, and the transformers and torch versions.
- `next-words.json`: GPT-2's four most probable next words for five starting texts, five words
  deep. A word GPT-2 builds from pieces (" don" then "'t") is joined into one choice when the model
  is more than 50% sure of the next piece, and marked with its number of pieces.
- `dice.json`: three 20-token continuations of each starting text at five temperatures. Nine of the
  65, listed with a reason in the script's `DICE_LEFT_OUT` table, are recorded but not written;
  the file lists them in `leftOut` without their text. The full record is in
  `tools/ai-series/data/dice-all.json`.
- `word-map.json`: about 250 everyday words placed in 2-D by t-SNE on GPT-2's input embeddings,
  with each word's five nearest neighbours.
- `attention.json`: BERT's 144 attention patterns for two sentences that differ in one word, and
  the heads ranked by how much "it" switches between "animal" and "street".
- `attention-shown.json`: the part of `attention.json` the page shows: the best-scoring head's
  pattern and the average over all 144 heads, for both sentences, with a summary.
- `fill-in.json`: BERT filling a blank and GPT-2 continuing the text at four places in one
  sentence.

The format of each file is described at the top of the script. Every run also rewrites
`tools/ai-series/data/review.txt`, every piece of model text in one list, to be checked for
offensive content before it goes on a page. Progress lines, each starting with a timestamp, go to
the terminal and to `tools/ai-series/data/record_language.log`.
