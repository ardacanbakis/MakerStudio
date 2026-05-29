// Shared wood material data and finish-modifier logic used by all scene components.

export const WOOD_COLORS = {
  oak: '#c9aa70', pine: '#e5c882', walnut: '#6e4428',
  maple: '#f2deb0', mahogany: '#8c301e', birch: '#e0c87a', cherry: '#a05530',
}

export const WOOD_ROUGHNESS = {
  oak: 0.62, pine: 0.80, walnut: 0.52, maple: 0.55,
  mahogany: 0.48, birch: 0.68, cherry: 0.50,
}

// Multiplier on base roughness, absolute metalness, and whether texture is used
const FINISH_CFG = {
  raw:     { rough: 1.30, metal: 0.00, tex: true  },
  oil:     { rough: 1.00, metal: 0.02, tex: true  },
  lacquer: { rough: 0.18, metal: 0.10, tex: false },
  stain:   { rough: 0.55, metal: 0.03, tex: true  },
  wax:     { rough: 0.62, metal: 0.04, tex: true  },
  paint:   { rough: 0.30, metal: 0.06, tex: false },
}

export function resolveMatProps({ woodSpecies, surfaceFinish = 'oil', paintColor = '#cd853f', showTexture = true, renderMode }, getTexture) {
  const baseColor     = WOOD_COLORS[woodSpecies]    ?? WOOD_COLORS.oak
  const baseRoughness = WOOD_ROUGHNESS[woodSpecies] ?? 0.65
  const cfg           = FINISH_CFG[surfaceFinish]   ?? FINISH_CFG.oil
  return {
    color:     surfaceFinish === 'paint' ? paintColor : baseColor,
    roughness: Math.min(1, baseRoughness * cfg.rough),
    metalness: cfg.metal,
    map:       (showTexture && cfg.tex) ? getTexture(woodSpecies) : null,
    renderMode,
  }
}
