/**
 * This browser's local storage. The modules that remember a reader's choices take storage as a
 * parameter that defaults to this, so tests can pass a plain object instead.
 */

/** Storage that is only read. */
export type ReadStorage = Pick<Storage, 'getItem'>

/**
 * The browser's local storage, or null where there is none: outside a browser, or where reading
 * `window.localStorage` itself throws (some browsers do this when storage is blocked).
 */
export function browserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
