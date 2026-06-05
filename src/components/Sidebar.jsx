import { useState } from 'react'
import { useStore, FURNITURE_TYPES, SIZE_PRESETS, ROOM_SETS } from '../store/useStore'
import { fmt, UNITS } from '../utils/units'
import { parseProjectJSON, openProjectFile } from '../utils/project'
import { useWelcomeScreen } from './WelcomeScreen'

export default function Sidebar({ style }) {
  const {
    furnitureType, setFurnitureType,
    showGrid, toggleGrid,
    showShadows, toggleShadows,
    saveProject, loadProjectData,
    applyPreset, units,
  } = useStore()
  const { show } = useWelcomeScreen()

  const [presetsOpen, setPresetsOpen] = useState(true)
  const [roomsOpen, setRoomsOpen]     = useState(false)
  const [showAllPresets, setShowAll]  = useState(false)

  const ftLabel = FURNITURE_TYPES.find((f) => f.id === furnitureType)?.label ?? furnitureType
  const filteredPresets = showAllPresets
    ? SIZE_PRESETS
    : SIZE_PRESETS.filter((p) => p.type === furnitureType)

  // Apply + auto-collapse the section it came from
  const pickPreset = (p) => { applyPreset(p); setPresetsOpen(false) }
  const pickRoomPiece = (p) => { applyPreset(p); setRoomsOpen(false) }

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
        title="Back to welcome screen"
        className="flex items-center gap-2.5 px-4 py-4 border-b border-studio-border hover:bg-white/5 transition-colors w-full text-left group flex-shrink-0"
      >
        <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-400 transition-colors">
          <span className="text-black font-bold text-xs leading-none">M</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none group-hover:text-amber-300 transition-colors">MakerStudio</p>
          <p className="text-xs text-gray-500 leading-none mt-0.5">Workshop Suite</p>
        </div>
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 ml-auto text-gray-700 group-hover:text-amber-400 transition-colors">
          <path fillRule="evenodd" d="M8 1a.5.5 0 01.5.5V6h4.5a.5.5 0 010 1H8.5v4.5a.5.5 0 01-1 0V7H3a.5.5 0 010-1h4.5V1.5A.5.5 0 018 1z" transform="rotate(45 8 8)"/>
        </svg>
      </button>

      {/* Scrollable: furniture type + presets + room sets */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Furniture type */}
        <div>
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

        {/* Presets (collapsible, auto-collapse on select) */}
        <SidebarSection
          title="Presets"
          badge={ftLabel}
          badgeClass="bg-amber-500/15 text-amber-400"
          open={presetsOpen}
          onToggle={() => setPresetsOpen((v) => !v)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">
              {filteredPresets.length} {showAllPresets ? 'total' : `for ${ftLabel}`}
            </span>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-gray-600 hover:text-amber-400 transition-colors"
            >
              {showAllPresets ? 'Current type' : 'Show all'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {filteredPresets.map((p) => (
              <PresetButton key={p.label} preset={p} units={units} onClick={() => pickPreset(p)} accent="amber" />
            ))}
            {filteredPresets.length === 0 && (
              <p className="col-span-2 text-xs text-gray-700 text-center py-3">No presets for this type</p>
            )}
          </div>
        </SidebarSection>

        {/* Room Sets (collapsible, auto-collapse on select) */}
        <SidebarSection
          title="Room Sets"
          open={roomsOpen}
          onToggle={() => setRoomsOpen((v) => !v)}
        >
          <div className="flex flex-col gap-3.5">
            {Object.entries(ROOM_SETS).map(([setName, pieces]) => (
              <div key={setName}>
                <p className="text-xs text-gray-600 font-semibold tracking-wide uppercase mb-2">{setName}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {pieces.map((p) => (
                    <PresetButton key={p.label} preset={p} units={units} onClick={() => pickRoomPiece(p)} accent="violet" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SidebarSection>
      </div>

      {/* Viewport toggles */}
      <div className="px-3 pt-3 border-t border-studio-border flex-shrink-0">
        <p className="label-xs px-1 mb-1.5">Viewport</p>
        <ViewportToggle label="Grid" active={showGrid} onClick={toggleGrid} />
        <ViewportToggle label="Shadows" active={showShadows} onClick={toggleShadows} />
      </div>

      {/* Save / Load */}
      <div className="p-3 border-t border-studio-border flex-shrink-0">
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
      <div className="px-3 py-2 border-t border-studio-border bg-black/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-600 font-mono">GPU · WebGL 2</span>
        </div>
      </div>
    </aside>
  )
}

function SidebarSection({ title, badge, badgeClass, open, onToggle, children }) {
  return (
    <section className="border border-white/6 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">{title}</span>
          {badge && (
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${badgeClass || 'bg-white/10 text-gray-400'}`}>{badge}</span>
          )}
        </div>
        <svg
          viewBox="0 0 16 16" fill="currentColor"
          className={`w-3 h-3 text-gray-600 transition-transform ${open ? '' : '-rotate-90'}`}
        >
          <path d="M8 10.5L2 4.5h12z" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </section>
  )
}

function PresetButton({ preset, units, onClick, accent }) {
  const hover = accent === 'violet'
    ? 'hover:border-violet-500/30 hover:bg-violet-500/5 group-hover:text-violet-300'
    : 'hover:border-amber-500/30 hover:bg-amber-500/5 group-hover:text-amber-300'
  const textHover = accent === 'violet' ? 'group-hover:text-violet-300' : 'group-hover:text-amber-300'
  return (
    <button
      onClick={onClick}
      className={`text-left px-2.5 py-2 rounded-lg border border-white/5 transition-all group ${hover}`}
    >
      <p className={`text-xs text-gray-300 transition-colors leading-none ${textHover}`}>{preset.label}</p>
      <p className="text-xs text-gray-600 font-mono mt-1">
        {fmt(preset.dims.width, units, false)}×{fmt(preset.dims.height, units, false)}{UNITS[units].short}
      </p>
    </button>
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
