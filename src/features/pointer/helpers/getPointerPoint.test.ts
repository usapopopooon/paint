import { describe, test, expect } from 'vitest'
import { getPointerPoint } from './getPointerPoint'

describe('getPointerPoint', () => {
  const createRect = (left: number, top: number): DOMRect =>
    ({
      left,
      top,
      width: 800,
      height: 600,
    }) as DOMRect

  test('クライアント座標をローカル座標に変換する', () => {
    const rect = createRect(100, 50)

    const result = getPointerPoint(150, 100, rect, 0.5, 'pen')

    expect(result.x).toBe(50) // 150 - 100
    expect(result.y).toBe(50) // 100 - 50
    expect(result.pressure).toBe(0.5)
    expect(result.pointerType).toBe('pen')
  })

  test('zoomが1の場合は座標がそのまま変換される', () => {
    const rect = createRect(100, 100)

    const result = getPointerPoint(200, 200, rect, 0.5, 'mouse', 1)

    expect(result.x).toBe(100) // 200 - 100
    expect(result.y).toBe(100) // 200 - 100
  })

  test('zoomが0.5の場合は座標が2倍になる', () => {
    const rect = createRect(100, 100)

    const result = getPointerPoint(200, 200, rect, 0.5, 'mouse', 0.5)

    expect(result.x).toBe(200) // (200 - 100) / 0.5 = 200
    expect(result.y).toBe(200) // (200 - 100) / 0.5 = 200
  })

  test('zoomが2の場合は座標が半分になる', () => {
    const rect = createRect(0, 0)

    const result = getPointerPoint(100, 100, rect, 0.5, 'pen', 2)

    expect(result.x).toBe(50) // 100 / 2 = 50
    expect(result.y).toBe(50) // 100 / 2 = 50
  })

  test('zoomを省略した場合はデフォルト1で計算される', () => {
    const rect = createRect(0, 0)

    const result = getPointerPoint(100, 100, rect, 0.5, 'pen')

    expect(result.x).toBe(100)
    expect(result.y).toBe(100)
  })

  test('ポインタータイプがmouseの場合', () => {
    const rect = createRect(0, 0)

    const result = getPointerPoint(100, 200, rect, 0, 'mouse')

    expect(result.pointerType).toBe('mouse')
  })

  test('ポインタータイプがtouchの場合', () => {
    const rect = createRect(0, 0)

    const result = getPointerPoint(50, 75, rect, 1, 'touch')

    expect(result.pointerType).toBe('touch')
  })

  test('要素外の座標（負の値）も計算できる', () => {
    const rect = createRect(100, 100)

    const result = getPointerPoint(50, 50, rect, 0.5, 'pen')

    expect(result.x).toBe(-50) // 50 - 100
    expect(result.y).toBe(-50) // 50 - 100
  })

  test('要素外の座標にzoomを適用する', () => {
    const rect = createRect(100, 100)

    const result = getPointerPoint(50, 50, rect, 0.5, 'pen', 0.5)

    expect(result.x).toBe(-100) // (50 - 100) / 0.5 = -100
    expect(result.y).toBe(-100) // (50 - 100) / 0.5 = -100
  })
})
