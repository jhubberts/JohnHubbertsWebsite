import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function Placeholder({ name }: { name: string }) {
  return <div style={{ padding: '2rem' }}><h1>{name}</h1><p>Coming soon...</p></div>
}

function App() {
  return (
    <BrowserRouter>
      <div className="appBody">
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <a href="/" style={{ fontWeight: 'bold', marginRight: '1rem' }}>John Hubberts</a>
        </nav>
        <Routes>
          <Route path="/" element={<Placeholder name="Home" />} />
          <Route path="/projects/guitar/chord-library" element={<Placeholder name="Chord Library" />} />
          <Route path="/projects/guitar/fretboard" element={<Placeholder name="Fretboard" />} />
          <Route path="/projects/guitar/dijkstras" element={<Placeholder name="Dijkstra's Chord Progression" />} />
          <Route path="/blog" element={<Placeholder name="Blog" />} />

          {/* Redirects for old URLs */}
          <Route path="/guitar/chordLibrary" element={<Navigate to="/projects/guitar/chord-library" replace />} />
          <Route path="/guitar/fretboard" element={<Navigate to="/projects/guitar/fretboard" replace />} />
          <Route path="/guitar/dijkstras" element={<Navigate to="/projects/guitar/dijkstras" replace />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />

          <Route path="*" element={<Placeholder name="404 - Not Found" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
