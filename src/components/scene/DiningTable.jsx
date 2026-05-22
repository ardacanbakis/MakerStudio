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

export default function DiningTable() {
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
  const topUp  = ex * 20
  const legOut = ex * 30

  const hasApron = W > 60

  return (
    <group position={[0, 0, 0]}>
      {/* ─── Tabletop ─── */}
      <Board
        position={[0, H - T + topUp, 0]}
        args={[W, T * 2, D]}
        {...matProps}
        highlight={hl('Tabletop')}
        dim={dm('Tabletop')}
      />

      {/* ─── Legs ─── */}
      {/* Left-front */}
      <Board
        position={[-(W/2 - T*2) - legOut, (H - T*2)/2, (D/2 - T*2) + legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
      />
      {/* Right-front */}
      <Board
        position={[(W/2 - T*2) + legOut, (H - T*2)/2, (D/2 - T*2) + legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
      />
      {/* Left-back */}
      <Board
        position={[-(W/2 - T*2) - legOut, (H - T*2)/2, -(D/2 - T*2) - legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
      />
      {/* Right-back */}
      <Board
        position={[(W/2 - T*2) + legOut, (H - T*2)/2, -(D/2 - T*2) - legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
      />

      {/* ─── Apron boards (optional) ─── */}
      {hasApron && (
        <>
          {/* Front apron */}
          <Board
            position={[0, H - T*3, (D/2 - T*2)]}
            args={[W - T*6, T*0.8, T*0.8]}
            {...matProps}
            highlight={hl('Apron')}
            dim={dm('Apron')}
          />
          {/* Back apron */}
          <Board
            position={[0, H - T*3, -(D/2 - T*2)]}
            args={[W - T*6, T*0.8, T*0.8]}
            {...matProps}
            highlight={hl('Apron')}
            dim={dm('Apron')}
          />
          {/* Left end apron */}
          <Board
            position={[-(W/2 - T*2), H - T*3, 0]}
            args={[T*0.8, T*0.8, D - T*6]}
            {...matProps}
            highlight={hl('Apron')}
            dim={dm('Apron')}
          />
          {/* Right end apron */}
          <Board
            position={[(W/2 - T*2), H - T*3, 0]}
            args={[T*0.8, T*0.8, D - T*6]}
            {...matProps}
            highlight={hl('Apron')}
            dim={dm('Apron')}
          />
        </>
      )}
    </group>
  )
}
