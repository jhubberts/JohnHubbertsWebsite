/**
 * Addresses the series' chapters had before chapters were added and renumbered on 2026-11-23,
 * mapped to the chapter's current address. A visit to an old address is sent on to the new one,
 * so links already shared keep working.
 */
export const OLD_CHAPTER_ADDRESSES: Record<string, string> = {
  'how-ai-works-0-three-questions-my-mom-asked': 'how-ai-works-0-questions-my-mom-asked',
  'how-ai-works-1-rules-versus-examples': 'how-ai-works-3-rules-versus-examples',
  'how-ai-works-2-a-network-that-reads-handwriting':
    'how-ai-works-4-a-network-that-reads-handwriting',
  'how-ai-works-3-guess-the-next-word': 'how-ai-works-6-guess-the-next-word',
  'how-ai-works-4-paying-attention': 'how-ai-works-7-paying-attention',
  'how-ai-works-5-inside-a-chat-window': 'how-ai-works-9-inside-a-chat-window',
  'how-ai-works-5-from-a-research-paper-to-a-chat-window': 'how-ai-works-9-inside-a-chat-window',
  'how-ai-works-6-giving-it-hands': 'how-ai-works-11-giving-it-hands',
  'how-ai-works-7-can-it-get-out': 'how-ai-works-12-can-it-get-out',
  'how-ai-works-8-what-it-costs': 'how-ai-works-13-what-it-costs',
  'how-ai-works-9-how-i-used-ai-to-build-this': 'how-ai-works-14-how-i-used-ai-to-build-this',
  'how-ai-works-10-so-is-it-worth-it': 'how-ai-works-15-so-is-it-worth-it',
}

/** Chapter numbers before 2026-11-23, mapped to the same chapter's number now. */
export const OLD_CHAPTER_NUMBERS: Record<number, number> = {
  0: 0,
  1: 3,
  2: 4,
  3: 6,
  4: 7,
  5: 9,
  6: 11,
  7: 12,
  8: 13,
  9: 14,
  10: 15,
}

/** The current address of a chapter that was at `slug` before the renumbering, if it was one. */
export function movedChapterSlug(slug: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(OLD_CHAPTER_ADDRESSES, slug)
    ? OLD_CHAPTER_ADDRESSES[slug]
    : undefined
}
