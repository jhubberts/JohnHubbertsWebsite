/**
 * Lists the site's shareable addresses and builds, for each one, the head tags a link preview reads
 * (title, description, canonical address, Open Graph and Twitter tags), plus the sitemap. Nothing
 * here reads files or the network, so it can be tested directly; scripts/build-previews.ts does the
 * writing and draws the pictures.
 */
import { postMeta } from '@/lib/frontmatter'
import { seriesShortName, type Series } from '@/lib/series'
import { SITE_PAGES } from '@/lib/site-pages'

export const SITE_URL = 'https://www.johnhubberts.com'
export const SITE_TITLE = 'John Hubberts'
export const SITE_DESCRIPTION = "John Hubberts' Personal Website"
export const PICTURE_WIDTH = 1200
export const PICTURE_HEIGHT = 630
/** The space between the picture's edge and its text, on every side. */
export const PICTURE_PADDING = 80

export const BLOCK_START = '<!-- preview:start -->'
export const BLOCK_END = '<!-- preview:end -->'

/**
 * What a page's preview picture shows. `chapter` adds that chapter's number in handwritten digits
 * at the right, `series` adds the numbers of all its chapters under the title, `plain` shows the
 * title alone.
 */
export type Picture =
  | { file: string; kind: 'plain'; title: string; label: string }
  | { file: string; kind: 'series'; title: string; label: string; parts: number[] }
  | { file: string; kind: 'chapter'; title: string; label: string; part: number }

export interface Page {
  /** The address, starting with `/` and without a trailing slash (`/` for the home page). */
  path: string
  /** The page's own title, or null for the home page, whose tab shows only the site title. */
  title: string | null
  description: string
  kind: 'home' | 'post' | 'series' | 'page'
  /** The post's publication date as written in its frontmatter, when it has one. */
  date?: string
  draft: boolean
  picture: Picture
}

export interface PostSource {
  /** The file name inside src/content/blog, such as `minimalist-ski-art.mdx`. */
  fileName: string
  text: string
}

const SITE_PICTURE: Picture = { file: 'site.png', kind: 'plain', title: SITE_TITLE, label: '' }

function postPage(source: PostSource, allSeries: Series[]): Page {
  const {
    slug,
    title,
    date,
    description,
    series: seriesSlug,
    part,
    draft,
  } = postMeta(source.fileName.replace(/\.mdx$/, ''), source.text)
  const series = allSeries.find((s) => s.slug === seriesSlug)
  const file = `${slug}.png`
  const picture: Picture =
    series && part !== undefined
      ? {
          file,
          kind: 'chapter',
          title,
          label: `${seriesShortName(series)} · Chapter ${part}`,
          part,
        }
      : { file, kind: 'plain', title, label: SITE_TITLE }
  return {
    path: `/blog/${slug}`,
    title,
    description,
    kind: 'post',
    date: date || undefined,
    draft,
    picture,
  }
}

/**
 * Every shareable address: the home page, the fixed pages, each series, then each post in file
 * name order. Draft posts are included, because their addresses work for anyone who has turned
 * drafts on; the sitemap leaves them out.
 */
export function listPages(posts: PostSource[], allSeries: Series[]): Page[] {
  const home: Page = {
    path: '/',
    title: null,
    description: SITE_DESCRIPTION,
    kind: 'home',
    draft: false,
    picture: SITE_PICTURE,
  }
  const fixed: Page[] = Object.values(SITE_PAGES).map(({ path, title }) => ({
    path,
    title,
    description: SITE_DESCRIPTION,
    kind: 'page',
    draft: false,
    picture: SITE_PICTURE,
  }))
  const series: Page[] = allSeries.map((s) => ({
    path: `/series/${s.slug}`,
    title: s.title,
    description: s.description,
    kind: 'series',
    draft: false,
    picture: {
      file: `series-${s.slug}.png`,
      kind: 'series',
      title: s.title,
      label: SITE_TITLE,
      parts: s.chapters.map((chapter) => chapter.part),
    },
  }))
  const postPages = [...posts]
    .filter((p) => p.fileName.endsWith('.mdx'))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
    .map((p) => postPage(p, allSeries))
  return [home, ...fixed, ...series, ...postPages]
}

/** Escapes text for use inside an HTML element or a double-quoted attribute. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function pageUrl(page: Page): string {
  return SITE_URL + page.path
}

export function pictureUrl(page: Page): string {
  return `${SITE_URL}/og/${page.picture.file}`
}

/**
 * The tags that go between the two preview comments in a page's head, one per line, each indented
 * four spaces to match index.html.
 */
export function headTags(page: Page): string {
  const fullTitle = page.title === null ? SITE_TITLE : `${page.title} · ${SITE_TITLE}`
  const shortTitle = page.title ?? SITE_TITLE
  const image = pictureUrl(page)
  const meta = (attr: 'name' | 'property', key: string, content: string) =>
    `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`
  const tags = [
    `<title>${escapeHtml(fullTitle)}</title>`,
    meta('name', 'description', page.description),
    `<link rel="canonical" href="${escapeHtml(pageUrl(page))}" />`,
    meta('property', 'og:type', page.kind === 'post' ? 'article' : 'website'),
    meta('property', 'og:site_name', SITE_TITLE),
    meta('property', 'og:title', shortTitle),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', pageUrl(page)),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', String(PICTURE_WIDTH)),
    meta('property', 'og:image:height', String(PICTURE_HEIGHT)),
    meta('property', 'og:image:alt', shortTitle),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', shortTitle),
    meta('name', 'twitter:description', page.description),
    meta('name', 'twitter:image', image),
  ]
  if (page.date) tags.push(meta('property', 'article:published_time', page.date))
  if (page.draft) tags.push(meta('name', 'robots', 'noindex'))
  return tags.map((tag) => `    ${tag}`).join('\n')
}

/**
 * Returns `html` with everything between the preview comments replaced by `tags`. The comments
 * themselves and everything outside them are kept as they are. Throws if either comment is
 * missing, appears more than once, or the end comes before the start, so that a changed
 * index.html cannot silently produce pages without preview tags.
 */
export function replacePreviewBlock(html: string, tags: string): string {
  const start = html.indexOf(BLOCK_START)
  const end = html.indexOf(BLOCK_END)
  if (start === -1 || end === -1) {
    throw new Error(`Expected index.html to contain ${BLOCK_START} and ${BLOCK_END}`)
  }
  if (html.indexOf(BLOCK_START, start + 1) !== -1 || html.indexOf(BLOCK_END, end + 1) !== -1) {
    throw new Error(`Expected ${BLOCK_START} and ${BLOCK_END} to appear once each in index.html`)
  }
  if (end < start) throw new Error(`Expected ${BLOCK_START} to come before ${BLOCK_END}`)
  const lineStart = html.lastIndexOf('\n', end) + 1
  const indent = html.slice(lineStart, end)
  const keepIndent = /^[ \t]*$/.test(indent) ? indent : ''
  return `${html.slice(0, start + BLOCK_START.length)}\n${tags}\n${keepIndent}${html.slice(end)}`
}

/** The sitemap: every page except draft posts, by absolute address. */
export function sitemap(pages: Page[]): string {
  const urls = pages
    .filter((page) => !page.draft)
    .map((page) => `  <url><loc>${escapeHtml(pageUrl(page))}</loc></url>`)
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
