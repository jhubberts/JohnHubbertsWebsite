/**
 * Writes src/lib/chapter-digits.json: real handwritten digits used to draw chapter numbers. The
 * digits are 28-by-28 images from the MNIST test set, taken from the sample file the chapter 2
 * interactive already uses. That file holds two images of each digit: `digits` is the first of
 * each and `alternates` is the second, so a number such as 11 can be drawn from two different
 * handwritten 1s.
 *
 * Each image is 28 strings of 28 characters. A character is the ink level of one pixel, from '0'
 * (none) to '9' (the image's darkest pixel).
 *
 * Run: node scripts/extract-chapter-digits.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SIZE = 28
const LEVELS = 9
const fixture = JSON.parse(readFileSync('src/lib/ai-series/digits/fixture.json', 'utf8'))

/** The nth image (0 or 1) of a digit in the sample file, as rows of ink levels. */
function sample(label, nth) {
  const image = fixture.images.filter((candidate) => candidate.label === label)[nth]
  if (!image) throw new Error(`No image number ${nth} labelled ${label} in the fixture`)
  if (image.pixels.length !== SIZE * SIZE) throw new Error(`An image of ${label} is not 28 by 28`)
  const darkest = Math.max(...image.pixels)
  const rows = []
  for (let y = 0; y < SIZE; y += 1) {
    let row = ''
    for (let x = 0; x < SIZE; x += 1) {
      row += String(Math.round((image.pixels[y * SIZE + x] / darkest) * LEVELS))
    }
    rows.push(row)
  }
  return { label, testIndex: image.testIndex, rows }
}

const labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const digits = labels.map((label) => sample(label, 0))
const alternates = labels.map((label) => sample(label, 1))

const output = {
  source: 'MNIST test set, by way of src/lib/ai-series/digits/fixture.json',
  size: SIZE,
  levels: LEVELS,
  digits,
  alternates,
}
writeFileSync('src/lib/chapter-digits.json', JSON.stringify(output, null, 2) + '\n')
console.log(
  `Wrote ${digits.length} digits and ${alternates.length} alternates to src/lib/chapter-digits.json`,
)
