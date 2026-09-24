import { create } from 'zustand'
import { PART_IDS, PARTS } from '../data/parts'
import { STEPS, validatePlacement } from '../data/steps'
import type { StepId } from '../data/steps'
import { playSound } from '../lib/sound'
import type { PartId } from '../types'

export type PartStatus = 'available' | 'placing' | 'placed'

export interface PartState {
  status: PartStatus
  /** Giros de 90° aplicados pelo usuário (só o processador usa). */
  quarterTurns: number
}

export type FeedbackKind = 'success' | 'error' | 'info'

export interface Feedback {
  id: number
  kind: FeedbackKind
  message: string
}

export interface Rejection {
  partId: PartId
  nonce: number
}

interface AssemblyState {
  currentStepIndex: number
  completedSteps: StepId[]
  parts: Record<PartId, PartState>
  selectedPart: PartId | null
  /** Peça em animação de encaixe; bloqueia novas interações até terminar. */
  placingPart: PartId | null
  feedback: Feedback | null
  /** Último encaixe recusado (dispara o "chacoalhão" da peça na cena). */
  rejection: Rejection | null
  /** Tentativas de encaixe recusadas (ordem ou orientação erradas). */
  mistakes: number

  selectPart: (partId: PartId | null) => void
  rotateSelected: (direction?: 1 | -1) => void
  attemptPlacement: (partId?: PartId | null) => void
  finishPlacement: (partId: PartId) => void
  notify: (kind: FeedbackKind, message: string) => void
  dismissFeedback: (id: number) => void
  reset: () => void
}

let feedbackSeq = 0

/** Processador começa sempre girado errado (90°, 180° ou 270°) para ensinar a orientação. */
const randomWrongTurns = () => 1 + Math.floor(Math.random() * 3)

function initialParts(): Record<PartId, PartState> {
  const parts = {} as Record<PartId, PartState>
  for (const id of PART_IDS) {
    parts[id] = { status: 'available', quarterTurns: id === 'processor' ? randomWrongTurns() : 0 }
  }
  return parts
}

function makeFeedback(kind: FeedbackKind, message: string): Feedback {
  feedbackSeq += 1
  return { id: feedbackSeq, kind, message }
}

export const useAssemblyStore = create<AssemblyState>()((set, get) => ({
  currentStepIndex: 0,
  completedSteps: [],
  parts: initialParts(),
  selectedPart: null,
  placingPart: null,
  feedback: null,
  rejection: null,
  mistakes: 0,

  selectPart: (partId) => {
    const { parts, placingPart, selectedPart } = get()
    if (placingPart) return
    if (partId === null || parts[partId].status !== 'available') {
      set({ selectedPart: null })
      return
    }
    // Clicar de novo na peça selecionada tira a seleção.
    set({ selectedPart: selectedPart === partId ? null : partId })
  },

  rotateSelected: (direction = 1) => {
    const { selectedPart, parts, placingPart } = get()
    if (!selectedPart || placingPart || selectedPart !== 'processor') return
    const part = parts[selectedPart]
    set({
      parts: { ...parts, [selectedPart]: { ...part, quarterTurns: part.quarterTurns + direction } },
    })
  },

  attemptPlacement: (partId) => {
    const state = get()
    const target = partId ?? state.selectedPart
    if (state.placingPart) return
    if (state.currentStepIndex >= STEPS.length) return
    if (!target) {
      get().notify('info', 'Selecione uma peça na bandeja ou na bancada primeiro.')
      return
    }
    const part = state.parts[target]
    if (part.status !== 'available') return

    const result = validatePlacement(state.currentStepIndex, {
      partId: target,
      quarterTurns: part.quarterTurns,
    })

    if (!result.ok) {
      playSound('error')
      set((s) => ({
        feedback: makeFeedback('error', result.message),
        rejection: { partId: target, nonce: (s.rejection?.nonce ?? 0) + 1 },
        mistakes: s.mistakes + 1,
      }))
      return
    }

    set({
      placingPart: target,
      selectedPart: null,
      parts: { ...state.parts, [target]: { ...part, status: 'placing' } },
    })
  },

  finishPlacement: (partId) => {
    const state = get()
    if (state.placingPart !== partId) return
    const step = STEPS[state.currentStepIndex]
    const nextIndex = state.currentStepIndex + 1
    const done = nextIndex >= STEPS.length
    playSound(done ? 'complete' : 'snap')
    set({
      placingPart: null,
      parts: { ...state.parts, [partId]: { ...state.parts[partId], status: 'placed' } },
      completedSteps: [...state.completedSteps, step.id],
      currentStepIndex: nextIndex,
      feedback: makeFeedback(
        'success',
        done
          ? 'Montagem concluída! O cooler está girando.'
          : `${PARTS[partId].name} encaixado. Próximo: ${STEPS[nextIndex].title.toLowerCase()}.`,
      ),
    })
  },

  notify: (kind, message) => set({ feedback: makeFeedback(kind, message) }),

  dismissFeedback: (id) => {
    if (get().feedback?.id === id) set({ feedback: null })
  },

  reset: () =>
    set({
      currentStepIndex: 0,
      completedSteps: [],
      parts: initialParts(),
      selectedPart: null,
      placingPart: null,
      rejection: null,
      mistakes: 0,
      feedback: makeFeedback('info', 'Montagem reiniciada. Comece pela placa-mãe.'),
    }),
}))

export const selectIsComplete = (s: AssemblyState) => s.currentStepIndex >= STEPS.length
export const selectCurrentStep = (s: AssemblyState) => STEPS[s.currentStepIndex] ?? null
