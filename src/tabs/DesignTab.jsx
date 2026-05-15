import { useStore } from '../store/useStore'

const WOOD_SPECIES = [
  { id: 'oak',       label: 'Oak',       color: '#c8a96e' },
  { id: 'pine',      label: 'Pine',      color: '#e8c98a' },
  { id: 'walnut',    label: 'Walnut',    color: '#6b4226' },
  { id: 'maple',     label: 'Maple',     color: '#f5deb3' },
  { id: 'mahogany',  label: 'Mahogany',  color: '#8b2e1e' },
  { id: 'birch',     label: 'Birch',     color: '#dfc27d' },
  { id: 'cherry',    label: 'Cherry',    color: '#a0522d' },
]

function SliderRow({ label, value, min, max, step = 1, unit, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="value-badge">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-amber bg-gray-800"
      />
      <div className="flex justify-between">
        <span className="text-xs text-gray-700 font-mono">{min}{unit}</span>
        <span className="text-xs text-gray-700 font-mono">{max}{unit}</span>
      </div>
    </div>
  )
}

export default function DesignTab() {
  const {
    dimensions, setDimension,
    woodSpecies, setWoodSpecies,
    woodThickness, setWoodThickness,
    shelfCount, setShelfCount,
    plasticParts, setPlasticParts,
  } = useStore()

  const volume = (
    dimensions.width * dimensions.height * dimensions.depth / 1000000
  ).toFixed(3)

  return (
    <div className="flex flex-col gap-5">
      {/* Dimensions */}
      <section className="panel-section">
        <p className="label-xs mb-3">Dimensions</p>
        <div className="flex flex-col gap-4">
          <SliderRow
            label="Width"
            value={dimensions.width}
            min={30} max={200}
            unit=" cm"
            onChange={(v) => setDimension('width', v)}
          />
          <SliderRow
            label="Height"
            value={dimensions.height}
            min={60} max={240}
            unit=" cm"
            onChange={(v) => setDimension('height', v)}
          />
          <SliderRow
            label="Depth"
            value={dimensions.depth}
            min={20} max={80}
            unit=" cm"
            onChange={(v) => setDimension('depth', v)}
          />
        </div>
        <div className="mt-3 bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">Bounding vol.</span>
          <span className="font-mono text-xs text-gray-300">{volume} m³</span>
        </div>
      </section>

      {/* Structure */}
      <section className="panel-section">
        <p className="label-xs mb-3">Structure</p>
        <div className="flex flex-col gap-4">
          <SliderRow
            label="Board thickness"
            value={woodThickness}
            min={1.2} max={4} step={0.3}
            unit=" cm"
            onChange={setWoodThickness}
          />
          <SliderRow
            label="Shelf count"
            value={shelfCount}
            min={1} max={8}
            unit=""
            onChange={setShelfCount}
          />
        </div>
      </section>

      {/* Wood species */}
      <section className="panel-section">
        <p className="label-xs mb-3">Wood Species</p>
        <div className="grid grid-cols-2 gap-1.5">
          {WOOD_SPECIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setWoodSpecies(s.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs transition-all ${
                woodSpecies === s.id
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-white/5 hover:border-white/15 text-gray-400'
              }`}
            >
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Plastic parts */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300">Plastic hardware</p>
            <p className="text-xs text-gray-600 mt-0.5">Brackets, cam locks, pins</p>
          </div>
          <button
            onClick={() => setPlasticParts(!plasticParts)}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${plasticParts ? 'bg-amber-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${plasticParts ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </section>
    </div>
  )
}
