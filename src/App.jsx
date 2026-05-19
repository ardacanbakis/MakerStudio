import { useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Viewport from './components/Viewport'
import RightPanel from './components/RightPanel'
import StatusBar from './components/StatusBar'
import { WelcomeScreen, useWelcomeScreen } from './components/WelcomeScreen'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'
import { useStore } from './store/useStore'

const MIN_W = 160
const MAX_W = 420

function ResizeHandle({ onResize }) {
  const ref = useRef({ active: false, lastX: 0 })
  return (
    <div
      className="w-1 flex-shrink-0 hover:bg-amber-500/50 cursor-col-resize transition-colors z-10 group"
      style={{ background: 'rgba(42,42,42,1)', touchAction: 'none' }}
      onPointerDown={(e) => {
        ref.current.active = true
        ref.current.lastX = e.clientX
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!ref.current.active) return
        const delta = e.clientX - ref.current.lastX
        ref.current.lastX = e.clientX
        onResize(delta)
      }}
      onPointerUp={() => { ref.current.active = false }}
      onPointerCancel={() => { ref.current.active = false }}
    />
  )
}

export default function App() {
  useKeyboardShortcuts()
  const { showWelcome, dismiss } = useWelcomeScreen()
  const { loadAutosave, leftPanelWidth, rightPanelWidth, setLeftPanelWidth, setRightPanelWidth } = useStore()

  const resizeLeft  = (d) => setLeftPanelWidth( Math.max(MIN_W, Math.min(MAX_W, leftPanelWidth  + d)))
  const resizeRight = (d) => setRightPanelWidth(Math.max(MIN_W, Math.min(MAX_W, rightPanelWidth - d)))

  useEffect(() => {
    loadAutosave()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (showWelcome) return <WelcomeScreen onDismiss={dismiss} />

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-studio-bg">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar style={{ width: leftPanelWidth }} />
        <ResizeHandle onResize={resizeLeft} />
        <Viewport />
        <ResizeHandle onResize={resizeRight} />
        <RightPanel style={{ width: rightPanelWidth }} />
      </div>
      <StatusBar />
    </div>
  )
}
