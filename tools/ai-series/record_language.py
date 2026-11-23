"""Run GPT-2 and BERT once and record their real output as JSON for chapters 3 and 4 to replay.

Run from the repository root, with the project's virtual environment (see README.md):

    tools/ai-series/.venv/bin/python tools/ai-series/record_language.py
    tools/ai-series/.venv/bin/python tools/ai-series/record_language.py --only next-words

Sections, in the order a full run does them (each is a value of --only):

- models:     src/lib/ai-series/language/models.json
- next-words: src/lib/ai-series/language/next-words.json
- dice:       src/lib/ai-series/language/dice.json, and the full record in
              tools/ai-series/data/dice-all.json
- word-map:   src/lib/ai-series/language/word-map.json
- attention:  src/lib/ai-series/language/attention.json and attention-shown.json
- fill-in:    src/lib/ai-series/language/fill-in.json

Every run also rewrites tools/ai-series/data/review.txt from whichever of those files exist (for
dice, from dice-all.json): every piece of model text, for a person to check before it goes on a
page.

Model files are downloaded once into tools/ai-series/data/hf (HF_HOME). Everything runs on the CPU
with fixed seeds, so a second run writes byte-identical JSON. Progress lines, each starting with an
ISO timestamp, go to stdout and are appended to tools/ai-series/data/record_language.log.

Probabilities are the model's own softmax over its whole vocabulary, rounded to 4 decimals and never
renormalised. Token texts are kept exactly as the tokenizer decodes them, leading space included.

Shapes:

models.json
    { "transformers": "5.20.2", "torch": "2.7.1",
      "models": [ { "name": "gpt2", "class": "GPT2LMHeadModel", "revision": "<commit sha>",
                    "parameters": 124439808, "licence": "mit", "url": "https://huggingface.co/gpt2" } ] }

next-words.json
    { "model": "gpt2", "depth": 5, "starts": [ { "text": "...", "node": Node } ] }
    Node = { "choices": [ { "word": " don't", "p": 0.1234, "pieces"?: 2, "ends"?: true,
                            "next"?: Node } ],
             "other": 0.4321 }
    A choice is built from a candidate next token (the most probable tokens first, at least 40 of
    them). While the model's most probable token after it continues the same word (no leading
    space, not . , ! ?, not a newline, not end-of-text) with a probability above 0.5, that token is
    joined on, at most three times; the choice's probability is the product. "pieces" is the number
    of tokens joined (left out when 1). The result counts as a choice if it is one of . , ! ?
    (never joined), or a leading space followed by letters with at most one apostrophe inside, and
    either was joined or is a word in /usr/share/dict/words (or a, I). Candidates that join to the
    same text are merged by adding their probabilities; the text continues with the tokens of the
    most probable of them. The four most probable choices are kept; "other" is 1 minus their sum.
    A choice that ends a sentence (. ! ?) is marked "ends" and not expanded. Five words deep.

dice.json
    { "model": "gpt2", "tokens": 20, "recorded": 65, "shown": 56,
      "leftOut": [ { "start": "...", "temperature": 0.5, "sample": 2, "reason": "..." } ],
      "starts": [ { "text": "...",
                    "settings": [ { "temperature": 0, "greedy": true,
                                    "continuations": [ { "sample": 1, "text": "..." } ] },
                                  { "temperature": 0.5,
                                    "continuations": [ { "sample": 1, "seed": s1, "text": "..." },
                                                       ... ] } ] } ] }
    A continuation is the decoded text of the 20 new tokens only. Temperature 0 always takes the most
    probable token, so its three continuations would be identical and it is stored once. The
    continuations in DICE_LEFT_OUT are recorded but not written to dice.json (their text is only in
    the ignored tools/ai-series/data/dice-all.json and review.txt); the others keep their sample
    numbers.

word-map.json
    { "model": "gpt2", "dimensions": 768, "tsne": { settings },
      "dropped": [ { "word": "...", "group": "...", "tokens": [" piece", "s"] } ],
      "words": [ { "word": "dog", "group": "animals", "x": 0.41, "y": 0.77,
                   "nearest": [ { "word": "cat", "similarity": 0.62 } ] } ] }

attention.json
    { "model": "bert-base-uncased", "layers": 12, "heads": 12,
      "sentences": [ { "id": "A", "text": "...", "tokens": ["[CLS]", "the", ...],
                       "words": [ { "word": "the", "tokens": [1] } ],
                       "attention": [layer][head][from token][to token] } ],
      "it": { "A": index of "it" in A's tokens, "B": ... },
      "score": "[A(it->animal) - A(it->street)] + [B(it->street) - B(it->animal)]",
      "top": [ { "layer": 1-based, "head": 1-based, "A_animal", "A_street", "B_street", "B_animal",
                 "score", "A_special", "B_special" } ],   (ten best heads)
      "average": { same numbers, averaged over all 144 heads },
      "layers_average": [ { "layer": 1-based, same numbers averaged over that layer's 12 heads } ],
      "heads_switching": number of heads with A_animal > A_street and B_street > B_animal }
    X_special is the share of "it"'s attention in sentence X that goes to [CLS] and [SEP].

attention-shown.json (the part of attention.json the page shows)
    { "model": "bert-base-uncased",
      "sentences": [ { "id": "A", "text": "...",
                       "tokens": [ { "token": "[CLS]", "special": true }, { "token": "the" } ] } ],
      "views": { "best": { "layer": 7, "head": 11, "chosenBy": "...",
                           "A": 15 x 15 matrix, "B": 15 x 15 matrix },
                 "average": { "over": "all 144 heads", "A": ..., "B": ... } },
      "summary": { "heads": 144, "switching": 25, "best": { four numbers, score, special shares },
                   "average": { same } } }
    Rows are "from" tokens, columns "to" tokens; every row sums to 1 within rounding.

fill-in.json
    { "sentence": "...", "positions": [
        { "word": "animal",
          "blank": { "model": "bert-base-uncased", "text": "the [MASK] did ...",
                     "top": [ { "token": "dog", "p": 0.1 } ],              (five, unfiltered)
                     "original": { "token": "animal", "p": 0.01, "rank": 7 } },
          "continue": { "model": "gpt2", "prefix": "The",
                        "top": [ { "word": " first", "p": 0.1 } ],          (five choices)
                        "original": { "word": " animal", "p": 0.0001,
                                      "rank_among_choices": 412, "rank_among_all_tokens": 980 } } } ] }
    A rank is 1 plus the number of candidates with a strictly higher probability.
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import subprocess
import threading
import time
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DATA_DIR = REPO / 'tools' / 'ai-series' / 'data'
LOG_PATH = DATA_DIR / 'record_language.log'
REVIEW_PATH = DATA_DIR / 'review.txt'
OUT_DIR = REPO / 'src' / 'lib' / 'ai-series' / 'language'
DICT_PATH = Path('/usr/share/dict/words')

os.environ['HF_HOME'] = str(DATA_DIR / 'hf')
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'

import numpy as np  # noqa: E402
import torch  # noqa: E402
import transformers  # noqa: E402
from huggingface_hub import HfApi  # noqa: E402
from transformers import (  # noqa: E402
    BertForMaskedLM,
    BertTokenizerFast,
    GPT2LMHeadModel,
    GPT2TokenizerFast,
)

SEED = 0
THREADS = 4
HEARTBEAT_SECONDS = 3.0
GPT2 = 'gpt2'
BERT = 'bert-base-uncased'

STARTS = [
    'The best thing about a garden in spring is',
    'When I was a child, my grandmother always told me',
    'The recipe says to bake the bread for',
    'Once upon a time there was a',
    'The weather forecast for tomorrow is',
]
CHOICES_PER_NODE = 4
DEPTH = 5
CANDIDATES = 40  # candidate first tokens considered per node, more if the top four are not settled
MAX_JOINS = 3
JOIN_ABOVE = 0.5
PUNCTUATION = ['.', ',', '!', '?']
SENTENCE_ENDS = {'.', '!', '?'}

DICE_TOKENS = 20
DICE_TEMPERATURES = [0, 0.5, 1.0, 1.5, 2.0]
DICE_SAMPLES = 3
# Continuations that are recorded but not written to dice.json, chosen by the coordinator after
# reading all 65. Keyed by (starting text, temperature, sample number from 1); the value is the
# reason, which dice.json records without the text.
DICE_LEFT_OUT = {
    ('Once upon a time there was a', 0.5, 2): 'sexual',
    ('Once upon a time there was a', 0.5, 3): 'violent',
    ('Once upon a time there was a', 1.0, 3): 'sexual',
    ('Once upon a time there was a', 1.5, 2): 'crude',
    ('When I was a child, my grandmother always told me', 1.5, 2): 'names a person who may be real',
    ('When I was a child, my grandmother always told me', 1.5, 3): 'crude',
    ('When I was a child, my grandmother always told me', 2.0, 1): 'could offend',
    ('The weather forecast for tomorrow is', 1.0, 2): 'names a person who may be real',
    ('The weather forecast for tomorrow is', 1.0, 3): 'contains a web address',
}
DICE_ALL_PATH = DATA_DIR / 'dice-all.json'

WORD_GROUPS = {
    'animals': [
        'dog', 'cat', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'mouse', 'rabbit',
        'fox', 'wolf', 'bear', 'lion', 'tiger', 'elephant', 'monkey', 'snake', 'bird', 'fish', 'frog',
    ],
    'foods': [
        'bread', 'cheese', 'butter', 'milk', 'egg', 'apple', 'banana', 'rice', 'pasta', 'soup',
        'salad', 'meat', 'beef', 'pizza', 'cake', 'cookie', 'sugar', 'honey', 'potato', 'tomato',
        'carrot', 'chocolate',
    ],
    'colors': [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
        'grey', 'gray', 'gold', 'silver', 'violet', 'beige', 'crimson', 'navy', 'turquoise', 'cyan',
    ],
    'family': [
        'mother', 'father', 'sister', 'brother', 'son', 'daughter', 'aunt', 'uncle', 'cousin',
        'grandmother', 'grandfather', 'wife', 'husband', 'baby', 'parent', 'child', 'niece',
        'nephew', 'mom', 'dad', 'grandma', 'grandpa',
    ],
    'numbers': [
        'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
        'twelve', 'thirteen', 'fourteen', 'fifteen', 'twenty', 'thirty', 'forty', 'fifty',
        'hundred', 'thousand', 'million',
    ],
    'days and months': [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'January',
        'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
        'November', 'December',
    ],
    'body': [
        'head', 'hand', 'foot', 'arm', 'leg', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'finger',
        'knee', 'shoulder', 'neck', 'back', 'heart', 'stomach', 'hair', 'skin', 'lip', 'chin',
        'elbow',
    ],
    'weather': [
        'rain', 'snow', 'wind', 'sun', 'cloud', 'storm', 'fog', 'thunder', 'lightning', 'hail',
        'ice', 'frost', 'sunshine', 'rainbow', 'breeze', 'heat', 'cold', 'drizzle', 'mist',
        'hurricane', 'tornado',
    ],
    'clothing': [
        'shirt', 'shoe', 'hat', 'coat', 'jacket', 'dress', 'skirt', 'sock', 'glove', 'scarf',
        'boot', 'sweater', 'trousers', 'jeans', 'belt', 'tie', 'pants', 'cap', 'suit', 'uniform',
    ],
    'tools and household things': [
        'hammer', 'knife', 'fork', 'spoon', 'plate', 'cup', 'bowl', 'chair', 'table', 'bed', 'lamp',
        'door', 'window', 'key', 'broom', 'bucket', 'saw', 'drill', 'pan', 'kettle', 'towel',
    ],
    'places': [
        'school', 'church', 'hospital', 'library', 'park', 'beach', 'farm', 'city', 'village',
        'town', 'airport', 'station', 'shop', 'market', 'office', 'garden', 'kitchen', 'museum',
        'bank', 'hotel', 'restaurant',
    ],
    'feelings': [
        'happy', 'sad', 'angry', 'afraid', 'scared', 'proud', 'lonely', 'tired', 'excited',
        'nervous', 'calm', 'jealous', 'bored', 'glad', 'upset', 'anxious', 'worried', 'cheerful',
        'grateful', 'ashamed',
    ],
}
NEIGHBOURS = 5
TSNE = {
    'perplexity': 20.0,
    'distance': 'squared cosine distance, (1 - cosine similarity) ** 2, in the Gaussian kernel',
    'iterations': 1000,
    'learning_rate': 200.0,
    'early_exaggeration': 12.0,
    'exaggeration_iterations': 250,
    'momentum': [0.5, 0.8],
    'momentum_switch_iteration': 250,
    'min_gain': 0.01,
    'initial_scale': 1e-4,
    'seed': SEED,
    'scaling': 'both axes divided by the larger of the two ranges, the shorter axis centred in 0..1',
}

SENTENCE_A = 'The animal did not cross the street because it was too tired.'
SENTENCE_B = 'The animal did not cross the street because it was too wide.'
FILL_WORDS = ['animal', 'cross', 'street', 'tired']


# ---------------------------------------------------------------- progress


class Progress:
    """Prints a heartbeat every few seconds from a background thread, so a stall shows as
    repeated lines with the same count and a crash shows as no lines at all."""

    def __init__(self) -> None:
        self.section = 'start'
        self.done = 0
        self.planned = 0
        self.extra = 0  # batched calls that check whether a word continues, in next-words
        self.lock = threading.Lock()
        self.stop = threading.Event()
        self.thread = threading.Thread(target=self.beat, daemon=True)
        self.thread.start()

    def begin(self, section: str, planned: int) -> None:
        with self.lock:
            self.section, self.done, self.planned, self.extra = section, 0, planned, 0
        log(f'{section}: starting, {planned} model calls planned')

    def tick(self, count: int = 1) -> None:
        with self.lock:
            self.done += count

    def replan(self, planned: int) -> None:
        with self.lock:
            self.planned = planned

    def beat(self) -> None:
        while not self.stop.wait(HEARTBEAT_SECONDS):
            with self.lock:
                line = f'{self.section}: {self.done} of {self.planned} model calls done'
                if self.extra:
                    line += f' (plus {self.extra} batched word-piece checks)'
            log(line)


PROGRESS: Progress | None = None


def log(message: str) -> None:
    stamp = datetime.datetime.now().astimezone().isoformat(timespec='seconds')
    line = f'{stamp} {message}'
    print(line, flush=True)
    with LOG_PATH.open('a') as f:
        f.write(line + '\n')


# ---------------------------------------------------------------- helpers


def r4(x: float) -> float:
    return round(float(x), 4)


def write_json(name: str, data: object) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    path.write_text(json.dumps(data, ensure_ascii=False) + '\n')
    return path


def format_json(paths: list[Path]) -> None:
    """Format the JSON with the repository's prettier, so a rerun leaves `npm run format` clean."""
    try:
        subprocess.run(['npx', 'prettier', '--write', *map(str, paths)], cwd=REPO, check=True)
    except (OSError, subprocess.CalledProcessError) as error:
        log(f'prettier did not run ({error}); the JSON is correct but unformatted')


class Models:
    """Loads each model once, at the commit the hub reports for it, on first use."""

    def __init__(self) -> None:
        self.api = HfApi()
        self.info: dict[str, dict] = {}
        self.loaded: dict[str, tuple] = {}

    def hub_info(self, name: str) -> dict:
        if name not in self.info:
            try:
                info = self.api.model_info(name)
                card = info.card_data
                licence = card.get('license') if card is not None else None
                self.info[name] = {'revision': info.sha, 'licence': licence, 'error': None}
            except Exception as error:  # noqa: BLE001 - recorded and reported, not hidden
                self.info[name] = {'revision': None, 'licence': None, 'error': repr(error)}
                log(f'could not read hub metadata for {name}: {error!r}')
        return self.info[name]

    def get(self, name: str):
        if name not in self.loaded:
            revision = self.hub_info(name)['revision']
            log(f'loading {name} at revision {revision} (downloads on first run)')
            if name == GPT2:
                tok = GPT2TokenizerFast.from_pretrained(name, revision=revision)
                model = GPT2LMHeadModel.from_pretrained(
                    name, revision=revision, attn_implementation='eager'
                )
            else:
                tok = BertTokenizerFast.from_pretrained(name, revision=revision)
                model = BertForMaskedLM.from_pretrained(
                    name, revision=revision, attn_implementation='eager'
                )
            model.eval()
            self.loaded[name] = (tok, model)
        return self.loaded[name]


def gpt2_log_probs(model, ids: list[int]) -> np.ndarray:
    """The model's log-probability of every vocabulary token coming next after `ids`."""
    with torch.no_grad():
        logits = model(torch.tensor([ids])).logits[0, -1]
    PROGRESS.tick()
    return torch.log_softmax(logits.double(), dim=-1).numpy()


def dictionary() -> set[str]:
    return {w.strip().lower() for w in DICT_PATH.read_text().split('\n') if w.strip()}


def choice_tokens(tok) -> tuple[np.ndarray, list[str]]:
    """Which single GPT-2 tokens count as a word for fill-in.json: a dictionary word with a leading
    space, or one of the four punctuation tokens. Returns a mask over the vocabulary and every
    token's text. (next-words.json also joins word pieces; see section_next_words.)"""
    words = dictionary()
    texts =[tok.decode([i], clean_up_tokenization_spaces=False) for i in range(len(tok))]
    mask = np.zeros(len(texts), dtype=bool)
    for i, text in enumerate(texts):
        if text in PUNCTUATION:
            mask[i] = True
        elif len(text) > 1 and text[0] == ' ':
            rest = text[1:]
            if rest.isalpha() and (rest.lower() in words or rest in ('a', 'I')):
                mask[i] = True
    return mask, texts


def ranked(log_p: np.ndarray, mask: np.ndarray | None, count: int) -> list[int]:
    """Token ids in order of probability (ties by id), restricted to `mask` when given."""
    ids = np.arange(len(log_p)) if mask is None else np.flatnonzero(mask)
    order = np.lexsort((ids, -log_p[ids]))
    return [int(i) for i in ids[order[:count]]]


def rank_of(log_p: np.ndarray, token: int, mask: np.ndarray | None = None) -> int:
    pool = log_p if mask is None else log_p[mask]
    return int(np.sum(pool > log_p[token])) + 1


# ---------------------------------------------------------------- sections


def section_models(models: Models) -> dict:
    PROGRESS.begin('models', 2)
    entries = []
    for name in (GPT2, BERT):
        info = models.hub_info(name)
        _, model = models.get(name)
        parameters = sum(p.numel() for p in model.parameters())
        entries.append(
            {
                'name': name,
                'class': type(model).__name__,
                'revision': info['revision'],
                'parameters': int(parameters),
                'licence': info['licence'],
                'url': f'https://huggingface.co/{name}',
            }
        )
        PROGRESS.tick()
    return {'transformers': transformers.__version__, 'torch': torch.__version__, 'models': entries}


def is_word(text: str) -> bool:
    """A leading space, then letters with at most one apostrophe inside: " garden", " don't"."""
    if len(text) < 2 or text[0] != ' ':
        return False
    parts = text[1:].split("'")
    return len(parts) <= 2 and all(part.isalpha() and part.isascii() for part in parts)


def section_next_words(models: Models) -> dict:
    tok, model = models.get(GPT2)
    words = dictionary()
    texts = [tok.decode([i], clean_up_tokenization_spaces=False) for i in range(len(tok))]
    # Tokens that continue the word before them: no leading space, not punctuation that ends a
    # word, not a line break and not end-of-text.
    continues = np.array(
        [
            bool(t) and t[0] != ' ' and t not in PUNCTUATION and '\n' not in t
            and i != tok.eos_token_id
            for i, t in enumerate(texts)
        ]
    )
    per_start = sum(CHOICES_PER_NODE**d for d in range(DEPTH))
    PROGRESS.begin('next-words', per_start * len(STARTS))
    joined_seen: dict[str, tuple[str, int]] = {}

    def batch_log_probs(seqs: list[list[int]]) -> np.ndarray:
        """Next-token log-probabilities after each of several sequences of the same length."""
        with torch.no_grad():
            logits = model(torch.tensor(seqs)).logits[:, -1]
        PROGRESS.extra += 1
        return torch.log_softmax(logits.double(), dim=-1).numpy()

    def candidates(ids: list[int], log_p: np.ndarray, order: np.ndarray) -> list[dict]:
        """Each token in `order` as a candidate choice, with word pieces joined on."""
        found = [{'tokens': [int(t)], 'p': float(np.exp(log_p[t]))} for t in order]
        joining = [c for c in found if texts[c['tokens'][0]][0:1] == ' ']
        for _ in range(MAX_JOINS):
            if not joining:
                break
            rows = batch_log_probs([ids + c['tokens'] for c in joining])
            still = []
            for c, row in zip(joining, rows):
                u = int(np.argmax(row))
                if continues[u] and np.exp(row[u]) > JOIN_ABOVE:
                    c['tokens'].append(u)
                    c['p'] *= float(np.exp(row[u]))
                    still.append(c)
            joining = still
        return found

    def expand(ids: list[int], depth: int) -> dict:
        log_p = gpt2_log_probs(model, ids)
        order = np.lexsort((np.arange(len(log_p)), -log_p))
        merged: dict[str, dict] = {}
        considered = 0
        while True:
            for c in candidates(ids, log_p, order[considered : considered + CANDIDATES]):
                text = ''.join(texts[t] for t in c['tokens'])
                pieces = len(c['tokens'])
                if text in PUNCTUATION:
                    ok = pieces == 1
                else:
                    ok = is_word(text) and (
                        pieces > 1 or text[1:].lower() in words or text[1:] in ('a', 'I')
                    )
                if not ok:
                    continue
                if text in merged:
                    entry = merged[text]
                    entry['p'] += c['p']
                    if c['p'] > entry['lead_p']:
                        entry.update(lead_p=c['p'], tokens=c['tokens'])
                else:
                    merged[text] = {'p': c['p'], 'lead_p': c['p'], 'tokens': c['tokens']}
            considered += CANDIDATES
            ranked_choices = sorted(merged.items(), key=lambda kv: (-kv[1]['p'], kv[0]))
            # Settled when no single unconsidered token, which is at most as probable as the next
            # one in order, could beat the fourth choice.
            if len(ranked_choices) >= CHOICES_PER_NODE and ranked_choices[CHOICES_PER_NODE - 1][1][
                'p'
            ] >= np.exp(log_p[order[considered]]):
                break
        best = ranked_choices[:CHOICES_PER_NODE]
        choices = []
        for text, entry in best:
            choice: dict = {'word': text, 'p': r4(entry['p'])}
            if len(entry['tokens']) > 1:
                choice['pieces'] = len(entry['tokens'])
                path = tok.decode(ids, clean_up_tokenization_spaces=False) + text
                joined_seen.setdefault(text, (path, len(entry['tokens'])))
            if text in SENTENCE_ENDS:
                choice['ends'] = True
                skipped = sum(CHOICES_PER_NODE**d for d in range(DEPTH - depth - 1))
                PROGRESS.replan(PROGRESS.planned - skipped)
            elif depth + 1 < DEPTH:
                choice['next'] = expand(ids + entry['tokens'], depth + 1)
            choices.append(choice)
        other = 1.0 - sum(entry['p'] for _, entry in best)
        return {'choices': choices, 'other': r4(other)}

    starts = [{'text': text, 'node': expand(tok.encode(text), 0)} for text in STARTS]
    for text, (path, pieces) in sorted(joined_seen.items()):
        log(f'next-words: joined {text!r} from {pieces} pieces, first at {path!r}')
    return {'model': GPT2, 'depth': DEPTH, 'starts': starts}


def section_dice(models: Models) -> dict:
    tok, model = models.get(GPT2)
    runs = len(STARTS) * (1 + (len(DICE_TEMPERATURES) - 1) * DICE_SAMPLES)
    PROGRESS.begin('dice', runs * DICE_TOKENS)

    def continue_text(ids: list[int], temperature: float, seed: int | None) -> str:
        generator = None if seed is None else torch.Generator().manual_seed(seed)
        new: list[int] = []
        for _ in range(DICE_TOKENS):
            with torch.no_grad():
                logits = model(torch.tensor([ids + new])).logits[0, -1].double()
            PROGRESS.tick()
            if temperature == 0:
                token = int(torch.argmax(logits))
            else:
                probs = torch.softmax(logits / temperature, dim=-1)
                token = int(torch.multinomial(probs, 1, generator=generator))
            new.append(token)
        return tok.decode(new, clean_up_tokenization_spaces=False)

    starts = []
    for t, text in enumerate(STARTS):
        ids = tok.encode(text)
        settings = []
        for s, temperature in enumerate(DICE_TEMPERATURES):
            if temperature == 0:
                sample = {'sample': 1, 'text': continue_text(ids, 0, None)}
                settings.append({'temperature': 0, 'greedy': True, 'continuations': [sample]})
                continue
            seeds = [10000 + 1000 * t + 100 * s + k for k in range(DICE_SAMPLES)]
            samples = [
                {'sample': k + 1, 'seed': seed, 'text': continue_text(ids, temperature, seed)}
                for k, seed in enumerate(seeds)
            ]
            settings.append({'temperature': temperature, 'continuations': samples})
        starts.append({'text': text, 'settings': settings})
    recorded = {'model': GPT2, 'tokens': DICE_TOKENS, 'starts': starts}
    # The full record, left-out texts included, stays in the ignored data folder for review.txt.
    DICE_ALL_PATH.write_text(json.dumps(recorded, ensure_ascii=False, indent=2) + '\n')

    left_out, shown_starts, used = [], [], set()
    for start in starts:
        shown_settings = []
        for setting in start['settings']:
            kept = []
            for c in setting['continuations']:
                key = (start['text'], setting['temperature'], c['sample'])
                if key in DICE_LEFT_OUT:
                    used.add(key)
                    left_out.append(
                        {
                            'start': key[0],
                            'temperature': key[1],
                            'sample': key[2],
                            'reason': DICE_LEFT_OUT[key],
                        }
                    )
                else:
                    kept.append(c)
            shown_settings.append({**setting, 'continuations': kept})
        shown_starts.append({'text': start['text'], 'settings': shown_settings})
    assert used == set(DICE_LEFT_OUT), f'left-out entries that match nothing: {set(DICE_LEFT_OUT) - used}'
    total = sum(len(s['continuations']) for st in starts for s in st['settings'])
    return {
        'dice.json': {
            'model': GPT2,
            'tokens': DICE_TOKENS,
            'recorded': total,
            'shown': total - len(left_out),
            'leftOut': left_out,
            'starts': shown_starts,
        }
    }


def tsne(d2: np.ndarray) -> tuple[np.ndarray, float]:
    """Standard t-SNE (van der Maaten and Hinton, 2008) on a matrix of squared distances."""
    n = d2.shape[0]
    target = np.log(TSNE['perplexity'])
    p = np.zeros((n, n))
    for i in range(n):
        d = np.delete(d2[i], i)
        lo, hi, beta = 0.0, np.inf, 1.0
        for _ in range(200):
            w = np.exp(-(d - d.min()) * beta)
            sw = w.sum()
            entropy = np.log(sw) + beta * np.sum((d - d.min()) * w) / sw
            if abs(entropy - target) < 1e-10:
                break
            if entropy > target:
                lo = beta
                beta = beta * 2 if hi == np.inf else (beta + hi) / 2
            else:
                hi = beta
                beta = (beta + lo) / 2
        p[i, np.arange(n) != i] = w / sw
    p = (p + p.T) / (2 * n)
    p = np.maximum(p, 1e-12)

    rng = np.random.default_rng(TSNE['seed'])
    y = rng.standard_normal((n, 2)) * TSNE['initial_scale']
    velocity = np.zeros_like(y)
    gains = np.ones_like(y)
    for it in range(TSNE['iterations']):
        exaggerated = p * (TSNE['early_exaggeration'] if it < TSNE['exaggeration_iterations'] else 1)
        sq = np.sum(y * y, axis=1)
        num = 1.0 / (1.0 + sq[:, None] + sq[None, :] - 2 * y @ y.T)
        np.fill_diagonal(num, 0.0)
        q = np.maximum(num / num.sum(), 1e-12)
        pq = (exaggerated - q) * num
        grad = 4.0 * (np.diag(pq.sum(axis=1)) - pq) @ y
        momentum = TSNE['momentum'][0 if it < TSNE['momentum_switch_iteration'] else 1]
        same_sign = np.sign(grad) == np.sign(velocity)
        gains = np.where(same_sign, gains * 0.8, gains + 0.2)
        gains = np.maximum(gains, TSNE['min_gain'])
        velocity = momentum * velocity - TSNE['learning_rate'] * gains * grad
        y = y + velocity
        y = y - y.mean(axis=0)
    kl = float(np.sum(p * np.log(p / q)))
    return y, kl


def section_word_map(models: Models) -> dict:
    tok, model = models.get(GPT2)
    PROGRESS.begin('word-map', 1)
    seen = [w for ws in WORD_GROUPS.values() for w in ws]
    assert len(seen) == len(set(seen)), 'a word appears in two groups'
    kept, dropped = [], []
    for group, words in WORD_GROUPS.items():
        for word in words:
            ids = tok.encode(' ' + word)
            if len(ids) == 1:
                kept.append((word, group, ids[0]))
            else:
                dropped.append(
                    {'word': word, 'group': group, 'tokens': [tok.decode([i]) for i in ids]}
                )
    embeddings = model.get_input_embeddings().weight.detach().double().numpy()
    vectors = embeddings[[i for _, _, i in kept]]
    unit = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)
    cosine = unit @ unit.T
    n = len(kept)

    y, kl = tsne(np.maximum(1.0 - cosine, 0.0) ** 2)
    PROGRESS.tick()
    low = y.min(axis=0)
    span = (y.max(axis=0) - low).max()
    xy = (y - low) / span
    xy += (1.0 - xy.max(axis=0)) / 2

    words = []
    for a, (word, group, _) in enumerate(kept):
        others = np.array([b for b in range(n) if b != a])
        order = others[np.lexsort((others, -cosine[a, others]))][:NEIGHBOURS]
        words.append(
            {
                'word': word,
                'group': group,
                'x': r4(xy[a, 0]),
                'y': r4(xy[a, 1]),
                'nearest': [{'word': kept[b][0], 'similarity': r4(cosine[a, b])} for b in order],
            }
        )
    tsne_settings = {**TSNE, 'final_kl_divergence': r4(kl)}
    return {
        'model': GPT2,
        'dimensions': int(vectors.shape[1]),
        'tsne': tsne_settings,
        'dropped': dropped,
        'words': words,
    }


def section_attention(models: Models) -> dict:
    tok, model = models.get(BERT)
    PROGRESS.begin('attention', 2)
    sentences, maps, positions = [], {}, {}
    for sid, text in (('A', SENTENCE_A), ('B', SENTENCE_B)):
        enc = tok(text, return_tensors='pt')
        with torch.no_grad():
            out = model(**enc, output_attentions=True)
        PROGRESS.tick()
        att = torch.stack(out.attentions)[:, 0].double().numpy()  # layer, head, from, to
        tokens = tok.convert_ids_to_tokens(enc['input_ids'][0])
        word_ids = enc.word_ids(0)
        words = []
        for t, w in enumerate(word_ids):
            if w is None:
                continue
            if words and words[-1]['index'] == w:
                words[-1]['tokens'].append(t)
            else:
                words.append({'index': w, 'tokens': [t]})
        word_list = [
            {
                'word': tok.convert_tokens_to_string([tokens[t] for t in w['tokens']]),
                'tokens': w['tokens'],
            }
            for w in words
        ]
        sentences.append(
            {
                'id': sid,
                'text': text,
                'tokens': tokens,
                'words': word_list,
                'split_words': [w['word'] for w in word_list if len(w['tokens']) > 1],
                'attention': [[[[r4(v) for v in row] for row in head] for head in layer] for layer in att],
            }
        )
        maps[sid] = att
        positions[sid] = {
            name: tokens.index(name) for name in ('it', 'animal', 'street', '[CLS]', '[SEP]')
        }

    def numbers(a: np.ndarray, b: np.ndarray) -> dict:
        """The four attention values from "it", the score, and the share to special tokens."""
        pa, pb = positions['A'], positions['B']
        a_it, b_it = a[..., pa['it'], :], b[..., pb['it'], :]
        values = {
            'A_animal': a_it[..., pa['animal']],
            'A_street': a_it[..., pa['street']],
            'B_street': b_it[..., pb['street']],
            'B_animal': b_it[..., pb['animal']],
        }
        values['score'] = (values['A_animal'] - values['A_street']) + (
            values['B_street'] - values['B_animal']
        )
        values['A_special'] = a_it[..., pa['[CLS]']] + a_it[..., pa['[SEP]']]
        values['B_special'] = b_it[..., pb['[CLS]']] + b_it[..., pb['[SEP]']]
        return values

    per_head = numbers(maps['A'], maps['B'])  # each value is a 12 x 12 array
    layers, heads = per_head['score'].shape
    flat = [(int(l), int(h)) for l in range(layers) for h in range(heads)]
    flat.sort(key=lambda lh: (-per_head['score'][lh], lh))
    top = [
        {'layer': l + 1, 'head': h + 1, **{k: r4(v[l, h]) for k, v in per_head.items()}}
        for l, h in flat[:10]
    ]
    average = {k: r4(v.mean()) for k, v in per_head.items()}
    layers_average = [
        {'layer': l + 1, **{k: r4(v[l].mean()) for k, v in per_head.items()}} for l in range(layers)
    ]
    switching = int(
        np.sum(
            (per_head['A_animal'] > per_head['A_street'])
            & (per_head['B_street'] > per_head['B_animal'])
        )
    )
    full = {
        'model': BERT,
        'layers': layers,
        'heads': heads,
        'sentences': sentences,
        'it': {sid: positions[sid]['it'] for sid in positions},
        'score': '[A(it->animal) - A(it->street)] + [B(it->street) - B(it->animal)]',
        'top': top,
        'average': average,
        'layers_average': layers_average,
        'heads_switching': switching,
    }

    def matrix(m: np.ndarray) -> list[list[float]]:
        rows = [[r4(v) for v in row] for row in m]
        for row in rows:
            assert abs(sum(row) - 1) <= 0.0005 * len(row), f'a row sums to {sum(row)}'
        return rows

    best_l, best_h = flat[0]
    shown = {
        'model': BERT,
        'sentences': [
            {
                'id': s['id'],
                'text': s['text'],
                'tokens': [
                    {'token': t, 'special': True} if t in tok.all_special_tokens else {'token': t}
                    for t in s['tokens']
                ],
            }
            for s in sentences
        ],
        'views': {
            'best': {
                'layer': best_l + 1,
                'head': best_h + 1,
                'chosenBy': 'the head with the largest value of [A(it→animal) − A(it→street)] + '
                '[B(it→street) − B(it→animal)] among all 144',
                'A': matrix(maps['A'][best_l, best_h]),
                'B': matrix(maps['B'][best_l, best_h]),
            },
            'average': {
                'over': f'all {layers * heads} heads',
                'A': matrix(maps['A'].mean(axis=(0, 1))),
                'B': matrix(maps['B'].mean(axis=(0, 1))),
            },
        },
        'summary': {
            'heads': layers * heads,
            'switching': switching,
            'switchingMeans': 'heads where it→animal > it→street in A and it→street > it→animal in B',
            'best': top[0],
            'average': average,
        },
    }
    return {'attention.json': full, 'attention-shown.json': shown}


def section_fill_in(models: Models) -> dict:
    btok, bert = models.get(BERT)
    gtok, gpt2 = models.get(GPT2)
    mask, texts = choice_tokens(gtok)
    PROGRESS.begin('fill-in', 2 * len(FILL_WORDS))
    words = SENTENCE_A.split(' ')
    positions = []
    for word in FILL_WORDS:
        at = next(i for i, w in enumerate(words) if w.rstrip('.') == word)

        masked = ' '.join(words[:at] + [btok.mask_token + words[at][len(word):]] + words[at + 1 :])
        enc = btok(masked, return_tensors='pt')
        where = int((enc['input_ids'][0] == btok.mask_token_id).nonzero()[0, 0])
        with torch.no_grad():
            logits = bert(**enc).logits[0, where]
        PROGRESS.tick()
        log_p = torch.log_softmax(logits.double(), dim=-1).numpy()
        original_ids = btok.encode(word, add_special_tokens=False)
        assert len(original_ids) == 1, f'BERT splits {word!r}: {original_ids}'
        o = original_ids[0]
        blank = {
            'model': BERT,
            'text': masked,
            'top': [
                {'token': btok.convert_ids_to_tokens(i), 'p': r4(np.exp(log_p[i]))}
                for i in ranked(log_p, None, 5)
            ],
            'original': {
                'token': btok.convert_ids_to_tokens(o),
                'p': r4(np.exp(log_p[o])),
                'rank': rank_of(log_p, o),
            },
        }

        prefix = ' '.join(words[:at])
        ids = gtok.encode(prefix)
        log_p = gpt2_log_probs(gpt2, ids)
        target = gtok.encode(' ' + word)
        original: dict = {
            'word': ' ' + word,
            'tokens': [texts[t] for t in target],
            'p': r4(np.exp(log_p[target[0]])),
            'rank_among_choices': rank_of(log_p, target[0], mask) if mask[target[0]] else None,
            'rank_among_all_tokens': rank_of(log_p, target[0]),
        }
        if len(target) > 1:
            original['note'] = 'GPT-2 splits this word; p and ranks are for its first token'
        cont = {
            'model': GPT2,
            'prefix': prefix,
            'top': [{'word': texts[i], 'p': r4(np.exp(log_p[i]))} for i in ranked(log_p, mask, 5)],
            'original': original,
        }
        positions.append({'word': word, 'blank': blank, 'continue': cont})
    return {'sentence': SENTENCE_A, 'positions': positions}


# Each section's output file, or None when the section returns {file name: data} for several.
SECTIONS = {
    'models': ('models.json', section_models),
    'next-words': ('next-words.json', section_next_words),
    'dice': (None, section_dice),
    'word-map': ('word-map.json', section_word_map),
    'attention': (None, section_attention),
    'fill-in': ('fill-in.json', section_fill_in),
}


# ---------------------------------------------------------------- review file


def write_review() -> None:
    def load(name: str):
        path = OUT_DIR / name
        return json.loads(path.read_text()) if path.exists() else None

    lines = [
        'Every piece of model text recorded by record_language.py, for a person to check.',
        'Nothing here has been filtered or changed. Words are shown between | | so spaces show.',
        '',
    ]
    next_words = load('next-words.json')
    if next_words:
        found: set[str] = set()

        def walk(node: dict) -> None:
            for c in node['choices']:
                found.add(c['word'])
                if 'next' in c:
                    walk(c['next'])

        for start in next_words['starts']:
            walk(start['node'])
        lines += [f'== next-words.json: {len(found)} distinct choices, sorted ==']
        lines += [f'|{w}|' for w in sorted(found)] + ['']
    dice = json.loads(DICE_ALL_PATH.read_text()) if DICE_ALL_PATH.exists() else None
    if dice:
        lines += ['== dice.json: every continuation recorded, LEFT OUT marks those not written ==']
        for start in dice['starts']:
            for setting in start['settings']:
                for c in setting['continuations']:
                    key = (start['text'], setting['temperature'], c['sample'])
                    mark = f' LEFT OUT ({DICE_LEFT_OUT[key]})' if key in DICE_LEFT_OUT else ''
                    lines.append(
                        f'[{start["text"]}] T={setting["temperature"]} #{c["sample"]}{mark}: '
                        f'|{c["text"]}|'
                    )
        lines.append('')
    fill = load('fill-in.json')
    if fill:
        lines += ['== fill-in.json: every fill-in and next word ==']
        for pos in fill['positions']:
            blank = ', '.join(f'|{t["token"]}|' for t in pos['blank']['top'])
            cont = ', '.join(f'|{t["word"]}|' for t in pos['continue']['top'])
            lines.append(f'{pos["word"]}: BERT fill-ins {blank}; GPT-2 next words {cont}')
        lines.append('')
    REVIEW_PATH.write_text('\n'.join(lines))
    log(f'wrote {REVIEW_PATH.relative_to(REPO)}')


# ---------------------------------------------------------------- main


def main() -> None:
    global PROGRESS
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--only', choices=list(SECTIONS), action='append')
    args = parser.parse_args()

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    torch.manual_seed(SEED)
    torch.set_num_threads(THREADS)
    torch.use_deterministic_algorithms(True)
    PROGRESS = Progress()
    models = Models()
    written = []
    for name in args.only or list(SECTIONS):
        filename, run = SECTIONS[name]
        began = time.monotonic()
        data = run(models)
        files = data if filename is None else {filename: data}
        for each, content in files.items():
            written.append(write_json(each, content))
        log(f'{name}: wrote {", ".join(files)} in {time.monotonic() - began:.1f} s')
    PROGRESS.stop.set()
    format_json(written)
    write_review()
    log('done')


if __name__ == '__main__':
    main()
