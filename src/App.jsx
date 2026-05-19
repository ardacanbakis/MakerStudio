import { useEffect, useState } from 'react'
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
  const drag = { active: false, lastX: 0 }
  const ref = { current: drag }
  return (
    <div
      className="w-1 flex-shrink-0 hover:bg-amber-500/40 active:bg-amber-500/70 cursor-col-resize transition-colors z-10"
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
    />
  )
}

export default function App() {
  useKeyboardShortcuts()
  const { showWelcome, dismiss } = useWelcomeScreen()
  const loadAutosave = useStore((s) => s.loadAutosave)

  const [leftW, setLeftW] = useState(() => {
    const s = localStorage.getItem('ms-left-w')
    return s ? Math.max(MIN_W, Math.min(MAX_W, Number(s))) : 240
  })
  const [rightW, setRightW] = useState(() => {
    const s = localStorage.getItem('ms-right-w')
    return s ? Math.max(MIN_W, Math.min(MAX_W, Number(s))) : 288
  })

  const resizeLeft = (delta) => setLeftW(w => {
    const next = Math.max(MIN_W, Math.min(MAX_W, w + delta))
    localStorage.setItem('ms-left-w', String(next))
    return next
  })
  const resizeRight = (delta) => setRightW(w => {
    const next = Math.max(MIN_W, Math.min(MAX_W, w - delta))
    localStorage.setItem('ms-right-w', String(next))
    return next
  })

  useEffect(() => {
    loadAutosave()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (showWelcome) return <WelcomeScreen onDismiss={dismiss} />

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-studio-bg">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar style={{ width: leftW }} />
        <ResizeHandle onResize={resizeLeft} />
        <Viewport />
        <ResizeHandle onResize={resizeRight} />
        <RightPanel style={{ width: rightW }} />
      </div>
      <StatusBar />
    </div>
  )
}
