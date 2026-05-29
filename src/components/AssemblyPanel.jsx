import { useStore, ASSEMBLY_ORDERS } from '../store/useStore'

export default function AssemblyPanel() {
  const { assemblyStep, setAssemblyStep, exitAssembly, furnitureType } = useStore()

  if (assemblyStep < 0) return null

  const steps = ASSEMBLY_ORDERS[furnitureType] ?? []
  const total = steps.length
  const current = steps[assemblyStep] ?? ''
  const isFirst = assemblyStep === 0
  const isLast  = assemblyStep === total - 1
  const pct     = total > 1 ? (assemblyStep / (total - 1)) * 100 : 100

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto select-none">
      <div
        className="flex items-center gap-5 px-5 py-3.5 rounded-2xl border border-cyan-500/20 backdrop-blur-md"
        style={{ background: 'rgba(0,10,20,0.88)', minWidth: 380 }}
      >
        {/* Step info */}
        <div className="flex flex-col items-start shrink-0 w-28">
          <span className="text-xs font-mono tracking-widest text-cyan-700 uppercase leading-none">Assembly</span>
          <span className="text-xl font-bold font-mono leading-none mt-1 text-cyan-300 tabular-nums">
            Step {assemblyStep + 1}
            <span className="text-sm font-normal text-cyan-700"> / {total}</span>
          </span>
          <span className="text-xs text-cyan-500 mt-0.5 leading-none truncate max-w-[112px]">{current}</span>
        </div>

        {/* Progress + nav */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-between">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setAssemblyStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < assemblyStep  ? 'bg-cyan-500/60' :
                  i === assemblyStep ? 'bg-cyan-400 scale-125' :
                  'bg-gray-700'
                }`}
                title={steps[i]}
              />
            ))}
          </div>

          {/* Prev / Next buttons */}
          <div className="flex gap-2">
            <button
              disabled={isFirst}
              onClick={() => setAssemblyStep(assemblyStep - 1)}
              className="flex-1 py-1.5 text-xs rounded-lg border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-mono"
            >
              ← Prev
            </button>
            <button
              onClick={isLast ? exitAssembly : () => setAssemblyStep(assemblyStep + 1)}
              className={`flex-1 py-1.5 text-xs rounded-lg border font-mono transition-all ${
                isLast
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                  : 'border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10'
              }`}
            >
              {isLast ? '✓ Done' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Exit button */}
        <button
          onClick={exitAssembly}
          title="Exit assembly mode"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-white/8 text-gray-600 hover:text-white hover:border-white/20 transition-all"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
