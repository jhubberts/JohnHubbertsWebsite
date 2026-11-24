import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { RESUME_URL } from './contact-links'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

const navLinks: { to: string; label: string; external?: boolean }[] = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About' },
  { to: RESUME_URL, label: 'Resume', external: true },
]

export function NavBar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

  // The current page is marked by an underline as well as colour.
  const linkClass = (to: string, mobile = false) =>
    cn(
      'hover:text-primary font-medium transition-colors',
      mobile ? 'flex min-h-11 items-center text-base' : 'text-sm',
      isActive(to)
        ? cn('text-foreground underline decoration-2 underline-offset-8', mobile && 'font-semibold')
        : 'text-muted-foreground',
    )

  return (
    <nav
      data-site-nav
      className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
    >
      <div className="flex h-14 items-center px-4 md:px-8">
        <Link viewTransition to="/" className="flex min-h-11 items-center gap-2 text-lg font-bold">
          <Bot className="h-5 w-5" />
          John Hubberts
        </Link>

        {/* Desktop nav */}
        <div className="ml-auto hidden items-center gap-6 md:flex">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.to}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass(link.to)}
              >
                {link.label}
              </a>
            ) : (
              <Link
                viewTransition
                key={link.to}
                to={link.to}
                aria-current={isActive(link.to) ? 'page' : undefined}
                className={linkClass(link.to)}
              >
                {link.label}
              </Link>
            ),
          )}
          <ThemeToggle />
        </div>

        {/* Mobile nav */}
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="size-11" />}>
              <Menu className="size-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mt-8 flex flex-col gap-1 px-4">
                {navLinks.map((link) =>
                  link.external ? (
                    <a
                      key={link.to}
                      href={link.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={linkClass(link.to, true)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      viewTransition
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(link.to) ? 'page' : undefined}
                      className={linkClass(link.to, true)}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
