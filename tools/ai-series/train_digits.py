"""Train the 784-32-16-10 digit network on MNIST and write the files the blog page reads.

Run from the repository root:

    python3 tools/ai-series/train_digits.py

It downloads MNIST into tools/ai-series/data/ (skipped when the files are already there and their
MD5 matches), trains with a fixed seed, and writes:

- public/ai-series/digits/ckpt-<step>.bin: int8 weights of one saved point (25,760 bytes)
- src/lib/ai-series/digits/manifest.json: scales, biases and test accuracy of every saved point
- src/lib/ai-series/digits/fixture.json: 20 test images and the network's numbers for them,
  which the TypeScript tests compare against

Progress lines go to stdout and are appended to tools/ai-series/data/train.log.
"""

from __future__ import annotations

import datetime
import gzip
import hashlib
import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

import numpy as np

REPO = Path(__file__).resolve().parents[2]
DATA_DIR = REPO / 'tools' / 'ai-series' / 'data'
LOG_PATH = DATA_DIR / 'train.log'
CKPT_DIR = REPO / 'public' / 'ai-series' / 'digits'
CKPT_URL_PREFIX = '/ai-series/digits/'
LIB_DIR = REPO / 'src' / 'lib' / 'ai-series' / 'digits'

MNIST_URL = 'https://ossci-datasets.s3.amazonaws.com/mnist/'
MNIST_FILES = {
    'train-images-idx3-ubyte.gz': 'f68b3c2dcbeaaa9fbdd348bbdeb94873',
    'train-labels-idx1-ubyte.gz': 'd53e105ee54ea40749a09fcbcd1e9432',
    't10k-images-idx3-ubyte.gz': '9fb629c4189551a2d022fa330f9573f3',
    't10k-labels-idx1-ubyte.gz': 'ec29112dd5afa0611ce80d1b7f02629c',
}

LAYERS = [784, 32, 16, 10]
SEED = 0
BATCH_SIZE = 128
TOTAL_STEPS = 20000
PEAK_LR = 3e-3
FINAL_LR = 1e-4
WEIGHT_DECAY = 0.05  # decoupled (AdamW), applied to weight matrices only
MAX_SHIFT = 2
# Chosen from the accuracy curve: quantised test correct climbs 1,166 (step 0), 4,023 (10),
# 6,788 (30), 8,352 (100), 9,275 (500), 9,725 (20,000) out of 10,000.
SAVED_STEPS = [0, 10, 30, 100, 500, TOTAL_STEPS]
# Further steps at which the quantised test accuracy is printed, to show the curve.
CURVE_STEPS = sorted(set(SAVED_STEPS + [20, 50, 75, 150, 200, 1000, 2000, 5000, 10000, 15000]))
PROGRESS_SECONDS = 2.0


def log(message: str) -> None:
    stamp = datetime.datetime.now().astimezone().isoformat(timespec='seconds')
    line = f'{stamp} {message}'
    print(line, flush=True)
    with LOG_PATH.open('a') as f:
        f.write(line + '\n')


def md5(path: Path) -> str:
    return hashlib.md5(path.read_bytes()).hexdigest()


def fetch_mnist() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for name, expected in MNIST_FILES.items():
        path = DATA_DIR / name
        if not path.exists():
            log(f'downloading {MNIST_URL}{name}')
            tmp = path.with_suffix('.part')
            with urllib.request.urlopen(MNIST_URL + name) as response:
                tmp.write_bytes(response.read())
            tmp.rename(path)
        actual = md5(path)
        if actual != expected:
            sys.exit(f'MD5 mismatch for {path}: expected {expected}, got {actual}. Stopping.')
    log('MNIST files present, MD5 checked')


def read_idx(name: str, magic: int, dims: int) -> np.ndarray:
    raw = gzip.decompress((DATA_DIR / name).read_bytes())
    header = np.frombuffer(raw, dtype='>u4', count=1 + dims)
    if header[0] != magic:
        sys.exit(f'{name}: magic number {header[0]}, expected {magic}')
    shape = tuple(int(n) for n in header[1:])
    data = np.frombuffer(raw, dtype=np.uint8, offset=4 * (1 + dims))
    if data.size != int(np.prod(shape)):
        sys.exit(f'{name}: {data.size} bytes of data, header says {shape}')
    return data.reshape(shape)


def load_mnist() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    train_x = read_idx('train-images-idx3-ubyte.gz', 2051, 3)
    train_y = read_idx('train-labels-idx1-ubyte.gz', 2049, 1)
    test_x = read_idx('t10k-images-idx3-ubyte.gz', 2051, 3)
    test_y = read_idx('t10k-labels-idx1-ubyte.gz', 2049, 1)
    if train_x.shape != (60000, 28, 28) or train_y.shape != (60000,):
        sys.exit(f'unexpected training set shape {train_x.shape} {train_y.shape}')
    if test_x.shape != (10000, 28, 28) or test_y.shape != (10000,):
        sys.exit(f'unexpected test set shape {test_x.shape} {test_y.shape}')
    log('60,000 training and 10,000 test images read')
    return train_x, train_y, test_x, test_y


# ---- the network -------------------------------------------------------------------------------


def init_params(rng: np.random.Generator) -> dict[str, np.ndarray]:
    params = {}
    for i in range(3):
        fan_in, fan_out = LAYERS[i], LAYERS[i + 1]
        std = np.sqrt(2.0 / fan_in)
        params[f'W{i + 1}'] = (rng.standard_normal((fan_out, fan_in)) * std).astype(np.float32)
        params[f'b{i + 1}'] = np.zeros(fan_out, dtype=np.float32)
    return params


def softmax(z: np.ndarray) -> np.ndarray:
    z = z - z.max(axis=1, keepdims=True)
    e = np.exp(z)
    return e / e.sum(axis=1, keepdims=True)


def forward(params: dict[str, np.ndarray], x: np.ndarray) -> dict[str, np.ndarray]:
    """x: (batch, 784) float32. Returns every layer's values, all float32."""
    z1 = x @ params['W1'].T + params['b1']
    h1 = np.maximum(z1, 0)
    z2 = h1 @ params['W2'].T + params['b2']
    h2 = np.maximum(z2, 0)
    z3 = h2 @ params['W3'].T + params['b3']
    return {'x': x, 'z1': z1, 'h1': h1, 'z2': z2, 'h2': h2, 'p': softmax(z3)}


def loss_and_grads(
    params: dict[str, np.ndarray], x: np.ndarray, y: np.ndarray
) -> tuple[float, dict[str, np.ndarray]]:
    acts = forward(params, x)
    n = x.shape[0]
    p = acts['p']
    loss = float(-np.log(p[np.arange(n), y] + 1e-12).mean())
    dz3 = p.copy()
    dz3[np.arange(n), y] -= 1
    dz3 /= n
    grads = {'W3': dz3.T @ acts['h2'], 'b3': dz3.sum(axis=0)}
    dz2 = (dz3 @ params['W3']) * (acts['z2'] > 0)
    grads['W2'] = dz2.T @ acts['h1']
    grads['b2'] = dz2.sum(axis=0)
    dz1 = (dz2 @ params['W2']) * (acts['z1'] > 0)
    grads['W1'] = dz1.T @ x
    grads['b1'] = dz1.sum(axis=0)
    return loss, grads


def quantise(params: dict[str, np.ndarray]) -> tuple[list[np.ndarray], list[float]]:
    """int8 weights and one scale per matrix: scale = max|W| / 127, q = round(W / scale)."""
    qs, scales = [], []
    for i in range(1, 4):
        w = params[f'W{i}']
        scale = np.float32(np.abs(w).max() / np.float32(127))
        q = np.clip(np.round(w / scale), -127, 127).astype(np.int8)
        qs.append(q)
        scales.append(scale)
    return qs, [float(s) for s in scales]


def dequantised(params: dict[str, np.ndarray]) -> dict[str, np.ndarray]:
    qs, scales = quantise(params)
    out = {}
    for i in range(3):
        out[f'W{i + 1}'] = qs[i].astype(np.float32) * np.float32(scales[i])
        out[f'b{i + 1}'] = params[f'b{i + 1}'].astype(np.float32)
    return out


def count_correct(params: dict[str, np.ndarray], x: np.ndarray, y: np.ndarray) -> int:
    return int((forward(params, x)['p'].argmax(axis=1) == y).sum())


def shift_batch(images: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Move each 28x28 image by a random whole-pixel offset of up to MAX_SHIFT in x and y."""
    n = images.shape[0]
    padded = np.pad(images, ((0, 0), (MAX_SHIFT, MAX_SHIFT), (MAX_SHIFT, MAX_SHIFT)))
    offsets = rng.integers(0, 2 * MAX_SHIFT + 1, size=(n, 2))
    grid = np.arange(28)
    rows = grid[None, :, None] + offsets[:, 0, None, None]
    cols = grid[None, None, :] + offsets[:, 1, None, None]
    return padded[np.arange(n)[:, None, None], rows, cols]


# ---- outputs -----------------------------------------------------------------------------------


def write_checkpoint(step: int, params: dict[str, np.ndarray], correct: int) -> dict:
    qs, scales = quantise(params)
    data = b''.join(q.tobytes(order='C') for q in qs)
    assert len(data) == 25760, len(data)
    (CKPT_DIR / f'ckpt-{step}.bin').write_bytes(data)
    return {
        'id': f'step-{step}',
        'step': step,
        'file': f'{CKPT_URL_PREFIX}ckpt-{step}.bin',
        'scales': scales,
        'biases': [[float(v) for v in params[f'b{i}']] for i in range(1, 4)],
        'testCorrect': correct,
        'testTotal': 10000,
    }


def floats(values: np.ndarray) -> list[float]:
    return [float(v) for v in values.astype(np.float32)]


def fixture_indices(test_y: np.ndarray) -> list[int]:
    picked = []
    for digit in range(10):
        picked.extend(int(i) for i in np.flatnonzero(test_y == digit)[:2])
    return picked


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CKPT_DIR.mkdir(parents=True, exist_ok=True)
    LIB_DIR.mkdir(parents=True, exist_ok=True)
    log(f'start: {TOTAL_STEPS} steps of {BATCH_SIZE} images, saving at steps {SAVED_STEPS}')
    fetch_mnist()
    train_x, train_y, test_x, test_y = load_mnist()
    test_inputs = test_x.reshape(-1, 784).astype(np.float32) / np.float32(255)
    train_images = train_x.astype(np.float32) / np.float32(255)

    rng = np.random.default_rng(SEED)
    params = init_params(rng)
    m = {k: np.zeros_like(v) for k, v in params.items()}
    v = {k: np.zeros_like(v) for k, v in params.items()}
    beta1, beta2, eps = 0.9, 0.999, 1e-8

    checkpoints = []
    saved_params = {}
    order = rng.permutation(60000)
    cursor = 0
    started = time.monotonic()
    last_report = started
    loss = float('nan')

    for step in range(TOTAL_STEPS + 1):
        if step in CURVE_STEPS:
            correct = count_correct(dequantised(params), test_inputs, test_y)
            log(f'step {step}/{TOTAL_STEPS}: quantised test correct {correct}/10000')
            if step in SAVED_STEPS:
                checkpoints.append(write_checkpoint(step, params, correct))
                saved_params[step] = {k: w.copy() for k, w in params.items()}
                log(f'saved ckpt-{step}.bin')
        if step == TOTAL_STEPS:
            break

        if cursor + BATCH_SIZE > 60000:
            order = rng.permutation(60000)
            cursor = 0
        idx = order[cursor : cursor + BATCH_SIZE]
        cursor += BATCH_SIZE
        x = shift_batch(train_images[idx], rng).reshape(-1, 784)
        loss, grads = loss_and_grads(params, x, train_y[idx])

        # Adam with decoupled weight decay on the weight matrices; cosine learning-rate decay.
        t = step + 1
        lr = FINAL_LR + 0.5 * (PEAK_LR - FINAL_LR) * (1 + np.cos(np.pi * step / TOTAL_STEPS))
        for k in params:
            m[k] = beta1 * m[k] + (1 - beta1) * grads[k]
            v[k] = beta2 * v[k] + (1 - beta2) * grads[k] ** 2
            m_hat = m[k] / (1 - beta1**t)
            v_hat = v[k] / (1 - beta2**t)
            update = lr * m_hat / (np.sqrt(v_hat) + eps)
            if k.startswith('W'):
                update = update + lr * WEIGHT_DECAY * params[k]
            params[k] = (params[k] - update).astype(np.float32)

        now = time.monotonic()
        if now - last_report >= PROGRESS_SECONDS or (step + 1) % 500 == 0:
            log(f'step {step + 1}/{TOTAL_STEPS} loss {loss:.4f}')
            last_report = now

    elapsed = time.monotonic() - started
    final = saved_params[TOTAL_STEPS]
    float_correct = count_correct(final, test_inputs, test_y)
    log(f'final float test correct {float_correct}/10000; training took {elapsed:.1f} s')

    manifest = {
        'layers': LAYERS,
        'trainedOn': 'MNIST, 60,000 training images',
        'testedOn': 'MNIST, 10,000 test images',
        'seed': SEED,
        'checkpoints': checkpoints,
        'final': {'id': f'step-{TOTAL_STEPS}', 'floatTestCorrect': float_correct},
    }
    (LIB_DIR / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')

    picked = fixture_indices(test_y)
    final_acts = forward(dequantised(final), test_inputs[picked])
    step0_acts = forward(dequantised(saved_params[0]), test_inputs[picked[:1]])
    images = []
    for row, i in enumerate(picked):
        images.append(
            {
                'testIndex': i,
                'label': int(test_y[i]),
                'pixels': [int(p) for p in test_x[i].reshape(-1)],
                'hidden1': floats(final_acts['h1'][row]),
                'hidden2': floats(final_acts['h2'][row]),
                'probabilities': floats(final_acts['p'][row]),
            }
        )
    fixture = {
        'checkpoint': f'step-{TOTAL_STEPS}',
        'images': images,
        'step0': {'checkpoint': 'step-0', 'image': 0, 'probabilities': floats(step0_acts['p'][0])},
    }
    (LIB_DIR / 'fixture.json').write_text(json.dumps(fixture) + '\n')
    format_json([LIB_DIR / 'manifest.json', LIB_DIR / 'fixture.json'])
    log('wrote manifest.json and fixture.json')


def format_json(paths: list[Path]) -> None:
    """Format the JSON with the repository's prettier, so a rerun leaves `npm run format` clean."""
    try:
        subprocess.run(['npx', 'prettier', '--write', *map(str, paths)], cwd=REPO, check=True)
    except (OSError, subprocess.CalledProcessError) as error:
        log(f'prettier did not run ({error}); the JSON is correct but unformatted')


if __name__ == '__main__':
    main()
