import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    // Core dimensions (cm)
    dimensions: { width: 80, height: 180, depth: 40 },

    // Material
    woodSpecies: 'oak',
    woodThickness: 1.8, // cm (18mm board)
    shelfCount: 4,
    plasticParts: false,

    // 3D print
    filamentUsed: 0,       // grams
    filamentType: 'PLA',
    infillPercent: 20,
    layerHeight: 0.2,      // mm

    // App state
    activeTab: 'design',
    renderMode: 'solid',   // 'solid' | 'wireframe' | 'xray'
    showGrid: true,
    showDimensions: true,
    showShadows: true,
    cameraPreset: 'perspective', // 'perspective' | 'front' | 'side' | 'top'

    // Cut planner
    boardWidth: 122,  // cm (standard 4ft sheet)
    boardLength: 244, // cm (standard 8ft sheet)
    cutKerf: 0.3,     // cm

    // Actions
    setDimension: (key, value) =>
      set((s) => ({ dimensions: { ...s.dimensions, [key]: value } })),

    setDimensions: (dims) =>
      set((s) => ({ dimensions: { ...s.dimensions, ...dims } })),

    setWoodSpecies: (species) => set({ woodSpecies: species }),
    setWoodThickness: (t) => set({ woodThickness: t }),
    setShelfCount: (n) => set({ shelfCount: n }),
    setPlasticParts: (v) => set({ plasticParts: v }),
    setFilamentType: (t) => set({ filamentType: t }),
    setInfillPercent: (v) => set({ infillPercent: v }),
    setLayerHeight: (v) => set({ layerHeight: v }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setRenderMode: (mode) => set({ renderMode: mode }),
    toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
    toggleDimensions: () => set((s) => ({ showDimensions: !s.showDimensions })),
    toggleShadows: () => set((s) => ({ showShadows: !s.showShadows })),
    setCameraPreset: (p) => set({ cameraPreset: p }),
    setBoardDimensions: (w, l) => set({ boardWidth: w, boardLength: l }),
    setCutKerf: (k) => set({ cutKerf: k }),

    // Computed helpers (called as functions, not reactive)
    computeFilamentEstimate: () => {
      const { plasticParts, dimensions, infillPercent } = get()
      if (!plasticParts) return 0
      const vol = (dimensions.width * dimensions.depth * 0.5) * (infillPercent / 100)
      return Math.round(vol * 1.24) // PLA density ~1.24 g/cm³
    },

    computeCutList: () => {
      const { dimensions, woodThickness, shelfCount } = get()
      const { width, height, depth } = dimensions
      const t = woodThickness
      return [
        { label: 'Side panels',   qty: 2, w: depth,           h: height,                   thick: t },
        { label: 'Top / Bottom',  qty: 2, w: width - 2 * t,   h: depth,                    thick: t },
        { label: 'Shelves',       qty: shelfCount, w: width - 2 * t, h: depth,              thick: t },
        { label: 'Back panel',    qty: 1, w: width,            h: height,                   thick: 0.6 },
      ]
    },
  }))
)
