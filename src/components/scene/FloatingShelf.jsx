import { useMemo } from 'react'
import { useStore, ASSEMBLY_ORDERS } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { resolveMatProps } from '../../utils/woodMaterial'
import { Board } from './Board.jsx'

export default function FloatingShelf() {
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
  const shelfUp    = ex * 20
  const bracketOut = ex * 25
  const railBack   = ex * 20

  return (
    <group position={[0, 0, 0]}>
      {/* ─── Shelf board ─── */}
      <Board
        position={[0, H - T*0.6 + shelfUp, 0]}
        args={[W, T*1.2, D]}
        {...matProps}
        highlight={hl('Shelf Board')}
        dim={dm('Shelf Board')}
        {...asmProps('Shelf Board')}
      />

      {/* ─── Left bracket ─── */}
      {/* Vertical member */}
      <Board
        position={[-(W/2 - T) - bracketOut, (H - T*1.2)/2, -D/4]}
        args={[T*0.8, H - T*1.2, T*0.8]}
        {...matProps}
        highlight={hl('Brackets')}
        dim={dm('Brackets')}
        {...asmProps('Brackets')}
      />
      {/* Horizontal member */}
      <Board
        position={[-(W/2 - T) - bracketOut, T*0.4, 0]}
        args={[T*0.8, T*0.8, D - T]}
        {...matProps}
        highlight={hl('Brackets')}
        dim={dm('Brackets')}
        {...asmProps('Brackets')}
      />

      {/* ─── Right bracket ─── */}
      {/* Vertical member */}
      <Board
        position={[(W/2 - T) + bracketOut, (H - T*1.2)/2, -D/4]}
        args={[T*0.8, H - T*1.2, T*0.8]}
        {...matProps}
        highlight={hl('Brackets')}
        dim={dm('Brackets')}
        {...asmProps('Brackets')}
      />
      {/* Horizontal member */}
      <Board
        position={[(W/2 - T) + bracketOut, T*0.4, 0]}
        args={[T*0.8, T*0.8, D - T]}
        {...matProps}
        highlight={hl('Brackets')}
        dim={dm('Brackets')}
        {...asmProps('Brackets')}
      />

      {/* ─── Back mounting rail ─── */}
      <Board
        position={[0, H*0.5, -(D/2 - T*0.4) - railBack]}
        args={[W, T*0.8, T*0.8]}
        {...matProps}
        highlight={hl('Mounting Rail')}
        dim={dm('Mounting Rail')}
        {...asmProps('Mounting Rail')}
      />
    </group>
  )
}
