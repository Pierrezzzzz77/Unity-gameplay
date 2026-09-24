import type { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { ComponentRef } from 'react'
import { MathUtils, PerspectiveCamera } from 'three'

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>

/** Limites do alvo da câmera: o pan não sai de cima da bancada. */
const TARGET_BOUNDS = { x: [-4, 4], y: [0, 1.2], z: [-2.4, 2.4] } as const

/** Meia-largura da área útil da bancada (peças na bandeja incluídas), com folga. */
const FIT_HALF_WIDTH = 4.5
const MIN_DISTANCE = 6.5
const MAX_DISTANCE = 15

/**
 * Ajustes de câmera que o OrbitControls não faz sozinho:
 * - ajusta a distância para a bancada inteira caber na largura do canvas;
 * - prende o alvo do pan dentro da bancada.
 */
export function CameraRig() {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  // Enquadra a largura da bancada sempre que a área do canvas muda de tamanho.
  useEffect(() => {
    if (!controls || !(camera instanceof PerspectiveCamera)) return
    const aspect = width / Math.max(height, 1)
    const halfFov = MathUtils.degToRad(camera.fov / 2)
    const halfHorizontalFov = Math.atan(Math.tan(halfFov) * aspect)
    const distance = MathUtils.clamp(
      FIT_HALF_WIDTH / Math.tan(halfHorizontalFov),
      MIN_DISTANCE,
      MAX_DISTANCE,
    )
    const offset = camera.position.clone().sub(controls.target).setLength(distance)
    camera.position.copy(controls.target).add(offset)
    controls.update()
  }, [width, height, camera, controls])

  useEffect(() => {
    if (!controls) return
    const clamp = () => {
      const t = controls.target
      const x = MathUtils.clamp(t.x, TARGET_BOUNDS.x[0], TARGET_BOUNDS.x[1])
      const y = MathUtils.clamp(t.y, TARGET_BOUNDS.y[0], TARGET_BOUNDS.y[1])
      const z = MathUtils.clamp(t.z, TARGET_BOUNDS.z[0], TARGET_BOUNDS.z[1])
      if (x !== t.x || y !== t.y || z !== t.z) {
        const dx = x - t.x
        const dy = y - t.y
        const dz = z - t.z
        t.set(x, y, z)
        camera.position.x += dx
        camera.position.y += dy
        camera.position.z += dz
      }
    }
    controls.addEventListener('change', clamp)
    return () => controls.removeEventListener('change', clamp)
  }, [controls, camera])

  return null
}
