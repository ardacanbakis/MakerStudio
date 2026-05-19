import { useStore, SIZE_PRESETS, ROOM_SETS } from '../store/useStore'
import { fmt, fromCm, toCm, UNITS } from '../utils/units'

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
  const displayMin = fromCm(minCm, units).toFixed(UNITS[units].decimals)
  const displayMax = fromCm(maxCm, units).toFixed(UNITS[units].decimals)
  const unit = UNITS[units].short

  // Convert slider range to display units for the input
  const sliderMin = fromCm(minCm, units)
  const sliderMax = fromCm(maxCm, units)
  const sliderStep = fromCm(stepCm, units)
  const sliderVal = fromCm(valueCm, units)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`font-mono text-xs px-2 py-0.5 rounded ${accentClass || 'value-badge'}`}>
          {displayVal} {unit}
        </span>
      </div>
      <input
        type="range"
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        value={sliderVal}
        onChange={(e) => onChange(toCm(Number(e.target.value), units))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-amber bg-gray-800"
      />
      <div className="flex justify-between">
        <span className="text-xs text-gray-700 font-mono">{displayMin}{unit}</span>
        <span className="text-xs text-gray-700 font-mono">{displayMax}{unit}</span>
      </div>
    </div>
  )
}

export default function DesignTab() {
  const {
    dimensions, setDimension, setDimensions,
    woodSpecies, setWoodSpecies,
    woodThickness, setWoodThickness,
    shelfCount, setShelfCount,
    plasticParts, setPlasticParts,
    units, setUnits,
    applyPreset, pushHistory,
  } = useStore()

  const { width: W, height: H, depth: D } = dimensions
  const volM3 = (W * H * D / 1_000_000).toFixed(3)

  return (
    <div className="flex flex-col gap-5">
      {/* Units toggle */}
      <div className="flex items-center justify-between">
        <span className="label-xs">Units</span>
        <div className="flex items-center bg-black/40 border border-white/8 rounded-lg p-0.5 gap-0.5">
          {['metric', 'imperial'].map((u) => (
            <button
              key={u}
              onClick={() => setUnits(u)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                units === u ? 'bg-amber-500 text-black font-semibold' : 'text-gray-500 hover:text-white'
              }`}
            >
              {u === 'metric' ? 'cm' : 'in'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick presets */}
      <section className="panel-section">
        <p className="label-xs mb-2.5">Quick Presets</p>
        <div className="grid grid-cols-2 gap-1">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-left px-2 py-1.5 rounded-md border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
            >
              <p className="text-xs text-gray-300 group-hover:text-amber-300 transition-colors">{p.label}</p>
              <p className="text-xs text-gray-600 font-mono mt-0.5">
                {fmt(p.dims.width, units, false)}×{fmt(p.dims.height, units, false)}{UNITS[units].short}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Room sets */}
      <section className="panel-section">
        <p className="label-xs mb-2.5">Room Sets</p>
        <div className="flex flex-col gap-3">
          {Object.entries(ROOM_SETS).map(([setName, pieces]) => (
            <div key={setName}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-600 font-semibold tracking-wide uppercase">{setName}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-2 gap-1">
                {pieces.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className="text-left px-2 py-1.5 rounded-md border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
                  >
                    <p className="text-xs text-gray-300 group-hover:text-violet-300 transition-colors">{p.label}</p>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">
                      {fmt(p.dims.width, units, false)}×{fmt(p.dims.height, units, false)}{UNITS[units].short}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dimensions */}
      <section className="panel-section">
        <p className="label-xs mb-3">Dimensions</p>
        <div className="flex flex-col gap-4">
          <DimSlider
            label="Width"
            valueCm={W} minCm={30} maxCm={250}
            units={units}
            onChange={(v) => setDimension('width', v)}
            onCommit={pushHistory}
            accentClass="text-amber-400 bg-amber-500/10 font-mono text-xs px-2 py-0.5 rounded"
          />
          <DimSlider
            label="Height"
            valueCm={H} minCm={40} maxCm={260}
            units={units}
            onChange={(v) => setDimension('height', v)}
            onCommit={pushHistory}
            accentClass="text-cyan-400 bg-cyan-500/10 font-mono text-xs px-2 py-0.5 rounded"
          />
          <DimSlider
            label="Depth"
            valueCm={D} minCm={15} maxCm={90}
            units={units}
            onChange={(v) => setDimension('depth', v)}
            onCommit={pushHistory}
            accentClass="text-violet-400 bg-violet-500/10 font-mono text-xs px-2 py-0.5 rounded"
          />
        </div>

        <div className="mt-3 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Bounding vol.</span>
          <span className="font-mono text-xs text-gray-300">{volM3} m³</span>
        </div>
      </section>

      {/* Structure */}
      <section className="panel-section">
        <p className="label-xs mb-3">Structure</p>
        <div className="flex flex-col gap-4">
          <DimSlider
            label="Board thickness"
            valueCm={woodThickness} minCm={1.2} maxCm={4} stepCm={0.3}
            units={units}
            onChange={setWoodThickness}
            onCommit={pushHistory}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Shelf count</span>
              <span className="value-badge">{shelfCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (shelfCount > 1) { pushHistory(); setShelfCount(shelfCount - 1) } }}
                disabled={shelfCount <= 1}
                className="w-7 h-7 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >−</button>
              <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${((shelfCount - 1) / 7) * 100}%` }}
                />
              </div>
              <button
                onClick={() => { if (shelfCount < 8) { pushHistory(); setShelfCount(shelfCount + 1) } }}
                disabled={shelfCount >= 8}
                className="w-7 h-7 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >+</button>
            </div>
          </div>
        </div>
      </section>

      {/* Wood species */}
      <section className="panel-section">
        <p className="label-xs mb-3">Wood Species</p>
        <div className="grid grid-cols-2 gap-1.5">
          {WOOD_SPECIES.map((s) => {
            const active = woodSpecies === s.id
            return (
              <button
                key={s.id}
                onClick={() => { pushHistory(); setWoodSpecies(s.id) }}
                className={`flex items-center gap-2 px-2 py-2 rounded-md border text-xs transition-all ${
                  active
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-white/5 hover:border-white/15 text-gray-400 hover:text-gray-200'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-black/30"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Plastic parts */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300 font-medium">3D Printed Hardware</p>
            <p className="text-xs text-gray-600 mt-0.5">Brackets, cam locks, shelf pins</p>
          </div>
          <button
            onClick={() => { pushHistory(); setPlasticParts(!plasticParts) }}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
              plasticParts ? 'bg-amber-500' : 'bg-gray-700'
            }`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              plasticParts ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>
        {plasticParts && (
          <p className="mt-2 text-xs text-amber-500/70 bg-amber-500/8 border border-amber-500/20 rounded-lg px-2.5 py-2">
            Configure in Print Prep tab (4)
          </p>
        )}
      </section>
    </div>
  )
}
