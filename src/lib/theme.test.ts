import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resolveTheme, storedTheme, storeTheme, THEME_COLORS } from './theme'

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const throwing = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('resolveTheme', () => {
  it("follows the device's setting when the reader never chose", () => {
    expect(resolveTheme(null, true)).toBe('dark')
    expect(resolveTheme(null, false)).toBe('light')
  })

  it("keeps the reader's choice whatever the device asks for", () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('storedTheme and storeTheme', () => {
  it('reads back a stored choice', () => {
    const storage = fakeStorage()
    storeTheme('dark', storage)
    expect(storage.data.get('theme')).toBe('dark')
    expect(storedTheme(storage)).toBe('dark')
  })

  it('treats a missing or unknown value as no choice', () => {
    expect(storedTheme(fakeStorage())).toBeNull()
    expect(storedTheme(fakeStorage({ theme: 'sepia' }))).toBeNull()
  })

  it('never throws when storage is unavailable', () => {
    expect(storedTheme(throwing)).toBeNull()
    expect(() => storeTheme('light', throwing)).not.toThrow()
    expect(storedTheme(null)).toBeNull()
  })
})

describe('the script in index.html that sets the theme before the first paint', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

  it('uses the same background colours', () => {
    expect(html).toContain(`'${THEME_COLORS.dark}'`)
    expect(html).toContain(`'${THEME_COLORS.light}'`)
  })
})
