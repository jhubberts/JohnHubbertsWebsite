import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GUESS_QUESTIONS } from '@/lib/ai-series/guesses'
import { SERIES_ANSWERS } from './moments'
import { CHAPTER_PATHS, compareGuesses } from './compare'

describe('compareGuesses', () => {
  it('shows nothing until the question is answered here', () => {
    expect(compareGuesses(undefined, undefined)).toBe('notAnswered')
    expect(compareGuesses('kept', undefined)).toBe('notAnswered')
  })

  it('says there was no earlier guess when chapter 0 was skipped', () => {
    expect(compareGuesses(undefined, 'kept')).toBe('noEarlierGuess')
  })

  it('tells a same answer from a changed one', () => {
    expect(compareGuesses('between', 'between')).toBe('same')
    expect(compareGuesses('kept', 'between')).toBe('changed')
  })
})

describe('SERIES_ANSWERS', () => {
  it('answers exactly the three questions', () => {
    expect(Object.keys(SERIES_ANSWERS).sort()).toEqual(GUESS_QUESTIONS.map((q) => q.id).sort())
  })

  it('names one of the question’s own choices as the closest', () => {
    for (const question of GUESS_QUESTIONS) {
      const choiceIds: string[] = question.choices.map((c) => c.id)
      expect(choiceIds, question.id).toContain(SERIES_ANSWERS[question.id].closest)
    }
  })

  it('points every answer at a chapter page that exists', () => {
    for (const { chapter } of Object.values(SERIES_ANSWERS)) {
      const path = CHAPTER_PATHS[chapter]
      expect(path, String(chapter)).toBeDefined()
      const slug = path.replace('/blog/', '')
      expect(existsSync(resolve(__dirname, `../../../content/blog/${slug}.mdx`)), slug).toBe(true)
    }
  })
})
