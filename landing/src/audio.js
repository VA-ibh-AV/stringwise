import * as Tone from 'tone'

const BASE = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_steel-mp3/'

// Samples spread across the full guitar range (E2–C6) every ~4 semitones
const SAMPLE_NOTES = ['E2', 'Ab2', 'B2', 'Eb3', 'G3', 'Bb3', 'D4', 'Gb4', 'A4', 'C5', 'E5', 'Ab5', 'C6']
const SAMPLE_MAP = Object.fromEntries(SAMPLE_NOTES.map(n => [n, `${BASE}${n}.mp3`]))

// Open string MIDI notes, high to low: e B G D A E
const OPEN_MIDI = [64, 59, 55, 50, 45, 40]
const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
function midiToNote(midi) {
  return NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1)
}

// Per-string PluckSynth fallback params (high to low: e B G D A E)
// Lower strings: darker (lower dampening), longer attack noise, higher resonance
const STRING_CONFIGS = [
  { dampening: 5500, resonance: 0.975, attackNoise: 1.5 },  // e
  { dampening: 4800, resonance: 0.977, attackNoise: 2.0 },  // B
  { dampening: 4000, resonance: 0.979, attackNoise: 2.5 },  // G
  { dampening: 3200, resonance: 0.982, attackNoise: 3.0 },  // D
  { dampening: 2600, resonance: 0.984, attackNoise: 3.5 },  // A
  { dampening: 2100, resonance: 0.986, attackNoise: 4.0 },  // E
]

let status = 'idle' // idle | loading | ready | failed
let sampler = null
let fallbackSynths = null
let initPromise = null

async function buildSampler() {
  status = 'loading'
  try {
    const reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.02, wet: 0.15 })
    await reverb.generate()
    reverb.toDestination()

    sampler = await new Promise((resolve, reject) => {
      const s = new Tone.Sampler(SAMPLE_MAP, {
        attack: 0,
        release: 1.5,
        onload: () => resolve(s),
        onerror: reject,
      }).connect(reverb)
    })

    status = 'ready'
  } catch {
    status = 'failed'
    buildFallback()
  }
}

function buildFallback() {
  if (fallbackSynths) return
  const limiter = new Tone.Limiter(-3).toDestination()
  const eq = new Tone.EQ3({ low: 4, mid: -2, high: -6, lowFrequency: 300, highFrequency: 2500 })
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.15 })
  reverb.generate().then(() => {
    eq.connect(reverb)
    reverb.connect(limiter)
  })
  fallbackSynths = STRING_CONFIGS.map(cfg =>
    new Tone.PluckSynth({
      attackNoise: cfg.attackNoise,
      dampening: cfg.dampening,
      resonance: cfg.resonance,
    }).connect(eq)
  )
}

export function preloadAudio() {
  if (!initPromise) initPromise = buildSampler()
  return initPromise
}

const OPEN_FREQS = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]

export function playFret(stringIdx, fret) {
  Tone.start()
  if (!initPromise) preloadAudio()

  const note = midiToNote(OPEN_MIDI[stringIdx] + Number(fret))

  if (status === 'ready' && sampler?.loaded) {
    sampler.triggerAttackRelease(note, 2, Tone.now())
  } else {
    if (!fallbackSynths) buildFallback()
    const freq = OPEN_FREQS[stringIdx] * Math.pow(2, Number(fret) / 12)
    fallbackSynths?.[stringIdx].triggerAttack(freq, Tone.now())
  }
}
