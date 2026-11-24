import { Link } from 'react-router-dom'
import { HandwrittenDigit } from '@/components/blog/handwritten-digit'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="px-4 py-20 text-center">
      <span className="inline-flex gap-1">
        <HandwrittenDigit digit={4} className="text-foreground size-16 sm:size-20" />
        <HandwrittenDigit digit={0} className="text-foreground size-16 sm:size-20" />
        <HandwrittenDigit digit={4} className="text-foreground size-16 sm:size-20" />
        <span className="sr-only">404</span>
      </span>
      <h1 className="page-title mt-6">Page not found</h1>
      <Link viewTransition to="/" className={buttonVariants({ className: 'mt-8 min-h-11' })}>
        Back to Home
      </Link>
    </div>
  )
}
