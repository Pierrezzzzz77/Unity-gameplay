import { MOTHERBOARD_SIZE, SOCKET_CENTER, SOCKET_SIZE } from '../../data/parts'
import type { PartProps, Vec3 } from '../../types'
import { PALETTE } from './palette'
import { PartHighlight } from './PartHighlight'

const { width: W, depth: D, thickness: T, standoff: S } = MOTHERBOARD_SIZE
/** Topo da placa medido a partir da origem da peça (base dos espaçadores). */
const TOP = S + T
/** Socket em coordenadas locais da placa (a placa montada fica em [0, MAT_TOP, 0]). */
const SOCKET_LOCAL: [x: number, z: number] = [SOCKET_CENTER[0], SOCKET_CENTER[1]]

const STANDOFFS: [x: number, z: number][] = [
  [-1.15, -1.15],
  [1.15, -1.15],
  [-1.15, 1.15],
  [1.15, 1.15],
  [-1.15, 0.1],
  [1.15, 0.1],
]

const RAM_SLOTS = [0.92, 1.02, 1.12, 1.22].map((x, i) => ({
  x,
  color: i % 2 ? PALETTE.slot : '#3a4552',
}))
const PCIE_SLOTS = [0.5, 0.95]
const CAPACITORS: [x: number, z: number][] = [
  [-0.3, -0.95],
  [-0.2, -0.95],
  [-0.1, -0.95],
  [0.7, -0.35],
  [0.7, -0.2],
  [-0.75, 0.15],
]

function onBoard(x: number, height: number, z: number): Vec3 {
  return [x, TOP + height / 2, z]
}

// TODO: trocar por modelo GLB — ex.: const { scene } = useGLTF('/models/motherboard.glb')
// e renderizar <primitive object={scene} /> no lugar da geometria abaixo (origem na base).
export function Motherboard({ position, rotation, highlighted, active = false }: PartProps) {
  return (
    <group position={position} rotation={rotation}>
      {STANDOFFS.map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, S / 2, z]}>
          <cylinderGeometry args={[0.035, 0.035, S, 12]} />
          <meshStandardMaterial color={PALETTE.gold} metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* PCB */}
      <mesh position={[0, S + T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, T, D]} />
        <meshStandardMaterial color={PALETTE.pcb} metalness={0.15} roughness={0.55} />
      </mesh>

      {/* Área de contatos onde o socket é encaixado */}
      <mesh position={[SOCKET_LOCAL[0], TOP + 0.002, SOCKET_LOCAL[1]]} receiveShadow>
        <boxGeometry args={[SOCKET_SIZE.width - 0.04, 0.004, SOCKET_SIZE.depth - 0.04]} />
        <meshStandardMaterial color={PALETTE.gold} metalness={0.7} roughness={0.45} />
      </mesh>

      {/* Dissipadores do VRM */}
      <mesh position={onBoard(SOCKET_LOCAL[0], 0.08, -1.0)} castShadow>
        <boxGeometry args={[0.75, 0.08, 0.18]} />
        <meshStandardMaterial color={PALETTE.darkMetal} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={onBoard(-0.45, 0.08, SOCKET_LOCAL[1])} castShadow>
        <boxGeometry args={[0.18, 0.08, 0.75]} />
        <meshStandardMaterial color={PALETTE.darkMetal} metalness={0.8} roughness={0.35} />
      </mesh>

      {/* Painel traseiro de I/O */}
      <mesh position={onBoard(-1.1, 0.26, -0.75)} castShadow>
        <boxGeometry args={[0.28, 0.26, 0.8]} />
        <meshStandardMaterial color={PALETTE.steel} metalness={0.75} roughness={0.4} />
      </mesh>

      {/* Slots de memória */}
      {RAM_SLOTS.map(({ x, color }) => (
        <mesh key={x} position={onBoard(x, 0.07, -0.45)} castShadow>
          <boxGeometry args={[0.055, 0.07, 1.25]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}

      {/* Slots PCIe */}
      {PCIE_SLOTS.map((z) => (
        <mesh key={z} position={onBoard(-0.45, 0.07, z)} castShadow>
          <boxGeometry args={[1.35, 0.07, 0.07]} />
          <meshStandardMaterial color={PALETTE.slot} roughness={0.6} />
        </mesh>
      ))}

      {/* Chipset */}
      <mesh position={onBoard(0.72, 0.05, 0.72)} castShadow>
        <boxGeometry args={[0.36, 0.05, 0.36]} />
        <meshStandardMaterial color={PALETTE.darkMetal} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Conector ATX 24 pinos */}
      <mesh position={onBoard(1.2, 0.12, 0.3)} castShadow>
        <boxGeometry args={[0.1, 0.12, 0.5]} />
        <meshStandardMaterial color={PALETTE.plasticLight} roughness={0.7} />
      </mesh>

      {/* Header CPU_FAN */}
      <mesh position={onBoard(0.9, 0.05, -1.12)}>
        <boxGeometry args={[0.1, 0.05, 0.04]} />
        <meshStandardMaterial color={PALETTE.plasticLight} roughness={0.7} />
      </mesh>

      {/* Capacitores */}
      {CAPACITORS.map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={onBoard(x, 0.08, z)} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
          <meshStandardMaterial color="#2b2f36" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}

      {/* LED de energia */}
      <mesh position={onBoard(1.1, 0.02, 1.15)}>
        <boxGeometry args={[0.05, 0.02, 0.03]} />
        <meshStandardMaterial
          color={active ? PALETTE.ledOn : PALETTE.ledOff}
          emissive={active ? PALETTE.ledOn : '#000000'}
          emissiveIntensity={active ? 3 : 0}
        />
      </mesh>

      <PartHighlight size={[W, TOP + 0.02, D]} highlighted={highlighted} />
    </group>
  )
}
