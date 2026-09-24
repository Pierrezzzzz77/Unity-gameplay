import { Edges, Outlines, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type { MeshBasicMaterial } from 'three'
import { PARTS } from '../data/parts'
import { selectCurrentStep, useAssemblyStore } from '../store/assemblyStore'
import type { PartId } from '../types'
import { PALETTE } from './parts/palette'

const DRAG_THRESHOLD = 5

/** Volume brilhante onde a peça da etapa atual deve ser encaixada. */
export function SnapSlot() {
  const step = useAssemblyStore(selectCurrentStep)
  const placing = useAssemblyStore((s) => s.placingPart !== null)
  if (!step || placing) return null
  // key: remonta o slot a cada etapa para zerar hover/animação.
  return <SlotVolume key={step.id} partId={step.expectedPart} />
}

interface SlotVolumeProps {
  partId: PartId
}

function SlotVolume({ partId }: SlotVolumeProps) {
  const def = PARTS[partId]
  const attemptPlacement = useAssemblyStore((s) => s.attemptPlacement)
  const hasSelection = useAssemblyStore((s) => s.selectedPart !== null)
  const [hovered, setHovered] = useState(false)
  const material = useRef<MeshBasicMaterial>(null)
  useCursor(hovered)

  const [sx, sy, sz] = def.slotSize
  const [px, py, pz] = def.targetPosition

  useFrame((state) => {
    if (!material.current) return
    const pulse = (Math.sin(state.clock.elapsedTime * 3.2) + 1) / 2
    const base = hovered ? 0.3 : hasSelection ? 0.16 : 0.08
    material.current.opacity = base + pulse * 0.1
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > DRAG_THRESHOLD) return
    e.stopPropagation()
    attemptPlacement()
  }

  return (
    <group position={[px, py + sy / 2, pz]}>
      <mesh
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
        renderOrder={2}
      >
        <boxGeometry args={[sx, sy, sz]} />
        <meshBasicMaterial
          ref={material}
          color={PALETTE.accent}
          transparent
          opacity={0.12}
          depthWrite={false}
          toneMapped={false}
        />
        <Edges color={PALETTE.highlight} lineWidth={hovered ? 2.5 : 1.5} />
        {hovered && <Outlines thickness={0.03} color={PALETTE.accent} />}
      </mesh>
    </group>
  )
}
