import { useStore } from '../store/useStore'

const TICKS = [0, 25, 50, 75, 100]

export default function ExplodePanel() {
  const { explodeAmount, setExplodeAmount, pushHistory } = useStore()
  const pct = Math.round(explodeAmount * 100)

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto select-none">
      <div
        className="flex items-center gap-4 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md"
        style={{ background: 'rgba(0,0,0,0.78)', minWidth: 340 }}
      >
        {/* Label + pct */}
        <div className="flex flex-col items-start shrink-0 w-20">
          <span className="text-xs font-mono tracking-widest text-gray-500 uppercase leading-none">Explode</span>
          <span
            className="text-2xl font-bold font-mono leading-none mt-0.5 tabular-nums"
            style={{ color: pct > 0 ? '#f59e0b' : '#374151' }}
          >
            {pct}<span className="text-sm font-normal text-gray-600">%</span>
          </span>
        </div>

        {/* Slider + ticks */}
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="range"
            min={0} max={1} step={0.005}
            value={explodeAmount}
            onChange={(e) => setExplodeAmount(Number(e.target.value))}
            onMouseUp={pushHistory}
            onTouchEnd={pushHistory}
            className="w-full h-2.5 rounded-full appearance-none cursor-pointer slider-amber bg-gray-800"
            style={{ accentColor: '#f59e0b' }}
          />
          <div className="flex justify-between px-0.5">
            {TICKS.map((v) => (
              <div key={v} className="flex flex-col items-center gap-0.5">
                <div className={`w-px h-1 ${explodeAmount * 100 >= v ? 'bg-amber-500/50' : 'bg-gray-700'}`} />
                <span className="text-xs font-mono text-gray-700">{v > 0 && v < 100 ? '' : `${v}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => { setExplodeAmount(0); pushHistory() }}
          disabled={pct === 0}
          title="Reset explode"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-gray-600 hover:text-white hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
