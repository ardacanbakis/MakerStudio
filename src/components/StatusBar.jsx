import { useStore } from '../store/useStore'
import { fmt } from '../utils/units'

export default function StatusBar() {
  const { dimensions, shelfCount, woodSpecies, units, computeWeight, _past, _future, undo, redo } = useStore()
  const { width: W, height: H, depth: D } = dimensions

  const totalParts = 2 + 2 + shelfCount + 1 // sides + top/bot + shelves + back
  const approxTris = totalParts * 12 // 2 tris per face × 6 faces
  const weight = computeWeight()

  const canUndo = _past.length > 0
  const canRedo = _future.length > 0

  return (
    <footer className="h-7 flex-shrink-0 flex items-center px-3 gap-4 bg-black/60 border-t border-studio-border text-xs font-mono select-none">
      {/* Undo / redo buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className={`px-1.5 py-0.5 rounded text-xs transition-colors ${canUndo ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-700 cursor-not-allowed'}`}
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (⌘Y)"
          className={`px-1.5 py-0.5 rounded text-xs transition-colors ${canRedo ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-700 cursor-not-allowed'}`}
        >
          ↪
        </button>
      </div>

      <Divider />

      {/* Dimensions */}
      <StatItem label="W" value={fmt(W, units)} color="text-amber-400" />
      <StatItem label="H" value={fmt(H, units)} color="text-cyan-400" />
      <StatItem label="D" value={fmt(D, units)} color="text-violet-400" />

      <Divider />

      <StatItem label="Parts" value={totalParts} />
      <StatItem label="~Tris" value={approxTris.toLocaleString()} />
      <StatItem label="Est. weight" value={`${weight} kg`} />
      <StatItem label="Species" value={woodSpecies} />

      <div className="flex-1" />

      {/* Shortcuts hint */}
      <span className="text-gray-700">G grid · W wire · U units · ⌘Z undo</span>
    </footer>
  )
}

function StatItem({ label, value, color = 'text-gray-300' }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-gray-600">{label}</span>
      <span className={color}>{value}</span>
    </span>
  )
}

function Divider() {
  return <span className="text-gray-800 select-none">│</span>
}
