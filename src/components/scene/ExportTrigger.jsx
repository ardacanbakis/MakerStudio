import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from '../../store/useStore'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ExportTrigger() {
  const { scene } = useThree()
  const pending      = useStore((s) => s._exportPending)
  const clearExport  = useStore((s) => s._clearExport)
  const furnitureType = useStore((s) => s.furnitureType)

  useEffect(() => {
    if (!pending) return

    const stamp = Date.now()
    const name  = `makerstudio-${furnitureType}-${stamp}`

    if (pending === 'gltf') {
      const exporter = new GLTFExporter()
      exporter.parse(
        scene,
        (result) => {
          const blob = new Blob([JSON.stringify(result)], { type: 'application/json' })
          download(blob, `${name}.gltf`)
          clearExport()
        },
        (err) => { console.error('GLTF export error:', err); clearExport() },
        { binary: false, onlyVisible: true },
      )
    } else if (pending === 'glb') {
      const exporter = new GLTFExporter()
      exporter.parse(
        scene,
        (result) => {
          const blob = new Blob([result], { type: 'application/octet-stream' })
          download(blob, `${name}.glb`)
          clearExport()
        },
        (err) => { console.error('GLB export error:', err); clearExport() },
        { binary: true, onlyVisible: true },
      )
    } else if (pending === 'stl') {
      const exporter = new STLExporter()
      const stlString = exporter.parse(scene, { binary: false })
      const blob = new Blob([stlString], { type: 'model/stl' })
      download(blob, `${name}.stl`)
      clearExport()
    }
  }, [pending, scene, furnitureType, clearExport])

  return null
}
