import { Text, Line } from '@react-three/drei'
import { useStore } from '../../store/useStore'

function DimArrow({ start, end, label, color = '#f59e0b', axis = 'x' }) {
  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={1.2}
        dashed={false}
      />
      <Text
        position={[
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2,
        ]}
        fontSize={4}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.4}
        outlineColor="#000000"
        renderOrder={999}
        depthTest={false}
      >
        {label}
      </Text>
    </group>
  )
}

export default function DimensionLabels() {
  const { dimensions } = useStore()
  const { width: W, height: H, depth: D } = dimensions
  const pad = 8

  return (
    <group>
      {/* Width — bottom, along X */}
      <DimArrow
        start={[-W / 2, -2, D / 2 + pad]}
        end={[W / 2, -2, D / 2 + pad]}
        label={`${W} cm`}
        color="#f59e0b"
      />

      {/* Height — right side, along Y */}
      <DimArrow
        start={[W / 2 + pad, 0, 0]}
        end={[W / 2 + pad, H, 0]}
        label={`${H} cm`}
        color="#22d3ee"
      />

      {/* Depth — bottom right, along Z */}
      <DimArrow
        start={[W / 2 + pad / 2, -2, -D / 2]}
        end={[W / 2 + pad / 2, -2, D / 2]}
        label={`${D} cm`}
        color="#a78bfa"
      />
    </group>
  )
}
