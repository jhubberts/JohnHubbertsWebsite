export interface TrackPoint {
  lat: number
  lon: number
  ele: number
  time: number
}

export interface ProjectedPoint {
  x: number
  y: number
}

export interface ArtSettings {
  angleDegrees: number
  startColor: string
  endColor: string
  strokeWidth: number
  aspectRatio: string
  margin: number // 0-1 fraction of min(width, height) / 3
}

export const ASPECT_RATIOS: Record<string, { w: number; h: number }> = {
  '16:9': { w: 1600, h: 900 },
  '4:3': { w: 1200, h: 900 },
  '3:2': { w: 1200, h: 800 },
  '1:1': { w: 1000, h: 1000 },
  '2:3': { w: 800, h: 1200 },
  '9:16': { w: 900, h: 1600 },
}

export const DEFAULT_SETTINGS: ArtSettings = {
  angleDegrees: 0,
  startColor: '#3b82f6',
  endColor: '#ef4444',
  strokeWidth: 1.5,
  aspectRatio: '16:9',
  margin: 0.15,
}
