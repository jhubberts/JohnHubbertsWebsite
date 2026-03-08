import { Link } from 'react-router-dom'
import { getAllPosts } from '@/lib/blog'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon!</p>
      ) : (
        <div className="flex max-w-4xl flex-col gap-4">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-baseline justify-between gap-4">
                    <CardTitle>{post.title}</CardTitle>
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <CardDescription>{post.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
