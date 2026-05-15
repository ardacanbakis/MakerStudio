import { useStore } from '../store/useStore'

const WOOD_DATA = {
  oak:      { density: 720, pricePerM3: 1800, hardness: 'Hard',    grain: 'Open',   durability: 'High' },
  pine:     { density: 530, pricePerM3: 600,  hardness: 'Soft',    grain: 'Closed', durability: 'Medium' },
  walnut:   { density: 640, pricePerM3: 3200, hardness: 'Hard',    grain: 'Open',   durability: 'High' },
  maple:    { density: 705, pricePerM3: 2100, hardness: 'Hard',    grain: 'Closed', durability: 'High' },
  mahogany: { density: 545, pricePerM3: 2800, hardness: 'Medium',  grain: 'Open',   durability: 'High' },
  birch:    { density: 670, pricePerM3: 900,  hardness: 'Hard',    grain: 'Closed', durability: 'Medium' },
  cherry:   { density: 580, pricePerM3: 2400, hardness: 'Medium',  grain: 'Closed', durability: 'High' },
}

const WOOD_COLORS = {
  oak:      '#c8a96e', pine: '#e8c98a', walnut: '#6b4226',
  maple:    '#f5deb3', mahogany: '#8b2e1e', birch: '#dfc27d', cherry: '#a0522d',
}

function PropRow({ label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-mono ${accent ? 'text-amber-400' : 'text-gray-300'}`}>{value}</span>
    </div>
  )
}

export default function MaterialsTab() {
  const { woodSpecies, dimensions, woodThickness } = useStore()
  const data = WOOD_DATA[woodSpecies] ?? WOOD_DATA.oak
  const color = WOOD_COLORS[woodSpecies] ?? '#c8a96e'

  // Volume in m³
  const boardVolume = (() => {
    const { width: W, height: H, depth: D } = dimensions
    const T = woodThickness / 100
    const sides = 2 * (T * (H / 100) * (D / 100))
    const topBot = 2 * ((W / 100 - 2 * T) * T * (D / 100))
    const back = (W / 100) * (H / 100) * 0.006
    return sides + topBot + back
  })()

  const weightKg = (boardVolume * data.density).toFixed(1)
  const materialCost = (boardVolume * data.pricePerM3).toFixed(0)
  const hardwareEst = Math.round(Number(materialCost) * 0.15)
  const totalEst = Number(materialCost) + hardwareEst

  const FINISH_OPTIONS = [
    { id: 'raw', label: 'Raw / Unfinished' },
    { id: 'oil', label: 'Danish Oil' },
    { id: 'lacquer', label: 'Clear Lacquer' },
    { id: 'stain', label: 'Wood Stain' },
    { id: 'paint', label: 'Painted' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Species card */}
      <section className="panel-section">
        <p className="label-xs mb-3">Selected Species</p>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
          <div
            className="w-12 h-12 rounded-lg flex-shrink-0 shadow-inner"
            style={{ backgroundColor: color }}
          />
          <div>
            <p className="text-sm font-semibold capitalize text-white">{woodSpecies}</p>
            <p className="text-xs text-gray-500">{data.density} kg/m³ · {data.grain} grain</p>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section className="panel-section">
        <p className="label-xs mb-2">Properties</p>
        <PropRow label="Janka hardness" value={data.hardness} />
        <PropRow label="Grain type" value={data.grain} />
        <PropRow label="Durability" value={data.durability} />
        <PropRow label="Density" value={`${data.density} kg/m³`} />
        <PropRow label="Est. weight" value={`${weightKg} kg`} accent />
      </section>

      {/* Cost estimate */}
      <section className="panel-section">
        <p className="label-xs mb-2">Cost Estimate</p>
        <PropRow label="Lumber" value={`$${materialCost}`} />
        <PropRow label="Hardware" value={`~$${hardwareEst}`} />
        <PropRow label="Total" value={`~$${totalEst}`} accent />
        <p className="text-xs text-gray-700 mt-2">
          Estimates based on retail market rates. Verify locally.
        </p>
      </section>

      {/* Finish */}
      <section>
        <p className="label-xs mb-2">Surface Finish</p>
        <div className="flex flex-col gap-1">
          {FINISH_OPTIONS.map((f) => (
            <button
              key={f.id}
              className="text-left px-2.5 py-2 rounded-md border border-white/5 hover:border-white/15 text-xs text-gray-400 hover:text-gray-200 transition-all"
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
