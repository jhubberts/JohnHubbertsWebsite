/** The Film Room's home team: the offense in made-up plays, and first in the list of defenses. */
export const HOME_TEAM = 'CHI'

/** NFL team names by the abbreviations nflverse uses. */
const TEAM_NAMES: Record<string, string> = {
  ARI: 'Cardinals',
  ATL: 'Falcons',
  BAL: 'Ravens',
  BUF: 'Bills',
  CAR: 'Panthers',
  CHI: 'Bears',
  CIN: 'Bengals',
  CLE: 'Browns',
  DAL: 'Cowboys',
  DEN: 'Broncos',
  DET: 'Lions',
  GB: 'Packers',
  HOU: 'Texans',
  IND: 'Colts',
  JAX: 'Jaguars',
  KC: 'Chiefs',
  LA: 'Rams',
  LAC: 'Chargers',
  LV: 'Raiders',
  MIA: 'Dolphins',
  MIN: 'Vikings',
  NE: 'Patriots',
  NO: 'Saints',
  NYG: 'Giants',
  NYJ: 'Jets',
  PHI: 'Eagles',
  PIT: 'Steelers',
  SEA: 'Seahawks',
  SF: '49ers',
  TB: 'Buccaneers',
  TEN: 'Titans',
  WAS: 'Commanders',
}

/**
 * The team name for an nflverse abbreviation, such as "Bears" for CHI. An abbreviation not in the
 * table is returned unchanged.
 */
export function teamName(team: string): string {
  return TEAM_NAMES[team] ?? team
}

/** Each team's jersey color and its trim, as hex colors. */
const TEAM_COLORS: Record<string, [jersey: string, trim: string]> = {
  ARI: ['#97233F', '#FFB612'],
  ATL: ['#A71930', '#000000'],
  BAL: ['#241773', '#9E7C0C'],
  BUF: ['#00338D', '#C60C30'],
  CAR: ['#0085CA', '#101820'],
  CHI: ['#0B162A', '#C83803'],
  CIN: ['#FB4F14', '#000000'],
  CLE: ['#311D00', '#FF3C00'],
  DAL: ['#003594', '#869397'],
  DEN: ['#FB4F14', '#002244'],
  DET: ['#0076B6', '#B0B7BC'],
  GB: ['#203731', '#FFB612'],
  HOU: ['#03202F', '#A71930'],
  IND: ['#002C5F', '#A2AAAD'],
  JAX: ['#006778', '#D7A22A'],
  KC: ['#E31837', '#FFB81C'],
  LA: ['#003594', '#FFA300'],
  LAC: ['#0080C6', '#FFC20E'],
  LV: ['#000000', '#A5ACAF'],
  MIA: ['#008E97', '#FC4C02'],
  MIN: ['#4F2683', '#FFC62F'],
  NE: ['#002244', '#C60C30'],
  NO: ['#101820', '#D3BC8D'],
  NYG: ['#0B2265', '#A71930'],
  NYJ: ['#125740', '#FFFFFF'],
  PHI: ['#004C54', '#A5ACAF'],
  PIT: ['#101820', '#FFB612'],
  SEA: ['#002244', '#69BE28'],
  SF: ['#AA0000', '#B3995D'],
  TB: ['#D50A0A', '#34302B'],
  TEN: ['#0C2340', '#4B92DB'],
  WAS: ['#5A1414', '#FFB612'],
}

/** How a side's players are drawn: the jersey, its trim, and the color of the letters on it. */
export interface Uniform {
  fill: string
  trim: string
  ink: string
}

/** The plain white road jersey of an unnamed opponent. */
const PLAIN_WHITE: Uniform = { fill: '#F8FAFC', trim: '#1E293B', ink: '#1E293B' }

const DARK_INK = '#111827'

/** A color's relative luminance, as WCAG defines it: 0 for black, 1 for white. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** White or dark letters, whichever stands out more against `jersey`. */
function inkFor(jersey: string): string {
  const l = luminance(jersey)
  const onWhite = 1.05 / (l + 0.05)
  const onDark = (l + 0.05) / (luminance(DARK_INK) + 0.05)
  return onWhite >= onDark ? '#FFFFFF' : DARK_INK
}

/**
 * A team's uniform: its colors at home, white with its color as trim and letters on the road, as
 * on a broadcast. An unknown or unnamed team wears plain white.
 */
export function uniform(team: string | null, home: boolean): Uniform {
  const colors = team ? TEAM_COLORS[team] : undefined
  if (!colors) return PLAIN_WHITE
  const [jersey, trim] = colors
  if (!home) return { fill: '#F8FAFC', trim: jersey, ink: jersey }
  return { fill: jersey, trim, ink: inkFor(jersey) }
}
