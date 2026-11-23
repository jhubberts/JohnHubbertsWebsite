// Runs the 784-32-16-10 digit network trained by tools/ai-series/train_digits.py.
//
// A checkpoint is two parts: a .bin file of int8 weights (W1 32x784, then W2 16x32, then W3
// 10x16, each row-major, one row per unit) and an entry in manifest.json that holds each matrix's
// scale and the float biases. A weight's value is its int8 number times its matrix's scale.

export interface ManifestCheckpoint {
  id: string
  step: number
  /** URL path of the .bin file, served from public/. */
  file: string
  /** One scale per weight matrix, W1, W2, W3. */
  scales: number[]
  /** Biases of the three layers: 32, 16 and 10 numbers. */
  biases: number[][]
  /** Test images the network reads correctly with the quantised weights. */
  testCorrect: number
  testTotal: number
}

export interface DigitManifest {
  layers: number[]
  trainedOn: string
  testedOn: string
  seed: number
  checkpoints: ManifestCheckpoint[]
  /** Accuracy of the last checkpoint's unquantised float weights, for comparison. */
  final: { id: string; floatTestCorrect: number }
}

export const LAYER_SIZES = [784, 32, 16, 10] as const

/** Bytes in a checkpoint file: one int8 per weight. */
export const CHECKPOINT_BYTES = 784 * 32 + 32 * 16 + 16 * 10

export interface DigitNet {
  checkpointId: string
  layers: readonly number[]
  /** W1, W2, W3; weights[l][unit * inputs + i] is the weight from input i to that unit. */
  weights: [Float32Array, Float32Array, Float32Array]
  biases: [Float32Array, Float32Array, Float32Array]
}

export interface DigitReading {
  /** 784 values, 0 background to 1 full ink, as given. */
  input: Float32Array
  /** 32 values, after ReLU. */
  hidden1: Float32Array
  /** 16 values, after ReLU. */
  hidden2: Float32Array
  /** 10 values, after softmax. */
  probabilities: Float32Array
  /** The digit with the largest probability. */
  answer: number
}

export function decodeCheckpoint(bytes: ArrayBuffer, checkpoint: ManifestCheckpoint): DigitNet {
  if (bytes.byteLength !== CHECKPOINT_BYTES) {
    throw new Error(
      `Checkpoint ${checkpoint.id} has ${bytes.byteLength} bytes; expected ${CHECKPOINT_BYTES}`,
    )
  }
  if (checkpoint.scales.length !== 3 || checkpoint.biases.length !== 3) {
    throw new Error(`Checkpoint ${checkpoint.id} needs 3 scales and 3 bias lists`)
  }
  const quantised = new Int8Array(bytes)
  const weights: Float32Array[] = []
  const biases: Float32Array[] = []
  let offset = 0
  for (let layer = 0; layer < 3; layer++) {
    const inputs = LAYER_SIZES[layer]
    const units = LAYER_SIZES[layer + 1]
    const scale = checkpoint.scales[layer]
    const w = new Float32Array(units * inputs)
    for (let i = 0; i < w.length; i++) w[i] = quantised[offset + i] * scale
    offset += w.length
    weights.push(w)
    if (checkpoint.biases[layer].length !== units) {
      throw new Error(`Checkpoint ${checkpoint.id} layer ${layer + 1} needs ${units} biases`)
    }
    biases.push(Float32Array.from(checkpoint.biases[layer]))
  }
  return {
    checkpointId: checkpoint.id,
    layers: LAYER_SIZES,
    weights: weights as DigitNet['weights'],
    biases: biases as DigitNet['biases'],
  }
}

export async function loadCheckpoint(checkpoint: ManifestCheckpoint): Promise<DigitNet> {
  const response = await fetch(checkpoint.file)
  if (!response.ok) {
    throw new Error(`Could not load ${checkpoint.file}: ${response.status}`)
  }
  return decodeCheckpoint(await response.arrayBuffer(), checkpoint)
}

/** Weighted sums of one layer before its ReLU or softmax: bias plus each input times its weight. */
function layerSums(net: DigitNet, layer: 0 | 1 | 2, inputs: Float32Array): Float32Array {
  const w = net.weights[layer]
  const b = net.biases[layer]
  const n = inputs.length
  const sums = new Float32Array(b.length)
  for (let unit = 0; unit < b.length; unit++) {
    let sum = b[unit]
    const row = unit * n
    for (let i = 0; i < n; i++) sum += inputs[i] * w[row + i]
    sums[unit] = sum
  }
  return sums
}

function relu(values: Float32Array): Float32Array {
  return values.map((v) => (v > 0 ? v : 0))
}

function softmax(values: Float32Array): Float32Array {
  const max = Math.max(...values)
  const exps = Array.from(values, (v) => Math.exp(v - max))
  const total = exps.reduce((a, b) => a + b, 0)
  return Float32Array.from(exps, (e) => e / total)
}

export function readDigit(net: DigitNet, input: Float32Array): DigitReading {
  if (input.length !== LAYER_SIZES[0]) {
    throw new Error(`Input has ${input.length} values; expected ${LAYER_SIZES[0]}`)
  }
  const hidden1 = relu(layerSums(net, 0, input))
  const hidden2 = relu(layerSums(net, 1, hidden1))
  const probabilities = softmax(layerSums(net, 2, hidden2))
  let answer = 0
  for (let d = 1; d < probabilities.length; d++) {
    if (probabilities[d] > probabilities[answer]) answer = d
  }
  return { input, hidden1, hidden2, probabilities, answer }
}

/**
 * What one unit adds up: each incoming value times its weight, plus the bias. `sum` is the value
 * before the unit's ReLU (layers 1 and 2) or before the softmax (layer 3).
 */
export function unitContributions(
  net: DigitNet,
  reading: DigitReading,
  layer: 1 | 2 | 3,
  unit: number,
): { weights: Float32Array; contributions: Float32Array; bias: number; sum: number } {
  const incoming = [reading.input, reading.hidden1, reading.hidden2][layer - 1]
  const units = LAYER_SIZES[layer]
  if (!Number.isInteger(unit) || unit < 0 || unit >= units) {
    throw new Error(`Layer ${layer} has units 0 to ${units - 1}; got ${unit}`)
  }
  const n = incoming.length
  const weights = net.weights[layer - 1].slice(unit * n, (unit + 1) * n)
  const contributions = weights.map((w, i) => w * incoming[i])
  const bias = net.biases[layer - 1][unit]
  const sum = layerSums(net, (layer - 1) as 0 | 1 | 2, incoming)[unit]
  return { weights, contributions, bias, sum }
}
