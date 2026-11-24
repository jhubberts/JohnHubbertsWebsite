import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resolveTheme, storedTheme, storeTheme, THEME_COLORS, type Theme } from '@/lib/theme'

// The `dark` class on <html> is the current theme. The inline script in index.html sets it before
// the first paint; this file changes it afterwards. Every theme button on the page reads it, so
// the copy in the top bar and the copy in the phone layout always agree.

const listeners = new Set<() => void>()

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/**
 * Switches the page to `theme`. Transitions are suspended for the switch: otherwise every element
 * with a colour transition (the buttons in the top bar among them) fades between the two themes,
 * and some browsers do not repaint the end of that fade inside the blurred top bar until the page
 * scrolls, which leaves dark icons on the dark background.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (currentTheme() !== theme) {
    const pause = document.createElement('style')
    pause.textContent = '*,*::before,*::after{transition:none!important}'
    document.head.appendChild(pause)
    root.classList.toggle('dark', theme === 'dark')
    // Reading a computed style makes the browser apply the new colours while transitions are off.
    void window.getComputedStyle(document.body).color
    pause.remove()
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  listeners.forEach((listener) => listener())
}

function deviceQuery(): MediaQueryList {
  return window.matchMedia('(prefers-color-scheme: dark)')
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // While the reader has not chosen a theme, follow the device when its setting changes.
  const device = deviceQuery()
  const onDeviceChange = () => {
    if (storedTheme() === null) applyTheme(resolveTheme(null, device.matches))
  }
  device.addEventListener('change', onDeviceChange)
  return () => {
    listeners.delete(listener)
    device.removeEventListener('change', onDeviceChange)
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => 'light' as const)
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 md:size-8"
      aria-label={`Switch to ${next} theme`}
      onClick={() => {
        storeTheme(next)
        applyTheme(next)
      }}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
