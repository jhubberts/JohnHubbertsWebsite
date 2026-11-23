import { describe, expect, it } from 'vitest'
import { inHundred } from './format'

describe('inHundred', () => {
  it('rounds to a whole number out of 100', () => {
    expect(inHundred(0.4706)).toBe('47 in 100')
    expect(inHundred(0.0824)).toBe('8 in 100')
    expect(inHundred(0.5)).toBe('50 in 100')
    expect(inHundred(1)).toBe('100 in 100')
  })

  it('says less than 1 in 100 for a small number above zero', () => {
    expect(inHundred(0.0049)).toBe('less than 1 in 100')
    expect(inHundred(0.0001)).toBe('less than 1 in 100')
  })

  it('shows 1 in 100 once the number rounds up to 1', () => {
    expect(inHundred(0.005)).toBe('1 in 100')
  })

  it('shows 0 in 100 for exactly zero', () => {
    expect(inHundred(0)).toBe('0 in 100')
  })
})
