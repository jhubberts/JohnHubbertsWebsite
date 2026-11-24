import { Github, Linkedin, Mail } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LINKEDIN_URL = 'https://linkedin.com/in/johnhubberts'

/** Where the top bar's "Resume" link goes: the LinkedIn profile. */
export const RESUME_URL = LINKEDIN_URL

const CONTACT_LINKS = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/jhubberts', newTab: true },
  { icon: Linkedin, label: 'LinkedIn', href: LINKEDIN_URL, newTab: true },
  { icon: Mail, label: 'Email', href: 'mailto:jhubberts+website@gmail.com', newTab: false },
]

/**
 * The GitHub, LinkedIn and Email links as a row of 44px icon buttons, in the button look named by
 * `variant`. Each icon's name is there for screen readers.
 */
export function ContactLinks({
  variant,
  className,
}: {
  variant: 'outline' | 'ghost'
  className?: string
}) {
  return (
    <div className={cn('flex', className)}>
      {CONTACT_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={cn(buttonVariants({ variant, size: 'icon' }), 'size-11')}
        >
          <link.icon className="size-5" />
          <span className="sr-only">{link.label}</span>
        </a>
      ))}
    </div>
  )
}
