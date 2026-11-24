/**
 * The site has a light and a dark theme. A reader who has pressed the theme button keeps their
 * choice on this device; everyone else gets the theme their device asks for, and follows it if
 * the device's setting changes.
 *
 * The same decision runs before the page first paints, in an inline script in index.html. Keep
 * the two in step, including the colours below.
 */

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

/**
 * The page background of each theme (`--background` in src/index.css) as hex, for the
 * `theme-color` meta tag, which browsers colour their own toolbar with.
 */
export const THEME_COLORS: Record<Theme, string> = {
  light: '#fcfdff',
  dark: '#090b12',
}

type ReadStorage = Pick<Storage, 'getItem'>
type WriteStorage = Pick<Storage, 'setItem'>

function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

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
