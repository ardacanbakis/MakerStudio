import { useState } from 'react'
import { useStore } from '../store/useStore'
import { fromCm, toCm, UNITS } from '../utils/units'
import BuilderPanel from '../components/BuilderPanel'

const WOOD_SPECIES = [
  { id: 'oak',      label: 'Oak',      color: '#c8a96e' },
  { id: 'pine',     label: 'Pine',     color: '#e8c98a' },
  { id: 'walnut',   label: 'Walnut',   color: '#6b4226' },
  { id: 'maple',    label: 'Maple',    color: '#f5deb3' },
  { id: 'mahogany', label: 'Mahogany', color: '#8b2e1e' },
  { id: 'birch',    label: 'Birch',    color: '#dfc27d' },
  { id: 'cherry',   label: 'Cherry',   color: '#a0522d' },
]

function DimSlider({ label, valueCm, minCm, maxCm, stepCm = 1, units, onChange, onCommit, accentClass }) {
  const displayVal = fromCm(valueCm, units).toFixed(UNITS[units].decimals)
  const unit = UNITS[units].short
  const sliderMin = fromCm(minCm, units)
  const sliderMax = fromCm(maxCm, units)
  const sliderStep = fromCm(stepCm, units)
  const sliderVal = fromCm(valueCm, units)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`font-mono text-xs px-2 py-0.5 rounded ${accentClass || 'value-badge'}`}>
          {displayVal} {unit}
        </span>
      </div>
      <input
        type="range"
        min={sliderMin} max={sliderMax} step={sliderStep} value={sliderVal}
        onChange={(e) => onChange(toCm(Number(e.target.value), units))}
        onMouseUp={onCommit} onTouchEnd={onCommit}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-amber bg-gray-800"
      />
    </div>
  )
}

function Section({ title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="border border-white/6 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">{title}</span>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-mono">{badge}</span>
          )}
        </div>
        <svg
          viewBox="0 0 16 16" fill="currentColor"
          className={`w-3 h-3 text-gray-600 transition-transform ${open ? '' : '-rotate-90'}`}
        >
          <path d="M8 10.5L2 4.5h12z" />
        </svg>
      </button>
      {open && <div className="px-3.5 pb-3.5 pt-1 flex flex-col gap-3">{children}</div>}
    </section>
  )
}

export default function DesignTab() {
  const {
    dimensions, setDimension,
    woodSpecies, setWoodSpecies,
    woodThickness, setWoodThickness,
    shelfCount, setShelfCount,
    plasticParts, setPlasticParts,
    units, setUnits,
    furnitureType,
    pushHistory,
  } = useStore()

  const { width: W, height: H, depth: D } = dimensions
  const volM3 = (W * H * D / 1_000_000).toFixed(3)
  const isCustom = furnitureType === 'custom'

  return (
    <div className="flex flex-col gap-3">

      {/* Units toggle — always visible */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-500 font-semibold tracking-widest uppercase">Units</span>
        <div className="flex items-center bg-black/40 border border-white/8 rounded-lg p-0.5 gap-0.5">
          {['metric', 'imperial'].map((u) => (
            <button
              key={u}
              onClick={() => setUnits(u)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                units === u ? 'bg-amber-500 text-black font-semibold' : 'text-gray-500 hover:text-white'
              }`}
            >
              {u === 'metric' ? 'cm' : 'in'}
            </button>
          ))}
        </div>
      </div>

      {/* Custom freeform builder replaces dimensions + structure */}
      {isCustom && <BuilderPanel />}

      {/* Dimensions (parametric types only) */}
      {!isCustom && (
      <Section title="Dimensions" badge={`${W}×${H}×${D} cm`}>
        <DimSlider
          label="Width" valueCm={W} minCm={30} maxCm={250} units={units}
          onChange={(v) => setDimension('width', v)} onCommit={pushHistory}
          accentClass="text-amber-400 bg-amber-500/10 font-mono text-xs px-2 py-0.5 rounded"
        />
        <DimSlider
          label="Height" valueCm={H} minCm={40} maxCm={260} units={units}
          onChange={(v) => setDimension('height', v)} onCommit={pushHistory}
          accentClass="text-cyan-400 bg-cyan-500/10 font-mono text-xs px-2 py-0.5 rounded"
        />
        <DimSlider
          label="Depth" valueCm={D} minCm={15} maxCm={90} units={units}
          onChange={(v) => setDimension('depth', v)} onCommit={pushHistory}
          accentClass="text-violet-400 bg-violet-500/10 font-mono text-xs px-2 py-0.5 rounded"
        />
        <div className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2 mt-1">
          <span className="text-xs text-gray-600">Bounding vol.</span>
          <span className="font-mono text-xs text-gray-400">{volM3} m³</span>
        </div>
      </Section>
      )}

      {/* Structure (parametric types only) */}
      {!isCustom && (
      <Section title="Structure">
        <DimSlider
          label="Board thickness"
          valueCm={woodThickness} minCm={1.2} maxCm={4} stepCm={0.3} units={units}
          onChange={setWoodThickness} onCommit={pushHistory}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Shelf count</span>
            <span className="value-badge">{shelfCount}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { if (shelfCount > 1) { pushHistory(); setShelfCount(shelfCount - 1) } }}
              disabled={shelfCount <= 1}
              className="w-7 h-7 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-gray-300 hover:bg-white/10 disabled:opacity-30 transition-colors text-sm"
            >−</button>
            <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${((shelfCount - 1) / 7) * 100}%` }} />
            </div>
            <button
              onClick={() => { if (shelfCount < 8) { pushHistory(); setShelfCount(shelfCount + 1) } }}
              disabled={shelfCount >= 8}
              className="w-7 h-7 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-gray-300 hover:bg-white/10 disabled:opacity-30 transition-colors text-sm"
            >+</button>
          </div>
        </div>
      </Section>
      )}

      {/* Wood species */}
      <Section title="Wood Species">
        <div className="grid grid-cols-2 gap-1.5">
          {WOOD_SPECIES.map((s) => {
            const active = woodSpecies === s.id
            return (
              <button
                key={s.id}
                onClick={() => { pushHistory(); setWoodSpecies(s.id) }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs transition-all ${
                  active
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-white/5 hover:border-white/15 text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-black/30" style={{ backgroundColor: s.color }} />
                {s.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            )
          })}
        </div>
      </Section>

      {/* 3D Printed Hardware */}
      <Section title="Hardware">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300 font-medium">3D Printed Parts</p>
            <p className="text-xs text-gray-600 mt-0.5">Brackets, cam locks, shelf pins</p>
          </div>
          <button
            onClick={() => { pushHistory(); setPlasticParts(!plasticParts) }}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${plasticParts ? 'bg-amber-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${plasticParts ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        {plasticParts && (
          <p className="text-xs text-amber-500/70 bg-amber-500/8 border border-amber-500/20 rounded-lg px-2.5 py-2">
            Configure in Print Prep tab
          </p>
        )}
      </Section>

    </div>
  )
}
