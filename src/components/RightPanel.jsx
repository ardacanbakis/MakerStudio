import { useStore } from '../store/useStore'
import DesignTab from '../tabs/DesignTab'
import CutPlannerTab from '../tabs/CutPlannerTab'
import MaterialsTab from '../tabs/MaterialsTab'
import PrintPrepTab from '../tabs/PrintPrepTab'

const TAB_COMPONENTS = {
  design:      DesignTab,
  cutplanner:  CutPlannerTab,
  materials:   MaterialsTab,
  printprep:   PrintPrepTab,
}

const TAB_LABELS = {
  design:     'Design',
  cutplanner: 'Cut Planner',
  materials:  'Materials',
  printprep:  'Print Prep',
}

export default function RightPanel() {
  const activeTab = useStore((s) => s.activeTab)
  const ActiveComponent = TAB_COMPONENTS[activeTab] ?? DesignTab

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col bg-studio-panel border-l border-studio-border h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-3.5 border-b border-studio-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">{TAB_LABELS[activeTab]}</h2>
        <span className="label-xs">Properties</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ActiveComponent />
      </div>
    </aside>
  )
}
