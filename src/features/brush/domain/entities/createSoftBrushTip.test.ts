import { describe, test, expect } from 'vitest'
import { createSoftBrushTip } from './createSoftBrushTip'

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
