// Shared Board (box mesh) component used by all furniture scene components.
// Supports cut-planner hover (highlight/dim) and assembly mode (ghost/current).
export function Board({ position, rotation, args, color, roughness, metalness = 0.04, map, renderMode, highlight, dim, ghost, current }) {
  if (renderMode === 'wireframe') {
    return (
      <mesh position={position} rotation={rotation} receiveShadow castShadow>
        <boxGeometry args={args} />
        <meshBasicMaterial color="#f59e0b" wireframe />
      </mesh>
    )
  }
  const xray        = renderMode === 'xray'
  const transparent = xray || dim || ghost
  const opacity     = xray ? 0.22 : ghost ? 0.10 : dim ? 0.15 : 1

  // Assembly "current" (cyan) overrides cut-planner "highlight" (amber)
  const emissiveColor = current ? '#22d3ee' : highlight ? '#f59e0b' : '#000000'
  const emissiveInt   = current ? 0.75      : highlight ? 0.45      : 0

  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={ghost ? '#aaccff' : color}
        roughness={roughness}
        metalness={ghost ? 0.05 : metalness}
        map={ghost ? null : map}
        transparent={transparent}
        opacity={opacity}
        depthWrite={!xray && !dim && !ghost}
        emissive={emissiveColor}
        emissiveIntensity={emissiveInt}
      />
    </mesh>
  )
}
