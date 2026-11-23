"""Fetch Fisher's iris data, check it, and write the setosa and versicolor rows the blog page plots.

Run from the repository root:

    python3 tools/ai-series/fetch_iris.py

It downloads the UCI repository's corrected copy, bezdekIris.data, into tools/ai-series/data/
(skipped when the file is already there). If that file cannot be fetched it downloads iris.data
from the same folder instead and corrects rows 35 and 38 to the values bezdekIris.data has. It
stops with an error if any check fails, and otherwise writes
src/lib/ai-series/flowers/iris.json: the 100 setosa and versicolor rows, in file order.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DATA_DIR = REPO / 'tools' / 'ai-series' / 'data'
OUT_PATH = REPO / 'src' / 'lib' / 'ai-series' / 'flowers' / 'iris.json'

FOLDER_URL = 'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/'
CORRECTED_FILE = 'bezdekIris.data'
ORIGINAL_FILE = 'iris.data'
# The two rows (counted from 1) where iris.data differs from Fisher's published values.
CORRECTIONS = {
    35: '4.9,3.1,1.5,0.2,Iris-setosa',
    38: '4.9,3.6,1.4,0.1,Iris-setosa',
}
FIRST_ROW = '5.1,3.5,1.4,0.2,Iris-setosa'
SPECIES = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica']
COLUMNS = ['sepalLength', 'sepalWidth', 'petalLength', 'petalWidth']


def fetch(name: str) -> str:
    """Returns the text of one file from the UCI folder, downloading it if it is not cached."""
    path = DATA_DIR / name
    if not path.exists():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(FOLDER_URL + name, timeout=30) as response:
            path.write_bytes(response.read())
    return path.read_text(encoding='ascii')


def load_rows() -> tuple[str, list[str]]:
    """Returns the URL used and the file's non-empty rows, corrected if the fallback was used."""
    try:
        return FOLDER_URL + CORRECTED_FILE, rows_of(fetch(CORRECTED_FILE))
    except OSError as error:
        print(f'{CORRECTED_FILE} could not be fetched ({error}); using {ORIGINAL_FILE}')
    rows = rows_of(fetch(ORIGINAL_FILE))
    for number, row in CORRECTIONS.items():
        rows[number - 1] = row
    return FOLDER_URL + ORIGINAL_FILE, rows


def rows_of(text: str) -> list[str]:
    return [line.strip() for line in text.splitlines() if line.strip()]


def check(rows: list[str]) -> None:
    """Exits with a message if the rows are not the 150 expected ones."""
    failures = []
    if len(rows) != 150:
        failures.append(f'expected 150 rows, found {len(rows)}')
    counts = {name: sum(row.endswith(',' + name) for row in rows) for name in SPECIES}
    for name, count in counts.items():
        if count != 50:
            failures.append(f'expected 50 rows of {name}, found {count}')
    if rows[:1] != [FIRST_ROW]:
        failures.append(f'row 1 is {rows[:1]}, expected {FIRST_ROW}')
    for number, expected in CORRECTIONS.items():
        found = rows[number - 1] if len(rows) >= number else None
        if found != expected:
            failures.append(f'row {number} is {found}, expected {expected}')
    for failure in failures:
        print('CHECK FAILED:', failure)
    if failures:
        sys.exit(1)
    print(f'Checks passed: 150 rows; {counts}; row 1, row 35 and row 38 as expected')


def main() -> None:
    source, rows = load_rows()
    check(rows)
    flowers = []
    for row in rows:
        *values, name = row.split(',')
        if name not in ('Iris-setosa', 'Iris-versicolor'):
            continue
        flower: dict[str, object] = {'species': name.removeprefix('Iris-')}
        flower.update(zip(COLUMNS, (float(value) for value in values)))
        flowers.append(flower)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    document = {'source': source, 'columns': COLUMNS, 'unit': 'cm', 'flowers': flowers}
    text = json.dumps(document, indent=2)
    # Keep the column names on one line, as Prettier formats the file.
    text = text.replace(json.dumps(COLUMNS, indent=2).replace('\n', '\n  '), json.dumps(COLUMNS))
    OUT_PATH.write_text(text + '\n', encoding='utf-8')
    print(f'Wrote {len(flowers)} flowers to {OUT_PATH.relative_to(REPO)}')


if __name__ == '__main__':
    main()
