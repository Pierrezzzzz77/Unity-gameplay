import { useMemo } from 'react'
import { DoubleSide, Shape } from 'three'
import type { Vec3 } from '../../types'
import { PALETTE } from './palette'

interface CornerMarkerProps {
  /** Canto (x, y, z) onde fica o ângulo reto do triângulo; ele aponta para -X/-Z. */
  position: Vec3
  size: number
  color?: string
}

/** Triângulo retângulo deitado, usado como marcador de orientação (pino 1). */
export function CornerMarker({ position, size, color = PALETTE.gold }: CornerMarkerProps) {
  const shape = useMemo(() => {
    const s = new Shape()
    s.moveTo(0, 0)
    s.lineTo(size, 0)
    s.lineTo(0, -size)
    s.closePath()
    return s
  }, [size])

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={color}
        metalness={0.85}
        roughness={0.25}
        emissive={color}
        emissiveIntensity={0.25}
        side={DoubleSide}
      />
    </mesh>
  )
}
