import { useStore } from '../store/useStore'

const RENDER_MODES = [
  { id: 'solid',     label: 'Solid', key: 'Q' },
  { id: 'wireframe', label: 'Wire',  key: 'W' },
  { id: 'xray',      label: 'X-Ray', key: 'E' },
]

const CAMERA_PRESETS = [
  { id: 'perspective', label: '3/4',   key: 'F' },
  { id: 'front',       label: 'Front', key: '' },
  { id: 'side',        label: 'Side',  key: '' },
  { id: 'top',         label: 'Top',   key: '' },
]

export default function ViewportToolbar() {
  const {
    renderMode, setRenderMode,
    showDimensions, toggleDimensions,
    showGrid, toggleGrid,
    cameraPreset, setCameraPreset,
    units, setUnits,
    _past, _future, undo, redo,
  } = useStore()

  const canUndo = _past.length > 0
  const canRedo = _future.length > 0

  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
      {/* Render mode */}
      <ToolGroup>
        {RENDER_MODES.map((m) => (
          <ToolBtn
            key={m.id}
            active={renderMode === m.id}
            onClick={() => setRenderMode(m.id)}
            title={`${m.label} (${m.key})`}
          >
            {m.label}
          </ToolBtn>
        ))}
      </ToolGroup>

      {/* Camera presets */}
      <ToolGroup>
        <span className="text-xs text-gray-700 px-1.5 font-mono select-none">CAM</span>
        {CAMERA_PRESETS.map((p) => (
          <ToolBtn
            key={p.id}
            active={cameraPreset === p.id}
            activeClass="bg-blue-500/25 text-blue-300"
            onClick={() => setCameraPreset(p.id)}
            title={p.key ? `${p.label} (${p.key})` : p.label}
          >
            {p.label}
          </ToolBtn>
        ))}
      </ToolGroup>

      {/* Viewport toggles */}
      <ToolGroup>
        <IconToggle active={showDimensions} onClick={toggleDimensions} title="Dimensions (D)">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M0 4.5A.5.5 0 01.5 4h15a.5.5 0 010 1H.5a.5.5 0 01-.5-.5zm0 7A.5.5 0 01.5 11h15a.5.5 0 010 1H.5a.5.5 0 01-.5-.5zM3 8a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9A.5.5 0 013 8z"/>
          </svg>
        </IconToggle>
        <IconToggle active={showGrid} onClick={toggleGrid} title="Grid (G)">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M1 2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V2zM1 7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM1 12a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2zm5 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"/>
          </svg>
        </IconToggle>
      </ToolGroup>

      {/* Undo/Redo */}
      <ToolGroup>
        <ToolBtn
          active={false}
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
        >
          ↩
        </ToolBtn>
        <ToolBtn
          active={false}
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘Y)"
        >
          ↪
        </ToolBtn>
      </ToolGroup>

      <div className="flex-1" />

      {/* Units pill */}
      <ToolGroup>
        <button
          onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
          title="Toggle units (U)"
          className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {units === 'metric' ? 'cm' : 'in'}
        </button>
      </ToolGroup>

      {/* Label */}
      <div className="pointer-events-none bg-black/50 backdrop-blur border border-white/5 rounded px-2 py-1">
        <span className="text-xs font-mono text-gray-600">Perspective · WebGL2</span>
      </div>
    </div>
  )
}

function ToolGroup({ children }) {
  return (
    <div className="pointer-events-auto flex items-center bg-black/70 backdrop-blur border border-white/8 rounded-lg p-0.5 gap-0.5">
      {children}
    </div>
  )
}

function ToolBtn({ children, active, activeClass, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2.5 py-1 text-xs rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? (activeClass || 'bg-amber-500 text-black font-semibold')
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function IconToggle({ children, active, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${
        active ? 'text-amber-400 bg-amber-500/15' : 'text-gray-600 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}
