import { useUiStore } from '../store/uiStore'

export type SoundName = 'snap' | 'error' | 'complete' | 'select'

let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

interface Tone {
  frequency: number
  /** Início relativo, em segundos. */
  at: number
  duration: number
  type?: OscillatorType
  gain?: number
  /** Frequência final (glissando). */
  to?: number
}

const SOUNDS: Record<SoundName, Tone[]> = {
  select: [{ frequency: 880, at: 0, duration: 0.05, type: 'sine', gain: 0.05 }],
  snap: [
    { frequency: 520, at: 0, duration: 0.07, type: 'triangle', gain: 0.12, to: 780 },
    { frequency: 1560, at: 0.06, duration: 0.05, type: 'sine', gain: 0.06 },
  ],
  error: [
    { frequency: 220, at: 0, duration: 0.12, type: 'square', gain: 0.05, to: 180 },
    { frequency: 180, at: 0.13, duration: 0.14, type: 'square', gain: 0.05, to: 140 },
  ],
  complete: [
    { frequency: 523.25, at: 0, duration: 0.14, type: 'triangle', gain: 0.1 },
    { frequency: 659.25, at: 0.12, duration: 0.14, type: 'triangle', gain: 0.1 },
    { frequency: 783.99, at: 0.24, duration: 0.3, type: 'triangle', gain: 0.1 },
  ],
}

/** Efeitos sonoros sintetizados (sem arquivos de áudio). */
export function playSound(name: SoundName) {
  if (useUiStore.getState().muted) return
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  for (const tone of SOUNDS[name]) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = now + tone.at
    const end = start + tone.duration
    osc.type = tone.type ?? 'sine'
    osc.frequency.setValueAtTime(tone.frequency, start)
    if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, end)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(tone.gain ?? 0.08, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(end + 0.02)
  }
}
