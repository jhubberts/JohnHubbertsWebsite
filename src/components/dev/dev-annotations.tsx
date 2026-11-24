import { Component, lazy, Suspense, type ReactNode } from 'react'

/**
 * The Agentation toolbar, for marking up the page while developing. It sends notes to the local
 * Agentation server that a coding agent reads (see `.mcp.json`). It exists only in the development
 * server: in a production build `import.meta.env.DEV` is false, so the import below is removed and
 * the package never reaches the published site.
 */
const Agentation = import.meta.env.DEV
  ? lazy(() => import('agentation').then((module) => ({ default: module.Agentation })))
  : null

/** The address the Agentation server listens on by default. */
const AGENTATION_SERVER = 'http://localhost:4747'

/** Keeps a failure inside the toolbar from taking the page down with it. */
class ToolbarBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('The Agentation toolbar failed and was removed from the page.', error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function DevAnnotations() {
  if (!Agentation) return null
  return (
    <ToolbarBoundary>
      <Suspense fallback={null}>
        <Agentation endpoint={AGENTATION_SERVER} appName="johnhubberts.com" />
      </Suspense>
    </ToolbarBoundary>
  )
}
