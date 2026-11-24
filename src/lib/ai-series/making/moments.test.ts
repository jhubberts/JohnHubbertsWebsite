import { describe, expect, it } from 'vitest'
import { BUILD_MOMENTS, CAUGHT_BY_LABEL, SERIES_ANSWERS } from './moments'

describe('BUILD_MOMENTS', () => {
  it('has the eight moments the page promises, with unique ids', () => {
    expect(BUILD_MOMENTS).toHaveLength(8)
    expect(new Set(BUILD_MOMENTS.map((moment) => moment.id)).size).toBe(8)
  })

  it('gives every moment a title, a body and the detail of its result line', () => {
    for (const moment of BUILD_MOMENTS) {
      expect(moment.title.trim(), moment.id).not.toBe('')
      expect(moment.body.length, moment.id).toBeGreaterThanOrEqual(1)
      for (const paragraph of moment.body) expect(paragraph.trim(), moment.id).not.toBe('')
      expect(moment.caughtDetail.trim(), moment.id).not.toBe('')
    }
  })

  it('has a label for every kind of result', () => {
    for (const moment of BUILD_MOMENTS) {
      expect(CAUGHT_BY_LABEL[moment.caughtBy]?.trim(), moment.id).toBeTruthy()
    }
  })

  it('contains no string with the digits 72', () => {
    const strings = JSON.stringify({ BUILD_MOMENTS, CAUGHT_BY_LABEL, SERIES_ANSWERS })
    expect(strings).not.toContain('72')
  })
})
