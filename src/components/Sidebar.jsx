import { useStore } from '../store/useStore'

const TABS = [
  {
    id: 'design',
    label: 'Design',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2.5 3A1.5 1.5 0 001 4.5v4A1.5 1.5 0 002.5 10h4A1.5 1.5 0 008 8.5v-4A1.5 1.5 0 006.5 3h-4zM12 3a1 1 0 000 2h4a1 1 0 000-2h-4zM12 7a1 1 0 000 2h4a1 1 0 000-2h-4zM12 11a1 1 0 000 2h4a1 1 0 000-2h-4zM2.5 12A1.5 1.5 0 001 13.5v3A1.5 1.5 0 002.5 18h3A1.5 1.5 0 007 16.5v-3A1.5 1.5 0 005.5 12h-3z" />
      </svg>
    ),
    description: 'Parametric dimensions',
  },
  {
    id: 'cutplanner',
    label: 'Cut Planner',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </svg>
    ),
    description: 'Board layout & cuts',
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.644 12.736 3 10.352 3 7.5a6 6 0 0112 0c0 2.852-1.644 5.236-3.885 7.238-.845.775-1.636 1.33-2.248 1.698a22.05 22.05 0 01-.214.122z" />
      </svg>
    ),
    description: 'Wood species & cost',
  },
  {
    id: 'printprep',
    label: 'Print Prep',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-2h8v2H6z" clipRule="evenodd" />
      </svg>
    ),
    description: '3D print settings',
  },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, showGrid, toggleGrid, showShadows, toggleShadows } = useStore()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-studio-panel border-r border-studio-border h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-studio-border">
        <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-bold text-xs leading-none">M</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">MakerStudio</p>
          <p className="text-xs text-gray-500 leading-none mt-0.5">Workshop Suite</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        <p className="label-xs px-2 mb-2">Tools</p>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${isActive ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              <span className={isActive ? 'text-amber-400' : 'text-gray-500'}>{tab.icon}</span>
              <span className="flex-1 text-left">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Viewport toggles */}
      <div className="p-3 border-t border-studio-border">
        <p className="label-xs px-1 mb-2">Viewport</p>
        <div className="flex flex-col gap-1">
          <ViewportToggle label="Grid" active={showGrid} onClick={toggleGrid} />
          <ViewportToggle label="Shadows" active={showShadows} onClick={toggleShadows} />
        </div>
      </div>

      {/* Status */}
      <div className="px-3 py-2 border-t border-studio-border bg-black/20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-500 font-mono">GPU accelerated</span>
        </div>
      </div>
    </aside>
  )
}

function ViewportToggle({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
    >
      <span className="text-xs text-gray-400">{label}</span>
      <div className={`w-7 h-4 rounded-full transition-colors flex items-center px-0.5 ${active ? 'bg-amber-500' : 'bg-gray-700'}`}>
        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-3' : 'translate-x-0'}`} />
      </div>
    </button>
  )
}
