/**
 * First-Fit Decreasing Height (FFDH) strip-based bin packer.
 * Produces a list of boards, each with placed rectangles {x, y, w, h, label, color}.
 */

const PART_COLORS = [
  '#b45309', '#0369a1', '#15803d', '#7c3aed',
  '#be185d', '#0891b2', '#b45309', '#4d7c0f',
]

export function packCutList(cutList, boardW, boardL, kerf = 0.3) {
  const pieces = []
  let colorIdx = 0
  const labelColors = {}

  cutList.forEach((p) => {
    if (!labelColors[p.label]) {
      labelColors[p.label] = PART_COLORS[colorIdx % PART_COLORS.length]
      colorIdx++
    }
    for (let i = 0; i < p.qty; i++) {
      pieces.push({
        w: p.w,
        h: p.h,
        label: p.label,
        color: labelColors[p.label],
        index: i,
      })
    }
  })

  // Sort by height desc, width desc for better packing
  pieces.sort((a, b) => b.h - a.h || b.w - a.w)

  const boards = []

  for (const piece of pieces) {
    // Piece too wide for board — skip (edge case)
    if (piece.w > boardW) continue

    let placed = false

    for (const board of boards) {
      // Try existing strips
      for (const strip of board.strips) {
        if (strip.nextX + piece.w <= boardW && piece.h <= strip.h) {
          board.placed.push({ ...piece, x: strip.nextX, y: strip.y })
          strip.nextX += piece.w + kerf
          placed = true
          break
        }
      }
      if (placed) break

      // Try a new strip on this board
      const usedY = board.strips.length
        ? board.strips.at(-1).y + board.strips.at(-1).h + kerf
        : 0

      if (usedY + piece.h <= boardL) {
        const strip = { y: usedY, h: piece.h, nextX: piece.w + kerf }
        board.strips.push(strip)
        board.placed.push({ ...piece, x: 0, y: usedY })
        placed = true
        break
      }
    }

    if (!placed) {
      const strip = { y: 0, h: piece.h, nextX: piece.w + kerf }
      boards.push({ strips: [strip], placed: [{ ...piece, x: 0, y: 0 }] })
    }
  }

  return boards
}

export function computeYield(boards, boardW, boardL) {
  if (!boards.length) return 0
  const totalBoardArea = boards.length * boardW * boardL
  const usedArea = boards.reduce((sum, b) =>
    sum + b.placed.reduce((s, p) => s + p.w * p.h, 0), 0)
  return (usedArea / totalBoardArea) * 100
}
