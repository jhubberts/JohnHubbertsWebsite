import { Github, Linkedin, Mail } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const contactLinks = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/jhubberts', external: true },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/johnhubberts',
    external: true,
  },
  { icon: Mail, label: 'Email', href: 'mailto:jhubberts+website@gmail.com', external: false },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-6 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} John Hubberts
        </p>
        <div className="flex gap-1">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-11')}
            >
              <link.icon className="size-5" />
              <span className="sr-only">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
