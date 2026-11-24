/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType, ElementType } from 'react'
  export const frontmatter: Record<string, unknown>
  /** `components` supplies the components the post uses without importing them, by name. */
  const MDXComponent: ComponentType<{ components?: Record<string, ElementType> }>
  export default MDXComponent
}
