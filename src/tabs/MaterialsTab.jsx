import { useStore } from '../store/useStore'
import { fmt } from '../utils/units'

const WOOD_DATA = {
  oak:      { density: 720, pricePerM3: 1800, janka: 1290, grain: 'Open',   durable: 5, work: 4, finish: 5 },
  pine:     { density: 530, pricePerM3: 600,  janka: 870,  grain: 'Closed', durable: 2, work: 5, finish: 3 },
  walnut:   { density: 640, pricePerM3: 3200, janka: 1010, grain: 'Open',   durable: 4, work: 4, finish: 5 },
  maple:    { density: 705, pricePerM3: 2100, janka: 1450, grain: 'Closed', durable: 5, work: 3, finish: 4 },
  mahogany: { density: 545, pricePerM3: 2800, janka: 900,  grain: 'Open',   durable: 4, work: 5, finish: 5 },
  birch:    { density: 670, pricePerM3: 900,  janka: 1260, grain: 'Closed', durable: 3, work: 4, finish: 4 },
  cherry:   { density: 580, pricePerM3: 2400, janka: 950,  grain: 'Closed', durable: 4, work: 5, finish: 5 },
}

const WOOD_COLORS = {
  oak: '#c8a96e', pine: '#e8c98a', walnut: '#6b4226',
  maple: '#f5deb3', mahogany: '#8b2e1e', birch: '#dfc27d', cherry: '#a0522d',
}

const FINISHES = [
  { id: 'raw',     label: 'Raw / Unfinished',    note: 'No protection · natural grain',   sheen: 0.05 },
  { id: 'oil',     label: 'Danish Oil',           note: 'Penetrating · enhances grain',    sheen: 0.30 },
  { id: 'wax',     label: 'Hard Wax Oil',         note: 'Natural look · repairable',       sheen: 0.38 },
  { id: 'stain',   label: 'Stain + Varnish',      note: 'Color + durable protection',      sheen: 0.55 },
  { id: 'lacquer', label: 'Clear Lacquer',         note: 'Hard coat · high sheen',          sheen: 0.90 },
  { id: 'paint',   label: 'Painted / Chalk Paint', note: 'Opaque color · satin sheen',     sheen: 0.72 },
]

function RatingDots({ value, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-amber-400' : 'bg-gray-700'}`} />
      ))}
    </div>
  )
}

function PropRow({ label, value, extra }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {extra}
        <span className="text-xs font-mono text-gray-300">{value}</span>
      </div>
    </div>
  )
}

function SheenBar({ value }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${value * 100}%`,
            background: `linear-gradient(90deg, #78716c, #e2e8f0)`,
          }}
        />
      </div>
    </div>
  )
}

export default function MaterialsTab() {
  const {
    woodSpecies, dimensions, woodThickness, shelfCount,
    computeWeight, units, surfaceFinish, setSurfaceFinish,
    paintColor, setPaintColor, pushHistory,
  } = useStore()
  const data  = WOOD_DATA[woodSpecies] ?? WOOD_DATA.oak
  const color = WOOD_COLORS[woodSpecies] ?? '#c8a96e'

  const { width: W, height: H, depth: D } = dimensions
  const T = woodThickness / 100
  const Wm = W / 100, Hm = H / 100, Dm = D / 100
  const boardVolM3 =
    2 * (T * Hm * Dm) +
    2 * ((Wm - 2 * T) * T * Dm) +
    shelfCount * ((Wm - 2 * T) * T * Dm) +
    Wm * Hm * 0.006

  const weightKg   = computeWeight()
  const matCost    = Math.round(boardVolM3 * data.pricePerM3)
  const hwCost     = Math.round(matCost * 0.15)
  const finishCost = Math.round(matCost * 0.08)
  const total      = matCost + hwCost + finishCost

  return (
    <div className="flex flex-col gap-5">

      {/* Species card */}
      <section className="panel-section">
        <p className="label-xs mb-2.5">Selected Species</p>
        <div
          className="relative overflow-hidden rounded-xl border border-white/8 p-3 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${color}18, transparent)` }}
        >
          <div className="w-14 h-14 rounded-xl flex-shrink-0 border border-black/20 shadow-inner" style={{ backgroundColor: color }} />
          <div>
            <p className="text-base font-semibold capitalize text-white">{woodSpecies}</p>
            <p className="text-xs text-gray-400 mt-0.5">{data.density} kg/m³</p>
            <p className="text-xs text-gray-500">{data.grain} grain · Janka {data.janka} lbf</p>
          </div>
        </div>
      </section>

      {/* Working properties */}
      <section className="panel-section">
        <p className="label-xs mb-2">Working Properties</p>
        <PropRow label="Durability"     extra={<RatingDots value={data.durable} />} />
        <PropRow label="Workability"    extra={<RatingDots value={data.work} />} />
        <PropRow label="Finish quality" extra={<RatingDots value={data.finish} />} />
        <PropRow label="Grain type"     value={data.grain} />
        <PropRow label="Density"        value={`${data.density} kg/m³`} />
        <PropRow label="Est. weight"    value={`${weightKg} kg`} />
      </section>

      {/* Surface finish */}
      <section className="panel-section">
        <p className="label-xs mb-2.5">Surface Finish</p>
        <div className="flex flex-col gap-1.5">
          {FINISHES.map((f) => {
            const active = surfaceFinish === f.id
            return (
              <button
                key={f.id}
                onClick={() => { pushHistory(); setSurfaceFinish(f.id) }}
                className={`text-left px-2.5 py-2 rounded-lg border transition-all ${
                  active
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-medium ${active ? 'text-amber-300' : 'text-gray-300'}`}>{f.label}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <SheenBar value={f.sheen} />
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{f.note}</p>
              </button>
            )
          })}
        </div>

        {/* Paint color picker — only when finish is 'paint' */}
        {surfaceFinish === 'paint' && (
          <div className="mt-3 flex items-center gap-3 px-2.5 py-2.5 rounded-lg border border-white/8 bg-white/[0.03]">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium">Paint Color</span>
              <span className="text-xs text-gray-600">Click swatch to change</span>
            </div>
            <label className="ml-auto cursor-pointer flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-inner"
                style={{ backgroundColor: paintColor }}
              />
              <input
                type="color"
                value={paintColor}
                onChange={(e) => setPaintColor(e.target.value)}
                onBlur={pushHistory}
                className="sr-only"
              />
            </label>
          </div>
        )}
      </section>

      {/* Material volume */}
      <section className="panel-section">
        <p className="label-xs mb-2">Material Volume</p>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Board thickness</span>
            <span className="font-mono text-gray-300">{fmt(woodThickness, units)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Lumber volume</span>
            <span className="font-mono text-gray-300">{boardVolM3.toFixed(4)} m³</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Surface area</span>
            <span className="font-mono text-gray-300">
              {((2 * W * H + 2 * W * D + 2 * H * D) / 10000).toFixed(2)} m²
            </span>
          </div>
        </div>
      </section>

      {/* Cost estimate */}
      <section className="panel-section">
        <p className="label-xs mb-2">Cost Estimate</p>
        <div className="space-y-1.5">
          <CostRow label="Lumber"   value={matCost}    note="retail rate" />
          <CostRow label="Hardware" value={hwCost}     note="hinges, locks" />
          <CostRow label="Finish"   value={finishCost} note="oil, stain, etc." />
          <div className="flex items-center justify-between pt-2 border-t border-white/8 mt-2">
            <span className="text-xs font-semibold text-gray-200">Total estimate</span>
            <span className="text-sm font-mono text-amber-400 font-bold">${total}</span>
          </div>
        </div>
        <p className="text-xs text-gray-700 mt-2">Uses retail market rates. Verify with local suppliers.</p>
      </section>

    </div>
  )
}

function CostRow({ label, value, note }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-xs text-gray-400">{label}</span>
        {note && <span className="text-xs text-gray-700 ml-1">({note})</span>}
      </div>
      <span className="text-xs font-mono text-gray-300">${value}</span>
    </div>
  )
}
