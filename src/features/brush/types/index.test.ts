import { describe, test, expect } from 'vitest'
import { createSolidBrushTip, createSoftBrushTip } from './index'

describe('createSolidBrushTip', () => {
  test('指定サイズでソリッドブラシチップを作成する', () => {
    const tip = createSolidBrushTip(10)

    expect(tip).toEqual({
      type: 'solid',
      size: 10,
      hardness: 1,
      opacity: 1,
    })
  })

  test('hardnessとopacityは常に1に設定される', () => {
    const tip = createSolidBrushTip(5)

    expect(tip.hardness).toBe(1)
    expect(tip.opacity).toBe(1)
  })
})

describe('createSoftBrushTip', () => {
  test('デフォルトのhardnessとopacityでソフトブラシチップを作成する', () => {
    const tip = createSoftBrushTip(15)

    expect(tip).toEqual({
      type: 'soft',
      size: 15,
      hardness: 0.5,
      opacity: 1,
    })
  })

  test('カスタムhardnessでソフトブラシチップを作成する', () => {
    const tip = createSoftBrushTip(20, 0.3)

    expect(tip.type).toBe('soft')
    expect(tip.size).toBe(20)
    expect(tip.hardness).toBe(0.3)
    expect(tip.opacity).toBe(1)
  })

  test('カスタムhardnessとopacityでソフトブラシチップを作成する', () => {
    const tip = createSoftBrushTip(25, 0.7, 0.8)

    expect(tip).toEqual({
      type: 'soft',
      size: 25,
      hardness: 0.7,
      opacity: 0.8,
    })
  })
})
