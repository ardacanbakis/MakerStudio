import Sidebar from './components/Sidebar'
import Viewport from './components/Viewport'
import RightPanel from './components/RightPanel'

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-studio-bg">
      <Sidebar />
      <Viewport />
      <RightPanel />
    </div>
  )
}
