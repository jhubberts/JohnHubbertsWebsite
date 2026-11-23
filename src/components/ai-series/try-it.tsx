import type { ReactNode } from 'react'

/**
 * The card every interactive in the series sits in: a small "Try it" label, the title, then the
 * interactive. On a phone it reaches the screen's edges (the blog page pads its content by 16px on
 * each side) so the interactive gets the full width; from 640px it is an ordinary bordered card.
 */
export function TryIt({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="not-prose bg-card text-card-foreground -mx-4 my-8 border-y px-4 py-5 sm:mx-0 sm:rounded-xl sm:border sm:p-6">
      <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Try it</p>
      <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
      {children}
    </section>
  )
}
