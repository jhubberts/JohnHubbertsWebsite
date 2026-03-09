import type { ArtSettings } from '@/lib/ski-art'
import { ASPECT_RATIOS } from '@/lib/ski-art'

interface SkiArtControlsProps {
  settings: ArtSettings
  onSettingsChange: (settings: ArtSettings) => void
  onFileUpload: (file: File) => void
  error: string | null
  autoRotate: boolean
  onAutoRotateChange: (on: boolean) => void
  rotationSpeed: number
  onRotationSpeedChange: (speed: number) => void
}

export function SkiArtControls({
  settings,
  onSettingsChange,
  onFileUpload,
  error,
  autoRotate,
  onAutoRotateChange,
  rotationSpeed,
  onRotationSpeedChange,
}: SkiArtControlsProps) {
  const update = (partial: Partial<ArtSettings>) => {
    onSettingsChange({ ...settings, ...partial })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Minimalist Ski Art</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Turn a GPS ski track into minimalist wall art.
        </p>
      </div>

      {/* File upload */}
      <div>
        <label className="text-sm font-medium">Import GPX File</label>
        <input
          type="file"
          accept=".gpx"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileUpload(file)
          }}
          className="border-input mt-1 block w-full rounded-md border px-3 py-2 text-sm"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      {/* Viewing angle */}
      <div>
        <label className="text-sm font-medium">
          Viewing Angle: {Math.round(settings.angleDegrees)}°
        </label>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={settings.angleDegrees}
          onChange={(e) => update({ angleDegrees: Number(e.target.value) })}
          className="mt-1 w-full"
        />
      </div>

      {/* Auto-rotate */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => onAutoRotateChange(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Auto-Rotate
        </label>
        {autoRotate && (
          <div className="mt-2">
            <label className="text-muted-foreground text-xs">
              Speed: {rotationSpeed.toFixed(1)}°/s
            </label>
            <input
              type="range"
              min={5}
              max={90}
              step={1}
              value={rotationSpeed}
              onChange={(e) => onRotationSpeedChange(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Start Color</label>
          <input
            type="color"
            value={settings.startColor}
            onChange={(e) => update({ startColor: e.target.value })}
            className="mt-1 block h-9 w-full cursor-pointer rounded border"
          />
        </div>
        <div>
          <label className="text-sm font-medium">End Color</label>
          <input
            type="color"
            value={settings.endColor}
            onChange={(e) => update({ endColor: e.target.value })}
            className="mt-1 block h-9 w-full cursor-pointer rounded border"
          />
        </div>
      </div>

      {/* Line thickness */}
      <div>
        <label className="text-sm font-medium">
          Line Thickness: {settings.strokeWidth.toFixed(1)}
        </label>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.1}
          value={settings.strokeWidth}
          onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
          className="mt-1 w-full"
        />
      </div>

      {/* Margin */}
      <div>
        <label className="text-sm font-medium">Margin: {Math.round(settings.margin * 100)}%</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.margin}
          onChange={(e) => update({ margin: Number(e.target.value) })}
          className="mt-1 w-full"
        />
      </div>

      {/* Matting */}
      <div>
        <label className="text-sm font-medium">
          Matting: {Math.round(settings.mattingPercent * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.mattingPercent}
          onChange={(e) => update({ mattingPercent: Number(e.target.value) })}
          className="mt-1 w-full"
        />
      </div>

      {settings.mattingPercent > 0 && (
        <div>
          <label className="text-sm font-medium">Matting Color</label>
          <input
            type="color"
            value={settings.mattingColor}
            onChange={(e) => update({ mattingColor: e.target.value })}
            className="mt-1 block h-9 w-full cursor-pointer rounded border"
          />
        </div>
      )}

      {/* Aspect ratio */}
      <div>
        <label className="text-sm font-medium">Aspect Ratio</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {Object.keys(ASPECT_RATIOS).map((ratio) => (
            <button
              key={ratio}
              onClick={() => update({ aspectRatio: ratio })}
              className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                settings.aspectRatio === ratio
                  ? 'bg-foreground text-background border-transparent'
                  : 'border-input hover:bg-muted'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
