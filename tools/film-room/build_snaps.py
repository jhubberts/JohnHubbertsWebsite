"""Builds the Film Room's real-snap data from nflverse release files.

Reads three files for each season, cached in tools/film-room/data/. Each file comes from the
https://github.com/nflverse/nflverse-data/releases release named before its slash:

  pbp_participation/pbp_participation_<season>.csv   coverage type, pass rushers, personnel
  ftn_charting/ftn_charting_<season>.csv             motion, blitzers, starting hash
  pbp/play_by_play_<season>.csv.gz                   teams, down, distance, field position, text

and writes the files the site uses:

  src/lib/film-room/data/tendencies.json  how often each defense played each coverage, by
                                          situation, and how it rushed behind each coverage
  public/film-room/real-snaps.json        every charted dropback with a coverage the Film Room
                                          knows, one row per snap
  public/film-room/plays/<TEAM>.json      the play-by-play text of each of that defense's snaps,
                                          by row number, fetched only after a reveal

Cover 9, combination coverages and blown coverages count as "other" in the tendencies and are
left out of the snaps, as are rushes of three or fewer (also left out of the rush counts) and
personnel groups the Film Room does not draw. Which rush the Film Room can draw
behind which coverage is decided by the site (`pressuresWith` in play.ts), not here.

The charting is FTN Data's, released by nflverse under CC BY-SA 4.0; the files written here carry
the same license and attribution.

Usage, from the repository root:

  python3 tools/film-room/build_snaps.py 2024 2025

It downloads the six files (about 156 MB) into tools/film-room/data/ unless they are already
there.
"""

from __future__ import annotations

import csv
import gzip
import json
import re
import subprocess
import sys
import time
import urllib.request
from collections import defaultdict
from collections.abc import Iterator
from pathlib import Path

COVERAGES = ['cover0', 'cover1', 'cover2', 'tampa2', 'twoMan', 'cover3', 'cover4', 'cover6']
PRESSURES = ['four', 'sim', 'blitz', 'zero']
FTN_COVERAGE = {
    'COVER_0': 'cover0',
    'COVER_1': 'cover1',
    'COVER_2': 'cover2',
    '2_MAN': 'twoMan',
    'COVER_3': 'cover3',
    'COVER_4': 'cover4',
    'COVER_6': 'cover6',
}
# Personnel as "backs, tight ends" digits, folded into the three groups the Film Room draws.
PERSONNEL_GROUPS = {'11': '11', '10': '11', '01': '11', '00': '11', '12': '12', '13': '12',
                    '02': '12', '21': '21', '22': '21', '20': '21'}
# FTN's starting hash as the site's ball spot; a snap without one counts as the middle.
HASH = {'L': -1, 'M': 0, 'R': 1}
# The longest play description written, in characters.
DESC_LIMIT = 140
PBP_FIELDS = ('posteam', 'defteam', 'down', 'ydstogo', 'week', 'yardline_100', 'desc')
ATTRIBUTION = 'Charting by FTN Data via nflverse (CC BY-SA 4.0); play-by-play from nflverse.'
LICENSE = 'CC BY-SA 4.0'
# The tendencies' key for the whole league; tendencies.ts reads it as LEAGUE.
LEAGUE = 'NFL'

REPO = Path(__file__).resolve().parents[2]
DATA_DIR = REPO / 'tools' / 'film-room' / 'data'
RELEASES = 'https://github.com/nflverse/nflverse-data/releases/download'
TENDENCIES_OUT = REPO / 'src/lib/film-room/data/tendencies.json'
SNAPS_OUT = REPO / 'public/film-room/real-snaps.json'
PLAYS_DIR = REPO / 'public/film-room/plays'

started = time.monotonic()


def log(message: str) -> None:
    """Prints a progress line with the clock time and the seconds since the script started."""
    elapsed = time.monotonic() - started
    print(f'[{time.strftime("%H:%M:%S")} +{elapsed:5.1f}s] {message}', flush=True)


def read(path: Path) -> Iterator[dict[str, str]]:
    """The rows of a CSV file, gzipped or not, as dicts keyed by column name."""
    handle = gzip.open(path, 'rt', newline='') if path.suffix == '.gz' else open(path, newline='')
    with handle:
        yield from csv.DictReader(handle)


def bucket(down: int, distance: int) -> str:
    """The situation a snap counts under. Must match `bucketFor` in src/lib/film-room/tendencies.ts.

    Fourth downs count with third downs.
    """
    if down < 3:
        return 'early'
    if distance <= 3:
        return 'thirdShort'
    return 'thirdMedium' if distance <= 6 else 'thirdLong'


def pressure_for(coverage: str, rushers: int, blitzers: int) -> str | None:
    """The rush in the Film Room's terms, or None for three or fewer rushers, which it never draws.

    Any Cover 0 is the all-out blitz, and five or more rushers behind another coverage is a blitz.
    """
    if coverage == 'cover0':
        return 'zero'
    if rushers <= 3:
        return None
    if rushers == 4:
        return 'sim' if blitzers >= 1 else 'four'
    return 'blitz'


def personnel(text: str) -> str | None:
    """The group for personnel text such as "1 RB, 1 FB, 1 TE, 2 WR", or None for a group not drawn.

    Running backs and fullbacks both count as backs.
    """
    backs = sum(int(n) for n in re.findall(r'(\d) (?:RB|FB)\b', text))
    te = re.search(r'(\d) TE', text)
    return PERSONNEL_GROUPS.get(f'{backs}{te.group(1) if te else 0}')


def describe(text: str) -> str:
    """The play-by-play text without its leading game clock, trimmed to DESC_LIMIT."""
    text = re.sub(r'^\(\d*:\d+\)\s*', '', ' '.join(text.split()))
    return text if len(text) <= DESC_LIMIT else text[: DESC_LIMIT - 1].rstrip() + '…'


def format_json(paths: list[Path]) -> None:
    """Formats JSON with the repository's prettier, so a rerun leaves `npm run format` clean."""
    try:
        subprocess.run(['npx', 'prettier', '--write', *map(str, paths)], cwd=REPO, check=True)
    except (OSError, subprocess.CalledProcessError) as error:
        log(f'prettier did not run ({error}); the JSON is correct but unformatted')


def fetch(release: str, name: str) -> Path:
    """The path of one release file, downloading it into DATA_DIR if it is not there yet."""
    path = DATA_DIR / name
    if not path.exists():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        log(f'downloading {release}/{name}')
        partial = path.with_suffix(path.suffix + '.part')
        urllib.request.urlretrieve(f'{RELEASES}/{release}/{name}', partial)
        partial.rename(path)
    return path


def main() -> None:
    seasons = [int(s) for s in sys.argv[1:]]
    if not seasons:
        sys.exit('usage: python3 tools/film-room/build_snaps.py SEASON [SEASON ...]')
    coverage_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    pressure_counts = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    charted = defaultdict(int)
    snaps = []
    descriptions = defaultdict(dict)
    for season in seasons:
        log(f'{season}: reading play-by-play')
        plays = {
            (r['game_id'], r['play_id']): {k: r[k] for k in PBP_FIELDS}
            for r in read(fetch('pbp', f'play_by_play_{season}.csv.gz'))
            if r['qb_dropback'] == '1' and r['down'] in ('1', '2', '3', '4')
        }
        log(f'{season}: {len(plays)} dropbacks; reading FTN charting')
        ftn = {
            (r['nflverse_game_id'], r['nflverse_play_id']):
                (r['n_blitzers'], r['is_motion'], r['starting_hash'])
            for r in read(fetch('ftn_charting', f'ftn_charting_{season}.csv'))
        }
        log(f'{season}: reading participation')
        charted_in_season = 0
        for row in read(fetch('pbp_participation', f'pbp_participation_{season}.csv')):
            key = (row['nflverse_game_id'], row['play_id'])
            play = plays.get(key)
            charting = ftn.get(key)
            if not play or not charting or not row['defense_coverage_type']:
                continue
            charted_in_season += 1
            if charted_in_season % 5000 == 0:
                log(f'{season}: {charted_in_season} charted dropbacks so far')
            defense, down, distance = play['defteam'], int(play['down']), int(play['ydstogo'])
            coverage = FTN_COVERAGE.get(row['defense_coverage_type'], 'other')
            for team in (LEAGUE, defense):
                charted[team] += 1
                coverage_counts[team][bucket(down, distance)][coverage] += 1
            if coverage == 'other':
                continue
            n_blitzers, is_motion, starting_hash = charting
            rushers = int(row['number_of_pass_rushers'] or 0)
            blitzers = int(n_blitzers or 0)
            pressure = pressure_for(coverage, rushers, blitzers)
            if pressure is None:
                continue
            for team in (LEAGUE, defense):
                pressure_counts[team][coverage][pressure] += 1
            group = personnel(row['offense_personnel'])
            if group is None:
                continue
            # A snap's id is its row in real-snaps.json, which also keys its play description.
            descriptions[defense][len(snaps)] = describe(play['desc'])
            snaps.append({
                'season': season,
                'week': int(play['week']),
                'offense': play['posteam'],
                'defense': defense,
                'down': down,
                'distance': distance,
                'yardsToGoal': int(float(play['yardline_100'])),
                'coverage': COVERAGES.index(coverage),
                'pressure': PRESSURES.index(pressure),
                'rushers': rushers,
                'blitzers': blitzers,
                'motion': 1 if is_motion == 'TRUE' else 0,
                'personnel': group,
                'hash': HASH.get(starting_hash, 0),
            })
        log(f'{season}: {charted_in_season} charted dropbacks, {len(snaps)} snaps in total')

    fields = list(snaps[0])
    TENDENCIES_OUT.parent.mkdir(parents=True, exist_ok=True)
    PLAYS_DIR.mkdir(parents=True, exist_ok=True)
    TENDENCIES_OUT.write_text(json.dumps({
        'attribution': ATTRIBUTION,
        'license': LICENSE,
        'seasons': seasons,
        'teams': {
            team: {
                'charted': charted[team],
                'coverage': {s: dict(c) for s, c in coverage_counts[team].items()},
                'pressure': {c: dict(p) for c, p in pressure_counts[team].items()},
            }
            for team in sorted(charted, key=lambda t: (t != LEAGUE, t))
        },
    }) + '\n')
    SNAPS_OUT.write_text(json.dumps({
        'attribution': ATTRIBUTION,
        'license': LICENSE,
        'seasons': seasons,
        'coverages': COVERAGES,
        'pressures': PRESSURES,
        'fields': fields,
        'snaps': [[snap[f] for f in fields] for snap in snaps],
    }, separators=(',', ':')) + '\n')
    for team, texts in descriptions.items():
        (PLAYS_DIR / f'{team}.json').write_text(
            json.dumps(texts, separators=(',', ':'), ensure_ascii=False) + '\n')
    format_json([TENDENCIES_OUT])
    log(f'wrote {TENDENCIES_OUT.relative_to(REPO)} ({TENDENCIES_OUT.stat().st_size} bytes)')
    snaps_size = SNAPS_OUT.stat().st_size
    log(f'wrote {SNAPS_OUT.relative_to(REPO)} ({snaps_size} bytes, {len(snaps)} snaps)')
    log(f'wrote {len(descriptions)} files in {PLAYS_DIR.relative_to(REPO)}')


if __name__ == '__main__':
    main()
