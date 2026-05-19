import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'

import { packCutList, computeYield } from '../utils/binPack'
import { downloadCSV, buildCutListCSV, copyTextToClipboard, cutListToText } from '../utils/export'
import { fmt } from '../utils/units'

const BOARD_PRESETS = [
  { label: '4×8 ft',    w: 122,  l: 244 },
  { label: '4×10 ft',   w: 122,  l: 305 },
  { label: '600mm',     w: 60,   l: 120 },
  { label: '5×10 ft',   w: 152,  l: 305 },
]

const PANEL_WIDTH_PX = 232 // px available in right panel for SVG

function CutLayoutSVG({ boards, boardW, boardL, kerf }) {
  const scale = PANEL_WIDTH_PX / boardW
  const boardH_px = boardL * scale
  const [hovered, setHovered] = useState(null)
  const setHoveredPart = useStore((s) => s.setHoveredPart)

  if (!boards.length) return null

  return (
    <div className="flex flex-col gap-2">
      {boards.map((board, bi) => (
        <div key={bi} className="rounded-lg overflow-hidden border border-white/8">
          <div className="px-2 py-1 bg-white/[0.03] flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">Board {bi + 1}</span>
            <span className="text-xs text-gray-600">{boardW}×{boardL} cm</span>
          </div>
          <svg
            width={PANEL_WIDTH_PX}
            height={Math.min(boardH_px, 300)}
            viewBox={`0 0 ${PANEL_WIDTH_PX} ${Math.min(boardH_px, 300)}`}
            className="block bg-stone-900"
          >
            {/* Board background */}
            <rect x={0} y={0} width={PANEL_WIDTH_PX} height={Math.min(boardH_px, 300)} fill="#1c1209" />

            {/* Cut pieces */}
            {board.placed.map((p, pi) => {
              const key = `${bi}-${pi}`
              const x = p.x * scale
              const y = p.y * scale
              const pw = p.w * scale
              const ph = p.h * scale
              const isHovered = hovered === key
              return (
                <g key={key}>
                  <rect
                    x={x} y={y}
                    width={pw - kerf * scale}
                    height={ph - kerf * scale}
                    fill={p.color}
                    fillOpacity={isHovered ? 0.95 : 0.75}
                    stroke={isHovered ? '#ffffff' : 'rgba(0,0,0,0.4)'}
                    strokeWidth={isHovered ? 1.5 : 0.5}
                    onMouseEnter={() => { setHovered(key); setHoveredPart(p.label) }}
                    onMouseLeave={() => { setHovered(null); setHoveredPart(null) }}
                    className="cursor-pointer transition-all"
                    rx={1}
                  />
                  {pw > 28 && ph > 12 && (
                    <text
                      x={x + pw / 2}
                      y={y + ph / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={Math.max(6, Math.min(9, ph * 0.28))}
                      fill="rgba(255,255,255,0.85)"
                      className="pointer-events-none select-none font-mono"
                    >
                      {p.label.replace(' panels', '').replace(' panel', '')}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      ))}
    </div>
  )
}

function CopyButton({ text, children }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    copyTextToClipboard(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-white/10 text-gray-400 hover:text-white hover:border-white/25 transition-all"
    >
      {copied ? '✓ Copied' : children}
    </button>
  )
}

export default function CutPlannerTab() {
  const store = useStore()
  const { computeCutList, boardWidth, boardLength, cutKerf, setBoardDimensions, setCutKerf, pushHistory, units } = store

  const cutList = computeCutList()

  const boards = useMemo(
    () => packCutList(
      cutList.filter((p) => p.thick >= 1), // exclude thin back panel from layout
      boardWidth, boardLength, cutKerf
    ),
    [cutList, boardWidth, boardLength, cutKerf]
  )

  const yieldPct = computeYield(boards, boardWidth, boardLength).toFixed(1)
  const boardsNeeded = boards.length
  const backPanel = cutList.find((p) => p.label === 'Back panel')

  const handleExportCSV = () => {
    const rows = buildCutListCSV(cutList, store)
    downloadCSV(rows, 'makerstudio-cutlist.csv')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Cut list table */}
      <section className="panel-section">
        <div className="flex items-center justify-between mb-2.5">
          <p className="label-xs">Cut List</p>
          <div className="flex items-center gap-1">
            <CopyButton text={cutListToText(cutList)}>
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M10.854 7.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7.5 9.793l2.646-2.647a.5.5 0 01.708 0z"/>
                <path d="M4 1.5H3a2 2 0 00-2 2V14a2 2 0 002 2h10a2 2 0 002-2V3.5a2 2 0 00-2-2h-1v1h1a1 1 0 011 1V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1h1v-1z"/>
                <path d="M9.5 1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3z"/>
              </svg>
              Copy
            </CopyButton>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-all"
            >
              CSV ↓
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {cutList.map((p, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-2 px-2.5 py-2 rounded-md bg-white/[0.03] border border-white/5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 truncate">{p.label}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">
                  {fmt(p.w, units, false)} × {fmt(p.h, units, false)} × {fmt(p.thick, units)}
                </p>
              </div>
              <span className="value-badge flex-shrink-0">×{p.qty}</span>
            </div>
          ))}
        </div>

        {backPanel && (
          <p className="mt-2 text-xs text-gray-700 bg-white/[0.02] rounded px-2 py-1.5">
            Back panel uses 6 mm stock — cut separately
          </p>
        )}
      </section>

      {/* Board stock */}
      <section className="panel-section">
        <p className="label-xs mb-2.5">Sheet Stock</p>
        <div className="grid grid-cols-2 gap-1 mb-3">
          {BOARD_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { pushHistory(); setBoardDimensions(p.w, p.l) }}
              className={`text-left px-2 py-1.5 rounded-md border text-xs transition-all ${
                boardWidth === p.w && boardLength === p.l
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                  : 'border-white/5 hover:border-white/15 text-gray-400'
              }`}
            >
              <p className="font-medium">{p.label}</p>
              <p className="text-gray-600 font-mono">{p.w}×{p.l} cm</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <StatBox label="Boards" value={boardsNeeded} accent="text-amber-400" />
          <StatBox label="Yield" value={`${yieldPct}%`} accent={Number(yieldPct) > 72 ? 'text-emerald-400' : 'text-amber-400'} />
          <StatBox label="Waste" value={`${(100 - Number(yieldPct)).toFixed(1)}%`} accent="text-gray-400" />
        </div>
      </section>

      {/* Kerf */}
      <section className="panel-section">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-gray-400">Saw kerf</p>
          <span className="value-badge">{cutKerf} cm</span>
        </div>
        <input
          type="range" min={0.1} max={0.8} step={0.05}
          value={cutKerf}
          onChange={(e) => setCutKerf(Number(e.target.value))}
          onMouseUp={pushHistory}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-amber bg-gray-800"
        />
      </section>

      {/* SVG Layout */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <p className="label-xs">Board Layout</p>
          <span className="text-xs text-gray-600 font-mono">{boardWidth}×{boardLength} cm</span>
        </div>
        <CutLayoutSVG
          boards={boards}
          boardW={boardWidth}
          boardL={boardLength}
          kerf={cutKerf}
        />
      </section>
    </div>
  )
}

function StatBox({ label, value, accent }) {
  return (
    <div className="bg-white/[0.03] rounded-lg px-2 py-2 border border-white/5">
      <p className="text-xs text-gray-600 mb-0.5">{label}</p>
      <p className={`text-sm font-mono font-semibold ${accent}`}>{value}</p>
    </div>
  )
}
