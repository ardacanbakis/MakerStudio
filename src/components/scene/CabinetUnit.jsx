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

function Board({ position, rotation, args, material }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow material={material}>
      <boxGeometry args={args} />
    </mesh>
  )
}

function useMaterials(woodSpecies, renderMode, showTexture) {
  return useMemo(() => {
    const color    = WOOD_COLORS[woodSpecies] ?? WOOD_COLORS.oak
    const roughness = WOOD_ROUGHNESS[woodSpecies] ?? 0.65
    const map      = showTexture ? getWoodTexture(woodSpecies) : null
    if (renderMode === 'wireframe') {
      const wf = new MeshBasicMaterial({ color: '#f59e0b', wireframe: true })
      return { main: wf, back: wf, door: wf }
    }
    const xray = renderMode === 'xray'
    const base = { color, roughness, metalness: 0.04, map }
    const xrOpts = xray ? { transparent: true, opacity: 0.22, depthWrite: false } : {}
    return {
      main: new MeshStandardMaterial({ ...base, ...xrOpts }),
      back: new MeshStandardMaterial({ ...base, roughness: roughness + 0.12, metalness: 0.01, ...xrOpts }),
      door: new MeshStandardMaterial({ ...base, roughness: roughness - 0.08, metalness: 0.06, ...xrOpts }),
    }
  }, [woodSpecies, renderMode, showTexture])
}

export default function CabinetUnit() {
  const {
    dimensions, woodSpecies, woodThickness, shelfCount,
    renderMode, showTexture, explodeAmount, doorsOpen,
  } = useStore()
  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness
  const ex = explodeAmount

  const { main, back, door } = useMaterials(woodSpecies, renderMode, showTexture)

  const shelfYs = useMemo(() => {
    const innerH = H - 2 * T
    const spacing = innerH / (shelfCount + 1)
    return Array.from({ length: shelfCount }, (_, i) => -H/2 + T + spacing * (i + 1))
  }, [H, T, shelfCount])

  const midShelfY = shelfYs.length ? (shelfYs[0] + shelfYs.at(-1)) / 2 : 0

  const groupY = H / 2
  const spreadX = ex * 35
  const spreadY = ex * 25
  const spreadZ = ex * 40

  // Doors swing open on Y axis
  const doorAngle = doorsOpen ? -Math.PI / 2.8 : 0
  const doorW     = (W - 2 * T) / 2
  const doorH     = H - T * 2
  const doorT     = T * 0.8

  return (
    <group position={[0, groupY, 0]}>
      {/* Carcass */}
      <Board position={[-(W/2 - T/2) - spreadX, 0, 0]} args={[T, H, D]} material={main} />
      <Board position={[ (W/2 - T/2) + spreadX, 0, 0]} args={[T, H, D]} material={main} />
      <Board position={[0,  H/2 - T/2 + spreadY, 0]} args={[W - 2*T, T, D]} material={main} />
      <Board position={[0, -H/2 + T/2 - spreadY, 0]} args={[W - 2*T, T, D]} material={main} />

      {/* Shelves */}
      {shelfYs.map((y, i) => {
        const dir = shelfYs.length > 1
          ? (y - midShelfY) / Math.abs(shelfYs.at(-1) - midShelfY || 1)
          : 0
        return (
          <Board
            key={i}
            position={[0, y + dir * spreadY * 0.5, 0]}
            args={[W - 2*T, T, D - 1]}
            material={main}
          />
        )
      })}

      {/* Back panel */}
      <Board position={[0, 0, -(D/2 - 0.3) - spreadZ]} args={[W, H, 0.6]} material={back} />

      {/* Left door — pivots from its left edge */}
      {!ex && (
        <group position={[-(W/2 - T) - 0.1, 0, D/2]}>
          <group rotation={[0, -doorAngle, 0]}>
            <mesh
              position={[doorW / 2, 0, 0]}
              receiveShadow castShadow material={door}
            >
              <boxGeometry args={[doorW, doorH, doorT]} />
            </mesh>
            {/* Door pull — small cylinder */}
            <mesh position={[doorW * 0.85, 0, doorT / 2 + 0.8]} material={door}>
              <cylinderGeometry args={[0.6, 0.6, 4, 12]} />
            </mesh>
          </group>
        </group>
      )}

      {/* Right door — pivots from its right edge */}
      {!ex && (
        <group position={[(W/2 - T) + 0.1, 0, D/2]}>
          <group rotation={[0, doorAngle, 0]}>
            <mesh
              position={[-doorW / 2, 0, 0]}
              receiveShadow castShadow material={door}
            >
              <boxGeometry args={[doorW, doorH, doorT]} />
            </mesh>
            <mesh position={[-doorW * 0.85, 0, doorT / 2 + 0.8]} material={door}>
              <cylinderGeometry args={[0.6, 0.6, 4, 12]} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  )
}
