import type { PartId } from '../types'
import { PARTS } from './parts'

export type StepId =
  'place-motherboard' | 'mount-socket' | 'insert-processor' | 'apply-heatsink' | 'install-cooler'

/** O que o usuário tentou fazer: encaixar uma peça, numa certa orientação. */
export interface PlacementAttempt {
  partId: PartId
  /** Giros de 90° aplicados à peça (0 = orientação de referência). */
  quarterTurns: number
}

export type ValidationResult =
  { ok: true } | { ok: false; code: 'wrong-part' | 'wrong-orientation'; message: string }

export interface ValidationContext {
  step: AssemblyStep
  /** Número da etapa atual (1..N). */
  stepNumber: number
}

export type ValidationRule = (attempt: PlacementAttempt, ctx: ValidationContext) => ValidationResult

export interface AssemblyStep {
  id: StepId
  title: string
  instruction: string
  /** Dica curta exibida abaixo da instrução. */
  hint: string
  expectedPart: PartId
  /** Regras avaliadas em ordem; a primeira que falhar define o erro. */
  rules: ValidationRule[]
}

const OK: ValidationResult = { ok: true }

/** Só a peça da etapa atual pode ser encaixada. */
export const requireExpectedPart: ValidationRule = (attempt, { step, stepNumber }) => {
  if (attempt.partId === step.expectedPart) return OK
  const attemptedStep = stepNumberOfPart(attempt.partId)
  const partName = PARTS[attempt.partId].name
  return {
    ok: false,
    code: 'wrong-part',
    message:
      attemptedStep !== null && attemptedStep > stepNumber
        ? `Faça o passo ${stepNumber} primeiro: ${step.title.toLowerCase()}. A peça "${partName}" é do passo ${attemptedStep}.`
        : `A peça "${partName}" não se encaixa aqui. Passo ${stepNumber}: ${step.title.toLowerCase()}.`,
  }
}

/** A peça precisa estar girada de forma que o marcador fique alinhado (múltiplo de 360°). */
export const requireOrientation =
  (expectedQuarterTurns = 0): ValidationRule =>
  (attempt) => {
    const normalized = ((attempt.quarterTurns % 4) + 4) % 4
    if (normalized === expectedQuarterTurns) return OK
    const degrees = normalized * 90
    return {
      ok: false,
      code: 'wrong-orientation',
      message: `Orientação errada (girado ${degrees}°). Alinhe o triângulo dourado do processador com a marca no canto do socket.`,
    }
  }

export const STEPS: AssemblyStep[] = [
  {
    id: 'place-motherboard',
    title: 'Colocar a placa-mãe',
    instruction: 'Posicione a placa-mãe sobre o tapete antiestático no centro da bancada.',
    hint: 'Selecione a placa-mãe e clique na área destacada.',
    expectedPart: 'motherboard',
    rules: [requireExpectedPart],
  },
  {
    id: 'mount-socket',
    title: 'Encaixar o socket',
    instruction: 'Encaixe o socket na área de contatos da placa-mãe.',
    hint: 'O socket vai no quadrado de contatos perto do centro da placa.',
    expectedPart: 'socket',
    rules: [requireExpectedPart],
  },
  {
    id: 'insert-processor',
    title: 'Inserir o processador',
    instruction:
      'Insira o processador no socket. O triângulo dourado do processador precisa coincidir com a marca do socket.',
    hint: 'Gire o processador (tecla R) até os triângulos ficarem no mesmo canto.',
    expectedPart: 'processor',
    rules: [requireExpectedPart, requireOrientation(0)],
  },
  {
    id: 'apply-heatsink',
    title: 'Colocar o dissipador',
    instruction: 'Assente o dissipador sobre o processador para conduzir o calor.',
    hint: 'Na vida real, aplique pasta térmica antes desta etapa.',
    expectedPart: 'heatsink',
    rules: [requireExpectedPart],
  },
  {
    id: 'install-cooler',
    title: 'Instalar o cooler',
    instruction: 'Instale o cooler em cima do dissipador, com a ventoinha voltada para as aletas.',
    hint: 'Depois é só ligar o conector do cooler no header CPU_FAN.',
    expectedPart: 'cooler',
    rules: [requireExpectedPart],
  },
]

export function stepNumberOfPart(partId: PartId): number | null {
  const index = STEPS.findIndex((step) => step.expectedPart === partId)
  return index === -1 ? null : index + 1
}

export function validatePlacement(stepIndex: number, attempt: PlacementAttempt): ValidationResult {
  const step = STEPS[stepIndex]
  if (!step) {
    return { ok: false, code: 'wrong-part', message: 'A montagem já foi concluída.' }
  }
  const ctx: ValidationContext = { step, stepNumber: stepIndex + 1 }
  for (const rule of step.rules) {
    const result = rule(attempt, ctx)
    if (!result.ok) return result
  }
  return OK
}
