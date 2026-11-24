import { Pointer } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * The frame every interactive in the series sits in: a "Try it" chip, the title, then the
 * interactive. On a phone the frame reaches the screen's edges (the blog page pads its content by
 * 16px on each side) so the interactive gets the full width. From 640px it is a bordered card
 * that may be wider than the text around it.
 */
export function TryIt({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="not-prose article-breakout bg-card text-card-foreground -mx-4 my-8 border-y px-4 py-5 sm:rounded-xl sm:border sm:p-6 sm:shadow-xs">
      <p className="bg-accent text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold">
        <Pointer className="size-3.5" aria-hidden="true" />
        Try it
      </p>
      <h3 className="mt-3 mb-4 text-[1.375rem] leading-tight font-semibold">{title}</h3>
      {children}
    </section>
  )
}
