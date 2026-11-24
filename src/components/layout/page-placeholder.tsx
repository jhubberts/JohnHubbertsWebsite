import { cn } from '@/lib/utils'

/**
 * Stands in for a page or a post while its code downloads. It is about as tall as a screen, so
 * the footer below it does not jump when the content arrives. Screen readers hear "Loading…".
 */
export function PagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('not-prose min-h-[70vh]', className)}>
      <div aria-hidden="true" className="flex flex-col gap-3 motion-safe:animate-pulse">
        <div className="bg-muted mb-4 h-9 w-4/5 rounded-md" />
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-11/12 rounded" />
        <div className="bg-muted h-4 w-2/3 rounded" />
        <div className="bg-muted mt-4 h-4 w-full rounded" />
        <div className="bg-muted h-4 w-full rounded" />
        <div className="bg-muted h-4 w-3/4 rounded" />
      </div>
      <span role="status" className="sr-only">
        Loading…
      </span>
    </div>
  )
}
