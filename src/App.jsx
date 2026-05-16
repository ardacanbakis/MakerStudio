import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Viewport from './components/Viewport'
import RightPanel from './components/RightPanel'
import StatusBar from './components/StatusBar'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import { useStore } from './store/useStore'

export default function App() {
  useKeyboardShortcuts()
  const loadAutosave = useStore((s) => s.loadAutosave)

  // Restore last session from localStorage on first mount
  useEffect(() => {
    loadAutosave()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-studio-bg">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Viewport />
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  )
}
