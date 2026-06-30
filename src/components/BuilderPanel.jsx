import { useStore } from '../store/useStore'

function NumField({ label, value, onChange, step = 1, min, accent = 'text-gray-300' }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-600">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs font-mono ${accent} focus:border-amber-500/50 focus:outline-none`}
      />
    </label>
  )
}

export default function BuilderPanel() {
  const parts        = useStore((s) => s.customParts)
  const selectedId   = useStore((s) => s.selectedPartId)
  const selectPart   = useStore((s) => s.selectPart)
  const addCustomPart = useStore((s) => s.addCustomPart)
  const updateCustomPart = useStore((s) => s.updateCustomPart)
  const removeCustomPart = useStore((s) => s.removeCustomPart)
  const duplicateCustomPart = useStore((s) => s.duplicateCustomPart)
  const clearCustomParts = useStore((s) => s.clearCustomParts)

  const sel = parts.find((p) => p.id === selectedId)
  const upd = (patch) => updateCustomPart(selectedId, patch)

  return (
    <div className="flex flex-col gap-4">
      {/* Intro */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
        <p className="text-xs text-amber-300 font-medium">Freeform Builder</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Add boards and arrange them into any design. Click a board in the 3D view to select it, then drag the
          gizmo or edit exact sizes below. Cut list, export and build plan all work on your custom parts.
        </p>
      </div>

      {/* Add / clear */}
      <div className="flex gap-1.5">
        <button
          onClick={() => addCustomPart()}
          className="flex-1 py-2 text-xs rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all font-medium flex items-center justify-center gap-1.5"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
          </svg>
          Add Board
        </button>
        <button
          onClick={clearCustomParts}
          disabled={!parts.length}
          className="px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-300 hover:border-red-500/30 disabled:opacity-30 transition-all"
        >
          Clear
        </button>
      </div>

      {/* Parts list */}
      <section>
        <p className="label-xs mb-2">Boards · {parts.length}</p>
        {parts.length === 0 && (
          <p className="text-xs text-gray-700 text-center py-4 border border-dashed border-white/10 rounded-lg">
            No boards yet — add one to start building
          </p>
        )}
        <div className="flex flex-col gap-1">
          {parts.map((p) => {
            const active = p.id === selectedId
            return (
              <div
                key={p.id}
                onClick={() => selectPart(p.id)}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                  active
                    ? 'border-cyan-500/50 bg-cyan-500/10'
                    : 'border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-cyan-400' : 'bg-gray-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${active ? 'text-cyan-200' : 'text-gray-300'}`}>{p.name}</p>
                  <p className="text-xs text-gray-600 font-mono">{p.w}×{p.h}×{p.d}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateCustomPart(p.id) }}
                  title="Duplicate"
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-white transition-all"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path d="M4 2a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2v-1a1 1 0 001-1V2a1 1 0 00-1-1H6a1 1 0 00-1 1H4z"/>
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2-1a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V6a1 1 0 00-1-1H4z"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeCustomPart(p.id) }}
                  title="Delete"
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-red-400 transition-all"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path d="M6.5 1a1 1 0 00-1 1H3a.5.5 0 000 1h10a.5.5 0 000-1h-2.5a1 1 0 00-1-1h-3zM4 4v9a2 2 0 002 2h4a2 2 0 002-2V4H4z"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Selected editor */}
      {sel && (
        <section className="border border-cyan-500/20 rounded-xl p-3 flex flex-col gap-3">
          <input
            value={sel.name}
            onChange={(e) => upd({ name: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-md px-2.5 py-1.5 text-sm text-cyan-200 focus:border-cyan-500/50 focus:outline-none"
          />

          <div>
            <p className="label-xs mb-1.5">Size (cm)</p>
            <div className="grid grid-cols-3 gap-2">
              <NumField label="Width"  value={sel.w} min={0.5} step={0.5} onChange={(v) => upd({ w: v })} accent="text-amber-300" />
              <NumField label="Height" value={sel.h} min={0.5} step={0.5} onChange={(v) => upd({ h: v })} accent="text-cyan-300" />
              <NumField label="Depth"  value={sel.d} min={0.5} step={0.5} onChange={(v) => upd({ d: v })} accent="text-violet-300" />
            </div>
          </div>

          <div>
            <p className="label-xs mb-1.5">Position (cm)</p>
            <div className="grid grid-cols-3 gap-2">
              <NumField label="X" value={sel.x} step={0.5} onChange={(v) => upd({ x: v })} />
              <NumField label="Y" value={sel.y} step={0.5} onChange={(v) => upd({ y: v })} />
              <NumField label="Z" value={sel.z} step={0.5} onChange={(v) => upd({ z: v })} />
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => duplicateCustomPart(sel.id)}
              className="flex-1 py-1.5 text-xs rounded-md bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => removeCustomPart(sel.id)}
              className="flex-1 py-1.5 text-xs rounded-md bg-red-500/10 border border-red-500/25 text-red-300 hover:bg-red-500/20 transition-colors"
            >
              Delete
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
