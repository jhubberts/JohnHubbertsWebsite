import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail, ChevronDown, Rocket, Wrench, BookOpen, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
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

export default function HomePage() {
  const belowFoldRef = useRef<HTMLDivElement>(null)

  const scrollDown = () => {
    belowFoldRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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
        <button
          onClick={scrollDown}
          className="absolute bottom-8 animate-bounce cursor-pointer border-none bg-transparent"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </button>
      </section>

      {/* Below the fold */}
      <div
        ref={belowFoldRef}
        className="container mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12"
      >
        <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
          {links.map((link) => {
            const content = (
              <div className="group flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center transition-colors hover:bg-accent">
                <link.icon className="h-8 w-8 text-muted-foreground transition-colors group-hover:text-foreground" />
                <h2 className="text-lg font-semibold">{link.title}</h2>
                <p className="text-sm text-muted-foreground">{link.description}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            )

            if (link.to) {
              return (
                <Link key={link.title} to={link.to}>
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
