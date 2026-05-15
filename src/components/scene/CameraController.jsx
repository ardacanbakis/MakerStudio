import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useStore } from '../../store/useStore'

// Camera positions and targets in Three.js units (= cm)
function buildPresets(H) {
  const cx = 0, cy = H / 2, cz = 0
  return {
    perspective: { pos: new Vector3(120, H * 0.9, 120), tgt: new Vector3(cx, cy, cz) },
    front:       { pos: new Vector3(0,   H * 0.5, 220), tgt: new Vector3(cx, cy, cz) },
    side:        { pos: new Vector3(220, H * 0.5, 0),   tgt: new Vector3(cx, cy, cz) },
    top:         { pos: new Vector3(0,   H * 2.5, 0.1), tgt: new Vector3(cx, 0,  cz) },
  }
}

export default function CameraController() {
  const { camera, controls } = useThree()
  const cameraPreset = useStore((s) => s.cameraPreset)
  const dimensions   = useStore((s) => s.dimensions)

  const animating = useRef(false)
  const destPos   = useRef(new Vector3())
  const destTgt   = useRef(new Vector3())

  useEffect(() => {
    const presets = buildPresets(dimensions.height)
    const p = presets[cameraPreset]
    if (!p) return
    destPos.current.copy(p.pos)
    destTgt.current.copy(p.tgt)
    animating.current = true
  }, [cameraPreset, dimensions.height])

  useFrame(() => {
    if (!animating.current) return

    camera.position.lerp(destPos.current, 0.09)
    if (controls?.target) {
      controls.target.lerp(destTgt.current, 0.09)
      controls.update()
    }

    if (camera.position.distanceTo(destPos.current) < 0.8) {
      camera.position.copy(destPos.current)
      if (controls?.target) {
        controls.target.copy(destTgt.current)
        controls.update()
      }
      animating.current = false
    }
  })

  return null
}
