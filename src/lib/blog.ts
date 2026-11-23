import { lazy, type ComponentType } from 'react'
import { draftsEnabled, isVisible } from './drafts'
import { parseFrontmatter } from './frontmatter'

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  series?: string
  part?: number
  draft: boolean
  Component: ComponentType
}

const rawSources = import.meta.glob<string>('/src/content/blog/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const loaders = import.meta.glob<{ default: ComponentType }>('/src/content/blog/*.mdx')

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function buildPost(path: string, source: string): BlogPost {
  // If a build plugin compiles the `?raw` import, `source` is not text and every post would
  // silently lose its title and date. Fail loudly instead. See mdxExceptRaw in vite.config.ts.
  if (typeof source !== 'string') throw new Error(`Expected the raw text of ${path}`)
  const slug = path.replace('/src/content/blog/', '').replace('.mdx', '')
  const meta = parseFrontmatter(source)
  return {
    slug,
    title: stringOrUndefined(meta.title) ?? slug,
    date: stringOrUndefined(meta.date) ?? '',
    description: stringOrUndefined(meta.description) ?? '',
    series: stringOrUndefined(meta.series),
    part: typeof meta.part === 'number' ? meta.part : undefined,
    draft: meta.draft === true,
    Component: lazy(loaders[path]),
  }
}

const allPosts: BlogPost[] = Object.entries(rawSources).map(([path, source]) =>
  buildPost(path, source),
)

function visiblePosts(): BlogPost[] {
  const showDrafts = draftsEnabled()
  return allPosts.filter((post) => isVisible(post, import.meta.env.PROD, showDrafts))
}

export function getAllPosts(): BlogPost[] {
  return visiblePosts().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return visiblePosts().find((post) => post.slug === slug)
}

export function getSeriesPosts(seriesSlug: string): BlogPost[] {
  return visiblePosts()
    .filter((post) => post.series === seriesSlug)
    .sort((a, b) => (a.part ?? 0) - (b.part ?? 0))
}
