import { describe, test, expect } from 'vitest'
import { valueToSlider } from './valueToSlider'

describe('valueToSlider', () => {
  test('最小値に対して0を返す', () => {
    expect(valueToSlider(1, 1, 100)).toBe(0)
  })

  test('最大値に対して100を返す', () => {
    expect(valueToSlider(100, 1, 100)).toBe(100)
  })

  test('最小値と最大値の幾何平均に対して約50を返す', () => {
    // 1と100の幾何平均は10
    const result = valueToSlider(10, 1, 100)
    expect(result).toBeCloseTo(50, 1)
  })

  test('カスタム範囲を処理する', () => {
    expect(valueToSlider(5, 5, 300)).toBe(0)
    expect(valueToSlider(300, 5, 300)).toBe(100)
  })

  test('中間値を対数的に処理する', () => {
    const result = valueToSlider(50, 1, 300)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(100)
  })
})
