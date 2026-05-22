import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { buildProjectJSON, parseProjectJSON, downloadProject } from '../utils/project'

const SNAPSHOT_KEYS = [
  'dimensions', 'woodSpecies', 'woodThickness', 'shelfCount', 'plasticParts',
  'filamentType', 'infillPercent', 'layerHeight', 'boardWidth', 'boardLength',
  'cutKerf', 'units', 'furnitureType',
]

function snapshot(s) {
  const out = {}
  SNAPSHOT_KEYS.forEach((k) => {
    out[k] = typeof s[k] === 'object' && s[k] !== null ? { ...s[k] } : s[k]
  })
  return out
}

export const FURNITURE_TYPES = [
  { id: 'shelf',     label: 'Shelf Unit',   icon: '▥', defaultDims: { width: 80,  height: 180, depth: 40  }, shelves: 4 },
  { id: 'desk',      label: 'Desk',         icon: '▬', defaultDims: { width: 140, height: 75,  depth: 65  }, shelves: 0 },
  { id: 'cabinet',   label: 'Wall Cabinet', icon: '▤', defaultDims: { width: 90,  height: 100, depth: 35  }, shelves: 2 },
  { id: 'table',     label: 'Dining Table', icon: '⊡', defaultDims: { width: 160, height: 76,  depth: 90  }, shelves: 0 },
  { id: 'bed',       label: 'Bed Frame',    icon: '▬', defaultDims: { width: 160, height: 45,  depth: 200 }, shelves: 0 },
  { id: 'wallshelf', label: 'Wall Shelf',   icon: '▭', defaultDims: { width: 80,  height: 30,  depth: 25  }, shelves: 0 },
]

export const SIZE_PRESETS = [
  { label: 'Bookshelf',    dims: { width: 80,  height: 180, depth: 30 }, shelves: 4, type: 'shelf' },
  { label: 'Wardrobe',     dims: { width: 120, height: 200, depth: 58 }, shelves: 2, type: 'shelf' },
  { label: 'Media Unit',   dims: { width: 150, height: 60,  depth: 45 }, shelves: 1, type: 'shelf' },
  { label: 'Nightstand',   dims: { width: 45,  height: 65,  depth: 35 }, shelves: 2, type: 'shelf' },
  { label: 'Office Shelf', dims: { width: 90,  height: 200, depth: 35 }, shelves: 5, type: 'shelf' },
  { label: 'Corner Unit',  dims: { width: 60,  height: 120, depth: 60 }, shelves: 3, type: 'shelf' },
  { label: 'Writing Desk', dims: { width: 140, height: 75,  depth: 65 }, shelves: 0, type: 'desk' },
  { label: 'Standing Desk',dims: { width: 160, height: 110, depth: 70 }, shelves: 0, type: 'desk' },
  { label: 'Kitchen Cabinet',dims:{ width: 90, height: 100, depth: 35 }, shelves: 2, type: 'cabinet' },
  { label: 'Dining Table', dims: { width: 160, height: 76,  depth: 90  }, shelves: 0, type: 'table'     },
  { label: 'Coffee Table', dims: { width: 120, height: 45,  depth: 60  }, shelves: 0, type: 'table'     },
  { label: 'Queen Bed',    dims: { width: 160, height: 45,  depth: 200 }, shelves: 0, type: 'bed'       },
  { label: 'Single Bed',   dims: { width: 90,  height: 40,  depth: 200 }, shelves: 0, type: 'bed'       },
  { label: 'Wall Shelf S', dims: { width: 60,  height: 25,  depth: 20  }, shelves: 0, type: 'wallshelf' },
  { label: 'Wall Shelf L', dims: { width: 120, height: 30,  depth: 28  }, shelves: 0, type: 'wallshelf' },
]

export const ROOM_SETS = {
  'Home Office': [
    { label: 'Standing Desk',  dims: { width: 160, height: 110, depth: 70 }, shelves: 0, type: 'desk' },
    { label: 'Monitor Shelf',  dims: { width: 120, height: 120, depth: 35 }, shelves: 3, type: 'shelf' },
    { label: 'Filing Cabinet', dims: { width: 45,  height: 70,  depth: 50 }, shelves: 2, type: 'cabinet' },
    { label: 'Credenza',       dims: { width: 180, height: 75,  depth: 50 }, shelves: 1, type: 'shelf' },
  ],
  'Bedroom': [
    { label: 'Double Wardrobe',dims: { width: 120, height: 200, depth: 58 }, shelves: 2, type: 'shelf' },
    { label: 'Bedside Table',  dims: { width: 45,  height: 65,  depth: 38 }, shelves: 1, type: 'cabinet' },
    { label: 'Tall Dresser',   dims: { width: 50,  height: 140, depth: 45 }, shelves: 4, type: 'shelf' },
    { label: 'Blanket Box',    dims: { width: 100, height: 45,  depth: 50 }, shelves: 0, type: 'shelf' },
  ],
  'Living Room': [
    { label: 'TV Console',     dims: { width: 150, height: 55,  depth: 45 }, shelves: 1, type: 'shelf' },
    { label: 'Display Cabinet',dims: { width: 90,  height: 120, depth: 35 }, shelves: 2, type: 'cabinet' },
    { label: 'Book Wall',      dims: { width: 90,  height: 200, depth: 30 }, shelves: 5, type: 'shelf' },
    { label: 'Side Table',     dims: { width: 50,  height: 60,  depth: 50 }, shelves: 1, type: 'shelf' },
  ],
  'Dining Room': [
    { label: 'Dining Table',    dims: { width: 160, height: 76,  depth: 90  }, shelves: 0, type: 'table'   },
    { label: 'Sideboard',       dims: { width: 150, height: 80,  depth: 45  }, shelves: 1, type: 'shelf'   },
    { label: 'Display Cabinet', dims: { width: 90,  height: 180, depth: 35  }, shelves: 3, type: 'cabinet' },
    { label: 'Bar Cabinet',     dims: { width: 60,  height: 90,  depth: 40  }, shelves: 2, type: 'cabinet' },
  ],
  "Kid's Room": [
    { label: 'Single Bed',      dims: { width: 90,  height: 40,  depth: 200 }, shelves: 0, type: 'bed'      },
    { label: 'Study Desk',      dims: { width: 100, height: 75,  depth: 55  }, shelves: 0, type: 'desk'     },
    { label: 'Toy Shelf',       dims: { width: 80,  height: 120, depth: 30  }, shelves: 4, type: 'shelf'    },
    { label: 'Wall Shelf',      dims: { width: 60,  height: 25,  depth: 20  }, shelves: 0, type: 'wallshelf'},
  ],
  'Entryway': [
    { label: 'Shoe Rack',       dims: { width: 90,  height: 50,  depth: 35  }, shelves: 3, type: 'shelf'    },
    { label: 'Hall Bench',      dims: { width: 120, height: 50,  depth: 40  }, shelves: 0, type: 'table'    },
    { label: 'Coat Cabinet',    dims: { width: 60,  height: 190, depth: 35  }, shelves: 1, type: 'cabinet'  },
    { label: 'Wall Shelf',      dims: { width: 80,  height: 25,  depth: 20  }, shelves: 0, type: 'wallshelf'},
  ],
}

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // ── Core dimensions (cm) ──────────────────────────────
    dimensions:    { width: 80, height: 180, depth: 40 },

    // ── Material ──────────────────────────────────────────
    woodSpecies:   'oak',
    woodThickness: 1.8,
    shelfCount:    4,
    plasticParts:  false,

    // ── 3D print ──────────────────────────────────────────
    filamentUsed:  0,
    filamentType:  'PLA',
    infillPercent: 20,
    layerHeight:   0.2,

    // ── Furniture & scene ─────────────────────────────────
    furnitureType:      'shelf',   // 'shelf' | 'desk' | 'cabinet'
    explodeAmount:      0,         // 0–1
    doorsOpen:          false,     // cabinet door state
    showTexture:        true,

    // ── Panel layout ─────────────────────────────────────
    leftPanelWidth:  Number(localStorage.getItem('ms-left-w'))  || 240,
    rightPanelWidth: Number(localStorage.getItem('ms-right-w')) || 288,

    // ── Viewport ──────────────────────────────────────────
    activeTab:          'design',
    renderMode:         'solid',
    showGrid:           true,
    showDimensions:     true,
    showShadows:        true,
    cameraPreset:       'perspective',
    _screenshotPending: false,
    hoveredPart: null,

    // ── Cut planner ───────────────────────────────────────
    boardWidth:  122,
    boardLength: 244,
    cutKerf:     0.3,

    // ── Units ─────────────────────────────────────────────
    units: 'metric',

    // ── Undo / redo ───────────────────────────────────────
    _past:   [],
    _future: [],

    // ── Actions ───────────────────────────────────────────
    setDimension: (key, value) =>
      set((s) => ({ dimensions: { ...s.dimensions, [key]: value } })),
    setDimensions: (dims) =>
      set((s) => ({ dimensions: { ...s.dimensions, ...dims } })),

    setWoodSpecies:   (v) => set({ woodSpecies: v }),
    setWoodThickness: (v) => set({ woodThickness: v }),
    setShelfCount:    (v) => set({ shelfCount: v }),
    setPlasticParts:  (v) => set({ plasticParts: v }),
    setFilamentType:  (v) => set({ filamentType: v }),
    setInfillPercent: (v) => set({ infillPercent: v }),
    setLayerHeight:   (v) => set({ layerHeight: v }),
    setActiveTab:     (v) => set({ activeTab: v }),
    setRenderMode:    (v) => set({ renderMode: v }),
    toggleGrid:       ()  => set((s) => ({ showGrid: !s.showGrid })),
    toggleDimensions: ()  => set((s) => ({ showDimensions: !s.showDimensions })),
    toggleShadows:    ()  => set((s) => ({ showShadows: !s.showShadows })),
    setCameraPreset:  (v) => set({ cameraPreset: v }),
    setBoardDimensions: (w, l) => set({ boardWidth: w, boardLength: l }),
    setCutKerf:       (v) => set({ cutKerf: v }),
    setUnits:         (v) => set({ units: v }),
    setExplodeAmount: (v) => set({ explodeAmount: v }),
    toggleDoorsOpen:  ()  => set((s) => ({ doorsOpen: !s.doorsOpen })),
    toggleTexture:    ()  => set((s) => ({ showTexture: !s.showTexture })),

    setFurnitureType: (type) => {
      const ft = FURNITURE_TYPES.find((f) => f.id === type)
      if (!ft) return
      get().pushHistory()
      set({
        furnitureType: type,
        dimensions:    { ...ft.defaultDims },
        shelfCount:    ft.shelves,
        explodeAmount: 0,
        doorsOpen:     false,
      })
    },

    applyPreset: (preset) => {
      get().pushHistory()
      set({
        dimensions:   { ...preset.dims },
        shelfCount:   preset.shelves,
        furnitureType: preset.type ?? 'shelf',
        explodeAmount: 0,
      })
    },

    setHoveredPart: (label) => set({ hoveredPart: label }),

    setLeftPanelWidth: (w) => {
      localStorage.setItem('ms-left-w', String(w))
      set({ leftPanelWidth: w })
    },
    setRightPanelWidth: (w) => {
      localStorage.setItem('ms-right-w', String(w))
      set({ rightPanelWidth: w })
    },

    // Screenshot (triggers ScreenshotTrigger inside canvas)
    takeScreenshot:  () => set({ _screenshotPending: true }),
    _clearScreenshot: () => set({ _screenshotPending: false }),

    // Undo / redo
    pushHistory: () => {
      const snap = snapshot(get())
      set((s) => ({
        _past:   [...s._past.slice(-49), snap],
        _future: [],
      }))
    },

    undo: () => {
      const { _past, _future } = get()
      if (!_past.length) return
      const prev    = _past.at(-1)
      const current = snapshot(get())
      set({ ...prev, _past: _past.slice(0, -1), _future: [..._future, current] })
    },

    redo: () => {
      const { _past, _future } = get()
      if (!_future.length) return
      const next    = _future.at(-1)
      const current = snapshot(get())
      set({ ...next, _past: [..._past, current], _future: _future.slice(0, -1) })
    },

    // Project save / load
    saveProject: () => {
      const json = buildProjectJSON(get())
      localStorage.setItem('makerstudio-autosave', json)
      downloadProject(json)
    },

    exportProjectJSON: () => {
      const json = buildProjectJSON(get())
      localStorage.setItem('makerstudio-autosave', json)
      return json
    },

    loadProjectData: (data) => {
      get().pushHistory()
      set({ ...data, explodeAmount: 0 })
    },

    loadAutosave: () => {
      const json = localStorage.getItem('makerstudio-autosave')
      if (!json) return false
      try {
        const data = parseProjectJSON(json)
        set({ ...data, explodeAmount: 0 })
        return true
      } catch {
        return false
      }
    },

    // ── Computed helpers ──────────────────────────────────
    computeFilamentEstimate: () => {
      const { plasticParts, dimensions, infillPercent } = get()
      if (!plasticParts) return 0
      const vol = (dimensions.width * dimensions.depth * 0.5) * (infillPercent / 100)
      return Math.round(vol * 1.24)
    },

    computeCutList: () => {
      const { dimensions, woodThickness, shelfCount, furnitureType } = get()
      const { width: W, height: H, depth: D } = dimensions
      const t = woodThickness

      if (furnitureType === 'desk') {
        const pedW = Math.min(50, W * 0.22)
        return [
          { label: 'Desktop top',    qty: 1, w: W,         h: D,     thick: t * 1.5 },
          { label: 'Pedestal side',  qty: 4, w: D,         h: H - t, thick: t },
          { label: 'Pedestal shelf', qty: 4, w: pedW - 2*t,h: D,     thick: t },
          { label: 'Modesty panel',  qty: 1, w: W-2*pedW,  h: H*0.6, thick: 0.6 },
        ]
      }
      if (furnitureType === 'cabinet') {
        return [
          { label: 'Side panels',   qty: 2,          w: D,         h: H,     thick: t },
          { label: 'Top panel',     qty: 1,          w: W - 2 * t, h: D,     thick: t },
          { label: 'Bottom panel',  qty: 1,          w: W - 2 * t, h: D,     thick: t },
          { label: 'Shelves',       qty: shelfCount, w: W - 2 * t, h: D,     thick: t },
          { label: 'Back panel',    qty: 1,          w: W,         h: H,     thick: 0.6 },
          { label: 'Door panels',   qty: 2,          w: (W-2*t)/2, h: H-2*t, thick: t * 0.8 },
        ]
      }
      // shelf (default)
      return [
        { label: 'Side panels',   qty: 2,          w: D,         h: H,     thick: t },
        { label: 'Top panel',     qty: 1,          w: W - 2 * t, h: D,     thick: t },
        { label: 'Bottom panel',  qty: 1,          w: W - 2 * t, h: D,     thick: t },
        { label: 'Shelves',       qty: shelfCount, w: W - 2 * t, h: D,     thick: t },
        { label: 'Back panel',    qty: 1,          w: W,         h: H,     thick: 0.6 },
      ]
    },

    computeWeight: () => {
      const DENSITY = {
        oak: 720, pine: 530, walnut: 640, maple: 705,
        mahogany: 545, birch: 670, cherry: 580,
      }
      const { dimensions, woodThickness, shelfCount, woodSpecies } = get()
      const { width: W, height: H, depth: D } = dimensions
      const T = woodThickness / 100
      const [Wm, Hm, Dm] = [W / 100, H / 100, D / 100]
      const vol =
        2 * (T * Hm * Dm) +
        2 * ((Wm - 2 * T) * T * Dm) +
        shelfCount * ((Wm - 2 * T) * T * Dm) +
        Wm * Hm * 0.006
      return (vol * (DENSITY[woodSpecies] ?? 680)).toFixed(1)
    },
  }))
)
