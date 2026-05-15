import { useStore } from '../store/useStore'

const FILAMENT_TYPES = [
  { id: 'PLA',   label: 'PLA',   temp: '200°C', bed: '60°C',  notes: 'Easy · Rigid · Biodegradable' },
  { id: 'PETG',  label: 'PETG',  temp: '235°C', bed: '85°C',  notes: 'Durable · Slight flex · Food-safe' },
  { id: 'ABS',   label: 'ABS',   temp: '240°C', bed: '110°C', notes: 'Strong · Heat resistant · Warps' },
  { id: 'TPU',   label: 'TPU',   temp: '230°C', bed: '40°C',  notes: 'Flexible · Rubber-like' },
  { id: 'ASA',   label: 'ASA',   temp: '245°C', bed: '100°C', notes: 'UV resistant · Outdoor-rated' },
]

const LAYER_HEIGHTS = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]

const HARDWARE_PARTS = [
  { label: 'Cam lock nuts',       qty: 'Per joint', purpose: 'Knock-down joinery' },
  { label: 'Shelf pin sockets',   qty: '4× per shelf', purpose: 'Adjustable shelves' },
  { label: 'Corner brackets',     qty: '4 pcs', purpose: 'Back panel mounts' },
  { label: 'Cable clips',         qty: '8–12 pcs', purpose: 'Cable management' },
  { label: 'Leveling feet',       qty: '4 pcs', purpose: 'Floor leveling' },
]

function SliderRow({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="value-badge">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer slider-amber bg-gray-800"
      />
    </div>
  )
}

export default function PrintPrepTab() {
  const {
    plasticParts, setPlasticParts,
    filamentType, setFilamentType,
    infillPercent, setInfillPercent,
    layerHeight, setLayerHeight,
    computeFilamentEstimate,
  } = useStore()

  const filament = computeFilamentEstimate()
  const selectedMat = FILAMENT_TYPES.find((f) => f.id === filamentType) ?? FILAMENT_TYPES[0]
  const printTime = plasticParts ? Math.round((filament / 10) * (0.2 / layerHeight)) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Enable toggle */}
      <section className="panel-section">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-200 font-medium">3D Printed Parts</p>
            <p className="text-xs text-gray-500 mt-0.5">Hardware & bracket components</p>
          </div>
          <button
            onClick={() => setPlasticParts(!plasticParts)}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${plasticParts ? 'bg-amber-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${plasticParts ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </section>

      {plasticParts && (
        <>
          {/* Filament type */}
          <section className="panel-section">
            <p className="label-xs mb-3">Filament Material</p>
            <div className="flex flex-col gap-1">
              {FILAMENT_TYPES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilamentType(f.id)}
                  className={`text-left px-2.5 py-2 rounded-md border transition-all ${
                    filamentType === f.id
                      ? 'border-amber-500/40 bg-amber-500/8 text-amber-300'
                      : 'border-white/5 hover:border-white/15 text-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{f.label}</span>
                    <span className="text-xs text-gray-600">{f.temp}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{f.notes}</p>
                </button>
              ))}
            </div>

            {/* Selected material temps */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-white/[0.03] rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-500">Nozzle</p>
                <p className="text-sm font-mono text-white">{selectedMat.temp}</p>
              </div>
              <div className="bg-white/[0.03] rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-500">Bed</p>
                <p className="text-sm font-mono text-white">{selectedMat.bed}</p>
              </div>
            </div>
          </section>

          {/* Print settings */}
          <section className="panel-section">
            <p className="label-xs mb-3">Print Settings</p>
            <div className="flex flex-col gap-4">
              <SliderRow
                label="Infill density"
                value={infillPercent}
                min={10} max={80} step={5}
                unit="%"
                onChange={setInfillPercent}
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Layer height</span>
                  <span className="value-badge">{layerHeight} mm</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {LAYER_HEIGHTS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setLayerHeight(h)}
                      className={`py-1.5 rounded text-xs font-mono transition-all ${
                        layerHeight === h
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Estimates */}
          <section className="panel-section">
            <p className="label-xs mb-2">Print Estimates</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Filament</p>
                <p className="text-lg font-mono text-amber-400">{filament}g</p>
                <p className="text-xs text-gray-600">~{(filament / 1000 * 1.24).toFixed(2)} m</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Print time</p>
                <p className="text-lg font-mono text-blue-400">{printTime}h</p>
                <p className="text-xs text-gray-600">approx.</p>
              </div>
            </div>
          </section>

          {/* Hardware list */}
          <section>
            <p className="label-xs mb-2">Printable Parts</p>
            <div className="flex flex-col gap-1">
              {HARDWARE_PARTS.map((p, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-300">{p.label}</p>
                    <p className="text-xs text-gray-600">{p.qty} · {p.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {!plasticParts && (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-600">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-2h8v2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs text-gray-600 text-center">Enable 3D printed parts above<br />to configure filament settings</p>
        </div>
      )}
    </div>
  )
}
