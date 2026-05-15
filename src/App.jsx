import Sidebar from './components/Sidebar'
import Viewport from './components/Viewport'
import RightPanel from './components/RightPanel'
import StatusBar from './components/StatusBar'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts'

export default function App() {
  useKeyboardShortcuts()

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
