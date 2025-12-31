import { describe, test, expect } from 'vitest'
import { createSolidBrushTip } from './createSolidBrushTip'

describe('createSolidBrushTip', () => {
  test('指定サイズでソリッドブラシチップを作成する', () => {
    const tip = createSolidBrushTip(10)

    expect(tip).toEqual({
      type: 'solid',
      size: 10,
      hardness: 0,
      opacity: 1,
    })
  })

  test('デフォルト値はhardness=0、opacity=1', () => {
    const tip = createSolidBrushTip(5)

    expect(tip.hardness).toBe(0)
    expect(tip.opacity).toBe(1)
  })

  test('opacityとhardnessをカスタマイズできる', () => {
    const tip = createSolidBrushTip(5, 0.5, 0.8)

    expect(tip.opacity).toBe(0.5)
    expect(tip.hardness).toBe(0.8)
  })
})
