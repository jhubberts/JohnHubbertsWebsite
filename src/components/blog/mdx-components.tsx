import type { PostComponents } from '@/lib/blog'
import { PostDetails, PostLink } from '@/components/blog/footnotes'
import { JohnsThoughts } from '@/components/blog/johns-thoughts'
import { Term } from '@/components/blog/term'

/**
 * Handed to every post. Posts use the capitalised components here without importing them, and
 * the lower-case ones replace the elements Markdown produces: links (for footnote numbers) and
 * folded sections (for a post's sources).
 */
export const mdxComponents: PostComponents = {
  JohnsThoughts,
  Term,
  a: PostLink,
  details: PostDetails,
}
