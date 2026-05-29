import { useMemo } from 'react'
import { useStore, ASSEMBLY_ORDERS } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { Board } from './Board.jsx'
import { resolveMatProps } from '../../utils/woodMaterial.js'

export default function CabinetUnit() {
  const {
    dimensions, woodSpecies, woodThickness, shelfCount,
    renderMode, showTexture, explodeAmount, doorsOpen, hoveredPart,
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
    return Array.from({ length: shelfCount }, (_, i) => -H/2 + T + spacing * (i + 1))
  }, [H, T, shelfCount])

  const midShelfY = shelfYs.length ? (shelfYs[0] + shelfYs.at(-1)) / 2 : 0

  const groupY = H / 2
  const spreadX = ex * 35
  const spreadY = ex * 25
  const spreadZ = ex * 40

  // Doors swing open on Y axis; during explode they close and fly forward + apart
  const doorAngle = doorsOpen && !ex ? -Math.PI / 2.8 : 0
  const doorW     = (W - 2 * T) / 2
  const doorH     = H - T * 2
  const doorT     = T * 0.8
  const doorFwdZ  = ex * 38  // fly forward away from front face
  const doorFwdX  = ex * 12  // spread left / right

  const doorRoughness = (matProps.roughness ?? 0.65) - 0.08
  const doorMetalness = 0.06

  // Assembly state for door panels
  const doorAsm = asmProps('Door panels')
  const doorGhost   = doorAsm.ghost
  const doorCurrent = doorAsm.current

  const doorMat = {
    color:            doorGhost ? '#aaccff' : matProps.color,
    roughness:        doorRoughness,
    metalness:        doorGhost ? 0.05 : doorMetalness,
    map:              doorGhost ? null : matProps.map,
    transparent:      renderMode === 'xray' || dm('Door panels') || doorGhost,
    opacity:          renderMode === 'xray' ? 0.22 : doorGhost ? 0.10 : dm('Door panels') ? 0.15 : 1,
    depthWrite:       renderMode !== 'xray' && !dm('Door panels') && !doorGhost,
    emissive:         doorCurrent ? '#22d3ee' : hl('Door panels') ? '#f59e0b' : '#000000',
    emissiveIntensity: doorCurrent ? 0.75    : hl('Door panels') ? 0.45      : 0,
  }

  return (
    <group position={[0, groupY, 0]}>
      {/* Carcass */}
      <Board position={[-(W/2 - T/2) - spreadX, 0, 0]} args={[T, H, D]} {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} {...asmProps('Side panels')} />
      <Board position={[ (W/2 - T/2) + spreadX, 0, 0]} args={[T, H, D]} {...matProps} highlight={hl('Side panels')} dim={dm('Side panels')} {...asmProps('Side panels')} />
      <Board position={[0,  H/2 - T/2 + spreadY, 0]} args={[W - 2*T, T, D]} {...matProps} highlight={hl('Top panel')} dim={dm('Top panel')} {...asmProps('Top panel')} />
      <Board position={[0, -H/2 + T/2 - spreadY, 0]} args={[W - 2*T, T, D]} {...matProps} highlight={hl('Bottom panel')} dim={dm('Bottom panel')} {...asmProps('Bottom panel')} />

      {/* Shelves */}
      {shelfYs.map((y, i) => {
        const dir = shelfYs.length > 1
          ? (y - midShelfY) / Math.abs(shelfYs.at(-1) - midShelfY || 1)
          : 0
        return (
          <Board
            key={i}
            position={[0, y + dir * spreadY * 0.5, 0]}
            args={[W - 2*T, T, D - 1]}
            {...matProps}
            highlight={hl('Shelves')}
            dim={dm('Shelves')}
            {...asmProps('Shelves')}
          />
        )
      })}

      {/* Back panel */}
      <Board position={[0, 0, -(D/2 - 0.3) - spreadZ]} args={[W, H, 0.6]} {...matProps} roughness={(matProps.roughness ?? 0.65) + 0.12} metalness={0.01} highlight={hl('Back panel')} dim={dm('Back panel')} {...asmProps('Back panel')} />

      {/* Left door — always rendered; flies forward+left during explode */}
      <group position={[-(W/2 - T) - 0.1 - doorFwdX, 0, D/2 + doorFwdZ]}>
        <group rotation={[0, -doorAngle, 0]}>
          <mesh position={[doorW / 2, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[doorW, doorH, doorT]} />
            <meshStandardMaterial {...doorMat} />
          </mesh>
          <mesh position={[doorW * 0.85, 0, doorT / 2 + 0.8]}>
            <cylinderGeometry args={[0.6, 0.6, 4, 12]} />
            <meshStandardMaterial {...doorMat} />
          </mesh>
        </group>
      </group>

      {/* Right door — always rendered; flies forward+right during explode */}
      <group position={[(W/2 - T) + 0.1 + doorFwdX, 0, D/2 + doorFwdZ]}>
        <group rotation={[0, doorAngle, 0]}>
          <mesh position={[-doorW / 2, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[doorW, doorH, doorT]} />
            <meshStandardMaterial {...doorMat} />
          </mesh>
          <mesh position={[-doorW * 0.85, 0, doorT / 2 + 0.8]}>
            <cylinderGeometry args={[0.6, 0.6, 4, 12]} />
            <meshStandardMaterial {...doorMat} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
