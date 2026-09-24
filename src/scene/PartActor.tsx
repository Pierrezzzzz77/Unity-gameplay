import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import type { Group } from 'three'
import { PARTS } from '../data/parts'
import { playSound } from '../lib/sound'
import { selectIsComplete, useAssemblyStore } from '../store/assemblyStore'
import type { PartId } from '../types'
import { PART_COMPONENTS } from './parts'

/** Altura que a peça sobe quando selecionada. */
const LIFT = 0.28
/** Altura de aproximação antes de descer no encaixe. */
const APPROACH_HEIGHT = 0.75
/** Distância abaixo da qual consideramos que a peça chegou ao alvo. */
const ARRIVE_EPSILON = 0.004
/** Pixels de arrasto a partir dos quais um clique é tratado como giro de câmera. */
const DRAG_THRESHOLD = 5
const SHAKE_DURATION = 0.45

const QUARTER = Math.PI / 2

interface PartActorProps {
  id: PartId
}

/**
 * Controla uma peça na cena: posição na bancada, seleção, hover, "chacoalhão" de erro
 * e a animação (lerp amortecido) até o encaixe.
 */
export function PartActor({ id }: PartActorProps) {
  const def = PARTS[id]
  const Part = PART_COMPONENTS[id]

  const status = useAssemblyStore((s) => s.parts[id].status)
  const quarterTurns = useAssemblyStore((s) => s.parts[id].quarterTurns)
  const selected = useAssemblyStore((s) => s.selectedPart === id)
  const rejectionNonce = useAssemblyStore((s) =>
    s.rejection?.partId === id ? s.rejection.nonce : 0,
  )
  const complete = useAssemblyStore(selectIsComplete)
  const selectPart = useAssemblyStore((s) => s.selectPart)
  const finishPlacement = useAssemblyStore((s) => s.finishPlacement)

  const [hovered, setHovered] = useState(false)
  const interactive = status === 'available'
  useCursor(hovered && interactive)

  const group = useRef<Group>(null)
  const descending = useRef(false)
  const shakeFrom = useRef<number | null>(null)
  const pendingShake = useRef(false)
  const target = useRef(new Vector3())
  const finalPosition = useRef(new Vector3(...def.targetPosition))
  // Só a pose inicial vai por props; depois disso o useFrame é o dono da transformação.
  const [initialRotation] = useState<[number, number, number]>(() => [
    0,
    def.trayYaw - quarterTurns * QUARTER,
    0,
  ])

  useEffect(() => {
    if (rejectionNonce > 0) pendingShake.current = true
  }, [rejectionNonce])

  useEffect(() => {
    if (status === 'placing') descending.current = false
  }, [status])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = target.current
    const time = state.clock.elapsedTime

    if (status === 'available') {
      t.set(...def.trayPosition)
      if (selected) t.y += LIFT + Math.sin(time * 3) * 0.03
    } else if (status === 'placing') {
      t.copy(finalPosition.current)
      if (!descending.current) {
        t.y += APPROACH_HEIGHT
        if (g.position.distanceTo(t) < 0.05) descending.current = true
      }
    } else {
      t.copy(finalPosition.current)
    }

    const lambda = status === 'placing' ? (descending.current ? 9 : 7) : 6
    g.position.x = MathUtils.damp(g.position.x, t.x, lambda, delta)
    g.position.y = MathUtils.damp(g.position.y, t.y, lambda, delta)
    g.position.z = MathUtils.damp(g.position.z, t.z, lambda, delta)

    const baseYaw = status === 'available' ? def.trayYaw : 0
    const yaw = baseYaw - quarterTurns * QUARTER
    g.rotation.y = MathUtils.damp(g.rotation.y, yaw, 10, delta)

    if (pendingShake.current) {
      pendingShake.current = false
      shakeFrom.current = time
    }
    if (shakeFrom.current !== null) {
      const elapsed = time - shakeFrom.current
      if (elapsed > SHAKE_DURATION) {
        shakeFrom.current = null
      } else {
        const falloff = 1 - elapsed / SHAKE_DURATION
        g.position.x += Math.sin(elapsed * 70) * 0.035 * falloff
      }
    }

    if (status === 'placing' && descending.current && g.position.distanceTo(t) < ARRIVE_EPSILON) {
      g.position.copy(t)
      g.rotation.y = yaw
      finishPlacement(id)
    }
  })

  const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return
    e.stopPropagation()
    setHovered(true)
  }
  const onPointerOut = () => setHovered(false)
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive || e.delta > DRAG_THRESHOLD) return
    e.stopPropagation()
    if (!selected) playSound('select')
    selectPart(id)
  }

  return (
    <group
      ref={group}
      position={def.trayPosition}
      rotation={initialRotation}
      onPointerOver={interactive ? onPointerOver : undefined}
      onPointerOut={onPointerOut}
      onClick={interactive ? onClick : undefined}
    >
      <Part highlighted={interactive && (hovered || selected)} active={complete} />
    </group>
  )
}
