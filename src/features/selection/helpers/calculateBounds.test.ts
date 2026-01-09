import { describe, test, expect } from 'vitest'
import { calculateBoundsFromPoints } from './calculateBounds'

describe('calculateBoundsFromPoints', () => {
  test('空の配列の場合はゼロのバウンズを返す', () => {
    const bounds = calculateBoundsFromPoints([])

    expect(bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 })
  })

  test('単一のポイントの場合は幅高さゼロのバウンズを返す', () => {
    const bounds = calculateBoundsFromPoints([{ x: 10, y: 20 }])

    expect(bounds).toEqual({ x: 10, y: 20, width: 0, height: 0 })
  })

  test('2つのポイントからバウンディングボックスを計算', () => {
    const bounds = calculateBoundsFromPoints([
      { x: 10, y: 20 },
      { x: 100, y: 120 },
    ])

    expect(bounds).toEqual({
      x: 10,
      y: 20,
      width: 90,
      height: 100,
    })
  })

  test('複数のポイントからバウンディングボックスを計算', () => {
    const bounds = calculateBoundsFromPoints([
      { x: 50, y: 30 },
      { x: 10, y: 80 },
      { x: 100, y: 20 },
      { x: 70, y: 120 },
    ])

    expect(bounds).toEqual({
      x: 10,
      y: 20,
      width: 90,
      height: 100,
    })
  })

  test('負の座標を含むポイントを正しく処理', () => {
    const bounds = calculateBoundsFromPoints([
      { x: -50, y: -30 },
      { x: 50, y: 30 },
    ])

    expect(bounds).toEqual({
      x: -50,
      y: -30,
      width: 100,
      height: 60,
    })
  })

  test('小数点を含むポイントを処理', () => {
    const bounds = calculateBoundsFromPoints([
      { x: 10.5, y: 20.3 },
      { x: 100.7, y: 120.9 },
    ])

    expect(bounds.x).toBeCloseTo(10.5)
    expect(bounds.y).toBeCloseTo(20.3)
    expect(bounds.width).toBeCloseTo(90.2)
    expect(bounds.height).toBeCloseTo(100.6)
  })

  test('同じ座標のポイントが複数ある場合', () => {
    const bounds = calculateBoundsFromPoints([
      { x: 10, y: 20 },
      { x: 10, y: 20 },
      { x: 10, y: 20 },
    ])

    expect(bounds).toEqual({
      x: 10,
      y: 20,
      width: 0,
      height: 0,
    })
  })
})
