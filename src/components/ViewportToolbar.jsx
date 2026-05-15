import { useStore } from '../store/useStore'

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
    cameraPreset, setCameraPreset,
  } = useStore()

  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
      {/* Render mode */}
      <div className="flex items-center bg-black/70 backdrop-blur border border-white/10 rounded-lg p-0.5 pointer-events-auto gap-0.5">
        {RENDER_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setRenderMode(m.id)}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              renderMode === m.id
                ? 'bg-amber-500 text-black font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Camera presets */}
      <div className="flex items-center bg-black/70 backdrop-blur border border-white/10 rounded-lg p-0.5 pointer-events-auto gap-0.5">
        <span className="text-xs text-gray-600 px-2 font-mono">CAM</span>
        {CAMERA_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setCameraPreset(p.id)}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
              cameraPreset === p.id
                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Dimension toggle */}
      <button
        onClick={toggleDimensions}
        className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border backdrop-blur transition-all ${
          showDimensions
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            : 'bg-black/70 border-white/10 text-gray-500 hover:text-gray-300'
        }`}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
          <path d="M1.5 3a.5.5 0 000 1h13a.5.5 0 000-1h-13zM1 7.5A.5.5 0 011.5 7h13a.5.5 0 010 1h-13A.5.5 0 011 7.5zM1.5 11a.5.5 0 000 1h13a.5.5 0 000-1h-13z" />
        </svg>
        Dims
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Viewport label */}
      <div className="pointer-events-none bg-black/50 backdrop-blur border border-white/5 rounded px-2 py-1">
        <span className="text-xs font-mono text-gray-600">Perspective · WebGL 2</span>
      </div>
    </div>
  )
}
