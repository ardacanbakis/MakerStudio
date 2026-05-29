import { useMemo } from 'react'
import { useStore, ASSEMBLY_ORDERS } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { Board } from './Board.jsx'
import { resolveMatProps } from '../../utils/woodMaterial.js'

export default function DeskUnit() {
  const {
    dimensions, woodSpecies, woodThickness,
    renderMode, showTexture, explodeAmount, hoveredPart,
    surfaceFinish, paintColor, assemblyStep, furnitureType,
  } = useStore()
  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness
  const ex = explodeAmount

  const matProps = useMemo(
    () => resolveMatProps({ woodSpecies, surfaceFinish, paintColor, showTexture, renderMode }, getWoodTexture),
    [woodSpecies, surfaceFinish, paintColor, showTexture, renderMode],
  )

  const hl = (label) => hoveredPart === label
  const dm = (label) => hoveredPart !== null && hoveredPart !== label

  const assemblyOrder = ASSEMBLY_ORDERS[furnitureType] ?? []
  const stepOf = (label) => assemblyOrder.indexOf(label)
  const asmProps = (label) => ({
    ghost:   assemblyStep >= 0 && stepOf(label) > assemblyStep,
    current: assemblyStep >= 0 && stepOf(label) === assemblyStep,
  })

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
        {...asmProps('Desktop top')}
      />

      {/* ─── Left pedestal ─── */}
      <group position={[-(W / 2 - pedW / 2) - sideOut * 0.4, 0, 0]}>
        {/* outer side */}
        <Board position={[-(pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        {/* inner side */}
        <Board position={[ (pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        {/* top of ped */}
        <Board position={[0, pedH, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        {/* bottom */}
        <Board position={[0, legT/2, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        {/* mid shelf */}
        <Board position={[0, pedH * 0.45 + pedShelf * 0.3, 0]} args={[pedW - 2*legT, legT, D - 2]} {...matProps} highlight={hl('Pedestal shelf')} dim={dm('Pedestal shelf')} {...asmProps('Pedestal shelf')} />
      </group>

      {/* ─── Right pedestal ─── */}
      <group position={[(W / 2 - pedW / 2) + sideOut * 0.4, 0, 0]}>
        <Board position={[-(pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        <Board position={[ (pedW/2 - legT/2), pedH/2, 0]} args={[legT, pedH, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        <Board position={[0, pedH, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        <Board position={[0, legT/2, 0]} args={[pedW - 2*legT, legT, D]} {...matProps} highlight={hl('Pedestal side')} dim={dm('Pedestal side')} {...asmProps('Pedestal side')} />
        <Board position={[0, pedH * 0.65 + pedShelf * 0.5, 0]} args={[pedW - 2*legT, legT, D - 2]} {...matProps} highlight={hl('Pedestal shelf')} dim={dm('Pedestal shelf')} {...asmProps('Pedestal shelf')} />
      </group>

      {/* ─── Modesty / back panel ─── */}
      <Board
        position={[0, pedH * 0.35, -(D/2 - 0.4) - backOut]}
        args={[W - 2*pedW, pedH * 0.6, 0.6]}
        {...matProps}
        highlight={hl('Modesty panel')}
        dim={dm('Modesty panel')}
        {...asmProps('Modesty panel')}
      />
    </group>
  )
}
