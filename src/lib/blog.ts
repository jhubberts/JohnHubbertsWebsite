import { createElement, lazy, useState, type ComponentType } from 'react'
import { draftsEnabled, isVisible } from './drafts'
import { postMeta, type PostMeta } from './frontmatter'

export interface BlogPost extends PostMeta {
  Component: ComponentType
  /**
   * Downloads the post's code. The returned promise settles when the download has finished or
   * failed, and never rejects. Safe to call repeatedly: the code is downloaded once.
   */
  preload: () => Promise<void>
}

type PostModule = { default: ComponentType }

/**
 * The post's content and a function that downloads its code. Once `preload` has finished, the
 * content renders at once instead of suspending, so a navigation that awaited `preload` shows the
 * whole post in one step, with no placeholder in between.
 */
function loadablePost(load: () => Promise<PostModule>): Pick<BlogPost, 'Component' | 'preload'> {
  let loaded: ComponentType | undefined
  let pending: Promise<PostModule> | undefined

  const download = (): Promise<PostModule> => {
    pending ??= Promise.resolve()
      .then(load)
      .then((module) => {
        loaded = module.default
        return module
      })
      .catch((error: unknown) => {
        // Forget the failure so the next attempt downloads again.
        pending = undefined
        throw error
      })
    return pending
  }

  const Lazy = lazy(download)

  function Component() {
    // Chosen once per mount, so the content is never swapped for a fresh copy while on screen.
    const [Ready] = useState(() => loaded)
    return createElement(Ready ?? Lazy)
  }

  const preload = () =>
    download().then(
      () => undefined,
      () => undefined,
    )

  return { Component, preload }
}

const rawSources = import.meta.glob<string>('/src/content/blog/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const loaders = import.meta.glob<PostModule>('/src/content/blog/*.mdx')

function buildPost(path: string, source: string): BlogPost {
  // If a build plugin compiles the `?raw` import, `source` is not text and every post would
  // silently lose its title and date. Fail loudly instead. See mdxExceptRaw in vite.config.ts.
  if (typeof source !== 'string') throw new Error(`Expected the raw text of ${path}`)
  const slug = path.replace('/src/content/blog/', '').replace('.mdx', '')
  return { ...postMeta(slug, source), ...loadablePost(loaders[path]) }
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

/** The visible posts of a series by chapter number. When two posts share a number, the first wins. */
export function getSeriesPostsByPart(seriesSlug: string): Map<number, BlogPost> {
  const byPart = new Map<number, BlogPost>()
  for (const post of getSeriesPosts(seriesSlug)) {
    if (post.part !== undefined && !byPart.has(post.part)) byPart.set(post.part, post)
  }
  return byPart
}
