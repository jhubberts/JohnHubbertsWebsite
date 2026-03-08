import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, Guitar, Music, BarChart3, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const projects = [
  {
    title: 'Chord Library',
    description:
      'Browse guitar chord voicings across all roots and types. Hear each chord with Web Audio synthesis and see note/interval annotations on the fingering chart.',
    icon: Guitar,
    to: '/projects/guitar/chord-library',
  },
  {
    title: "Dijkstra's Chord Progression",
    description:
      'Enter a chord progression and find optimal fingerings using Dijkstra\'s algorithm to minimize hand movement between chords. Try it on Giant Steps!',
    icon: BarChart3,
    to: '/projects/guitar/dijkstras',
  },
  {
    title: 'Fretboard Explorer',
    description:
      'A visual sandbox for exploring chord shapes on the fretboard with interactive canvas rendering.',
    icon: Music,
    to: '/projects/guitar/fretboard',
  },
]

const skills = [
  'TypeScript', 'React', 'Python', 'AWS', 'CDK',
  'Node.js', 'Tailwind CSS', 'PostgreSQL', 'DynamoDB',
  'Docker', 'CI/CD', 'REST APIs', 'Graph Algorithms',
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <section className="max-w-2xl mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          John Hubberts
        </h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Software Engineer
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          I build things for the web and the cloud. Currently interested in
          developer tools, infrastructure as code, and creative applications
          of algorithms — like using graph theory to solve guitar chord progressions.
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="https://github.com/johnhubberts"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/johnhubberts"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
          >
            <Linkedin className="h-4 w-4" />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a
            href="mailto:john@hubberts.com"
            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
          >
            <Mail className="h-4 w-4" />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </section>

      <Separator className="mb-12" />

      {/* Projects */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.to} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <project.icon className="h-5 w-5 text-muted-foreground" />
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
      </section>

      <Separator className="mb-12" />

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tech I Work With</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">{skill}</Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
