import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DAY_COUNTS, MADE_THINGS } from './made'

const BLOG_DIR = join(process.cwd(), 'src/content/blog')

describe('MADE_THINGS', () => {
  it('gives every entry a title and a sentence about what the reader did', () => {
    for (const thing of MADE_THINGS) {
      expect(thing.title.trim(), thing.path).not.toBe('')
      expect(thing.did.trim(), thing.title).not.toBe('')
    }
  })

  it('links each entry to its own chapter', () => {
    for (const thing of MADE_THINGS) {
      expect(thing.path.startsWith(`/blog/how-ai-works-${thing.chapter}-`), thing.title).toBe(true)
    }
  })

  it('lists chapters in order', () => {
    const chapters = MADE_THINGS.map((thing) => thing.chapter)
    expect(chapters).toEqual([...chapters].sort((a, b) => a - b))
  })

  it('points each entry at a chapter file that exists', () => {
    const files = readdirSync(BLOG_DIR)
    for (const thing of MADE_THINGS) {
      const slug = thing.path.replace('/blog/', '')
      expect(files, thing.title).toContain(`${slug}.mdx`)
    }
  })
})

describe('DAY_COUNTS', () => {
  it('has a positive whole number and a description for each line', () => {
    for (const item of DAY_COUNTS) {
      expect(Number.isInteger(item.count) && item.count > 0, item.what).toBe(true)
      expect(item.what.trim(), String(item.count)).not.toBe('')
    }
  })
})
