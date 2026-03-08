export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container mx-auto flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} John Hubberts
        </p>
      </div>
    </footer>
  )
}
