import { useMemo } from 'react'
import { MeshStandardMaterial, MeshBasicMaterial } from 'three'
import { useStore } from '../../store/useStore'

const WOOD_COLORS = {
  oak:      '#c8a96e',
  pine:     '#e8c98a',
  walnut:   '#6b4226',
  maple:    '#f5deb3',
  mahogany: '#8b2e1e',
  birch:    '#dfc27d',
  cherry:   '#a0522d',
}

const WOOD_ROUGHNESS = {
  oak: 0.65, pine: 0.82, walnut: 0.55, maple: 0.58,
  mahogany: 0.50, birch: 0.70, cherry: 0.52,
}

const WOOD_METALNESS = {
  oak: 0.04, pine: 0.02, walnut: 0.06, maple: 0.05,
  mahogany: 0.08, birch: 0.03, cherry: 0.06,
}

function Board({ position, args, material }) {
  return (
    <mesh position={position} receiveShadow castShadow material={material}>
      <boxGeometry args={args} />
    </mesh>
  )
}

export default function ShelfUnit() {
  const { dimensions, woodSpecies, woodThickness, shelfCount, renderMode } = useStore()
  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness

  const material = useMemo(() => {
    const color    = WOOD_COLORS[woodSpecies]    ?? WOOD_COLORS.oak
    const roughness = WOOD_ROUGHNESS[woodSpecies] ?? 0.65
    const metalness = WOOD_METALNESS[woodSpecies] ?? 0.04

    if (renderMode === 'wireframe') {
      return new MeshBasicMaterial({ color: '#f59e0b', wireframe: true })
    }
    if (renderMode === 'xray') {
      return new MeshStandardMaterial({
        color, roughness, metalness,
        transparent: true, opacity: 0.22,
        depthWrite: false,
      })
    }
    return new MeshStandardMaterial({ color, roughness, metalness })
  }, [woodSpecies, renderMode])

  const backMaterial = useMemo(() => {
    if (renderMode === 'wireframe') return material
    const color = WOOD_COLORS[woodSpecies] ?? WOOD_COLORS.oak
    return new MeshStandardMaterial({
      color,
      roughness: (WOOD_ROUGHNESS[woodSpecies] ?? 0.65) + 0.1,
      metalness: 0.01,
      ...(renderMode === 'xray' ? { transparent: true, opacity: 0.15, depthWrite: false } : {}),
    })
  }, [woodSpecies, renderMode, material])

  // Shelf Y positions inside the carcass
  const shelfYs = useMemo(() => {
    const innerH = H - 2 * T
    const spacing = innerH / (shelfCount + 1)
    return Array.from({ length: shelfCount }, (_, i) => -H / 2 + T + spacing * (i + 1))
  }, [H, T, shelfCount])

  const groupY = H / 2

  return (
    <group position={[0, groupY, 0]}>
      {/* Left side */}
      <Board position={[-(W / 2) + T / 2, 0, 0]} args={[T, H, D]} material={material} />

      {/* Right side */}
      <Board position={[W / 2 - T / 2, 0, 0]} args={[T, H, D]} material={material} />

      {/* Top */}
      <Board position={[0, H / 2 - T / 2, 0]} args={[W - 2 * T, T, D]} material={material} />

      {/* Bottom */}
      <Board position={[0, -(H / 2) + T / 2, 0]} args={[W - 2 * T, T, D]} material={material} />

      {/* Shelves */}
      {shelfYs.map((y, i) => (
        <Board key={i} position={[0, y, 0]} args={[W - 2 * T, T, D - 1.2]} material={material} />
      ))}

      {/* Back panel (6 mm ply) */}
      <Board position={[0, 0, -(D / 2) + 0.3]} args={[W, H, 0.6]} material={backMaterial} />
    </group>
  )
}
