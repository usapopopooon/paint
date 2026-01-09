import type { Point, Bounds } from '@/lib/geometry'

/**
 * ポイント配列からバウンディングボックスを計算
 */
export const calculateBoundsFromPoints = (points: readonly Point[]): Bounds => {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
