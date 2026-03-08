import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, Guitar, Bot, BarChart3, Mountain, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  {
    title: 'Benbot',
    description: 'I built an iRobot Create3 based robot to play with my cat.',
    icon: Bot,
    to: '/blog/benbot_is_friendbot',
  },
]

const skills = [
  'Python',
  'TypeScript',
  'React',
  'Embedded C',
  'Java',
  'AWS',
  'Agentic AI',
  'CDK',
  'PostgreSQL',
  'Docker',
  'ROS',
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <section className="mb-16 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">John Hubberts</h1>
        <p className="text-muted-foreground mt-2 text-xl">
          Founding Engineer @{' '}
          <a
            href="https://roboto.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Roboto AI
          </a>
        </p>
        <p className="text-muted-foreground mt-6 text-base leading-relaxed">
          Professional software engineer with over a decade of experience building and shipping
          products. I've worked on distributed systems processing hundreds of TBs of data per day,
          embedded devices with KBs of RAM, and everything in between.
        </p>
        <p className="text-muted-foreground mt-6 text-base leading-relaxed">
          This site was built to host personal projects and writing about topics I'm interested in.
        </p>
        <div className="mt-6 flex gap-3">
          <a
            href="https://github.com/jhubberts"
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
            href="mailto:jhubberts+website@gmail.com"
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
        <h2 className="mb-6 text-2xl font-semibold">Projects</h2>
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
      </section>

      <Separator className="mb-12" />

      {/* Skills */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Tech I Work With</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
