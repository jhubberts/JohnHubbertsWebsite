/**
 * How a recorded likelihood (0..1) is shown to the reader: "{n} in 100", with n rounded to a whole
 * number, or "less than 1 in 100" when the number is above 0 but would round to 0.
 */
export function inHundred(likelihood: number): string {
  const n = Math.round(likelihood * 100)
  if (n === 0 && likelihood > 0) return 'less than 1 in 100'
  return `${n} in 100`
}
