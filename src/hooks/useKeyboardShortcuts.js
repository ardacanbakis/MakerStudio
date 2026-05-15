import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function useKeyboardShortcuts() {
  const store = useStore()

  useEffect(() => {
    function onKeyDown(e) {
      // Ignore when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const meta = e.metaKey || e.ctrlKey

      // Undo / Redo
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); return }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); store.redo(); return }

      // Tab switching
      if (e.key === '1') { store.setActiveTab('design');     return }
      if (e.key === '2') { store.setActiveTab('cutplanner'); return }
      if (e.key === '3') { store.setActiveTab('materials');  return }
      if (e.key === '4') { store.setActiveTab('printprep');  return }

      // Viewport toggles
      if (e.key === 'g') { store.toggleGrid();       return }
      if (e.key === 'd') { store.toggleDimensions(); return }
      if (e.key === 's') { store.toggleShadows();    return }

      // Render modes
      if (e.key === 'q') { store.setRenderMode('solid');     return }
      if (e.key === 'w') { store.setRenderMode('wireframe'); return }
      if (e.key === 'e') { store.setRenderMode('xray');      return }

      // Camera presets
      if (e.key === 'F') { store.setCameraPreset('perspective'); return }
      if (meta && e.key === '1') { e.preventDefault(); store.setCameraPreset('front'); return }
      if (meta && e.key === '2') { e.preventDefault(); store.setCameraPreset('side'); return }
      if (meta && e.key === '3') { e.preventDefault(); store.setCameraPreset('top'); return }

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
