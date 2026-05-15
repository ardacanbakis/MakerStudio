import { useStore } from '../store/useStore'

const BOARD_PRESETS = [
  { label: '4×8 ft sheet', w: 122, l: 244 },
  { label: '4×10 ft sheet', w: 122, l: 305 },
  { label: '600mm panel', w: 60, l: 120 },
]

export default function CutPlannerTab() {
  const {
    computeCutList, dimensions,
    boardWidth, boardLength, cutKerf,
    setBoardDimensions, setCutKerf,
  } = useStore()

  const cutList = computeCutList()

  const totalBoardArea = boardWidth * boardLength
  const pieceArea = cutList.reduce((acc, p) => acc + p.w * p.h * p.qty, 0)
  const utilization = Math.min(100, (pieceArea / totalBoardArea) * 100).toFixed(1)
  const boardsNeeded = Math.ceil(pieceArea / (totalBoardArea * 0.8))

  return (
    <div className="flex flex-col gap-5">
      {/* Cut list */}
      <section className="panel-section">
        <p className="label-xs mb-3">Cut List</p>
        <div className="flex flex-col gap-1">
          {cutList.map((p, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-2 px-2.5 py-2 rounded-md bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 truncate">{p.label}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">
                  {p.w.toFixed(1)} × {p.h.toFixed(1)} × {p.thick} cm
                </p>
              </div>
              <span className="value-badge flex-shrink-0">×{p.qty}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Board stock */}
      <section className="panel-section">
        <p className="label-xs mb-3">Board Stock</p>

        <div className="grid grid-cols-1 gap-1 mb-3">
          {BOARD_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setBoardDimensions(p.w, p.l)}
              className={`text-left px-2.5 py-2 rounded-md border text-xs transition-all ${
                boardWidth === p.w && boardLength === p.l
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                  : 'border-white/5 hover:border-white/15 text-gray-400'
              }`}
            >
              {p.label} — {p.w}×{p.l} cm
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Board area</span>
            <span className="font-mono">{(totalBoardArea / 10000).toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Parts area</span>
            <span className="font-mono">{(pieceArea / 10000).toFixed(2)} m²</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Boards needed</span>
            <span className="font-mono text-amber-400">{boardsNeeded}</span>
          </div>
        </div>
      </section>

      {/* Utilization */}
      <section className="panel-section">
        <div className="flex items-center justify-between mb-2">
          <p className="label-xs">Material yield</p>
          <span className={`text-xs font-mono ${Number(utilization) > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {utilization}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${Number(utilization) > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${utilization}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1.5">
          {Number(utilization) > 75 ? 'Good yield' : 'Consider rearranging panels'}
        </p>
      </section>

      {/* Kerf */}
      <section>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-gray-400">Saw kerf</p>
          <span className="value-badge">{cutKerf} cm</span>
        </div>
        <input
          type="range" min={0.1} max={0.8} step={0.05}
          value={cutKerf}
          onChange={(e) => setCutKerf(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-amber bg-gray-800"
        />
      </section>
    </div>
  )
}
