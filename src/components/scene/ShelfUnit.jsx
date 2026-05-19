import { useMemo } from 'react'
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

function Board({ position, args, color, roughness, metalness = 0.04, map, renderMode, highlight, dim }) {
  if (renderMode === 'wireframe') {
    return (
      <mesh position={position} receiveShadow castShadow>
        <boxGeometry args={args} />
        <meshBasicMaterial color="#f59e0b" wireframe />
      </mesh>
    )
  }
  const xray = renderMode === 'xray'
  const transparent = xray || dim
  const opacity = xray ? 0.22 : dim ? 0.15 : 1
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color} roughness={roughness} metalness={metalness} map={map}
        transparent={transparent} opacity={opacity} depthWrite={!xray && !dim}
        emissive={highlight ? '#f59e0b' : '#000000'}
        emissiveIntensity={highlight ? 0.45 : 0}
      />
    </mesh>
  )
}

export default function ShelfUnit() {
  const { dimensions, woodSpecies, woodThickness, shelfCount, renderMode, showTexture, explodeAmount, hoveredPart } = useStore()
  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness
  const ex = explodeAmount

  const color = WOOD_COLORS[woodSpecies] ?? WOOD_COLORS.oak
  const roughness = WOOD_ROUGHNESS[woodSpecies] ?? 0.65
  const map = useMemo(() => showTexture ? getWoodTexture(woodSpecies) : null, [woodSpecies, showTexture])

  const matProps = { color, roughness, map, renderMode }

  const hl = (label) => hoveredPart === label
  const dm = (label) => hoveredPart !== null && hoveredPart !== label

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
      <Board position={[-(W/2 - T/2) - spreadX, 0, 0]} args={[T, H, D]} {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} />
      <Board position={[ (W/2 - T/2) + spreadX, 0, 0]} args={[T, H, D]} {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} />
      <Board position={[0,  H/2 - T/2 + spreadY, 0]} args={[W - 2*T, T, D]} {...matProps} highlight={hl('Top panel')} dim={dm('Top panel')} />
      <Board position={[0, -H/2 + T/2 - spreadY, 0]} args={[W - 2*T, T, D]} {...matProps} highlight={hl('Bottom panel')} dim={dm('Bottom panel')} />
      {shelfYs.map((y, i) => {
        const dir = shelfYs.length > 1 ? (y - midShelfY) / Math.abs(shelfYs.at(-1) - midShelfY || 1) : 0
        return (
          <Board
            key={i}
            position={[0, y + dir * spreadY * 0.6, 0]}
            args={[W - 2*T, T, D - 1.2]}
            {...matProps}
            highlight={hl('Shelves')}
            dim={dm('Shelves')}
          />
        )
      })}
      <Board position={[0, 0, -(D/2 - 0.3) - spreadZ]} args={[W, H, 0.6]} {...matProps} roughness={roughness + 0.12} metalness={0.01} highlight={hl('Back panel')} dim={dm('Back panel')} />
    </group>
  )
}
