import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'

const WOOD_COLORS = {
  oak:'#c9aa70',pine:'#e5c882',walnut:'#6e4428',maple:'#f2deb0',mahogany:'#8c301e',birch:'#e0c87a',cherry:'#a05530',
}
const WOOD_ROUGHNESS = {
  oak:0.62,pine:0.80,walnut:0.52,maple:0.55,mahogany:0.48,birch:0.68,cherry:0.50,
}

function Board({ position, rotation, args, color, roughness, metalness=0.04, map, renderMode, highlight, dim }) {
  if (renderMode === 'wireframe') {
    return (
      <mesh position={position} rotation={rotation} receiveShadow castShadow>
        <boxGeometry args={args} />
        <meshBasicMaterial color="#f59e0b" wireframe />
      </mesh>
    )
  }
  const xray = renderMode === 'xray'
  const transparent = xray || dim
  const opacity = xray ? 0.22 : dim ? 0.15 : 1
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
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

export default function BedFrame() {
  const { dimensions, woodSpecies, woodThickness, renderMode, showTexture, explodeAmount, hoveredPart } = useStore()
  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness
  const ex = explodeAmount

  const color = WOOD_COLORS[woodSpecies] ?? WOOD_COLORS.oak
  const roughness = WOOD_ROUGHNESS[woodSpecies] ?? 0.65
  const map = useMemo(() => showTexture ? getWoodTexture(woodSpecies) : null, [woodSpecies, showTexture])

  const matProps = { color, roughness, map, renderMode }

  const hl = (label) => hoveredPart === label
  const dm = (label) => hoveredPart !== null && hoveredPart !== label

  // Explode offsets
  const headBack = ex * 35
  const footFwd  = ex * 35
  const railOut  = ex * 25
  const slatUp   = ex * 20
  const legOut   = ex * 20

  // 7 evenly-spaced slats along D
  const slatCount = 7
  const slatStart = -(D/2 - T*4)
  const slatEnd   =  (D/2 - T*4)
  const slatPositions = Array.from({ length: slatCount }, (_, i) =>
    slatStart + (i / (slatCount - 1)) * (slatEnd - slatStart)
  )

  return (
    <group position={[0, 0, 0]}>
      {/* ─── Headboard ─── */}
      <Board
        position={[0, H*0.8, -(D/2) - headBack]}
        args={[W + T*2, H*1.6, T]}
        {...matProps}
        highlight={hl('Headboard')}
        dim={dm('Headboard')}
      />

      {/* ─── Footboard ─── */}
      <Board
        position={[0, H*0.35, D/2 + footFwd]}
        args={[W + T*2, H*0.7, T]}
        {...matProps}
        highlight={hl('Footboard')}
        dim={dm('Footboard')}
      />

      {/* ─── Left side rail ─── */}
      <Board
        position={[-(W/2) - railOut, H*0.25, 0]}
        args={[T, H*0.5, D - T*2]}
        {...matProps}
        highlight={hl('Side Rails')}
        dim={dm('Side Rails')}
      />

      {/* ─── Right side rail ─── */}
      <Board
        position={[(W/2) + railOut, H*0.25, 0]}
        args={[T, H*0.5, D - T*2]}
        {...matProps}
        highlight={hl('Side Rails')}
        dim={dm('Side Rails')}
      />

      {/* ─── Slats ─── */}
      {slatPositions.map((z, i) => (
        <Board
          key={i}
          position={[0, H*0.05 + slatUp, z]}
          args={[W - T*2, T*0.8, T*3]}
          {...matProps}
          highlight={hl('Slats')}
          dim={dm('Slats')}
        />
      ))}

      {/* ─── Legs ─── */}
      {/* Front-left */}
      <Board
        position={[-(W/2 + T*0.1) - legOut, H/2, (D/2 - T*0.6) + legOut]}
        args={[T*1.2, H, T*1.2]}
        {...matProps}
        highlight={hl('Bed Legs')}
        dim={dm('Bed Legs')}
      />
      {/* Front-right */}
      <Board
        position={[(W/2 + T*0.1) + legOut, H/2, (D/2 - T*0.6) + legOut]}
        args={[T*1.2, H, T*1.2]}
        {...matProps}
        highlight={hl('Bed Legs')}
        dim={dm('Bed Legs')}
      />
      {/* Back-left */}
      <Board
        position={[-(W/2 + T*0.1) - legOut, H/2, -(D/2 - T*0.6) - legOut]}
        args={[T*1.2, H, T*1.2]}
        {...matProps}
        highlight={hl('Bed Legs')}
        dim={dm('Bed Legs')}
      />
      {/* Back-right */}
      <Board
        position={[(W/2 + T*0.1) + legOut, H/2, -(D/2 - T*0.6) - legOut]}
        args={[T*1.2, H, T*1.2]}
        {...matProps}
        highlight={hl('Bed Legs')}
        dim={dm('Bed Legs')}
      />
    </group>
  )
}
