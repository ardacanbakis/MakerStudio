import { useMemo } from 'react'
import { useStore, ASSEMBLY_ORDERS } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { resolveMatProps } from '../../utils/woodMaterial'
import { Board } from './Board.jsx'

export default function DiningTable() {
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
  const stepOf  = (label) => assemblyOrder.indexOf(label)
  const asmProps = (label) => ({
    ghost:   assemblyStep >= 0 && stepOf(label) > assemblyStep,
    current: assemblyStep >= 0 && stepOf(label) === assemblyStep,
  })

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
        {...asmProps('Tabletop')}
      />

      {/* ─── Legs ─── */}
      {/* Left-front */}
      <Board
        position={[-(W/2 - T*2) - legOut, (H - T*2)/2, (D/2 - T*2) + legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
        {...asmProps('Table Legs')}
      />
      {/* Right-front */}
      <Board
        position={[(W/2 - T*2) + legOut, (H - T*2)/2, (D/2 - T*2) + legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
        {...asmProps('Table Legs')}
      />
      {/* Left-back */}
      <Board
        position={[-(W/2 - T*2) - legOut, (H - T*2)/2, -(D/2 - T*2) - legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
        {...asmProps('Table Legs')}
      />
      {/* Right-back */}
      <Board
        position={[(W/2 - T*2) + legOut, (H - T*2)/2, -(D/2 - T*2) - legOut]}
        args={[T*1.5, H - T*2, T*1.5]}
        {...matProps}
        highlight={hl('Table Legs')}
        dim={dm('Table Legs')}
        {...asmProps('Table Legs')}
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
            {...asmProps('Apron')}
          />
          {/* Back apron */}
          <Board
            position={[0, H - T*3, -(D/2 - T*2)]}
            args={[W - T*6, T*0.8, T*0.8]}
            {...matProps}
            highlight={hl('Apron')}
            dim={dm('Apron')}
            {...asmProps('Apron')}
          />
          {/* Left end apron */}
          <Board
            position={[-(W/2 - T*2), H - T*3, 0]}
            args={[T*0.8, T*0.8, D - T*6]}
            {...matProps}
            highlight={hl('Apron')}
            dim={dm('Apron')}
            {...asmProps('Apron')}
          />
          {/* Right end apron */}
          <Board
            position={[(W/2 - T*2), H - T*3, 0]}
            args={[T*0.8, T*0.8, D - T*6]}
            {...matProps}
            highlight={hl('Apron')}
            dim={dm('Apron')}
            {...asmProps('Apron')}
          />
        </>
      )}
    </group>
  )
}
