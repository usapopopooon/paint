import { describe, test, expect } from 'vitest'
import { sliderToValue } from './sliderToValue'

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
