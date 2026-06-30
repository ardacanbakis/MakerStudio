import { useMemo, useRef, useState, useEffect } from 'react'
import { TransformControls } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import { getWoodTexture } from '../../utils/woodTexture'
import { resolveMatProps } from '../../utils/woodMaterial'

export default function CustomBuild() {
  const parts          = useStore((s) => s.customParts)
  const selectedId     = useStore((s) => s.selectedPartId)
  const selectPart     = useStore((s) => s.selectPart)
  const updateCustomPart = useStore((s) => s.updateCustomPart)
  const transformMode  = useStore((s) => s.transformMode) || 'translate'
  const woodSpecies    = useStore((s) => s.woodSpecies)
  const surfaceFinish  = useStore((s) => s.surfaceFinish)
  const paintColor     = useStore((s) => s.paintColor)
  const showTexture    = useStore((s) => s.showTexture)
  const renderMode     = useStore((s) => s.renderMode)

  const { renderMode: _rm, ...mat } = useMemo(
    () => resolveMatProps({ woodSpecies, surfaceFinish, paintColor, showTexture, renderMode }, getWoodTexture),
    [woodSpecies, surfaceFinish, paintColor, showTexture, renderMode],
  )

  const refs = useRef(new Map())
  const [target, setTarget] = useState(null)

  // Resolve the TransformControls target whenever selection or part set changes
  useEffect(() => {
    setTarget(selectedId ? refs.current.get(selectedId) ?? null : null)
  }, [selectedId, parts])

  const wire = renderMode === 'wireframe'

  return (
    <group>
      {parts.map((p) => {
        const selected = p.id === selectedId
        return (
          <mesh
            key={p.id}
            ref={(el) => { if (el) refs.current.set(p.id, el); else refs.current.delete(p.id) }}
            position={[p.x, p.y, p.z]}
            castShadow
            receiveShadow
            onClick={(e) => { e.stopPropagation(); selectPart(p.id) }}
          >
            <boxGeometry args={[Math.max(0.2, p.w), Math.max(0.2, p.h), Math.max(0.2, p.d)]} />
            {wire ? (
              <meshBasicMaterial color={selected ? '#22d3ee' : '#f59e0b'} wireframe />
            ) : (
              <meshStandardMaterial
                {...mat}
                emissive={selected ? '#22d3ee' : '#000000'}
                emissiveIntensity={selected ? 0.5 : 0}
              />
            )}
          </mesh>
        )
      })}

      {target && !wire && (
        <TransformControls
          object={target}
          mode={transformMode}
          size={0.7}
          translationSnap={1}
          onMouseUp={() => {
            if (!target) return
            const o = target
            if (transformMode === 'scale') {
              const part = useStore.getState().customParts.find((p) => p.id === selectedId)
              if (part) {
                updateCustomPart(selectedId, {
                  w: +Math.max(0.5, part.w * o.scale.x).toFixed(1),
                  h: +Math.max(0.5, part.h * o.scale.y).toFixed(1),
                  d: +Math.max(0.5, part.d * o.scale.z).toFixed(1),
                })
                o.scale.set(1, 1, 1)
              }
            } else {
              updateCustomPart(selectedId, {
                x: +o.position.x.toFixed(1),
                y: +o.position.y.toFixed(1),
                z: +o.position.z.toFixed(1),
              })
            }
          }}
        />
      )}
    </group>
  )
}
