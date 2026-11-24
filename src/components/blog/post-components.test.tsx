import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { mdxComponents } from './mdx-components'
import { glossaryEntry } from '@/lib/ai-series/glossary'
import WithFootnotes from './fixtures/with-footnotes.mdx'
import WithoutFootnotes from './fixtures/without-footnotes.mdx'

function render(Post: typeof WithFootnotes): string {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Post components={mdxComponents} />
    </MemoryRouter>,
  )
}

describe('a post with footnotes', () => {
  const html = render(WithFootnotes)

  it('folds the notes into a closed "Sources" section, without the "Footnotes" heading', () => {
    expect(html).toMatch(/<details[^>]*data-footnotes/)
    expect(html).not.toMatch(/<details[^>]*\bopen\b/)
    expect(html).toMatch(/<summary[^>]*>Sources \(2\)/)
    expect(html).not.toContain('Footnotes')
    expect(html).not.toContain('<section')
  })

  it('keeps each note linked to its number and back', () => {
    expect(html).toContain('href="#user-content-fn-first"')
    expect(html).toContain('id="user-content-fn-first"')
    expect(html).toContain('href="#user-content-fnref-first"')
    expect(html).toContain('id="footnote-label"')
  })
})

describe('a post without footnotes', () => {
  it('has no sources section', () => {
    const html = render(WithoutFootnotes)
    expect(html).not.toContain('<details')
    expect(html).not.toContain('Sources')
    expect(html).toContain('<a href="/blog">a link</a>')
  })
})

describe('JohnsThoughts', () => {
  it('is a labelled note that renders the Markdown inside it', () => {
    const html = render(WithFootnotes)
    expect(html).toMatch(/role="note" aria-labelledby="([^"]+)"/)
    const labelId = html.match(/role="note" aria-labelledby="([^"]+)"/)![1]
    expect(html).toContain(`id="${labelId}"`)
    expect(html).toContain('John the Human’s Thoughts')
    expect(html).toContain('<em>fine</em>')
    expect(html).toContain('href="/series/how-ai-works"')
  })
})

describe('Term', () => {
  it('renders a known term as a closed button controlling its card', () => {
    const html = render(WithFootnotes)
    expect(html).toMatch(
      /<button[^>]*aria-expanded="false"[^>]*aria-controls="[^"]+"[^>]*>model<\/button>/,
    )
    expect(html).toContain(`Explained in chapter ${glossaryEntry('model')!.chapter}`)
    expect(html).toContain('href="/series/how-ai-works/glossary#model"')
  })

  it('renders an unknown id as plain words', () => {
    const html = render(WithFootnotes)
    expect(html).toContain('an unknown word.')
  })
})
