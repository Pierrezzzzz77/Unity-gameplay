import { SOCKET_SIZE, PROCESSOR_SIZE } from '../../data/parts'
import type { PartProps } from '../../types'
import { CornerMarker } from './CornerMarker'
import { PALETTE } from './palette'
import { PartHighlight } from './PartHighlight'

const { width: W, depth: D, height: H, recess: R } = SOCKET_SIZE
/** Abertura interna: o processador entra com uma pequena folga. */
const CAVITY = PROCESSOR_SIZE.width + 0.02
const WALL = (W - CAVITY) / 2
const FLOOR = H - R

// TODO: trocar por modelo GLB — ex.: useGLTF('/models/socket.glb'), mantendo o marcador
// de pino 1 no canto -X/-Z (é ele que valida a orientação do processador).
export function Socket({ position, rotation, highlighted }: PartProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Fundo com os contatos */}
      <mesh position={[0, FLOOR / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, FLOOR, D]} />
        <meshStandardMaterial color={PALETTE.plastic} roughness={0.7} />
      </mesh>
      <mesh position={[0, FLOOR + 0.001, 0]} receiveShadow>
        <boxGeometry args={[CAVITY - 0.04, 0.002, CAVITY - 0.04]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={0.85} roughness={0.35} />
      </mesh>

      {/* Paredes da moldura de retenção */}
      {[-1, 1].map((side) => (
        <mesh key={`z${side}`} position={[0, H / 2, side * (CAVITY / 2 + WALL / 2)]} castShadow>
          <boxGeometry args={[W, H, WALL]} />
          <meshStandardMaterial color={PALETTE.steel} metalness={0.8} roughness={0.35} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`x${side}`} position={[side * (CAVITY / 2 + WALL / 2), H / 2, 0]} castShadow>
          <boxGeometry args={[WALL, H, CAVITY]} />
          <meshStandardMaterial color={PALETTE.steel} metalness={0.8} roughness={0.35} />
        </mesh>
      ))}

      {/* Alavanca de travamento */}
      <mesh position={[W / 2 + 0.03, H * 0.6, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, D + 0.04, 10]} />
        <meshStandardMaterial color={PALETTE.aluminum} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[W / 2 + 0.07, H * 0.6, D / 2 + 0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 10]} />
        <meshStandardMaterial color={PALETTE.aluminum} metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Marcador de pino 1: o triângulo do processador deve ficar neste canto */}
      <CornerMarker position={[-W / 2 + 0.02, H + 0.002, -D / 2 + 0.02]} size={0.1} />

      <PartHighlight
        size={[W + 0.1, H, D + 0.08]}
        center={[0.03, H / 2, 0.02]}
        highlighted={highlighted}
      />
    </group>
  )
}
