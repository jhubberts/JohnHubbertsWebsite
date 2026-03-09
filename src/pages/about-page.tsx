export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="max-w-2xl">
        <h1 className="mb-6 text-4xl font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Professional software engineer with over a decade of experience building and shipping
          products. I've worked on distributed systems processing hundreds of TBs of data per day,
          embedded devices with KBs of RAM, and everything in between.
        </p>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          This site was built to host personal projects and writing about topics I'm interested in.
        </p>
      </section>
    </div>
  )
}
