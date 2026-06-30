import { useStore } from '../store/useStore'

export default function BuilderHint() {
  const parts        = useStore((s) => s.customParts)
  const selectedId   = useStore((s) => s.selectedPartId)
  const transformMode = useStore((s) => s.transformMode)
  const setTransformMode = useStore((s) => s.setTransformMode)
  const addCustomPart = useStore((s) => s.addCustomPart)

  const selected = parts.find((p) => p.id === selectedId)

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto select-none">
      <div
        className="flex items-center gap-4 px-4 py-2.5 rounded-2xl border border-amber-500/20 backdrop-blur-md"
        style={{ background: 'rgba(20,14,0,0.85)' }}
      >
        <div className="flex flex-col items-start shrink-0">
          <span className="text-xs font-mono tracking-widest text-amber-700 uppercase leading-none">Custom Build</span>
          <span className="text-xs text-amber-300 mt-0.5 leading-none">
            {selected ? selected.name : `${parts.length} board${parts.length === 1 ? '' : 's'} · click one to edit`}
          </span>
        </div>

        {/* Gizmo mode */}
        <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 gap-0.5">
          {['translate', 'scale'].map((m) => (
            <button
              key={m}
              onClick={() => setTransformMode(m)}
              disabled={!selected}
              className={`px-2.5 py-1 text-xs rounded-md transition-all disabled:opacity-30 ${
                transformMode === m ? 'bg-amber-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'translate' ? 'Move' : 'Resize'}
            </button>
          ))}
        </div>

        {/* Add board */}
        <button
          onClick={() => addCustomPart()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all font-medium"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
          </svg>
          Add Board
        </button>
      </div>
    </div>
  )
}
