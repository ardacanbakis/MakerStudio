import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { buildProjectJSON, parseProjectJSON, downloadProject } from '../utils/project'

const SNAPSHOT_KEYS = [
  'dimensions', 'woodSpecies', 'woodThickness', 'shelfCount', 'plasticParts',
  'filamentType', 'infillPercent', 'layerHeight', 'boardWidth', 'boardLength',
  'cutKerf', 'units', 'furnitureType', 'surfaceFinish', 'paintColor', 'customParts',
]

function snapshot(s) {
  const out = {}
  SNAPSHOT_KEYS.forEach((k) => {
    const v = s[k]
    if (Array.isArray(v))            out[k] = v.map((it) => (it && typeof it === 'object' ? { ...it } : it))
    else if (v && typeof v === 'object') out[k] = { ...v }
    else                             out[k] = v
  })
  return out
}

// Custom-build helpers
let _partSeq = 0
const newPartId = () => `p${Date.now().toString(36)}${(_partSeq++).toString(36)}`

function starterParts() {
  return [
    { id: newPartId(), name: 'Left side',  x: -29, y: 40, z: 0, w: 2,  h: 80, d: 30 },
    { id: newPartId(), name: 'Right side', x: 29,  y: 40, z: 0, w: 2,  h: 80, d: 30 },
    { id: newPartId(), name: 'Top',        x: 0,   y: 79, z: 0, w: 60, h: 2,  d: 30 },
    { id: newPartId(), name: 'Shelf',      x: 0,   y: 40, z: 0, w: 56, h: 2,  d: 28 },
  ]
}

export const FURNITURE_TYPES = [
  { id: 'shelf',    label: 'Shelf Unit',   icon: 'shelf',   defaultDims: { width: 80,  height: 180, depth: 40  }, shelves: 4 },
  { id: 'desk',     label: 'Desk',         icon: 'desk',    defaultDims: { width: 140, height: 75,  depth: 65  }, shelves: 0 },
  { id: 'cabinet',  label: 'Cabinet',      icon: 'cabinet', defaultDims: { width: 90,  height: 100, depth: 35  }, shelves: 2 },
  { id: 'table',    label: 'Dining Table', icon: 'table',   defaultDims: { width: 160, height: 76,  depth: 90  }, shelves: 0 },
  { id: 'tvstand',  label: 'TV Stand',     icon: 'tv',      defaultDims: { width: 180, height: 55,  depth: 45  }, shelves: 2 },
  { id: 'bed',      label: 'Bed Frame',    icon: 'bed',     defaultDims: { width: 160, height: 45,  depth: 200 }, shelves: 0 },
  { id: 'wallshelf',label: 'Wall Shelf',   icon: 'wall',    defaultDims: { width: 80,  height: 30,  depth: 25  }, shelves: 0 },
  { id: 'custom',   label: 'Custom Build', icon: 'custom',  defaultDims: { width: 100, height: 100, depth: 40  }, shelves: 0 },
]

// Assembly step order per furniture type (labels match those used in scene components)
export const ASSEMBLY_ORDERS = {
  shelf:     ['Bottom panel', 'Side panels', 'Top panel', 'Shelves', 'Back panel'],
  desk:      ['Pedestal side', 'Pedestal shelf', 'Desktop top', 'Modesty panel'],
  cabinet:   ['Bottom panel', 'Side panels', 'Shelves', 'Top panel', 'Back panel', 'Door panels'],
  table:     ['Table Legs', 'Apron', 'Tabletop'],
  tvstand:   ['Bottom panel', 'Side panels', 'Dividers', 'Shelves', 'Top panel', 'Back panel'],
  bed:       ['Bed Legs', 'Side Rails', 'Slats', 'Footboard', 'Headboard'],
  wallshelf: ['Mounting Rail', 'Brackets', 'Shelf Board'],
}

export const SIZE_PRESETS = [
  { label: 'Bookshelf',      dims: { width: 80,  height: 180, depth: 30  }, shelves: 4, type: 'shelf'    },
  { label: 'Wardrobe',       dims: { width: 120, height: 200, depth: 58  }, shelves: 2, type: 'shelf'    },
  { label: 'Media Unit',     dims: { width: 150, height: 60,  depth: 45  }, shelves: 1, type: 'shelf'    },
  { label: 'Nightstand',     dims: { width: 45,  height: 65,  depth: 35  }, shelves: 2, type: 'shelf'    },
  { label: 'Office Shelf',   dims: { width: 90,  height: 200, depth: 35  }, shelves: 5, type: 'shelf'    },
  { label: 'Corner Unit',    dims: { width: 60,  height: 120, depth: 60  }, shelves: 3, type: 'shelf'    },
  { label: 'Writing Desk',   dims: { width: 140, height: 75,  depth: 65  }, shelves: 0, type: 'desk'     },
  { label: 'Standing Desk',  dims: { width: 160, height: 110, depth: 70  }, shelves: 0, type: 'desk'     },
  { label: 'L-Desk',         dims: { width: 180, height: 75,  depth: 80  }, shelves: 0, type: 'desk'     },
  { label: 'Kitchen Cabinet',dims: { width: 90,  height: 100, depth: 35  }, shelves: 2, type: 'cabinet'  },
  { label: 'Pantry Cabinet', dims: { width: 60,  height: 190, depth: 35  }, shelves: 4, type: 'cabinet'  },
  { label: 'Bathroom Cabinet',dims:{ width: 70,  height: 80,  depth: 30  }, shelves: 1, type: 'cabinet'  },
  { label: 'Dining Table',   dims: { width: 160, height: 76,  depth: 90  }, shelves: 0, type: 'table'    },
  { label: 'Coffee Table',   dims: { width: 120, height: 45,  depth: 60  }, shelves: 0, type: 'table'    },
  { label: 'Side Table',     dims: { width: 50,  height: 60,  depth: 50  }, shelves: 0, type: 'table'    },
  { label: 'TV Stand 55"',   dims: { width: 140, height: 55,  depth: 40  }, shelves: 2, type: 'tvstand'  },
  { label: 'TV Stand 65"',   dims: { width: 170, height: 55,  depth: 45  }, shelves: 2, type: 'tvstand'  },
  { label: 'Entertainment',  dims: { width: 210, height: 60,  depth: 45  }, shelves: 4, type: 'tvstand'  },
  { label: 'Queen Bed',      dims: { width: 160, height: 45,  depth: 200 }, shelves: 0, type: 'bed'      },
  { label: 'King Bed',       dims: { width: 180, height: 45,  depth: 200 }, shelves: 0, type: 'bed'      },
  { label: 'Single Bed',     dims: { width: 90,  height: 40,  depth: 200 }, shelves: 0, type: 'bed'      },
  { label: 'Wall Shelf S',   dims: { width: 60,  height: 25,  depth: 20  }, shelves: 0, type: 'wallshelf'},
  { label: 'Wall Shelf L',   dims: { width: 120, height: 30,  depth: 28  }, shelves: 0, type: 'wallshelf'},
  { label: 'Display Shelf',  dims: { width: 100, height: 35,  depth: 30  }, shelves: 0, type: 'wallshelf'},
]

export const ROOM_SETS = {
  'Home Office': [
    { label: 'Standing Desk',  dims: { width: 160, height: 110, depth: 70 }, shelves: 0, type: 'desk'     },
    { label: 'Monitor Shelf',  dims: { width: 120, height: 120, depth: 35 }, shelves: 3, type: 'shelf'    },
    { label: 'Filing Cabinet', dims: { width: 45,  height: 70,  depth: 50 }, shelves: 2, type: 'cabinet'  },
    { label: 'Credenza',       dims: { width: 180, height: 75,  depth: 50 }, shelves: 1, type: 'shelf'    },
  ],
  'Bedroom': [
    { label: 'Double Wardrobe',dims: { width: 120, height: 200, depth: 58 }, shelves: 2, type: 'shelf'    },
    { label: 'Queen Bed',      dims: { width: 160, height: 45,  depth: 200}, shelves: 0, type: 'bed'      },
    { label: 'Bedside Table',  dims: { width: 45,  height: 65,  depth: 38 }, shelves: 1, type: 'cabinet'  },
    { label: 'Tall Dresser',   dims: { width: 50,  height: 140, depth: 45 }, shelves: 4, type: 'shelf'    },
  ],
  'Living Room': [
    { label: 'TV Stand 65"',   dims: { width: 170, height: 55,  depth: 45 }, shelves: 2, type: 'tvstand'  },
    { label: 'Coffee Table',   dims: { width: 120, height: 45,  depth: 60 }, shelves: 0, type: 'table'    },
    { label: 'Display Cabinet',dims: { width: 90,  height: 120, depth: 35 }, shelves: 2, type: 'cabinet'  },
    { label: 'Book Wall',      dims: { width: 90,  height: 200, depth: 30 }, shelves: 5, type: 'shelf'    },
  ],
  'Dining Room': [
    { label: 'Dining Table',   dims: { width: 160, height: 76,  depth: 90  }, shelves: 0, type: 'table'   },
    { label: 'Sideboard',      dims: { width: 150, height: 80,  depth: 45  }, shelves: 1, type: 'shelf'   },
    { label: 'Display Cabinet',dims: { width: 90,  height: 180, depth: 35  }, shelves: 3, type: 'cabinet' },
    { label: 'Bar Cabinet',    dims: { width: 60,  height: 90,  depth: 40  }, shelves: 2, type: 'cabinet' },
  ],
  "Kid's Room": [
    { label: 'Single Bed',     dims: { width: 90,  height: 40,  depth: 200 }, shelves: 0, type: 'bed'      },
    { label: 'Study Desk',     dims: { width: 100, height: 75,  depth: 55  }, shelves: 0, type: 'desk'     },
    { label: 'Toy Shelf',      dims: { width: 80,  height: 120, depth: 30  }, shelves: 4, type: 'shelf'    },
    { label: 'Wall Shelf',     dims: { width: 60,  height: 25,  depth: 20  }, shelves: 0, type: 'wallshelf'},
  ],
  'Entryway': [
    { label: 'Shoe Rack',      dims: { width: 90,  height: 50,  depth: 35  }, shelves: 3, type: 'shelf'    },
    { label: 'Hall Bench',     dims: { width: 120, height: 50,  depth: 40  }, shelves: 0, type: 'table'    },
    { label: 'Coat Cabinet',   dims: { width: 60,  height: 190, depth: 35  }, shelves: 1, type: 'cabinet'  },
    { label: 'Wall Shelf',     dims: { width: 80,  height: 25,  depth: 20  }, shelves: 0, type: 'wallshelf'},
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
    surfaceFinish: 'oil',
    paintColor:    '#cd853f',

    // ── 3D print ──────────────────────────────────────────
    filamentUsed:  0,
    filamentType:  'PLA',
    infillPercent: 20,
    layerHeight:   0.2,

    // ── Furniture & scene ─────────────────────────────────
    furnitureType:  'shelf',
    explodeAmount:  0,
    doorsOpen:      false,
    showTexture:    true,
    assemblyStep:   -1,     // -1 = off; 0..N = current build step

    // ── Custom freeform builder ───────────────────────────
    customParts:    [],     // [{ id, name, x, y, z, w, h, d }]
    selectedPartId: null,
    transformMode:  'translate',  // 'translate' | 'scale'
    myDesigns:      JSON.parse(localStorage.getItem('makerstudio-mydesigns') || '[]'),

    // ── Panel layout ─────────────────────────────────────
    leftPanelWidth:  Number(localStorage.getItem('ms-left-w'))  || 240,
    rightPanelWidth: Number(localStorage.getItem('ms-right-w')) || 288,

    // ── Welcome screen (shared globally so logo can re-open it) ──
    welcomeDismissed: localStorage.getItem('makerstudio-welcomed') === '1',

    // ── Viewport ──────────────────────────────────────────
    activeTab:          'design',
    renderMode:         'solid',
    showGrid:           true,
    showDimensions:     true,
    showShadows:        true,
    cameraPreset:       'perspective',
    _screenshotPending: false,
    _exportPending:     null,
    hoveredPart:        null,

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
    setDimension:  (key, value) => set((s) => ({ dimensions: { ...s.dimensions, [key]: value } })),
    setDimensions: (dims) => set((s) => ({ dimensions: { ...s.dimensions, ...dims } })),

    setWoodSpecies:    (v) => set({ woodSpecies: v }),
    setWoodThickness:  (v) => set({ woodThickness: v }),
    setShelfCount:     (v) => set({ shelfCount: v }),
    setPlasticParts:   (v) => set({ plasticParts: v }),
    setSurfaceFinish:  (v) => set({ surfaceFinish: v }),
    setPaintColor:     (v) => set({ paintColor: v }),
    setFilamentType:   (v) => set({ filamentType: v }),
    setInfillPercent:  (v) => set({ infillPercent: v }),
    setLayerHeight:    (v) => set({ layerHeight: v }),
    setActiveTab:      (v) => set({ activeTab: v }),
    setRenderMode:     (v) => set({ renderMode: v }),
    toggleGrid:        ()  => set((s) => ({ showGrid: !s.showGrid })),
    toggleDimensions:  ()  => set((s) => ({ showDimensions: !s.showDimensions })),
    toggleShadows:     ()  => set((s) => ({ showShadows: !s.showShadows })),
    setCameraPreset:   (v) => set({ cameraPreset: v }),
    setBoardDimensions:(w, l) => set({ boardWidth: w, boardLength: l }),
    setCutKerf:        (v) => set({ cutKerf: v }),
    setUnits:          (v) => set({ units: v }),
    setExplodeAmount:  (v) => set({ explodeAmount: v }),
    toggleDoorsOpen:   ()  => set((s) => ({ doorsOpen: !s.doorsOpen })),
    toggleTexture:     ()  => set((s) => ({ showTexture: !s.showTexture })),

    setAssemblyStep: (v) => set({ assemblyStep: v }),
    exitAssembly:    ()  => set({ assemblyStep: -1 }),

    setFurnitureType: (type) => {
      const ft = FURNITURE_TYPES.find((f) => f.id === type)
      if (!ft) return
      get().pushHistory()
      const patch = { furnitureType: type, dimensions: { ...ft.defaultDims }, shelfCount: ft.shelves, explodeAmount: 0, doorsOpen: false, assemblyStep: -1 }
      if (type === 'custom' && get().customParts.length === 0) {
        patch.customParts = starterParts()
        patch.selectedPartId = patch.customParts[0].id
      }
      set(patch)
    },

    applyPreset: (preset) => {
      get().pushHistory()
      set({ dimensions: { ...preset.dims }, shelfCount: preset.shelves, furnitureType: preset.type ?? 'shelf', explodeAmount: 0, assemblyStep: -1 })
    },

    // ── Custom freeform builder actions ───────────────────
    addCustomPart: (preset) => {
      const id = newPartId()
      const n  = get().customParts.length + 1
      const part = { id, name: `Board ${n}`, x: 0, y: 50, z: 0, w: 60, h: 2, d: 30, ...preset }
      get().pushHistory()
      set((s) => ({ customParts: [...s.customParts, part], selectedPartId: id }))
    },
    updateCustomPart: (id, patch) =>
      set((s) => ({ customParts: s.customParts.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
    removeCustomPart: (id) => {
      get().pushHistory()
      set((s) => ({
        customParts: s.customParts.filter((p) => p.id !== id),
        selectedPartId: s.selectedPartId === id ? null : s.selectedPartId,
      }))
    },
    duplicateCustomPart: (id) => {
      const src = get().customParts.find((p) => p.id === id)
      if (!src) return
      const nid = newPartId()
      get().pushHistory()
      set((s) => ({
        customParts: [...s.customParts, { ...src, id: nid, name: `${src.name} copy`, x: src.x + 6, z: src.z + 6 }],
        selectedPartId: nid,
      }))
    },
    selectPart: (id) => set({ selectedPartId: id }),
    setTransformMode: (m) => set({ transformMode: m }),
    clearCustomParts: () => { get().pushHistory(); set({ customParts: [], selectedPartId: null }) },

    // ── My Designs (saved custom configurations) ──────────
    saveMyDesign: (name) => {
      const s = get()
      const design = {
        id: `d${Date.now().toString(36)}`,
        name: (name && name.trim()) || `Design ${s.myDesigns.length + 1}`,
        date: new Date().toISOString().slice(0, 10),
        type: s.furnitureType,
        data: {
          furnitureType: s.furnitureType,
          dimensions: { ...s.dimensions },
          shelfCount: s.shelfCount,
          woodSpecies: s.woodSpecies,
          woodThickness: s.woodThickness,
          surfaceFinish: s.surfaceFinish,
          paintColor: s.paintColor,
          customParts: s.customParts.map((p) => ({ ...p })),
        },
      }
      const next = [...s.myDesigns, design]
      localStorage.setItem('makerstudio-mydesigns', JSON.stringify(next))
      set({ myDesigns: next })
    },
    loadMyDesign: (id) => {
      const d = get().myDesigns.find((x) => x.id === id)
      if (!d) return
      get().pushHistory()
      set({ ...d.data, explodeAmount: 0, assemblyStep: -1, selectedPartId: null })
    },
    deleteMyDesign: (id) => {
      const next = get().myDesigns.filter((x) => x.id !== id)
      localStorage.setItem('makerstudio-mydesigns', JSON.stringify(next))
      set({ myDesigns: next })
    },

    setHoveredPart: (label) => set({ hoveredPart: label }),

    setLeftPanelWidth: (w) => { localStorage.setItem('ms-left-w', String(w)); set({ leftPanelWidth: w }) },
    setRightPanelWidth:(w) => { localStorage.setItem('ms-right-w', String(w)); set({ rightPanelWidth: w }) },

    dismissWelcome: () => { localStorage.setItem('makerstudio-welcomed', '1'); set({ welcomeDismissed: true }) },
    showWelcomeScreen: () => set({ welcomeDismissed: false }),

    takeScreenshot:   () => set({ _screenshotPending: true }),
    _clearScreenshot: () => set({ _screenshotPending: false }),

    triggerExport:  (fmt) => set({ _exportPending: fmt }),
    _clearExport:   ()    => set({ _exportPending: null }),

    pushHistory: () => {
      const snap = snapshot(get())
      set((s) => ({ _past: [...s._past.slice(-49), snap], _future: [] }))
    },

    undo: () => {
      const { _past, _future } = get()
      if (!_past.length) return
      const prev = _past.at(-1)
      const current = snapshot(get())
      set({ ...prev, _past: _past.slice(0, -1), _future: [..._future, current] })
    },

    redo: () => {
      const { _past, _future } = get()
      if (!_future.length) return
      const next = _future.at(-1)
      const current = snapshot(get())
      set({ ...next, _past: [..._past, current], _future: _future.slice(0, -1) })
    },

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
      set({ ...data, explodeAmount: 0, assemblyStep: -1 })
    },

    loadAutosave: () => {
      const json = localStorage.getItem('makerstudio-autosave')
      if (!json) return false
      try {
        const data = parseProjectJSON(json)
        set({ ...data, explodeAmount: 0, assemblyStep: -1 })
        return true
      } catch { return false }
    },

    // ── Computed helpers ──────────────────────────────────
    computeFilamentEstimate: () => {
      const { plasticParts, dimensions, infillPercent } = get()
      if (!plasticParts) return 0
      const vol = (dimensions.width * dimensions.depth * 0.5) * (infillPercent / 100)
      return Math.round(vol * 1.24)
    },

    computeCutList: () => {
      const { dimensions, woodThickness, shelfCount, furnitureType, customParts } = get()
      const { width: W, height: H, depth: D } = dimensions
      const t = woodThickness

      if (furnitureType === 'custom') {
        return customParts.map((p) => {
          const [thick, w, h] = [p.w, p.h, p.d].sort((a, b) => a - b)
          return { label: p.name, qty: 1, w, h, thick }
        })
      }

      if (furnitureType === 'desk') {
        const pedW = Math.min(50, W * 0.22)
        return [
          { label: 'Desktop top',    qty: 1, w: W,             h: D,         thick: t * 1.5 },
          { label: 'Pedestal side',  qty: 4, w: D,             h: H - t,     thick: t       },
          { label: 'Pedestal shelf', qty: 4, w: pedW - 2 * t,  h: D,         thick: t       },
          { label: 'Modesty panel',  qty: 1, w: W - 2 * pedW,  h: H * 0.6,  thick: 0.6     },
        ]
      }
      if (furnitureType === 'cabinet') {
        return [
          { label: 'Side panels',  qty: 2,          w: D,             h: H,          thick: t       },
          { label: 'Top panel',    qty: 1,          w: W - 2 * t,     h: D,          thick: t       },
          { label: 'Bottom panel', qty: 1,          w: W - 2 * t,     h: D,          thick: t       },
          { label: 'Shelves',      qty: shelfCount, w: W - 2 * t,     h: D,          thick: t       },
          { label: 'Back panel',   qty: 1,          w: W,             h: H,          thick: 0.6     },
          { label: 'Door panels',  qty: 2,          w: (W - 2*t) / 2, h: H - 2 * t, thick: t * 0.8 },
        ]
      }
      if (furnitureType === 'table') {
        const apronH = t * 4
        return [
          { label: 'Tabletop',   qty: 1, w: W,          h: D,         thick: t * 2   },
          { label: 'Table Legs', qty: 4, w: t * 1.5,    h: H - t * 2, thick: t * 1.5 },
          { label: 'Apron',      qty: 4, w: (W + D) / 2, h: apronH,   thick: t * 0.8 },
        ]
      }
      if (furnitureType === 'tvstand') {
        const bayW = Math.max(10, (W - 4 * t) / 3)
        return [
          { label: 'Top panel',    qty: 1,              w: W,    h: D,    thick: t       },
          { label: 'Bottom panel', qty: 1,              w: W,    h: D,    thick: t       },
          { label: 'Side panels',  qty: 2,              w: D,    h: H,    thick: t       },
          { label: 'Dividers',     qty: 2,              w: D,    h: H - 2*t, thick: t   },
          { label: 'Shelves',      qty: shelfCount * 2, w: bayW, h: D - 2, thick: t     },
          { label: 'Back panel',   qty: 1,              w: W,    h: H,    thick: 0.6     },
        ]
      }
      if (furnitureType === 'bed') {
        return [
          { label: 'Headboard',  qty: 1, w: W + t * 2, h: H * 1.6,  thick: t       },
          { label: 'Footboard',  qty: 1, w: W + t * 2, h: H * 0.7,  thick: t       },
          { label: 'Side Rails', qty: 2, w: D - t * 2, h: H * 0.5,  thick: t       },
          { label: 'Slats',      qty: 7, w: W - t * 2, h: t * 0.8,  thick: t * 3   },
          { label: 'Bed Legs',   qty: 4, w: t * 1.2,   h: H,        thick: t * 1.2 },
        ]
      }
      if (furnitureType === 'wallshelf') {
        return [
          { label: 'Shelf Board',   qty: 1, w: W,       h: D,          thick: t * 1.2 },
          { label: 'Brackets',      qty: 2, w: t * 0.8, h: H - t * 1.2, thick: D - t },
          { label: 'Mounting Rail', qty: 1, w: W,       h: t * 0.8,    thick: t * 0.8 },
        ]
      }
      // shelf (default)
      return [
        { label: 'Side panels',  qty: 2,          w: D,         h: H,    thick: t   },
        { label: 'Top panel',    qty: 1,          w: W - 2 * t, h: D,    thick: t   },
        { label: 'Bottom panel', qty: 1,          w: W - 2 * t, h: D,    thick: t   },
        { label: 'Shelves',      qty: shelfCount, w: W - 2 * t, h: D,    thick: t   },
        { label: 'Back panel',   qty: 1,          w: W,         h: H,    thick: 0.6 },
      ]
    },

    computeWeight: () => {
      const DENSITY = { oak: 720, pine: 530, walnut: 640, maple: 705, mahogany: 545, birch: 670, cherry: 580 }
      const { dimensions, woodThickness, shelfCount, woodSpecies } = get()
      const { width: W, height: H, depth: D } = dimensions
      const T = woodThickness / 100
      const [Wm, Hm, Dm] = [W / 100, H / 100, D / 100]
      const vol = 2*(T*Hm*Dm) + 2*((Wm-2*T)*T*Dm) + shelfCount*((Wm-2*T)*T*Dm) + Wm*Hm*0.006
      return (vol * (DENSITY[woodSpecies] ?? 680)).toFixed(1)
    },
  }))
)
