const SNAPSHOT_KEYS_EXT = [
  'dimensions', 'woodSpecies', 'woodThickness', 'shelfCount', 'plasticParts',
  'filamentType', 'infillPercent', 'layerHeight', 'boardWidth', 'boardLength',
  'cutKerf', 'units', 'furnitureType',
]

export function buildProjectJSON(storeState) {
  const data = { _version: 2, _savedAt: new Date().toISOString() }
  SNAPSHOT_KEYS_EXT.forEach((k) => {
    const v = storeState[k]
    data[k] = typeof v === 'object' && v !== null ? { ...v } : v
  })
  return JSON.stringify(data, null, 2)
}

export function parseProjectJSON(json) {
  const data = JSON.parse(json)
  if (!data._version) throw new Error('Not a MakerStudio project file')
  const { _version, _savedAt, ...rest } = data
  return rest
}

export function downloadProject(json, name = 'makerstudio-project.json') {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function openProjectFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { reject(new Error('No file')); return }
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    }
    input.click()
  })
}
