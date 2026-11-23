import { type ComponentType } from 'react'

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

const modules = import.meta.glob<{
  default: ComponentType
  frontmatter: {
    title: string
    date: string
    description: string
    series?: string
    part?: number
    draft?: boolean
  }
}>('/src/content/blog/*.mdx', { eager: true })

/** A draft is visible only outside a production build. */
export function isVisible(post: Pick<BlogPost, 'draft'>, isProd: boolean): boolean {
  return !post.draft || !isProd
}

function visiblePosts(): BlogPost[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const slug = path.replace('/src/content/blog/', '').replace('.mdx', '')
      return {
        slug,
        title: mod.frontmatter.title,
        date: mod.frontmatter.date,
        description: mod.frontmatter.description,
        series: mod.frontmatter.series,
        part: mod.frontmatter.part,
        draft: mod.frontmatter.draft === true,
        Component: mod.default,
      }
    })
    .filter((post) => isVisible(post, import.meta.env.PROD))
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
