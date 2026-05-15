export function downloadCSV(rows, filename = 'makerstudio-cutlist.csv') {
  const escaped = rows.map((row) =>
    row.map((cell) => {
      const s = String(cell)
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')
  )
  const blob = new Blob([escaped.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function buildCutListCSV(cutList, store) {
  const { dimensions, woodSpecies, woodThickness } = store
  const header = ['Part', 'Qty', 'Width (cm)', 'Length (cm)', 'Thickness (cm)', 'Notes']
  const rows = cutList.map((p) => [
    p.label, p.qty,
    p.w.toFixed(1), p.h.toFixed(1), p.thick.toFixed(1),
    p.thick < 1 ? 'Back panel — thinner stock' : '',
  ])
  const meta = [
    [],
    ['--- Project Info ---'],
    ['Species', woodSpecies],
    ['Board thickness', `${woodThickness} cm`],
    ['Overall W × H × D', `${dimensions.width} × ${dimensions.height} × ${dimensions.depth} cm`],
    ['Generated', new Date().toLocaleDateString()],
  ]
  return [header, ...rows, ...meta]
}

export function copyTextToClipboard(text) {
  return navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}

export function cutListToText(cutList) {
  const rows = cutList.map(
    (p) => `${p.label.padEnd(20)} ×${p.qty}   ${p.w.toFixed(1)} × ${p.h.toFixed(1)} × ${p.thick} cm`
  )
  return ['MakerStudio Cut List', '─'.repeat(52), ...rows].join('\n')
}
