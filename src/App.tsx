import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NavBar } from '@/components/layout/nav-bar'
import { Footer } from '@/components/layout/footer'
import HomePage from '@/pages/home-page'
import NotFound from '@/pages/not-found'

const AboutPage = lazy(() => import('@/pages/about-page'))
const ProjectsPage = lazy(() => import('@/pages/projects-page'))
const BlogIndex = lazy(() => import('@/pages/blog-index'))
const BlogPost = lazy(() => import('@/pages/blog-post'))
const ChordLibraryPage = lazy(() => import('@/components/guitar/chord-library-page'))
const SkiArtPage = lazy(() => import('@/components/ski-art/ski-art-page'))
const LickLibraryPage = lazy(() => import('@/components/licks/lick-library-page'))

function Loading() {
  return (
    <div className="container mx-auto flex items-center justify-center px-4 py-24">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/guitar/chord-library" element={<ChordLibraryPage />} />
              <Route path="/projects/minimalist-ski-art" element={<SkiArtPage />} />
              <Route path="/projects/guitar/lick-library" element={<LickLibraryPage />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
