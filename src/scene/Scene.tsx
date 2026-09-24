import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { MAT_TOP, PART_IDS } from '../data/parts'
import { useUiStore } from '../store/uiStore'
import type { Theme } from '../store/uiStore'
import { CameraRig } from './CameraRig'
import { PartActor } from './PartActor'
import { SnapSlot } from './SnapSlot'
import { Workbench } from './Workbench'

const BACKGROUND: Record<Theme, string> = { dark: '#0a0c10', light: '#e9edf2' }

export function Scene() {
  const theme = useUiStore((s) => s.theme)
  const bg = BACKGROUND[theme]

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: [0, 6, 7.6], fov: 40, near: 0.1, far: 80 }}
      gl={{ antialias: true }}
      aria-label="Cena 3D da bancada de montagem"
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 16, 32]} />

      <hemisphereLight args={['#dbe7ff', '#1a1d22', 0.45]} />
      <directionalLight
        castShadow
        position={[3.5, 7, 4]}
        intensity={1.8}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <pointLight position={[-4, 3, -2]} intensity={6} color="#7dd3fc" distance={12} />

      {/* Ambiente procedural (sem HDR externo): lightformers apontados para a origem */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[0, 5, -3]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 2, 1]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 2, 1]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[0, 1.5, 8]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={0.4} position={[0, -4, 0]} scale={[14, 14, 1]} />
        <Lightformer form="ring" color="#7dd3fc" intensity={1.5} position={[0, 4, 5]} scale={3} />
      </Environment>

      <Suspense fallback={null}>
        <Workbench theme={theme} />
        {PART_IDS.map((id) => (
          <PartActor key={id} id={id} />
        ))}
        <SnapSlot />
      </Suspense>

      <ContactShadows
        position={[0, MAT_TOP + 0.002, 0]}
        scale={[10, 5.4]}
        resolution={1024}
        blur={2.2}
        far={1.5}
        opacity={theme === 'dark' ? 0.65 : 0.4}
      />

      <OrbitControls
        makeDefault
        target={[0, 0.2, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={16}
        minPolarAngle={0.15}
        maxPolarAngle={1.32}
      />
      <CameraRig />
    </Canvas>
  )
}
