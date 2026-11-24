import { Link } from 'react-router-dom'
import { Rocket, Wrench, BookOpen, ArrowRight } from 'lucide-react'
import { SeriesDigitStrip } from '@/components/blog/handwritten-digit'
import { ContactLinks } from '@/components/layout/contact-links'
import { TypingEffect } from '@/components/typing-effect'
import { getSeriesPosts } from '@/lib/blog'
import { getAllSeries, type Series } from '@/lib/series'
import { useSeriesProgress } from '@/lib/use-series-progress'

const phrases = [
  'Founding Engineer @ Roboto',
  'Cat Dad',
  'Lifelong Friend of Robots',
  'Not Afraid to Bitmask 0x08BCF071',
  '"Pretty OK at Saxophone" - Cannonball Adderley\'s Ghost',
  'Once accidentally DDOSed Kinesis from within Amazon',
  'Best Skier on the Mountain',
]

const links = [
  {
    icon: Wrench,
    title: 'Projects',
    description: "See what I've been working on in my free time",
    to: '/projects',
  },
  {
    icon: Rocket,
    title: 'Roboto AI',
    description: "See what I'm excited to work on the rest of the time",
    href: 'https://roboto.ai',
  },
  {
    icon: BookOpen,
    title: 'Blog',
    description: 'Read what I have to say about things',
    to: '/blog',
  },
]

/** The card that links to a series. Separate from HomePage so the progress hook is not called conditionally. */
function FeaturedSeries({ series }: { series: Series }) {
  const { read } = useSeriesProgress(series.slug)
  const parts = series.chapters.map((chapter) => chapter.part)

  return (
    <Link
      viewTransition
      to={`/series/${series.slug}`}
      className="group bg-card hover:border-primary focus-visible:border-primary block rounded-xl border p-5 transition-colors sm:p-6"
    >
      <p className="eyebrow">Series · {series.chapters.length} chapters</p>
      <h2 className="mt-2 font-serif text-[1.5rem] leading-tight font-semibold">{series.title}</h2>
      <p className="text-muted-foreground mt-2">{series.description}</p>
      <SeriesDigitStrip
        parts={parts}
        read={read}
        wrap
        className="mt-4 gap-1"
        digitClassName="size-6"
      />
      <p className="text-primary mt-4 inline-flex items-center gap-1 font-medium">
        Start reading
        <ArrowRight className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
      </p>
    </Link>
  )
}

export default function HomePage() {
  const series = getAllSeries()[0]
  const showSeries = series !== undefined && getSeriesPosts(series.slug).length > 0

  return (
    <div className="page-container pt-10 pb-16 md:pt-16">
      <section className="flex flex-col items-center gap-6">
        <img
          src="/images/john_hubberts_headshot.png"
          alt="John Hubberts"
          className="ring-border h-32 w-32 rounded-full object-cover shadow-lg ring-4 sm:h-40 sm:w-40"
        />

        <h1 className="page-title text-center">John Hubberts</h1>

        {/* Fixed height so the page does not move while the phrases type; two lines on a phone. */}
        <p className="text-muted-foreground min-h-14 text-center text-lg sm:min-h-8 sm:text-xl">
          <TypingEffect phrases={phrases} />
        </p>

        <ContactLinks variant="outline" className="gap-3" />
      </section>

      <div className="mx-auto mt-10 max-w-[40rem]">
        {showSeries && <FeaturedSeries series={series} />}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {links.map((link) => {
            const content = (
              <>
                <link.icon className="text-muted-foreground size-5 shrink-0" />
                <div>
                  <h2 className="font-semibold">{link.title}</h2>
                  <p className="text-muted-foreground text-sm">{link.description}</p>
                </div>
              </>
            )
            const className =
              'hover:bg-accent flex items-start gap-3 rounded-xl border p-4 transition-colors sm:flex-col'

            if (link.to) {
              return (
                <Link viewTransition key={link.title} to={link.to} className={className}>
                  {content}
                </Link>
              )
            }
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
