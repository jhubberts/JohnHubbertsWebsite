/**
 * The site has a light and a dark theme. A reader who has pressed the theme button keeps their
 * choice on this device; everyone else gets the theme their device asks for, and follows it if
 * the device's setting changes.
 *
 * The same decision runs before the page first paints, in an inline script in index.html. Keep
 * the two in step, including the colours below.
 */

import { browserStorage, type ReadStorage } from './browser-storage'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme'

/**
 * The page background of each theme (`--background` in src/index.css) as hex, for the
 * `theme-color` meta tag, which browsers colour their own toolbar with.
 */
export const THEME_COLORS: Record<Theme, string> = {
  light: '#fbfdfc',
  dark: '#0a0f0c',
}

type WriteStorage = Pick<Storage, 'setItem'>

/** The theme the reader chose with the button on this device, or null if they never chose. */
export function storedTheme(storage: ReadStorage | null = browserStorage()): Theme | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

/** Remembers the reader's choice on this device. Does nothing when storage is unavailable. */
export function storeTheme(theme: Theme, storage: WriteStorage | null = browserStorage()): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage is unavailable (for example a private window). The choice lasts until the page closes.
  }
}

/** The reader's stored choice if there is one, otherwise the device's setting. */
export function resolveTheme(stored: Theme | null, deviceIsDark: boolean): Theme {
  return stored ?? (deviceIsDark ? 'dark' : 'light')
}
