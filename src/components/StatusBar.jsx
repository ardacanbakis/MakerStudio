import { useStore } from '../store/useStore'
import { fmt } from '../utils/units'

export default function StatusBar() {
  const {
    dimensions, shelfCount, woodSpecies, units,
    computeWeight, _past, _future, undo, redo,
    furnitureType, explodeAmount, renderMode,
  } = useStore()
  const { width: W, height: H, depth: D } = dimensions

  const totalParts = 2 + 2 + shelfCount + 1
  const approxTris = totalParts * 12
  const weight = computeWeight()
  const canUndo = _past.length > 0
  const canRedo = _future.length > 0

  return (
    <footer className="h-7 flex-shrink-0 flex items-center px-3 gap-3 bg-black/60 border-t border-studio-border text-xs font-mono select-none overflow-hidden">
      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <UndoBtn active={canUndo} onClick={undo} title="Undo ⌘Z">↩</UndoBtn>
        <UndoBtn active={canRedo} onClick={redo} title="Redo ⌘Y">↪</UndoBtn>
      </div>

      <Sep />

      {/* Active model */}
      <span className="text-amber-500/80 capitalize">{furnitureType}</span>

      <Sep />

      {/* Dimensions */}
      <StatItem label="W" value={fmt(W, units)} color="text-amber-400" />
      <StatItem label="H" value={fmt(H, units)} color="text-cyan-400" />
      <StatItem label="D" value={fmt(D, units)} color="text-violet-400" />

      <Sep />

      <StatItem label="~kg" value={weight} />
      <StatItem label="Parts" value={totalParts} />
      <StatItem label="Tris" value={approxTris} />

      <Sep />

      <StatItem label="Mode" value={renderMode} />

      {explodeAmount > 0 && (
        <>
          <Sep />
          <span className="text-emerald-400">Explode {Math.round(explodeAmount * 100)}%</span>
        </>
      )}

      <div className="flex-1" />

      {/* Keyboard hints */}
      <span className="text-gray-800 hidden lg:block">
        G grid · T texture · X explode · W wire · ⌘Z undo · ⌘S save · ⌘P screenshot
      </span>
    </footer>
  )
}

function StatItem({ label, value, color = 'text-gray-400' }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-gray-700">{label}</span>
      <span className={color}>{value}</span>
    </span>
  )
}

function UndoBtn({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={!active}
      title={title}
      className={`w-6 h-5 flex items-center justify-center rounded text-xs transition-colors ${
        active ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-800 cursor-not-allowed'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="text-gray-800 select-none">│</span>
}
