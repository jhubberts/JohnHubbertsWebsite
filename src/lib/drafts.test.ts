import { describe, expect, it } from 'vitest'
import { applyDraftsParam, draftsEnabled, isVisible } from './drafts'

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

const throwing = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
  removeItem: () => {
    throw new Error('blocked')
  },
}

describe('isVisible', () => {
  it('always shows a post that is not a draft', () => {
    expect(isVisible({ draft: false }, true)).toBe(true)
    expect(isVisible({ draft: false }, false)).toBe(true)
  })

  it('shows a draft outside a production build', () => {
    expect(isVisible({ draft: true }, false)).toBe(true)
  })

  it('hides a draft in a production build unless this device asked to see drafts', () => {
    expect(isVisible({ draft: true }, true)).toBe(false)
    expect(isVisible({ draft: true }, true, false)).toBe(false)
    expect(isVisible({ draft: true }, true, true)).toBe(true)
  })
})

describe('applyDraftsParam and draftsEnabled', () => {
  it('turns drafts on and removes the parameter', () => {
    const storage = fakeStorage()
    expect(applyDraftsParam('?drafts=on', storage)).toBe('')
    expect(draftsEnabled(storage)).toBe(true)
  })

  it('turns drafts off again', () => {
    const storage = fakeStorage({ 'site.showDrafts': 'on' })
    expect(applyDraftsParam('?drafts=off', storage)).toBe('')
    expect(draftsEnabled(storage)).toBe(false)
  })

  it('keeps other parameters', () => {
    const storage = fakeStorage()
    expect(applyDraftsParam('?a=1&drafts=on&b=2', storage)).toBe('?a=1&b=2')
  })

  it('does nothing without the parameter or with another value', () => {
    const storage = fakeStorage()
    expect(applyDraftsParam('', storage)).toBeNull()
    expect(applyDraftsParam('?a=1', storage)).toBeNull()
    expect(applyDraftsParam('?drafts=yes', storage)).toBeNull()
    expect(draftsEnabled(storage)).toBe(false)
  })

  it('is off by default and when storage is missing or throws', () => {
    expect(draftsEnabled(fakeStorage())).toBe(false)
    expect(draftsEnabled(null)).toBe(false)
    expect(draftsEnabled(throwing)).toBe(false)
    expect(applyDraftsParam('?drafts=on', throwing)).toBe('')
    expect(applyDraftsParam('?drafts=on', null)).toBe('')
  })
})
