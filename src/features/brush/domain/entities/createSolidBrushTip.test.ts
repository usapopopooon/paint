import { describe, test, expect } from 'vitest'
import { createSolidBrushTip } from './createSolidBrushTip'

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
