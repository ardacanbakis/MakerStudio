import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function useKeyboardShortcuts() {
  const store = useStore()

  useEffect(() => {
    function onKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const meta = e.metaKey || e.ctrlKey

      // Undo / Redo
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); return }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); store.redo(); return }

      // Screenshot
      if (meta && e.key === 's') { e.preventDefault(); store.saveProject(); return }
      if (meta && e.key === 'p') { e.preventDefault(); store.takeScreenshot(); return }

      // Tab switching
      if (!meta) {
        if (e.key === '1') { store.setActiveTab('design');     return }
        if (e.key === '2') { store.setActiveTab('cutplanner'); return }
        if (e.key === '3') { store.setActiveTab('materials');  return }
        if (e.key === '4') { store.setActiveTab('printprep');  return }
      }

      // Viewport toggles
      if (e.key === 'g') { store.toggleGrid();       return }
      if (e.key === 'd') { store.toggleDimensions(); return }
      if (e.key === 's' && !meta) { store.toggleShadows(); return }
      if (e.key === 't') { store.toggleTexture();    return }

      // Render modes
      if (e.key === 'q') { store.setRenderMode('solid');     return }
      if (e.key === 'w') { store.setRenderMode('wireframe'); return }
      if (e.key === 'e') { store.setRenderMode('xray');      return }

      // Camera presets
      if (e.key === 'F') { store.setCameraPreset('perspective'); return }

      // Explode view
      if (e.key === 'x') {
        const current = store.explodeAmount
        store.setExplodeAmount(current > 0 ? 0 : 1)
        return
      }

      // Cabinet doors
      if (e.key === 'o' && store.furnitureType === 'cabinet') {
        store.toggleDoorsOpen()
        return
      }

      // Furniture type
      if (e.key === 'f' && !e.shiftKey) { store.setFurnitureType('shelf');   return }
      if (e.key === 'h')               { store.setFurnitureType('desk');    return }
      if (e.key === 'c' && !meta)      { store.setFurnitureType('cabinet'); return }

      // Unit toggle
      if (e.key === 'u') {
        store.setUnits(store.units === 'metric' ? 'imperial' : 'metric')
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [store])
}
