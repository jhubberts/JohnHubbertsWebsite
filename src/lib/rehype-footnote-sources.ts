/**
 * A rehype plugin that turns the footnotes section remark-gfm writes at the end of a post into a
 * `<details data-footnotes data-count={n}>` holding the list of notes, without the "Footnotes"
 * heading. The page's components render that element as the folded "Sources" section. A post with
 * no footnotes is left as it is.
 *
 * vite.config.ts loads this file, so it imports nothing through the `@/` alias.
 */

import type { Element, ElementContent, Root, RootContent } from 'hast'

function isElement(node: RootContent | ElementContent): node is Element {
  return node.type === 'element'
}

function isFootnotesSection(node: Element): boolean {
  return node.tagName === 'section' && node.properties.dataFootnotes !== undefined
}

/** The footnotes section as a folded section, or undefined when it holds no list of notes. */
function foldedSources(section: Element): Element | undefined {
  const list = section.children.find(
    (child): child is Element => isElement(child) && child.tagName === 'ol',
  )
  if (!list) return undefined
  const count = list.children.filter((child) => isElement(child) && child.tagName === 'li').length
  return {
    type: 'element',
    tagName: 'details',
    properties: { ...section.properties, dataCount: String(count) },
    children: [list],
  }
}

/** Replaces each footnotes section among the node's descendants. */
function foldFootnotes(node: Root | Element): void {
  node.children.forEach((child, index) => {
    if (!isElement(child)) return
    if (isFootnotesSection(child)) {
      const folded = foldedSources(child)
      if (folded) node.children[index] = folded
      return
    }
    foldFootnotes(child)
  })
}

export function rehypeFootnoteSources() {
  return (tree: Root) => foldFootnotes(tree)
}
