import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { OLD_CHAPTER_ADDRESSES, movedChapterSlug } from './old-addresses'

describe('movedChapterSlug', () => {
  it('gives the current address of a chapter that moved', () => {
    expect(movedChapterSlug('how-ai-works-3-guess-the-next-word')).toBe(
      'how-ai-works-6-guess-the-next-word',
    )
  })

  it('gives nothing for a current address or an unknown one', () => {
    expect(movedChapterSlug('how-ai-works-6-guess-the-next-word')).toBeUndefined()
    expect(movedChapterSlug('no-such-post')).toBeUndefined()
    expect(movedChapterSlug('toString')).toBeUndefined()
  })

  it('sends every old address to a post that exists', () => {
    for (const slug of Object.values(OLD_CHAPTER_ADDRESSES)) {
      expect(existsSync(resolve(__dirname, `../../content/blog/${slug}.mdx`)), slug).toBe(true)
    }
  })

  it('is never the address of a current post', () => {
    for (const slug of Object.keys(OLD_CHAPTER_ADDRESSES)) {
      expect(existsSync(resolve(__dirname, `../../content/blog/${slug}.mdx`)), slug).toBe(false)
    }
  })
})
