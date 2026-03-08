export function Footer() {
  return (
    <footer className="mt-auto border-t py-6">
      <div className="container mx-auto flex items-center justify-center px-4">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} John Hubberts
        </p>
      </div>
    </footer>
  )
}
