import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { getAllSeries } from '@/lib/series'
import {
  BLOCK_END,
  BLOCK_START,
  FIXED_PAGES,
  headTags,
  listPages,
  replacePreviewBlock,
  sitemap,
  type PostSource,
} from './preview-pages'

const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'src/content/blog')

function post(fileName: string, frontmatter: string): PostSource {
  return { fileName, text: `---\n${frontmatter}\n---\n\nBody.\n` }
}

function realPosts(): PostSource[] {
  return readdirSync(BLOG_DIR)
    .filter((name) => name.endsWith('.mdx'))
    .map((fileName) => ({ fileName, text: readFileSync(path.join(BLOG_DIR, fileName), 'utf8') }))
}

const published = post(
  'graph-walks.mdx',
  "title: 'Walking a graph'\ndate: '2024-02-03'\ndescription: 'Steps along edges.'",
)
const draft = post(
  'unfinished.mdx',
  "title: 'Not ready'\ndate: '2024-05-06'\ndescription: 'Later.'\ndraft: true",
)

describe('listPages', () => {
  it('lists the home page, every fixed page, every series and every post in the blog folder', () => {
    const posts = realPosts()
    const paths = listPages(posts, getAllSeries()).map((page) => page.path)

    expect(paths).toContain('/')
    for (const fixed of FIXED_PAGES) expect(paths).toContain(fixed.path)
    for (const series of getAllSeries()) expect(paths).toContain(`/series/${series.slug}`)
    for (const { fileName } of posts) {
      expect(paths).toContain(`/blog/${fileName.replace(/\.mdx$/, '')}`)
    }
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('gives a chapter of a series its number and the short series name', () => {
    const chapter = post(
      'how-ai-works-3-next.mdx',
      "title: 'Next'\ndate: '2024-01-01'\ndescription: 'd'\nseries: 'how-ai-works'\npart: 3",
    )
    const [page] = listPages([chapter], getAllSeries()).filter((p) => p.kind === 'post')

    expect(page.picture).toEqual({
      file: 'how-ai-works-3-next.png',
      kind: 'chapter',
      title: 'Next',
      label: 'How AI Works · Chapter 3',
      part: 3,
    })
  })
})

describe('headTags', () => {
  it("carries a post's own title, description, address and picture", () => {
    const page = listPages([published], []).find((p) => p.path === '/blog/graph-walks')!
    const head = headTags(page)

    expect(head).toContain('<title>Walking a graph · John Hubberts</title>')
    expect(head).toContain('<meta name="description" content="Steps along edges." />')
    expect(head).toContain(
      '<link rel="canonical" href="https://www.johnhubberts.com/blog/graph-walks" />',
    )
    expect(head).toContain('<meta property="og:type" content="article" />')
    expect(head).toContain('<meta property="og:title" content="Walking a graph" />')
    expect(head).toContain(
      '<meta property="og:image" content="https://www.johnhubberts.com/og/graph-walks.png" />',
    )
    expect(head).toContain(
      '<meta name="twitter:image" content="https://www.johnhubberts.com/og/graph-walks.png" />',
    )
    expect(head).toContain('<meta property="article:published_time" content="2024-02-03" />')
    expect(head).not.toContain('noindex')
  })

  it('escapes quotation marks, ampersands and angle brackets, and keeps other characters', () => {
    const tricky = post(
      'tricky.mdx',
      'title: "Say \\"hi\\" & <wave> at Dijkstra’s"\ndate: \'2024-01-01\'\ndescription: \'It’s "fine" & <ok>\'',
    )
    const page = listPages([tricky], []).find((p) => p.path === '/blog/tricky')!
    const head = headTags(page)

    expect(head).toContain(
      '<title>Say &quot;hi&quot; &amp; &lt;wave&gt; at Dijkstra’s · John Hubberts</title>',
    )
    expect(head).toContain(
      '<meta property="og:title" content="Say &quot;hi&quot; &amp; &lt;wave&gt; at Dijkstra’s" />',
    )
    expect(head).toContain(
      '<meta name="description" content="It’s &quot;fine&quot; &amp; &lt;ok&gt;" />',
    )
  })

  it('marks a draft post noindex', () => {
    const page = listPages([draft], []).find((p) => p.path === '/blog/unfinished')!

    expect(headTags(page)).toContain('<meta name="robots" content="noindex" />')
  })

  it('matches the default block written in index.html for the home page', () => {
    const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    const home = listPages([], getAllSeries()).find((p) => p.path === '/')!

    expect(replacePreviewBlock(html, headTags(home))).toBe(html)
  })
})

describe('sitemap', () => {
  it('lists published posts and leaves drafts out', () => {
    const xml = sitemap(listPages([published, draft], getAllSeries()))

    expect(xml).toContain('<loc>https://www.johnhubberts.com/</loc>')
    expect(xml).toContain('<loc>https://www.johnhubberts.com/blog/graph-walks</loc>')
    expect(xml).toContain('<loc>https://www.johnhubberts.com/series/how-ai-works</loc>')
    expect(xml).not.toContain('unfinished')
  })
})

describe('replacePreviewBlock', () => {
  const before = '<html>\n  <head>\n    <meta charset="utf-8" />\n    '
  const after = '\n    <script src="/a.js"></script>\n  </head>\n</html>\n'

  it('replaces only what lies between the two comments', () => {
    const html = `${before}${BLOCK_START}\n    <title>Old</title>\n    ${BLOCK_END}${after}`

    const result = replacePreviewBlock(html, '    <title>New</title>')

    expect(result).toBe(`${before}${BLOCK_START}\n    <title>New</title>\n    ${BLOCK_END}${after}`)
  })

  it('fails when either comment is missing', () => {
    expect(() => replacePreviewBlock(`${before}${BLOCK_START}${after}`, '')).toThrow(BLOCK_END)
    expect(() => replacePreviewBlock(`${before}${BLOCK_END}${after}`, '')).toThrow(BLOCK_START)
  })
})
