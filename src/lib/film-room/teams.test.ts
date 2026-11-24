import { describe, expect, it } from 'vitest'
import { uniform } from './teams'

describe('uniform', () => {
  it('dresses the home team in its colors and the visitors in white with their color', () => {
    expect(uniform('CHI', true)).toEqual({ fill: '#0B162A', trim: '#C83803', ink: '#FFFFFF' })
    expect(uniform('GB', false)).toEqual({ fill: '#F8FAFC', trim: '#203731', ink: '#203731' })
  })

  it('uses whichever letters stand out more on the jersey', () => {
    expect(uniform('CIN', true).ink).toBe('#111827')
    expect(uniform('LAC', true).ink).toBe('#FFFFFF')
  })

  it('puts an unnamed or unknown opponent in plain white', () => {
    expect(uniform(null, true).fill).toBe('#F8FAFC')
    expect(uniform('XYZ', true).fill).toBe('#F8FAFC')
  })
})
