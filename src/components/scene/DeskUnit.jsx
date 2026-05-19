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

function Board({ position, args, rotation, color, roughness, metalness = 0.05, map, renderMode, highlight, dim }) {
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

export default function DeskUnit() {
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

  // Pedestal proportions
  const pedW  = Math.min(50, W * 0.22)
  const pedH  = H - T * 1.5   // height below desktop
  const legT  = T * 0.8        // leg panel thickness

  // Explode offsets
  const topUp    = ex * 20
  const sideOut  = ex * 30
  const backOut  = ex * 30
  const pedShelf = ex * 15

  return (
    <group position={[0, 0, 0]}>
      {/* ─── Desktop top ─── */}
      <Board
        position={[0, H + topUp, 0]}
        args={[W, T * 1.5, D]}
        {...matProps}
        highlight={hl('Desktop top')}
        dim={dm('Desktop top')}
      />

      {/* ─── Left pedestal ─── */}
      <group position={[-(W / 2 - pedW / 2) - sideOut * 0.4, 0, 0]}>
        {/* outer side */}
        <Board position={[-(pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        {/* inner side */}
        <Board position={[ (pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        {/* top of ped */}
        <Board position={[0, pedH, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        {/* bottom */}
        <Board position={[0, legT/2, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        {/* mid shelf */}
        <Board position={[0, pedH * 0.45 + pedShelf * 0.3, 0]} args={[pedW - 2*legT, legT, D - 2]} {...matProps} highlight={hl('Pedestal shelf')} dim={dm('Pedestal shelf')} />
      </group>

      {/* ─── Right pedestal ─── */}
      <group position={[(W / 2 - pedW / 2) + sideOut * 0.4, 0, 0]}>
        <Board position={[-(pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        <Board position={[ (pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        <Board position={[0, pedH, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        <Board position={[0, legT/2, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} />
        <Board position={[0, pedH * 0.65 + pedShelf * 0.5, 0]} args={[pedW - 2*legT, legT, D - 2]} {...matProps} highlight={hl('Pedestal shelf')} dim={dm('Pedestal shelf')} />
      </group>

      {/* ─── Modesty / back panel ─── */}
      <Board
        position={[0, pedH * 0.35, -(D/2 - 0.4) - backOut]}
        args={[W - 2*pedW, pedH * 0.6, 0.6]}
        {...matProps}
        highlight={hl('Modesty panel')}
        dim={dm('Modesty panel')}
      />
    </group>
  )
}
