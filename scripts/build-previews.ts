/**
 * Runs after `vite build`. Static hosting answers an address only when a file exists for it, so
 * this writes `dist/<address>/index.html` for every shareable address, each a copy of
 * dist/index.html carrying that page's own title, description and preview picture in its head.
 * It also draws the preview pictures into dist/og/ and writes dist/sitemap.xml.
 *
 * Run with `vite-node scripts/build-previews.ts`, which resolves the `@/` alias from vite.config.ts.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori, { type SatoriNode } from 'satori'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import { digitPaths, INK_LEVELS, layoutNumber, type NumberLayout } from '@/lib/handwritten-number'
import { getAllSeries } from '@/lib/series'
import { arrangeNumberRows, fitNumber } from './preview-numbers'
import {
  headTags,
  listPages,
  PICTURE_HEIGHT,
  PICTURE_WIDTH,
  replacePreviewBlock,
  sitemap,
  type Picture,
} from './preview-pages'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIST = path.join(ROOT, 'dist')
const NODE_MODULES = path.join(ROOT, 'node_modules')

/**
 * Converts an OKLCH colour (lightness 0 to 1, chroma, hue in degrees) to an sRGB hex string, by
 * way of OKLab and linear sRGB (Björn Ottosson's published matrices). Channels outside the sRGB
 * range are clipped.
 */
function oklchToHex(lightness: number, chroma: number, hueDegrees: number): string {
  const hue = (hueDegrees * Math.PI) / 180
  const a = chroma * Math.cos(hue)
  const b = chroma * Math.sin(hue)
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return (
    '#' +
    linear
      .map((c) => {
        const encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
        const byte = Math.round(Math.min(1, Math.max(0, encoded)) * 255)
        return byte.toString(16).padStart(2, '0')
      })
      .join('')
  )
}

// The site's light theme colours from src/index.css, converted because SVG renderers do not all
// understand oklch().
const COLORS = {
  background: oklchToHex(0.995, 0.005, 270),
  text: oklchToHex(0.15, 0.02, 270),
  accent: oklchToHex(0.45, 0.2, 270),
  muted: oklchToHex(0.5, 0.03, 270),
}

const PADDING = 80
const CONTENT_WIDTH = PICTURE_WIDTH - 2 * PADDING
const CONTENT_HEIGHT = PICTURE_HEIGHT - 2 * PADDING
const CHAPTER_TITLE_WIDTH = 660
// A chapter's number sits in a box at the right, 20px clear of the title column. A one-digit
// number is drawn as tall as the box; a wider number is scaled down to the box's width.
const CHAPTER_NUMBER_BOX = 360
// A series' chapter numbers are drawn 84px tall when they fit in one row, smaller when they do not,
// and move onto more rows rather than shrink below 48px.
const SERIES_NUMBER_HEIGHT = 84
const SERIES_NUMBER_MIN_HEIGHT = 48
// The space between two chapter numbers, and between two rows of them, per pixel of their height.
const SERIES_NUMBER_GAP_RATIO = 0.3
// Title sizes tried from largest to smallest; the first that fits is used.
const TITLE_SIZES = [76, 64, 54, 46]
const TITLE_LINE_HEIGHT = 1.1
const MAX_TITLE_LINES = 4
// The smallest space kept between the title block and the domain name at the bottom.
const MIN_BOTTOM_GAP = 24

/** A satori element: the same shape React.createElement returns, written without JSX. */
interface Element {
  type: string
  key?: string
  props: { style?: Record<string, unknown>; children?: unknown; [name: string]: unknown }
}

function el(
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra: Record<string, unknown> = {},
): Element {
  const { key, ...props } = extra
  return { type, ...(key ? { key: String(key) } : {}), props: { style, children, ...props } }
}

/**
 * A number in handwritten digits as an SVG data URL: a 1-by-1 square for each pixel with ink, its
 * opacity the ink level. The view box is the number's own layout from src/lib/handwritten-number.ts.
 */
function numberDataUrl(layout: NumberLayout): string {
  const groups = layout.digits.map((placed) => {
    const paths = digitPaths(placed.digit, placed.sample)
      .paths.map((d, i) =>
        d ? `<path d="${d}" fill-opacity="${+((i + 1) / INK_LEVELS).toFixed(3)}"/>` : '',
      )
      .join('')
    return `<g transform="translate(${placed.offsetX} 0)">${paths}</g>`
  })
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${layout.top} ${layout.width} ` +
    `${layout.height}" fill="${COLORS.text}" shape-rendering="crispEdges">${groups.join('')}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

function chapterLayout(part: number): NumberLayout {
  const layout = layoutNumber(part)
  if (!layout) throw new Error(`Chapter ${part} has no number that can be drawn`)
  return layout
}

function numberImage(
  layout: NumberLayout,
  width: number,
  height: number,
  style: Record<string, unknown> = {},
  key?: string,
): Element {
  return el('img', { width, height, flexShrink: 0, ...style }, undefined, {
    src: numberDataUrl(layout),
    width,
    height,
    key,
  })
}

/** A chapter's number, centred in the box at the right of its picture. */
function chapterNumber(part: number): Element {
  const layout = chapterLayout(part)
  const { width, height } = fitNumber(layout, CHAPTER_NUMBER_BOX, CHAPTER_NUMBER_BOX)
  return el(
    'div',
    {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: CHAPTER_NUMBER_BOX,
      flexShrink: 0,
    },
    numberImage(layout, width, height),
  )
}

/** A series' chapter numbers in one or more rows, for under the title. */
function seriesNumbers(parts: number[]): Element {
  const layouts = parts.map(chapterLayout)
  const { rows, height, gap } = arrangeNumberRows(layouts, {
    maxWidth: CONTENT_WIDTH,
    height: SERIES_NUMBER_HEIGHT,
    minHeight: SERIES_NUMBER_MIN_HEIGHT,
    gapRatio: SERIES_NUMBER_GAP_RATIO,
  })
  return el(
    'div',
    { display: 'flex', flexDirection: 'column', marginTop: 36 },
    rows.map((row, r) =>
      el(
        'div',
        { display: 'flex', marginTop: r === 0 ? 0 : gap },
        row.map((index, i) => {
          const layout = layouts[index]
          const width = (layout.width * height) / layout.height
          return numberImage(layout, width, height, { marginLeft: i === 0 ? 0 : gap }, `n${index}`)
        }),
        { key: `row${r}` },
      ),
    ),
  )
}

/**
 * The whole picture at one title size. The text column holds the small line, the title and (for a
 * series) its chapters' numbers at the top, and the domain name at the bottom. The `top` and `title`
 * keys let fitTitle measure the laid-out sizes.
 */
function pictureTree(picture: Picture, titleSize: number): Element {
  const columnWidth = picture.kind === 'chapter' ? CHAPTER_TITLE_WIDTH : CONTENT_WIDTH
  const top: Element[] = []
  if (picture.label) {
    top.push(
      el(
        'div',
        {
          fontFamily: 'Geist',
          fontWeight: 600,
          fontSize: 28,
          color: COLORS.accent,
          marginBottom: 20,
        },
        picture.label,
      ),
    )
  }
  top.push(
    el(
      'div',
      {
        fontFamily: 'Source Serif 4',
        fontWeight: 600,
        fontSize: titleSize,
        lineHeight: TITLE_LINE_HEIGHT,
        letterSpacing: -0.01 * titleSize,
        color: COLORS.text,
        width: columnWidth,
      },
      picture.title,
      { key: 'title' },
    ),
  )
  if (picture.kind === 'series') top.push(seriesNumbers(picture.parts))
  const column = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: columnWidth,
      height: CONTENT_HEIGHT,
    },
    [
      el('div', { display: 'flex', flexDirection: 'column', flexShrink: 0 }, top, { key: 'top' }),
      el(
        'div',
        { fontFamily: 'Geist', fontWeight: 500, fontSize: 26, color: COLORS.muted, flexShrink: 0 },
        'johnhubberts.com',
        { key: 'domain' },
      ),
    ],
  )
  const children = [column]
  if (picture.kind === 'chapter') children.push(chapterNumber(picture.part))
  return el(
    'div',
    {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: PICTURE_WIDTH,
      height: PICTURE_HEIGHT,
      padding: PADDING,
      boxSizing: 'border-box',
      backgroundColor: COLORS.background,
    },
    children,
  )
}

type Fonts = Parameters<typeof satori>[1]['fonts']

async function loadFonts(): Promise<Fonts> {
  const read = (file: string) => readFile(path.join(NODE_MODULES, '@fontsource', file))
  return [
    {
      name: 'Source Serif 4',
      weight: 600,
      style: 'normal',
      data: await read('source-serif-4/files/source-serif-4-latin-600-normal.woff'),
    },
    {
      name: 'Geist',
      weight: 500,
      style: 'normal',
      data: await read('geist-sans/files/geist-sans-latin-500-normal.woff'),
    },
    {
      name: 'Geist',
      weight: 600,
      style: 'normal',
      data: await read('geist-sans/files/geist-sans-latin-600-normal.woff'),
    },
  ]
}

/**
 * Lays the picture out at each title size from largest to smallest and returns the SVG of the
 * first one where the title takes at most four lines and the top block still leaves room above
 * the domain name. Throws if even the smallest size does not fit, so a long title fails the build
 * instead of producing a clipped picture.
 */
async function renderSvg(picture: Picture, fonts: Fonts): Promise<string> {
  for (const size of TITLE_SIZES) {
    const heights: Record<string, number> = {}
    const svg = await satori(
      pictureTree(picture, size) as unknown as Parameters<typeof satori>[0],
      {
        width: PICTURE_WIDTH,
        height: PICTURE_HEIGHT,
        fonts,
        onNodeDetected: (node: SatoriNode) => {
          if (node.key !== undefined) heights[String(node.key)] = node.height
        },
      },
    )
    const lines = Math.round(heights.title / (size * TITLE_LINE_HEIGHT))
    const room = CONTENT_HEIGHT - heights.top - heights.domain
    if (lines <= MAX_TITLE_LINES && room >= MIN_BOTTOM_GAP) return svg
  }
  throw new Error(`The title "${picture.title}" does not fit its preview picture at any size`)
}

async function main(): Promise<void> {
  const started = performance.now()
  await initWasm(await readFile(path.join(NODE_MODULES, '@resvg/resvg-wasm/index_bg.wasm')))
  const fonts = await loadFonts()

  const blogDir = path.join(ROOT, 'src/content/blog')
  const fileNames = (await readdir(blogDir)).filter((name) => name.endsWith('.mdx'))
  const posts = await Promise.all(
    fileNames.map(async (fileName) => ({
      fileName,
      text: await readFile(path.join(blogDir, fileName), 'utf8'),
    })),
  )
  const pages = listPages(posts, getAllSeries())
  const template = await readFile(path.join(DIST, 'index.html'), 'utf8')

  for (const page of pages) {
    const html = replacePreviewBlock(template, headTags(page))
    const file = path.join(DIST, page.path, 'index.html')
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, html)
  }

  const pictures = new Map(pages.map((page) => [page.picture.file, page.picture]))
  await mkdir(path.join(DIST, 'og'), { recursive: true })
  for (const picture of pictures.values()) {
    const svg = await renderSvg(picture, fonts)
    const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng()
    await writeFile(path.join(DIST, 'og', picture.file), png)
    console.log(`  og/${picture.file}`)
  }

  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap(pages))
  const seconds = ((performance.now() - started) / 1000).toFixed(1)
  console.log(
    `Wrote ${pages.length} pages, ${pictures.size} preview pictures and sitemap.xml in ${seconds} s`,
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
