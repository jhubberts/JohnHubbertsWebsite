import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getSeries } from '@/lib/series'
import { GLOSSARY, GLOSSARY_SERIES, alphabetical, chaptersUsing, termIdsIn } from './glossary'

const BLOG_DIR = resolve(__dirname, '../../content/blog')

/** The file name and text of every chapter of the series. */
function seriesSources(): { file: string; source: string }[] {
  return readdirSync(BLOG_DIR)
    .filter((file) => file.startsWith(`${GLOSSARY_SERIES}-`) && file.endsWith('.mdx'))
    .map((file) => ({ file, source: readFileSync(resolve(BLOG_DIR, file), 'utf8') }))
}

describe('GLOSSARY', () => {
  it('has unique ids', () => {
    expect(new Set(GLOSSARY.map((entry) => entry.id)).size).toBe(GLOSSARY.length)
  })

  it('names a chapter of the series for every entry', () => {
    const parts = getSeries(GLOSSARY_SERIES)!.chapters.map((chapter) => chapter.part)
    for (const entry of GLOSSARY) expect(parts, entry.id).toContain(entry.chapter)
  })

  it('has an entry for every <Term id> used in the series', () => {
    const ids = new Set(GLOSSARY.map((entry) => entry.id))
    for (const { file, source } of seriesSources()) {
      for (const id of termIdsIn(source)) expect(ids.has(id), `${file}: ${id}`).toBe(true)
    }
  })
})

describe('termIdsIn', () => {
  it('finds each id once, with either quote and other attributes', () => {
    const source = [
      'A <Term id="model">model</Term> and <Term id=\'chip\'>chips</Term>.',
      'The <Term  className="x" id="model">same model</Term> again.',
    ].join('\n')
    expect(termIdsIn(source)).toEqual(['model', 'chip'])
  })

  it('ignores other components', () => {
    expect(termIdsIn('<Terms id="model" /> <TryIt id="chip" />')).toEqual([])
  })
})

describe('chaptersUsing', () => {
  it('lists the chapters using each id, ascending', () => {
    const uses = chaptersUsing([
      { part: 9, source: '<Term id="model">m</Term>' },
      { part: 2, source: '<Term id="model">m</Term> <Term id="chip">c</Term>' },
    ])
    expect(uses.get('model')).toEqual([2, 9])
    expect(uses.get('chip')).toEqual([2])
    expect(uses.get('training')).toBeUndefined()
  })
})

describe('alphabetical', () => {
  it('sorts by term, ignoring case', () => {
    const entries = [
      { id: 'b', term: 'beta', summary: '', chapter: 0 },
      { id: 'a', term: 'Alpha', summary: '', chapter: 0 },
    ]
    expect(alphabetical(entries).map((entry) => entry.id)).toEqual(['a', 'b'])
  })
})
