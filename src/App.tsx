import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NavBar } from '@/components/layout/nav-bar'
import { Footer } from '@/components/layout/footer'
import HomePage from '@/pages/home-page'
import NotFound from '@/pages/not-found'

const BlogIndex = lazy(() => import('@/pages/blog-index'))
const BlogPost = lazy(() => import('@/pages/blog-post'))
const ChordLibraryPage = lazy(() => import('@/components/guitar/chord-library-page'))
const FretboardTestPage = lazy(() => import('@/components/guitar/fretboard-test-page'))
const DijkstrasChordProgression = lazy(
  () => import('@/components/guitar/dijkstras-chord-progression'),
)

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
              <Route path="/projects/guitar/chord-library" element={<ChordLibraryPage />} />
              <Route path="/projects/guitar/fretboard" element={<FretboardTestPage />} />
              <Route path="/projects/guitar/dijkstras" element={<DijkstrasChordProgression />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* Redirects for old URLs */}
              <Route
                path="/guitar/chordLibrary"
                element={<Navigate to="/projects/guitar/chord-library" replace />}
              />
              <Route
                path="/guitar/fretboard"
                element={<Navigate to="/projects/guitar/fretboard" replace />}
              />
              <Route
                path="/guitar/dijkstras"
                element={<Navigate to="/projects/guitar/dijkstras" replace />}
              />
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
