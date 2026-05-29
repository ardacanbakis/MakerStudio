import { useMemo } from 'react'
import { useStore, ASSEMBLY_ORDERS } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { resolveMatProps } from '../../utils/woodMaterial'
import { Board } from './Board.jsx'

export default function BedFrame() {
  const {
    dimensions, woodSpecies, woodThickness, renderMode, showTexture,
    explodeAmount, hoveredPart, surfaceFinish, paintColor,
  } = useStore()
  const assemblyStep  = useStore((s) => s.assemblyStep)
  const furnitureType = useStore((s) => s.furnitureType)

  const { width: W, height: H, depth: D } = dimensions
  const T  = woodThickness
  const ex = explodeAmount

  const matProps = useMemo(
    () => resolveMatProps({ woodSpecies, surfaceFinish, paintColor, showTexture, renderMode }, getWoodTexture),
    [woodSpecies, surfaceFinish, paintColor, showTexture, renderMode]
  )

  const hl = (label) => hoveredPart === label
  const dm = (label) => hoveredPart !== null && hoveredPart !== label

  const assemblyOrder = ASSEMBLY_ORDERS[furnitureType] ?? []
  const stepOf   = (label) => assemblyOrder.indexOf(label)
  const asmProps = (label) => ({
    ghost:   assemblyStep >= 0 && stepOf(label) > assemblyStep,
    current: assemblyStep >= 0 && stepOf(label) === assemblyStep,
  })

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
        {...asmProps('Headboard')}
      />

      {/* ─── Footboard ─── */}
      <Board
        position={[0, H*0.35, D/2 + footFwd]}
        args={[W + T*2, H*0.7, T]}
        {...matProps}
        highlight={hl('Footboard')}
        dim={dm('Footboard')}
        {...asmProps('Footboard')}
      />

      {/* ─── Left side rail ─── */}
      <Board
        position={[-(W/2) - railOut, H*0.25, 0]}
        args={[T, H*0.5, D - T*2]}
        {...matProps}
        highlight={hl('Side Rails')}
        dim={dm('Side Rails')}
        {...asmProps('Side Rails')}
      />

      {/* ─── Right side rail ─── */}
      <Board
        position={[(W/2) + railOut, H*0.25, 0]}
        args={[T, H*0.5, D - T*2]}
        {...matProps}
        highlight={hl('Side Rails')}
        dim={dm('Side Rails')}
        {...asmProps('Side Rails')}
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
          {...asmProps('Slats')}
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
        {...asmProps('Bed Legs')}
      />
      {/* Front-right */}
      <Board
        position={[(W/2 + T*0.1) + legOut, H/2, (D/2 - T*0.6) + legOut]}
        args={[T*1.2, H, T*1.2]}
        {...matProps}
        highlight={hl('Bed Legs')}
        dim={dm('Bed Legs')}
        {...asmProps('Bed Legs')}
      />
      {/* Back-left */}
      <Board
        position={[-(W/2 + T*0.1) - legOut, H/2, -(D/2 - T*0.6) - legOut]}
        args={[T*1.2, H, T*1.2]}
        {...matProps}
        highlight={hl('Bed Legs')}
        dim={dm('Bed Legs')}
        {...asmProps('Bed Legs')}
      />
      {/* Back-right */}
      <Board
        position={[(W/2 + T*0.1) + legOut, H/2, -(D/2 - T*0.6) - legOut]}
        args={[T*1.2, H, T*1.2]}
        {...matProps}
        highlight={hl('Bed Legs')}
        dim={dm('Bed Legs')}
        {...asmProps('Bed Legs')}
      />
    </group>
  )
}
