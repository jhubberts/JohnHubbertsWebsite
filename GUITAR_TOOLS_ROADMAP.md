# Guitar Tools Suite — Project Roadmap

> A suite of technical tools that leverage automation to supercharge music theory
> internalization for an experienced improviser transitioning from saxophone to guitar.

**Last updated:** 2026-03-28

---

## What Already Exists

The current codebase (`JohnHubbertsWebsite`) is a React 19 + TypeScript + Vite 6 + Tailwind 4
personal site with a substantial guitar library already built:

| Asset | Location | What It Does |
|---|---|---|
| `Chord` / `ChordLibrary` | `src/lib/guitar/chord.ts` | Chord representation, transposition, 100+ voicings with inversions |
| `Note` | `src/lib/guitar/note.ts` | Note model, frequency calc (A440 equal temperament), transposition |
| `Synth` | `src/lib/guitar/synth.ts` | Web Audio API playback (sine wave oscillators) |
| `Fretboard` | `src/lib/guitar/fretboard.ts` | Standard tuning fretboard model |
| `FingeringChart` | `src/lib/guitar/fingering-chart.ts` | Canvas 2D chord diagram renderer with hitbox detection |
| `ProgressionSolver` | `src/lib/guitar/progression-solver.ts` | Dijkstra's algorithm for optimal chord voicing paths |
| Chord data | `src/lib/guitar/data/` | JSON files: maj7, min7, 7, maj9, min9, dim7, min7b5, etc. |
| Substitutions | `src/lib/guitar/data/substitutions.json` | Chord substitution mappings |
| `ChordExplorer` | `src/components/guitar/chord-explorer.tsx` | Interactive chord browser UI |
| `GuitarFingering` | `src/components/guitar/guitar-fingering.tsx` | React wrapper for canvas fingering charts |
| shadcn/ui | `src/components/ui/` | Card, Dialog, Select, Button, Input, Command — ready to use |

---

## Technical Landscape: Solved vs. Greenfield

### Solved / Off-the-Shelf

| Problem | Solution | Maturity |
|---|---|---|
| Music theory computation (intervals, scales, chord detection, transposition) | **tonal.js** — pure TS, tiny bundle, functional API | Production-ready |
| Standard notation + tab rendering | **VexFlow 5** — TypeScript, Canvas/SVG, rich guitar tab (bends, slides, hammer-ons) | Production-ready |
| Music theory data (all scales, modes, chord types) | **tonal.js** | Production-ready |
| Audio transcription (audio -> MIDI) | **@spotify/basic-pitch** — runs in-browser via TensorFlow.js, no server needed | Production-ready |
| MIDI playback / synthesis | **Tone.js** — full Web Audio framework, samplers, effects | Production-ready |
| SoundFont playback | **soundfont-player** or Tone.js Sampler | Production-ready |

### Mostly Solved (need glue / customization)

| Problem | Approach | Effort |
|---|---|---|
| Auto-tab generation (notation -> fret assignment) | DP/shortest-path algorithm. Multiple open-source reference implementations exist. You already have Dijkstra's infra. | Medium |
| Transposing licks to all 12 keys | tonal.js `Note.transpose()` + re-render. Data model needs to support this cleanly. | Low |
| Chord tone analysis ("why does this lick work here?") | tonal.js `Chord.get()` + `Scale.get()` + interval math against backing chord. Custom UI to annotate each note. | Medium |

### Greenfield (you're building it)

| Problem | Why It's New | Effort |
|---|---|---|
| Lick Library data model + UX | No existing "lick library" product matches your spec. Custom JSON schema + UI. | High |
| "Why it works" theory engine | Combining chord tone analysis, scale degree labeling, substitution suggestions into a coherent UX. | High |
| Browser notation input (mini-DAW) | No open-source browser notation editor exists. Options: build on VexFlow or embed Flat.io. | High (DIY) or Low (Flat.io) |
| React guitar component library (open-source quality) | Your existing components need API design, documentation, theming, and packaging for OSS. | High |

---

## Recommended Tech Stack Additions

```
tonal              — music theory engine (intervals, scales, chords, detection)
vexflow            — notation + tablature rendering (TypeScript, Canvas/SVG)
tone               — audio playback with real instrument sounds
@spotify/basic-pitch — audio-to-MIDI transcription (stretch goal, runs in browser)
```

---

## Phased Roadmap

### Phase 0 — Foundation (1-2 weekends)
> Goal: Get tonal.js and VexFlow integrated, render a hardcoded lick with notation + tab.

### Phase 1 — Lick Library Core (3-4 weekends)
> Goal: Add licks via JSON, see them rendered with notation + tab, transpose to any key.

### Phase 2 — Theory Engine: "Why It Works" (3-4 weekends)
> Goal: For each lick, show why each note makes sense over the backing chords.

### Phase 3 — Auto-Tabs (2-3 weekends)
> Goal: Given standard notation, automatically generate optimal guitar tablature.

### Phase 4 — Music Intake: Simple Editor (3-4 weekends)
> Goal: A lightweight browser UI for entering short musical passages without writing JSON.

### Phase 5 — React Guitar Component Library (ongoing)
> Goal: Extract, polish, and package your guitar components for open source.

### Phase 6 — Stretch Goals
- OMR (Image -> Notation)
- Audio Transcription (Audio -> Notation)
- LLM Theory Assistant

---

## Dependency Graph

```
Phase 0 (VexFlow + tonal)
    |
    +-- Phase 1 (Lick Library Core)
    |       |
    |       +-- Phase 2 (Theory Engine)
    |       |
    |       +-- Phase 3 (Auto-Tabs)
    |
    +-- Phase 4 (Music Intake)

Phase 5 (Component Library) <- runs in parallel, extracting from phases 0-4
```

**Total to core functionality (Phases 0-3): ~13 weekends / ~3 months of weekends.**
