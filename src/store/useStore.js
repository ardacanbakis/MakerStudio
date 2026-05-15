import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

const SNAPSHOT_KEYS = [
  'dimensions', 'woodSpecies', 'woodThickness', 'shelfCount', 'plasticParts',
  'filamentType', 'infillPercent', 'layerHeight', 'boardWidth', 'boardLength', 'cutKerf',
]

function snapshot(s) {
  const out = {}
  SNAPSHOT_KEYS.forEach((k) => {
    out[k] = typeof s[k] === 'object' ? { ...s[k] } : s[k]
  })
  return out
}

export const SIZE_PRESETS = [
  { label: 'Bookshelf',    dims: { width: 80,  height: 180, depth: 30 }, shelves: 4 },
  { label: 'Wardrobe',     dims: { width: 120, height: 200, depth: 58 }, shelves: 2 },
  { label: 'Media Unit',   dims: { width: 150, height: 60,  depth: 45 }, shelves: 1 },
  { label: 'Nightstand',   dims: { width: 45,  height: 65,  depth: 35 }, shelves: 2 },
  { label: 'Office Shelf', dims: { width: 90,  height: 200, depth: 35 }, shelves: 5 },
  { label: 'Corner Unit',  dims: { width: 60,  height: 120, depth: 60 }, shelves: 3 },
]

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // ── Core dimensions (cm) ──────────────────────────────
    dimensions: { width: 80, height: 180, depth: 40 },

    // ── Material ──────────────────────────────────────────
    woodSpecies:   'oak',
    woodThickness: 1.8,
    shelfCount:    4,
    plasticParts:  false,

    // ── 3D print ──────────────────────────────────────────
    filamentUsed:   0,
    filamentType:   'PLA',
    infillPercent:  20,
    layerHeight:    0.2,

    // ── Viewport ──────────────────────────────────────────
    activeTab:      'design',
    renderMode:     'solid',
    showGrid:       true,
    showDimensions: true,
    showShadows:    true,
    cameraPreset:   'perspective',

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

    applyPreset: (preset) => {
      get().pushHistory()
      set({ dimensions: { ...preset.dims }, shelfCount: preset.shelves })
    },

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
      const prev = _past.at(-1)
      const current = snapshot(get())
      set({
        ...prev,
        _past:   _past.slice(0, -1),
        _future: [..._future, current],
      })
    },

    redo: () => {
      const { _past, _future } = get()
      if (!_future.length) return
      const next = _future.at(-1)
      const current = snapshot(get())
      set({
        ...next,
        _past:   [..._past, current],
        _future: _future.slice(0, -1),
      })
    },

    canUndo: () => get()._past.length > 0,
    canRedo: () => get()._future.length > 0,

    // ── Computed helpers ──────────────────────────────────
    computeFilamentEstimate: () => {
      const { plasticParts, dimensions, infillPercent } = get()
      if (!plasticParts) return 0
      const vol = (dimensions.width * dimensions.depth * 0.5) * (infillPercent / 100)
      return Math.round(vol * 1.24)
    },

    computeCutList: () => {
      const { dimensions, woodThickness, shelfCount } = get()
      const { width: W, height: H, depth: D } = dimensions
      const t = woodThickness
      return [
        { label: 'Side panels',  qty: 2,          w: D,         h: H,     thick: t   },
        { label: 'Top panel',    qty: 1,          w: W - 2 * t, h: D,     thick: t   },
        { label: 'Bottom panel', qty: 1,          w: W - 2 * t, h: D,     thick: t   },
        { label: 'Shelves',      qty: shelfCount, w: W - 2 * t, h: D,     thick: t   },
        { label: 'Back panel',   qty: 1,          w: W,         h: H,     thick: 0.6 },
      ]
    },

    computeWeight: () => {
      const DENSITY = { oak: 720, pine: 530, walnut: 640, maple: 705, mahogany: 545, birch: 670, cherry: 580 }
      const { dimensions, woodThickness, shelfCount, woodSpecies } = get()
      const { width: W, height: H, depth: D } = dimensions
      const T = woodThickness / 100
      const Wm = W / 100, Hm = H / 100, Dm = D / 100
      const vol =
        2 * (T * Hm * Dm) +                         // sides
        2 * ((Wm - 2 * T) * T * Dm) +               // top+bot
        shelfCount * ((Wm - 2 * T) * T * Dm) +      // shelves
        Wm * Hm * 0.006                              // back
      return (vol * (DENSITY[woodSpecies] ?? 680)).toFixed(1)
    },
  }))
)
