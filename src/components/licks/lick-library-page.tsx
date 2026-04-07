import { useState, useRef, useMemo, useCallback } from 'react'
import LickNotation from './lick-notation'
import type { LickNotationHandle } from './lick-notation'
import LickAnalysisPanel from './lick-analysis-panel'
import { exampleLicks } from '@/lib/licks/data/example-licks'
import { transposeLick, LickPlayer, analyzeLick, DEFAULT_PREFERENCES } from '@/lib/licks'
import type { Lick, TabPreferences } from '@/lib/licks'

const ALL_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const LickLibraryPage = () => {
  const [baseLick, setBaseLick] = useState<Lick>(exampleLicks[0])
  const [selectedKey, setSelectedKey] = useState<string>(exampleLicks[0].key)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTabSettings, setShowTabSettings] = useState(false)
  const [tabPrefs, setTabPrefs] = useState<Partial<TabPreferences>>({})

  const playerRef = useRef<LickPlayer | null>(null)
  const notationRef = useRef<LickNotationHandle>(null)

  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = new LickPlayer()
    }
    return playerRef.current
  }, [])

  const displayedLick = useMemo(
    () => transposeLick(baseLick, selectedKey),
    [baseLick, selectedKey],
  )

  const analysis = useMemo(() => analyzeLick(displayedLick), [displayedLick])

  // Collect all unique tags across licks
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    for (const lick of exampleLicks) {
      lick.tags?.forEach((t) => tags.add(t))
    }
    return [...tags].sort()
  }, [])

  // Filter licks by search and tag
  const filteredLicks = useMemo(() => {
    return exampleLicks.filter((lick) => {
      const matchesSearch =
        !searchQuery ||
        lick.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lick.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lick.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesTag = !activeTag || lick.tags?.includes(activeTag)

      return matchesSearch && matchesTag
    })
  }, [searchQuery, activeTag])

  const handleLickChange = (lick: Lick) => {
    getPlayer().stop()
    notationRef.current?.highlightNote(-1)
    setIsPlaying(false)
    setBaseLick(lick)
    setSelectedKey(lick.key)
  }

  const handlePlay = async () => {
    if (isPlaying) {
      getPlayer().stop()
      notationRef.current?.highlightNote(-1)
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    await getPlayer().play(displayedLick, {
      onNoteStart: (index) => {
        notationRef.current?.highlightNote(index)
      },
      onFinish: () => setIsPlaying(false),
    })
  }

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? null : tag)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-3xl font-bold">Lick Library</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search licks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
            />
          </div>

          {/* Tag filter */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                    activeTag === tag
                      ? 'bg-foreground text-background'
                      : 'bg-accent/40 hover:bg-accent/60'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Lick list */}
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Licks ({filteredLicks.length})
            </h2>
            <div className="flex flex-col gap-1">
              {filteredLicks.map((lick) => (
                <button
                  key={lick.id}
                  onClick={() => handleLickChange(lick)}
                  className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    baseLick.id === lick.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="font-medium">{lick.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {lick.key} | {lick.backingChords.map((c) => c.symbol).join(' - ')}
                  </div>
                </button>
              ))}
              {filteredLicks.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">No licks match.</p>
              )}
            </div>
          </div>

          {/* Transpose */}
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Transpose
            </h2>
            <div className="flex flex-wrap gap-1">
              {ALL_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`rounded px-2 py-1 font-mono text-xs transition-colors ${
                    selectedKey === key
                      ? 'bg-foreground text-background'
                      : 'bg-accent/30 hover:bg-accent/60'
                  } ${key === baseLick.key ? 'ring-1 ring-foreground/30' : ''}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Settings */}
          <div className="mb-6">
            <button
              onClick={() => setShowTabSettings(!showTabSettings)}
              className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Tab Settings {showTabSettings ? '−' : '+'}
            </button>
            {showTabSettings && (
              <div className="flex flex-col gap-3">
                <TabSlider
                  label="Position"
                  hint="Prefer frets near this position"
                  value={tabPrefs.targetFret ?? DEFAULT_PREFERENCES.targetFret}
                  min={0}
                  max={12}
                  onChange={(v) => setTabPrefs((p) => ({ ...p, targetFret: v }))}
                />
                <TabSlider
                  label="Open strings"
                  hint="Negative = prefer open strings"
                  value={tabPrefs.openStringBonus ?? DEFAULT_PREFERENCES.openStringBonus}
                  min={-2}
                  max={2}
                  step={0.5}
                  onChange={(v) => setTabPrefs((p) => ({ ...p, openStringBonus: v }))}
                />
                <TabSlider
                  label="Stretch penalty"
                  hint="Higher = avoid large stretches"
                  value={tabPrefs.stretchPenalty ?? DEFAULT_PREFERENCES.stretchPenalty}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={(v) => setTabPrefs((p) => ({ ...p, stretchPenalty: v }))}
                />
                <button
                  onClick={() => setTabPrefs({})}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset to defaults
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-12 md:col-span-9">
          {/* Header + play button */}
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{displayedLick.name}</h2>
                {displayedLick.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {displayedLick.description}
                  </p>
                )}
              </div>
              <button
                onClick={handlePlay}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isPlaying
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                }`}
              >
                {isPlaying ? (
                  <>
                    <StopIcon />
                    Stop
                  </>
                ) : (
                  <>
                    <PlayIcon />
                    Play
                  </>
                )}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Key: {displayedLick.key}</span>
              <span>
                Time: {displayedLick.timeSignature[0]}/{displayedLick.timeSignature[1]}
              </span>
              {displayedLick.tempo && <span>Tempo: {displayedLick.tempo} BPM</span>}
              {displayedLick.source?.artist && (
                <span>Style: {displayedLick.source.artist}</span>
              )}
            </div>
          </div>

          {/* Notation */}
          <div className="rounded-lg border bg-card p-4">
            <LickNotation ref={notationRef} lick={displayedLick} noteAnalyses={analysis.noteAnalyses} tabPreferences={tabPrefs} />
          </div>

          {/* Theory analysis */}
          <div className="mt-4 rounded-lg border bg-card p-4">
            <LickAnalysisPanel analysis={analysis} />
          </div>

          {/* Backing chords + source */}
          <div className="mt-4 flex flex-wrap gap-6">
            {displayedLick.backingChords.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Backing Chords
                </h3>
                <div className="flex gap-2">
                  {displayedLick.backingChords.map((chord, i) => (
                    <span
                      key={i}
                      className="rounded bg-accent/30 px-3 py-1 font-mono text-sm"
                    >
                      {chord.symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {displayedLick.source?.url && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Source</h3>
                <a
                  href={displayedLick.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-accent/30 px-3 py-1 text-sm hover:bg-accent/50"
                >
                  <LinkIcon />
                  {displayedLick.source.song || 'Listen'}
                  {displayedLick.source.timestamp != null && (
                    <span className="text-muted-foreground">
                      @ {formatTimestamp(displayedLick.source.timestamp)}
                    </span>
                  )}
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          {displayedLick.tags && displayedLick.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-1">
                {displayedLick.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                      activeTag === tag
                        ? 'bg-foreground text-background'
                        : 'bg-accent/40 hover:bg-accent/60'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Inline SVG icons to avoid extra deps
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function TabSlider({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium">{label}</label>
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-accent/40"
      />
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  )
}

export default LickLibraryPage
