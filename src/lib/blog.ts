import { type ComponentType } from 'react'

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  Component: ComponentType
}

const modules = import.meta.glob<{
  default: ComponentType
  frontmatter: { title: string; date: string; description: string }
}>('/src/content/blog/*.mdx', { eager: true })

export function getAllPosts(): BlogPost[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const slug = path.replace('/src/content/blog/', '').replace('.mdx', '')
      return {
        slug,
        title: mod.frontmatter.title,
        date: mod.frontmatter.date,
        description: mod.frontmatter.description,
        Component: mod.default,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug)
}
