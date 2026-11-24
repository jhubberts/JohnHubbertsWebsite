/**
 * Draft posts are hidden in a production build unless this device has asked to see them.
 *
 * Opening any page of the site with `?drafts=on` in the address remembers the choice in this
 * browser; `?drafts=off` forgets it. This lets a draft be read on the live site, on a phone,
 * before it is published. It is not a secret: draft posts are in the public repository and in the
 * site's built files. The switch only keeps them out of lists and off their addresses for
 * everyone who has not asked.
 */

import { browserStorage, type ReadStorage } from './browser-storage'

const STORAGE_KEY = 'site.showDrafts'
const PARAM = 'drafts'

type WriteStorage = Pick<Storage, 'setItem' | 'removeItem'>

/** Whether this device has asked to see drafts. Never throws. */
export function draftsEnabled(storage: ReadStorage | null = browserStorage()): boolean {
  try {
    return storage?.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

/**
 * Applies a `drafts=on` or `drafts=off` query parameter to storage. Returns the query string with
 * the parameter removed (starting with `?`, or empty), or null when there was nothing to apply.
 */
export function applyDraftsParam(search: string, storage: WriteStorage | null): string | null {
  const params = new URLSearchParams(search)
  const value = params.get(PARAM)
  if (value !== 'on' && value !== 'off') return null
  try {
    if (value === 'on') storage?.setItem(STORAGE_KEY, 'on')
    else storage?.removeItem(STORAGE_KEY)
  } catch {
    // Storage is unavailable (for example a private window). Drafts stay hidden.
  }
  params.delete(PARAM)
  const rest = params.toString()
  return rest ? `?${rest}` : ''
}

/** Run once before the app renders: applies the parameter and takes it out of the address bar. */
export function applyDraftsParamFromAddress(): void {
  if (typeof window === 'undefined') return
  const rest = applyDraftsParam(window.location.search, browserStorage())
  if (rest === null) return
  window.history.replaceState(null, '', window.location.pathname + rest + window.location.hash)
}

/** A draft is visible outside a production build, or when this device has asked to see drafts. */
export function isVisible(post: { draft: boolean }, isProd: boolean, showDrafts = false): boolean {
  return !post.draft || !isProd || showDrafts
}
