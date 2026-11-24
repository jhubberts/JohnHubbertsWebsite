import { Link } from 'react-router-dom'
import { Guitar, BarChart3, Mountain, ArrowRight } from 'lucide-react'
import { SITE_PAGES } from '@/lib/site-pages'
import { useDocumentTitle } from '@/lib/use-document-title'

const projects = [
  {
    title: "Dijkstra's Chord Progression",
    description:
      "Enter a chord progression and find optimal fingerings using Dijkstra's algorithm to minimize hand movement between chords. Try it on Giant Steps!",
    icon: BarChart3,
    to: '/blog/dijkstras-guitar',
  },
  {
    title: 'Chord Library',
    description:
      'Browse guitar chord voicings across all roots and types. Hear each chord with Web Audio synthesis and see note/interval annotations on the fingering chart.',
    icon: Guitar,
    to: '/projects/guitar/chord-library',
  },
  {
    title: 'Minimalist Ski Art',
    description:
      'Turn GPS ski tracks into minimalist wall art. Upload a GPX file and explore viewing angles, colors, and line styles.',
    icon: Mountain,
    to: '/projects/minimalist-ski-art',
  },
]

export default function ProjectsPage() {
  useDocumentTitle(SITE_PAGES.projects.title)

  return (
    <div className="page-container pt-8 pb-16 md:pt-12">
      <h1 className="page-title">Projects</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            viewTransition
            key={project.to}
            to={project.to}
            className="group bg-card hover:border-primary focus-visible:border-primary flex flex-col rounded-xl border p-5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <project.icon className="text-muted-foreground size-5 shrink-0" />
              <h2 className="font-serif text-xl leading-tight font-semibold">{project.title}</h2>
            </div>
            <p className="text-muted-foreground mt-2 flex-1 text-sm">{project.description}</p>
            <p className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium">
              Try it
              <ArrowRight className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
