import { HEATSINK_SIZE } from '../../data/parts'
import type { PartProps } from '../../types'
import { PALETTE } from './palette'
import { PartHighlight } from './PartHighlight'

const { width: W, depth: D, base: BASE, fins: FINS } = HEATSINK_SIZE
const FIN_COUNT = 17
const FIN_THICKNESS = 0.018
const FIN_X = Array.from(
  { length: FIN_COUNT },
  (_, i) => -W / 2 + 0.03 + (i * (W - 0.06)) / (FIN_COUNT - 1),
)

// TODO: trocar por modelo GLB — ex.: useGLTF('/models/heatsink.glb'), com a origem no centro
// da face de contato (a que encosta no processador).
export function Heatsink({ position, rotation, highlighted }: PartProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base de contato */}
      <mesh position={[0, BASE / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, BASE, D]} />
        <meshStandardMaterial color={PALETTE.aluminum} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Núcleo de cobre */}
      <mesh position={[0, BASE + 0.01, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} />
        <meshStandardMaterial color={PALETTE.copper} metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Aletas */}
      {FIN_X.map((x) => (
        <mesh key={x} position={[x, BASE + FINS / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[FIN_THICKNESS, FINS, D]} />
          <meshStandardMaterial color={PALETTE.aluminum} metalness={0.85} roughness={0.32} />
        </mesh>
      ))}

      {/* Heatpipes atravessando as aletas */}
      {[-0.22, 0, 0.22].map((z) => (
        <mesh
          key={z}
          position={[0, BASE + FINS * 0.45, z]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.03, 0.03, W + 0.04, 16]} />
          <meshStandardMaterial color={PALETTE.copper} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}

      <PartHighlight size={[W + 0.04, BASE + FINS, D]} highlighted={highlighted} />
    </group>
  )
}
