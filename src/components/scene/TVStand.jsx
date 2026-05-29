import { useMemo } from 'react'
import { useStore, ASSEMBLY_ORDERS } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { resolveMatProps } from '../../utils/woodMaterial'
import { Board } from './Board.jsx'

export default function TVStand() {
  const {
    dimensions, woodSpecies, woodThickness, shelfCount,
    renderMode, showTexture, explodeAmount, hoveredPart,
    surfaceFinish, paintColor, furnitureType,
  } = useStore()
  const assemblyStep = useStore((s) => s.assemblyStep)
  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness
  const ex = explodeAmount

  const matProps = useMemo(
    () => resolveMatProps({ woodSpecies, surfaceFinish, paintColor, showTexture, renderMode }, getWoodTexture),
    [woodSpecies, surfaceFinish, paintColor, showTexture, renderMode]
  )

  const hl = (label) => hoveredPart === label
  const dm = (label) => hoveredPart !== null && hoveredPart !== label
  const assemblyOrder = ASSEMBLY_ORDERS[furnitureType] ?? []
  const stepOf = (label) => assemblyOrder.indexOf(label)
  const asmProps = (label) => ({
    ghost:   assemblyStep >= 0 && stepOf(label) > assemblyStep,
    current: assemblyStep >= 0 && stepOf(label) === assemblyStep,
  })

  // Three bays: left cabinet | center open | right cabinet
  const bayW = (W - 4 * T) / 3  // width of each bay (2 dividers + 2 outer sides = 4×T)

  // Explode offsets
  const topUp    = ex * 18
  const botDown  = ex * 12
  const sideOut  = ex * 28
  const divOut   = ex * 12
  const shelfUp  = ex * 10
  const backOut  = ex * 25

  // Shelf Y positions inside each side bay
  const innerH = H - 2 * T
  const numShelves = Math.max(1, shelfCount)
  const shelfYs = Array.from({ length: numShelves }, (_, i) =>
    -H / 2 + T + (innerH / (numShelves + 1)) * (i + 1)
  )

  return (
    <group position={[0, H / 2, 0]}>

      {/* ── Top panel ── */}
      <Board position={[0, H/2 - T/2 + topUp, 0]} args={[W, T, D]}
        {...matProps} highlight={hl('Top panel')} dim={dm('Top panel')} {...asmProps('Top panel')} />

      {/* ── Bottom panel ── */}
      <Board position={[0, -H/2 + T/2 - botDown, 0]} args={[W, T, D]}
        {...matProps} highlight={hl('Bottom panel')} dim={dm('Bottom panel')} {...asmProps('Bottom panel')} />

      {/* ── Left side panel ── */}
      <Board position={[-(W/2 - T/2) - sideOut, 0, 0]} args={[T, H, D]}
        {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} {...asmProps('Side panels')} />

      {/* ── Right side panel ── */}
      <Board position={[(W/2 - T/2) + sideOut, 0, 0]} args={[T, H, D]}
        {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} {...asmProps('Side panels')} />

      {/* ── Left divider (at 1/3 of width) ── */}
      <Board position={[-(bayW/2 + T/2) - divOut * 0.4, 0, 0]} args={[T, H - 2*T, D]}
        {...matProps} highlight={hl('Dividers')} dim={dm('Dividers')} {...asmProps('Dividers')} />

      {/* ── Right divider (at 2/3 of width) ── */}
      <Board position={[(bayW/2 + T/2) + divOut * 0.4, 0, 0]} args={[T, H - 2*T, D]}
        {...matProps} highlight={hl('Dividers')} dim={dm('Dividers')} {...asmProps('Dividers')} />

      {/* ── Shelves — left bay ── */}
      {shelfYs.map((y, i) => (
        <Board key={`ls-${i}`}
          position={[-(bayW + T + divOut * 0.3), y + shelfUp * (i + 1) * 0.2, 0]}
          args={[bayW, T, D - 2]}
          {...matProps} highlight={hl('Shelves')} dim={dm('Shelves')} {...asmProps('Shelves')} />
      ))}

      {/* ── Shelves — right bay ── */}
      {shelfYs.map((y, i) => (
        <Board key={`rs-${i}`}
          position={[(bayW + T + divOut * 0.3), y + shelfUp * (i + 1) * 0.2, 0]}
          args={[bayW, T, D - 2]}
          {...matProps} highlight={hl('Shelves')} dim={dm('Shelves')} {...asmProps('Shelves')} />
      ))}

      {/* ── Center bottom shelf (cable box area) ── */}
      <Board
        position={[0, -H/2 + T + innerH * 0.35, 0]}
        args={[bayW, T, D - 2]}
        {...matProps} highlight={hl('Shelves')} dim={dm('Shelves')} {...asmProps('Shelves')} />

      {/* ── Back panel ── */}
      <Board position={[0, 0, -(D/2 - 0.3) - backOut]} args={[W, H, 0.6]}
        {...matProps}
        roughness={Math.min(1, (matProps.roughness ?? 0.65) + 0.12)}
        metalness={0.01}
        highlight={hl('Back panel')} dim={dm('Back panel')} {...asmProps('Back panel')} />

    </group>
  )
}
