import { SITE_PAGES } from '@/lib/site-pages'
import { useDocumentTitle } from '@/lib/use-document-title'

export default function AboutPage() {
  useDocumentTitle(SITE_PAGES.about.title)

  return (
    <div className="page-container pt-8 pb-16 md:pt-12">
      <div className="mx-auto max-w-[40rem]">
        <h1 className="page-title">About</h1>
        <p className="mt-6 font-serif text-lg leading-relaxed">
          Professional software engineer with over a decade of experience building and shipping
          products. I've worked on distributed systems processing hundreds of TBs of data per day,
          embedded devices with KBs of RAM, and everything in between.
        </p>
        <p className="mt-4 font-serif text-lg leading-relaxed">
          This site was built to host personal projects and writing about topics I'm interested in.
        </p>
      </div>
    </div>
  )
}
