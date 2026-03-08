import type { TrackPoint } from './types'

export function parseGpx(xmlString: string): TrackPoint[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Invalid GPX file')
  }

  const trkpts = doc.querySelectorAll('trkpt')
  if (trkpts.length === 0) {
    throw new Error('No trackpoints found in GPX file')
  }

  const points: TrackPoint[] = []
  for (const pt of trkpts) {
    const lat = parseFloat(pt.getAttribute('lat') ?? '')
    const lon = parseFloat(pt.getAttribute('lon') ?? '')
    const eleEl = pt.querySelector('ele')
    const timeEl = pt.querySelector('time')

    if (isNaN(lat) || isNaN(lon) || !eleEl?.textContent) continue

    points.push({
      lat,
      lon,
      ele: parseFloat(eleEl.textContent),
      time: timeEl?.textContent ? new Date(timeEl.textContent).getTime() : 0,
    })
  }

  if (points.length === 0) {
    throw new Error('No valid trackpoints with elevation data found')
  }

  return points
}
