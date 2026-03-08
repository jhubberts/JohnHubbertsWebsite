import { useParams, Link } from 'react-router-dom'
import { getPostBySlug } from '@/lib/blog'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import NotFound from './not-found'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) return <NotFound />

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        to="/blog"
        className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'mb-6' })}
      >
        <ArrowLeft className="mr-1 h-3 w-3" /> Back to Blog
      </Link>
      <article className="prose prose-neutral dark:prose-invert max-w-2xl">
        <div className="not-prose mb-8">
          <time className="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
        <post.Component />
      </article>
    </div>
  )
}
