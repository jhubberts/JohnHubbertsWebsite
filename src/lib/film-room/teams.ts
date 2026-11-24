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
