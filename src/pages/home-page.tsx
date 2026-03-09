import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, Guitar, BarChart3, Mountain, ArrowRight, ChevronDown } from 'lucide-react'
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
import { TypingEffect } from '@/components/typing-effect'
import { cn } from '@/lib/utils'

const phrases = [
  "Founding Engineer @ Roboto",
  "Cat Dad",
  "Lifelong Friend of Robots",
  "Not Afraid to Bitmask 0x08BCF071",
  "\"Pretty OK at Saxophone\" - Cannonball Adderley's Ghost",
  "Once accidentally DDOSed Kinesis from within Amazon",
  "Best Skier on the Mountain",
]

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
    <div>
      {/* Hero — full viewport above the fold */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Headshot */}
          <img
            src="/images/john_hubberts_headshot.png"
            alt="John Hubberts"
            className="h-40 w-40 rounded-full object-cover shadow-lg ring-4 ring-border sm:h-52 sm:w-52"
          />

          {/* Name */}
          <h1 className="text-center text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            John Hubberts
          </h1>

          {/* Typing effect */}
          <p className="h-8 text-center text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            <TypingEffect phrases={phrases} />
          </p>

          {/* Social links */}
          <div className="mt-2 flex gap-3">
            <a
              href="https://github.com/jhubberts"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/johnhubberts"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a
              href="mailto:jhubberts+website@gmail.com"
              className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
            >
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Content below the fold */}
      <div className="container mx-auto px-4 py-12">
        {/* About */}
        <section className="mb-16 max-w-2xl">
          <h2 className="mb-4 text-2xl font-semibold">About</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Professional software engineer with over a decade of experience building and shipping
            products. I've worked on distributed systems processing hundreds of TBs of data per day,
            embedded devices with KBs of RAM, and everything in between.
          </p>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            This site was built to host personal projects and writing about topics I'm interested in.
          </p>
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
    </div>
  )
}
