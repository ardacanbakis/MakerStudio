import { useStore } from '../store/useStore'

const MIN_W = 160
const MAX_W = 420

const LAYOUT_PRESETS = [
  { id: 'balanced',  label: '⊞',    title: 'Balanced',     left: 240, right: 288 },
  { id: 'wide',      label: '↔',    title: 'Wide Viewport', left: 180, right: 180 },
  { id: 'focusL',   label: '◧',    title: 'Focus Left',   left: 380, right: 200 },
  { id: 'focusR',   label: '◨',    title: 'Focus Right',  left: 200, right: 380 },
]

const RENDER_MODES = [
  { id: 'solid',     label: 'Solid' },
  { id: 'wireframe', label: 'Wire' },
  { id: 'xray',      label: 'X-Ray' },
]

const CAMERA_PRESETS = [
  { id: 'perspective', label: '3/4' },
  { id: 'front',       label: 'Front' },
  { id: 'side',        label: 'Side' },
  { id: 'top',         label: 'Top' },
]

export default function ViewportToolbar() {
  const {
    renderMode, setRenderMode,
    showDimensions, toggleDimensions,
    showGrid, toggleGrid,
    showTexture, toggleTexture,
    cameraPreset, setCameraPreset,
    units, setUnits,
    explodeAmount,
    doorsOpen, toggleDoorsOpen,
    furnitureType,
    _past, _future, undo, redo,
    takeScreenshot,
    triggerExport,
    leftPanelWidth, rightPanelWidth,
    setLeftPanelWidth, setRightPanelWidth,
  } = useStore()

  const applyLayout = ({ left, right }) => {
    setLeftPanelWidth(Math.max(MIN_W, Math.min(MAX_W, left)))
    setRightPanelWidth(Math.max(MIN_W, Math.min(MAX_W, right)))
  }

  const activeLayout = LAYOUT_PRESETS.find(
    (p) => p.left === leftPanelWidth && p.right === rightPanelWidth
  )?.id ?? null

  const canUndo = _past.length > 0
  const canRedo = _future.length > 0

  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2 pointer-events-none">
      {/* ── Row 1: controls ── */}
      <div className="flex items-center flex-wrap gap-2">

      {/* Layout presets */}
      <ToolGroup>
        <span className="text-xs text-gray-700 px-1.5 font-mono select-none">LAYOUT</span>
        {LAYOUT_PRESETS.map((p) => (
          <ToolBtn
            key={p.id}
            active={activeLayout === p.id}
            activeClass="bg-violet-500/25 text-violet-300"
            onClick={() => applyLayout(p)}
            title={p.title}
          >
            {p.label}
          </ToolBtn>
        ))}
      </ToolGroup>

      {/* Render mode */}
      <ToolGroup>
        {RENDER_MODES.map((m) => (
          <ToolBtn key={m.id} active={renderMode === m.id} onClick={() => setRenderMode(m.id)}>
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
        <IconToggle active={showTexture} onClick={toggleTexture} title="Wood texture (T)">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M0 0h16v16H0z" fillOpacity="0" />
            <path d="M2 1a1 1 0 000 2h12a1 1 0 100-2H2zm0 5a1 1 0 000 2h12a1 1 0 100-2H2zm0 5a1 1 0 000 2h12a1 1 0 100-2H2z"/>
          </svg>
        </IconToggle>
      </ToolGroup>

      {/* Undo / Redo */}
      <ToolGroup>
        <ToolBtn active={false} onClick={undo} disabled={!canUndo} title="Undo ⌘Z">↩</ToolBtn>
        <ToolBtn active={false} onClick={redo} disabled={!canRedo} title="Redo ⌘Y">↪</ToolBtn>
      </ToolGroup>

      <div className="flex-1" />

      {/* Cabinet door toggle */}
      {furnitureType === 'cabinet' && explodeAmount === 0 && (
        <ToolGroup>
          <ToolBtn
            active={doorsOpen}
            activeClass="bg-emerald-500/25 text-emerald-300"
            onClick={toggleDoorsOpen}
            title="Toggle doors"
          >
            {doorsOpen ? 'Close' : 'Open'} Doors
          </ToolBtn>
        </ToolGroup>
      )}

      {/* Units */}
      <ToolGroup>
        <button
          onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}
          title="Toggle units (U)"
          className="px-2.5 py-1 text-xs text-gray-400 hover:text-white transition-colors font-mono"
        >
          {units === 'metric' ? 'cm' : 'in'}
        </button>
      </ToolGroup>

      {/* Export group */}
      <div className="pointer-events-auto flex items-center bg-black/70 backdrop-blur border border-white/8 rounded-lg p-0.5 gap-0.5">
        <button
          onClick={takeScreenshot}
          title="Save viewport as PNG"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M10.5 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            <path d="M2 4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.172a2 2 0 01-1.414-.586l-.828-.828A2 2 0 009.172 2H6.828a2 2 0 00-1.414.586l-.828.828A2 2 0 013.172 4H2zm.5 2a.5.5 0 110-1 .5.5 0 010 1zm9 2.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"/>
          </svg>
          PNG
        </button>
        <div className="w-px h-4 bg-white/8" />
        <button
          onClick={() => triggerExport('glb')}
          title="Export as GLB (3D, compatible with Blender, Unity, etc.)"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md text-gray-400 hover:text-emerald-300 hover:bg-emerald-500/8 transition-all"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 7.5h-2.793l1.647-1.646a.5.5 0 00-.708-.708L7.5 7.293V4.5a.5.5 0 00-1 0v2.793L4.854 5.146a.5.5 0 10-.708.708L5.793 7.5H3a.5.5 0 000 1h2.793L4.146 10.146a.5.5 0 00.708.708L6.5 9.207V12a.5.5 0 001 0V9.207l1.646 1.647a.5.5 0 00.708-.708L8.207 8.5H11.5a.5.5 0 000-1z"/>
          </svg>
          GLB
        </button>
        <button
          onClick={() => triggerExport('stl')}
          title="Export as STL (for 3D printing)"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md text-gray-400 hover:text-blue-300 hover:bg-blue-500/8 transition-all"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 7.5h-2.793l1.647-1.646a.5.5 0 00-.708-.708L7.5 7.293V4.5a.5.5 0 00-1 0v2.793L4.854 5.146a.5.5 0 10-.708.708L5.793 7.5H3a.5.5 0 000 1h2.793L4.146 10.146a.5.5 0 00.708.708L6.5 9.207V12a.5.5 0 001 0V9.207l1.646 1.647a.5.5 0 00.708-.708L8.207 8.5H11.5a.5.5 0 000-1z"/>
          </svg>
          STL
        </button>
      </div>

      </div>{/* end row 1 */}
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
      className={`px-2.5 py-1 text-xs rounded-md transition-all disabled:opacity-25 disabled:cursor-not-allowed ${
        active
          ? (activeClass ?? 'bg-amber-500 text-black font-semibold')
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
