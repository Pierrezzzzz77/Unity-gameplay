export type Vec3 = [x: number, y: number, z: number]

export type PartId = 'motherboard' | 'socket' | 'processor' | 'heatsink' | 'cooler'

/** Props comuns a todas as peças 3D (placeholder hoje, GLB amanhã). */
export interface PartProps {
  position?: Vec3
  rotation?: Vec3
  /** Destaque visual (hover/seleção): contorno + leve brilho. */
  highlighted?: boolean
  /** Montagem concluída: a peça pode reagir (cooler gira, LED acende). */
  active?: boolean
}
