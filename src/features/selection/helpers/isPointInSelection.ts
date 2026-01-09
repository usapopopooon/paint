import type { Point, Bounds } from '@/lib/geometry'
import type { SelectionShape } from '../types'

/**
 * 点が矩形内にあるか判定
 */
const isPointInBounds = (point: Point, bounds: Bounds): boolean => {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

/**
 * 点が多角形内にあるか判定（Ray casting algorithm）
 */
const isPointInPolygon = (point: Point, polygon: readonly Point[]): boolean => {
  if (polygon.length < 3) return false

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * 点が選択領域内にあるか判定
 */
export const isPointInSelection = (point: Point, shape: SelectionShape): boolean => {
  switch (shape.type) {
    case 'rectangle':
      return isPointInBounds(point, shape.bounds)
    case 'lasso':
      return isPointInPolygon(point, shape.points)
  }
}
