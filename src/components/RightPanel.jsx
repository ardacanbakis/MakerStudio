import { useStore } from '../store/useStore'
import DesignTab from '../tabs/DesignTab'
import CutPlannerTab from '../tabs/CutPlannerTab'
import MaterialsTab from '../tabs/MaterialsTab'
import PrintPrepTab from '../tabs/PrintPrepTab'

const TABS = [
  {
    id: 'design',
    label: 'Design',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2.5 3A1.5 1.5 0 001 4.5v4A1.5 1.5 0 002.5 10h4A1.5 1.5 0 008 8.5v-4A1.5 1.5 0 006.5 3h-4zM12 3a1 1 0 000 2h4a1 1 0 000-2h-4zM12 7a1 1 0 000 2h4a1 1 0 000-2h-4zM12 11a1 1 0 000 2h4a1 1 0 000-2h-4zM2.5 12A1.5 1.5 0 001 13.5v3A1.5 1.5 0 002.5 18h3A1.5 1.5 0 007 16.5v-3A1.5 1.5 0 005.5 12h-3z" />
      </svg>
    ),
    component: DesignTab,
  },
  {
    id: 'cutplanner',
    label: 'Cut',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
      </svg>
    ),
    component: CutPlannerTab,
  },
  {
    id: 'materials',
    label: 'Material',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.644 12.736 3 10.352 3 7.5a6 6 0 0112 0c0 2.852-1.644 5.236-3.885 7.238-.845.775-1.636 1.33-2.248 1.698a22.05 22.05 0 01-.214.122z" />
      </svg>
    ),
    component: MaterialsTab,
  },
  {
    id: 'printprep',
    label: 'Print',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-2h8v2H6z" clipRule="evenodd" />
      </svg>
    ),
    component: PrintPrepTab,
  },
]

export default function RightPanel({ style }) {
  const activeTab = useStore((s) => s.activeTab)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component ?? DesignTab

  return (
    <aside className="flex-shrink-0 flex flex-col bg-studio-panel border-l border-studio-border h-full overflow-hidden" style={style}>
      {/* Tab bar */}
      <div className="flex items-stretch border-b border-studio-border flex-shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-w-0 transition-colors ${
                isActive
                  ? 'text-amber-400'
                  : 'text-gray-600 hover:text-gray-300 hover:bg-white/3'
              }`}
            >
              {tab.icon}
              <span className="text-xs leading-none truncate max-w-full px-1">{tab.label}</span>
              {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-400" />}
            </button>
          )
        })}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ActiveComponent />
      </div>
    </aside>
  )
}
