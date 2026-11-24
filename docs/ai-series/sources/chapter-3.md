# Sources for chapter 1, "Rules versus examples"

This file was renamed when the series was renumbered on 2026-11-23; chapter numbers inside it are
the old ones (old 1 is now 3, 2 is 4, 3 is 6, 4 is 7, 5 is 9, 6 is 11, 7 is 12, 8 is 13, 9 is 14,
10 is 15).

Every date, name, number and factual claim in the chapter, with where it comes from and whether it
was checked. Checked on 2026-11-23 unless noted.

| Claim in the chapter | Status | Source |
|---|---|---|
| 100 real iris flowers of two species (50 setosa, 50 versicolor) | verified | `src/lib/ai-series/flowers/iris.json`, written by `tools/ai-series/fetch_iris.py` from `bezdekIris.data` at the UCI repository; the script checks 150 rows, 50 per species, and rows 1, 35 and 38 |
| Edgar Anderson collected the measurements | verified, secondary source | Wikipedia, "Iris flower data set" |
| Ronald Fisher published them in 1936 | verified, secondary source | Wikipedia, "Iris flower data set": "in his 1936 paper The use of multiple measurements in taxonomic problems" |
| Each flower is placed by sepal length and sepal width | verified | `src/components/blog/how-ai-works/sort-the-flowers.tsx` |
| On an iris the sepals are the three outer parts that spread or droop, called falls (an earlier draft said "the ones gardeners call falls"; the source does not mention gardeners) | verified, secondary source | Wikipedia, "Iris (plant)": "The three sepals, which are usually spreading or droop downwards, are referred to as 'falls'." |
| The machine's line is three numbers, changed a little at each wrong flower | verified | `src/lib/ai-series/flowers/flowers.ts`, `nextCorrection` |
| After 27 corrections no flower is on the wrong side | verified | `flowers.test.ts` asserts 27 and 100 of 100. The number depends on the starting line, step size and order, which are fixed. |
| A straight line separates these two species on these two measurements, narrowly | verified | `flowers.test.ts`: a line that gets 100 of 100; the nearest flower is 0.12 cm from the widest-gap line (measured by the build agent, not asserted in a test) |
| Frank Rosenblatt described this way of learning in 1958 | verified, secondary source | Wikipedia, "Perceptron" credits Rosenblatt's work at Cornell in 1957 and his 1958 paper |
| The Mark I Perceptron was designed to recognise images | verified, secondary source | Wikipedia, "Perceptron": the Mark I Perceptron was "designed for image recognition" |
| A single line can only separate things a line can separate | follows from the definition | |
| The next chapter puts many lines together to read handwriting | verified | Chapter 2's network has 58 units, each of which adds up its inputs the way the line here does. An earlier draft said telling a 3 from an 8 "takes" many units; that was not measured and was removed. |
| Every system in the rest of the series learns in the same basic way | author's summary | Chapter 2's network is trained by small corrections against examples (`tools/ai-series/train_digits.py`). Chapters 3 and 4 must bear this out when written. |

Not used in the chapter, and not verified, so do not add without checking:

- That the learning rule is guaranteed to find a separating line whenever one exists.
- What the 1969 book "Perceptrons" by Minsky and Papert did to research funding.

Before publishing:

- Replace the Wikipedia citations with primary sources where the claim matters (Fisher 1936;
  Rosenblatt 1958).
- Check or reword the "not checked" row. The chapter does not say who built the Mark I Perceptron, because that was not in the text fetched.
- The reader this is written for knows flowers. Have her read the sentence about sepals.
