import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from './frontmatter'

const wrap = (body: string) => `---\n${body}\n---\n\n# Heading\n`

describe('parseFrontmatter', () => {
  it('reads each value kind', () => {
    const result = parseFrontmatter(
      wrap(`a: 'single'\nb: "double"\nc: bare words\nd: 42\ne: true\nf: false`),
    )
    expect(result).toEqual({ a: 'single', b: 'double', c: 'bare words', d: 42, e: true, f: false })
  })

  it('keeps the other quote character and colons inside quoted values', () => {
    const result = parseFrontmatter(
      wrap(`a: "Dijkstra's Algorithm: a tour"\nb: 'He said "hi": ok'\nc: 'It''s'`),
    )
    expect(result).toEqual({
      a: "Dijkstra's Algorithm: a tour",
      b: 'He said "hi": ok',
      c: "It's",
    })
  })

  it('ignores blank lines and trailing spaces', () => {
    const result = parseFrontmatter(wrap(`a: 'x'   \n\nb: 3  \nc: bare   `))
    expect(result).toEqual({ a: 'x', b: 3, c: 'bare' })
  })

  it('handles Windows line endings', () => {
    const result = parseFrontmatter("---\r\ntitle: 'T'\r\npart: 2\r\n---\r\n\r\nBody\r\n")
    expect(result).toEqual({ title: 'T', part: 2 })
  })

  it('keeps unknown keys', () => {
    expect(parseFrontmatter(wrap(`mystery: 'yes'`))).toEqual({ mystery: 'yes' })
  })

  it('returns an empty object without a frontmatter block', () => {
    expect(parseFrontmatter('# Just a heading\n\n---\nnot: frontmatter\n---\n')).toEqual({})
    expect(parseFrontmatter('')).toEqual({})
  })

  it('reads real post files', () => {
    const dir = join(__dirname, '../content/blog')
    const files = readdirSync(dir).filter((name) => name.endsWith('.mdx'))
    expect(files.length).toBeGreaterThan(0)
    for (const name of files) {
      const data = parseFrontmatter(readFileSync(join(dir, name), 'utf8'))
      for (const key of ['title', 'date', 'description']) {
        expect(typeof data[key], `${name} ${key}`).toBe('string')
        expect((data[key] as string).length, `${name} ${key}`).toBeGreaterThan(0)
      }
    }
  })
})
