import { describe, test, expect } from 'vitest'
import { valueToSlider, sliderToValue } from './slider'

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

describe('sliderToValue', () => {
  test('0に対して最小値を返す', () => {
    expect(sliderToValue(0, 1, 100)).toBe(1)
  })

  test('100に対して最大値を返す', () => {
    expect(sliderToValue(100, 1, 100)).toBe(100)
  })

  test('50に対して幾何平均を返す', () => {
    // 1と100の幾何平均は10
    expect(sliderToValue(50, 1, 100)).toBe(10)
  })

  test('カスタム範囲を処理する', () => {
    expect(sliderToValue(0, 5, 300)).toBe(5)
    expect(sliderToValue(100, 5, 300)).toBe(300)
  })

  test('整数に丸める', () => {
    const result = sliderToValue(25, 1, 100)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('valueToSliderとsliderToValueは逆関数', () => {
  test('様々な値でラウンドトリップが正しく動作する', () => {
    const testCases = [
      { value: 1, min: 1, max: 100 },
      { value: 50, min: 1, max: 100 },
      { value: 100, min: 1, max: 100 },
      { value: 20, min: 5, max: 300 },
      { value: 150, min: 5, max: 300 },
    ]

    for (const { value, min, max } of testCases) {
      const slider = valueToSlider(value, min, max)
      const roundtrip = sliderToValue(slider, min, max)
      expect(roundtrip).toBe(value)
    }
  })
})
