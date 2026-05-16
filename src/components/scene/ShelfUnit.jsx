import { useMemo } from 'react'
import { MeshStandardMaterial, MeshBasicMaterial } from 'three'
import { useStore } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'

const WOOD_COLORS = {
  oak: '#c9aa70', pine: '#e5c882', walnut: '#6e4428',
  maple: '#f2deb0', mahogany: '#8c301e', birch: '#e0c87a', cherry: '#a05530',
}
const WOOD_ROUGHNESS = {
  oak: 0.62, pine: 0.80, walnut: 0.52, maple: 0.55,
  mahogany: 0.48, birch: 0.68, cherry: 0.50,
}

function useMaterials(woodSpecies, renderMode, showTexture) {
  return useMemo(() => {
    const color    = WOOD_COLORS[woodSpecies] ?? WOOD_COLORS.oak
    const roughness = WOOD_ROUGHNESS[woodSpecies] ?? 0.65
    const map      = showTexture ? getWoodTexture(woodSpecies) : null

    if (renderMode === 'wireframe') {
      return {
        main: new MeshBasicMaterial({ color: '#f59e0b', wireframe: true }),
        back: new MeshBasicMaterial({ color: '#f59e0b', wireframe: true }),
      }
    }
    const xray = renderMode === 'xray'
    const main = new MeshStandardMaterial({
      color, roughness, metalness: 0.04, map,
      ...(xray ? { transparent: true, opacity: 0.22, depthWrite: false } : {}),
    })
    const back = new MeshStandardMaterial({
      color, roughness: roughness + 0.12, metalness: 0.01, map,
      ...(xray ? { transparent: true, opacity: 0.15, depthWrite: false } : {}),
    })
    return { main, back }
  }, [woodSpecies, renderMode, showTexture])
}

function Board({ position, args, material }) {
  return (
    <mesh position={position} receiveShadow castShadow material={material}>
      <boxGeometry args={args} />
    </mesh>
  )
}

export default function ShelfUnit() {
  const { dimensions, woodSpecies, woodThickness, shelfCount, renderMode, showTexture, explodeAmount } = useStore()
  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness
  const ex = explodeAmount

  const { main, back } = useMaterials(woodSpecies, renderMode, showTexture)

  const shelfYs = useMemo(() => {
    const innerH = H - 2 * T
    const spacing = innerH / (shelfCount + 1)
    return Array.from({ length: shelfCount }, (_, i) => -H / 2 + T + spacing * (i + 1))
  }, [H, T, shelfCount])

  const groupY = H / 2
  const spreadX = ex * 35
  const spreadY = ex * 25
  const spreadZ = ex * 40

  // Shelf spread: shelves fan out from the centre of their Y range
  const midShelfY = shelfYs.length ? (shelfYs[0] + shelfYs.at(-1)) / 2 : 0

  return (
    <group position={[0, groupY, 0]}>
      <Board position={[-(W/2 - T/2) - spreadX, 0, 0]} args={[T, H, D]} material={main} />
      <Board position={[ (W/2 - T/2) + spreadX, 0, 0]} args={[T, H, D]} material={main} />
      <Board position={[0,  H/2 - T/2 + spreadY, 0]} args={[W - 2*T, T, D]} material={main} />
      <Board position={[0, -H/2 + T/2 - spreadY, 0]} args={[W - 2*T, T, D]} material={main} />
      {shelfYs.map((y, i) => {
        const dir = shelfYs.length > 1 ? (y - midShelfY) / Math.abs(shelfYs.at(-1) - midShelfY || 1) : 0
        return (
          <Board
            key={i}
            position={[0, y + dir * spreadY * 0.6, 0]}
            args={[W - 2*T, T, D - 1.2]}
            material={main}
          />
        )
      })}
      <Board position={[0, 0, -(D/2 - 0.3) - spreadZ]} args={[W, H, 0.6]} material={back} />
    </group>
  )
}
