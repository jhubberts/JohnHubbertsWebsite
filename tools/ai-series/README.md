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
