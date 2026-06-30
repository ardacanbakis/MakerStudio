import { useStore, ASSEMBLY_ORDERS, FURNITURE_TYPES } from '../store/useStore'
import { fmt, UNITS } from './units'

const FINISH_LABELS = {
  raw: 'Raw / Unfinished', oil: 'Danish Oil', wax: 'Hard Wax Oil',
  stain: 'Stain + Varnish', lacquer: 'Clear Lacquer', paint: 'Painted',
}

const WOOD_PRICE = {
  oak: 1800, pine: 600, walnut: 3200, maple: 2100, mahogany: 2800, birch: 900, cherry: 2400,
}

const HARDWARE_PARTS = [
  ['Cam lock nuts',     'Per joint',     'Knock-down joinery'],
  ['Shelf pin sockets', '4× per shelf',  'Adjustable shelves'],
  ['Corner brackets',   '4 pcs',         'Back panel mounts'],
  ['Cable clips',       '8–12 pcs',      'Cable management'],
  ['Leveling feet',     '4 pcs',         'Floor leveling'],
]

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))

export function buildPlanHTML(state) {
  const s = state ?? useStore.getState()
  const {
    dimensions, woodSpecies, woodThickness, shelfCount, units,
    furnitureType, surfaceFinish, plasticParts, filamentType,
    infillPercent, layerHeight,
  } = s
  const { width: W, height: H, depth: D } = dimensions

  const cutList   = s.computeCutList()
  const weight    = s.computeWeight()
  const ftLabel   = FURNITURE_TYPES.find((f) => f.id === furnitureType)?.label ?? furnitureType
  const finish    = FINISH_LABELS[surfaceFinish] ?? surfaceFinish
  const steps     = ASSEMBLY_ORDERS[furnitureType] ?? []
  const u         = UNITS[units].short

  // Cost (mirrors MaterialsTab)
  const T = woodThickness / 100, Wm = W / 100, Hm = H / 100, Dm = D / 100
  const boardVolM3 =
    2 * (T * Hm * Dm) + 2 * ((Wm - 2 * T) * T * Dm) +
    shelfCount * ((Wm - 2 * T) * T * Dm) + Wm * Hm * 0.006
  const matCost    = Math.round(boardVolM3 * (WOOD_PRICE[woodSpecies] ?? 1500))
  const hwCost     = Math.round(matCost * 0.15)
  const finishCost = Math.round(matCost * 0.08)
  const total      = matCost + hwCost + finishCost

  const totalParts = cutList.reduce((sum, p) => sum + p.qty, 0)

  // qty lookup for assembly steps
  const qtyOf = (label) => {
    const m = cutList.find((p) => p.label === label)
    return m ? m.qty : null
  }

  const cutRows = cutList.map((p) => `
    <tr>
      <td>${esc(p.label)}</td>
      <td class="num">${p.qty}</td>
      <td class="num">${fmt(p.w, units, false)}</td>
      <td class="num">${fmt(p.h, units, false)}</td>
      <td class="num">${fmt(p.thick, units, false)}</td>
    </tr>`).join('')

  const stepRows = steps.map((label, i) => {
    const q = qtyOf(label)
    return `
    <li>
      <span class="step-n">${i + 1}</span>
      <span class="step-body"><strong>${esc(label)}</strong>${q ? ` <span class="muted">— ${q} ${q > 1 ? 'pieces' : 'piece'}</span>` : ''}</span>
    </li>`
  }).join('')

  const hardwareSection = plasticParts ? `
    <section>
      <h2>3D-Printed Hardware</h2>
      <table>
        <thead><tr><th>Part</th><th>Quantity</th><th>Purpose</th></tr></thead>
        <tbody>
          ${HARDWARE_PARTS.map(([n, q, p]) => `<tr><td>${esc(n)}</td><td>${esc(q)}</td><td class="muted">${esc(p)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p class="note">Filament: ${esc(filamentType)} · ${infillPercent}% infill · ${layerHeight} mm layers</p>
    </section>` : ''

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>MakerStudio Build Plan — ${esc(ftLabel)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; margin: 0; padding: 32px 40px; line-height: 1.5; }
  header { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #f59e0b; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { width: 40px; height: 40px; border-radius: 8px; background: #f59e0b; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; color: #000; }
  h1 { font-size: 22px; margin: 0; }
  .sub { color: #666; font-size: 13px; }
  .meta { margin-left: auto; text-align: right; font-size: 12px; color: #888; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #b45309; border-bottom: 1px solid #eee; padding-bottom: 6px; margin: 28px 0 12px; }
  section { break-inside: avoid; }
  .specs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .spec { background: #faf8f4; border: 1px solid #eee; border-radius: 8px; padding: 10px 12px; }
  .spec .k { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
  .spec .v { font-size: 16px; font-weight: 600; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; background: #f7f5f0; padding: 7px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #777; border-bottom: 2px solid #eee; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: #999; }
  ol.steps { list-style: none; padding: 0; margin: 0; }
  ol.steps li { display: flex; align-items: flex-start; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f3f3f3; }
  .step-n { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; background: #0891b2; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .cost { display: grid; grid-template-columns: 1fr auto; gap: 4px 24px; max-width: 320px; font-size: 13px; }
  .cost .total { border-top: 2px solid #f59e0b; padding-top: 6px; margin-top: 4px; font-weight: 700; font-size: 15px; color: #b45309; }
  .note { font-size: 12px; color: #888; margin-top: 8px; }
  footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; text-align: center; }
  @media print { body { padding: 0; } @page { margin: 1.5cm; } }
</style></head>
<body>
  <header>
    <div class="logo">M</div>
    <div>
      <h1>${esc(ftLabel)} — Build Plan</h1>
      <div class="sub">MakerStudio Workshop Suite</div>
    </div>
    <div class="meta">
      Generated ${new Date().toLocaleDateString()}<br>
      ${totalParts} parts · ${weight} kg
    </div>
  </header>

  <section>
    <h2>Specifications</h2>
    <div class="specs">
      <div class="spec"><div class="k">Width</div><div class="v">${fmt(W, units)}</div></div>
      <div class="spec"><div class="k">Height</div><div class="v">${fmt(H, units)}</div></div>
      <div class="spec"><div class="k">Depth</div><div class="v">${fmt(D, units)}</div></div>
      <div class="spec"><div class="k">Wood Species</div><div class="v" style="text-transform:capitalize">${esc(woodSpecies)}</div></div>
      <div class="spec"><div class="k">Finish</div><div class="v">${esc(finish)}</div></div>
      <div class="spec"><div class="k">Board Thickness</div><div class="v">${fmt(woodThickness, units)}</div></div>
    </div>
  </section>

  <section>
    <h2>Cut List</h2>
    <table>
      <thead><tr><th>Part</th><th class="num">Qty</th><th class="num">Width (${u})</th><th class="num">Length (${u})</th><th class="num">Thick (${u})</th></tr></thead>
      <tbody>${cutRows}</tbody>
    </table>
  </section>

  ${steps.length ? `
  <section>
    <h2>Assembly Sequence</h2>
    <ol class="steps">${stepRows}</ol>
  </section>` : ''}

  ${hardwareSection}

  <section>
    <h2>Cost Estimate</h2>
    <div class="cost">
      <span>Lumber</span><span class="num">$${matCost}</span>
      <span>Hardware</span><span class="num">$${hwCost}</span>
      <span>Finish</span><span class="num">$${finishCost}</span>
      <span class="total">Total</span><span class="num total">$${total}</span>
    </div>
    <p class="note">Estimates use retail market rates — verify with local suppliers.</p>
  </section>

  <footer>Made with MakerStudio · This plan is an estimate. Always double-check measurements before cutting.</footer>

  <script>window.onload = function(){ setTimeout(function(){ window.print() }, 250) }</script>
</body></html>`
}

export function printBuildPlan(state) {
  const html = buildPlanHTML(state)
  const win = window.open('', '_blank')
  if (!win) {
    // Popup blocked — fall back to a downloadable HTML file
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'makerstudio-build-plan.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}
