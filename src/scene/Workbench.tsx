import { Grid } from '@react-three/drei'
import { MAT_TOP } from '../data/parts'
import type { Theme } from '../store/uiStore'

const BENCH = { width: 10, depth: 5.4, thickness: 0.28, legHeight: 2.6 }
const MAT = { width: 3.2, depth: 3.2 }

const COLORS: Record<
  Theme,
  { top: string; edge: string; leg: string; mat: string; cell: string; section: string }
> = {
  dark: {
    top: '#1b1f25',
    edge: '#2a3038',
    leg: '#14171c',
    mat: '#132233',
    cell: '#1f3a52',
    section: '#2f6a92',
  },
  light: {
    top: '#c9ced4',
    edge: '#aeb5bd',
    leg: '#9aa2ab',
    mat: '#2a3d52',
    cell: '#3c5875',
    section: '#5b8fbf',
  },
}

interface WorkbenchProps {
  theme: Theme
}

/** Bancada com tapete antiestático quadriculado no centro (área de montagem). */
export function Workbench({ theme }: WorkbenchProps) {
  const c = COLORS[theme]
  const legX = BENCH.width / 2 - 0.35
  const legZ = BENCH.depth / 2 - 0.35
  return (
    <group>
      {/* Tampo */}
      <mesh position={[0, -BENCH.thickness / 2, 0]} receiveShadow>
        <boxGeometry args={[BENCH.width, BENCH.thickness, BENCH.depth]} />
        <meshStandardMaterial color={c.top} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Friso frontal */}
      <mesh position={[0, -BENCH.thickness / 2, BENCH.depth / 2 + 0.01]}>
        <boxGeometry args={[BENCH.width, BENCH.thickness, 0.02]} />
        <meshStandardMaterial color={c.edge} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Pés */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}:${sz}`}
            position={[sx * legX, -BENCH.thickness - BENCH.legHeight / 2, sz * legZ]}
          >
            <boxGeometry args={[0.16, BENCH.legHeight, 0.16]} />
            <meshStandardMaterial color={c.leg} roughness={0.6} metalness={0.5} />
          </mesh>
        )),
      )}

      {/* Tapete antiestático */}
      <mesh position={[0, MAT_TOP / 2, 0]} receiveShadow>
        <boxGeometry args={[MAT.width, MAT_TOP, MAT.depth]} />
        <meshStandardMaterial color={c.mat} roughness={0.9} />
      </mesh>
      <Grid
        position={[0, MAT_TOP + 0.001, 0]}
        args={[MAT.width, MAT.depth]}
        cellSize={0.1}
        cellThickness={0.6}
        cellColor={c.cell}
        sectionSize={0.5}
        sectionThickness={1}
        sectionColor={c.section}
        fadeDistance={40}
        fadeStrength={0}
      />
    </group>
  )
}
