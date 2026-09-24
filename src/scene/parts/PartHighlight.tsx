import { Outlines } from '@react-three/drei'
import type { Vec3 } from '../../types'
import { PALETTE } from './palette'

interface PartHighlightProps {
  /** Tamanho da caixa envolvente da peça. */
  size: Vec3
  /** Centro da caixa, relativo à origem da peça (padrão: apoiada no chão). */
  center?: Vec3
  highlighted?: boolean
}

/**
 * Caixa envolvente invisível: serve de área de clique e desenha o contorno de destaque.
 * Funciona igual para geometria placeholder e para um modelo GLB, então não precisa mudar
 * quando a peça for trocada.
 */
export function PartHighlight({ size, center, highlighted = false }: PartHighlightProps) {
  const position: Vec3 = center ?? [0, size[1] / 2, 0]
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} />
      {highlighted && <Outlines thickness={0.02} color={PALETTE.highlight} />}
    </mesh>
  )
}
