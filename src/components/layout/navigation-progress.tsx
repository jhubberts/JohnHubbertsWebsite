import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router-dom'

/** How long a navigation may wait before the bar appears, so quick ones show nothing. */
const DELAY_MS = 150

/**
 * A thin bar across the top of the screen while the next page's code is still downloading. The
 * page being left stays on screen meanwhile, so this is the only sign that the tap was received.
 * Screen readers ignore it: the new page's title announces the arrival.
 */
export function NavigationProgress() {
  const busy = useNavigation().state !== 'idle'
  const [delayPassed, setDelayPassed] = useState(false)

  useEffect(() => {
    if (!busy) return
    const timer = window.setTimeout(() => setDelayPassed(true), DELAY_MS)
    return () => {
      window.clearTimeout(timer)
      setDelayPassed(false)
    }
  }, [busy])

  if (!busy || !delayPassed) return null
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
      <div className="navigation-progress bg-primary h-full" />
    </div>
  )
}
