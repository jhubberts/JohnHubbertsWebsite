import type { TrackPoint, ProjectedPoint } from './types'

export function projectTrackpoints(
  points: TrackPoint[],
  angleDegrees: number,
  width: number,
  height: number,
  padding = 0.05,
): ProjectedPoint[] {
  if (points.length === 0) return []

  // Compute centroid
  let latSum = 0
  let lonSum = 0
  for (const p of points) {
    latSum += p.lat
    lonSum += p.lon
  }
  const latCenter = latSum / points.length
  const lonCenter = lonSum / points.length

  // Longitude correction factor for latitude distortion
  const lonCorrection = Math.cos((latCenter * Math.PI) / 180)

  // Project each point
  const thetaRad = (angleDegrees * Math.PI) / 180
  const cosTheta = Math.cos(thetaRad)
  const sinTheta = Math.sin(thetaRad)

  const rawX: number[] = []
  const rawY: number[] = []

  for (const p of points) {
    const relLon = (p.lon - lonCenter) * lonCorrection
    const relLat = p.lat - latCenter
    rawX.push(relLon * cosTheta + relLat * sinTheta)
    rawY.push(p.ele)
  }

  // Find bounds
  let xMin = rawX[0]
  let xMax = rawX[0]
  let yMin = rawY[0]
  let yMax = rawY[0]

  for (let i = 1; i < rawX.length; i++) {
    if (rawX[i] < xMin) xMin = rawX[i]
    if (rawX[i] > xMax) xMax = rawX[i]
    if (rawY[i] < yMin) yMin = rawY[i]
    if (rawY[i] > yMax) yMax = rawY[i]
  }

  const xRange = xMax - xMin || 1
  const yRange = yMax - yMin || 1

  const usableW = width * (1 - 2 * padding)
  const usableH = height * (1 - 2 * padding)
  const offsetX = width * padding
  const offsetY = height * padding

  // Stretch to fill aspect ratio independently
  const projected: ProjectedPoint[] = []
  for (let i = 0; i < points.length; i++) {
    projected.push({
      x: ((rawX[i] - xMin) / xRange) * usableW + offsetX,
      y: (1 - (rawY[i] - yMin) / yRange) * usableH + offsetY,
    })
  }

  return projected
}
