import { PROCESSOR_SIZE } from '../../data/parts'
import type { PartProps } from '../../types'
import { CornerMarker } from './CornerMarker'
import { PALETTE } from './palette'
import { PartHighlight } from './PartHighlight'

const { width: W, depth: D, height: H } = PROCESSOR_SIZE
const SUBSTRATE = 0.016
const IHS = 0.36

// TODO: trocar por modelo GLB — ex.: useGLTF('/models/processor.glb'). O triângulo de pino 1
// precisa ficar no canto -X/-Z do modelo na orientação de referência (0°).
export function Processor({ position, rotation, highlighted }: PartProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Substrato */}
      <mesh position={[0, SUBSTRATE / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, SUBSTRATE, D]} />
        <meshStandardMaterial color={PALETTE.cpuSubstrate} metalness={0.2} roughness={0.5} />
      </mesh>

      {/* Dissipador integrado (IHS) */}
      <mesh position={[0, SUBSTRATE + (H - SUBSTRATE) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[IHS, H - SUBSTRATE, IHS]} />
        <meshStandardMaterial color={PALETTE.aluminum} metalness={0.95} roughness={0.22} />
      </mesh>
      <mesh position={[0, H + 0.001, 0.05]}>
        <boxGeometry args={[0.2, 0.001, 0.04]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.9} roughness={0.5} />
      </mesh>

      {/* Marcador de orientação */}
      <CornerMarker position={[-W / 2 + 0.012, SUBSTRATE + 0.002, -D / 2 + 0.012]} size={0.07} />

      <PartHighlight size={[W, H, D]} highlighted={highlighted} />
    </group>
  )
}
