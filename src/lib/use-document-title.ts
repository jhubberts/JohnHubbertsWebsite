import { useEffect } from 'react'

const SITE_TITLE = 'John Hubberts'

/** Sets the tab title to `{title} · John Hubberts` while mounted, and restores the site title. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_TITLE}` : SITE_TITLE
    return () => {
      document.title = SITE_TITLE
    }
  }, [title])
}
