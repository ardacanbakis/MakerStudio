import { useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial, MeshBasicMaterial } from 'three'
import { useStore } from '../../store/useStore'

const WOOD_COLORS = {
  oak:        '#c8a96e',
  pine:       '#e8c98a',
  walnut:     '#6b4226',
  maple:      '#f5deb3',
  mahogany:   '#8b2e1e',
  birch:      '#dfc27d',
  cherry:     '#a0522d',
}

const WOOD_ROUGHNESS = {
  oak:      0.65,
  pine:     0.8,
  walnut:   0.55,
  maple:    0.6,
  mahogany: 0.5,
  birch:    0.7,
  cherry:   0.52,
}

function Board({ position, args, material }) {
  return (
    <mesh position={position} receiveShadow castShadow material={material}>
      <boxGeometry args={args} />
    </mesh>
  )
}

export default function ShelfUnit({ wireframe = false, xray = false }) {
  const { dimensions, woodSpecies, woodThickness, shelfCount } = useStore()
  const { width, height, depth } = dimensions

  // Scale from cm → Three.js units (1 unit = 1 cm)
  const W = width
  const H = height
  const D = depth
  const T = woodThickness

  const material = useMemo(() => {
    const color = WOOD_COLORS[woodSpecies] ?? WOOD_COLORS.oak
    const roughness = WOOD_ROUGHNESS[woodSpecies] ?? 0.65

    if (wireframe) {
      return new MeshBasicMaterial({ color: '#f59e0b', wireframe: true })
    }
    if (xray) {
      return new MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.3,
        roughness,
        metalness: 0.1,
        depthWrite: false,
      })
    }
    return new MeshStandardMaterial({
      color,
      roughness,
      metalness: 0.05,
    })
  }, [woodSpecies, wireframe, xray])

  const backMaterial = useMemo(() => {
    const color = WOOD_COLORS[woodSpecies] ?? WOOD_COLORS.oak
    if (wireframe) return material
    return new MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0.02,
    })
  }, [woodSpecies, wireframe, material])

  // Shelf Y positions — evenly distributed between bottom and top panels
  const shelfYPositions = useMemo(() => {
    const innerH = H - 2 * T
    return Array.from({ length: shelfCount }, (_, i) => {
      const spacing = innerH / (shelfCount + 1)
      return -H / 2 + T + spacing * (i + 1)
    })
  }, [H, T, shelfCount])

  // Center the unit vertically so its bottom sits at y=0
  const groupY = H / 2

  return (
    <group position={[0, groupY, 0]}>
      {/* Left side panel */}
      <Board
        position={[-W / 2 + T / 2, 0, 0]}
        args={[T, H, D]}
        material={material}
      />

      {/* Right side panel */}
      <Board
        position={[W / 2 - T / 2, 0, 0]}
        args={[T, H, D]}
        material={material}
      />

      {/* Top panel */}
      <Board
        position={[0, H / 2 - T / 2, 0]}
        args={[W - 2 * T, T, D]}
        material={material}
      />

      {/* Bottom panel */}
      <Board
        position={[0, -H / 2 + T / 2, 0]}
        args={[W - 2 * T, T, D]}
        material={material}
      />

      {/* Fixed shelves */}
      {shelfYPositions.map((y, i) => (
        <Board
          key={i}
          position={[0, y, 0]}
          args={[W - 2 * T, T, D - 1]}
          material={material}
        />
      ))}

      {/* Back panel (thinner) */}
      <Board
        position={[0, 0, -D / 2 + 0.3]}
        args={[W, H, 0.6]}
        material={backMaterial}
      />
    </group>
  )
}
