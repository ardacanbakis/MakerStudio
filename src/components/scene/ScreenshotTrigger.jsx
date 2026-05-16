import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useStore } from '../../store/useStore'

export default function ScreenshotTrigger() {
  const { gl, scene, camera } = useThree()
  const pending       = useStore((s) => s._screenshotPending)
  const clearPending  = useStore((s) => s._clearScreenshot)

  useEffect(() => {
    if (!pending) return
    // Force a clean render at full resolution
    gl.render(scene, camera)
    gl.domElement.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `makerstudio-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      clearPending()
    }, 'image/png')
  }, [pending, gl, scene, camera, clearPending])

  return null
}
