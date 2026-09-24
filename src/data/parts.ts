import type { PartId, Vec3 } from '../types'

/**
 * Convenção de pivô: toda peça tem a origem no centro da face de baixo,
 * com o "norte" (marcadores de orientação) apontando para -Z.
 * Unidade: 1 = 10 cm (as peças pequenas estão levemente exageradas para leitura).
 */

/** Altura do tampo da bancada (tapete antiestático fica logo acima). */
export const MAT_TOP = 0.012

export const MOTHERBOARD_SIZE = { width: 2.6, depth: 2.6, thickness: 0.035, standoff: 0.05 }
export const BOARD_TOP = MAT_TOP + MOTHERBOARD_SIZE.standoff + MOTHERBOARD_SIZE.thickness

/** Posição do socket sobre a placa-mãe (coordenadas de mundo com a placa montada na origem). */
export const SOCKET_CENTER: [x: number, z: number] = [0.25, -0.35]
export const SOCKET_SIZE = { width: 0.72, depth: 0.72, height: 0.07, recess: 0.035 }
export const SOCKET_TOP = BOARD_TOP + SOCKET_SIZE.height

export const PROCESSOR_SIZE = { width: 0.46, depth: 0.46, height: 0.055 }
/** O processador assenta dentro do rebaixo do socket. */
export const PROCESSOR_BASE = SOCKET_TOP - SOCKET_SIZE.recess
export const PROCESSOR_TOP = PROCESSOR_BASE + PROCESSOR_SIZE.height

export const HEATSINK_SIZE = { width: 1.0, depth: 1.0, base: 0.06, fins: 0.34 }
export const HEATSINK_TOP = PROCESSOR_TOP + HEATSINK_SIZE.base + HEATSINK_SIZE.fins

export const COOLER_SIZE = { width: 1.0, depth: 1.0, height: 0.22 }

export interface PartDefinition {
  id: PartId
  name: string
  description: string
  /** Cor de referência usada na UI (swatch do PartTray). */
  swatch: string
  /** Onde a peça fica esperando na bancada. */
  trayPosition: Vec3
  /** Giro (Y) da peça enquanto está na bancada, em radianos. */
  trayYaw: number
  /** Posição final encaixada (origem da peça). */
  targetPosition: Vec3
  /** Volume do slot de encaixe destacado na cena. */
  slotSize: Vec3
}

export const PARTS: Record<PartId, PartDefinition> = {
  motherboard: {
    id: 'motherboard',
    name: 'Placa-mãe',
    description: 'Base de tudo: conecta processador, memória e periféricos.',
    swatch: '#1f6f4a',
    trayPosition: [-3.1, 0, 0.15],
    trayYaw: 0.12,
    targetPosition: [0, MAT_TOP, 0],
    slotSize: [MOTHERBOARD_SIZE.width, 0.12, MOTHERBOARD_SIZE.depth],
  },
  socket: {
    id: 'socket',
    name: 'Socket',
    description: 'Soquete que recebe o processador e liga seus contatos à placa.',
    swatch: '#9aa3ad',
    trayPosition: [2.25, 0, -1.25],
    trayYaw: -0.25,
    targetPosition: [SOCKET_CENTER[0], BOARD_TOP, SOCKET_CENTER[1]],
    slotSize: [SOCKET_SIZE.width, SOCKET_SIZE.height + 0.02, SOCKET_SIZE.depth],
  },
  processor: {
    id: 'processor',
    name: 'Processador',
    description: 'A CPU. Tem um triângulo dourado num canto que indica a orientação.',
    swatch: '#c8a24a',
    trayPosition: [3.45, 0, -1.2],
    trayYaw: 0,
    targetPosition: [SOCKET_CENTER[0], PROCESSOR_BASE, SOCKET_CENTER[1]],
    slotSize: [
      PROCESSOR_SIZE.width + 0.04,
      PROCESSOR_SIZE.height + 0.02,
      PROCESSOR_SIZE.depth + 0.04,
    ],
  },
  heatsink: {
    id: 'heatsink',
    name: 'Dissipador',
    description: 'Bloco de alumínio com aletas que espalha o calor da CPU.',
    swatch: '#b8c4cf',
    trayPosition: [2.25, 0, 0.75],
    trayYaw: 0.3,
    targetPosition: [SOCKET_CENTER[0], PROCESSOR_TOP, SOCKET_CENTER[1]],
    slotSize: [HEATSINK_SIZE.width, HEATSINK_SIZE.base + HEATSINK_SIZE.fins, HEATSINK_SIZE.depth],
  },
  cooler: {
    id: 'cooler',
    name: 'Cooler',
    description: 'Ventoinha que empurra ar pelas aletas do dissipador.',
    swatch: '#2b3440',
    trayPosition: [3.6, 0, 0.95],
    trayYaw: -0.2,
    targetPosition: [SOCKET_CENTER[0], HEATSINK_TOP, SOCKET_CENTER[1]],
    slotSize: [COOLER_SIZE.width, COOLER_SIZE.height, COOLER_SIZE.depth],
  },
}

export const PART_IDS = Object.keys(PARTS) as PartId[]
