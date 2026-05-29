import { useMemo } from 'react'
import { useStore, ASSEMBLY_ORDERS } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { Board } from './Board.jsx'
import { resolveMatProps } from '../../utils/woodMaterial.js'

export default function ShelfUnit() {
  const {
    dimensions, woodSpecies, woodThickness, shelfCount,
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
      <Board position={[-(W/2 - T/2) - spreadX, 0, 0]} args={[T, H, D]} {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} {...asmProps('Side panels')} />
      <Board position={[ (W/2 - T/2) + spreadX, 0, 0]} args={[T, H, D]} {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} {...asmProps('Side panels')} />
      <Board position={[0,  H/2 - T/2 + spreadY, 0]} args={[W - 2*T, T, D]} {...matProps} highlight={hl('Top panel')} dim={dm('Top panel')} {...asmProps('Top panel')} />
      <Board position={[0, -H/2 + T/2 - spreadY, 0]} args={[W - 2*T, T, D]} {...matProps} highlight={hl('Bottom panel')} dim={dm('Bottom panel')} {...asmProps('Bottom panel')} />
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
            {...asmProps('Shelves')}
          />
        )
      })}
      <Board position={[0, 0, -(D/2 - 0.3) - spreadZ]} args={[W, H, 0.6]} {...matProps} roughness={(matProps.roughness ?? 0.65) + 0.12} metalness={0.01} highlight={hl('Back panel')} dim={dm('Back panel')} {...asmProps('Back panel')} />
    </group>
  )
}
