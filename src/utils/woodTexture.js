import { CanvasTexture, RepeatWrapping } from 'three'

// All values tuned for each species
const CONFIG = {
  oak:      { base: '#c9aa70', dark: '100,55,10', spacing: 2.8, waver: 14, pores: true,  rings: true  },
  pine:     { base: '#e5c882', dark: '160,90,20', spacing: 3.5, waver: 8,  pores: false, rings: true  },
  walnut:   { base: '#6e4428', dark: '30,10,2',   spacing: 2.2, waver: 18, pores: true,  rings: false },
  maple:    { base: '#f2deb0', dark: '160,100,40',spacing: 2.0, waver: 6,  pores: false, rings: false },
  mahogany: { base: '#8c301e', dark: '50,10,5',   spacing: 2.5, waver: 20, pores: true,  rings: false },
  birch:    { base: '#e0c87a', dark: '130,80,20', spacing: 2.4, waver: 5,  pores: false, rings: true  },
  cherry:   { base: '#a05530', dark: '60,20,5',   spacing: 2.2, waver: 16, pores: false, rings: false },
}

const cache = new Map()

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function getWoodTexture(species) {
  if (cache.has(species)) return cache.get(species)

  const cfg = CONFIG[species] ?? CONFIG.oak
  const W = 768, H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const rng = seeded(species.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31)

  // Base fill
  ctx.fillStyle = cfg.base
  ctx.fillRect(0, 0, W, H)

  // Annual rings (subtle arcing bands, heavier for ring-porous woods)
  if (cfg.rings) {
    for (let i = 0; i < 6; i++) {
      const cx = rng() * W * 0.4 - W * 0.2
      const cy = H * (0.8 + rng() * 0.6)
      const r0 = H * (0.4 + i * 0.15)
      for (let j = 0; j < 4; j++) {
        ctx.beginPath()
        ctx.ellipse(cx, cy, r0 + j * 12, (r0 + j * 12) * 0.35, 0, Math.PI, 2 * Math.PI)
        ctx.strokeStyle = `rgba(${cfg.dark},${0.06 + rng() * 0.08})`
        ctx.lineWidth = 0.6 + rng() * 1.2
        ctx.stroke()
      }
    }
  }

  // Grain lines — slightly wavy, running along the long axis
  let y = -(rng() * 20)
  while (y < H + 20) {
    const spacing = cfg.spacing + rng() * 3.5
    y += spacing
    ctx.beginPath()
    const alpha = 0.06 + rng() * 0.20
    ctx.strokeStyle = `rgba(${cfg.dark},${alpha})`
    ctx.lineWidth = 0.3 + rng() * 1.4

    let x = 0
    let oy = y + (rng() - 0.5) * 8
    ctx.moveTo(0, oy)
    while (x < W) {
      const nx = x + 18 + rng() * 14
      const ny = oy + (rng() - 0.5) * cfg.waver * 0.25
      const cpx = x + (nx - x) * 0.5
      const cpy = (oy + ny) / 2 + (rng() - 0.5) * cfg.waver * 0.5
      ctx.quadraticCurveTo(cpx, cpy, nx, ny)
      x = nx
      oy = ny
    }
    ctx.stroke()
  }

  // Open-grain pore channels (oak, walnut, mahogany)
  if (cfg.pores) {
    const rng2 = seeded(species.charCodeAt(0) * 999)
    for (let i = 0; i < 320; i++) {
      const px = rng2() * W
      const py = rng2() * H
      const len = 2 + rng2() * 8
      ctx.fillStyle = `rgba(${cfg.dark},${0.18 + rng2() * 0.22})`
      ctx.fillRect(px, py, 0.8 + rng2() * 1.2, len)
    }
  }

  // Light sheen highlight along centre
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0,   'rgba(255,255,255,0)')
  grad.addColorStop(0.4, 'rgba(255,255,255,0.04)')
  grad.addColorStop(0.6, 'rgba(255,255,255,0.07)')
  grad.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const tex = new CanvasTexture(canvas)
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.repeat.set(3, 2)
  tex.needsUpdate = true

  cache.set(species, tex)
  return tex
}

export function clearTextureCache() {
  cache.forEach((t) => t.dispose())
  cache.clear()
}
