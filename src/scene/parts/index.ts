import type { ComponentType } from 'react'
import type { PartId, PartProps } from '../../types'
import { Cooler } from './Cooler'
import { Heatsink } from './Heatsink'
import { Motherboard } from './Motherboard'
import { Processor } from './Processor'
import { Socket } from './Socket'

/** Registro peça → componente 3D. Trocar um placeholder por GLB só mexe no arquivo da peça. */
export const PART_COMPONENTS: Record<PartId, ComponentType<PartProps>> = {
  motherboard: Motherboard,
  socket: Socket,
  processor: Processor,
  heatsink: Heatsink,
  cooler: Cooler,
}
