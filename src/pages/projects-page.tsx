import { Link } from 'react-router-dom'
import { Guitar, BarChart3, Mountain, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Projects</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.to} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2">
                <project.icon className="text-muted-foreground h-5 w-5" />
                <CardTitle>{project.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{project.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Link
                to={project.to}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                Try it <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
