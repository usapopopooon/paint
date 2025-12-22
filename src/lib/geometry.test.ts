import { describe, test, expect } from 'vitest'
import type { Point, Bounds } from './geometry'

describe('Point型', () => {
  test('2D座標を表現する', () => {
    const point: Point = { x: 10, y: 20 }

    expect(point.x).toBe(10)
    expect(point.y).toBe(20)
  })
})

describe('Bounds型', () => {
  test('矩形の境界を表現する', () => {
    const bounds: Bounds = { x: 0, y: 0, width: 100, height: 50 }

    expect(bounds.x).toBe(0)
    expect(bounds.y).toBe(0)
    expect(bounds.width).toBe(100)
    expect(bounds.height).toBe(50)
  })
})
