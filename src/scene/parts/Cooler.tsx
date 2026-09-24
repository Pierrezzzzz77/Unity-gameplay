import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { DoubleSide } from 'three'
import type { Group } from 'three'
import { COOLER_SIZE } from '../../data/parts'
import type { PartProps } from '../../types'
import { PALETTE } from './palette'
import { PartHighlight } from './PartHighlight'

const { width: W, depth: D, height: H } = COOLER_SIZE
const FRAME = 0.05
const BLADES = 7
const HUB_RADIUS = 0.15
const BLADE_ANGLES = Array.from({ length: BLADES }, (_, i) => (i / BLADES) * Math.PI * 2)
const MAX_SPEED = 28

// TODO: trocar por modelo GLB — ex.: useGLTF('/models/cooler.glb'); para manter a ventoinha
// girando, anime o nó das pás (ex.: nodes.Rotor) no mesmo useFrame abaixo.
export function Cooler({ position, rotation, highlighted, active = false }: PartProps) {
  const rotor = useRef<Group>(null)
  const speed = useRef(0)

  useFrame((_, delta) => {
    const target = active ? MAX_SPEED : 0
    speed.current += (target - speed.current) * Math.min(1, delta * 1.5)
    if (rotor.current) rotor.current.rotation.y -= speed.current * delta
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Moldura */}
      {[-1, 1].map((side) => (
        <mesh key={`z${side}`} position={[0, H / 2, side * (D / 2 - FRAME / 2)]} castShadow>
          <boxGeometry args={[W, H, FRAME]} />
          <meshStandardMaterial color={PALETTE.plastic} roughness={0.65} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`x${side}`} position={[side * (W / 2 - FRAME / 2), H / 2, 0]} castShadow>
          <boxGeometry args={[FRAME, H, D - FRAME * 2]} />
          <meshStandardMaterial color={PALETTE.plastic} roughness={0.65} />
        </mesh>
      ))}
      {/* Anel do duto */}
      <mesh position={[0, H / 2, 0]}>
        <cylinderGeometry args={[W / 2 - FRAME, W / 2 - FRAME, H * 0.9, 48, 1, true]} />
        <meshStandardMaterial color={PALETTE.plastic} roughness={0.65} side={DoubleSide} />
      </mesh>

      {/* Suportes do motor */}
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle) => (
        <mesh key={angle} position={[0, 0.02, 0]} rotation={[0, angle, 0]}>
          <boxGeometry args={[0.03, 0.02, W - FRAME * 2]} />
          <meshStandardMaterial color={PALETTE.plastic} roughness={0.65} />
        </mesh>
      ))}

      {/* Rotor */}
      <group ref={rotor} position={[0, H / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[HUB_RADIUS, HUB_RADIUS, H * 0.7, 32]} />
          <meshStandardMaterial color={PALETTE.darkMetal} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, H * 0.35 + 0.001, 0]}>
          <cylinderGeometry args={[HUB_RADIUS * 0.75, HUB_RADIUS * 0.75, 0.002, 32]} />
          <meshStandardMaterial
            color={PALETTE.accent}
            emissive={PALETTE.accent}
            emissiveIntensity={active ? 1.4 : 0.15}
          />
        </mesh>
        {BLADE_ANGLES.map((angle) => (
          <group key={angle} rotation={[0, angle, 0]}>
            <mesh position={[HUB_RADIUS + 0.14, 0, 0]} rotation={[0.45, 0, 0]} castShadow>
              <boxGeometry args={[0.3, 0.012, 0.16]} />
              <meshStandardMaterial color="#3a4450" roughness={0.5} metalness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      <PartHighlight size={[W, H, D]} highlighted={highlighted} />
    </group>
  )
}
