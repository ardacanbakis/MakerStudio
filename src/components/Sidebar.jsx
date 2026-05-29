import { useRef } from 'react'
import { useStore, FURNITURE_TYPES } from '../store/useStore'
import { parseProjectJSON, openProjectFile } from '../utils/project'
import { useWelcomeScreen } from './WelcomeScreen'

const TABS = [
  {
    id: 'design',
    label: 'Design',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2.5 3A1.5 1.5 0 001 4.5v4A1.5 1.5 0 002.5 10h4A1.5 1.5 0 008 8.5v-4A1.5 1.5 0 006.5 3h-4zM12 3a1 1 0 000 2h4a1 1 0 000-2h-4zM12 7a1 1 0 000 2h4a1 1 0 000-2h-4zM12 11a1 1 0 000 2h4a1 1 0 000-2h-4zM2.5 12A1.5 1.5 0 001 13.5v3A1.5 1.5 0 002.5 18h3A1.5 1.5 0 007 16.5v-3A1.5 1.5 0 005.5 12h-3z" />
      </svg>
    ),
  },
  {
    id: 'cutplanner',
    label: 'Cut Planner',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.644 12.736 3 10.352 3 7.5a6 6 0 0112 0c0 2.852-1.644 5.236-3.885 7.238-.845.775-1.636 1.33-2.248 1.698a22.05 22.05 0 01-.214.122z" />
      </svg>
    ),
  },
  {
    id: 'printprep',
    label: 'Print Prep',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-2h8v2H6z" clipRule="evenodd" />
      </svg>
    ),
  },
]

export default function Sidebar({ style }) {
  const {
    activeTab, setActiveTab,
    furnitureType, setFurnitureType,
    showGrid, toggleGrid,
    showShadows, toggleShadows,
    saveProject, loadProjectData,
  } = useStore()
  const { show } = useWelcomeScreen()

  const handleLoad = async () => {
    try {
      const json = await openProjectFile()
      const data = parseProjectJSON(json)
      loadProjectData(data)
    } catch (err) {
      console.warn('Load failed:', err.message)
    }
  }

  return (
    <aside className="flex-shrink-0 flex flex-col bg-studio-panel border-r border-studio-border h-full overflow-hidden" style={style}>
      {/* Logo — click to return to welcome screen */}
      <button
        onClick={show}
        className="flex items-center gap-2.5 px-4 py-4 border-b border-studio-border hover:bg-white/3 transition-colors w-full text-left group"
      >
        <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-400 transition-colors">
          <span className="text-black font-bold text-xs leading-none">M</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none group-hover:text-amber-300 transition-colors">MakerStudio</p>
          <p className="text-xs text-gray-500 leading-none mt-0.5">Workshop Suite</p>
        </div>
      </button>

      {/* Furniture type */}
      <div className="p-3 border-b border-studio-border">
        <p className="label-xs mb-2">Furniture Type</p>
        <div className="grid grid-cols-2 gap-1">
          {FURNITURE_TYPES.map((ft) => {
            const active = furnitureType === ft.id
            return (
              <button
                key={ft.id}
                onClick={() => setFurnitureType(ft.id)}
                title={ft.label}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all border ${
                  active
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <FurnitureIcon id={ft.icon} active={active} />
                <span className="truncate">{ft.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        <p className="label-xs px-2 mb-2">Properties</p>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${isActive ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              <span className={isActive ? 'text-amber-400' : 'text-gray-600'}>{tab.icon}</span>
              <span className="flex-1 text-left text-sm">{tab.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Viewport toggles */}
      <div className="px-3 pt-3 border-t border-studio-border">
        <p className="label-xs px-1 mb-1.5">Viewport</p>
        <ViewportToggle label="Grid" active={showGrid} onClick={toggleGrid} />
        <ViewportToggle label="Shadows" active={showShadows} onClick={toggleShadows} />
      </div>

      {/* Save / Load */}
      <div className="p-3 border-t border-studio-border">
        <p className="label-xs mb-2">Project</p>
        <div className="flex gap-1.5">
          <button
            onClick={saveProject}
            className="flex-1 py-1.5 text-xs rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-colors font-medium"
          >
            Save JSON
          </button>
          <button
            onClick={handleLoad}
            className="flex-1 py-1.5 text-xs rounded-md bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            Load
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="px-3 py-2 border-t border-studio-border bg-black/20">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-600 font-mono">GPU · WebGL 2</span>
        </div>
      </div>
    </aside>
  )
}

const FURNITURE_ICONS = {
  shelf:    <path d="M2 2h12v1H2zm0 3h12v1H2zm0 3h12v1H2zm0 3h12v1H2zm0 3h12v1H2zm-1-12v13h1V2zm13 0v13h-1V2z"/>,
  desk:     <path d="M1 3a1 1 0 011-1h12a1 1 0 011 1v1H1V3zm0 3h14v1H1V6zm0 2v5h4V8H1zm5 0v5h4V8H6zm5 0v5h3V8h-3z"/>,
  cabinet:  <path d="M2 1a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1H2zm0 1h5v12H2V2zm6 0h5v12H8V2zM5 7a.5.5 0 110-1 .5.5 0 010 1zm6 0a.5.5 0 110-1 .5.5 0 010 1z"/>,
  table:    <path d="M1 4h14v2H1V4zm1 2h1v7H2V6zm10 0h1v7h-1V6zm-8 6h10v1H4v-1z"/>,
  tvstand:  <path d="M1 5h14v1H1V5zm0 2h3v5H1V7zm4 0h6v5H5V7zm7 0h3v5h-3V7zm-10 5h14v1H2v-1zM5 3l3-2 3 2H5z"/>,
  bed:      <path d="M1 10V5a1 1 0 011-1h12a1 1 0 011 1v5H1zm0 1h14v2H1v-2zM2 5v5h3V5H2zm4 0v5h4V5H6zm5 0v5h3V5h-3z"/>,
  wall:     <path d="M1 6h14v3H1V6zm2-4h1v4H3V2zm8 0h1v4h-1V2zm-3 0h1v4H8V2zM3 9h1v5H3V9zm8 0h1v5h-1V9z"/>,
}

function FurnitureIcon({ id, active }) {
  const paths = FURNITURE_ICONS[id]
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-amber-400' : 'text-gray-600'}`}>
      {paths}
    </svg>
  )
}

function ViewportToggle({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
    >
      <span className="text-xs text-gray-500">{label}</span>
      <div className={`w-7 h-4 rounded-full transition-colors flex items-center px-0.5 ${active ? 'bg-amber-500' : 'bg-gray-700'}`}>
        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-3' : ''}`} />
      </div>
    </button>
  )
}
