import { ContactLinks } from './contact-links'

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="page-container flex flex-col items-center gap-2 py-6 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} John Hubberts
        </p>
        <ContactLinks variant="ghost" className="gap-1" />
      </div>
    </footer>
  )
}
